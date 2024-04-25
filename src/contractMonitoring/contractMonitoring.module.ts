import { Module } from '@nestjs/common';
import { RpcModule } from '../rpc/rpc.module';
import { ContractMonitoringService } from './services/contractMonitoring.service';

@Module({
  providers: [ContractMonitoringService],
  imports: [RpcModule]
})
export class ContractMonitoringModule {}