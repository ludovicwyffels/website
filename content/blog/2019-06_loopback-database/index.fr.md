---
title: "Loopback 4 - Configuration de la base de données"
authors: [ludovicwyffels]
date: 2019-06-29T21:45:25+02:00
summary: "Cet article va décrire quelques façons de configurer une application LoopBack 4 par rapport à une base de données à travers plusieurs environnements de développement (dev, test et production)."
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "LoopBack"
---

## Introduction

Presque toutes les applications Web ont besoin de conserver des données sous une forme ou une autre. LoopBack a toujours abstrait le moteur de base de données de l'application en nous fournissant plusieurs connecteurs à utiliser, tels que : MySQL, Postgres et In-memory. LoopBack 4 utilise les mêmes bibliothèques sous-jacentes que LoopBack 3 pour passer la configuration aux moteurs. Cependant, les structures du projet sont légèrement différentes, comme indiqué ci-dessous.

## Configuration de LoopBack 3

Dans LoopBack 3, vous définiriez un ensemble d'objets JSON à l'intérieur d'un fichier `datasources.json` stocké dans le dossier serveur, ce qui permettrait à l'application de récupérer la configuration. Le fichier ressemblerait à ceci :

```json
{
  "db": {
    "name": "db",
    "connector": "memory"
  }
}
```

Ce fichier définit une nouvelle source de données appelée "db", qui est configurée pour utiliser le connecteur de base de données en mémoire. Dans la plupart des applications, c'est une excellente source de données par défaut pour les modèles, car elle élimine le besoin de configurer un serveur de base de données lors du premier démarrage avec un prototype. Vous pouvez simplement configurer les modèles pour utiliser la source de données "db" et continuer avec le code.

Le fichier `model-config.json`, dans le même dossier, relierait un modèle à une source de données et ressemblerait à ceci :

```json
{
  "_meta": {
    "sources": [
      "loopback/common/models",
      "loopback/server/models",
      "../common/models",
      "./models"
    ],
    "mixins": [
      "loopback/common/mixins",
      "loopback/server/mixins",
      "../common/mixins",
      "./mixins"
    ]
  },
  "Person": {
    "dataSource": "db",
    "public": false
  },
  ...
}
```

Une fois que vous avez la base de votre application en place et en cours d'exécution par rapport à la configuration de la base de données en mémoire, vous pouvez vous concentrer sur la configuration d'un serveur de base de données, tel que MySQL ou Postgres, installer le bon connecteur et simplement modifier la configuration `datasources.json` comme suit :

```json
{
  "db": {
    "name": "db",
    "connector": "mysql",
    "hostname": "localhost",
    "port": 3306,
    "user": "root",
    "password": "root",
    "database": "app_database"
  }
}
```

C'est excellent pour le développement local. Mais, lorsque vous travaillez au sein d'une équipe plus importante ou avec plusieurs environnements, un seul fichier de configuration JSON ne va pas le couper. LoopBack 3 a résolu la configuration spécifique à l'environnement en nous permettant de créer des fichiers de sources de données spécifiques à l'environnement. Le nom du fichier de source de données spécifique à l'environnement devait être dans une certaine structure : `datasources.<environment>.js`. Un projet avec 3 environnements aurait les fichiers suivants :

- datasources.json (une configuration de serveur de base de données locale)
- datasources.test.js (une configuration de serveur de base de données de test)
- datasources.production.js (une configuration de serveur de base de données de production)

La version JavaScript du fichier de configuration nous a donné une flexibilité supplémentaire, car nous avons pu déterminer la configuration à l'aide de code. Le fichier de configuration le plus courant utilise les variables d'environnement système. Un exemple de fichier de configuration d'une source de données de production serait le suivant :

```js
module.exports = {
  db: {
    name: 'db',
    connector: 'mysql',
    hostname: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  }
};
```

C'est génial, car cela élimine le besoin de stocker les références de production dans notre code. Nous pourrions livrer ces fichiers de configuration et configurer la configuration sur le serveur, en toute sécurité.

Par défaut, le framework utiliserait la variable d'environnement système NODE_ENV pour choisir le fichier source à utiliser. Un serveur de production aurait les variables d'environnement suivantes :

- NODE_ENV=production
- DB_HOST=aws-rds-mysql-host.example.com
- DB_PORT=3306
- DB_USER=super-secret-user
- DB_PASSWORD=super-secret-password
- DB_DATABASE=app_database

## Configuration LoopBack 4

LoopBack 4 ne lit plus automatiquement les fichiers de configuration des sources de données. Au lieu de cela, le framework nous laisse décider comment nous voulons configurer notre application. Pour l'instant, il ne semble pas qu'il existe de meilleures pratiques documentées pour la mise en place d'un tel système. Une approche est suggérée ci-dessous.

### Dépendance Injection

Avant de nous plonger dans la configuration de la base de données, nous devons comprendre l'un des concepts clés de LoopBack 4 : [Injection de dépendance](https://loopback.io/doc/en/lb4/Dependency-injection.html).

Essentiellement, l'application peut enregistrer des valeurs sur une liste de clés uniques. Ces valeurs peuvent contenir des variables normales ou des définitions de classes, que l'application peut ensuite utiliser pour gérer la création de ces objets pour nous, en reprenant les dépendances requises.

Par exemple, on peut enregistrer une valeur,'bar' sur une clé 'foo'.

```ts
this.bind('foo').to('bar');
```

Maintenant l'application sait que la clé 'foo', contient la valeur 'bar'. Nous pouvons demander cette valeur à partir de l'application n'importe où dans notre code. À titre d'exemple :

```ts
@inject('foo') private foo: string;
```

En plus de lier une valeur à une clé, nous pouvons lier une classe à une clé et laisser l'application calculer récursivement ses dépendances lors de l'instanciation de l'objet sur demande.

```ts
export class Foo {
  constructor(@inject('bar') private bar: string) {}
  someMethod() {
    return this.bar;
  }
}
...
this.bind('bar').to('Bar');
this.bind('foo').toClass(Foo);
```

Quand nous demandons une instance de la classe Foo, comme suit:

```ts
@inject('foo') private foo: Foo
```

Le conteneur d'application verra que la classe Foo dépend de la valeur de la barre. Il le recherchera dans le conteneur de dépendances, le trouvera (s'il est lié) et l'injectera ensuite dans la classe. D'où l'**injection de dépendance**.

## Créer un nouveau projet

On peut utiliser la CLI pour créer un nouveau projet en appelant la commande suivante :

```bash
lb4 app
```

```text
? Project name: my-api
? Project description: My API
? Project root directory: my-api
? Application class name: MyApiApplication
? Select features to enable in the project Enable tslint, Enable prettier, Enable mocha, Enable loopbackBuild, Enable vscode, Enable repositories, Enable services
```

```bash
cd ./my-api
```

LoopBack 4 ajoute un dossier datasources au projet.

Initialement, on supposerait que ce dossier est configuré pour être lu de la même manière que les fichiers JSON des sources de données LoopBack 3. Cependant, c'est juste le dossier par défaut utilisé par le CLI pour y déposer les nouveaux fichiers.

## Ajout d'une source de données à l'aide de l'interface CLI

Utilisez le CLI pour créer une nouvelle source de données en exécutant la commande suivante :

```bash
lb4 datasource
```

```text
? Datasource name: db
? Select the connector for db: In-memory db (supported by StrongLoop)
? window.localStorage key to use for persistence (browser only):
? Full path to file for persistence (server only):
create src/datasources/db.datasource.json
create src/datasources/db.datasource.ts
update src/datasources/index.ts
Datasource db was created in src/datasources/
```

La première chose que vous remarquerez est que le fichier db.datasource.json est exactement le même que le fichier LoopBack 3 datasources.json. Dans l'assistant CLI, j'ai choisi le connecteur en mémoire, qui est l'un des nombreux connecteurs disponibles dans LoopBack 3 et LoopBack 4.

Le nouvel ajout à la famille de fichiers de source de données LoopBack est le fichier `datasource.ts`.

```ts
import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './db.datasource.json';
export class DbDataSource extends juggler.DataSource {
  static dataSourceName = 'db';
  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
```

La classe étend un type `juggler.DataSource`, qui est le même type que celui utilisé dans LoopBack 3 (sauf que c'est la version de définition TypeScript). Il nécessite la même structure de configuration JSON que LoopBack 3. Dans cette version, nous devons passer la configuration à la super méthode du constructeur.

```ts
import * as config from './db.datasource.json';
...
constructor(
  @inject('datasources.config.db', {optional: true})
  dsConfig: object = config
)
...
```

Le fichier importe la configuration par défaut du fichier `db.datasource.json` et l'inclut comme valeur par défaut dans le paramètre `dsConfig` du constructeur. Cela signifie que nous n'aurons jamais besoin de passer quoi que ce soit dans le constructeur de la classe DbDataSource lors de l'instanciation d'une instance de l'objet, à moins de l'écraser... peut-être pour un environnement différent (nous y reviendrons).

L'autre décorateur d'injection peu familier permet au framework d'injecter la valeur du paramètre depuis le conteneur d'injection de dépendance (s'il est lié).

Dans cette optique, il existe de nombreuses façons d'instancier cette nouvelle classe DataSource :

```ts
// 1. With the default configuration from db.datasource.json
let dbDataSource = new DbDataSource();
// 2. Overwriting the default configuration
let dbDataSource = new DbDataSource({
  name: 'db',
  connector: 'mysql',
  hostname: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});
```

Nous avons maintenant une instance de notre dbDataSource. Mais, comment l'utilise-t-on réellement ? Comment notre nouvelle application connaît-elle notre source de données ?

De la même manière que nous pouvons enregistrer (ou lier) des valeurs (ou classes) contre les applications Dependency Container, nous pouvons lier l'instance de la source de données à une clé du conteneur.

Dans notre fichier `application.ts`, nous pouvons utiliser la fonction de liaison des applications dans le constructeur pour lier notre instance à l'application :

```ts
this.bind('datasources.db').to(new DbDataSource());
```

En outre, LoopBack 4 a une fonction spéciale appelée source de données :

```ts
this.dataSource(new DbDataSource());
```

Il existe une dernière méthode pour lier notre source de données à l'application:

```ts
this.bind('datasources.config.db').to({
  name: 'db',
  connector: 'mysql',
  hostname: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
this.bind('datasources.db').toClass(DbDataSource);
```

L'extrait de code ci-dessus lie d'abord la configuration à la clé de dépendance '
`datasources.config.db`. Cette clé de dépendance est référencée dans le constructeur de la classe DbDataSource via le décorateur inject. En liant la clé `datasources.db` à la définition de classe "DbDataSource", le conteneur de dépendances va rechercher toutes ses dépendances et les instancier pour nous.

Maintenant que le conteneur de dépendances de l'application connaît notre source de données, nous pouvons la lier à un référentiel et un modèle.

Note : vous devez d'abord générer un modèle avant de générer un référentiel. Pour ce faire, utilisez la commande modèle lb4 :

```bash
lb4 model
```

```text
? Model class name: Person
? Please select the model base class Entity
Let's add a property to Person
Enter an empty property name when done
? Enter the property name: id
? Property type: number
? Is id the ID property? Yes
? Is it required?: Yes
? Default value [leave blank for none]:
Let's add another property to Person
Enter an empty property name when done
? Enter the property name:
create src/models/person.model.ts
update src/models/index.ts
Model Person was created in src/models/
```

Après avoir créé un modèle, relions-le à un nouveau référentiel. Utilisez la commande lb4 repository :

```bash
lb4 repository
```

```text
? Please select the datasource DbDatasource
? Select the model(s) you want to generate a repository Person
? Please enter the name of the ID property for Person: id
create src/repositories/person.repository.ts
update src/repositories/index.ts
Repository Person was created in src/repositories/
```

Une fois que vous avez utilisé le modèle lb4 et la commande lb4 repository, vous devriez vous retrouver avec un référentiel lié à un modèle qui injecte la classe DbDataSource :

```ts
export class PersonRepository extends DefaultCrudRepository<
  Person,
  typeof Person.prototype.id
> {
  
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Person, dataSource);
  }
}
```

Notez que le constructeur PersonRepository utilise à nouveau le décorateur inject mais cette fois-ci il fait référence à la clé `datasources.db` que nous avons définie précédemment. Le référentiel est responsable de la connexion du modèle à la source de données et fournit les fonctions CRUD (Create, Read, Update and Delete), grâce à la classe `DefaultCrudRepository` dont nous héritons.

De la même manière que nous avons lié la source de données à l'application, nous devons lier le référentiel à l'application :

```ts
this.repository(PersonRepository);
```

Une fois enregistré, nous pouvons utiliser la commande contrôleur lb4 pour créer un nouveau contrôleur REST pour nous, qui utilise notre nouveau modèle de configuration, source de données et référentiel :

```bash
lb4 controller
```

```text
? Controller class name: People
? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? Person
? What is the name of your CRUD repository? PersonRepository
? What is the type of your ID? number
? What is the base HTTP path name of the CRUD operations? /people
create src/controllers/people.controller.ts
update src/controllers/index.ts
Controller People was created in src/controllers/
```

Vous pouvez enregistrer le contrôleur contre l'application de la même manière que nous avons la source de données et le référentiel. En plus d'utiliser les fonctions de référentiel et de contrôleur pour lier nos classes à notre application, LoopBack les lie automatiquement pour nous. Ceci peut être configuré dans le constructeur de classe d'application :

```ts
this.bootOptions = {
  controllers: {
    // Customize ControllerBooter Conventions here
    dirs: ['controllers'],
    extensions: ['.controller.js'],
    nested: true,
  },
};
```

Ceci indique à notre application de regarder à l'intérieur du dossier Contollers pour tous nos contrôleurs et appelle automatiquement this.controller pour nous. Vous pouvez également configurer la valeur du référentiel bootOptions pour faire de même avec les référentiels.

Nous n'analyserons pas ici l'ensemble du fichier du contrôleur pour gagner de la place. Les sections importantes seront soulignées :

```ts
constructor(
  @repository(PersonRepository)
  public personRepository : PersonRepository,
) {}
```

Le décorateur du référentiel s'enroule autour du décorateur d'injection. C'est la même chose que de faire ce qui suit :

```ts
constructor(
  @inject('repositories.PersonRepository')
  public personRepository : PersonRepository,
) {}
```

Nous pouvons maintenant utiliser le référentiel pour accéder à nos données de modèle dans notre source de données configurée.

```ts
@post('/people', {
  responses: {
    '200': {
      description: 'Person model instance',
      content: {'application/json': {'x-ts-type': Person}},
    },
  },
})
async create(@requestBody() person: Person): Promise<Person> {
  return await this.personRepository.create(person);
}
```

## Conclusion

Cet article compare les différences entre la configuration d'une source de données de base de données et une application LoopBack 3 et LoopBack 4. En plus de comprendre comment configurer une source de données, nous avons examiné comment configurer la configuration en fonction de divers environnements en permettant aux données de configuration d'être définies par les variables d'environnement système, auxquelles nous accédons par `process.env.ENV_VARIABLE`.
