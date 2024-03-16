---
title: "Premiers pas avec LoopBack 4"
authors: [ludovicwyffels]
date: 2019-06-29T09:41:24+02:00
summary: "LoopBack 4 est un framework d'API open-source. La dernière version a adopté les dernières fonctionnalités de ES2016/2017/2018, supporte TypeScript et intègre de nouveaux standards tels que OpenAPI Spec et GraphQL, parmi d'autres."
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "Javascript"
  - "LoopBack"
---

LoopBack 4 est un framework d'API open-source pour Node.js. La dernière version a adopté les dernières fonctionnalités de ES2016/2017/2018, supporte TypeScript et intègre de nouveaux standards tels que OpenAPI Spec et GraphQL, parmi d'autres.

Cet article a pour but de guider les débutants à travers la documentation et d'expliquer les points cruciaux nécessaires pour commencer à construire un projet d'API LoopBack 4 maintenable.

## Installation

Assurez-vous d'avoir Node.js version 8+ installé sur votre machine. Le monorepo LoopBack inclut un package CLI, qui nous aidera dans l'échafaudage de notre application LoopBack 4. Pour l'installer, exécutez la commande suivante sur votre terminal :

```bash
npm install -g @loopback/cli
```

## Créer un nouveau projet

Une fois que l'outil LoopBack 4 CLI a été installé en global sur notre machine locale, nous pouvons échafauder notre application en utilisant la commande suivante :

```bash
lb4 app
```

Le terminal présentera les demandes d'entrée suivantes, que j'ai remplies ci-dessous et qui formeront la base de notre exemple d'API pour l'avenir.

```text
? Project name: (projects) payment-api
? Project description: (projects) A simple Payment API
? Project root directory: (payment-api)
? Application class name: (PaymentApiApplication)
? Select project build settings: (Press <space> to select, <a> to toggle all, <i> to invert selection) ... Press enter for default selection
```

Après avoir parcouru l'assistant CLI ci-dessus, il créera un tas de répertoires et de fichiers boilerplate ainsi que lancera `npm install` à notre place. Nous pouvons alors naviguer dans notre répertoire nouvellement créé et démarrer l'application.

```bash
cd payment-api
npm start
```

Si tout s'est bien déroulé, vous devriez voir le résultat suivant :

```text
Server is running at http://127.0.0.1:3000
Try http://127.0.0.1:3000/ping
```

Le projet expose un simple endpoint **GET** _/ping_. Ce qui n'est pas clair dans la sortie du terminal, ou dans la documentation de démarrage, c'est que l'application LoopBack 4 expose également un endpoint qui rendra la documentation OpenAPI Spec. Pour y accéder, il vous suffit d'ouvrir votre navigateur et d'aller à l'url suivante : [http://localhost:3000/swagger-ui](http://localhost:3000/swagger-ui).

![LoopBack 4 OpenAPI]()

Cette fonctionnalité permet aux développeurs d'API de documenter facilement leurs services Web au fur et à mesure que le code est écrit et de tester les endpoints d'une manière conviviale.

## Exploration de l'expression standard

Le LoopBack CLI crée beaucoup de fichiers et de dossiers pour nous. Réduisons le bruit et concentrons-nous sur les éléments dont nous avons besoin pour mettre en place et faire fonctionner un nouveau endpoint.

![LoopBack 4 Structure du projet]()

Un fichier **ping.controller.ts** initial est créé pour nous. C'est la convention de nommage par défaut que l'application LoopBack applique par configuration, qui peut être modifiée dans le fichier **application.ts** et qui sera explorée dans de futurs articles.

Après avoir ouvert le fichier **ping.controller.ts**, nous pouvons voir que le code utilise des décorateurs TypeScript pour fournir des métadonnées HTTP à la fonction ping() TypeScript dans la classe PingController.

```ts
@get('/ping')
```

Ce décorateur permet à l'application LoopBack de savoir que toute requête HTTP GET doit invoquer la fonction `ping()`.

```ts
return {
  greeting: 'Hello from LoopBack',
  date: new Date(),
  url: this.req.url,
  headers: Object.assign({}, this.req.headers),
};
```

La fonction `ping()` renvoie un objet JSON simple. L'application LoopBack s'occupe de la sérialisation automatique des données de réponse, qui est dans ce cas JSON.

Création d'un nouveau Endpoint
Un nouveau point final peut être créé en écrivant une nouvelle fonction décorée sur le PingController dans le fichier ping.controller.ts en se référant à la fonction ping() existante. LoopBack nous permet également de créer facilement de nouveaux contrôleurs en utilisant le CLI :

```txt
lb4 controller
? Controller class name: Payment
? What kind of controller would you like to generate? (Use arrow keys)
> Empty Controller
  REST Controller with CRUD functions
```

Afin d'utiliser le contrôleur REST avec l'option de fonctions CRUD, nous devons d'abord avoir un **référentiel** que nous examinerons dans les prochains articles.

```ts
export class PaymentController {
  constructor() {}
}
```

Si nous exécutons notre serveur avec npm, démarrez et rafraîchissez notre navigateur OpenAPI, remarquez qu'il n'y a pas encore de mention d'un PaymentController. C'est parce que nous n'avons pas encore mappé de fonctions aux chemins HTTP pour l'application LoopBack à documenter en utilisant les spécifications OpenAPI.

```ts
@post('/payments')
pay(@requestBody() payment: any): Object {
  payment.status = "success";
  return payment;
}
```

Une fonction appelée paye accepte un seul paramètre paiement de type `any` et retourne un `Object`. Nous utilisons deux décorateurs :

```ts
@post('/payments')
```

Ce qui dit à LoopBack de mapper la fonction `pay()` à une méthode HTTP POST sur les requêtes entrantes `/payments` et

```ts
@requestBody()
```

qui indique à LoopBack de mapper le corps de requête HTTP POST au paramètre de paiement de la fonction `pay()`. LoopBack analysera automatiquement le corps de requête HTTP JSON en fonction du type requis, ce qui est le cas dans ce cas.

En réexécutant le serveur (`npm start`) et en rafraîchissant le navigateur OpenAPI Spec, le _PaymentController_ sera présent avec un endpoint POST /payments.

![PaymentController - POST /payments]()

Le navigateur OpenAPI Spec affiche les paramètres disponibles que nous pouvons utiliser pour interagir avec l'API, qui est juste un corps de requête HTTP pour le moment. Nous pouvons tester ce endpoint en appuyant sur le bouton "Try it out" en haut à droite.

![Test POST /payments]()

La _valeur d'exemple_ a été initialisée avec un objet JSON vide. Ce n'est pas très utile, car cela ne communique pas les valeurs attendues par le endpoint. Grâce à des normes REST simples, nous pouvons établir que nous pouvons probablement utiliser ce endpoint pour effectuer un paiement, mais quelles sont les propriétés exactes que nous pouvons transmettre ici? Valeur? Devise? Montant?

## Paramètres du document à l'aide des définitions de modèle

Dans LoopBack 3.x, tout était piloté par un modèle, qui était un simple fichier de configuration JSON décrivant les propriétés du modèle et leurs types.

```json
{
  "name": "Payment",
  "base": "PersistedModel",
  "options": {
    "validateUpsert": true,
    "mysql": {
      "table": "payment"
    }
  },
  "properties": {
    "paymentId": {
      "type": "string",
      "id": true,
      "required": true,
      "defaultFn": "uuid",
      "mysql": {
        "columnName": "payment_id"
      }
    },
    "amount": {
      "type": "number",
      "required": true,
      "mysql": {
        "columnName": "amount"
      }
    },
    "createdOn": {
      "type": "date",
      "defaultFn": "now",
      "mysql": {
        "columnName": "created_on"
      }
    },
    "updatedOn": {
      "type": "date",
      "mysql": {
        "columnName": "updated_on"
      }
    }
  },
  "validations": [],
  "relations": {},
  "acls": [],
  "methods": {}
}
```

Les fichiers de définition de modèle permettaient également aux développeurs de spécifier si le modèle était persistant ou non et de mapper les propriétés JSON sur des colonnes spécifiques aux bases de données (si nécessaire). Le fichier permettait également de configurer des validations, des relations, des acls (Access Control Lists) et des méthodes à distance.

LoopBack 4 a pour but de découpler beaucoup de ces éléments afin de permettre une plus grande flexibilité. Nous pouvons toutefois réutiliser une grande partie de la structure syntaxique des métadonnées dans LoopBack 4, en conséquence.

```ts
import { property, model, Model } from '@loopback/repository';
@model()
export class PaymentRequest extends Model {
  @property({
    type: 'number',
    required: true
  })
  amount: number;
  @property({
    type: 'string',
    required: false
  })
  status: string;
}
```

Nous utilisons la classe `Model` ci-dessus pour déclarer que la classe `PaymentRequest` n'est pas persistante, car elle n'est pas conforme à l'interface `Persistable` (qui se trouve dans le paquet LoopBack Repository). La classe `Entity`, utilisée dans les articles ultérieurs, implémente l'interface `Persistable` et inclut une fonction qui est utilisée pour définir quelle propriété détermine son caractère unique, c'est-à-dire qu'elle a un identifiant unique et peut être stockée/persistée dans une source de données (Data Source).

La classe `PaymentRequest` est utilisée pour modéliser les données de notre module POST /payments HTTP Request.

Le décorateur `@model()` peut être utilisé pour inclure des métadonnées supplémentaires pour le modèle. Dans ce cas, il est juste utilisé pour faire savoir à LoopBack qu'il s'agit d'un modèle et qu'il doit être utilisé pour rendre la documentation dans la spécification OpenAPI.

Le décorateur `@property` est utilisé pour fournir des métadonnées supplémentaires aux propriétés individuelles de notre modèle. Ces métadonnées permettent d'afficher les propriétés dans les fichiers de définition de modèle LoopBack 3 et leur but principal est de permettre aux spécifications OpenAPI de documenter facilement les propriétés ainsi que les propriétés de mapper aux noms de colonnes spécifiques à la base de données.

Nous pouvons utiliser cette classe de modèle comme type de paramètre dans la fonction _PaymentController#pay_ :

```ts
@post('/payments')
pay(@requestBody() payment: PaymentRequest): Object {
  payment.status = "success";
  return payment;
}
```

Avec une classe TypeScript spécifique utilisée comme type de paramètre, LoopBack peut maintenant fournir des détails supplémentaires à la spécification OpenAPI et notre navigateur rend maintenant ce qui suit (après avoir redémarré le serveur et actualisé la page):

![POST /payments Documentation Request Body]()

Nos développeurs frontaux peuvent maintenant facilement lire la documentation interactive et commencer à intégrer leurs applications avec un minimum d'effort.

L'exécution de cette opération après avoir appuyé sur le bouton "Try it out" et modifié certains des paramètres permet d'obtenir un code de réponse HTTP 200 avec le corps de réponse JSON suivant:

![200 Success]()

Nous avons changé la propriété de statut à "succès" dans la fonction pay() plus tôt, ce qui est vu dans la sortie JSON ci-dessus.

## Conclusion

Cet article a introduit LoopBack 4 en échafaudant une API de paiement simple par l'intermédiaire du CLI. Nous avons examiné à quel point il est facile de documenter et de tester les endpoints de l'API à l'aide des spécifications OpenAPI intégrées en utilisant les contrôleurs LoopBack 4 et les fonctions TypeScript décorées. Enfin, nous avons exploré l'évolution des fichiers de définition de modèle LoopBack 2/3 en détail.

LoopBack 4 est toujours en cours de développement, avec de nombreuses nouvelles fonctionnalités construites par l'impressionnante communauté open-source. Dans les articles suivants, nous les explorerons tous plus en détail au fur et à mesure que nous construirons notre API de paiement simple.
