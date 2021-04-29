import Path from 'path';
import { AppRunner } from '@solid/community-server';

/**
 * Serves generated fragments over HTTP.
 */
export class Server {
  private readonly configPath: string;
  private readonly port: number;
  private readonly logLevel: string;

  public constructor(options: IServerOptions) {
    this.configPath = options.configPath;
    this.port = options.port;
    this.logLevel = options.logLevel;
  }

  public async serve(): Promise<void> {
    return new AppRunner().run(
      {
        mainModulePath: Path.join(__dirname, '..'),
        logLevel: <any> this.logLevel,
      },
      this.configPath,
      {
        port: this.port,
        rootFilePath: 'out-fragments/http/localhost_3000/',
        loggingLevel: this.logLevel,
      },
    );
  }
}

export interface IServerOptions {
  configPath: string;
  port: number;
  logLevel: string;
}
