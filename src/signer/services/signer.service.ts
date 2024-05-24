import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { config } from '../../../config';
import { NodeFetcherService } from '../../rpc/services/nodeFetcher.service';
import { TransactionRequest, ethers } from 'ethers';
import { sleep } from 'helpers';

export enum TxStatus {
  Pending,
  Success,
  Fail
}

@Injectable()
export class SignerService implements OnApplicationBootstrap {
  private monirotringPromise: Promise<void>;

  private signer: ethers.JsonRpcSigner;

  private lastProcessedTxNumber: number = 0;
  private lastTxNumber: number = 0;
  private txQueue: {
    [txIndex: number]: TransactionRequest;
  } = {};

  public txStatus: {
    [txIndex: number]: TxStatus;
  } = {};

  constructor(private nodeFetcherService: NodeFetcherService) {}

  async onApplicationBootstrap(): Promise<void> {
    this.signer = this.nodeFetcherService.createSigner(config.signerPrivateKey);

    this.monirotringPromise = this.startMonitoring();
  }

  addTxToQueue(transactionRequest: TransactionRequest): number {
    const txNumber = this.lastTxNumber + 1;
    this.lastTxNumber = txNumber;

    this.txQueue[txNumber] = transactionRequest;
    this.txStatus[txNumber] = TxStatus.Pending;

    return txNumber;
  }

  deleteTxFromQueue(txNumber: number): void {
    this.txQueue[txNumber] = undefined;
    this.txStatus[txNumber] = undefined;
  }

  async startMonitoring(): Promise<void> {
    while (true) {
      const processingTxNumber = this.lastProcessedTxNumber + 1;
      if (processingTxNumber >= this.lastTxNumber + 1) {
        await sleep(config.txProcessingSleepPeriod);

        continue;
      }
      this.lastProcessedTxNumber = processingTxNumber;
      const transactionRequest = this.txQueue[processingTxNumber];

      let transactionResponse: ethers.TransactionResponse;
      try {
        transactionResponse = await this.signer.sendTransaction(transactionRequest);
      } catch (error) {
        this.txStatus[processingTxNumber] = TxStatus.Fail;

        continue;
      }
      const transactionReceipt = await transactionResponse.wait(config.waitConfirmations);

      if (transactionReceipt.status == 1) {
        this.txStatus[processingTxNumber] = TxStatus.Success;
      } else {
        this.txStatus[processingTxNumber] = TxStatus.Fail;
      }
    }
  }
}
