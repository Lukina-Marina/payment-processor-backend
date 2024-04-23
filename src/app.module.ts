import { Module } from '@nestjs/common';
import { RpcModule } from './rpc/rpc.module';
import { ContractMonitoringModule } from './contractMonitoring/contractMonitoring.module';

@Module({
  imports: [RpcModule, ContractMonitoringModule],
})
export class AppModule {}
