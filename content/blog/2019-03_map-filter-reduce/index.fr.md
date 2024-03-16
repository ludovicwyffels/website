---
title: "Map, filter, reduce"
authors: [ludovicwyffels]
date: 2019-03-03T08:35:31+02:00
summary: "Ces trois fonctions sont utiles pour parcourir une liste (ou un tableau) et effectuer une sorte de transformation ou de calcul."
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
  - "Javascript"
  - "TypeScript"
---

Ces trois fonctions sont utiles pour parcourir une liste (ou un tableau) et effectuer une sorte de transformation ou de calcul. Cela produira alors une nouvelle liste ou le résultat du calcul effectué sur la liste précédente.

## Les types

Avant de plonger dans map, filter et reduce, configurons la liste.

```js
const enum House {
  Gryffindor = "Gryffindor",
  Hufflepuff = "Hufflepuff",
  Ravenclaw = "Ravenclaw",
  Slytherin = "Slytherin"
}
type Wizard = {
  name: string;
  house: House;
  points: number;
};
```
> types.ts
Chaque objet de l'assistant a un nom, une maison et le nombre de points qu'il a gagnés pour sa maison. Déclarons un groupe de magiciens et mettons-les dans une liste.

```js
const HarryPotter: Wizard = {
  name: "Harry Potter",
  house: House.Gryffindor,
  points: 40
};
const HermioneGranger: Wizard = {
  name: "Hermione Granger",
  house: House.Gryffindor,
  points: 140
};
const DracoMalfoy: Wizard = {
  name: "Draco Malfoy",
  house: House.Slytherin,
  points: -20
};
const TaylorSwift: Wizard = {
  name: "Taylor Swift",
  house: House.Slytherin,
  points: 100
};
const LinManuelMiranda: Wizard = {
  name: "Lin Manuel Miranda",
  house: House.Slytherin,
  points: 5000
};
const CedricDiggory: Wizard = {
  name: "Cedric Diggory",
  house: House.Hufflepuff,
  points: 12
};
const SallyPerks: Wizard = {
  name: "Sally Perks",
  house: House.Hufflepuff,
  points: 15
};
const LunaLovegood: Wizard = {
  name: "Luna Lovegood",
  house: House.Ravenclaw,
  points: 100
};
const ChoChang: Wizard = {
  name: "Cho Chang",
  house: House.Ravenclaw,
  points: 100
};
const wizards: Wizard[] = [
  HarryPotter,
  HermioneGranger,
  DracoMalfoy,
  LinManuelMiranda,
  TaylorSwift,
  CedricDiggory,
  SallyPerks,
  LunaLovegood,
  ChoChang
];
```
> wizards.ts
## Map

Maintenant que nous avons la base, allons-y. La première fonction est la plus simple, map. Map itère (ou boucle) sur une liste, applique une fonction à chaque élément de cette liste, puis renvoie une nouvelle liste d'éléments transformés. Regardons un exemple.

```js
const wizardNames = wizards.map(wizard => wizard.name);
```
> wizard-names.ts

Cette fonction parcourt la liste des assistants, obtient leur nom et le place dans un nouveau tableau. Le résultat de ceci ressemble à ceci.

```text
[
  "Harry Potter",
  "Hermione Granger",
  "Draco Malfoy",
  "Lin Manuel Miranda",
  "Taylor Swift",
  "Cedric Diggory",
  "Sally Perks",
  "Luna Lovegood",
  "Cho Chang"
];
```

Dans cet exemple, nous utilisions une fonction lambda (ou fonction anonyme), mais nous pouvons également utiliser une fonction nommée.

```js
function wizardToString({ name, house, points }: Wizard) {
  return `${name}, ${house}, ${points}`;
}
const wizardStrings = wizards.map(wizardToString);
```
> wizardToString.ts

Dans cet exemple, nous avons une fonction appelée `wizardToString` que nous transmettons directement au map. Il retournera alors une nouvelle liste qui ressemble à ceci.

```text
[
  "Harry Potter, Gryffindor, 40",
  "Hermione Granger, Gryffindor, 140",
  "Draco Malfoy, Slytherin, -20",
  "Lin Manuel Miranda, Slytherin, 5000",
  "Taylor Swift, Slytherin, 100",
  "Cedric Diggory, Hufflepuff, 12",
  "Sally Perks, Hufflepuff, 15",
  "Luna Lovegood, Ravenclaw, 100",
  "Cho Chang, Ravenclaw, 100"
];
```

## Filter

Le `filter` se comporte comme un `map` dans la mesure où il itère sur la liste, mais au lieu de transformer chaque élément, il transforme la liste entière. Le filter prend une fonction qui renvoie *true* ou *false* ou un *prédicat*. Il renvoie ensuite une nouvelle liste avec des éléments où le prédicat renvoie `true`. Regardons un exemple.

```js
const slytherins = wizards.filter(wizard => wizard.house === House.Slytherin);
```
> slytherins.ts

Dans cet exemple, nous filtrons par-dessus la liste et n'incluons que les sorciers qui se trouvent dans la maison Serpentard. Le résultat serait ceci.

```text
[
  { name: "Draco Malfoy", house: "Slytherin", points: -20 },
  { name: "Lin Manuel Miranda", house: "Slytherin", points: 5000 },
  { name: "Taylor Swift", house: "Slytherin", points: 100 }
];
```

En passant, Taylor et Lin sont deux des Serpentards les plus acclamés de notre époque.

Comme avec map, nous n'avons pas besoin d'utiliser un lambda , nous pouvons également utiliser une fonction prédéfinie.

```js
function isWinner({ points }: Wizard) {
  return points > 0;
}
function isLoser(wizard: Wizard) {
  return !isWinner(wizard);
}
const winners = slytherins.filter(wizard => wizard.points > 0);
const losers = slytherins.filter(wizard => wizard.points <= 0);
```
> winners-losers.ts

Dans cet exemple, nous faisons deux listes, la liste des Serpentards ayant gagné des points (gagnants) et la liste des Serpentards ayant perdu des points (perdants). Nous pouvons voir ces résultats ci-dessous.

```text
const winnersResult = [
  { name: "Lin Manuel Miranda", house: "Slytherin", points: 5000 },
  { name: "Taylor Swift", house: "Slytherin", points: 100 }
];
const losersResult = [
  { name: "Draco Malfoy", house: "Slytherin", points: -20 }
];
```

## Reduce

Nous arrivons maintenant à la fonction la plus intéressante, reduce. Reduce itère sur une liste et produit une valeur unique. Regardons un exemple.

Supposons que nous voulions obtenir le nombre total de points pour tous les assistants. Nous pouvons utiliser réduire pour faire cela.

```js
const totalPoints = wizards.reduce(
  (accumulator, { points }) => accumulator + points,
  0
);
```

Que se passe t-il ici? Bien réduire est une fonction qui prend deux arguments, une fonction et une valeur initiale pour l’accumulateur. L'accumulateur est le nom de la chose réduire les rendements. Dans ce cas, nous commençons le compte de points à 0.

Maintenant, la fonction prend l'état actuel de l'accumulateur et de l'élément dans la liste qu'il est supposé traiter. Pour le premier assistant, il passera 0 pour l'accumulateur. Cette fonction retourne ensuite `accumulator + points`. Cela finira par résumer tous les points. Si vous êtes curieux, le résultat est 5487.

Maintenant, l'accumulateur peut être n'importe quoi, on peut même utiliser réduire pour produire un objet. Regardons un exemple où nous additionnons les points pour chaque maison.

```js
const pointsPerHouse = wizards.reduce((acc, { house, points }) => {
  if (!acc[house]) {
    acc[house] = 0;
  }
  acc[house] += points;
  return acc;
}, {});
```
> points-per-house.ts

Dans ce cas, nous initialisons notre accumulateur ou `acc` avec `{}`. Ensuite, pour chaque assistant, nous appelons une fonction qui ajoute le nombre de points qu’il a gagnés pour sa maison. Si vous êtes curieux, ce résultat ressemble à ceci.

```text
{
  Gryffindor: 180,
  Slytherin: 5080,
  Hufflepuff: 27,
  Ravenclaw: 200
};
```

Regardons un autre exemple, disons que nous voulons le meilleur assistant pour chaque maison. Nous pouvons modifier notre fonction précédente pour utiliser le meilleur assistant pour chaque maison.

```js
const bestPerHouse = wizards.reduce((acc, wizard) => {
  const { house, points } = wizard;
  if (!acc[house]) {
    acc[house] = wizard;
  }
  if (acc[house].points < points) {
    acc[house] = wizard;
  }
  return acc;
}, {});
```

Si vous êtes curieux, le résultat est le suivant.

```text
{
  Gryffindor: { name: "Hermione Granger", house: "Gryffindor", points: 140 },
  Slytherin: { name: "Lin Manuel Miranda", house: "Slytherin", points: 5000 },
  Hufflepuff: { name: "Sally Perks", house: "Hufflepuff", points: 15 },
  Ravenclaw: { name: "Luna Lovegood", house: "Ravenclaw", points: 100 }
};
```

Juste un peu plus de plaisir maintenant, nous pouvons utiliser `Object.values` pour transformer cet map.

```js
const bestNamesPerHouse = Object.values(bestPerHouse).map(wizardToString);
[
  "Hermione Granger, Gryffindor, 140",
  "Lin Manuel Miranda, Slytherin, 5000",
  "Sally Perks, Hufflepuff, 15",
  "Luna Lovegood, Ravenclaw, 100"
];
```
> best-names-per-house.ts

Maintenant, nous avons de beaux noms pour la meilleure personne dans chaque maison.
