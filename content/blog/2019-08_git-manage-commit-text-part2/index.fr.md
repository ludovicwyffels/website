---
title: "Bien gérer ses textes de commit (partie 2)"
authors: [ludovicwyffels]
date: 2019-08-11T18:07:08+02:00
summary: "Mettons en place l'application de la norme \"conventional-changelog\" pour un nouveau projet"
draft: false
categories: ["Git"]
tags:
  - "Git"
series: ["Bien gérer ses textes de commit"]
series_order: 2
---

Nous sommes tous passés par là. Qu'il s'agisse d'un calendrier serré, de corrections constantes ou simplement de la création de messages avec notre propre modèle défini; nous avons tous fait de mauvais messages de commit. Heureusement pour nous, la spécification Conventional Commits existe, et avec elle un ensemble d'outils puissants pour nous aider.

## Application d'une norme

Pour faire respecter une norme à chaque fois que nous nous faisons un commit, nous avons [husky](https://github.com/typicode/husky) et [commitling](https://github.com/conventional-changelog/commitlint). Husky écoute les git hooks, et nous l'utiliserons pour déclencher le commitlint lorsque nous tapons un message de commit. Maintenant, installons les paquets :

```bash
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional
```

Après avoir installé ces paquets, vous devez créer un fichier **commitlint.config.js** dans le même dossier que votre package.json :

```js
module.exports = {
  extends: ['@commitlint/config-conventional']
};
```

Et modifier votre package.json:

```json
{
  ...,
  "husky": {
    "hooks": {
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
     }
  }
}
```

Tout est prêt! Maintenant, vos messages seront linted.

## Nous les commitons avec commitizen

[Commitizen](https://github.com/commitizen/cz-cli) est un paquet qui facilite la création de messages de commit selon la spécification précédente. Pour ce faire, vous devez l'installer globalement et configurer votre projet.

```bash
npm install --global commitizen

# Inside your project
commitizen init cz-conventional-changelog --save-dev --save-exact
```

Maintenant, faites un changement, ajoutez-le et lancez `git cz`.

---

## Automatisation

Nous avons ajouté des outils pour assurer et faciliter la validation des messages de commit selon les spécifications conventionnelles de commit. Non seulement nous avons reçu des messages standard sur l'ensemble du projet que les humains peuvent lire, mais aussi des machines. Oui, des machines. Le respect de ces normes a permis aux machines de comprendre le motif, et avec cela, de mettre à jour automatiquement la version de nos paquets et de générer des changelogs.

### Version bumping et CHANGELOG

Pour faire les deux actions, nous n'avons besoin que d'un seul paquet, `standard-version`. Ce paquet le fera:

1. Analyser vos engagements depuis votre dernière version (tag)
2. Version bump votre paquet.json
3. Générer ou mettre à jour un fichier CHANGELOG.md
4. Générer un message de livraison
5. Générer une nouvelle balise

Utilisons-la donc :

```bash
npm install --save-dev standard-version
```

Mettez à jour votre paquet.json :

```json
{
  ...,
  "scripts": {
    "release": "standard-version"
  }
}
```

Et maintenant vous n'avez plus qu'à lancer `npm run release`.

> Alternativement, si vous souhaitez simplement générer un fichier changelog, je vous recommande le fichier [conventionnel-changelog-cli](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-cli).

---

## Quelle est la prochaine étape?

Après avoir gagné en lisibilité et en automatisation des tâches quotidiennes douloureuses, vous pouvez créer votre propre standard basé sur les spécifications conventionnelles de commit. La famille d'outils conventionnel-changelog vous permet et vous facilite la création de votre propre version si vous le souhaitez.

J'espère que ce message vous a aidé. S'il y a quoi que ce soit, partagez de l'information qui pourrait l'améliorer et la rendre meilleure pour les autres!
