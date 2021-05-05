import type { Argv } from 'yargs';
import { Generator } from '../Generator';
import { Templates } from '../Templates';

export const command = 'generate';
export const desc = 'Generate social network data';
export const builder = (yargs: Argv<any>): Argv<any> =>
  yargs
    .options({
      overwrite: {
        type: 'string',
        alias: 'o',
        describe: 'If existing files should be overwritten',
        default: false,
      },
      scale: {
        type: 'number',
        alias: 's',
        describe: 'The SNB scale factor',
        default: 0.1,
      },
      enhancementConfig: {
        type: 'string',
        alias: 'e',
        describe: 'Path to enhancement config',
        default: Templates.ENHANCEMENT_CONFIG,
        defaultDescription: 'enhancer-config-dummy.json',
      },
      fragmentConfig: {
        type: 'string',
        alias: 'f',
        describe: 'Path to fragmentation config',
        default: Templates.FRAGMENT_CONFIG,
        defaultDescription: 'fragmenter-config-subject.json',
      },
      enhancementFragmentConfig: {
        type: 'string',
        alias: 'g',
        describe: 'Path to enhancement\'s fragmentation config',
        default: Templates.ENHANCEMENT_FRAGMENT_CONFIG,
        defaultDescription: 'fragmenter-auxiliary-config-subject.json',
      },
      queryConfig: {
        type: 'string',
        alias: 'q',
        describe: 'Path to query instantiation config',
        default: Templates.QUERY_CONFIG,
        defaultDescription: 'query-config.json',
      },
      hadoopMemory: {
        type: 'string',
        describe: 'Memory limit for Hadoop',
        default: '4G',
      },
    })
    .check((args, options): boolean => {
      const scales = [ 0.1, 1, 3, 10, 30, 100, 300, 1_000 ];
      if (!scales.includes(args.scale)) {
        throw new Error(`Invalid SNB scale factor '${args.type}'. Must be one of '${Object.keys(scales).join(', ')}'`);
      }
      return true;
    });
export const handler = (argv: Record<string, any>): Promise<void> => new Generator({
  verbose: argv.verbose,
  cwd: argv.cwd,
  overwrite: argv.overwrite,
  scale: argv.scale,
  enhancementConfig: argv.enhancementConfig,
  fragmentConfig: argv.fragmentConfig,
  enhancementFragmentConfig: argv.enhancementFragmentConfig,
  queryConfig: argv.queryConfig,
  hadoopMemory: argv.hadoopMemory,
}).generate();
