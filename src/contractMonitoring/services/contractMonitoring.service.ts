import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from "../../../config";
import {
    UserManagerEventProcessor,
    SubscriptionManagerEventProcessor,
    BaseEventProcessor
} from './eventProcessors/index';
import { NodeFetcherService } from "../../rpc/services/nodeFetcher.service";
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ContractMonitoringService implements OnApplicationBootstrap {
    private monitoringParameters: {
        contractAddress: string,
        startBlockNumber: bigint,
        eventProcessor: BaseEventProcessor
    }[];

    constructor(private nodeFetcherService: NodeFetcherService, private databaseService: DatabaseService) {
        this.monitoringParameters = [
            {
                contractAddress: config.contracts.subscriptionManager.address,
                startBlockNumber: BigInt(config.contracts.subscriptionManager.deployBlockNumber),
                eventProcessor: new SubscriptionManagerEventProcessor()
            },
            {
                contractAddress: config.contracts.userManager.address,
                startBlockNumber: BigInt(config.contracts.userManager.deployBlockNumber),
                eventProcessor: new UserManagerEventProcessor()
            }
        ];
    }

    async onApplicationBootstrap(): Promise<void> {
        for(const monitoringParameter of this.monitoringParameters) {
            const contractInfo = await this.databaseService.contract.findUnique({
                where: {
                    address: monitoringParameter.contractAddress
                }
            });
            if (contractInfo === null) {
                continue;
            }
            
            if (contractInfo.lastProcessedBlock + 1n > monitoringParameter.startBlockNumber) {
                monitoringParameter.startBlockNumber = contractInfo.lastProcessedBlock + 1n;
            }
        }
    }

    async startMonitoring(): Promise<void> {
        while(true) {
            const latestBlock = await this.nodeFetcherService.getBlock("latest");

            for(const monitoringParameter of this.monitoringParameters) {
                for(let startBlock = monitoringParameter.startBlockNumber; startBlock <= latestBlock.number; startBlock += BigInt(config.eventPeriod) + 1n) {
                    const logs = this.nodeFetcherService.getLogs(monitoringParameter.contractAddress, null, startBlock, startBlock + BigInt(config.eventPeriod));
                    // TODO process events
                }
            }
        }
    }
}