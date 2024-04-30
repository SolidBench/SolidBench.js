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

  beforeEach(() => {
    server = new Server({
      configPath: 'CONFIG',
      port: 3_000,
      logLevel: 'info',
      baseUrl: undefined,
      rootFilePath: 'out-fragments/http/localhost_3000/',
    });
    run.mockReset();
  });

  it('serve', async() => {
    await server.serve();
    expect(run).toHaveBeenCalledWith(
      {
        loaderProperties: {
          mainModulePath: join(__dirname, '..'),
          typeChecking: false,
          logLevel: 'info',
        },
        config: 'CONFIG',
        variableBindings: {
          'urn:solid-server:default:variable:baseUrl': 'http://localhost:3000/',
          'urn:solid-server:default:variable:loggingLevel': 'info',
          'urn:solid-server:default:variable:port': 3_000,
          'urn:solid-server:default:variable:rootFilePath': 'out-fragments/http/localhost_3000/',
          'urn:solid-server:default:variable:seededPodConfigJson': '',
          'urn:solid-server:default:variable:showStackTrace': false,
        },
      },
    );
  });
});
