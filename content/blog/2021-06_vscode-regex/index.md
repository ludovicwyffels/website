---
title: "VS Code - utiliser les expressions régulières dans les recherches / remplacements"
authors: [ludovicwyffels]
date: 2021-06-11T14:23:55+02:00
summary: "Petit pense-bête pour utiliser les expressions régulières sur VS Code. C'estt une fonctionnalité que j'utilise fréquement, mais pas assez pour que je me souvienne des motifs quand j'en ai besoin."
draft: false
category: "VS Code"
tags:
  - "VS Code"
  - "Regex"
---

Petit pense-bête pour utiliser les expressions régulières sur VS Code. C'estt une fonctionnalité que j'utilise fréquement, mais pas assez pour que je me souvienne des motifs quand j'en ai besoin.

## Quel est le moteur d'expression régulière ?

Les expressions régulières pourront être au format `ECMAScript 5` ou `PCRE2`.

## Ouvrir le widget recherche/remplacement

Pour lancer une recherche, il suffit d'utiliser les touches `Ctrl + F` ou pour MacOS `Cmd + F` qui ouvre ce widget:

![widget recherche](./images/find.png)

POur lancer une recherche avec remplacement, il suffit d'utiliser les touches `Ctrl + Shift + F` ou `Cmd + Shift + F` qui ouvre ce widget:

![widget remplacement](./images/replace.png)

Pour activer les regex, il faut cliquer sur `.*`

## Saisir des expressions régulières

Je ne vais pas refaire un cours sur les expressions régulières, mais je vais prendre quelques pour faire une piqûre de rappel. Vous pouvez vous entraîner avec le site [regex101.com](https://regex101.com/).

Pour rechercher un caractère dans un ensemble, il suffit de mettre `[]`. Par exemple, une lettre minuscule `[a-z]`, une lettre minuscule ou majuscule `[a-zA-Z]`, un nombre `[0_9]`, etc. Vous pouvez ajouter d'autres caractères dans la liste.

`|` permet d'indiquer un ou plusieurs mots: `moi|toi|nous|vous` recherche les mots `moi`, `toi`, `nous` ou `vous`.

### Les caractères spéciaux

- `\n` saut de ligne
- `\r` retour chariot
- `\t` tabulation
- `\f` saut de page
- `\e` échappement
- `^` désigne le début d’une ligne
- `$` désigne la fin d’une ligne

### les raccourcis

- `\w` qui équivaut à `[a-zA-Z0-9_]`
- `\W` à `[^a-zA-Z0-9_]` donc le contraire de `\w`
- `\s` à `[\r\n\t\f\v]`
- `\S` à tous les caractères autres que ceux de `\s`
- `\d` à `[0-9]`
- `\D` à tous les caractères non numériques. `[^0-9]`
- `.` à n’importe quel caractère sauf retour à la ligne
- `\b` recherche toutes les séquences `\w` dont la première et/ou la dernière lettre est la précédant.

### Pour définir le nombre d'occurence d'un caractère ou d'un ensemble

- `?` à zéro ou une occurrence d’une recherche
- `+` à une ou plus d’occurence(s) d’une recherche.
- `*` à zéro ou plus d’occurence(s) d’une recherche.
- `{i,j}` idem ,mais on définit le nombre de répétitions mini et maxi.

### La capture

- `(...)` permet de capturer le contenu afin de le réutiliser dans la zone remplacement avec le caractère `$n`. `n` étant l’index de l’occurence `()`.

Si vous recherchez un caractère parmi ceux qui sont réservé il faudra les échapper avec `\` : `$^.|?*+()[]{}`

## Quelques exemples

#### Dans un playbook Ansible, vous avez oublié d’entourer d’espaces le nom d’une variable.

`"{{variable}}"` doit s’écrire `"{{ variable }}"`.

On doit ajouter des échappements puisque nous recherchons des `{}` :

- Dans la zone recherche : `\{\{(\w+)\}\}`
- Dans la zone remplacement : `{{ $1 }}`

#### Dans les descriptions de tâches, nous aimerions que la première lettre de celle-ci soit en Majuscule.

- Dans la zone recherche : `(\s+) - name: (\w+)`
- Dans la zone remplacement : `$1 - name: \u$2`

Dans la zone résultat, il suffit de précéder l’occurrence de la capture par `\u`. Pour mettre en minuscule `\l`. Pour le faire sur tout le mot `\L` ou `\U`.
