---
title: "Tests d'API avec Bruno"
authors: [ludovicwyffels]
date: 2024-07-06T18:00:00+02:00
summary: "Dans le monde dynamique du développement et des tests d'API, l'automatisation est essentielle."
draft: false
showToc: true
featureimage: https://github.com/usebruno/bruno/blob/main/assets/images/landing-2.png
featureimagecaption: Image de Bruno sur [Github](https://github.com/usebruno/bruno/blob/main/assets/images/landing-2.png)
  
tags:
  - Postman
  - API
  - Bruno
  - Testing
  - API Testing
categories: ["Test", "API"]

source:
  - https://dev.to/vikas1712/introduction-to-bruno-scripting-5a1n
---

Dans le monde dynamique du développement et des tests d'API, l'automatisation est essentielle.

Bruno offre un support de script pour vous aider à ajouter des fonctionnalités supplémentaires à l'outil, telles que la génération de données, la validation et l'intégration avec d'autres outils et systèmes, y compris l'envoi de requêtes intermédiaires, l'analyse des données de réponse, la mise à jour des variables d'environnement, etc.

## Gestion des secrets

### Énoncé du problème

Dans toute collection, il y a des secrets qui doivent être gérés. Ces secrets peuvent être des clés d'API, des mots de passe ou des jetons.

Une pratique courante consiste à stocker ces secrets dans des variables d'environnement.

Les développeurs peuvent partager les collections Bruno de deux manières :

- Vérifier le dossier de la collection dans le contrôle de source (comme git)
- Exporter la collection dans un fichier et la partager

Dans les deux cas, nous voulons nous assurer que les secrets sont retirés de la collection avant qu'elle ne soit partagée.

### Solution

Bruno propose deux approches pour gérer les secrets dans les collections :

- **Fichier .env**
- **Variables secrètes**

## Caractéristiques principales de Bruno Scripting

Bruno est un framework de script conçu pour fournir des fonctionnalités avancées et des capacités d'automatisation. Avec Bruno, les développeurs peuvent améliorer leurs tests d'API et leurs flux de travail de développement en permettant des tâches telles que la génération de données, les processus de validation, l'intégration avec d'autres outils et systèmes, et bien plus encore.

Explorons quelques-unes des principales caractéristiques et fonctionnalités de Bruno :

### Génération et validation des données

Bruno permet de générer des données de manière transparente dans l'environnement de test, ce qui permet aux développeurs de simuler divers scénarios et cas limites. De plus, il facilite les processus de validation robustes, garantissant que les API se comportent comme prévu dans différentes conditions.

### Intégration et interopérabilité

L'une des forces de Bruno réside dans sa capacité à s'intégrer à d'autres outils et systèmes de manière transparente. Qu'il s'agisse d'orchestrer des flux de travail complexes ou d'incorporer des services tiers, Bruno rationalise le processus, améliorant ainsi la collaboration et l'efficacité.

### Requêtes intermédiaires et analyse des réponses

Avec Bruno, les développeurs peuvent exécuter des requêtes intermédiaires dans leurs workflows, ce qui permet de réaliser des scénarios de test sophistiqués et des interactions API complexes. De plus, Bruno simplifie l'analyse des données de réponse, ce qui facilite l'extraction et la manipulation des informations pertinentes.

### Gestion de l'environnement

Bruno permet aux développeurs de gérer les variables d'environnement sans effort, ce qui facilite la gestion de la configuration et assure la cohérence entre les différents environnements de test. Qu'il s'agisse de mettre à jour des variables ou d'accéder à des données spécifiques à l'environnement, Bruno simplifie le processus, améliorant ainsi l'efficacité du flux de travail.

## Traduction des scripts Postman en commandes Bruno

Pour illustrer davantage les capacités de Bruno, traduisons quelques scripts Postman courants en commandes Bruno :

### Les tests confirment que l'API fonctionne

Commande Bruno:

``` js
bru.test("check status code", function() {
  expect(res.status).to.equal(200);
});
```

Commande Postman:

```js
pm.test("check status code", function() {
  pm.response.to.have.status(200);
});
```

### Définir la variable de collecte

Commande Bruno:

```js
bru.setVar("auth_token", res.body.userid);
```

Commande Postman:

```js
pm.collectionVariables.set("auth_token", "abc123");
```

### Obtenir une variable de collection

Commande Bruno:

```js
bru.getVar("auth_token");
```

Commande Postman:

```js
pm.collectionVariables.get("auth_token");
```

### Définir une variable d'environnement

Commande Bruno:

```js
bru.setEnvVar("api_key", "xyz1712");
```

Commande Postman:

```js
pm.environment.set("api_key", "xyz1712");
```

### Obtenir une variable d'environnement

Commande Bruno:

```js
bru.getEnvVar("api_key");
```

Commande Postman:

```js
pm.environment.get("api_key");
```

### Commande Prochaine demande

Commande Bruno:

```js
bru.setNextRequest("Token_SSO");
```

Commande Postman:

```js
pm.setNextRequest("Token_rock");
```

## Conclusion

En conclusion, Bruno permet une automatisation, une personnalisation et une flexibilité avancées, aidant les développeurs à fournir des API de haute qualité en toute confiance.

Bruno prend en charge le chargement de n'importe quel module npm pour l'utiliser dans vos flux de script.

Vous devez ajouter un fichier package.json dans lequel votre collection est stockée.

{{< terminal title="package.json" >}}
```json
{
  "name": "bruno_api_demo",
  "version": "1.0.0",
  "description": "With Bruno CLI, you can now run your API collections with ease using simple command line commands.",
  "author": "Ludovic Wyffels",
  "license": "ISC",
  "keywords": [
    "bruno",
    "api testing"
  ],
  "scripts": {
    "test": "bru run Oauth-Login --env test_ludo --format junit --output results.xml"
  },
  "dependencies": {
    "@usebruno/cli": "~1.11.0",
    "@faker-js/faker": "8.3.1"
  }
}
```
{{</ terminal >}}
