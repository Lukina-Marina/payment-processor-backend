import { Interface, Log, LogDescription } from 'ethers';
import { DatabaseService } from 'src/database/Database.service';

export abstract class BaseEventProcessor {
  public contractInterface: Interface;

  constructor(
    public databaseService: DatabaseService,
    abi: any,
  ) {
    this.contractInterface = new Interface(abi);
  }

  async processEvents(logs: Log[]): Promise<void> {
    for (const log of logs) {
      const parsedLog = this.contractInterface.parseLog(log);

      if (parsedLog === null) {
        continue;
      }

      this.processEvent(parsedLog, log);
    }
  }

  abstract processEvent(parsedLog: LogDescription, log: Log): Promise<void>;
}
