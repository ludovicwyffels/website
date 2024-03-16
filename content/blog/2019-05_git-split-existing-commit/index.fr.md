---
title: "Fractionner un commit existant"
authors: [ludovicwyffels]
date: 2019-05-08T11:00:39+02:00
summary: "Une des choses les plus grandes et les pires avec git est que vous pouvez réécrire l'histoire. Voici une façon sournoise d'abuser de cela, je ne peux pas penser à une raison légitime de le faire."
draft: false
categories: ["Git"]
tags:
  - "Git"
---

L'une des principales différences entre `git` et les autres systèmes de contrôle de version est qu'il permet à l'utilisateur de réécrire l'historique. Pour ce faire, le moyen principal consiste à utiliser `git rebase`, généralement suivi d'un `git push --force` pour écraser l'historique du serveur (remote) avec l'historique local.

Voici comment diviser les commits existants à l'aide de `rebase`, `reset` et `commit`.

Supposons que vous ayez deux fichiers édités dans un commit (A et B) et que vous souhaitiez importer les modifications d’un de ces fichiers (A) dans votre branche actuelle, mais pas celles de l’autre (B).

Utiliser `git cherry-pick <commit-hash>` n'est pas une option, car cela impliquerait les modifications pour A et B.

La solution consiste à scinder le commit en 2 et à ne sélectionner que le nouveau commit contenant les modifications pour A.

Pour faire ça:

- lancez `git rebase -i <commit-hash>~` (notez le `-`) ou `git rebase -i <hash-of-previous-commit>`
- recherchez le commit que vous voulez scinder dans l'écran d'édition du rebase, changez le `pick` en `e` (**edit**)
- sauvegardez et quittez (`ESC` suivi de `:wq` pour fermer VIM)
- `git reset HEAD~` pour réinitialiser les modifications planifiées (`stash`)
- `git add [files-to-add]` tous les fichiers que nous voulons ajouter au premier commit (ici, ce serait `git add A`)
- `git commit` normalement, avec un message, etc.
- Exécutez autant de fois que vous le souhaitez:
  - `git add [other-files-to-add]`
  - `git commit`
- `git rebase -- continue` d'indiquer que la division est terminée et continue la refonte

Enfin, nous pouvons `git cherry-pick <new-commit-hash>` pour intégrer les modifications dans notre branche.
