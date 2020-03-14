[![Build Status](https://travis-ci.com/eliasdarruda/ngx-config-splitter.svg?branch=master)](https://travis-ci.com/eliasdarruda/ngx-config-splitter)
[![Coverage Status](https://coveralls.io/repos/github/eliasdarruda/nx-config-splitter/badge.svg?branch=master)](https://coveralls.io/github/eliasdarruda/nx-config-splitter?branch=master)

# What is this for?

This repository allows you to split your `angular.json`, `nx.json` and `tsconfig.json` into multiple files in many directories (apps, libs, etc). This is meant to avoid multiple lines of code on the same file and conflicts.

## Installation

```
npm install nx-config-splitter --save
```

## How does it work?

In your project root, you'll need to configure `*.base.json` files.

- `angular.base.json`
- `nx.base.json`
- `tsconfig.base.json`

Essentially, these files will be a copy of your current respective files. This base file is meant to hold everything that won't change adding a lib or an app, configurations and so on.

### **IMPORTANT:** To avoid further conflicts on the original files, you should put `tsconfig`, `nx` and `angular.json` file on `.gitignore`

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
  }
}
```

## **Finally**,

To concatenate everything run the schematic command:

```
ng generate nx-config-splitter:merge
```

I recommend you to run this command before any `serve`, `build`, `generate` command to ensure you'll always have your files updated.

## Adding `project.config.json` in your projects automatically

You need to use `writeProjectConfigFiles` function in a custom schematic after your lib/app generate schematic.

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
    writeProjectConfigFiles(schema, 'libs', 'tsconfig', 'compilerOptions.paths')
  ]);
}
```
