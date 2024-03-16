---
title: "Mocking des classes ES6 dans les tests unitaires"
authors: [ludovicwyffels]
date: 2019-05-11T19:34:50+02:00
summary: ""
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "Sequelize"
  - "JavaScript"
---

Cet article passe en revue certains modèles pouvant être utilisés pour tester les classes ES6.

Les exemples utiliseront l'auto-mocking du module Jest mais devraient être portables à d'autres bibliothèques de mocking de module (par exemple Proxyquire) avec quelques modifications.

Dans [cet article](/node-sequelize-classes), nous avons exploré comment définir des modèles Sequelize en utilisant des classes ES6. Un des avantages d'une telle approche est qu'elle permet des tests unitaires faciles, elle permet d'instancier le modèle sans le bagage de toute Sequelize (et/ou une base de données).

Nous allons tester le modèle suivant (qui est une classe ES6):

```js
const { Model } = require('sequelize');
class MyModel extends Model {
  static init() {
    return super
      .init
      // Config, see "Using ES6 classes for Sequelize 4 models"
      ();
  }
  isAvailable(date) {
    if (!Array.isArray(this.meetings)) {
      throw new Error('meetings should be eager-loaded');
    }
    return !this.meetings.find(({ startDate, endDate }) => startDate < date && endDate > date);
  }
}
```

Au niveau des modules, nous le voulons:

- mock/stub Sequelize (et la classe de base `Model`)
- importer le modèle

Dans le test:

- Instantaner le modèle que nous avons défini (sans crash)
- Définissez quelques propriétés sur cette instance
- Exécuter certaines méthodes
- Affirmer sur le rendement

```js
jest.mock('sequelize');
const Model = require('./model');
test('It should not throw when passed a model containing an empty list of meetings', () => {
  const model = new Model();
  model.meetings = [];
  expect(model.isAvailable.bind(null, new Date(Date.now())).not.toThrow();
});
```

## Alternative avec `Object.assign`

Si nous définissons plus d'une propriété d'instance unique, l'utilisation de Object.assign peut être plus simple à gérer:
```js
jest.mock('sequelize');
const Model = require('./model');
test('It should not throw when passed a model containing an empty list of meetings', () => {
  const model = Object.assign(
    new Model(),
    {
      meetings: []
    }
  );
  expect(model.isAvailable.bind(null, new Date(Date.now())).not.toThrow();
});
```
