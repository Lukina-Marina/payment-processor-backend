import { Injectable } from '@nestjs/common';
import { config } from "../../../config";
import {
    UserManagerEventProcessor,
    SubscriptionManagerEventProcessor,
    IBaseEventProcessor
} from './eventProcessors/index';
import { NodeFetcherService } from "../../rpc/services/nodeFetcher.service";

@Injectable()
export class ContractMonitoringService {
    private monitoringParameters: {
        contractAddress: string,
        startBlockNumber: number,
        eventProcessor: IBaseEventProcessor
    }[];

    constructor(private nodeFetcherService: NodeFetcherService) {
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