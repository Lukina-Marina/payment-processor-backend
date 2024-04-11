import { Module } from '@nestjs/common';
import { NodeFetcherService } from './services/nodeFetcher.service';

@Module({
  providers: [NodeFetcherService],
})
export class RpcModule {}