---
title: "Convertissez vos fonction callback en promise"
authors: [ludovicwyffels]
date: 2019-08-15T20:53:51+02:00
summary: "Débarrassez-vous de ces fonctions callback ennuyeuses avec des promise."
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
---

## Mais qu'est-ce qu'une Promise en Javascript et pourquoi vous devez l'utiliser?

Si vous abusez du callback, vous tomberez dans un anti-pattern, "callback hell" vu dans le code des programmeurs qui ne sont pas sages dans les voies de la programmation asynchrone.

```js
getUser(userId, function(err, user){
   getProduct(productId, function(err, product){
      createOrder(user, product, function(err, order){
          ...// Welcome to callback hell
       });
    });
});
```

## L'approche de la promise

```js
getUser(userId)
 .then(user => {
   return getProduct(user)
     .then(product => {
       return createOrder(user, wallet, product)
   })
 })
.catch(err => {
  console.log('Woops!')
})
```

En utilisant l'extrait de code suivant, vous serez en mesure d'utiliser la promise javascript avec des fonctions de style callback.

Vous n'avez besoin d'aucune bibliothèque externe, en fait, vous n'avez besoin que de 13 lignes de code.

```js
// Needs spread operator (... notation)
const promisify = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject)=>{
      fn(...args, function(err, res){
        if(err){
          return reject(err);
        }
        return resolve(res);
      })
    })
  }
}
```

```js
// Polified version
"use strict";
var promisify = function promisify(fn) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return new Promise(function (resolve, reject) {
      fn.apply(undefined, args.concat([function (err, res) {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      }]));
    });
  };
};
```

Maintenant, allez et "promisify" toutes vos fonctions en callback.
