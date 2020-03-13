import { Tree, noop } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { ProjectConfigFile } from '../commons/configuration-files';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../test/collection.mock.json');
const collectionPathOriginal = path.join(__dirname, '../collection.json');

describe('nx-config-splitter', () => {
  const mockConfig: ProjectConfigFile = {
    angular: {
      project1: {
        angularThings: true
      }
    },
    nx: {
      project1: {
        nxThings: false
      }
    },
    tsconfig: {
      "@org/project1": ["org/project1/whatever"]
    }
  };

  let testTree: Tree;
  beforeEach(() => {
    testTree = Tree.empty();
    testTree.create('project.config.json', JSON.stringify(mockConfig));

    console.warn = noop;
  });

  it('should not see any matches', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    testTree.delete('project.config.json');

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (t) => expect(t).toBe(true)
    });
  });

  it('should smoke test original file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPathOriginal);
    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: () => expect(true).toBe(true)
    });
  });

  it('should generate new angular json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const angularBaseFile = {
      version: 1,
      projects: {},
    };
  
    testTree.create('angular.base.json', JSON.stringify(angularBaseFile));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('angular.json')).projects;
        
        expect(mockConfig.angular).toEqual(projectsGenerated);
      }
    });
  });

  it('should add new stuff to angular json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const angularBaseFile = {
      version: 1,
      projects: {
        someStuff: {},
      },
    };
  
    testTree.create('angular.base.json', JSON.stringify(angularBaseFile));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('angular.json')).projects;

        expect(projectsGenerated.someStuff).not.toBeUndefined();
        expect(mockConfig.angular).not.toEqual(projectsGenerated);
      }
    });
  });

  it('should create nx json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const nxBaseFile = {
      npmScope: 'scope',
      projects: {},
    };
  
    testTree.create('nx.base.json', JSON.stringify(nxBaseFile));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('nx.json')).projects;

        expect(mockConfig.nx).toEqual(projectsGenerated);
      }
    });
  });

  it('should add new stuff to nx json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const nxBaseFile = {
      npmScope: 'scope',
      projects: {
        someStuff: true
      },
    };
  
    testTree.create('nx.base.json', JSON.stringify(nxBaseFile));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('nx.json')).projects;

        expect(projectsGenerated.someStuff).not.toBeUndefined();
        expect(mockConfig.nx).not.toEqual(projectsGenerated);
      }
    });
  });

  it('should create tsconfig json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tsconfigBaseFile = {
      dummy: false,
      compilerOptions: {
        paths: {}
      },
    };
  
    testTree.create('tsconfig.base.json', JSON.stringify(tsconfigBaseFile));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('tsconfig.json')).compilerOptions.paths;

        expect(mockConfig.tsconfig).toEqual(projectsGenerated);
      }
    });
  });

  it('should add new stuff to tsconfig json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tsconfigBaseFile = {
      dummy: false,
      compilerOptions: {
        paths: {
          "@org/test": [
            "some/path"
          ]
        }
      },
    };
  
    testTree.create('tsconfig.base.json', JSON.stringify(tsconfigBaseFile));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('tsconfig.json')).compilerOptions.paths;

        expect(projectsGenerated["@org/test"]).not.toBeUndefined();
        expect(mockConfig.tsconfig).not.toEqual(projectsGenerated);
      }
    });
  });

  it('should overwrite nx json file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const nxBaseFile = {
      npmScope: 'scope',
      projects: {},
    };
  
    testTree.create('nx.base.json', JSON.stringify(nxBaseFile));
    testTree.create('nx.json', JSON.stringify({}));

    runner.runSchematicAsync('merge', {}, testTree).subscribe({
      next: (tree) => {
        const projectsGenerated = JSON.parse(tree.readContent('nx.json')).projects;

        expect(mockConfig.nx).toEqual(projectsGenerated);
      }
    });
  });
});
