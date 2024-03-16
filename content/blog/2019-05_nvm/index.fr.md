---
title: "Changer d'environnement Node.js"
authors: [ludovicwyffels]
date: 2019-05-07T14:37:53+02:00
summary: ""
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "Javascript"
  - "NVM"
---

Si vous travaillez sur plus d'un projet à la fois, travaillez beaucoup en open source ou si vous décidez de revenir à un projet que vous avez réalisé il y a un an, il y a de fortes chances pour que vous deviez changer de version de Node.js. Il se peut que quelques dépendances ne fonctionnent que sur une version de Node.js spécifique. Vous pouvez utiliser nvm pour changer vos versions de node.js en une seconde.

## Installation

Si vous n'avez pas déjà installé [NVM](https://github.com/nvm-sh/nvm). Téléchargez et installez la dernière version de NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Vérifiez votre version de nvm avec

```bash
nvm --version
```

## Installer un nouvelle version

Pour télécharger et installer une nouvelle version de Node.js, exécutez

```bash
nvm install 12.0
```

Remplacez 12.0 par le numéro de version dons vous avez besoin.

```bash
# Install the latest LTS (Long-Term Support)
nvm install --lts
# Install v4.9.1 = argon
nvm install --lts=argon
nvm install 4
# Install v6.17.1 = boron
nvm install --lts=boron
nvm install 6
# Install v8.16.0 = carbon
nvm install --lts=carbon
nvm install 8
# Install v10.16.0 = dubnium
nvm install --lts=dubnium
nvm install 10
# Install the latest version of node
nvm install node
```

## Lister les versions

Pour vérifier quelles version de Node.js sont installées sur votre système, exécutez

```bash
nvm ls .
```

Ceci listera toutes les versions que vous avez installées.

## Utiliser une version installé

Pour passer à n’importe quelle version de node.js , vous devez exécuter

```bash
nvm use v12.0.0
```

## Désinstaller une version

Si vous ne voulez pas de version particulière de Node.js, vous devez exécuter

```bash
nvm uninstall 12.0
```

## Alias

Vous pouvez définir la version par défaut de Node.js en définissant un alias.

```bash
nvm alias default 10.15.3
```

## Mettre à jour NPM

NVM ne vous permet pas de mettre à jour uniquement npm, mais uniquement une version node + npm. Mais il existe un moyen très simple de le faire:

```bash
nvm install-latest-npm
```

## Migration des packages global vers une autre version de node

Si vous souhaitez installer une nouvelle version de Node.js et migrer les packages npm à partir d'une version précédente:

```bash
nvm install node --reinstall-packages-from=node
```

Cela utilisera d’abord "nvm version node" pour identifier la version actuelle à partir de laquelle vous faites migrer les packages. Il résout ensuite la nouvelle version à installer à partir du serveur distant et l’installe. Enfin, il exécute "nvminstall-packages" pour réinstaller les packages npm de votre version précédente de Node vers la nouvelle.

Vous pouvez également installer et migrer des packages npm à partir de versions spécifiques de Node, comme suit:

```bash
nvm install 10 --reinstall-packages-from=8
```

## Automatiser le changement de version

Pour automatiser le changement de versio de Node.js, il existe un package npm qui s'appelle [AVN](https://github.com/wbyoung/avn) qui le permet

Maintenant quand vous faites `cd` dans un répertoire avec un fichier `.node-version`, avn détectera automatiquement le changement et utilisera votre gestionnaire de version installé pour passer à cette version de node. Que contient votre fichier `.node-version`? Un numéro de version [semver](https://semver.org/) correspondant à la version de Node.js que votre projet utilise.
