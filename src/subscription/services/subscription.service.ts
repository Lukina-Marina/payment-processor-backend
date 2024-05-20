import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from '../../../config';
import { NodeFetcherService } from '../../rpc/services/nodeFetcher.service';
import { DatabaseService } from 'src/database/database.service';
import { SignerService } from 'src/signer/services/signer.service';
import { Interface } from 'ethers';
import * as Erc20ABI from '../../../abi/ERC20.json';

@Injectable()
export class SubscriptionService implements OnApplicationBootstrap {
  private monirotringPromise: Promise<void>;
  private erc20Interface: Interface;

  constructor(
    private nodeFetcherService: NodeFetcherService,
    private databaseService: DatabaseService,
    private signerService: SignerService,
  ) {
    this.erc20Interface = new Interface(Erc20ABI);
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
        //1. проверить баланс
        //2. проверить апрув
        //3. проверить статус транзакции
        //3.1 если fail, то отправить заново
        //3.2 если success, то удалить статус транзакции
        //3.3 если не отправлена, то отправить
      }
    }
  }
}
