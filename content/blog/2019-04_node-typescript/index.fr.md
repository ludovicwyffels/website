---
title: "Comment écrire des applications Node.js en TypeScript"
authors: [ludovicwyffels]
date: 2019-04-27T19:24:19+02:00
summary: ""
draft: false
categories: ["Node.js", "TypeScript"]
tags:
  - "Node.js"
  - "TypeScript"
  - "JavaScript"
---

Depuis que j'ai découvert TypeScript, je l'utilise pour toutes mes applications JavaScript. Il y a tellement d'avantages à utiliser TypeScript que vous aurez besoin d'un argument convaincant pour me permettre d'écrire quoi que ce soit en JavaScript Vanilla.

Dans cet article, je vais vous montrer comment configurer un environnement de développement simple pour écrire une application Node.js en TypeScript.

---

Permettez-moi de commencer par dire qu'il existe probablement un millier de façons différentes de créer des applications Node.js en TypeScript. Je vais juste montrer la façon dont j'aime le faire moi-même.

Si vous n'avez pas envie de lire tout cet article, vous pouvez trouver mon projet de démarrage ici: https://github.com/toxsickcoder/node-typescript-starter . Il contient des fonctionnalités supplémentaires dont nous ne discuterons pas dans cet article.

## Package.json

Comme je l'ai déjà dit, il y a beaucoup de façons différentes de le faire. J'aime utiliser Webpack pour mes projets TypeScript. Commençons par créer un `package.json`.

Vous pouvez générer un `package.json` à l'aide de la commande `npm init` ou copier-coller le code ci-dessous et le modifier.

```json
// package.json
{
  "name": "node-typescript",
  "version": "0.0.1",
  "author": "Ludovic Wyffels",
  "license": "MIT",
  "scripts": {},
  "dependencies": {},
  "devDependencies": {}
}
```

Commençons par une simple configuration Webpack pour un projet JavaScript Node.js. Après avoir terminé la configuration de base, j'ajouterai TypeScript.

## L'application

Comme mentionné précédemment, nous allons commencer par une application JavaScript, puis convertir celle-ci en TypeScript. Créons un répertoire `src/` avec un `main.js` et `information-logger.js` avec certaines fonctionnalités de Node.js:

```js
// src/information-logger.js
const os = require('os');
const { name, version} = require('../package.json');
module.exports = {
  logApplicationInformation: () =>
    console.log({
      application: {
        name,
        version,
      },
    }),
  logSystemInformation: () =>
    console.log({
      system: {
        platform: process.platform,
        cpus: os.cpus().length,
      },
    }),
};
```

```js
// src/main.js
const informationLogger = require('./information-logger');
informationLogger.logApplicationInformation();
informationLogger.logSystemInformation();
```

Ce script de base enregistre certaines informations d’application et système sur la console. Je peux voir la sortie suivante après avoir exécuté le `node main.js`

```js
{ application: { name: 'node-typescript', version: '0.0.1' } }
{ system: { platform: 'linux', cpus: 8 } }
```

## Webpack

La première chose à faire avant d’utiliser Webpack est d’installer les dépendances nécessaires. N'oubliez pas d'utiliser l'indicateur `-D` car il s'agit de devDependencies.

```bash
npm i -D webpack webpack-cli
```

Vous avez peut-être remarqué que je n'ai pas installé _webpack-dev-server_. C'est parce que nous créons une application Node.js. Plus tard, je vais utiliser nodemon qui a le même objectif.

### webpack.config.js

La prochaine étape consiste à créer un fichier `webpack.config.js` où nous indiquerons à Webpack comment il doit traiter notre code.

```js
// webpack.config.js
'use strict';
module.exports = (env = {}) => {
  const config = {
    entry: ['./src/main.js'],
    mode: env.development ? 'development' : 'production',
    target: 'node',
    devtool: env.development ? 'cheap-eval-source-map' : false,
  };
  return config;
};
```

Comme vous pouvez le constater, il ne faut pas grand-chose pour commencer avec Webpack. Les deux seules options requises sont _entry_ et _target_. Nous déclarons notre point d’entrée à l’aide du champ _entry_ et nous informons Webpack que nous travaillons dans Node.js avec le champ _target_.

Nous pouvons utiliser le champ _mode_ pour indiquer à Webpack qu'il doit se concentrer sur la vitesse de compilation (développement), ou sur l'obfuscation et la minification (production). Pour faciliter le débogage, nous utilisons le champ _devtool_ pour indiquer que nous voulons des _sources maps_ si nous nous exécutons en développement. De cette façon, s'il y a une erreur, nous pouvons facilement trouver l'endroit où elle s'est produite dans notre code.

Pour utiliser Webpack, nous allons créer quelques commandes npm:

```json
// package.json
...  
  "scripts": {
    "start": "webpack --progress --env.development",
    "start:prod": "webpack --progress"
  },
...
```

Nous pouvons maintenant construire notre application en exécutant l'une ou l'autre de ces commandes. Il créera un répertoire `dist/` avec le fichier de sortie `main.js` à l'intérieur.

Notre projet devrait ressembler à ceci maintenant:

```text
dist/
  main.js
node_modules/
src/
  information_logger.js
  main.js
package-lock.json
package.json
webpack.config.js
```

### nodemon

Vous avez peut-être remarqué qu'après l'exécution d'une commande de démarrage, Webpack s'arrête après la construction de l'application. Il ne surveille pas les modifications de fichiers que nous apportons. Et puisque nous travaillons avec Node.js, nous ne pouvons pas utiliser le serveur `webpack-dev-server`.

Heureusement, nous pouvons utiliser **nodemon** pour résoudre ce problème. C'est un outil spécialement conçu à cet effet: redémarrer les applications Node.js pendant le développement.

Commençons par installer le _nodemon-webpack-plugin_. N'oubliez pas le flag `-D` car c'est une devDependency.

```bash
npm i -D nodemon-webpack-plugin
```

Créons un nouveau flag _nodemon_ et ajoutons le plug-in à notre fichier `webpack.config.js`.

```js
// webpack.config.js
'use strict';
const NodemonPlugin = require('nodemon-webpack-plugin');
module.exports = (env = {}) => {
  const config = {
    entry: ['./src/main.js'],
    mode: env.development ? 'development' : 'production',
    target: 'node',
    devtool: env.development ? 'cheap-eval-source-map' : false,  
    resolve: { // tells Webpack what files to watch.
      modules: ['node_modules', 'src', 'package.json'],
    },   
    plugins: [] // required for config.plugins.push(...);
  };
  if (env.nodemon) {
    config.watch = true;
    config.plugins.push(new NodemonPlugin());
  }
  return config;
};
```

Lorsque nous passerons le flag nodemon, nous définirons la configuration de la surveillance Webpack et nous ajouterons le plug-in nodemon . La configuration de la surveillance Webpack reconstruira l’application lorsque nous modifierons un fichier. Le plug-in nodemon redémarrera l'application une fois la reconstruction terminée.

Nous devrons également mettre à jour nos commandes npm. J'ai également créé des commandes de construction, sans le flag _nodemon_.

```json
// package.json
...
  scripts: [
    "start": "webpack --progress --env.development --env.nodemon",
    "start:prod": "webpack --progress --env.nodemon",
    "build": "webpack --progress --env.development",
    "build:prod": "webpack --progress",
    "build:ci": "webpack"
  ],
...
```

Voilà, une configuration de base Webpack pour l'application Node.js. La prochaine étape est d'ajouter TypeScript!

## TypeScript

Et maintenant, au moment que nous attendions tous, ajoutons TypeScript! Commençons par installer les dépendances dont nous avons besoin.

S'agissant d'un projet Node.js, nous devons également installer les typings associés. Je travaille sur la version LTS de Node.js, la version 10. C'est pourquoi la version `^10.0.0` de `@types/node`.

```bash
npm i -D typescript ts-loader @types/node@^10.0.0
```

### ts-loader

Nous allons utiliser le plug-in Webpack _ts-loader_ pour compiler notre TypeScript. Pour ce faire, nous devons dire à Webpack de traiter les fichiers TypeScript avec le plug-in _ts-loader_.

Nous devons modifier notre extension de fichier d' entrée en `.ts` et indiquer à Webpack qu'il doit également résoudre les fichiers _.ts_ (Webpack ne fonctionne qu'avec les fichiers `.js` par défaut).

```js
// webpack.config.js
...
  const config = {
    entry: ['./src/main.ts'],
    mode: env.development ? 'development' : 'production',
    target: 'node',
    devtool: env.development ? 'cheap-eval-source-map' : false,
    resolve: {
      // Tells Webpack what files to watch      
      extensions: ['.ts', '.js'],
      modules: ['node_modules', 'src', 'package.json'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
        },
      ],
    },
    plugins: [], // Required for config.plugins.push(...);
  };
...
```

### tsconfig.json

Si nous essayons d'exécuter notre application maintenant, elle se plantera. Il nous manque encore un fichier tsconfig.json. Alors créons-en un.

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "node",
    "lib": ["dom", "es2018"],
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "removeComments": true,    
    "resolveJsonModule": true,
    "strict": true,
    "typeRoots": ["node_modules/@types"]
  },
  "exclude": ["node_modules"],
  "include": ["src/**/*.ts"]
}
```

Je préfère les fichiers tsconfig stricts, comme vous pouvez le voir ci-dessus. Tu n'as pas à faire ça. J'aime également définir une cible élevée (_esnext_ ou _es2018_) car Node.js offre un excellent support pour les nouvelles fonctionnalités JavaScript.

## L'application

Nous devons toujours changer l'extension des fichiers JavaScript de `.js` à `.ts`. Faisons-le et essayons de lancer le projet.

Après avoir exécuté le projet, nous pouvons immédiatement constater que nous avons commis une "erreur" dans l'application de test que nous avons créée. Nous ne pouvons pas déstructurer notre champ _name_ du package.json car il est déjà défini ou nous l'écraserions. Faisons donc quelques modifications pour créer les fichiers.

```ts
// information-logger.ts
import os from 'os';
import { name, version } from '../package.json';
export class InformationLogger {
  static logApplicationInformation(): void {
    console.log({
      application: {
        name,
        version,
      },
    });
  }
  static logSystemInformation(): void {
    console.log({
      system: {
        platform: process.platform,
        cpus: os.cpus().length,
      },
    });
  }
}
// main.ts
import { InformationLogger } from './information-logger';
InformationLogger.logApplicationInformation();
InformationLogger.logSystemInformation();
```

Si vous avez tout suivi, voici à quoi devrait ressembler notre structure de projet:

```text
dist/
  main.js
node_modules/
src/
  information-logger.ts
  main.ts
package-lock.json
package.json
tsconfig.json
webpack.config.js
```

Et nous sommes prêts à écrire des applications Node.js en TypeScript!

## Note finale

Je suis sûr qu'il existe des milliers de façons différentes d'écrire des applications Node.js dans TypeScript. Ce n'est en aucun cas la façon dont vous devriez le faire, c'est une façon de le faire.

Les prochaines étapes pourraient être l’intégration de TSLint, l’ajout d’un fichier Docker, la configuration d’un pipeline CI...
