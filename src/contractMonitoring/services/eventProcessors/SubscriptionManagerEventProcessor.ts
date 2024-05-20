import { DatabaseService } from 'src/database/database.service';
import { BaseEventProcessor } from './BaseEventProcessor';
import * as SubscriptionManagerABI from '../../../../abi/SubscriptionManager.json';
import { Log, LogDescription } from 'ethers';

export class SubscriptionManagerEventProcessor extends BaseEventProcessor {
  constructor(public databaseService: DatabaseService) {
    super(databaseService, SubscriptionManagerABI);
  }

  async processEvent(parsedLog: LogDescription, log: Log): Promise<void> {
    if (parsedLog.name == "AppAdded") {
      const owner = parsedLog.args.owner;
      const appIndex = parsedLog.args.appIndex;
      const name = parsedLog.args.name;
      const description = parsedLog.args.description;

      await this.databaseService.app.create({
        data: {
          id: appIndex,
          owner,
          name,
          description,
        },
      })
    } else if (parsedLog.name == "SubscriptionAdded") {
      const owner = parsedLog.args.owner;
      const appIndex = parsedLog.args.appIndex;
      const subscriptionIndex = parsedLog.args.subscriptionIndex;
      const subscription = parsedLog.args.subscription;

      await this.databaseService.subscription.create({
        data: {
          appId: appIndex,
          subscriptionId: subscriptionIndex,
          name: subscription.name,
          amounts: subscription.amounts,
          subscriptionPeriod: subscription.subscriptionPeriod,
          reciever: subscription.reciever,
          tokens: subscription.tokens,
          isPaused: subscription.isPaused
        },
      })
    } else if (parsedLog.name == "SubscriptionChanging") {
      const owner = parsedLog.args.owner;
      const appIndex = parsedLog.args.appIndex;
      const subscriptionIndex = parsedLog.args.subscriptionIndex;
      const subscription = parsedLog.args.subscription;

      await this.databaseService.subscription.update({
        where: {
          appIdAndSubscriptionId: {
            appId: appIndex,
            subscriptionId: subscriptionIndex
          }
        },
        data: {
          name: subscription.name,
          amounts: subscription.amounts,
          subscriptionPeriod: subscription.subscriptionPeriod,
          reciever: subscription.reciever,
          tokens: subscription.tokens,
          isPaused: subscription.isPaused
        },
      })
    } else if (parsedLog.name == "SubscriptionPaused") {
      const owner = parsedLog.args.owner;
      const appIndex = parsedLog.args.appIndex;
      const subscriptionIndex = parsedLog.args.subscriptionIndex;

      await this.databaseService.subscription.update({
        where: {
          appIdAndSubscriptionId: {
            appId: appIndex,
            subscriptionId: subscriptionIndex
          }
        },
        data: {
          isPaused: true
        },
      })
    } else if (parsedLog.name == "SubscriptionUnpaused") {
      const owner = parsedLog.args.owner;
      const appIndex = parsedLog.args.appIndex;
      const subscriptionIndex = parsedLog.args.subscriptionIndex;

      await this.databaseService.subscription.update({
        where: {
          appIdAndSubscriptionId: {
            appId: appIndex,
            subscriptionId: subscriptionIndex
          }
        },
        data: {
          isPaused: false
        },
      })
    }
  }
}
