import type { Argv } from 'yargs';
import { Server } from '../Server';
import { Templates } from '../Templates';

export const command = 'serve';
export const desc = 'Serves the fragmented dataset via an HTTP server';
export const builder = (yargs: Argv<any>): Argv<any> =>
  yargs
    .options({
      port: {
        type: 'number',
        alias: 'p',
        describe: 'The HTTP port to run on',
        default: 3_000,
      },
      baseUrl: {
        type: 'string',
        alias: 'b',
        describe: 'The base URL of the server',
      },
      rootFilePath: {
        type: 'string',
        alias: 'r',
        describe: 'Path to the root of the files to serve',
        default: 'out-fragments/http/localhost_3000/',
      },
      config: {
        type: 'string',
        alias: 'c',
        describe: 'Path to server config',
        default: Templates.SERVER_CONFIG,
        defaultDescription: 'server-config.json',
      },
      logLevel: {
        type: 'string',
        alias: 'l',
        describe: 'Logging level (error, warn, info, verbose, debug, silly)',
        default: 'info',
      },
    });
export const handler = async(argv: Record<string, any>): Promise<void> => new Server({
  configPath: argv.config,
  port: argv.port,
  baseUrl: argv.baseUrl,
  rootFilePath: argv.rootFilePath,
  logLevel: argv.logLevel,
}).serve();
