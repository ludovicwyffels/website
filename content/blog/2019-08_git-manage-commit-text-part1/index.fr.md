---
title: "Bien gérer ses textes de commit (partie 1)"
authors: [ludovicwyffels]
date: 2019-08-11T08:07:11+02:00
summary: "Que l’on soit backend, frontend, il y a une chose qui nous rassemble, c’est notre gestionnaire de source et son utilisation. Dans cet article, je vais vous présenter le conventional-changelog qui vous permettra de produire un historique de super qualité !"
draft: false
categories: ["Git"]
tags:
  - "Git"
series: ["Bien gérer ses textes de commit"]
series_order: 1
---

Que l’on soit backend ou frontend, il y a une chose qui nous rassemble, c’est notre gestionnaire de source et son utilisation.

Dans cet article, je vais vous présenter le conventional-changelog qui vous permettra de produire un historique de super qualité 🙌!

## Le problème

Combien d’entre vous sont tombés sur des projets avec un historique qui ressemble à cela: 🤕

```text
e60930a9 (HEAD -> develop, origin/develop) Modification front
49ff1d07 Fix an error
59a4d13e Add log
44e2f204 Update conf
03d00e2e Types
10d42648 Lots of things...
bab7be76 General linting
a62f7880 No comment
26f99ee0 ...
31409e82 Add test
815485dd Issue #782
```

Comment s’y retrouver? Comment exploiter un historique qui ne vous donne quasiment jamais d’information.

La solution, c’est d’utiliser le Conventional-Changelog (oui, on dirait une pub de télé-achat 😝).

## Qu’est-ce que le conventional-changelog?

C’est bien de vous vendre une solution, mais il faudrait peut-être expliquer ce que c’est... en vrai.

Le Conventional-Changelog est une manière d’écrire ses commits dans les projets. Il existe plusieurs "flavours", je vais vous détailler la version Angular.

Le format est le suivant:

```txt
<type>(<scope>): <subject>

<body>

<footer>
```

Si ce format est bien appliqué, cela peut donner ce type de texte de commit :

```txt
feat(users): add user management page

In order to add users into the system, a management page has been added. The route and services are integrated into the UserModule. A mock has been added due to back-end limitation.

Closes #456 and PRJ-345
```

C'est un peu plus agréable à lire non ?

Je vais vous décrire les différentes parties de cette convention et comment bien les utiliser.

### Type

Le type permet de représenter de manière succincte le **type** d’action que vous avez fait sur le projet :

- `feat`: Ajout d’une fonctionnalité
- `fix`: Correction
- `perf`: Amélioration des performances
- `docs`: Ajout de documentation
- `style`: Linting du code
- `refactor`: Modification du code, mutualisation et autres modifs afin d’améliorer le projet
- `test`: Ajout de tests unitaires, intégration, end-to-end
- `chore`: Tâche _ménagère_, comme mettre à jour les dépendances, reconfigurer la CI...

On ne peut mettre qu’un seul type par commit, donc finis les commits qui contiennent une feature et un fix en même temps...

### Scope

Ici, pas de liste imposée, juste le titre de l’élément sur lequel une modification a été faite. Nous avons tendance à définir clairement les scopes du projet à l’avance afin que tout le monde commit avec les mêmes scopes.

Pour exemple, sur une application orientée "e-commerce", on pourrait avoir les scopes suivants :

- homepage
- search
- my-account
- product-details
- order
- admin

Parfois, ce scope peut être omis... car il n’y en a pas forcément ou vous avez touché à l’application de manière globale. Dans ce cas, laissez vide 😅

Et par contre, comme pour le type, il ne peut y avoir qu’un seul scope. Donc si vous pensez avoir deux scopes... faites deux commit différents

### Subject

Le sujet doit contenir une description courte du changement effectué dans le commit.

Quelques conseils pour formater le message :

- Utiliser l’impératif
- Utiliser le présent
- Pas de 1er lettre en majuscule
- Pas de point `.` à la fin du sujet

### Body

Le body est la partie "principale" du commit. J’ai tendance à dire qu’elle doit contenir le "Pourquoi" du commit.

Si vous avez fait une modification structurante ou si la méthode d’implémentation est particulière, écrivez-le dans le body !

C’est un point de vue qui est personnel, mais je pense que le body est le meilleur endroit pour accueillir un commentaire... car un message de commit ne se désynchronise jamais du code.

### Footer

Cette dernière partie permet de placer les références vers toutes les issues, User stories & co. On s'en sert généralement pour lier (`Linked to`) ou clôturer (`Closes`) les issues directement depuis git.

Autre élément qui peut être ajouté dans ce footer est la notion de "Breaking Change". Il suffit d'ajouter `BREAKING CHANGE:` suivi du détail de ce fameux breaking change.

## Je suis obligé d’écrire tout cela à chaque fois?

Non, rassurez-vous, vous n’êtes pas obligé... même s’il est bien de mettre un max d’informations dans le message de commit.

La convention veut que seule la 1ère ligne soit obligatoire. Donc, libre à vous, de ne pas mettre de body et de footer

## Conclusion

Avec cette convention, vous prendrez plaisir à fouiller dans l’historique de votre projet, trouver la source d’une modification et surtout savoir "Pourquoi cela a été fait comme cela !"

Et quand l’on regarde, la différence entre l’ancienne version :

```text
e60930a9 (HEAD -> develop, origin/develop) Front modification
49ff1d07 Error correction
59a4d13e Add log
44e2f204 Update config
03d00e2e Fix typos
```

et la nouvelle (certes, sur des projets différents):

```text
b1365d1fa (HEAD -> master, origin/master, origin/HEAD) refactor(ivy): remove directiveRefresh instruction (#22745)
4ac606b41 docs(compiler): fix spelling errors (#22704)
51027d73c fix(ivy): Update rollup rule to prevent inlining symbols in debug. (#22747)
48636f3e8 chore(aio): compute stability and deprecate `@stable` tag (#22674)
bd9d4df73 refactor(ivy): remove inputsPropertyName (#22716)
```

Cela est quand même bien plus clair !

## Référence

- [Git Commit Message Conventions](https://git.wiki.kernel.org/index.php/CommitMessageConventions)
