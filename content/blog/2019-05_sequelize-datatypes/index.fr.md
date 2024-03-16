---
title: "Sequelize DataTypes: guide pratique"
authors: [ludovicwyffels]
date: 2019-05-10T09:03:17+02:00
summary: "Les DataTypes sont au coeur de la bibliothèque Sequelize. Ceci est un guide pratique et complet pour compenser la documentation officielle clairsemée de Sequelize sur le sujet."
draft: false
categories: ["Node.js", "Sequelize"]
tags:
  - "Node.js"
  - "Sequelize"
  - "Javascript"
---

Les DataTypes sont au coeur de la bibliothèque Sequelize. Ceci est un guide pratique et complet pour compenser la documentation officielle clairsemée de Sequelize sur le sujet.

Tout d’abord, DataTypes contient à la fois les types et les générateurs pour les valeurs par défaut: `NOW` , `UUIDV1` et `UUIDV4` sont des valeurs par défaut spéciales.

Les endroits où vous êtes susceptible de rencontrer des DataTypes se trouvent dans la définition du champ de modèle et dans les définitions de migration. Notez que pour un modèle et un champ donnés, le type de données doit être identique dans le modèle et dans la migration.

---

## Types de texte

- `STRING`
  - Une chaîne de longueur variable.
  - Longueur par défaut 255.
  - Prend en charge `BINARY`
  - Utilisation: une chaîne binaire de 100 longueurs `DataTypes.STRING(100).BINARY`
- `CHAR`
  - Une chaîne de longueur fixe.
  - Longueur par défaut 255.
  - Prend en charge `BINARY`
  - Utilisation: un caractère binaire de 100 longueurs `DataTypes.CHAR(100).BINARY`
- `TEXT` : une colonne de texte de longueur illimitée

<a name="default-values"></a>

## Les valeurs par défaut

- `NOW` : une valeur par défaut de l'horodatage actuel
- `UUIDV1` : Un identifiant universel unique par défaut généré conformément à la norme UUID v1
- `UUIDV4` : Un identifiant universel unique par défaut généré conformément à la norme UUID v2

## Nombre

Tous les éléments suivants prennent en charge ces propriétés: `UNSIGNED`, `ZEROFILL`.

Par exemple:

```js
DataTypes.INTEGER.UNSIGNED.ZEROFILL;
// or
DataTypes.INTEGER.ZEROFILL.UNSIGNED;
```

La même chose peut être faite en utilisant `BIGINT.UNSIGNED`, `FLOAT.UNSIGNED`,...

- `INTEGER`: Un entier de 32 bits.
- `BIGINT`: Un entier de 64 bits.
- `FLOAT`: nombre à virgule flottante (précision sur 4 octets). Accepte un ou deux arguments de précision
- `REAL`: nombre à virgule flottante (précision sur 4 octets). Accepte un ou deux arguments de précision
- `DOUBLE`: nombre à virgule flottante (précision sur 8 octets). Accepte un ou deux arguments de précision
- `DECIMAL`: nombre décimal. Accepte un ou deux arguments de précision

## Types primitifs fantaisie

- `BOOLEAN`: colonne booléenne / tinyint qui est forcée de devenir un booléen JavaScript.
- `UUID`: Une colonne contenant un identifiant universel unique, la forme est validée, à utiliser avec les valeurs par défaut `UUIDV1` ou `UUIDV4`

## Date/heure

- `TIME`: une colonne de temps
- `DATE`: une colonne datetime
- `DATEONLY`: Une colonne de date seulement

## Types fantaisie

- `BLOB`: Stockage binaire. Longueurs disponibles: `tiny`, `medium`, `long`. Par exemple: `DataTypes.BLOG('tiny')`
- `VIRTUAL`

  - Une valeur virtuelle qui n'est pas stockée dans la base de données. Cela peut par exemple être utile si vous souhaitez fournir une valeur par défaut dans votre modèle, qui est renvoyée à l'utilisateur mais non stockée dans la base de données.
  - [Voir les docs](https://sequelize.readthedocs.io/en/2.0/api/datatypes/#virtual)

- `ENUM`

  - Une énumération.
  - `DataTypes.ENUM('value', 'another value')`
  - Idéalement, devrait être utilisé avec les chaînes stockées dans les constantes

  ```js
  const FIRST_ENUM_VALUE = 'FIRST_ENUM_VALUE';
  const OTHER_ENUM_VALUE = 'OTHER_ENUM_VALUE';
  // In migration or model definition
  DataTypes.ENUM(FIRST_ENUM_VALUE, OTHER_ENUM_VALUE);
  ```

## Types fantaisie Postgres

- `HSTORE`: une colonne clé/valeur
- `JSON`: une colonne de chaîne JSON.
- `JSONB`: une colonne de données JSON pré-traitée.
- `RANGE`: Pour Postgres 9.4+, les types de plage sont des types de données représentant une plage de valeurs d'un type d'élément (appelé sous-type de plage).
- `ARRAY`
  - Un tableau de `type`, par exemple `DataTypes.ARRAY(DataTypes.DECIMAL)`
