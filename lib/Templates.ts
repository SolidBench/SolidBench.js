import Path from 'path';

/**
 * Paths to default configuration files.
 */
export const Templates = {
  ENHANCEMENT_CONFIG: Path.join(__dirname, '../templates/enhancer-config-dummy.json'),
  FRAGMENT_CONFIG: Path.join(__dirname, '../templates/fragmenter-config-subject.json'),
  ENHANCEMENT_FRAGMENT_CONFIG: Path.join(__dirname, '../templates/fragmenter-auxiliary-config-subject.json'),
  QUERY_CONFIG: Path.join(__dirname, '../templates/query-config.json'),
  SERVER_CONFIG: Path.join(__dirname, '../templates/server-config.json'),
  QUERIES_DIRECTORY: Path.join(__dirname, '../templates/queries'),
};
