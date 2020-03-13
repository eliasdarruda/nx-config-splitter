import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function nxProjectSplitter(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    return tree;
  };
}
