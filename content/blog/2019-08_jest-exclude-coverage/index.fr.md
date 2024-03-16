---
title: "Jest ignore ou exclure le fichier/fonction/état de la couverture de test"
authors: [ludovicwyffels]
date: 2019-08-18T10:56:42+02:00
summary: "Cet article explique comment ignorer les fichiers, fonctions, lignes et déclarations de la couverture dans Jest en utilisant la configuration ou istanbul pragmas. Ainsi que les raisons et les limites du pourquoi/comment vous feriez une telle chose."
draft: false
categories: ["Node.js", "Jest"]
tags:
  - "Node.js"
  - "Jest"
  - "JavaScript"
---

> En génie logiciel, la couverture de code est une mesure utilisée pour décrire le taux de code source exécuté d'un programme quand une suite de test est lancée. Un programme avec une haute couverture de code, mesurée en pourcentage, a davantage de code exécuté durant les tests ce qui laisse à penser qu'il a moins de chance de contenir de bugs logiciels non détectés, comparativement à un programme avec une faible couverture de code1,2. Différentes métriques peuvent être utilisées pour calculer la couverture de code ; les plus basiques sont le pourcentage de sous routine et le pourcentage d'instructions appelées durant l'exécution de la suite de test.
>
> [Couverture de code - Wikipedia](https://fr.wikipedia.org/wiki/Couverture_de_code)

La couverture de code est généralement utilisée comme mesure de qualité pour les logiciels, par exemple: 'Notre code doit avoir une couverture de tests de 80% et plus." La collection de la couverture de test avec Jest est aussi simple que l'utilisation de l'indicateur `--coverage` sur l'invocation.

Cet article explique comment ignorer les fichiers, fonctions, lignes et déclarations de la couverture dans Jest en utilisant la configuration ou istanbul pragmas. Ainsi que les raisons et les limites du pourquoi/comment vous feriez une telle chose.

## Comment Jest calcule-t-il la couverture ?

Jest utilise istanbul sous le capot pour calculer la couverture. La plupart du temps, Jest fait abstraction de cela pour l'utilisateur final, tout ce que vous avez à faire dans votre application est d'appeler `jest --coverage` (et configurer les champs de configuration de couverture appropriés). Le fait qu'istanbul soit utilisé en interne montre, par exemple, que la [documentation pour coverageReporters](https://jestjs.io/docs/en/configuration.html#coveragereporters-array-string) mentionne que "tout [reporter d'istanbul](https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib) peut être utilisé", ce sont en fait les données de couverture collectées et produites qui sont présentées dans les rapports.

## Pourquoi voudrais-je exclure ou ignorer des fichiers ou lignes de la couverture ?

Comme l'ont déclaré les responsables et les auteurs de la bibliothèque de couverture d'istanbul :

> Some branches in JS code are typically hard, if not impossible to test. Examples are a hasOwnProperty check, UMD wrappers and so on. Istanbul now has a facility by which coverage can be excluded for certain sections of code.
>
> [Istanbul - Ignore code for coverage purposes](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes)

De plus, une couverture à 100 % n'est pas nécessaire ou même raisonnable dans la plupart des cas. Certains fichiers ne contiennent pas de logique (métier). Ou ils contiennent une logique qui échouerait d'une manière très évidente (par exemple, un crash au démarrage).

Par exemple, le script qui démarrerait une application pourrait se lier à un port, ce qui la rend difficile à tester. Le fichier qui importe toutes les différentes dépendances et `app.use()` dans un paramètre Express serait un autre candidat pour peut-être éviter l'enfer du test unitaire/du mock de dépendance.

Une autre classe de fichiers/fonctions que vous pourriez vouloir ignorer à des fins de couverture sont les 'helpers' spécifiques aux tests. Peu importe que certains d'entre eux ne soient pas exécutés dans le cadre de tests, car ce n'est pas le code à tester.

Comme pour beaucoup de choses dans les logiciels, il s'agit de compromis.

## Exclure/ignorer le(s) fichier(s) de la couverture Jest en n'exécutant pas les tests pertinents à l'aide de la configuration

Il y a une option de configuration Jest option `testPathIgnorePatterns` ([voir la documentation pour testPathIgnorePatterns](https://jestjs.io/docs/en/configuration.html#testpathignorepatterns-array-string))

La façon la plus simple de configurer ceci est de le faire via le fichier `package.json` :

```json
{
  "jest": {
    "testPathIgnorePatterns" : [
      "<rootDir>/ignore/this/path/" 
    ]
  }
}
```

## Exclure/ignorer le(s) fichier(s) de la couverture en ne l'incluant pas dans la configuration de la collection de couvertures

Comme alternative ou augmentation à ne pas exécuter de tests (comme vu précédemment) de la couverture de Jest en ne l'incluant pas dans les rapports de couverture, cela est contrôlé par l'option de configuration `collectCoverageFrom` Jest ([voir les documents pour Jest collectCoverageFrom](https://jestjs.io/docs/en/configuration.html#collectcoveragefrom-array)).

Utilisez quelque chose comme ce qui suit :

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/{!(ignore-me),}.js"
    ]
  }
}
```

**Important**: assurez-vous d'entourer le nom du fichier ignoré avec ().

## Exclure/ignorer un fichier de la couverture Jest au niveau du fichier

Nous pouvons utiliser istanbul pragmas pour ignorer les fichiers en utilisant le commentaire suivant en haut de chaque fichier :

```js
/* istanbul ignore file */
```

## Exclure/ignorer la fonction de la couverture Jest

```js
/* istanbul ignore next */
function myFunc() {
  console.log(
    "Not covered but won't appear on coverage reports as such"
  );
}
```

## Exclure/ignorer une ou plusieurs lignes de la couverture Jest

**Évitez ceci si vous le pouvez, si vous testez du code, vous devriez probablement tester tout ce code.**

`istanbul ignore next` fonctionne également à ignorer les déclarations, définitions et expressions de JS, ce qui équivaut à ignorer/exclure la ligne de la couverture :

```js
// this function will appear as uncovered
function ignoreLine() {
  /* istanbul ignore next */
  console.log('This line won\'t appear as uncovered');
}
```

## Exclure/ignorer l'énoncé ou la clause de la couverture Jest

**Évitez ceci si vous le pouvez, si vous testez du code, vous devriez probablement tester tout ce code.**

```js
function myFunc(a) {
  /* istanbul ignore else */
  if (a) {
    // do some work
  } else {
    // do some other work
  }
}
```

## Lectures complémentaires

Consultez la [documentation originale d'istanbul sur ignorer du code pour la couverture](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md) pour un examen plus approfondi de la façon de procéder dans différentes situations.
