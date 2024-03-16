---
title: "Mocking de la date actuelle dans les tests de Jest"
authors: [ludovicwyffels]
date: 2019-08-25T09:51:03+02:00
summary: "Il y a des situations où new Date() ou Date.now est utilisée dans le code de l’application. Ce code doit être testé, et il est toujours difficile de se rappeler comment le moquer."
draft: false
categories: ["Node.js", "Jest"]
tags:
  - "Node.js"
  - "Jest"
  - "Mocking"
  - "Javascript"
---

Il y a des situations où `new Date()` ou `Date.now` est utilisée dans le code de l'application. Ce code doit être testé, et il est toujours difficile de se rappeler comment le moquer.

## L'utilisation de `Date.now` vs `new Date()`

`Date.now()` retourne le temps au format [unix](https://en.wikipedia.org/wiki/Unix_time), c'est à dire "le nombre de millisecondes écoulées depuis le 1er janvier 1970 00:00:00 UTC". (voir `Date.now` sur [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now)).

`new Date()` retourne un nouvel objet Date, et se comporte différemment en fonction de l'entrée qui lui est passée. S'il est appelé sans rien, il retourne la date actuelle.

Les valeurs suivantes sont équivalentes, bien que les valeurs stockées dans les deux variables soient strictement différentes.

```js
const now = new Date();
const explicitNow = new Date(Date.now());
```

Les valeurs sont strictement différentes parce que le "now" est calculé à des moments différents, mais comme le constructeur Date (new Date()) supporte le passage d'un temps unix à celui-ci, les deux sont équivalents.

L'utilisation de la `new Date(Date.now())` rend le code beaucoup plus facile à tester. Mocker une fonction qui retourne un nombre (comme Date.now) est beaucoup plus facile que se moquer d'un constructeur.

Par exemple, le code complet du paquet jest-mock-now est le suivant (voir le code sur github.com/mattiaerre/jest-mock-now) :

```js
const { NOW } = require('./constants');

module.exports = date => {
  const now = date ? date.getTime() : NOW;
  Date.now = jest.spyOn(Date, 'now').mockImplementation(() => now);
  return now;
};
```

## Remplacer `Date.now` par un substitut

```js
const literallyJustDateNow = () => Date.now();

test('It should call and return Date.now()', () => {
  const realDateNow = Date.now.bind(global.Date);
  const dateNowStub = jest.fn(() => 1530518207007);
  global.Date.now = dateNowStub;

  expect(literallyJustDateNow()).toBe(1530518207007);
  expect(dateNowStub).toHaveBeenCalled();

  global.Date.now = realDateNow;
});
```

Ce n'est pas vraiment une astuce spécifique à Jest, nous accédons simplement à l'objet `global` de Node et remplaçons `Date.now` par un stub.

## Espionnez Date.now et ajoutez une implémentation fictive

Une implémentation simplifiée d'un test similaire serait d'utiliser `jest.spyOn(global.Date,'now').mockImplementation()`.

Notre implémentation du mock utilisera une date codée en dur initialisée à l'aide de la `new Date('valid-date-string')` et return `valueOf()`, qui correspond à l'heure unix de cette date.

```js
const getNow = () => new Date(Date.now());

test('It should create correct now Date', () => {
  jest
    .spyOn(global.Date, 'now')
    .mockImplementationOnce(() =>
      new Date('2019-08-24T11:01:58.135Z').valueOf()
    );

  expect(getNow()).toEqual(new Date('2019-08-24T11:01:58.135Z'));
});
```

Cela a l'avantage de ne pas avoir à remplacer la date réelle ou à la remettre à plus tard.

## Mocker toute la classe Date avec une instance à date fixe

```js
const getCurrentDate = () => new Date();
let realDate;

test('It should create new date', () => {
  // Setup
  const currentDate = new Date('2019-08-24T11:01:58.135Z');
  realDate = Date;
  global.Date = class extends Date {
    constructor(date) {
      if (date) {
        return super(date);
      }

      return currentDate;
    }
  };

  expect(getCurrentDate()).toEqual(new Date('2019-08-24T11:01:58.135Z'));

  // Cleanup
  global.Date = realDate;
});
```

> Source Github: ["Mocking current time for Date"](https://github.com/facebook/jest/issues/2234#issuecomment-445867096)

Comme nous l'avons mentionné dans l'introduction, se moquer de toute la classe est très brutal.

## Espionnez le nouveau constructeur Date() et ajoutez une implémentation fictive

```js
const getCurrentDate = () => new Date();
test('It should create new date', () => {
  jest
    .spyOn(global, 'Date')
    .mockImplementationOnce(() => new Date('2019-08-24T11:01:58.135Z'));

  expect(getCurrentDate()).toEqual(new Date('2019-08-24T11:01:58.135Z'));
});
```

C'est joli et concis, mais repose sur JavaScript hisser la folie et de savoir que Jest vous permet de simuler global.date.
