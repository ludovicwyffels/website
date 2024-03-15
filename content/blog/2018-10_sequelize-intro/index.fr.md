---
title: Démarrer avec Sequelize
authors: [ludovicwyffels]
date: 2018-10-12T19:41:34+02:00
summary: ''
draft: false
categories: [Node.js, Sequelize]
tags:
  - Node.js
  - Sequelize
  - Javascript
---

## Introduction à l'ORM

ORM ou Object Relation Mapping est un processus de mappage entre des objets et des systèmes de base de données relationnels. Un ORM agit comme une interface entre deux systèmes. Les ORM offrent aux développeurs des avantages de base, tels que la réduction du temps et des efforts et la concentration sur la logique métier. Le code est robuste au lieu de redondant. ORM aide à gérer les requêtes sur plusieurs tables de manière efficace. Enfin, un ORM (comme sequelize) est capable de se connecter à différentes bases de données (ce qui est pratique lors du passage d’une base de données à une autre).

## Débuter avec Sequelize

Sequelize est un ORM basé sur des promesses pour Node.js. Sequelize est facile à apprendre et possède des dizaines de fonctionnalités intéressantes comme la synchronisation, l'association, la validation, etc. Il prend également en charge PostgreSQL, MySQL, MariaDB, SQLite et MSSQL. J'utilise actuellement PostgreSQL.

## Installation

Sequelize est disponible via npm.

```bash
$ npm install --save sequelize
# Choisiser en un:
$ npm install --save pg pg-hstore // PostgreSQL
$ npm install --save mysql // mysql et mariadb
$ npm install --save sqlite3
$ npm install --save tedious // MSSQL
```

## Établissement d'une connexion

Sequelize établit une connexion entre l’API / application restante et votre base de données SQL. Pour configurer la connexion de base entre les deux:

```javascript
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql' | 'mariadb' | 'sqlite' | 'postgres' | 'mssql', //choose anyone between them
  // To create a pool of connections
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  // For SQLite only
  storage: 'path/to/database.sqlite',
});
``;
```