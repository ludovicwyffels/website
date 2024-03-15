---
title: Comment paginer des données dans MySQL avec Sequelize
authors: [ludovicwyffels]
date: 2018-10-13T19:30:09+02:00
summary: ''
draft: false
categories: [Node.js]
tags:
  - Node.js
  - Sequelize
  - JavaScript
---

Souvent, je me trouve aux prises avec Sequelize pour trouver une réponse directe à ma requête. Récemment, je travaillais sur une application full stack dans laquelle il était impératif de paginer les résultats depuis le backend (API REST) vers le client. Je me suis battu pour deux raisons. Tout d'abord, venant du context NoSQL, il est difficile de saisir les bases de données SQL. La deuxième raison étant que la documentation de Sequelize ne fournit pas une solution claire et directe à cette abstraction très basique. Beaucoup de gens supposent des choses dans le monde des bases de données SQL.

Ainsi, dans cet article, nous allons parler d'un module de base de pagination utilisant Sequelize, MySQL et Node.js. J'utilise des tables et des enregistrements dans votre base de données MySQL. Pour configurer une nouvelle application et établir une connexion à une base de données, lisez mon post sur `Premiers pas avec Sequelize`.

## Définir un modèle

Je saute directement sur la définition du modèle utilisateur:

J'utilise une table contenant une centaine d'enregistrements d'utilisateur que nous voulons afficher sur une application Web, par exemple dans le panneau d'administration, et nous voulons afficher seulement 50 enregistrements à la fois.

Dans le fichier `api/user.js`, je définis un endpoint `/:page` qui extraira le nombre de résultats nécessaires de la base de données.

`findAndCountAll` est le modèle de recherche dans plusieurs enregistrements de la base de données. Il retourne à la fois les données requises et le nombre d'éléments de cette table. La requête ci-dessus obtiendra 50 enregistrements d'utilisateur à la fois jusqu'à ce que la page suivante soit appelée pour extraire les 50 prochains enregistrements. `limit` et `offset` sont nécessaires dans les requêtes liées à la pagination dans lesquelles `limit` extrait le nombre de lignes en fonction de la requête, tandis que `offset` est utilisé pour ignorer le nombre
