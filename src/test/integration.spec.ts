import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { ProjectConfigFile } from '../commons/configuration-files';

const collectionPath = path.join(__dirname, './collection.mock.json');

describe('integration', () => {
  let testTree: Tree;
  beforeEach(() => {
    testTree = Tree.empty();

    console.warn = () => {};

    testTree.create('nx.json', JSON.stringify({ npmScope: 'org', projects: {
      project2: true
    } }));
    testTree.create('tsconfig.json', JSON.stringify(
      {
        compilerOptions: {
          paths: {
            "@org/project1": ["libs/ui-kit/src/index.ts"]
          }
        }
      }
    ));
    testTree.create('angular.json', JSON.stringify(
      {
        projects: {
          project2: {
            mock: true
          }
        }
      }
    ));
  });

  it('should write to tsconfig project config file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = runner.runSchematic('writer', {
      rootDirectory: 'libs',
      fileName: 'tsconfig',
      keyPath: 'compilerOptions.paths',
      name: 'project1'
    }, testTree);

    const data = JSON.parse(tree.read('libs/project1/project.config.json') as any) as ProjectConfigFile;

    expect(tree.exists('libs/project1/project.config.json')).toBe(true);
    expect(data.tsconfig["@org/project1"]).toEqual(["libs/ui-kit/src/index.ts"]);
  });

  it('should write to nx project config file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = runner.runSchematic('writer', {
      rootDirectory: 'apps',
      fileName: 'nx',
      keyPath: 'projects',
      name: 'project2'
    }, testTree);

    const data = JSON.parse(tree.read('apps/project2/project.config.json') as any) as ProjectConfigFile;

    expect(data.nx.project2).toBe(true);
  });

  it('should write to angular project config file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    const tree = runner.runSchematic('writer', {
      rootDirectory: 'apps',
      fileName: 'angular',
      name: 'project2'
    }, testTree);

    const data = JSON.parse(tree.read('apps/project2/project.config.json') as any) as ProjectConfigFile;

    expect(data.angular.project2.mock).toBe(true);
  });

  it('should write to existing angular project config file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);

    testTree.create('apps/project2/project.config.json', JSON.stringify({
      angular: {
        project1: {
          data: "FFFF"
        }
      },
      nx: {
        project2: {
          data: true
        }
      },
      tsconfig: {
        "@org/project2": ["org/project2/whatever"]
      }
    }));

    const tree = runner.runSchematic('writer', {
      rootDirectory: 'apps',
      fileName: 'angular',
      keyPath: 'projects',
      name: 'project2'
    }, testTree);

    const data = JSON.parse(tree.read('apps/project2/project.config.json') as any) as ProjectConfigFile;

    expect(data.angular.project2.mock).toBe(true);
    expect(data.nx.project2.data).toBe(true);
    expect(data.angular.project1).toBeUndefined();
  });
});
