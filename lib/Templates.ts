import { join } from 'node:path';

/**
 * Paths to default configuration files.
 */
export const Templates = {
  ENHANCEMENT_CONFIG: join(__dirname, '../templates/enhancer-config-pod.json'),
  FRAGMENT_CONFIG: join(__dirname, '../templates/fragmenter-config-pod.json'),
  QUERY_CONFIG: join(__dirname, '../templates/query-config.json'),
  SERVER_CONFIG: join(__dirname, '../templates/server-config.json'),
  QUERIES_DIRECTORY: join(__dirname, '../templates/queries'),
  VALIDATION_CONFIG: join(__dirname, '../templates/validation-config.json'),
  VALIDATION_PARAMS_URL: 'https://cloud.ilabt.imec.be/index.php/s/bBZZKb7cP95WgcD/download/validation_params.zip',
};
