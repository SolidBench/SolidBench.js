import * as Path from 'path';
import { Server } from '../lib/Server';

const run = jest.fn();
jest.mock('@solid/community-server', () => ({
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
    });
    run.mockReset();
  });

  it('serve', async() => {
    await server.serve();
    expect(run).toHaveBeenCalledWith(
      {
        mainModulePath: Path.join(__dirname, '..'),
        logLevel: 'info',
        typeChecking: false,
      },
      'CONFIG',
      {
        'urn:solid-server:default:variable:baseUrl': 'http://localhost:3000/',
        'urn:solid-server:default:variable:loggingLevel': 'info',
        'urn:solid-server:default:variable:port': 3_000,
        'urn:solid-server:default:variable:rootFilePath': 'out-fragments/http/localhost_3000/',
        'urn:solid-server:default:variable:seededPodConfigJson': '',
        'urn:solid-server:default:variable:showStackTrace': false,
      },
    );
  });
});
