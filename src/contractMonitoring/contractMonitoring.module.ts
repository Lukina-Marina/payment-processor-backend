import { Module } from '@nestjs/common';
import { RpcModule } from '../rpc/rpc.module';
import { ContractMonitoringService } from './services/contractMonitoring.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [ContractMonitoringService],
  imports: [RpcModule, DatabaseModule]
})
export class ContractMonitoringModule {}