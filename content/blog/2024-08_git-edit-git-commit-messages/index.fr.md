---
title: Comment éditer les messages de Git Commit
authors: [ludovicwyffels]
date: 2024-08-04T7:00:00+02:00
summary: Dans le monde du contrôle de version, les erreurs arrivent - y compris dans les messages de validation. Heureusement, Git fournit un moyen simple de corriger ces messages, qu’il s’agisse du premier commit ou de n’importe quel commit dans votre dépôt.
draft: false
showToc: true
featureimagecaption: Photo de [Yancy Min](https://unsplash.com/@yancymin) sur [Unsplash](https://unsplash.com/photos/a-close-up-of-a-text-description-on-a-computer-screen-842ofHC6MaI)

tags:
  - Git
categories: ["Git"]
---

## Introduction

Dans le monde du contrôle de version, les erreurs arrivent - y compris dans les messages de validation. Heureusement, Git fournit un moyen simple de corriger ces messages, qu'il s'agisse du premier commit ou de n'importe quel commit dans votre dépôt. Voici un guide étape par étape pour éditer les messages de validation de Git

## Étape 1: Naviguer vers le répertoire de votre dépôt

Utilisez la commande `cd` pour naviguer dans le répertoire où se trouve votre dépôt Git. Assurez-vous que vous êtes au bon endroit pour faire les changements dont vous avez besoin.

## Etape 2: Initier un rebasement interactif

Démarrez un rebase interactif en entrant la commande suivante:

```shell
git rebase -i --root
```

L'utilisation de `--root` dans la commande demande à Git de démarrer un rebase interactif à partir du tout premier commit de votre dépôt, vous permettant ainsi de revoir et d'éditer tous les commits. Si vous souhaitez éditer des commits spécifiques, vous pouvez remplacer `--root` par `HEAD~n`, où `n` est le nombre de commits que vous souhaitez éditer. Par exemple, pour éditer les trois derniers commits, vous pouvez utiliser `HEAD~3`.

## Étape 3: Marquer les commits pour l'édition

Git ouvrira un éditeur de texte affichant une liste de commits. Pour chaque livraison que vous souhaitez éditer, remplacez le mot `pick` par `reword` ou simplement `r` au début de la ligne correspondante. Cela indique que vous voulez éditer le message du commit.

## Étape 4: Sauvegarder et quitter

Enregistrez vos modifications et quittez l'éditeur de texte.

- Vim : `:wq` ou `:x`
- nano : `Ctrl + S` et `Ctrl +X`

## Étape 5: Éditer les messages de validation

Git fera une pause à chaque livraison marquée pour édition. Pour chaque commit en pause, Git ouvrira l'éditeur de texte, vous permettant de modifier le message de commit. Effectuez les modifications souhaitées, puis sauvegardez et quittez l'éditeur de texte.

## Etape 6: Terminer le rebase

Après avoir édité tous les messages de validation souhaités, Git poursuivra le processus de rebase, en appliquant vos modifications.

## Etape 7: Forcer la poussée de vos changements

Vous devrez forcer le push des modifications pour mettre à jour l'historique. Utilisez la commande suivante:

```shell
git push origin master --force
```

## Conclusion

Avec ces étapes, vous pouvez éditer en toute confiance les messages de commit Git chaque fois que nécessaire, en vous assurant que l'historique de votre dépôt reste précis et bien documenté.
