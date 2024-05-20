import { Module } from '@nestjs/common';
import { RpcModule } from '../rpc/rpc.module';
import { SignerService } from './services/signer.service';

@Module({
  providers: [SignerService],
  imports: [RpcModule],
  exports: [SignerService],
})
export class SignerModule {}
