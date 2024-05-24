import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from '../../../config';
import { NodeFetcherService } from '../../rpc/services/nodeFetcher.service';
import { DatabaseService } from 'src/database/database.service';
import { SignerService, TxStatus } from 'src/signer/services/signer.service';
import { FunctionFragment, Interface } from 'ethers';
import * as Erc20ABI from '../../../abi/ERC20.json';
import * as UserManagerABI from '../../../abi/UserManager.json';

@Injectable()
export class SubscriptionService implements OnApplicationBootstrap {
  private monirotringPromise: Promise<void>;

  private erc20Interface: Interface;
  private balanceOfFragment: FunctionFragment;
  private allowanceFragment: FunctionFragment;

  private userManagerInterface: Interface;
  private renewSubscriptionFragment: FunctionFragment;

  private activeSubscriptionTxNumber: {
    [userAndActiveSubscriptionId: string]: number;
  } = {};

  constructor(
    private nodeFetcherService: NodeFetcherService,
    private databaseService: DatabaseService,
    private signerService: SignerService,
  ) {
    this.erc20Interface = new Interface(Erc20ABI);
    this.balanceOfFragment = this.erc20Interface.getFunction("balanceOf");
    this.allowanceFragment = this.erc20Interface.getFunction("allowance");

    this.userManagerInterface = new Interface(UserManagerABI);
    this.renewSubscriptionFragment = this.userManagerInterface.getFunction("renewSubscription");
  }

  async onApplicationBootstrap(): Promise<void> {
    this.monirotringPromise = this.startMonitoring();
  }

  async startMonitoring(): Promise<void> {
    while (true) {
      const timeNow = Date.now();

      const activeSubscriptions =
        await this.databaseService.activeSubscription.findMany({
          where: {
            subscriptionEndTime: {
              lt: timeNow,
            },
          },
        });

      for (const activeSubscription of activeSubscriptions) {
        const balanceOfData = 
          await this.erc20Interface.encodeFunctionData(this.balanceOfFragment, [activeSubscription.user]);

        const allowanceData = 
          await this.erc20Interface.encodeFunctionData(this.allowanceFragment, [activeSubscription.user, config.contracts.userManager]);

        const balanceOfUserRequest = this.nodeFetcherService.call({
          to: activeSubscription.token,
          data: balanceOfData
        });
        const allowanceOfUserRequest = this.nodeFetcherService.call({
          to: activeSubscription.token,
          data: allowanceData
        });

        const subscriptionInfo = await this.databaseService.subscription.findUnique({
          where: {
            appIdAndSubscriptionId: {
              appId: activeSubscription.appId,
              subscriptionId: activeSubscription.subscriptionId
            }
          }
        });

        if (subscriptionInfo.isPaused) {
          continue;
        }

        let tokenIndex = -1;
        for(let i = 0; i < subscriptionInfo.tokens.length; ++i) {
          if (activeSubscription.token == subscriptionInfo.tokens[i]) {
            tokenIndex = i;
            break;
          }
        }
        if (tokenIndex == -1) {
          continue;
        }
        const amount = BigInt(subscriptionInfo.amounts[tokenIndex]);

        const balanceOfUserEncoded = await balanceOfUserRequest;
        const allowanceOfUserEncoded = await allowanceOfUserRequest;

        const balanceOfUser: bigint = this.erc20Interface.parseCallResult(balanceOfUserEncoded)[0];
        const allowanceOfUser: bigint = this.erc20Interface.parseCallResult(allowanceOfUserEncoded)[0];

        if (balanceOfUser < amount) {
          continue;
        }

        if (allowanceOfUser < amount) {
          continue;
        }

        const userAndActiveSubscriptionId = activeSubscription.user + activeSubscription.activeSubscriptionId;
        const txNumber = this.activeSubscriptionTxNumber[userAndActiveSubscriptionId];

        if (txNumber == undefined) {
          await this.sendTx(activeSubscription.user, activeSubscription.activeSubscriptionId);
        } else {
          const txStatus = this.signerService.txStatus[txNumber];

          if (txStatus == TxStatus.Pending) {
            continue;
          } else if (txStatus == TxStatus.Fail) {
            await this.sendTx(activeSubscription.user, activeSubscription.activeSubscriptionId);

            this.signerService.deleteTxFromQueue(txNumber);
          } else if (txStatus == TxStatus.Success) {
            this.signerService.deleteTxFromQueue(txNumber);
          }
        }
      }
    }
  }

  async sendTx(user: string, activeSubscriptionId: string): Promise<void> {
    const userAndActiveSubscriptionId = user + activeSubscriptionId;
    const renewSubscriptionData = await this.userManagerInterface.encodeFunctionData(this.renewSubscriptionFragment, [user, activeSubscriptionId]);
    const txNumber = this.signerService.addTxToQueue({
      to: config.contracts.userManager.address,
      data: renewSubscriptionData
    });

    this.activeSubscriptionTxNumber[userAndActiveSubscriptionId] = txNumber;
  }
}
