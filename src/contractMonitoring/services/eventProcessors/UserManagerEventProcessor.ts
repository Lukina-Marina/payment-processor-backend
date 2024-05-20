import { DatabaseService } from 'src/database/database.service';
import { BaseEventProcessor } from './BaseEventProcessor';
import * as UserManagerABI from '../../../../abi/UserManager.json';
import { Log, LogDescription } from 'ethers';

export class UserManagerEventProcessor extends BaseEventProcessor {
  constructor(public databaseService: DatabaseService) {
    super(databaseService, UserManagerABI);
  }

  async processEvent(parsedLog: LogDescription, log: Log): Promise<void> {
    if (parsedLog.name == 'AddedSubscription') {
      const user = parsedLog.args.user;
      const appId = parsedLog.args.appId;
      const subscriptionId = parsedLog.args.subscriptionId;
      const activeSubscriptionId = parsedLog.args.activeSubscriptionId;
      const token = parsedLog.args.token;

      await this.databaseService.activeSubscription.create({
        data: {
          user,
          appId,
          subscriptionId,
          activeSubscriptionId,
          token,
          subscriptionEndTime: 0,
        },
      });
    } else if (parsedLog.name == 'RenewedSubscription') {
      const user = parsedLog.args.user;
      const activeSubscriptionId = parsedLog.args.activeSubscriptionIndex;
      const activeSubscriptionInfo = parsedLog.args.activeSubscriptionInfo;
      const subscription = parsedLog.args.subscription;

      await this.databaseService.activeSubscription.update({
        data: {
          subscriptionEndTime: activeSubscriptionInfo.subscriptionEndTime,
        },
        where: {
          userAndActiveSubscriptionId: {
            user,
            activeSubscriptionId,
          },
        },
      });
    } else if (parsedLog.name == 'CanceledSubscription') {
      const user = parsedLog.args.user;
      const activeSubscriptionId = parsedLog.args.activeSubscriptionId;
      const lastElementId = parsedLog.args.lastElementId;
      const activeSubscriptionInfo = parsedLog.args.activeSubscriptionInfo;

      await this.databaseService.activeSubscription.delete({
        where: {
          userAndActiveSubscriptionId: {
            user,
            activeSubscriptionId,
          },
        },
      });
      if (activeSubscriptionId != lastElementId) {
        await this.databaseService.activeSubscription.update({
          data: {
            activeSubscriptionId,
          },
          where: {
            userAndActiveSubscriptionId: {
              user,
              activeSubscriptionId: lastElementId,
            },
          },
        });
      }
    } else if (parsedLog.name == 'PaymentTokenChanged') {
      const user = parsedLog.args.user;
      const oldToken = parsedLog.args.oldToken;
      const newToken = parsedLog.args.newToken;
      const activeSubscriptionId = parsedLog.args.activeSubscriptionId;

      await this.databaseService.activeSubscription.update({
        data: {
          token: newToken,
        },
        where: {
          userAndActiveSubscriptionId: {
            user,
            activeSubscriptionId,
          },
        },
      });
    }
  }
}
