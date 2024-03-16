---
title: "Gestion des environnements Angular en livraison continue"
authors: [ludovicwyffels]
date: 2019-09-08T18:15:11+02:00
summary: "Mise en oeuvre de la configuration de l'environnement dynamique dans Angular pour éviter un build par environnement"
draft: false
categories: ["Node.js", "DevOps", "Angular"]
tags:
  - "Node.js"
  - "Angular"
  - "TypeScript"
  - "DevOps"
---

Dans les applications métiers, nous rencontrons souvent une configuration de livraison continue comportant plusieurs stages. Chaque étape a sa configuration pour accéder aux systèmes périphériques spécifiques à l'environnement. Pour ce faire, nous devons gérer les configurations basées sur les stages.

Angular CLI est livré avec certains concepts intégrés permettant de gérer différents environnements.

Mais quelle est leur fiabilité dans un environnement de livraison continu ? 🤔

## Livraison continue - une courte introduction

La livraison continue résulte du mouvement agile. La rétroaction itérative est à la base. Il est essentiel d'apprendre des expériences pratiques et d'intégrer ces commentaires.

La livraison continue prend des idées agiles et définit une approche pour livrer des logiciels testés automatiquement dans des cycles courts.

> La diffusion continue consiste à créer un pipeline pour automatiser le processus de publication du logiciel

## Étapes de livraison continue

Un schéma typique dans la livraison continue est le _steging_. Dans une configuration de livraison continue typique, nous avons différents stages avec des objectifs différents.
Chaque validation entraîne une exécution du pipeline sur notre serveur CI. Les exécutions réussies sur la branche `master` entraînent un déploiement sur l'un de nos stages.

![Continuous Deployment](./images/continuous-deployment.png)

Dans l'exemple ci-dessus, la phase de `test` contient une snapshot de la branche `master`. À certains intervalles, par exemple, après chaque sprint, nous pouvons déployer au stade intermédiaire (`staging`). C'est à ce stade que les tests de réception finaux sont effectués. Une fois accepté, l'artefact est déplacé en production.

Bien sûr, certaines entreprises ont un temps de production plus rapide. Certains déploient même chaque commit directement en production.

Mais dans la plupart des applications liées aux entreprises, il est bon d’avoir une étape avant la production. Cela permet à nos _product owners_, représentants commerciaux et testeurs d'avoir un dernier aperçu et de vérifier la logique métier.

## Build une fois - déployer partout

Il est essentiel de ne construire votre artefact qu'une seule fois et de le déplacer d'une étape à l'autre.
Cette approche garantit que le même artefact qui a été testé entre également en production.

## Les environnements Angular et livraison continue, sont-il adapté ? 🤔

Angular CLI est livrée avec un mécanisme intégré de fichier d'environnement. Voyons comment ils fonctionnent.

Lors de la génération d'un tout nouveau projet, il existe un `environment.ts`et un `envrironment.prod.ts`. De plus, nous pouvons toujours ajouter à ces fichiers de nouveaux fichiers d'environnement dans le dossier `environment ` et les configurer dans votre fichier `angular.json`.

Pendant le build, l'environnement souhaité est ensuite transmis en tant qu'argument à la commande de build. Le CLI utilise ensuite le fichier d'environnement correct et remplace le fichier par défaut pendant le build, que nous pouvons ensuite importer avec la ligne suivante

```ts
import {environment} from '../environments/environment';
```

Maintenant que nous connaissons le concept intégré de la CLI angulaire. Voyons en quoi cela correspond aux principes de la livraison continue.

Il est donc essentiel de noter que Angular CLI définit l’environnement pendant la construction. Cela signifie que nous devons créer notre application avant chaque déploiement sur une étape spécifique.


Cette approche comporte quelques risques.

Si vous créez votre application à chaque fois avant de déployer, il se peut que l'artefact que vous avez testé ne soit pas le même que celui qui entre en production.

> Il est important de réaliser qu’un processus de build n’est pas toujours déterministe. Même si le même code entre dans la construction, il n’est pas garanti que le même artefact sortira.

L’artefact ne dépend pas seulement de votre code, il dépend également des bibliothèques tierces, des mises à jour du système d’exploitation ou d’autres modifications de l’environnement qui se produisent avec le temps.

Rappelez-vous à l'époque où nous avions un `package.lock.json`. À l'époque, les builds étaient encore moins prédictives. Les bibliothèques tierces apparaissent souvent avec un `^` dans notre `package.json`. Malgré `semver`, les nouvelles versions d'une bibliothèque tierce produisaient parfois une incompatibilité avec une autre dépendance qui entraînait la rupture de votre application.

> Plus vous pouvez maintenir la cohérence entre les déploiements, plus le déploiement en production est susceptible de se dérouler sans heurts.

**La livraison continue et les fichiers d'environnement fournis par Angular CLI ne conviennent pas!**

**Dans la livraison continue, votre artefact doit obtenir des configurations spécifiques à l'environnement au démarrage ou à l'exécution. Angular CLI, en revanche, obtient ces configurations au moment du build.**

Alors, comment combiner les idées de la livraison continue avec notre application angulaire?

Il existe différentes approches pour combiner les idées de livraison continue avec Angular CLI. Chacun comporte des avantages et des inconvénients.

Regardons-les.



## Configurer l'hôte comme assets - Monter les fichiers de configuration par environnement

Au lieu d'extraire la configuration sur un endpoint REST, nous extrayons directement un fichier JSON avec des configurations situées dans notre dossier `assets`.

Nous allons donc créer un dossier de `config` à l’intérieur `assets` et y placer un `JSON` contenant les configurations spécifiques à l’environnement local.

Mais comment charge-t-on le fichier `configuration.json`? Au travers d'un service au travers duquel nous récupérons le fichier à partir du dossier `assets`.

```ts
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {shareReplay} from 'rxjs/operators';

interface Configuration {
  resourceServerA: string;
  resourceServerB: string;
  stage: string;
}

@Injectable({providedIn: 'root'})
export class ConfigAssetLoaderService {

  private readonly CONFIG_URL = 'assets/config/config.json';
  private configuration$: Observable<Configuration>;

  constructor(private http: HttpClient) {
  }

  public loadConfigurations(): any {
    if (!this.configuration$) {
      this.configuration$ = this.http.get<Configuration>(this.CONFIG_URL).pipe(
        shareReplay(1)
      );
    }
    return this.configuration$;
  }
```

`ConfigurationAssetsLoaderService` charge maintenant notre fichier `assets/config/config.json` qui contient toutes les configurations. Mais comment pouvons-nous changer ces configurations par rapport à l'environnement actuel dans lequel nous nous trouvons?

Nous allons simplement héberger notre configuration sur chaque étape, puis monter le fichier `configuration.json` dans le dossier `assets`. Lorsque votre pod démarre, nous montons votre configuration dans le répertoire `assets/config`.

Il est important de noter que vous créez un dossier `config` à l'intérieur du dossier `assets`. Nous ne pouvons pas utiliser une hiérarchie à plat. Lors du montage, tous les fichiers du dossier monté sont supprimés.

La manière concrète de monter des volumes dépend de votre outil de CI. Sur mon projet, nous utilisons Kubernetes pour nos déploiements. Kubernetes nous fournit des `ConfigMaps` qui peuvent être une propriété ou même un fichier de configuration complet. Donc, sur Kubernetes, nous avons différents stages. Chaque stage héberge ensuite des configurations spécifiques et les monte dans notre dossier `assets/config` au démarrage du pod.

```yaml
volumeMounts:
  - mountPath: /usr/share/nginx/html/assets/config
    name: yourVolumeName
```

Nous avons maintenant vu deux approches dont la mise en oeuvre côté client est très similaire. Nous avons créé un service qui récupère les configurations à partir d'un endpoint REST ou du dossier `assets`.

Nous avons donc vu deux manières d'utiliser un service pour accéder à des configurations. Mais quand appelons-nous ces services?

Eh bien, réponse courte, c’est à vous de voir. Il y a des moments différents où il est logique de les appeler. Chacun vient avec des avantages et des inconvénients.



## Remplacer les configurations par environnement

Dans cet exemple, nous utilisons les fichiers d'environnement Angular tels quels. Un `environment.ts`et un `environment.prod.ts`.

Même si nous avons plus de stages que la production et le développement, nous distinguons seulement ces deux-là. Pour le développement local, nous utilisons le fichier `environment.ts`. Tous les autres stages sont gérés par `environment.prod.ts`.

Mais comment ?

Notre `environment.prod.ts` ne contient pas les valeurs réelles; il contient des valeurs d'espace réservé qui seront écrasées à chaque étape par un script de construction.

Un exemple de fichier `environment.prod.ts` pourrait ressembler à ceci:

```ts
export const environment = {
  resourceServerA: 'REPLACED_BY_BUILD_RESOURCEA',
  resourceServerB: 'REPLACED_BY_BUILD_RESOURCEB',
  stage: 'REPLACED_BY_BUILD_STAGE',
};
```

Lorsque nous démarrons notre serveur Web, nous pouvons ensuite utiliser un script `start.sh` qui remplacera les espaces réservés.

```bash
#!/bin/sh

# replace static values with environment-variables
if [ -n "$RESOURCEA" ]; then
  sed -i "s#REPLACED_BY_BUILD_RESOURCEA#$AUTHSERVER_URL#g" /usr/share/nginx/html/main.*.bundle.js
fi

# start webserver
exec nginx
```

Nous exécutons ensuite ce script au démarrage. Par exemple, dans notre fichier Docker.

```Dockerfile
# Dockerfile
...
# Start nginx via script, which replaces static urls with environment variables
ADD start.sh /usr/share/nginx/start.sh
RUN chmod +x /usr/share/nginx/start.sh
CMD /usr/share/nginx/start.sh
```

Cette approche, du moins pour moi, est un peu "hacky". Remplacer des chaînes dans un paquet n’est probablement pas le moyen le plus agréable. Il comporte en outre le risque de remplacer quelque chose qui ne devrait pas être remplacé.

Si vous décidez quand même d'utiliser cette approche, il est extrêmement important d'avoir de bons espaces réservés. Utilisez des caractères spéciaux que vous n'utilisez généralement pas dans les noms de variables.

## Conclusion

Angular est livré avec des fichiers d’environnement qui nous permettent de gérer des configurations spécifiques à l’environnement. Ils ne répondent pas aux exigences d'une configuration de livraison continue.

Les fichiers d'environnement Angular sont utilisés pendant la phase de build. En mode de livraison continue, il est essentiel de déployer le même artefact à différents stages. Par conséquent, nous devons transmettre les configurations d'environnement au démarrage ou à l'exécution.

En fonction de votre configuration, nous pouvons charger des configurations via un service. Soit directement à partir d'un backend ou de notre dossier d'actifs.

Il est donc recommandé de les mettre en cache.



---



Un des gros défauts de la façon dont Angular CLI traite les environnements, dans la culture DevOps c'est mieux de **build une seule fois et de déployer sur plusieurs environnements**, hors Angular CLI veut que vous créer un buildnpm séparé par environnement.

Pourquoi devriez-vous build une seule fois et réutiliser cette version dans tous les environnements?

La raison pour laquelle vous ne souhaitez pas créer une version distincte pour chaque environnement est la suivante:

1. Cela ralentit les pipelines d'intégration continue (CI), car il doit créer un build pour chaque environnement.
1. Cela augmente le risque d'erreurs / de différences dans différents environnements, car les versions sont séparées
1. Il ajoute des informations inutiles sur d'autres environnements dans le code
1. Pour des raisons de sécurité, vous pourriez ne pas vouloir afficher d'informations confidentielles dans la configuration de l'environnement, qui est enregistrée dans Git.

Tous ces problèmes me font me demander pourquoi **Angular CLI opte pour une version par environnement**. Je voulais bien sûr une solution à ces problèmes.

Comment ces problèmes sont-ils résolus ?

En faisant en sorte que le serveur de déploiement **substitue un fichier config.json, chargé au moment de l'exécution** par l'application.

## Faire en sorte qu'une application Angular utilise des configurations dynamiques

Nous voulons que l'application Angular ne comporte que deux fichiers d'environnement: `environment.ts` et `environment.prod.ts`.

Pourquoi deux environnements, vous pouvez demander? Un pour les développeurs locaux, où vous pouvez mettre ce que vous voulez pour servir localement et un autre pour créer l’application. Ces fichiers d'environnement tirent l'essentiel de ses valeurs d'un fichier `app-config.json` chargé lors de l'exécution, contrairement à la codification en dur de toutes les informations sur l'environnement dans les fichiers d'environnement.

## Créer une nouvelle application Angular

La première étape consiste à créer une nouvelle application Angular en ouvrant le terminal, accéder au répertoire souhaité pour l'application et taper:

```bash
ng new dynamic-config-demo
```

Et cela devrait créer une nouvelle application Angular pour vous.

## Chargement du fichier config.json au démarrage

Toute la configuration de l'environnement va être stockée dans un fichier `app-config.json` utilisé par le fichier `environment.ts` pour référencer ces valeurs en toute sécurité.

Nous créons simplement un fichier JSON vide dans le dossier `assets` appelé `app-config.json`.

L'étape suivante consiste à **charger le fichier config.json** à l'aide d'un service d'initialisation `app.init.ts`:

```ts
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
declare var window: any;

@Injectable()
export class AppInitService {

  // This is the method you want to call at bootstrap
  // Important: It should return a Promise
  public init() {
    return from(
        fetch('assets/app-config.json').then(function(response) {
          return response.json();
        })
      ).pipe(
        map((config) => {
        window.config = config;
        return;
      })).toPromise();
  }
}
```

Ce service s'exécutera au démarrage et garantira que la configuration de l'application est récupérée en utilisant `fetch` pour obtenir le fichier de configuration, puis enregistrez-le dans `window` pour le rendre globalement disponible pour l'application. Notez que lorsque vous utilisez `fetch`, vous aurez peut-être besoin de polyfills pour la prise en charge du navigateur IE.

Le service d'initialisation d'application est configuré dans le module `app.module` comme suit:

```ts
export function init_app(appLoadService: AppInitService) {
  return () => appLoadService.init();
}
@NgModule({
  declarations: [AppComponent, ComponentAComponent, ComponentBComponent],
  imports: [BrowserModule, CoreModule, HttpClientModule],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppInitService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

L’utilisation d’un service d’initialisation d’application crée un léger retard sur le temps de démarrage de l’application, mais des éléments simples comme celui-ci n’auront pas d’impact considérable sur le temps de démarrage. Néanmoins, je vous recommande d’indiquer à vos utilisateurs d’attendre avec une spinner de chargement.

## Faire en sorte que les fichiers d'environnement utilisent des valeurs dynamiques

Maintenant que nous chargeons le JSON de configuration de manière dynamique et que nous les enregistrons dans `window`, nous voulons pouvoir les référencer en toute sécurité. Pour ce faire, nous devrions avoir trois fichiers d’environnement: `environment`, `environment.prod` et `dynamic-environment`.

`environment` est destiné à être utilisé localement, `environment.prod` est destiné à la production et `dynamic-environment` est partagé avec `environment` et `environment.prod` afin de fournir une configuration dynamique.

`dynamic-environment` ressemble à ceci:

```ts
declare var window: any;

export class DynamicEnvironment {
  public get environment() {
    return window.config.environment;
  }
}
```

Ceci est utilisé dans `environnement` comme celui-ci:

```ts
import { DynamicEnvironment } from './dynamic-environment';
class Environment extends DynamicEnvironment {

  public production: boolean;
  constructor() {
    super();
    this.production = false;
  }
}

export const environment = new Environment();
```

Vous pouvez trouver une démonstration complète d'une application angulaire à configuration dynamique sur mon Github ici.

## Substitution du fichier config.json sur le serveur de déploiement

Maintenant que nous avons configuré l'application pour la configuration dynamique, la prochaine étape consiste à configurer le remplacement du fichier de configuration sur le serveur de déploiement.

Vous pouvez faire cela en utilisant **Octopus**, qui a une fonction intelligente pour **remplacer un fichier JSON** par des valeurs de configuration pour l'environnement. Les autres serveurs de déploiement devraient avoir des fonctionnalités similaires pour substituer un fichier JSON juste avant de déployer l'application sur le serveur frontal.

## Conclusion

Nous avons discuté des problèmes posés par la méthode de “Angular CLI” pour gérer la configuration de l’environnement avec **un build par environnement**. Nous avons également cherché à déterminer l’intérêt de **build une version à la fois**. Nous avons examiné comment implémenter cela à l'aide d'un service app.init qui chargeait un fichier de configuration dynamique lors de l'initialisation, avec des valeurs définies par le serveur de déploiement.
