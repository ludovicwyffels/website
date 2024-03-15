---
title: 'AWS SDK pour Node.js: Meilleures pratiques'
authors: [ludovicwyffels]
date: 2018-09-23T08:06:49+02:00
summary: ''
draft: false
categories: [Node.js]
tags:
  - Node.js
  - AWS
---

La plupart des exemples de code couvrant le kit AWS SDK comme ci-dessous, c’est à dire qu’ils importent l’intégralité du kit AWS même s’ils utilisent seulement quelques services AWS, parfois un seul (AWS DynamoDB).

{{< gist ludovicwyffels 195d29bab3640e1c25981fbe6fab4f58>}}

Cependant, la méthode recommandée pour initialiser divers clients de service AWS consiste à ne les importer que lorsque nécessaire, comme ci-dessous. Économise des temps de chargement et de la mémoire précieux, particulièrement utile dans les environnements à ressources de calcul comme un périphérique IoT ou dans une fonction AWS Lamba.

{{< gist ludovicwyffels ab860daf4dfb446ded1a9b03dc3942e4>}}

> NB: vous pouvez toujours accéder à l’espace de noms AWS global sans chaque service AWS associé en écrivant sous le code. Cette technique est utile lorsque vous appliquez la même configuration à plusieurs services AWS individuels, par exemple pour fournir les mêmes informations d’identification à tous les services AWS.
>
> `const aws = require('aws-sdk/global');`

Consultez la documentation officielle d’AWS pour plus d’informations ci-dessous.

[https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/creating-and-calling-service-objects.html](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/creating-and-calling-service-objects.html)

Bonne programmation!