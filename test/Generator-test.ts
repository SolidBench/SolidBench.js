import { join } from 'node:path';

import { runConfig as runEnhancer } from 'ldbc-snb-enhancer';
import { runConfig as runValidationGenerator } from 'ldbc-snb-validation-generator';
import { runConfig as runFragmenter } from 'rdf-dataset-fragmenter';
import { runConfig as runQueryInstantiator } from 'sparql-query-parameter-instantiator';

import { Generator } from '../lib/Generator';

let files: Record<string, string> = {};
let filesOut: Record<string, string> = {};
let filesDeleted: Record<string, boolean> = {};
let dirsOut: Record<string, boolean> = {};

jest.mock<typeof import('node:fs/promises')>('node:fs/promises', () => <any> ({
  async readFile(filePath: string) {
    if (filePath in files) {
      return files[filePath];
    }
    throw new Error(`Unknown file in Generator tests: ${filePath}`);
  },
  async writeFile(filePath: string, contents: string) {
    filesOut[filePath] = contents;
  },
  async unlink(filePath: string) {
    filesDeleted[filePath] = true;
  },
  async mkdir(dirPath: string) {
    dirsOut[dirPath] = true;
  },
  async stat(filePath: string) {
    if (filePath in files) {
      return files[filePath];
    }
    throw new Error(`Unknown file in Generator tests: ${filePath}`);
  },
  async readdir(): Promise<string[]> {
    return [ 'abc' ];
  },
}));

let container: any = {};
let followProgress: any;

jest.mock<typeof import('dockerode')>('dockerode', () => <any> jest.fn().mockImplementation(() => ({
  createContainer: jest.fn(() => container),
  pull: jest.fn(),
  modem: {
    followProgress,
  },
})));

jest.mock<typeof import('ldbc-snb-enhancer')>('ldbc-snb-enhancer', () => <any> ({
  runConfig: jest.fn(),
}));

jest.mock<typeof import('rdf-dataset-fragmenter')>('rdf-dataset-fragmenter', () => <any> ({
  runConfig: jest.fn(),
}));

jest.mock<typeof import('sparql-query-parameter-instantiator')>('sparql-query-parameter-instantiator', () => <any> ({
  runConfig: jest.fn(),
}));

jest.mock<typeof import('ldbc-snb-validation-generator')>('ldbc-snb-validation-generator', () => <any> ({
  runConfig: jest.fn(),
}));

jest.spyOn(process.stdout, 'write').mockImplementation();
jest.spyOn(process, 'chdir').mockImplementation();

jest.mock<typeof import('node:https')>('node:https', () => <any> ({
  request: jest.fn((_param, cb) => {
    cb({
      on: jest.fn(() => ({
        pipe: jest.fn(() => ({
          on: jest.fn(() => ({
            on: jest.fn((name, cbInner) => {
              cbInner();
            }),
          })),
        })),
      })),
    });
    return { end: jest.fn() };
  }),
}));

describe('Generator', () => {
  let generator: Generator;
  let mainModulePath: string;

  beforeEach(() => {
    files = {
      [join(__dirname, '../templates/params.ini')]: 'BLA SCALE BLA',
    };
    filesOut = {};
    filesDeleted = {};
    dirsOut = {};
    container = {
      start: jest.fn(),
      kill: jest.fn(),
      remove: jest.fn(),
      attach: jest.fn(() => ({
        pipe: jest.fn(),
        resume: jest.fn(),
        on: jest.fn((evt, cb) => {
          if (evt === 'end') {
            cb();
          }
        }),
      })),
    };
    mainModulePath = join(__dirname, '..');
    generator = new Generator({
      cwd: 'CWD',
      verbose: true,
      overwrite: true,
      scale: '0.1',
      enhancementConfig: 'enhancementConfig',
      fragmentConfig: 'fragmentConfig',
      queryConfig: 'queryConfig',
      validationParams: 'validationParams',
      validationConfig: 'validationConfig',
      hadoopMemory: '4G',
    });
    followProgress = jest.fn((buildStream: any, cb: any) => {
      cb();
    });
    jest.clearAllMocks();
  });

  describe('generateSnbDataset', () => {
    it('for a non-existing params.ini template', async() => {
      files = {};

      await expect(generator.generateSnbDataset()).rejects.toThrow('templates/params.ini');
    });

    it('for a valid state', async() => {
      await generator.generateSnbDataset();

      expect(filesOut[join('CWD', 'params.ini')]).toBe('BLA 0.1 BLA');
      expect(filesDeleted[join('CWD', 'params.ini')]).toBe(true);
      expect(container.start).toHaveBeenCalledTimes(1);
      expect(container.attach).toHaveBeenCalledTimes(1);
      expect(container.remove).toHaveBeenCalledTimes(1);
      expect(container.kill).not.toHaveBeenCalled();
    });

    it('for a valid state in non-verbose mode', async() => {
      generator = new Generator({
        cwd: 'CWD',
        verbose: false,
        overwrite: true,
        scale: '0.1',
        enhancementConfig: 'enhancementConfig',
        fragmentConfig: 'fragmentConfig',
        queryConfig: 'queryConfig',
        validationParams: 'validationParams',
        validationConfig: 'validationConfig',
        hadoopMemory: '4G',
      });

      await generator.generateSnbDataset();

      expect(filesOut[join('CWD', 'params.ini')]).toBe('BLA 0.1 BLA');
      expect(filesDeleted[join('CWD', 'params.ini')]).toBe(true);
      expect(container.start).toHaveBeenCalledTimes(1);
      expect(container.attach).toHaveBeenCalledTimes(1);
      expect(container.remove).toHaveBeenCalledTimes(1);
      expect(container.kill).not.toHaveBeenCalled();
    });

    it('when interrupted via SIGINT', async() => {
      let onError: any;
      jest.spyOn(process, 'on').mockImplementation(<any> ((evt: any, cb: any) => {
        if (evt === 'SIGINT') {
          setImmediate(() => cb());
          setImmediate(() => onError(new Error('container killed')));
        }
      }));
      jest.spyOn(container, 'attach').mockImplementation(() => ({
        pipe: jest.fn(),
        resume: jest.fn(),
        on: jest.fn((evt, cb) => { // Mock to keep container running infinitely
          if (evt === 'error') {
            onError = cb;
          }
        }),
      }));

      await expect(generator.generateSnbDataset()).rejects.toThrow('container killed');

      expect(filesOut[join('CWD', 'params.ini')]).toBe('BLA 0.1 BLA');
      expect(filesDeleted[join('CWD', 'params.ini')]).toBe(true);
      expect(container.kill).toHaveBeenCalledTimes(1);
    });

    it('when interrupted via SIGINT after container was already ended', async() => {
      let sigintCb: any;
      const sigintCalled = new Promise<void>((resolve) => {
        jest.spyOn(process, 'on').mockImplementation(<any> ((evt: any, cb: any) => {
          if (evt === 'SIGINT') {
            sigintCb = () => {
              cb();
              resolve();
            };
          }
        }));
      });
      jest.spyOn(container, 'attach').mockImplementation(() => ({
        pipe: jest.fn(),
        resume: jest.fn(),
        on: jest.fn((evt, cb) => { // Mock to keep container running infinitely
          if (evt === 'end') {
            cb();
            setImmediate(() => sigintCb());
          }
        }),
      }));

      await generator.generateSnbDataset();
      await sigintCalled;

      expect(filesOut[join('CWD', 'params.ini')]).toBe('BLA 0.1 BLA');
      expect(filesDeleted[join('CWD', 'params.ini')]).toBe(true);
      expect(container.remove).toHaveBeenCalledTimes(1);
      expect(container.kill).not.toHaveBeenCalled();
    });

    it('throws for an image pull failure', async() => {
      followProgress = jest.fn((buildStream: any, cb: any) => {
        cb(new Error('FAIL IMAGE PULL'));
      });

      await expect(generator.generateSnbDataset()).rejects.toThrow('FAIL IMAGE PULL');
    });
  });

  describe('enhanceSnbDataset', () => {
    it('should run the enhancer', async() => {
      await generator.enhanceSnbDataset();

      expect(dirsOut[join('CWD', 'out-enhanced')]).toBeTruthy();
      expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
    });
  });

  describe('fragmentSnbDataset', () => {
    it('should run the fragmenter twice', async() => {
      await generator.fragmentSnbDataset();

      expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
    });
  });

  describe('instantiateQueries', () => {
    it('should run the instantiator', async() => {
      await generator.instantiateQueries();

      expect(dirsOut[join('CWD', 'out-queries')]).toBeTruthy();
      expect(runQueryInstantiator)
        .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
    });
  });

  describe('generateValidation', () => {
    it('should run the validation generator', async() => {
      await generator.generateValidation();

      expect(dirsOut[join('CWD', 'out-validate')]).toBeTruthy();
      expect(runValidationGenerator)
        .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
    });
  });

  describe('generate', () => {
    describe('when overwrite is enabled', () => {
      it('should run all phases if directories do not exist yet', async() => {
        await generator.generate();

        expect(container.start).toHaveBeenCalledTimes(1);
        expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
        expect(runQueryInstantiator)
          .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
        expect(runValidationGenerator)
          .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
      });

      it('should skip phases with existing directories', async() => {
        files[join('CWD', 'out-snb')] = 'a';
        files[join('CWD', 'out-enhanced')] = 'a';
        files[join('CWD', 'out-fragments')] = 'a';
        files[join('CWD', 'out-queries')] = 'a';
        files[join('CWD', 'out-validate')] = 'a';

        await generator.generate();

        expect(container.start).toHaveBeenCalledTimes(1);
        expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
        expect(runQueryInstantiator)
          .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
        expect(runValidationGenerator)
          .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
      });
    });

    describe('when overwrite is disabled', () => {
      beforeEach(() => {
        generator = new Generator({
          cwd: 'CWD',
          verbose: true,
          overwrite: false,
          scale: '0.1',
          enhancementConfig: 'enhancementConfig',
          fragmentConfig: 'fragmentConfig',
          queryConfig: 'queryConfig',
          validationParams: 'validationParams',
          validationConfig: 'validationConfig',
          hadoopMemory: '4G',
        });
      });

      it('should run all phases if directories do not exist yet', async() => {
        await generator.generate();

        expect(container.start).toHaveBeenCalledTimes(1);
        expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
        expect(runQueryInstantiator)
          .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
        expect(runValidationGenerator)
          .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
      });

      it('should skip phases with existing directories', async() => {
        files[join('CWD', 'out-snb')] = 'a';
        files[join('CWD', 'out-enhanced')] = 'a';
        files[join('CWD', 'out-fragments')] = 'a';
        files[join('CWD', 'out-queries')] = 'a';
        files[join('CWD', 'out-validate')] = 'a';

        await generator.generate();

        expect(container.start).not.toHaveBeenCalled();
        expect(runEnhancer).not.toHaveBeenCalled();
        expect(runFragmenter).not.toHaveBeenCalled();
        expect(runFragmenter).not.toHaveBeenCalled();
        expect(runQueryInstantiator).not.toHaveBeenCalled();
        expect(runValidationGenerator).not.toHaveBeenCalled();
      });
    });
  });
});
