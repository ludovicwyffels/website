---
title: GitFlow
authors: [ludovicywffels]
date: 2020-03-12T11:22:31+02:00
summary: "GitFlow est ce que l'on appelle un workflow, une stratégie d'utilisation de Git. Il en existe plein d'autres mais GitFlow est l'un des plus connu."
draft: false
categories: [Git]
tags:
  - Git
---

## Pourquoi avoir une stratégie d'utilisation de Git ?

Git est puissant mais il est généralement mal utilisé. Et un outil mal utilisé peut vite devenir contre-productif.

Dans le cas de Git, cela peut se traduire par des conflits à chaque commit/merge ou presque, des pertes de données (même s'il faut vraiment en vouloir), etc...

## Comment fonctionne GitFlow ?

GitFlow est un ensemble de règles simples qui se basent sur le fonctionnement par branche de Git.

Voici le principe de base :
Notre projet sera basé sur deux branches : `master` et `develop`. Ces deux branches **sont strictement interdites** en écriture aux développeurs.

La branche `master` est le miroir de notre production. Il est donc logique que l'on ne puisse y pousser nos modifications directement.

La branche `develop` centralise toutes les nouvelles fonctionnalités qui seront livrées dans la prochaine version. Ici il va falloir se forcer à ne pas y faire de modifications directement.

Trois autres types de branches vont ensuite nous permettre de travailler :

- `feature`
- `release`
- `hot fix`

### Je développe des fonctionnalités

Je vais donc développer sur une branche de type `feature`.

```bash
git checkout -b feature/<name> develop
```

Si je développe une nouvelle fonctionnalité, elle sera logiquement appliquée à la prochaine version : je crée donc ma branche à partir de la branche `develop`.

Je commence donc à travailler à partir du code mis à jour pour la nouvelle version.

```bash
git checkout dev
git merge feature/<name> --no-ff
git branch -d feature/<name>
```

Lorsque j'ai fini mon travail, je rapatrie celui-ci sur la branche de développement et je supprime la branche `feature` qui est devenue obsolète.

### Je prépare une nouvelle version pour la mise en production

Je vais donc travailler sur une branche de type release.

```bash
git checkout -b release/<version> develop
```

Je crée la branche à partir de la branche `develop`, ainsi je pourrai lancer mes tests et appliquer mes corrections pendant que mes collègues commencent déjà le développement de nouvelles fonctionnalités pour la version suivante.

```bash
git checkout dev
git merge release/<version> --no-ff

git checkout master
git merge release/<version> --no-ff
git tag <version>

git branch -d release/<version>
```

Lorsque tous mes tests sont passés avec succès et que ma nouvelle version est prête à être mise en production, je pousse tout sur la branche `master` et je n'oublie pas d'appliquer mes corrections à la branche de développement.

Je crée aussi un tag sur le dernier commit de la branche de production avec mon numéro de version afin de m'y retrouver plus tard.

Et enfin je supprime la branche `release` car maintenant elle ne sert plus à grand chose.

### Je corrige un bug en production

Je vais donc travailler sur une branche de type `hotfix`.

```bash
git checkout -b hotfix/<name> master
```

Pour ce cas particulier je crée ma branche à partir du miroir de production car je ne veux pas que toutes les fonctionnalités de ma branche de développement se retrouvent en production lors d'une simple correction de bug.

```bash
git checkout dev
git merge hotfix/<name> --no-ff

git checkout master
git merge hotfix/<name> --no-ff
git tag <version>

git branch -d hotfix/<name>
```

Mon bug étant corrigé, je dois l'appliquer sur le dev et la prod. Une fois encore je versionne avec un tag sur la branche `master` et je supprime la branche `hotfix`.

### GitFlow, la surcouche

Le concepteur de GitFlow a pensé à vous en codant une surcouche pour Git qui simplifie tout ça. 

- [Github](https://github.com/nvie/gitflow)
- [Installation](https://github.com/nvie/gitflow/wiki/Installation)
- [Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/index.html)

Elle vous fournit de nouvelles commandes haut niveau comme:

- `git flow init`: pour initialiser Git et GitFlow dans un projet.
- `git flow feature start <name>` : pour démarrer le développement d'une nouvelle fonctionnalité.
- `git flow feature finish <name>` : pour terminer le développement d'une nouvelle fonctionnalité.
- `git flow release start <version>` : pour démarrer le développement d'une nouvelle release.
- `git flow release finish <name>` : pour terminer le développement d'une nouvelle release.
- `git flow hotfix start <version>` : pour démarrer le développement d'un nouveau hotfix.
- `git flow hotfix finish <name>` : pour terminer le développement d'un nouveau hotfix.

GitFlow s'occupera pour vous de choisir les branches de départ, les branches de fin, de créer les tags et de supprimer les bonnes branches.

Bien-sûr, beaucoup d'autres commandes existent mais celles-ci sont à mes yeux les plus importantes.

Pour le reste, vous utiliserez les commandes Git habituelles.

---

## Je développe et maintiens un framework

Le fonctionnement basique de GitFlow convient, comme nous l'avons vu, dans la plupart des cas. Mais prenons le cas d'une équipe de développement qui s'occupe d'un des derniers frameworks à la mode.

Cette équipe utilise GitFlow et trouve ça génial. Les versions se succèdent et on arrive à la troisième version.

Tous les nouveaux projets de développeurs tiers sont fait dans la dernière version mais il existe encore des projets dans les versions précédentes du framework.

Si une faille de sécurité est découverte, les développeurs tiers s'attendent à ce que l'équipe applique des corrections dans la version 3 mais aussi la version 2.7 du framework. Et c'est normal.

Cette équipe doit donc maintenir deux versions de leur projet en simultané. Notre problème vient du système de branche strict de GitFlow :

- `feature` : de `develop` vers `develop`
- `release` : de `develop` vers `develop` et `master`
- `hotfix` : de `master` vers `develop` et `master`

Si les développeurs doivent faire un `hotfix` sur la version 2.7 du framework (correction de sécurité), ils ne peuvent pas créer la branche concernée à partir du master puisqu'ils sont déjà en version 3 à cet endroit.

Ils ne peuvent pas non plus réappliquer les corrections sur `master` et `develop` puisqu'en version 3 le code à pu changer du tout au tout et ne serait pas forcément compatible.

Et puis comment représenter ces deux versions simultanées dans l'index de notre projet ?

### La branche support

Il y a une règle moins connue de ce workflow qui peut résoudre notre problème.

Il existe un quatrième type de branche dérivée de `master`et `develop`: la branche `support`.

C'est tout simple :

- La branche `support` se crée à partir de la branche `master` sous le format suivant `support/2.7.x`. Le point de départ doit être le dernier commit de la version 2.7 du projet et non le commit le plus récent de la branche `master`
- Lorsque vous avez une mise à jour de sécurité à faire sur la version 2.7 vous créez la branche `hotfix/2.7.1` depuis la branche `support/2.7.x` comme s'il s'agissait du master. C'est en fait le master de la version 2.7 maintenue.
- Lorsque la correction est terminée vous faites un merge de votre `hotfix` sur la branche `support`.
- Vous supprimez la branche de `hotfix` et vous taggez `v2.7.1` sur la branche `support/2.7.x`

Dans le projet on a donc :

- `master` => en version 3.0
- `develop` => en cours de développement de la version 3.1
- `support/2.7.x` => en version 2.7
- `feature/...`
- `release/...`
- `hotfix/...`

---

## Git rebase, qu'est-ce que c'est ?

Imaginez un arbre. Un arbre a des branches (normal). Imaginez que vous teniez un sécateur entre vos mains. D'un geste plein de prestance, vous coupez une branche juste à l'endroit ou elle se sépare du tronc. Aussitôt, vous la re-greffez sur ce même tronc, mais à un emplacement différent. Vous obtenez donc le même arbre, avec la même quantité totale de bois, mais vous avez simplement déplacé une branche.

Voilà, c'est tout simplement ça, git rebase. Sauf qu'au lieu de déplacer du bois, on déplace des listes de commits.

## Git rebase avec un dessin

Ok, pour que ça soit plus clair, je vais vous faire un dessin. Je vais partir du cas classique ou, depuis ma branche de développement principale (`master`), j'ai créé une branche `discussion`, parce que je dois implémenter un système de discussion quelconque.

Voici à quoi peut ressembler l'historique en question, d'un point de vue schématique.

```text
A---B---C---D ← master
     \
      E---F---G ← discussion
```

Si je réalise une fusion classique au moyen de la commande `git merge`, j'obtiendrai le nouvel historique suivant :

```text
A---B---C---D---H ← master
     \         /
      E---F---G ← discussion
```

Une autre solution est de transplanter ma branche `discussion` sur la pointe de `master`. Je prends la branche et je la recolle plus loin. On obtient alors :

```text
A---B---C---D ← master
             \
              E---F---G ← discussion
```

Notez que rebaser `discussion` n'a strictement aucun effet sur `master`. En revanche, la fusion de `discussion` dans `master` est maintenant triviale (fast forward). On obtient enfin :

```text
A---B---C---D---E---F---G ← master
                         \
                          discussion
```

Avant de se demander à quoi ça sert, soyez certain de bien comprendre ce que ça fait. On prend une branche, et on la met autre part. Pas très compliqué, finalement, n'est-ce pas ?

## Bon, ok, mais à quoi ça sert ?

C'est là ou le `rebase` est sous employé. Nous venons de voir un exemple d'utilisation trivial. Étudions quelques cas pratiques.

### Éviter les commits de fusion pour les branches triviales

Quand on travaille avec Git, on a tendance à créer beaucoup de petites branches, ce qui est une bonne chose. Par contre, fusionner des branches créé des commits de fusion, comme dans notre exemple précédent.

Si vous créez _beaucoup_ de petites branches, vous allez obtenir _beaucoup_ de commits de fusion. Dans la mesure où ces commits n'apportent pas d'information utile, ils polluent votre historique.

En _rebasant_ vos branches avant de les fusionner, vous obtiendrez un historique tout plat et bien plus agréable à parcourir. Prenons un exemple.

```text
          F---G ← bug2
         /
A---B---E---H---I ← master
     \
      C---D ← bug1
```

En utilisant un `rebase` avant chaque fusion, on obtient l'historique suivant :

```text
A---B---E---H---I---C---D---F---G ← master
```

Les commandes pour parvenir à ce résultat sont les suivantes, explications juste après.

1. `git rebase master bug1`
2. `git checkout master`
3. `git merge bug1`
4. `git branch -d bug1`
5. `git rebase master bug2`
6. `git checkout master`
7. `git merge bug2`
8. `git branch -d bug2`

Et le détail des commandes.

1. Transplante `bug1` sur l'actuelle branche `master`. Si on est déjà en train de bosser sur bug1 on peut se contenter de taper `git rebase master`
2. Switche sur `master`
3. Fusionne `bug1` dans `master`
4. Supprime la branche `bug1` devenue inutile
5. Transplante `bug2` sur la branche `master`
6. Switche sur `master`
7. Fusionne `bug2` dans `master`
8. Supprime `bug2` devenue inutile.

Et voilà un bel historique bien propre, exempt de commits de fusion inutiles.

Ça paraît laborieux mais avec l'habitude, ça se fait tout seul et c'est même plutôt amusant (je sais, un rien m'amuse).

### Fusionner les branches en série

Prenons exactement le même exemple que précédemment, sauf que cette fois, nous ne fusionnons pas des petites branches triviales mais de vraies fonctionnalités.

```text
          F---G ← newsletter
         /
A---B---E---H---I ← master
     \
      C---D ← password_reset
```

Un historique plat, c'est bien, mais on perd de l'information. Plus moyen de savoir en un coup d'œil que telle liste de commits a été réalisée sur une branche spécifique.

Pour pallier à ce problème, on va utiliser une option de merge : `--no-ff` (pour « no fast forward »).

D'abord, les commandes.

```bash
git rebase master password_reset
git checkout master
git merge password_reset --no-ff
git branch -d password_reset
git rebase master newsletter
git checkout master
git merge newsletter --no-ff
git branch -d newsletter
```

On obtient alors l'historique suivant, bien plus clair. De plus, les commits "J" et "K" afficheront un message "branch machin was merged into master", ce qui fait que, même si les branches ont effectivement été supprimées, l'historique conserve une trace de leur existence.

```text
A---B---E---H---I-------J-------K ← master
                 \     / \     /
                  C---D   F---G
```

### Éviter les commits de fusion de `git pull`

Lorsque vous tapez git pull pour mettre à jour votre dépôt avec les derniers commits présents sur le serveur, Git va réaliser un merge pour fusionner vos modifications et celles que vous venez de récupérer.

Sur le serveur.

```text
A---B---C---D---E ← master
```

Sur votre machine.

```text
          origin/master
         /
A---B---C---F ← master
```

Après un `git pull`.

```text
          D---E ← origin/mastel
         /     \
A---B---C---F---G ← master
```

Vous pourrez alors envoyer votre travail sur le serveur avec un `git push`.

Imaginez maintenant dix personnes qui travaillent sur la même branche (c'est très mal) et qui pushent et pullent toutes les cinq minutes. Vous imaginez la tronche de l'historique ?

Pour éviter ce problème, on va utiliser l'option `git pull --rebase`, qui produira le résultat suivant.

```text
                  origin/master
                 /
A---B---C---D---E---F ← master
```

Et hop ! Encore une fois, un bel historique nickel. Merci Git !


### Réparer un mauvais historique

Scénario : j'ai créé une branche `newsletter` pour travailler sur la fonctionnalité correspondante. J'ai également créé une branche `bug_urgent` pour corriger un bug qui doit être fixé urgemment, comme son nom l'indique.

Sauf que, au moment de fusionner ma branche `bug_urgent`, horreur ! malheur ! je m'aperçois que je n'ai pas créé ma branche au bon endroit. Mon historique ressemble à ça.

```text
A---B---H---I---J ← master
     \
      C---D---G ← newsletter
           \
            E---F ← bug_urgent
```

Catastrophe ! Ma branche `newsletter` est un travail en cours, mais `bug_urgent` doit absolument être fusionnée dans master, le commercial a une démo dans 5 minutes. Comment faire ?!

Git rebase à la rescousse ! Nous allons simplement transplanter `bug_urgent` sur `master`, et le tour est joué.

```bash
git rebase newsletter bug_urgent --onto master
git checkout master
git merge bug_urgent
```

```text
A---B---H---I---J---E---F ← master
     \
      C---D---G ← newsletter
```

Vous noterez que l'appel de la commande `rebase` est ici un poil plus compliqué. Si nous nous étions contenté de la syntaxe habituelle `git rebase master`, nous aurions transplanté tous les commits de la branche `bug_urgent` en remontant jusqu'à `master`, c'est à dire les commits E et F, mais aussi C et D, ce qui n'est clairement pas le but.

La commande `git rebase newsletter bug_urgent --onto master` signifie "arrache la branche qui part de `newsletter` jusqu'à `bug_urgent`, et mets la sur `master`", ou encore "transplante sur `master` tous les commits qui sont sur `bug_urgent:postlink:` mais pas sur `newsletter`".

### Réparer un mauvais historique, bis

Autre exemple d'historique généré un soir de bourre.

```text
A---B---H---I ← master
     \
      C---D---G ← bug1
       \
        E---F ← bug2
```

Or, il se trouve que les branches bug1 et bug2 sont totalement indépendantes. L'une sera peut-être fusionnée avant l'autre, ou abandonnée, on ne sait pas. Nous allons donc réparer cette bévue prestement.

```bash
git rebase bug1 bug2 --onto B
```

```text
      E---F ← bug2
     /
A---B---H---I ← production
     \
      C---D---G ← bug1
```
      
Et voilà ! Notez qu'on peut transplanter à n'importe quel endroit, pas forcément sur une branche (ce qui est normal, puisqu'une branche n'est rien d'autre qu'une étiquette pointant sur un commit).

### Faciliter l'intégration de branches

Scénario : je travaille sur une fonctionnalité qui nécessite plusieurs semaines de dev. J'ai donc une branche qui va évoluer pendant un long moment avant d'être fusionnée.

```text
A---B---H---I--- … ---J---E---F ← master
      \
       C---D---G--- … ---H---I ← newsletter
```

Si les branches divergent suffisamment, il est probable que le moment de la fusion va être assez pénible, avec des conflits à résoudre en pagaille. Une mauvaise journée en perspective.

Sauf si, j'ai rebasé ma branche tous les matins en buvant mon café. Je corrige ainsi les conflits au fil de l'eau. Au bout de trois mois, voici mon historique :

```text
A---B---H---I--- … ---J---E---F ← master
                               \
                                C---D---G--- … ---H---I ← newsletter
```

J'ai beau avoir trois mois de dev dans les pattes, la fusion est triviale et ne prend pas plus d'un quart de seconde. Merci git rebase.

## Rebase interactif

Allez, on va arrêter de rigoler et sortir la grosse artillerie. Parce que git rebase dispose d'une petite option sympathique : l'option interactive. Quand je lui passe cette option, l'éditeur s'ouvre et je peux éditer un fichier en précisant ce que je veux faire de chaque commit en moment de son application. Exemple.

Voici un exemple d'historique standard (les commits les plus récents en haut).

```text
* 4baf2db - Write tests for discussion
* 0fadd04 - Implement discussion
* 8be3c7e - Write tests for newsletter
* bce2851 - Implement newsletter
* 6477e21 - …
```

Tout va bien dans le meilleur des mondes. Quand tout à coup ! on m'annonce qu'un audit va être réalisé pour vérifier si les employé(e)s respectent bien la politique qualité de l'entreprise. Cette politique stipule que je suis censé commiter les tests d'une feature avant de commiter le code correspondant.

Et mince ! adieu ma prime ! Git rebase interactif à la rescousse.

```bash
git rebase -i HEAD~4
```

Cette commande signifie "arrache les quatre derniers commits et transplante les au même endroit". En théorie, c'est une opération nulle SAUF qu'on va le faire de manière interactive.

Immédiatement après avoir tapé la commande, l'éditeur s'ouvre et affiche quelque chose comme ça :

```text
pick 4baf2db Write tests for discussion
pick 0fadd04 Implement discussion
pick 8be3c7e Write tests for newsletter
pick bce2851 Implement newsletter
```

Les modifications que je vais réaliser dans ce fichier vont influer sur la manière dont mon rebase va se passer. En l'occurence, je vais effectuer cette simple modification.

```text
pick 0fadd04 Implement discussion
pick 4baf2db Write tests for discussion
pick bce2851 Implement newsletter
pick 8be3c7e Write tests for newsletter
```

J'ai simplement modifié l'ordre des lignes. J'enregistre et quitte l'éditeur. Et magie ! Mes commits ont été réappliqués dans l'ordre indiqué. À moi la prime ! Notez que de nombreuses possibilités s'offrent à moi. J'aurais pu découper un commit en plusieurs ou au contraire en rassembler plusieurs en un seul ; ignorer des commits ; récupérer des commits tels quels mais modifier le message ; etc.

## Pièges à éviter

### WARNING ATTENTION ACHTUNG

Si vous voulez vous essayer au git rebase, lisez bien attentivement les paragraphes qui suivent. À peu près aucune commande de l'environnement Git n'a un plus grand pouvoir de nuisance que `git rebase`.

Parce qu'un rebase réécrit votre historique, et que ce n'est pas toujours une opération triviale. Si vous foirez votre coup, vous avez les moyens de franchement flinguer votre historique — rien d'irrécupérable, mais quand même de quoi passer un mauvais moment.

### Git rebase ne déplace pas vraiment des commits

Quand je vous ai dit que rebase déplaçait des commits, j'ai menti (c'était pour votre bien). Il est strictement impossible de modifier un commit existant, pour la pure et simple raison qu'un commit est indexé par le hash de son contenu.

Reprenons la métaphore de l'arbre, toujours avec ses branches. Scannez une branche et utilisez une imprimante 3d pour en effectuer une copie la plus fidèle possible. Collez cette copie quelque part sur le tronc. Utilisez une cape d'invisibilité pour masquer la branche d'origine. Voilà, en vrai, c'est ça git rebase.

Ce que fait `git rebase`, c'est qu'il copie tous les commits transplantés et les réapplique un par un à l'endroit indiqués. Mais il s'agit bel et bien de nouveaux commits, avec des identifiants différents, même si le contenu est le même.

Reprenons notre exemple de tout à l'heure.

```text
A---B---C---D ← master
     \
      E---F---G ← discussion
```

Si je rebase `discussion` sur `master`, ce qu'il se passe réellement ressemble plutôt à ça :

```text
              E'---F'---G' ← discussion
             /
A---B---C---D ← master
     \
      E---F---G
```

Ainsi, les commits de l'ancienne branche `discussion` existent toujours, même s'ils sont invisibles car pointés par aucune branche. Les commits de la nouvelle branche `discussion` sont bels et biens différents.

### L'historique partagé jamais tu ne repasseras

![git push --force](https://cdn-images-1.medium.com/max/1600/1*MOJPqQhY-JokxSXhExq5dw.jpeg)

Tant que vous rebasez vos petites branches en local, tout va bien. Mais <span style="color:#AE121A">attention</span>, si vous rebasez une branche qui se trouve déjà sur le serveur, c'est la catastrophe. Vous allez pourrir l'historique de tous vos coworkeurs, qui s'empresseront de vous couvrir de goudron et de plume avant d'essayer de vous vendre <span style="color:#AE121A">aux abattoirs d'un KFC</span>.

Sur le serveur.

```text
A---B---C---D---E ← master
         \
          F---G---H ← feature
```

Sur votre machine.

```text
A---B---C---D---E ← master
```

Vous rebasez les 4 derniers commits de master (comble de l'horreur).

```text
A---B'---C'---D'---E' ← master
```

Vous poushez. Git affiche un message d'erreur, mais vous utilisez l'option "force" pour pousSer quand même. Ni Dieu Ni Maître !

Sur le serveur.

```text
  B'---C'---D'---E' ← master
 /
A---B---C---D---E
         \
          F---G---H ← feature
```

Wat ?! Imaginez le résultat quand vos collègues essayeront de récupérer les données du serveur. Ça ne va pas être joli et très franchement, je vous souhaite bon courage.

Notez donc bien soigneusement cette règle d'or de l'utilisation de rebase :

> L'historique partagé jamais tu ne modifieras, sinon l'ire de ton équipe tu subiras.



---

## Merge ou Rebase ?

Le choix entre ces deux méthodes dépend du nombre de branches à synchroniser et du nombre de corrections traitant sur un même périmètre technique. En effet, suite à un merge de plusieurs branches, le graphe historique serait difficile à comprendre. Dans la mesure où les commits de fusion n’apportent pas d’information utile, ils polluent l’historique. Et si, par exemple, plusieurs corrections sont réalisées sur une même fonction, c’est pénible de rejouer tous les commits de rebase.

- Exemple 1 : Quand un **travail local** est considéré comme **partant d’une base obsolète**. Cela peut arriver plusieurs fois par jour, quand on essaie d’envoyer au remote nos commits locaux, pour découvrir que notre version de la branche distante trackée (par exemple origin/master) date : depuis notre dernière synchro avec le remote, quelqu’un a déjà envoyé des évolutions de notre branche au serveur, du coup notre propre travail part d’une base plus ancienne, et l’envoyer tel quel au serveur reviendrait à écraser le travail récent des copains. C’est pourquoi push nous enverrait promener. **Un merge (git pull) n’est pas idéale, car elle ajoute du bruit**, des remous, dans le graphe de l’historique, alors qu’en fait c’est juste un coup de pas de bol dans la séquence de travail sur cette branche. Dans un monde idéal, j’aurais fait mon boulot après les autres, sur une base à jour, et la branche serait restée bien linéaire. Dans ce cas, il est préférable d’utiliser une rebase (git pull –rebase).

- Exemple 2 : La branche ref_branche représente un sprint ou une story en méthodologie agile, ou encore un ticket d’incident (issue ou bug) précis, identifié dans la gestion de tâches. Il est alors préférable d’utiliser la méthode merge.

- Exemple 3 : La branche ref_branche est dédiée pour la correction des anomalies sur la production. Il faut alors utiliser la méthode merge car il est difficile de faire un rebase si plusieurs corrections sont réalisées sur un même périmètre.
