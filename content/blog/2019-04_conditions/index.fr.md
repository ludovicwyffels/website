---
title: "Comment écrire de meilleures conditions en JavaScript"
authors: [ludovicwyffels]
date: 2019-04-19T09:45:58+02:00
summary: " "
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "Javascript"
---

## 1. Utilisez Array.includes pour plusieurs critères

Jetons un coup d'oeil à l'exemple ci-dessous:

```js
// condition
function test(fruit) {
  if (fruit == 'apple' || fruit == 'strawberry') {
    console.log('red');
  }
}
```

À première vue, l'exemple ci-dessus semble bon. Cependant, que se passe-t-il si nous obtenons plus de fruits rouges, par exemple des `cherry` et des `cranberries`? Allons-nous étendre la déclaration avec plus `||`?

Nous pouvons réécrire la condition ci-dessus en utilisant `Array.includes ([Array.includes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)):

```js
function test(fruit) {
  // extract conditions to array
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];
  if (redFruits.includes(fruit)) {
    console.log('red');
  }
}
```

## 2. Moins d'emboîtements, retour hâtif

Développons l'exemple précédent pour inclure deux conditions supplémentaires:

- si aucun fruit n'est fourni, lancer une erreur
- acceptée et imprimer la quantité de fruits si elle dépasse 10.

```js
function test(fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];
  // condition 1: fruit must has value
  if (fruit) {
    // condition 2: must be red
    if (redFruits.includes(fruit)) {
      console.log('red');
      // condition 3: must be big quantity
      if (quantity > 10) {
        console.log('big quantity');
      }
    }
  } else {
    throw new Error('No fruit!');
  }
}
// test results
test(null); // error: No fruits
test('apple'); // print: red
test('apple', 20); // print: red, big quantity
```

Regardez le code ci-dessus, nous avons:

- 1 instruction if / else qui filtre les conditions non valides
- 3 niveaux de déclarations if imbriqué (conditions 1, 2 et 3)

Une règle générale que je suis personnellement est le **retour anticipé lorsque des conditions invalides sont trouvées**.

```js
/_ return early when invalid conditions found _/
function test(fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];
  // condition 1: throw error early
  if (!fruit) throw new Error('No fruit!');
  // condition 2: must be red
  if (redFruits.includes(fruit)) {
    console.log('red');
    // condition 3: must be big quantity
    if (quantity > 10) {
      console.log('big quantity');
    }
  }
}
```

En faisant cela, nous avons un niveau moins de déclarations imbriquées. Ce style de codage convient particulièrement lorsque vous avez une déclaration `if` long (imaginez que vous devez faire défiler l'écran jusqu'au bas de la page pour savoir qu'il existe une autre instruction, pas cool).

Nous pouvons réduire davantage la nidification en inversant les conditions et en revenant plus tôt. Regardez la condition 2 ci-dessous pour voir comment nous procédons :

```js
/_ return early when invalid conditions found _/
function test(fruit, quantity) {
  const redFruits = ['apple', 'strawberry', 'cherry', 'cranberries'];
  if (!fruit) throw new Error('No fruit!'); // condition 1: throw error early
  if (!redFruits.includes(fruit)) return; // condition 2: stop when fruit is not red
  console.log('red');
  // condition 3: must be big quantity
  if (quantity > 10) {
    console.log('big quantity');
  }
}
```

En inversant les conditions de la condition 2, notre code est maintenant exempt d'instruction imbriquée. Cette technique est utile lorsque la logique est longue et que nous voulons arrêter d'autres processus lorsqu'une condition n'est pas remplie.

Cependant, ce n'est pas une **règle absolue**. Demandez-vous si cette version (sans imbrication) est meilleure / plus lisible que la précédente (condition 2 avec imbriquée)?

Pour moi, je le laisserais comme dans la version précédente (condition 2 avec imbriquée) parce que:

- le code est court et simple, il est plus clair avec imbriqué si
- condition d'inversion peut impliquer plus de processus de pensée (augmentation de la charge cognitive)

Par conséquent, vise toujours **moins de nidification et de retour anticipé, mais n'en faites pas trop**. Il existe un article et une discussion sur StackOverflow qui approfondissent ce sujet si vous êtes intéressé:

- [Avoid Else, Return Early](http://blog.timoxley.com/post/47041269194/avoid-else-return-early) par Tim Oxley
- [Discussion StackOverflow](https://softwareengineering.stackexchange.com/questions/18454/should-i-return-from-a-function-early-or-use-an-if-statement) sur le style de programmation if/else

## 3. Utiliser les paramètres de fonction par défaut et la destruction

Je suppose que le code ci-dessous pourrait vous sembler familier. Nous devons toujours vérifier les valeurs `null` / `undefined` et assigner des valeurs par défaut lorsque vous utilisez JavaScript:

```js
function test(fruit, quantity) {
  if (!fruit) return;
  const q = quantity || 1; // if quantity not provided, default to one
  console.log(`We have ${q} ${fruit}!`);
}
//test results
test('banana'); // We have 1 banana!
test('apple', 2); // We have 2 apple!
```

En fait, on peut éliminer la variable q en assignant des paramètres de fonction par défaut.

```js
function test(fruit, quantity = 1) { // if quantity not provided, default to one
  if (!fruit) return;
  console.log(`We have ${quantity} ${fruit}!`);
}
//test results
test('banana'); // We have 1 banana!
test('apple', 2); // We have 2 apple!
```

Beaucoup plus facile et intuitif n'est-ce pas? Veuillez noter que chaque paramètre peut avoir son propre paramètre de fonction par défaut. Par exemple, nous pouvons aussi assigner une valeur par défaut aux fruits: `function test (fruit = 'unknown', quantity = 1)`.

Et si notre `fruit` est un objet? Peut-on assigner un paramètre par défaut?

```js
function test(fruit) { 
  // printing fruit name if value provided
  if (fruit && fruit.name)  {
    console.log (fruit.name);
  } else {
    console.log('unknown');
  }
}
//test results
test(undefined); // unknown
test({ }); // unknown
test({ name: 'apple', color: 'red' }); // apple
```

Regardez l'exemple ci-dessus : nous voulons afficher le nom du fruit s'il est disponible ou nous allons afficher inconnus. Nous pouvons éviter le contrôle conditionnel de `fruit && fruit.name` avec le paramètre de fonction par défaut et la destruction.

```js
// destructing - get name property only
// assign default empty object {}
function test({name} = {}) {
  console.log (name || 'unknown');
}
//test results
test(undefined); // unknown
test({ }); // unknown
test({ name: 'apple', color: 'red' }); // apple
```

Puisque nous n'avons besoin que de la propriété `name` de fruit, nous pouvons déstructurer le paramètre en utilisant `{name}`, alors nous pouvons utiliser `name` comme variable dans notre code au lieu de `fruit.name`.

Nous assignons aussi l'objet vide `{}` comme valeur par défaut. Si nous ne le faisons pas, vous obtiendrez une erreur lors de l'exécution de la ligne `test(undefined)` - `Cannot destructure property name of 'undefined' or 'null'.` car il n'y a pas de propriété `name` dans undefined.

Si cela ne vous dérange pas d'utiliser des bibliothèques tierces, il y a plusieurs façons de réduire les contrôles nuls:

- utiliser la [fonction get de Lodash](https://lodash.com/docs/4.17.11#get)
- utiliser la bibliothèque open source [idx](https://github.com/facebookincubator/idx) de Facebook (avec Babeljs)

Voici un exemple d'utilisation de Lodash:

```js
// Include lodash library, you will get _
function test(fruit) {
  console.log(__.get(fruit, 'name', 'unknown'); // get property name, if not available, assign default value 'unknown'
}
//test results
test(undefined); // unknown
test({ }); // unknown
test({ name: 'apple', color: 'red' }); // apple
```

## 4. Favorisez Map / Objet Littéral par rapport à l'instruction Switch

Regardons l'exemple ci-dessous - nous voulons afficher des fruits en fonction de la couleur:

```js
function test(color) {
  // use switch case to find fruits in color
  switch (color) {
    case 'red':
      return ['apple', 'strawberry'];
    case 'yellow':
      return ['banana', 'pineapple'];
    case 'purple':
      return ['grape', 'plum'];
    default:
      return [];
  }
}
//test results
test(null); // []
test('yellow'); // ['banana', 'pineapple']
```

Le code ci-dessus ne semble rien de mal, mais je le trouve assez verbeux. Le même résultat peut être obtenu avec un objet littéral avec une syntaxe plus prore:

```js
// use object literal to find fruits in color
  const fruitColor = {
    red: ['apple', 'strawberry'],
    yellow: ['banana', 'pineapple'],
    purple: ['grape', 'plum']
  };
function test(color) {
  return fruitColor[color] || [];
}
```

Vous pouvez également utiliser [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) pour obtenir le même résultat:

```js
// use Map to find fruits in color
const fruitColor = new Map()
  .set('red', ['apple', 'strawberry'])
  .set('yellow', ['banana', 'pineapple'])
  .set('purple', ['grape', 'plum']);
function test(color) {
  return fruitColor.get(color) || [];
}
```

Map est le type d'objet disponible depuis ES2015, qui vous permet d'enregistrer des paires de clés/valeur.
Devrions-nous interdire l'utilisation des déclarations switch? Ne vous limitez pas à cela. Personnellement, j'utilise des objets littéraux chaque fois que c'est possible, mais je n'établirais pas une règle stricte pour bloquer cela - utilisez celui qui a un sens pour votre scénario.
Todd Motto a un article qui creuse plus en profondeur sur les déclarations switch par rapport aux objets littéraux. Vous pouvez le lire [ici](https://toddmotto.com/deprecating-the-switch-statement-for-object-literals/).

### Refonte de la syntaxe

Pour l'exemple ci-dessus, nous pouvons réellement refactoriser notre code pour obtenir le même résultat avec `Array.filter`.

```js
const fruits = [
    { name: 'apple', color: 'red' }, 
    { name: 'strawberry', color: 'red' }, 
    { name: 'banana', color: 'yellow' }, 
    { name: 'pineapple', color: 'yellow' }, 
    { name: 'grape', color: 'purple' }, 
    { name: 'plum', color: 'purple' }
];
function test(color) {
  // use Array filter to find fruits in color
  return fruits.filter(f => f.color == color);
}
```

Il y a toujours plus d'une façon d'obtenir le même résultat. Nous en avons montré 4 avec le même exemple. Coder, c'est amusant !

## 5. Utilisez Array.every & Array.some pour tous les critères / critères partiels

Ce dernier conseil concerne l'utilisation de la nouvelle fonction JavaScript Array (mais pas si nouvelle) pour réduire les lignes de code. Regardez le code ci-dessous - nous voulons vérifier si tous les fruits sont de couleur rouge:

```js
const fruits = [
    { name: 'apple', color: 'red' },
    { name: 'banana', color: 'yellow' },
    { name: 'grape', color: 'purple' }
  ];
function test() {
  let isAllRed = true;
  // condition: all fruits must be red
  for (let f of fruits) {
    if (!isAllRed) break;
    isAllRed = (f.color == 'red');
  }
  console.log(isAllRed); // false
}
```

Le code est si long ! Nous pouvons réduire le nombre de lignes avec `Array.every`:

```js
const fruits = [
    { name: 'apple', color: 'red' },
    { name: 'banana', color: 'yellow' },
    { name: 'grape', color: 'purple' }
  ];
function test() {
  // condition: short way, all fruits must be red
  const isAllRed = fruits.every(f => f.color == 'red');
  console.log(isAllRed); // false
}
```

C'est plus propre, non ? De la même manière, si nous voulons tester si un fruit est rouge, nous pouvons utiliser Array.some pour l'obtenir en une ligne.

```js
const fruits = [
    { name: 'apple', color: 'red' },
    { name: 'banana', color: 'yellow' },
    { name: 'grape', color: 'purple' }
];
function test() {
  // condition: if any fruit is red
  const isAnyRed = fruits.some(f => f.color == 'red');
  console.log(isAnyRed); // true
}
```

## Résumé

Produisons ensemble un code plus lisible. J'espère que vous avez appris quelque chose de nouveau dans cet article.

Happy coding!
