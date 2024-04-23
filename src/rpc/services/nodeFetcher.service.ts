import { Injectable } from '@nestjs/common';

import { BlockTag, ethers, Log, TopicFilter, TransactionRequest } from "ethers";

import { config } from "../../../config";
import { SECOND } from "../../../constants";
import { sleep } from "../../../helpers";

@Injectable()
export class NodeFetcherService {
    provider: ethers.InfuraProvider;

    rpcEndpoint: string;

    constructor() {
        this.rpcEndpoint = config.rpcEndpoint;

        this.provider = new ethers.InfuraProvider(this.rpcEndpoint);
    }

    async call(
        tx: TransactionRequest,
        decodeTypes: string[] | undefined = [],
    ): Promise<any> {
        const result = await this.callPrivate(tx);

        if (decodeTypes.length > 0) {
            return new ethers.AbiCoder().decode(decodeTypes, result);
        }

        return result;
    }

    async getBalance(address: string, blockNumber: number): Promise<bigint> {
        return this.getBalancePrivate(address, blockNumber);
    }

    async getLogs(
        address: string,
        topics: TopicFilter,
        fromBlock: BlockTag,
        toBlock: BlockTag
    ): Promise<Log[]> {
        return this.getLogsPrivate(address, topics, fromBlock, toBlock);
    }

    private async callPrivate(tx: TransactionRequest): Promise<string> {
        try {
            return await this.provider.call(tx);
        } catch (error) {
            console.log('Error while call:', error.message);

            await sleep(SECOND);

            return this.callPrivate(tx);
        }
    }

    private async getBalancePrivate(
        address: string,
        blockNumber: number,
    ): Promise<bigint> {
        try {
            return await this.provider.getBalance(address, blockNumber);
        } catch (error) {
            console.log('Error while getBalance:', error.message);

            await sleep(SECOND);

            return this.getBalancePrivate(address, blockNumber);
        }
    }

    private async getLogsPrivate(
        address: string,
        topics: TopicFilter,
        fromBlock: BlockTag,
        toBlock: BlockTag,
    ): Promise<Log[]> {
        try {
            return await this.provider.getLogs({
                address,
                topics,
                fromBlock,
                toBlock
            });
        } catch (error) {
            console.log('Error while getLogs:', error.message);

            await sleep(SECOND);

            return this.getLogsPrivate(address, topics, fromBlock, toBlock);
        }
    }
}