---
title: "Prise en main de PM2, le gestionnaire de processus Node.js"
authors: [ludovicwyffels]
date: 2019-08-01T21:33:05+02:00
summary: PM2 a beaucoup d'utilisations, jetons un coup d'oeil à quelques-unes d'entre elles
draft: false
categories: ["Node.js", "PM2"]
tags:
  - "Node.js"
  - "PM2"
  - "Javascript"
---

## Utilisations de PM2

PM2 a beaucoup d'utilisations, jetons un coup d'oeil à quelques-unes d'entre elles:

- Redémarrage après un crash: PM2 nous permet de maintenir les processus en cours d'exécution
- Suivi et gestion des processus à distance: un portail web vous permet de garder un oeil sur les precessus distants et de les gérer.
- Il ne se contente pas d'exécuter des applications Node: PM2 n'est pas limité aux seuls processus Node.js, c'est vrai, vous pouvez même l'utiliser pour garder votre serveur Minecraft en ligne.
- PM2 peut mémoriser tous vos processus et les redémarrer après un redémarrage du système.
- Et bien plus encore.

## Pour commencer

La première chose que nous devons faire est d'installer PM2 globalement sur votre machine :

```sh
npm i -g pm2
```

## Commandes de base

Venons-en aux principe de base de son utilisation. Pour démarrer un processus sous PM2, il suffit de lancer `pm2 start <app>`. _App_ étant le nom du fihier que vous exécutez. PM2 produira quelque chose comme ceci

```text
[PM2] Starting /Users/ludovicwyffels/myApp/app.js in fork_mode (1 instance)
[PM2] Done.
┌──────┬────┬──────┬────────┬─────────┬─────┬───────────┐
│ Name │ id │ mode │ status │ restart │ cpu │ memory    │
├──────┼────┼──────┼────────┼─────────┼─────┼───────────┤
│ app  │ 0  │ fork │ online │ 0       │ 0%  │ 35.1 MB   │
└──────┴────┴──────┴────────┴─────────┴─────┴───────────┘
```

Faites attention à ce qu'il dis sous `id`. Si vous oubliez, lancez `pm2 list`. Si vous voulez ajouter un nom au processus lorsque vous le lancez, vous pouvez utiliser le paramètre `--name` (`pm2 start app.js --name my-api`).

Votre application fonctionne maintenant sous PM2, si elle plante, PM2 la redémarrera.

## Redémarrage en cas de modification de fichier

Une autre fonctionnalité impressionnante que PM2 a est de redémarrer quand un fichier dans le répertoire de travail change. Pour que PM2 regarde notre répertoire et redémmarre les changements de fichier, incluez `--watch` lorsque vous démarrez votre application.

## Persistance jusqu'au redémarrage

PM2 nous permet également de démarrer nos processus lorsque notre serveur (re)démarre. Commencez tout ce que vous voulez avoir en cours d'exécution tout le temps à travers `pm2 start` et puis exécutez `pm2 save`.

Maintenant, quand notre système redémarre, PM2 démarrera tous les processus que nous avions en cours d'exécution lorsque nous avons lancé `pm2 save`.

PM2 fait beaucoup de choses, je vais vous laisser découvrir le reste par vous même d'autres fonctions

### Le mode cluster

| Commandes | Description |
|---|---|
| `pm2 start app.js -i 0` | Démarre un maximum de processus avec LB en fonction des CPU disponibles. |

### Listen

| Commandes | Description |
|---|---|
| `pm2 list` | Afficher l'état de tous les processus |
| `pm2 jlist` | Impression de la liste des processus en JSON brut |
| `pm2 prettylist` | Impression de la liste des processus en JSON embelli |
| `pm2 describe 0` | Afficher toutes les informations concernant  |un spécifique
| `pm2 monit` | Surveiller tous les processus |

### Logs

| Commandes | Description |
|---|---|
| `pm2 logs [--raw]` | Afficher tous les journaux de processus en streaming |
| `pm2 flush` | Vider tous les fichiers logs |
| `pm2 reloadLogs` | Recharger tous les logs |

### Actions

| Commandes | Description |
|---|---|
| `pm2 stop all` | Arrêter tous les processus |
| `pm2 restart all` | Redémarrer tous les processus |
| `pm2 reload all` | Rechargement des temps d'arrêt 0s (pour les applications NETWORKED) |
| `pm2 stop 0` | Arrêt d'un id de processus spécifique |
| `pm2 restart 0` | Redémarrer un id de processus spécifique |
| `pm2 delete 0` | Supprimer le processus de la liste |
| `pm2 delete all` | Supprimer tous les processus de la liste |

PM2 fait beaucoup de choses, dont la plupart sortent du cadre de cette brève introduction. A l'avenir, nous pourrions couvrir le mode cluster de PM2, la gestion des processus à distance et plus encore. Merci de votre lecture !
