import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export function runCli(cwd: string, argv: string[]): void {
  yargs(hideBin(argv))
    .options({
      cwd: { type: 'string', default: cwd, describe: 'The current working directory', defaultDescription: '.' },
      verbose: { type: 'boolean', describe: 'If more output should be printed' },
    })
    .commandDir('commands')
    .demandCommand()
    .help();
}
