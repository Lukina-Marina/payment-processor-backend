import { DatabaseService } from "src/database/database.service";
import { BaseEventProcessor } from "./BaseEventProcessor";
import * as SubscriptionManagerABI from "../../../../abi/SubscriptionManager.json";
import { Log, LogDescription } from "ethers";

export class SubscriptionManagerEventProcessor extends BaseEventProcessor {
    constructor(
        public databaseService: DatabaseService,
    ) {
        super(databaseService, SubscriptionManagerABI);
    }

    async processEvent(parsedLog: LogDescription, log: Log): Promise<void> {}
}