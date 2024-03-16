---
title: "Utilisation des classes ES6 pour les modèles Sequelize 4 ou 5"
authors: [ludovicwyffels]
date: 2019-05-10T18:09:54+02:00
summary: "Sequelize supporte les classe ES6, mais la documentation manque un peu."
draft: false
categories: ["Node.js", "Sequelize"]
tags:
  - "Node.js"
  - "Sequelize"
  - "Javascript"
---

La spécification ES2015 ou ES6 a introduit la `class` en JavaScript. Des bibliothèques telles que React sont passées de `React.createClass` à la `class MyComponent extends React.Component`, c'est-à-dire qu'ils sont passés de l'utilisation de leur propre constructeur à l'utilisation d'un langage intégré pour transmettre l'intention du programmeur.

Pour la couche de persistance d'une application Web Node.js, quelques bases de données me viennent à l'esprit, comme [MongoDB](https://www.mongodb.com/) (éventuellement associé à [mongoose](https://mongoosejs.com/)), ou une association de clés-valeurs comme [Redis](https://redis.io/).

Pour exécuter une base de données relationnelle avec une application Node, [Sequelize](http://docs.sequelizejs.com/) , "Un ORM de dialecte multi-SQL facile à utiliser pour Node.js" est une bonne option. Il permet à l'application de fonctionner avec une instance MySQL ou PostgreSQL et offre un moyen simple de mapper la représentation des entités dans la base de données vers JavaScript et inversement.

Les API v4 et inférieure de Sequelize pour les définitions de modèle se présentent comme suit:

```js
const MyModel = sequelize.define('MyModel', {
  // fields and methods
});
```

Pour ajouter des méthodes de classes et d'instance, vous devez écrire ce qui suit:

```js
// Class Method
MyModel.associate = function (models) {};
// Instance Method
MyModel.prototype.someMethod = function () {..}
```

Cela est nécessaire avant l’ES6 car il n’existait pas de notion d’héritage classique. Maintenant, nous avons les classes, pourquoi ne pas les exploiter? Pour les développeurs habitués à avoir des classes, les éléments suivants vous sembleront probablement familiers:

```js
class MyModel extends Sequelize.Model {
  static associate(models) {}
  someMethod() {}
}
```

Sequelize supporte réellement cela, mais la documentation manque un peu. L'un des seuls endroits où trouver une référence à la procédure à suivre est dans un numéro de GitHub: https://github.com/sequelize/sequelize/issues/6524.

Voici un aide-mémoire sur ce que vous souhaitez faire et comment le réaliser à l'aide de la classe ES6 + héritage de `Sequelize.Model`:

- [Initialiser le modèle avec le ou les champs saisis](#initialiser-le-modèle-avec-le-ou-les-champs-saisis)
- [Associez votre modèle à d'autres modèles](#associez-votre-modèle-à-dautres-modèles)
- [Définition d'un nom de table personnalisé pour votre modèle](#définition-dun-nom-de-table-personnalisé-pour-votre-modèle)
- [Définition d'un nom de modèle personnalisé pour votre modèle (pour Sequelize)](#définition-dun-nom-de-modèle-personnalisé-pour-votre-modèle-pour-sequelize)
- [Les requêtes](#les-requêtes)
- [Méthodes d'instance](#méthodes-dinstance)
- [Initialisez tous vos modèles](#initialisez-tous-vos-modèles)

## Initialiser le modèle avec le ou les champs saisis

```js
const Sequelize = require('sequelize');
class MyModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        myField: DataTypes.STRING,
      },
      { sequelize },
    );
  }
}
```

## Associez votre modèle à d'autres modèles

```js
const Sequelize = require('sequelize');
class MyModel extends Sequelize.Model {
  static associate(models) {
    this.myAssociation = this.belongsTo(models.OtherModel);
    // or
    this.myAssociation = models.MyModel.belongsTo(models.OtherModel);
  }
}
```

## Définition d'un nom de table personnalisé pour votre modèle

```js
const Sequelize = require('sequelize');
class MyModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        // field definitions
      },
      {
        tableName: 'myModels',
        sequelize,
      },
    );
  }
}
```

## Définition d'un nom de modèle personnalisé pour votre modèle (pour Sequelize)

```js
const Sequelize = require('sequelize');
class MyModel extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        // field definitions
      },
      {
        modelName: 'myModel',
        sequelize,
      },
    );
  }
}
```

## Les requêtes

```js
const Sequelize = require('sequelize');
class MyModel extends Sequelize.Model {
  static getId(where) {
    return this.findOne({
      where,
      attributes: ['id'],
      order: [['createdAt', 'DESC']],
    });
  }
}
```

## Méthodes d'instance

```js
const Sequelize = require('sequelize');
class MyModel extends Sequelize.Model {
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

## Initialisez tous vos modèles

`require()` suivi de `model.init()` est une alternative à `sequelize.import(path)`, il est un peu plus clair ce qui est importé et non importé et sous quel nom.

```js
const Sequelize = require('sequelize');
const sequelize = new Sequelize();
// pass your sequelize config here
const FirstModel = require('./first-model');
const SecondModel = require('./second-model');
const ThirdModel = require('./third-model');
const models = {
  First: FirstModel.init(sequelize, Sequelize),
  Second: SecondModel.init(sequelize, Sequelize),
  Third: ThirdModel.init(sequelize, Sequelize),
};
// Run `.associate` if it exists,
// ie create relationships in the ORM
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));
const db = {
  ...models,
  sequelize,
};
module.exports = db;
```
