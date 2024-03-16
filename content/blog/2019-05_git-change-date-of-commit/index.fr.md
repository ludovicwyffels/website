---
title: "Changer la date d'un commit"
authors: [ludovicwyffels]
date: 2019-05-08T09:26:56+02:00
summary: "Une des choses les plus grandes et les pires avec git est que vous pouvez réécrire l'histoire. Voici une façon sournoise d'abuser de cela, je ne peux pas penser à une raison légitime de le faire."
draft: false
categories: ["Git"]
tags:
  - "Git"
---

Une des choses les plus grandes et les pires avec git est que vous pouvez réécrire l'histoire. Voici une façon sournoise d'abuser de cela, je ne peux pas penser à une raison légitime de le faire.

Comme pour tout, merci StackOverflow pour toutes les options que je peux choisir parmi

## Fixe la date du dernier commit à la date du jour

```bash
GIT_COMMITTER_DATE="$(date)" git commit --amend --no-edit --date "$(date)"
```

## Fixer la date du dernier commit à une date arbitraire

```bash
GIT_COMMITTER_DATE="2019-05-07T21:07:52" git commit --amend --no-edit --date "2019-05-07T21:07:52"
```

```bash
GIT_COMMITTER_DATE="Mon 20 Aug 2018 20:19:19 BST" git commit --amend --no-edit --date "Mon 20 Aug 2018 20:19:19 BST"
```

## Définir la date d'une validation arbitraire sur une date arbitraire ou courante

Rebaser avant ledit engagement et arrêter pour modification:

1. `git rebase <commit-hash>^ -i`
2. Remplace `pick` par `e` (edit) sur la ligne avec ce commit (le premier)
3. Quittez l'éditeur (ESC suivi de `:wq` dans VIM)
4. Non plus:
    - `GIT_COMMITTER_DATE="$(date)" git commit --amend --no-edit --date "$(date)"`
    - `GIT_COMMITTER_DATE="Mon 20 Aug 2018 20:19:19 BST" git commit --amend --no-edit --date "Mon 20 Aug 2018 20:19:19 BST"`

Voir ici pour plus d’informations sur le rebase et l’édition dans git: [Fractionner un commit git existant](/git-splitExistingCommit/).

Après l’une de ces 3 options, vous voudrez exécuter:

```git
git rebase --continue
```
