import * as fs from 'fs';
import { request } from 'https';
import * as Path from 'path';
import Dockerode from 'dockerode';
import { runConfig as runEnhancer } from 'ldbc-snb-enhancer';
import { runConfig as runValidationGenerator } from 'ldbc-snb-validation-generator';
import { runConfig as runFragmenter } from 'rdf-dataset-fragmenter';
import { runConfig as runQueryInstantiator } from 'sparql-query-parameter-instantiator';
import { Extract } from 'unzipper';

/**
 * Generates decentralized social network data in different phases.
 */
export class Generator {
  public static readonly COLOR_RESET: string = '\u001B[0m';
  public static readonly COLOR_RED: string = '\u001B[31m';
  public static readonly COLOR_GREEN: string = '\u001B[32m';
  public static readonly COLOR_YELLOW: string = '\u001B[33m';
  public static readonly COLOR_BLUE: string = '\u001B[34m';
  public static readonly COLOR_MAGENTA: string = '\u001B[35m';
  public static readonly COLOR_CYAN: string = '\u001B[36m';
  public static readonly COLOR_GRAY: string = '\u001B[90m';
  public static readonly LDBC_SNB_DATAGEN_DOCKER_IMAGE: string = 'rubensworks/ldbc_snb_datagen:latest';

  private readonly cwd: string;
  private readonly verbose: boolean;
  private readonly overwrite: boolean;
  private readonly scale: string;
  private readonly enhancementConfig: string;
  private readonly fragmentConfig: string;
  private readonly enhancementFragmentConfig: string;
  private readonly queryConfig: string;
  private readonly validationParams: string;
  private readonly validationConfig: string;
  private readonly hadoopMemory: string;
  private readonly mainModulePath: string;

  public constructor(opts: IGeneratorOptions) {
    this.cwd = opts.cwd;
    this.verbose = opts.verbose;
    this.overwrite = opts.overwrite;
    this.scale = opts.scale;
    this.enhancementConfig = opts.enhancementConfig;
    this.fragmentConfig = opts.fragmentConfig;
    this.enhancementFragmentConfig = opts.enhancementFragmentConfig;
    this.queryConfig = opts.queryConfig;
    this.validationParams = opts.validationParams;
    this.validationConfig = opts.validationConfig;
    this.hadoopMemory = opts.hadoopMemory;
    this.mainModulePath = Path.join(__dirname, '..');
  }

  protected async targetExists(path: string): Promise<boolean> {
    try {
      await fs.promises.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  protected log(phase: string, status: string): void {
    process.stdout.write(`${Generator.withColor(`[${phase}]`, Generator.COLOR_CYAN)} ${status}\n`);
  }

  protected async runPhase(name: string, directory: string, runner: () => Promise<void>): Promise<void> {
    if (this.overwrite || !await this.targetExists(Path.join(this.cwd, directory))) {
      this.log(name, 'Started');
      const timeStart = process.hrtime();
      await runner();
      const timeEnd = process.hrtime(timeStart);
      this.log(name, `Done in ${timeEnd[0] + (timeEnd[1] / 1_000_000_000)} seconds`);
    } else {
      this.log(name, `Skipped (/${directory} already exists, remove to regenerate)`);
    }
  }

  /**
   * Run all generator phases.
   */
  public async generate(): Promise<void> {
    const timeStart = process.hrtime();
    await this.runPhase('SNB dataset generator', 'out-snb', () => this.generateSnbDataset());
    await this.runPhase('SNB dataset enhancer', 'out-enhanced', () => this.enhanceSnbDataset());
    await this.runPhase('SNB dataset fragmenter', 'out-fragments', () => this.fragmentSnbDataset());
    await this.runPhase('SPARQL query instantiator', 'out-queries', () => this.instantiateQueries());
    await this.runPhase('SNB validation downloader', 'out-validate-params', () => this.downloadValidationParams());
    await this.runPhase('SNB validation generator', 'out-validate', () => this.generateValidation());
    const timeEnd = process.hrtime(timeStart);
    this.log('All', `Done in ${timeEnd[0] + (timeEnd[1] / 1_000_000_000)} seconds`);
  }

  /**
   * Invoke the LDBC SNB generator.
   */
  public async generateSnbDataset(): Promise<void> {
    // Create params.ini file
    const paramsTemplate = await fs.promises.readFile(Path.join(__dirname, '../templates/params.ini'), 'utf8');
    const paramsPath = Path.join(this.cwd, 'params.ini');
    // TODO: remove once we drop Node 14 support
    // eslint-disable-next-line unicorn/prefer-string-replace-all
    await fs.promises.writeFile(paramsPath, paramsTemplate.replace(/SCALE/ug, this.scale), 'utf8');

    // Pull the base Docker image
    const dockerode = new Dockerode();
    const buildStream = await dockerode.pull(Generator.LDBC_SNB_DATAGEN_DOCKER_IMAGE);
    await new Promise((resolve, reject) => {
      dockerode.modem.followProgress(buildStream,
        (err: Error | null, res: any[]) => err ? reject(err) : resolve(res));
    });

    // Start Docker container
    const container = await dockerode.createContainer({
      Image: Generator.LDBC_SNB_DATAGEN_DOCKER_IMAGE,
      Tty: true,
      AttachStdout: true,
      AttachStderr: true,
      Env: [ `HADOOP_CLIENT_OPTS=-Xmx${this.hadoopMemory}` ],
      HostConfig: {
        Binds: [
          `${this.cwd}/out-snb/:/opt/ldbc_snb_datagen/out`,
          `${paramsPath}:/opt/ldbc_snb_datagen/params.ini`,
        ],
      },
    });
    await container.start();

    // Stop process on force-exit
    let containerEnded = false;
    process.on('SIGINT', async() => {
      if (!containerEnded) {
        await container.kill();
        await cleanup();
      }
    });
    async function cleanup(): Promise<void> {
      await container.remove();
      await fs.promises.unlink(paramsPath);
    }

    // Attach output to stdout
    const out = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });
    if (this.verbose) {
      out.pipe(process.stdout);
    } else {
      out.resume();
    }

    // Wait until generation ends
    await new Promise((resolve, reject) => {
      out.on('end', resolve);
      out.on('error', reject);
    });
    containerEnded = true;

    // Cleanup
    await cleanup();
  }

  /**
   * Enhance the generated LDBC SNB dataset.
   */
  public async enhanceSnbDataset(): Promise<void> {
    // Create target directory
    await fs.promises.mkdir(Path.join(this.cwd, 'out-enhanced'));

    // Run enhancer
    const oldCwd = process.cwd();
    process.chdir(this.cwd);
    await runEnhancer(this.enhancementConfig, { mainModulePath: this.mainModulePath });
    process.chdir(oldCwd);
  }

  /**
   * Fragment the generated and enhanced LDBC SNB datasets.
   */
  public async fragmentSnbDataset(): Promise<void> {
    const oldCwd = process.cwd();
    process.chdir(this.cwd);

    // Initial fragmentation
    await runFragmenter(this.fragmentConfig, { mainModulePath: this.mainModulePath });

    // Auxiliary fragmentation
    this.log('SNB dataset fragmenter', 'Starting auxiliary phase');
    await runFragmenter(this.enhancementFragmentConfig, { mainModulePath: this.mainModulePath });

    process.chdir(oldCwd);
  }

  /**
   * Instantiate queries based on the LDBC SNB datasets.
   */
  public async instantiateQueries(): Promise<void> {
    // Create target directory
    await fs.promises.mkdir(Path.join(this.cwd, 'out-queries'));

    // Run instantiator
    const oldCwd = process.cwd();
    process.chdir(this.cwd);
    await runQueryInstantiator(this.queryConfig, { mainModulePath: this.mainModulePath }, {
      variables: await this.generateVariables(),
    });
    process.chdir(oldCwd);
  }

  /**
   * Download validation parameters
   */
  public async downloadValidationParams(): Promise<void> {
    // Create target directory
    const target = Path.join(this.cwd, 'out-validate-params');
    await fs.promises.mkdir(target);

    // Download and extract zip file
    return new Promise((resolve, reject) => {
      request(this.validationParams, res => {
        res
          .on('error', reject)
          .pipe(Extract({ path: target }))
          .on('error', reject)
          .on('close', resolve);
      }).end();
    });
  }

  /**
   * Generate validation queries and results.
   */
  public async generateValidation(): Promise<void> {
    // Create target directory
    await fs.promises.mkdir(Path.join(this.cwd, 'out-validate'));

    // Run generator
    const oldCwd = process.cwd();
    process.chdir(this.cwd);
    await runValidationGenerator(this.validationConfig, { mainModulePath: this.mainModulePath }, {
      variables: await this.generateVariables(),
    });
    process.chdir(oldCwd);
  }

  protected async generateVariables(): Promise<Record<string, string>> {
    return Object.fromEntries((await fs.promises.readdir(Path.join(__dirname, '../templates/queries/')))
      .map(name => [ `urn:variables:query-templates:${name}`, Path.join(__dirname, `../templates/queries/${name}`) ]));
  }

  /**
   * Return a string in a given color
   * @param str The string that should be printed in
   * @param color A given color
   */
  public static withColor(str: any, color: string): string {
    return `${color}${str}${Generator.COLOR_RESET}`;
  }
}

export interface IGeneratorOptions {
  cwd: string;
  verbose: boolean;
  overwrite: boolean;
  scale: string;
  enhancementConfig: string;
  fragmentConfig: string;
  enhancementFragmentConfig: string;
  queryConfig: string;
  validationParams: string;
  validationConfig: string;
  hadoopMemory: string;
}
