import { join } from 'node:path';
import { Server } from '../lib/Server';

const run = jest.fn();

jest.mock<typeof import('@solid/community-server')>('@solid/community-server', () => <any> ({
  AppRunner: jest.fn().mockImplementation(() => ({
    run,
  })),
}));

describe('Server', () => {
  let server: Server;
  let baseUrl: string;

  const configPath = 'CONFIG';
  const port = 3_000;
  const logLevel = 'info';
  const rootFilePath = 'out-fragments/http/localhost_3000/';

  beforeEach(() => {
    run.mockReset();
  });

  it('calls serve', async() => {
    server = new Server({ configPath, port, logLevel, baseUrl, rootFilePath });
    await server.serve();
    expect(run).toHaveBeenCalledWith(
      {
        loaderProperties: {
          mainModulePath: join(__dirname, '..'),
          typeChecking: false,
          logLevel,
        },
        config: configPath,
        variableBindings: {
          'urn:solid-server:default:variable:baseUrl': 'http://localhost:3000/',
          'urn:solid-server:default:variable:loggingLevel': logLevel,
          'urn:solid-server:default:variable:port': port,
          'urn:solid-server:default:variable:rootFilePath': rootFilePath,
          'urn:solid-server:default:variable:seededPodConfigJson': '',
          'urn:solid-server:default:variable:showStackTrace': false,
        },
      },
    );
  });

  it('calls serve with baseUrl defined', async() => {
    baseUrl = 'http://localhost:1234/';
    server = new Server({ configPath, port, logLevel, baseUrl, rootFilePath });
    await server.serve();
    expect(run).toHaveBeenCalledWith(
      {
        loaderProperties: {
          mainModulePath: join(__dirname, '..'),
          typeChecking: false,
          logLevel,
        },
        config: configPath,
        variableBindings: {
          'urn:solid-server:default:variable:baseUrl': baseUrl,
          'urn:solid-server:default:variable:loggingLevel': logLevel,
          'urn:solid-server:default:variable:port': port,
          'urn:solid-server:default:variable:rootFilePath': rootFilePath,
          'urn:solid-server:default:variable:seededPodConfigJson': '',
          'urn:solid-server:default:variable:showStackTrace': false,
        },
      },
    );
  });
});
