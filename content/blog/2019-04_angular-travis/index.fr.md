---
title: "Angular DevOps: CT/CI avec Travis CI et Github Pages"
authors: [ludovicwyffels]
date: 2019-04-29T08:12:15+02:00
summary: "Utilisation de Travis CI pour implémenter les tests continus (CT) et l'intégration continue (CI) afin de déployer notre application Angular sur Github Pages"
draft: false
categories: ["Node.js", "DevOps", "Angular"]
tags:
  - "Node.js"
  - "DevOps"
  - "Travis CI"
  - "Github Pages"
  - "Angular"
---

Cet article explique comment utiliser Travis CI pour surveiller les modifications apportées à la branche principale de notre référentiel GitHub . Nous allons configurer Travis CI de manière à ce que lors de la mise en place d'un nouveau commit pour notre application Angular, celui-ci:

- Exécuter le linter
- Lancer nos tests unitaires
- Lancer nos tests E2E
- Construire notre application pour la production
- Déployé vers GitHub Pages

## Définitions

### Test continu (CT)

**Les [tests continus](https://en.wikipedia.org/wiki/Continuous_testing)** consistent à exécuter des tests automatisés dans le cadre du pipeline de livraison de logiciels pour obtenir un retour immédiat sur les risques commerciaux associés à une version candidate du lociel.

### Intégration Continue (CI)

**L'[intégration continue](https://en.wikipedia.org/wiki/Continuous_integration)** est un ensemble de pratiques utilisées en génie logiciel consistant à vérifier à chaque modification de code source que le résultat des modifications ne produit pas de régression dans l'application développée.

### En pratique

Ok, ces définitions sont bien. Mais, en pratique, qu'est-ce qu'ils signifient vraiment? Pour les besoins de cet article, je vais utiliser des définitions similaires, mais très pragmatiques et spécifiques:

### CT

Nos tests sont exécutés automatiquement avant chaque déploiement. Et notre code ne sera pas déployé si des tests échouent.

### CI

Transférer des modifications dans une branche spécifique de notre repo GitHub lance un processus de déploiement automatisé.

## Créer une application Angular

Pour commencer, créez une nouvelle application Angular en utilisant _Angular CLI_.

```bash
ng new travis-demo
cd travis-demo
ng serve
```

Aller sur: [http://localhost:4200](http://localhost:4200)

## GitHub

Créer un nouveau repo GitHub: `travis-demo`

Nous devons maintenant ajouter le repo GitHub en tant que distant de notre repo Git local. Vous devrez peut-être d'abord vous engager si vous avez effectué des mises à jour.

```bash
git commit -am "initial"
git remote add origin https://github.com/ludovicwyffels/travis-demo.git
git push -u origin master
```

Assurez-vous de remplacer **ludovicwyffels** par votre propre identifiant GitHub.

## Travis CI

Inscrivez-vous à [Travis CI](https://travis-ci.org/) en utilisant votre compte GitHub.

Accédez à votre profil pour voir la liste des repos.

Si vous avez déjà un compte, vous devrez utiliser le bouton **Sync account** pour que votre nouveau repo apparaisse dans la liste. De plus, vous devrez peut-être utiliser le filtre pour voir réellement votre repo si vous en avez beaucoup.

Vous pouvez cliquer sur le bouton Paramètres à droite du repo.

## Ajouter une configuration Travis CI

Afin de dire à Travis CI de faire quelque chose avec notre repo, nous devons ajouter un fichier de configuration Travis CI.

Créez un fichier à la racine de votre espace de travail appelé `.travis.yml` avec le contenu suivant:

```yml
language: node_js
node_js:
  - "10"
dist: trusty
sudo: required
branches:
  only:
  - master
before_script:
  - npm install -g @angular/cli
script:
- ng lint
- ng build --prod --base-href https://ludovicwyffels.github.io/travis-demo/
```

Pour le `--base-ref` vous devrez utiliser votre propre identifiant GitHub.

Ce fichier indique à Travis CI de procéder comme suit:

1. Utilisez Node.js
2. Surveillez uniquement la branche principale pour connaître les modifications.
3. Avant d'exécuter l'un des scripts, installez **Angular CLI**
4. Assurez-vous que l'application respecte nos règles en matière de linting utilisant `ng lint`.
5. Construisez notre application en utilisant `ng build`.

Après avoir ajouté le fichier de configuration Travis CI, commiter et pousser.

```bash
git add .travis.yml
git commit -am "Travis CI configuration"
git push
```

Après avoir effectué cette opération, passez au **tableau de bord Travis CI** pour afficher le journal Travis CI au fur et à mesure de la création de votre application. Vous devrez peut-être cliquer sur l'onglet **Current** pour le voir se développer. À l'extrême droite du journal, vous pouvez cliquer sur **Follow log** pour faciliter l'affichage du journal mis à jour.

Une fois que Travis CI a terminé notre script et créé l'application, vous verrez l'icône virer au vert pour vous informer que votre script s'est terminé avec succès.

## Test continu

Maintenant que nous avons créé nos applications, allons dans le monde des **tests continus** en laissant **Travis CI** exécuter nos **tests unitaires** à chaque nouveau commit.

Malheureusement, nous ne pouvons pas simplement `npm run test` sur Travis CI. En effet, nous ne pouvons pas réellement lancer une interface graphique de navigateur. Nous allons donc utiliser **Headless Chrome** pour exécuter nos tests unitaires.

Suivez les instructions pour créer un nouveau script npm comme celui-ci:

```text
"test-headless": "ng test --watch=false --browsers=ChromeHeadless",
```

Nous pouvons maintenant exécuter nos tests unitaires en utilisant Headless Chrome comme ceci:

```bash
npm run test-headless
```

Maintenant, ajouter `npm run test-headless` à notre fichier **.travis.yml** dans la section script comme ceci:

```yml
script:
  - ng lint
  - npm run test-headless
  - ng build --prod --base-href https://ludovicwyffels.github.io/travis-demo/
```

Commiter et push sur GitHub:

```bash
git add .travis
git commit -am "Added unit for Travis CI using Headless Chrome"
git push
```

Après avoir pusher, passez au tableau de bord Travis CI pour regarder votre projet exécuter les tests unitaires, puis faire le build.

## Intégration continue

Maintenant que nous testons et buildons, nous souhaitons déployer notre application.

Nous devons créer un jeton d'accès personnel GitHub. Suivez [ces instructions.](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line)

Dans le tableau de bord Travis CI, accédez à votre projet. En haut à droite, cliquez sur **Paramètres**. Faites défiler jusqu'à la section **Variables d'environnement**.

Ajoutez une nouvelle variable d'environnement nommée: `GITHUB_TOKEN`

Pour la valeur, collez la valeur réelle de votre jeton d’accès personnel GitHub que vous avez généré. Cliquez sur **Ajouter**.

## Déploiement sur les pages GitHub

Enfin, configurons Travis CI pour le déploiement sur GitHub Pages.

Ajoutez une section de déploiement à votre **.travis.yml**. A ce stade, votre fichier devrait resembler à ceci:

```yml
language: node_js
node_js:
  - "10"
dist: trusty
sudo: required
branches:
  only:
  - master
before_script:
  - npm install -g @angular/cli
script:
  - ng lint
  - npm run test-headless
  - ng build --prod --base-href https://ludovicwyffels.github.io/travis-demo/
deploy:
  provider: pages
  skip_cleanup: true
  github_token: $GITHUB_TOKEN
  local_dir: dist/travis-demo
  on:
    branch: master
```

Encore une fois, assurez-vous que vous utilisez **votre propre identifiant GitHub** au lien de ludovicwyffels.

Ceci indique à Travis CI d'utiliser notre jeton GitHub à partir de la variable d'environnement: `GITHUB_TOKEN`

En outre, il spécifie que les fichiers à déployer proviennent de notre dossier **dist**: `dist/travis-demo`

Engagez-vous et appuyez sur GitHub:

```bash
git commit -am "Deploy to GitHub pages"
git push
```

Nous devrions également pouvoir accéder à l'URL de nos pages GitHub et voir notre application déployée.

```text
https://ludovicwyffels.github.io/travis-demo/
```
