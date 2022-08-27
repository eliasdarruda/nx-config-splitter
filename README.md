[![Build Status](https://travis-ci.com/eliasdarruda/ngx-config-splitter.svg?branch=master)](https://travis-ci.com/eliasdarruda/ngx-config-splitter)
[![Coverage Status](https://coveralls.io/repos/github/eliasdarruda/nx-config-splitter/badge.svg?branch=master)](https://coveralls.io/github/eliasdarruda/nx-config-splitter?branch=master)

# What is this for?

This repository allows you to split your `angular.json`, `workspace.json`, `nx.json` and `tsconfig.json` into multiple files in many directories (apps, libs, etc). This is meant to avoid multiple lines of code on the same file and conflicts.

### Package deprecated for NX v12+, you should take advantage of the builtin project.json splitting from NX.
### For angular apps, this will become deprecated when this is merged https://github.com/angular/angular-cli/issues/22655

## Installation

```
npm install nx-config-splitter --save
```

## How does it work?

In your project root, you'll need to configure `*.base.json` files.

- `angular.base.json`
- `workspace.base.json` - only if needed
- `nx.base.json`
- `tsconfig.base.json`

Essentially, these files will be a copy of your current respective files. This base file is meant to hold everything that won't change adding a lib or an app, configurations and so on.

### **IMPORTANT:** To avoid further conflicts on the original files, you should put `tsconfig.json`, `nx.json` and `angular.json` files on `.gitignore`

After configuring base files, you'll need to create inside the lib/app directory a file called `project.config.json`, if your lib is called **ui-kit**, then here's a example of a `project.config.json` for your lib

```
{
  "angular": {
    "ui-kit": {
      // angular.json stuff inside 'projects'
    }
  },
  "nx": {
    "ui-kit: { "tags": [] }
  },
  "tsconfig": {
    // stuff inside `compilerOptions.paths`
    "@org/ui-kit": [ "paths/ui-kit/index" ]
  },
  workspace: {
    "ui-kit": {
      // workspace.json stuff inside 'projects'
    }
  }
}
```

Note that `workspace` key is used only on NX non-angular projects, if your project doesn't use `angular.json` file, you should leave the `angular` key empty as: angular: {},

## **Finally**,

To concatenate every `project.config.json` into `nx.json`, `workspace.json`, `angular.json` and `tsconfig.json` files run the schematic command:

```
schematics nx-config-splitter:merge
```
**NOTE**: if you don't have schematics installed, add `@angular-devkit/schematics` to your package dependencies

I recommend you to run this command before any `serve`, `build`, `generate` command to ensure you'll always have your configuration files updated.

## Adding `project.config.json` in your projects automatically

You need to use `writeProjectConfigFiles` function in a custom schematic after your lib/app generate schematic.

Note that this is based on a custom schematic provided by NX, you can read more about it here: https://auth0.com/blog/create-custom-schematics-with-nx/



```TYPESCRIPT
import { writeProjectConfigFiles } from 'nx-config-splitter';

function writeProjectConfigFiles(
  schema: any,
  rootDirectory: string,
  fileName: string,
  keyPath: string = 'projects'
)

export default function(schema: any): Rule {
  return chain([
    externalSchematic('@nrwl/angular', 'lib', {
      name: schema.name
    }),
    writeProjectConfigFiles(schema, 'libs', 'nx'),
    // If it is for app schematic use 'apps' folder
    writeProjectConfigFiles(schema, 'apps', 'angular', 'projects'),
    writeProjectConfigFiles(schema, 'libs', 'tsconfig', 'compilerOptions.paths'),

    // For nx-react projects
    writeProjectConfigFiles(schema, 'apps', 'workspace', 'projects'),
  ]);
}
```
