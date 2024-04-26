import { Injectable } from '@nestjs/common';
import { config } from "../../../config";
import {
    UserManagerEventProcessor,
    SubscriptionManagerEventProcessor,
    IBaseEventProcessor
} from './eventProcessors/index';
import { NodeFetcherService } from "../../rpc/services/nodeFetcher.service";
import { DatabaseService } from 'src/database/database.service';
import { Contract } from "@prisma/client";

@Injectable()
export class ContractMonitoringService {
    private monitoringParameters: {
        contractAddress: string,
        startBlockNumber: number,
        eventProcessor: IBaseEventProcessor
    }[];

    constructor(private nodeFetcherService: NodeFetcherService, private databaseService: DatabaseService) {
        this.monitoringParameters = [
            {
                contractAddress: config.contracts.subscriptionManager.address,
                startBlockNumber: config.contracts.subscriptionManager.deployBlockNumber,
                eventProcessor: new SubscriptionManagerEventProcessor()
            },
            {
                contractAddress: config.contracts.userManager.address,
                startBlockNumber: config.contracts.userManager.deployBlockNumber,
                eventProcessor: new UserManagerEventProcessor()
            }
        ];
    }
}