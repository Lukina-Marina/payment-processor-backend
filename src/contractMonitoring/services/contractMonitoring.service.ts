import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from "../../../config";
import {
    UserManagerEventProcessor,
    SubscriptionManagerEventProcessor,
    BaseEventProcessor
} from './eventProcessors/index';
import { NodeFetcherService } from "../../rpc/services/nodeFetcher.service";
import { DatabaseService } from 'src/database/database.service';
import { min, sleep } from 'helpers';

@Injectable()
export class ContractMonitoringService implements OnApplicationBootstrap {
    private monitoringParameters: {
        contractAddress: string,
        startBlockNumber: bigint,
        eventProcessor: BaseEventProcessor
    }[];

    private monirotringPromise: Promise<void>;

    constructor(private nodeFetcherService: NodeFetcherService, private databaseService: DatabaseService) {
        this.monitoringParameters = [
            {
                contractAddress: config.contracts.subscriptionManager.address,
                startBlockNumber: BigInt(config.contracts.subscriptionManager.deployBlockNumber),
                eventProcessor: new SubscriptionManagerEventProcessor(databaseService)
            },
            {
                contractAddress: config.contracts.userManager.address,
                startBlockNumber: BigInt(config.contracts.userManager.deployBlockNumber),
                eventProcessor: new UserManagerEventProcessor(databaseService)
            }
        ];
    }

    async onApplicationBootstrap(): Promise<void> {
        for (const monitoringParameter of this.monitoringParameters) {
            const contractInfo = await this.databaseService.contract.findUnique({
                where: {
                    address: monitoringParameter.contractAddress
                }
            });
            if (contractInfo === null) {
                this.databaseService.contract.create({
                    data: {
                        address: monitoringParameter.contractAddress,
                        lastProcessedBlock: monitoringParameter.startBlockNumber - 1n
                    }
                });
                continue;
            }

            if (contractInfo.lastProcessedBlock + 1n > monitoringParameter.startBlockNumber) {
                monitoringParameter.startBlockNumber = contractInfo.lastProcessedBlock + 1n;
            }
        }

        this.monirotringPromise = this.startMonitoring();
    }

    async startMonitoring(): Promise<void> {
        while (true) {
            const latestBlock = await this.nodeFetcherService.getBlock("latest");

            for (const monitoringParameter of this.monitoringParameters) {
                for (
                    let startBlock = monitoringParameter.startBlockNumber;
                    startBlock <= latestBlock.number;
                    startBlock += BigInt(config.eventPeriod) + 1n
                ) {
                    const endBlock = min(startBlock + BigInt(config.eventPeriod), BigInt(latestBlock.number));

                    const logs = await this.nodeFetcherService.getLogs(
                        monitoringParameter.contractAddress,
                        null,
                        startBlock,
                        endBlock
                    );

                    await monitoringParameter.eventProcessor.processEvents(logs);

                    monitoringParameter.startBlockNumber = endBlock + 1n;

                    await this.databaseService.contract.update({
                        data: {
                            lastProcessedBlock: endBlock
                        },
                        where: {
                            address: monitoringParameter.contractAddress
                        }
                    });
                }
            }

            await sleep(config.eventProcessingSleepPeriod);
        }
    }
}