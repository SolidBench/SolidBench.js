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
      },
      'CONFIG',
      {
        port: 3_000,
        rootFilePath: 'out-fragments/http/localhost_3000/',
        loggingLevel: 'info',
      },
    );
  });
});
