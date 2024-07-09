---
title: "Soyez plus productif grâce à Git bisect"
authors:
  - ludovicwyffels
date: 2023-11-18T15:03:35+02:00
summary: ""
draft: false
showToc: true
cover: cover.png
tags:
  - "git"
  - "sécurité"
  - "ssh"
categories: ["git"]
series: ["Git"]
series_order: 1

---

Lorsque l'on développe, on ne va pas se mentir, on perd une grosse partie de notre temps à déboguer.

Si je devais diviser le temps que je passe à développer je le ferais ainsi :

- 30 % Conception pure
- 25 % Conception / Écriture du code
- 15 % Test
- 30 % Débogage

S'il y a bien une partie que j'aimerais réduire au maximum, c'est le débogage. Non pas que je n'aime pas ça, mais plutôt que j'aimerais passer plus de temps à écrire du code ou à concevoir mon application.

Une des solutions / propositions pour notre problème est de progresser dans votre langage. Bien-sûr, c'est totalement vrai. Mais, quel que soit notre niveau, notre expérience ou les connaissances que vous avez, nous perdrons toujours du temps à chercher où peut se trouver le bug dans le code.

Git se propose de réduire ce fameux temps de recherche grâce à `git bisect`.

## Que le débogage commence

Git bisect est vraiment une commande très simple d'utilisation. Malheureusement, cette commande est très peu connue des utilisateurs de Git.

Le principe est le suivant : Vous indiquez à Git que vous cherchez un bug, il se déplace de commit en commit, vous testez la version et vous lui dites si le bug est présent dans le commit courant ou pas.

Le but étant de retrouver le premier commit bogué, celui où le bug est apparu. Grâce à cela vous saurez que l'une des modifications faites dans ce commit a causé le bug.

D'où l'intérêt de touts petits commits : plus vos commits seront petits, plus l'utilisation de `git bisect` sera utile puisqu'elle permettra de localiser plus précisément où est situé le bug dans votre code.

La commande pour commencer votre débogage est la suivante :

```shell
git bisect start [bad] [good]
```

Deux paramètres optionnels sont attendus ici. Il s'agit à chaque fois d'une référence à un commit : ça peut être son hash, un tag ou `HEAD`.

Le premier paramètre est donc un commit où vous savez déjà que le bug est présent. Le deuxième est un commit que vous savez sans bug.

Si vous n'indiquez pas les deux paramètres, vous devrez sélectionner le mauvais commit par un `git bisect bad [commit]` et le bon commit par un `git bisect good [commit]`.

Une fois qu'il connait l'intervalle, Git se déplace à un autre commit. Vous jouez vos tests et vous précisez à Git s'ils sont bons ou mauvais avec :

```shell
git bisect good # Le commit que je viens de tester est bon
git bisect bad # Le commit que je viens de tester est mauvais
```

Ce sont les mêmes commandes que celle que nous avons utilisé pour définir l'intervalle sur lequel travailler, mais nous n'avons pas indiqué de numéro de commit. Git a donc prit les numéros de commit courant.

```text
b047b02ea83310a70fd603dc8cd7a6cd13d15c04 is first bad commit
commit b047b02ea83310a70fd603dc8cd7a6cd13d15c04
Author: PJ Hyett <pjhyett@example.com>
Date:   Tue Jan 27 14:48:32 2009 -0800

    secure this thing
```

Une fois que Git à assez d'information, il vous indique le commit incriminé, celui qui a introduit le bug dans votre code comme ci-dessus.

## La rapidité

Certains se disent peut-être que ça ne sert pas à grand-chose. Si Git se contente de passer d'un commit à l'autre vous pouvez très bien le faire vous-même.

Si en plus, il y a des centaines de commits entre celui où le bug est découvert et celui où il est introduit, vous en avez pour un moment avant d'identifier le commit d'introduction...

Mais c'est bien pour cela que Git ne fait pas que passer au commit suivant. Le vrai intérêt de cette commande, c'est qu'elle utilise la dichotomie dans sa navigation.

Si vous avez 1000 commits dans votre intervalle à tester, au bout de la première itération `git bisect` a écarté 500 commits, au bout de la seconde itération 750 commits sont écartés. Le temps de recherche est considérablement écourté !

Et pour le coup il vous simplifie la vie, puisque si vous deviez le faire à la main, ce serait vraiment galère. Entre compter les commit pour trouver le commit central d'un intervalle donné et retenir les hash de commit pour les tester et retenir s'ils sont bon où mauvais... Personne ne le ferait.

Je pense que `git bisect` pourrait bien changer la façon par laquelle vous déboguer. Qu'en pensez-vous?
