import * as Path from 'path';

import { runConfig as runEnhancer } from 'ldbc-snb-enhancer';
import { runConfig as runValidationGenerator } from 'ldbc-snb-validation-generator';
import { runConfig as runFragmenter } from 'rdf-dataset-fragmenter';
import { runConfig as runQueryInstantiator } from 'sparql-query-parameter-instantiator';

import { Generator } from '../lib/Generator';

let files: Record<string, string> = {};
let filesOut: Record<string, string> = {};
let filesDeleted: Record<string, boolean> = {};
let dirsOut: Record<string, boolean> = {};
jest.mock('fs', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  ...<any>jest.requireActual('fs'),
  promises: {
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
  },
}));

let container: any = {};
let followProgress: any;
jest.mock('dockerode', () => jest.fn().mockImplementation(() => ({
  createContainer: jest.fn(() => container),
  pull: jest.fn(),
  modem: {
    followProgress,
  },
})));

jest.mock('ldbc-snb-enhancer', () => ({
  runConfig: jest.fn(),
}));

jest.mock('rdf-dataset-fragmenter', () => ({
  runConfig: jest.fn(),
}));

jest.mock('sparql-query-parameter-instantiator', () => ({
  runConfig: jest.fn(),
}));

jest.mock('ldbc-snb-validation-generator', () => ({
  runConfig: jest.fn(),
}));

jest.spyOn(process.stdout, 'write').mockImplementation();
jest.spyOn(process, 'chdir').mockImplementation();

jest.mock('https', () => ({
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
      [Path.join(__dirname, '../templates/params.ini')]: 'BLA SCALE BLA',
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
    mainModulePath = Path.join(__dirname, '..');
    generator = new Generator({
      cwd: 'CWD',
      verbose: true,
      overwrite: true,
      scale: '0.1',
      enhancementConfig: 'enhancementConfig',
      fragmentConfig: 'fragmentConfig',
      enhancementFragmentConfig: 'enhancementFragmentConfig',
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

      expect(filesOut[Path.join('CWD', 'params.ini')]).toEqual('BLA 0.1 BLA');
      expect(filesDeleted[Path.join('CWD', 'params.ini')]).toEqual(true);
      expect(container.start).toHaveBeenCalled();
      expect(container.attach).toHaveBeenCalled();
      expect(container.remove).toHaveBeenCalled();
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
        enhancementFragmentConfig: 'enhancementFragmentConfig',
        queryConfig: 'queryConfig',
        validationParams: 'validationParams',
        validationConfig: 'validationConfig',
        hadoopMemory: '4G',
      });

      await generator.generateSnbDataset();

      expect(filesOut[Path.join('CWD', 'params.ini')]).toEqual('BLA 0.1 BLA');
      expect(filesDeleted[Path.join('CWD', 'params.ini')]).toEqual(true);
      expect(container.start).toHaveBeenCalled();
      expect(container.attach).toHaveBeenCalled();
      expect(container.remove).toHaveBeenCalled();
      expect(container.kill).not.toHaveBeenCalled();
    });

    it('when interrupted via SIGINT', async() => {
      let onError: any;
      jest.spyOn(process, 'on').mockImplementation(<any> ((evt: any, cb: any) => {
        if (evt === 'SIGINT') {
          // eslint-disable-next-line @typescript-eslint/no-implied-eval
          setImmediate(cb);
          setImmediate(() => onError(new Error('container killed')));
        }
      }));
      container.attach = jest.fn(() => ({
        pipe: jest.fn(),
        resume: jest.fn(),
        on: jest.fn((evt, cb) => { // Mock to keep container running infinitely
          if (evt === 'error') {
            onError = cb;
          }
        }),
      }));

      await expect(generator.generateSnbDataset()).rejects.toThrow('container killed');

      expect(filesOut[Path.join('CWD', 'params.ini')]).toEqual('BLA 0.1 BLA');
      expect(filesDeleted[Path.join('CWD', 'params.ini')]).toEqual(true);
      expect(container.kill).toHaveBeenCalled();
    });

    it('when interrupted via SIGINT after container was already ended', async() => {
      let sigintCb: any;
      const sigintCalled = new Promise<void>(resolve => {
        jest.spyOn(process, 'on').mockImplementation(<any> ((evt: any, cb: any) => {
          if (evt === 'SIGINT') {
            sigintCb = () => {
              cb();
              resolve();
            };
          }
        }));
      });
      container.attach = jest.fn(() => ({
        pipe: jest.fn(),
        resume: jest.fn(),
        on: jest.fn((evt, cb) => { // Mock to keep container running infinitely
          if (evt === 'end') {
            cb();
            // eslint-disable-next-line @typescript-eslint/no-implied-eval
            setImmediate(sigintCb);
          }
        }),
      }));

      await generator.generateSnbDataset();
      await sigintCalled;

      expect(filesOut[Path.join('CWD', 'params.ini')]).toEqual('BLA 0.1 BLA');
      expect(filesDeleted[Path.join('CWD', 'params.ini')]).toEqual(true);
      expect(container.remove).toHaveBeenCalled();
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

      expect(dirsOut[Path.join('CWD', 'out-enhanced')]).toBeTruthy();
      expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
    });
  });

  describe('fragmentSnbDataset', () => {
    it('should run the fragmenter twice', async() => {
      await generator.fragmentSnbDataset();

      expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
      expect(runFragmenter).toHaveBeenCalledWith('enhancementFragmentConfig', { mainModulePath });
    });
  });

  describe('instantiateQueries', () => {
    it('should run the instantiator', async() => {
      await generator.instantiateQueries();

      expect(dirsOut[Path.join('CWD', 'out-queries')]).toBeTruthy();
      expect(runQueryInstantiator)
        .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
    });
  });

  describe('generateValidation', () => {
    it('should run the validation generator', async() => {
      await generator.generateValidation();

      expect(dirsOut[Path.join('CWD', 'out-validate')]).toBeTruthy();
      expect(runValidationGenerator)
        .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
    });
  });

  describe('generate', () => {
    describe('when overwrite is enabled', () => {
      it('should run all phases if directories do not exist yet', async() => {
        await generator.generate();

        expect(container.start).toHaveBeenCalled();
        expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('enhancementFragmentConfig', { mainModulePath });
        expect(runQueryInstantiator)
          .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
        expect(runValidationGenerator)
          .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
      });

      it('should skip phases with existing directories', async() => {
        files[Path.join('CWD', 'out-snb')] = 'a';
        files[Path.join('CWD', 'out-enhanced')] = 'a';
        files[Path.join('CWD', 'out-fragments')] = 'a';
        files[Path.join('CWD', 'out-queries')] = 'a';
        files[Path.join('CWD', 'out-validate')] = 'a';

        await generator.generate();

        expect(container.start).toHaveBeenCalled();
        expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('enhancementFragmentConfig', { mainModulePath });
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
          enhancementFragmentConfig: 'enhancementFragmentConfig',
          queryConfig: 'queryConfig',
          validationParams: 'validationParams',
          validationConfig: 'validationConfig',
          hadoopMemory: '4G',
        });
      });

      it('should run all phases if directories do not exist yet', async() => {
        await generator.generate();

        expect(container.start).toHaveBeenCalled();
        expect(runEnhancer).toHaveBeenCalledWith('enhancementConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('fragmentConfig', { mainModulePath });
        expect(runFragmenter).toHaveBeenCalledWith('enhancementFragmentConfig', { mainModulePath });
        expect(runQueryInstantiator)
          .toHaveBeenCalledWith('queryConfig', { mainModulePath }, { variables: expect.anything() });
        expect(runValidationGenerator)
          .toHaveBeenCalledWith('validationConfig', { mainModulePath }, { variables: expect.anything() });
      });

      it('should skip phases with existing directories', async() => {
        files[Path.join('CWD', 'out-snb')] = 'a';
        files[Path.join('CWD', 'out-enhanced')] = 'a';
        files[Path.join('CWD', 'out-fragments')] = 'a';
        files[Path.join('CWD', 'out-queries')] = 'a';
        files[Path.join('CWD', 'out-validate')] = 'a';

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
