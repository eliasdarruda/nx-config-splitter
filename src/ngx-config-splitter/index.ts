import { SchematicContext, Tree } from '@angular-devkit/schematics';
import * as glob from 'glob';
import { ProjectConfigFile, indexObj } from '../commons';

const ignore = [
  '**/node_modules/**',
  '**/dist/**'
];

const configurationFiles = [
  {
    name: 'angular',
    key: 'projects'
  },
  {
    name: 'nx',
    key: 'projects'
  },
  {
    name: 'tsconfig',
    key: 'compilerOptions.paths'
  }
];

const projects: ProjectConfigFile = {
  angular: {},
  nx: {},
  tsconfig: {}
};

const projectConfigName = 'project.config.json';
const baseSuffix = '.base.json';

const matchesHandler = (tree: Tree, resolve: any) => {
  return (_: any, matches: string[]) => {
    if (!matches || !matches.length) {
      return resolve(tree);
    }

    configurationFiles.forEach(c => {
      if (!tree.exists(c.name + baseSuffix)) {
        console.warn(`Missing ${c.name + baseSuffix} file`);
        return;
      }

      const baseBuffer = tree.read(c.name + baseSuffix);
      const baseObj = JSON.parse(baseBuffer as any);
      
      projects[c.name] = indexObj(baseObj, c.key);

      matches.forEach(m => {
        let matchBuffer = tree.read(m);
        const project = JSON.parse(matchBuffer as any);

        projects[c.name] = { ...projects[c.name], ...project[c.name] };
      });
      
      indexObj(baseObj, c.key, projects[c.name]);

      if (tree.exists(`${c.name}.json`)) {
        tree.overwrite(`${c.name}.json`, JSON.stringify(baseObj, null, 2));
      } else {
        tree.create(`${c.name}.json`, JSON.stringify(baseObj, null, 2));
      }
    });

    return resolve(tree);
  }
}

export function nxProjectSplitter(_options: any) {
  return (tree: Tree, _context: SchematicContext) =>
    new Promise((resolve) => 
      glob(`{*/**/${projectConfigName},*${projectConfigName}}`, { ignore }, matchesHandler(tree, resolve))
    )
}

export function nxProjectSplitterMock(_options: any) {
  return (tree: Tree, _context: SchematicContext) =>
    new Promise((resolve) => {
      const entries = tree.root.subfiles.filter(f => f.indexOf('project.config.json') > -1);
      matchesHandler(tree, resolve)(null, entries);
    })
}
