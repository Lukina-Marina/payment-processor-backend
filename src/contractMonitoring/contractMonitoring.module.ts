import { Module } from '@nestjs/common';
import { ContractMonitoringService } from './services/contractMonitoring.service';

@Module({
  providers: [ContractMonitoringService],
})
export class ContractMonitoringModule {}