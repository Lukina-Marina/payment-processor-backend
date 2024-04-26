import { Module } from '@nestjs/common';
import { RpcModule } from './rpc/rpc.module';
import { ContractMonitoringModule } from './contractMonitoring/contractMonitoring.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [RpcModule, ContractMonitoringModule, DatabaseModule],
})
export class AppModule {}
