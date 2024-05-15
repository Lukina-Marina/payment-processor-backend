import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from "../../../config";
import { NodeFetcherService } from "../../rpc/services/nodeFetcher.service";

@Injectable()
export class SignerService implements OnApplicationBootstrap {
    private monirotringPromise: Promise<void>;

    constructor(private nodeFetcherService: NodeFetcherService) {}

    async onApplicationBootstrap(): Promise<void> {
        this.monirotringPromise = this.startMonitoring();
    }

    async startMonitoring(): Promise<void> {
        while (true) {}
    }
}