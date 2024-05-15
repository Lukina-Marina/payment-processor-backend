import { Module } from '@nestjs/common';
import { RpcModule } from '../rpc/rpc.module';
import { SubscriptionService } from './services/subscription.service';
import { DatabaseModule } from 'src/database/database.module';
import { SignerModule } from 'src/signer/signer.module';

@Module({
  providers: [SubscriptionService],
  imports: [RpcModule, DatabaseModule, SignerModule]
})
export class SubscriptionModule {}