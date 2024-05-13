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
        defaultDescription: 'enhancer-config-pod.json',
      },
      fragmentConfig: {
        type: 'string',
        alias: 'f',
        describe: 'Path to fragmentation config',
        default: Templates.FRAGMENT_CONFIG,
        defaultDescription: 'fragmenter-config-pod.json',
      },
      queryConfig: {
        type: 'string',
        alias: 'q',
        describe: 'Path to query instantiation config',
        default: Templates.QUERY_CONFIG,
        defaultDescription: 'query-config.json',
      },
      validationParams: {
        type: 'string',
        describe: 'URL of the validation parameters zip file',
        default: Templates.VALIDATION_PARAMS_URL,
        defaultDescription: 'https://.../validation_params.zip',
      },
      validationConfig: {
        type: 'string',
        alias: 'v',
        describe: 'Path to validation generator config',
        default: Templates.VALIDATION_CONFIG,
        defaultDescription: 'validation-config.json',
      },
      hadoopMemory: {
        type: 'string',
        describe: 'Memory limit for Hadoop',
        default: '4G',
      },
    })
    .choices('scale', [ 0.1, 1, 3, 10, 30, 100, 300, 1_000 ]);
export const handler = (argv: Record<string, any>): Promise<void> => new Generator({
  verbose: argv.verbose,
  cwd: argv.cwd,
  overwrite: argv.overwrite,
  scale: argv.scale,
  enhancementConfig: argv.enhancementConfig,
  fragmentConfig: argv.fragmentConfig,
  queryConfig: argv.queryConfig,
  validationParams: argv.validationParams,
  validationConfig: argv.validationConfig,
  hadoopMemory: argv.hadoopMemory,
}).generate();
