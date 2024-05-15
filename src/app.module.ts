import { Module } from '@nestjs/common';
import { RpcModule } from './rpc/rpc.module';
import { ContractMonitoringModule } from './contractMonitoring/contractMonitoring.module';
import { DatabaseModule } from './database/database.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SignerModule } from './signer/signer.module';

@Module({
  imports: [RpcModule, ContractMonitoringModule, DatabaseModule, SubscriptionModule, SignerModule],
})
export class AppModule { }
