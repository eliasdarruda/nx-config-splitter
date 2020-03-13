import { Rule, Tree, noop } from '@angular-devkit/schematics';
import * as Path from 'path';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { CONFIG_FILE_NAME } from './constants';

export interface ProjectConfigFile {
  angular: any;
  nx: any;
  tsconfig: any;
  [key:string]: any;
}

export function addProjectConfigurationFiles(
  schema: any,
  rootDirectory: string,
  fileName: string,
  keyPath: string = ''
): Rule {
  const fileBase: ProjectConfigFile = {
    angular: {},
    nx: {},
    tsconfig: {}
  };

  return (tree: Tree) => {
    const resultPath = Path.join(rootDirectory, dasherize(schema.name));
    const projectFile = `${resultPath}/${CONFIG_FILE_NAME}`;
    const npmScope: string = JSON.parse(tree.read('nx.json') as any).npmScope;
    const fileContent: any = JSON.parse(tree.read(`${fileName}.json`) as any);

    let name = dasherize(schema.name).replace(/\//g, '-');

    let prj = fileContent.projects && fileContent.projects[name];
    if (keyPath) {
      const value = keyPath.split('.').reduce(function(a, b) {
        return a[b];
      }, fileContent);

      name = `@${npmScope}/${dasherize(schema.name)}`;
      prj = value[name];
    }

    if (tree.exists(projectFile)) {
      const projectContent: any = JSON.parse(tree.read(projectFile) as any);

      projectContent[fileName] = { [name]: prj };

      tree.overwrite(projectFile, JSON.stringify(projectContent, null, 2));
      return noop;
    }

    fileBase[fileName] = { [name]: prj };
    tree.create(projectFile, JSON.stringify(fileBase, null, 2));

    return noop;
  };
}
