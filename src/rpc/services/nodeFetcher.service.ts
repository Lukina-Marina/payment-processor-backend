import { Injectable } from '@nestjs/common';

import { ethers } from "ethers";

import { config } from "../../../config";

import { RequestInfo, RequestType } from "./interfaces/RequestInfo.interface";

@Injectable()
export class NodeFetcherService {
    provider: ethers.InfuraProvider;

    rpcEndpoint: string;

    requests: RequestInfo[];

    constructor() {
        this.rpcEndpoint = config.rpcEndpoint;

        this.provider = new ethers.InfuraProvider(this.rpcEndpoint);
    }
}