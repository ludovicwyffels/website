---
title: "Comment utiliser la console JavaScript aller au-delà de console.log()"
authors: [ludovicwyffels]
date: 2019-04-18T08:42:25+02:00
summary: "L'un des moyens les plus simples de déboguer quoi que ce soit en JavaScript consiste à `console.log` des éléments"
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "JavaScript"
---

```javascript
// In your gatsby-config.js
plugins: [
  {
    resolve: `gatsby-transformer-remark`,
    options: {
      plugins: [
        `gatsby-remark-prismjs`,
      ]
    }
  }
]
```

## Comment utiliser la console JavaScript aller au-delà de console.log()

L'un des moyens les plus simples de déboguer quoi que ce soit en JavaScript consiste à `console.log` des éléments à l'aide de `console.log`. Mais il y a beaucoup d'autres méthodes fournies par la console qui peuvent vous aider à mieux déboguer.

Le cas d'utilisation très simple consiste à enregistrer une chaîne ou un groupe d'objets JavaScript. Tout simplement,

```js
console.log ('Is this working?');
```

Imaginons maintenant un scénario où vous devez vous connecter à la console pour regrouper plusieurs objets.

```js
const foo = {id: 1, verified: true, color: 'green'};
const bar = {id: 2, verified: false, color: 'red'};
```

Le moyen le plus intuitif de consigner cela consiste à simplement `console.log(variable)` une après l’autre. Le problème est plus évident quand on voit comment il apparaît sur la console.

![Aucun nom de variable visible]()

Comme vous pouvez le constater, aucun nom de variable n'est visible. Cela devient extrêmement ennuyeux lorsque vous en avez beaucoup et que vous devez agrandir la petite flèche à gauche pour voir quel est exactement le nom de la variable. Entrez les noms de propriété calculés. Cela nous permet de regrouper toutes les variables ensemble dans un seul `console.log({ foo, bar });` et la sortie est facilement visible. Cela réduit également le nombre de lignes `console.log` dans notre code.

### console.table()

Nous pouvons aller plus loin en plaçant tout cela dans un tableau pour le rendre plus lisible. Chaque fois que vous avez des objets avec des propriétés communes ou un tableau d'objets, utilisez `console.table()`. Ici, nous pouvons utiliser `console.table({ foo, bar})` et la console affiche:

![console.table en action]()

### console.group()

Cela peut être utilisé lorsque vous souhaitez regrouper ou imbriquer des détails pertinents afin de pouvoir facilement lire les journaux.

Cela peut également être utilisé lorsque vous avez quelques instructions de journal dans une fonction et que vous voulez pouvoir voir clairement l'étendue correspondant à chaque instruction.

Par exemple, si vous enregistrez les détails d'un utilisateur:

```js
console.group('User Details');
console.log('name: John Doe');
console.log('job: Software Developer');
// Nested Group
console.group('Address');
console.log('Street: 123 Townsend Street');
console.log('City: San Francisco');
console.log('State: CA');
console.groupEnd();
console.groupEnd();
```

![Logs groupés]()

Vous pouvez également utiliser `console.groupCollapsed()` au lieu de `console.group()` si vous souhaitez que les groupes soient réduits par défaut. Vous auriez besoin d'appuyer sur le bouton de descripteur sur la gauche pour développer.

### console.warn() et console.error()

Selon la situation, pour vous assurer que votre console est plus lisible, vous pouvez ajouter des logs à l'aide de `console.warn()` ou `console.error()` . Il y a aussi `console.info()` qui affiche une icône 'i' dans certains navigateurs.

![Log d'avertissement et d'erreur]()

Cela peut être poussé plus loin en ajoutant un style personnalisé. Vous pouvez utiliser une directive `%c` pour ajouter un style à toute instruction de journal. Cela peut être utilisé pour différencier les appels d'API, les événements utilisateur, etc. en conservant une convention. Voici un exemple:

```js
console.log('%c Auth ', 
            'color: white; background-color: #2274A5', 
            'Login page rendered');
console.log('%c GraphQL ', 
            'color: white; background-color: #95B46A', 
            'Get user details');
console.log('%c Error ', 
            'color: white; background-color: #D33F49', 
            'Error getting user details');
```

Vous pouvez également modifier la `font-size` et le `font-style` ainsi que d’autres éléments CSS.

![Relevé des instructions console.log]()

### console.trace()

`console.trace()` une trace de pile dans la console et indique comment le code s'est terminé à un moment donné. Il existe certaines méthodes que vous ne souhaitez appeler qu'une seule fois, comme la suppression d'une base de données. `console.trace()` peut être utilisé pour s'assurer que le code se comporte comme nous le voulons.

### console.time()

Une autre chose importante en matière de développement front-end est que le code doit être rapide. `console.time() permet de chronométrer certaines opérations dans le code à des fins de test.
```js
let i = 0;
console.time("While loop");
while (i < 1000000) {
  i++;
}
console.timeEnd("While loop");
console.time("For loop");
for (i = 0; i < 1000000; i++) {
  // For Loop
}
console.timeEnd("For loop");
```

![Sortie console.time() pour les boucles]()

Espérons que l'article fournisse des informations sur les différentes manières d'utiliser la console.
