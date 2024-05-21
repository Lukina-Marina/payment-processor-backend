import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from '../../../config';
import { NodeFetcherService } from '../../rpc/services/nodeFetcher.service';
import { DatabaseService } from 'src/database/database.service';
import { SignerService } from 'src/signer/services/signer.service';
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

  constructor(
    private nodeFetcherService: NodeFetcherService,
    private databaseService: DatabaseService,
    private signerService: SignerService,
  ) {
    this.erc20Interface = new Interface(Erc20ABI);
    this.balanceOfFragment = this.erc20Interface.getFunction("balanceOf");
    this.allowanceFragment = this.erc20Interface.getFunction("allowance");

    this.userManagerInterface = new Interface(UserManagerABI);
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
        
        // TODO
        //3. проверить статус транзакции
        //3.1 если fail, то отправить заново
        //3.2 если success, то удалить статус транзакции
        //3.3 если не отправлена, то отправить
      }
    }
  }
}
