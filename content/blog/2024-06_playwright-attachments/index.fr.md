---
title: "Créer et exécuter des jeux de tests Playwright à l'aide de tags et de grep"
authors: [ludovicwyffels]
date: 2024-06-29T18:00:00+02:00
summary: Au fur et à mesure que votre suite de tests s'étoffe, il se peut que vous souhaitiez exécuter un sous-ensemble de vos tests.
draft: false
showToc: true
featureimage: 
featureimagecaption: 
  
tags:
  - "Playwright"
categories: ["Playwright"]

source:
  - https://timdeschryver.dev/blog/create-and-run-playwright-test-sets-using-tags-and-grep
---

Au fur et à mesure que votre suite de tests s'étoffe, il se peut que vous souhaitiez exécuter un sous-ensemble de vos tests. Même si Playwright peut exécuter des tests en parallèle, il peut être judicieux, à un moment donné, de diviser vos tests en groupes plus petits.

Dans cet article de blog, nous verrons comment utiliser la fonctionnalité `grep` pour exécuter un sous-ensemble de vos cas de test dans Playwright. Le plus grand avantage d'organiser correctement vos tests en utilisant des tags est que vous pouvez cibler spécifiquement les cas de test qui doivent être exécutés. Voyons quelques exemples :

- Vous pouvez exécuter toute votre suite de tests la nuit sans déranger votre équipe, et n'exécuter qu'un sous-ensemble de vos tests sur une demande d'extraction pour que votre pipeline de CI reste rapide et efficace.
- Une équipe (par exemple, QA ou l'équipe chargée des fonctionnalités) ne peut exécuter que les tests dont elle est responsable.
- Vous pouvez exécuter des tests de fumée qui n'effectuent que des actions de lecture lors d'une mise en production.

## La fonctionnalité `grep`

Pour ceux qui ne sont pas très familiers avec `grep` (abréviation de Global Regular Expression Print), il s'agit d'un puissant utilitaire de ligne de commande de type Unix qui permet de rechercher dans des ensembles de données en texte brut les lignes qui correspondent à une expression régulière. En d'autres termes, c'est un outil qui vous permet de rechercher efficacement un texte à l'aide d'une regex.

Quel est le rapport avec Playwright? Playwright vous permet d'utiliser la [fonctionnalité grep](https://playwright.dev/docs/api/class-testproject#test-project-grep) pour exécuter des tests spécifiques à l'aide de la description du test.

Pour définir le motif grep, vous pouvez utiliser l'argument `--grep` (ou `-g`) via la ligne de commande ou la propriété `grep` dans le fichier de configuration. Vous pouvez également utiliser l'option `--grep-invert` ou la propriété `grepInvert` pour exclure les tests qui correspondent au motif.

Personnellement, je préfère utiliser la propriété `grep` via la ligne de commande, car elle est plus facile à modifier. Vous pouvez également définir plusieurs scripts dans votre fichier `package.json` avec les différentes expressions grep.

Pour voir comment fonctionne `grep`, créons quelques cas de test et voyons ce qui se passe lors de l'utilisation de grep.

{{< terminal title="customer-actions.spec.ts" >}}
```ts
import { test } from '@playwright/test';
 
test('customer can create an appointment', async ({ page }) => {
    ...
});
 
test('customer can see all appointments', async ({ page }) => {
    ...
});
 
test('customer can create an order', async ({ page }) => {
    ...
});
```
{{</ terminal >}}

Vous pouvez cibler un cas de test spécifique en utilisant les commandes suivantes:

{{< terminal title="Terminal" >}}
```shell
# Run tests matching "customer" (all of them)
npx playwright test --grep "customer"
 
# Run tests matching "appointment" (the first two)
npx playwright test --grep "appointment"
 
# Run tests matching "order" (the last one)
npx playwright test --grep "order"
 
# Run tests matching "create" (the first and last ones)
npx playwright test --grep "create"
```
{{</ terminal >}}

## Utilisation des tags de test Playwright

Maintenant que nous savons comment fonctionne `grep`, voyons comment nous pouvons utiliser les tags pour organiser nos tests. L'utilisation de `grep` sans tags fonctionne, mais peut rapidement devenir un désordre.

En utilisant le [système de tag](https://playwright.dev/docs/test-annotations#tag-tests), vous pouvez regrouper vos tests en ensembles logiques. Pour définir un tag, vous pouvez utiliser la syntaxe `@tag` dans la description du test. Bien que techniquement vous puissiez utiliser n'importe quelle chaîne de caractères comme tag, la documentation encourage l'utilisation de la syntaxe `@tag`, nous allons donc nous y tenir. Une autre règle non écrite consiste à placer les tags à la fin de la description du test.

Pour vous donner une idée de ce à quoi cela ressemble, une version remaniée de l'exemple précédent ressemblerait à ceci:

{{< terminal title="customer-actions.spec.ts" >}}
```ts
import { test } from '@playwright/test';
 
test('customer can create an appointment @feature-appointments', async ({ page }) => {
    ...
});
 
test('customer can see all appointments @feature-appointments @readonly', async ({ page }) => {
    ...
});
 
test('customer can create an order @feature-orders', async ({ page }) => {
    ...
});
```
{{</ terminal >}}

Pour utiliser grep, vous pouvez utiliser les commandes suivantes pour cibler les cas de test avec des balises :

{{< terminal title="Terminal" >}}
```shell
# Run tests with the @feature-appointments tag (the first two)
npx playwright test --grep "@feature-appointments"
 
# Run tests with the @feature-orders tag (the last one)
npx playwright test --grep "@feature-orders"
 
# Run tests with the @readonly tag (the second one)
npx playwright test --grep "@readonly"
```
{{</ terminal >}}

Pour l'instant, nous n'avons vu que des descriptions de cas de test, mais nous pouvons également ajouter des tests à un groupe de tests en utilisant `test.describe`. Cette fonction fonctionne exactement de la même manière que la fonction `test`, mais elle vous permet d'ajouter une balise à plusieurs cas de test à la fois.

{{< terminal title="custom-actions.spec.ts" >}}
```ts
import { test } from '@playwright/test';
 
test.describe('@feature-appointments', () => {
    test('customer can create an appointment', async ({ page }) => {
        ...
    });
 
    test('customer can see all appointments @readonly', async ({ page }) => {
        ...
    });
});
 
test.describe('@feature-orders', () => {
    test('customer can create an order', async ({ page }) => {
        ...
    });
});
```
{{</ terminal >}}

## La flexibilité des tags de test

Au lieu d'utiliser simplement l'option `--grep` pour cibler une tag spécifique, vous pouvez également utiliser les tags de test pour gérer des scénarios plus complexes.

Jetez un coup d'oeil aux exemples suivants:

{{< terminal title="Terminal" >}}
```shell
# Run tests containing the @feature tag (the tags @feature-appointments or @feature-orders are also a match)
npx playwright test --grep "@feature"
 
# Run tests containing the @feature-appointments tag AND do not contain the @readonly tag
npx playwright test --grep "@feature-appointments" --grep-invert "@readonly"
 
# Run tests containing the @feature-appointments tag AND the @readonly tag
# This also works when the describe block contains one of the given tags
npx playwright test --grep "(?=.*@feature-appointments)(?=.*@readonly)"
```
{{</ terminal >}}

{{< alert icon="pencil" >}}
Je n'ai pas trouvé de moyen de créer un `OR` en utilisant la ligne de commande. Vous pourriez vous rabattre sur le fichier de configuration en cas de besoin, avec la syntaxe suivante `"/@feature-appointments|@feature-orders/"`
{{</ alert >}}

## Conclusion

Nous avons examiné la fonctionnalité `grep` en combinaison avec les tags de test pour vous aider à mettre à l'échelle votre suite de tests. Dans Playwright, nous pouvons utiliser des tags pour organiser nos tests en ensembles logiques, et avec les options `grep` et `grep-invert`, nous pouvons cibler des ensembles de tests spécifiques à exécuter.

Bien que nous ayons vu précédemment que l'exécution de tests en parallèle est également un bon moyen d'améliorer votre pipeline, l'utilisation de ces techniques rend votre pipeline plus efficace. Un test non exécuté est toujours plus rapide qu'un test exécuté. Cela devient encore plus important lorsque vous avez une grande suite de tests.

Pour terminer ce billet, j'aimerais partager quelques tags que j'utilise dans ma suite de tests :

- `@smoke`: un sous-ensemble de tests qui n'effectuent que des vérifications simples et rapides (principalement en lecture seule)
- `@flow`: un sous-ensemble de tests qui couvrent un flux entier (tests plus importants)
- `@ci`: un sous-ensemble de tests qui sont exécutés dans le pipeline CI
- `@feature`: un sous-ensemble de tests qui couvrent une fonctionnalité spécifique
