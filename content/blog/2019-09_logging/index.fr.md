---
title: "Journalisation: quelques règles pratique"
authors: [ludovicwyffels]
date: 2019-09-07T08:49:27+02:00
summary: ""
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
---

La journalisation est quelque chose que chaque développeur fait depuis ses débuts en programmation, mais très peu connaissent la valeur qu'elle peut produire et les meilleures pratiques.

Dans ce billet, nous aborderons les sujets suivants :

- Quels sont les journaux et quelle est leur importance ?
- Meilleures pratiques à consigner
- Parties importantes de la journalisation
- Utilisation correcte des niveaux de journalisation
- Pourquoi Winston ?

## Quels sont les journaux et leur importance ?

Les journaux sont les événements qui reflètent les différents aspects de votre application, c'est le mode le plus facile de dépannage et de diagnostic de votre application, si elle est correctement écrite par l'équipe.

Lorsque vous démarrez un serveur Node.Js et que la base de données ne fonctionne pas ou s'arrête brusquement en raison d'un problème ou que le port du serveur est déjà utilisé, s'il n'y a pas de journaux, vous ne saurez jamais pourquoi le serveur a échoué.

Souvent, en tant que développeur, vous avez besoin de déboguer un problème, nous utilisons volontiers le débogueur et les points d'arrêt pour comprendre où et ce qui a cassé.

Que feriez-vous lorsque votre application est en production ? Pouvez-vous y attacher un débogueur et rejouer autour du bogue ? Évidemment non. C'est donc ici que l'enregistrement vous aidera.

> Vous n'obtiendrez une configuration de journalisation idéale que si, sans utiliser le débogueur, vous pouvez trouver un problème en parcourant les journaux et que vous savez ce qui s'est mal passé et où.
## Meilleures pratiques

### 1) Trois parties importantes des billes de bois

Les journaux d'application sont à la fois pour l'homme et pour les machines. Les humains se réfèrent aux journaux pour déboguer le problème et les machines utilisent les journaux pour générer divers tableaux de bord et graphiques et pour l'analyse des données afin de produire diverses conclusions sur les usages des clients.

Chaque bûche doit contenir les trois parties les plus importantes :

- **Source du log**

  Quand nous avons une architecture de microservices, il devient vraiment crucial de connaître la source du journal, les informations comme le nom du service, la zone, le nom d'hôte, etc.

  Les métadonnées détaillées sur la source sont principalement gérées par l'agent expéditeur de logs, qui transfère les logs de tous les microservices vers le système de logging centralisé.
- **Timestamp**

  Le moment où un événement s'est produit ou un journal a été généré est vraiment important. Par conséquent, assurez-vous que chaque journal a un timestamp afin que nous puissions trier et filtrer.
- **Niveau et contexte**

  Lorsque vous parcourez les journaux pour trouver l'erreur, si le journal ne fournit pas suffisamment d'informations et si vous devez vous référer au code pour comprendre, ce serait très frustrant. Par conséquent, lors de la journalisation, nous devrions passer suffisamment de contexte.

  Par exemple, un journal sans contexte ressemblerait à ce qui suit : `The operation failed!`

  Le meilleur exemple avec un contexte significatif serait : `Failed to create user, as the user id already exist`

### 2) Que faut-il consigner et comment le faire ?

- **Enregistrement des méthodes et des données d'entrée :**

  En déboguant le problème, si nous apprenons à savoir quelle fonction a été appelée et quels paramètres ont été passés, cela nous aidera vraiment.

`gist:ludovicwyffels/a6e045f81aada8de51b4c67b3f706cdf`

En parcourant les journaux `>>>>>` et `<<<<<`, vous obtiendrez un aperçu de haut niveau de l'entrée et de la sortie d'une fonction. Ceci est inspiré par le conflit de merge de git.

- Le journal ne doit pas être évalué pour supprimer une exception

  Dans la ligne #8, le `userService.getUser()` peut retourner null et `.getId()` peut lancer une exception, donc veuillez éviter ce genre de scénarios.

`gist:ludovicwyffels/93fcfffae2d53af76462b13fdd0f35df`

Vous devez utiliser [aspect.js](https://github.com/mgechev/aspect.js) pour automatiser les journaux des niveaux de fonction.

- **La journalisation ne doit pas produire d'effet secondaire**

  Le journal doit être anonyme et ne doit produire aucun effet secondaire. Par exemple, la ligne d'enregistrement #8 suivante créera une nouvelle ressource dans la base de données.

`gist:ludovicwyffels/04e7fd5e9994f56c8634eb53bb0f4851`

- **Enregistrer les erreurs avec détails**

  Lorsqu'il y a une erreur, soyez descriptif, mentionnez ce qui a été tenté et pourquoi elle a échoué.

  Consigner ce qui a échoué et ce que vous faites ensuite.

`gist:ludovicwyffels/fdd1c48e9075058256bd5c7cc42b50f1`

Dans le cas où vous renvoyez l'erreur dans la section `catch`, veuillez noter quelle opération a échoué et mentionner que vous renvoyez l'erreur telle quelle.

`gist:ludovicwyffels/a1a490f44de0713146543b7281ae18c6`

### 3) Informations sensibles

La série de log devrait refléter les activités d'un utilisateur dans l'application afin que le débogage puisse être plus facile et devrait enregistrer les erreurs afin que l'action puisse être prise dès que possible. Les journaux contiennent des informations telles que la fonction appelée avec quelles entrées, où et quelle erreur s'est produite, etc.

Lors de l'enregistrement, nous devons nous assurer de ne pas enregistrer les informations sensibles comme le nom d'utilisateur et le mot de passe, les informations financières comme le numéro de carte, le numéro CVV, etc.
En tant que développeurs, nous devrions demander et consulter l'équipe produit pour préparer une liste d'informations sensibles et les masquer avant de les enregistrer.

### 4) Utilisation correcte des niveaux de notation

Si les applications de production ont un nombre raisonnablement élevé de transactions d'utilisateurs, par jour, la configuration idéale des logs peut générer des gigaoctets de logs, d'où la nécessité de classer nos logs en plusieurs groupes. Ainsi, en fonction de l'audience, nous pouvons activer le niveau de journalisation en temps réel, et n'obtenir que les journaux appropriés.

Par exemple, si un chef de produit veut voir combien de transactions clients sont réussies ou échouées dans notre tableau de bord de journalisation, il ne devrait pas se voir afficher des informations encombrées d'appels de fonction sur divers qui est seulement pour les développeurs. Et quand il y a un bogue dans la production, le développeur devrait voir les journaux détaillés des différentes fonctions qui ont été exécutées avec succès et qui ont échoué. Pour que le problème puisse être identifié et corrigé le plus rapidement possible.

Pour réaliser ce type d'installation, nous avons besoin d'avoir une meilleure compréhension de chaque niveau de journalisation.

Discutons des niveaux les plus importants et de leurs usages :

- **INFO**: Quelques messages importants, des messages d'événements qui décrivent quand une tâche est terminée. Par exemple : `New User creaded with id xxx`

  Il s'agit d'un simple journal d'information sur l'avancement des travaux.
- **DEBUG**: Ce niveau est destiné aux développeurs, c'est similaire à l'enregistrement des informations que vous voyez lorsque vous utilisez le débogueur ou le point d'arrêt, comme quelle fonction a été appelée et quels paramètres ont été passés, etc. Il devrait avoir l'état actuel de sorte qu'il puisse être utile lors du débogage et de la recherche du problème exact.
- **WARN**: Ces journaux sont les avertissements et ne bloquent pas l'application pour continuer, ils fournissent des alertes lorsque quelque chose ne va pas et que la solution de contournement est utilisée, par exemple une entrée utilisateur erronée, des tentatives répétées, etc. Les administrateurs devraient corriger ces avertissements à l'avenir.
- **ERROR** : Quelque chose de mal s'est produit et devrait faire l'objet d'une enquête prioritaire. Par exemple, la base de données est en panne, la communication avec d'autres microservices a échoué ou l'entrée requise n'a pas été définie.

  Les principaux publics visés sont les opérateurs système ou les systèmes de surveillance.

> Idéalement, l'application de production devrait avoir des journaux d'erreurs proches de zéro.
### 5) Ne pas utiliser `console.log`

La plupart des développeurs ont utilisé le module de console comme premier outil pour obtenir les logs ou déboguer le code, car il est facile à utiliser, disponible globalement et aucune configuration n'est nécessaire. Dans Node.Js, la console est implémentée différemment que dans les navigateurs, le module de console imprime le message dans stdout lorsque vous utilisez `console.log` et si vous utilisez `console.error`, il imprimera dans stderr.

`console.log`, `console.debug` et `console.info` s'imprime dans stdout, donc nous ne pourrons pas désactiver ou sur debug et info. De même, `console.warn` et `console.error` s'impriment tous deux dans stderr.
La bascule des différents niveaux est difficile pour l'application de production.

Nous avons également besoin de différents types de configuration comme le format standard, le format de sortie JSON à envoyer à la stack ELK, et ceux-ci ne sont pas disponibles dans la console prête à l'emploi.

Pour surmonter tous ces problèmes, nous allons utiliser [Winston](https://www.npmjs.com/package/winston) framework de journalisation, d'autres options sont également disponibles comme [log4js](https://www.npmjs.com/package/log4js), [Bunyan](https://github.com/trentm/node-bunyan), [Pino](https://getpino.io/#/), etc

**Pourquoi avons-nous besoin d'une bibliothèque de journalisation comme Winston ?**

Comme dans la dernière section, nous avons discuté de quelques défauts de la console, énumérons quelques fonctionnalités importantes fournies par Winston :

- **Niveaux**: Winston est livré avec quelques jeux de niveaux de logs et imprime également le niveau comme la partie du log, ce qui nous permettra de filtrer les logs dans notre tableau de bord centralisé.

  Par exemple `{message : "something wrong", level : "error"}`

  Vous pouvez également créer des niveaux personnalisés si nécessaire.

- **Formats**: Winston a quelques configurations avancées, comme donner des couleurs aux logs, formatage en JSON, etc.
- **Modifier dynamiquement les niveaux de journalisation**: Nous aurons l'avertissement et l'erreur activés dans notre application de production, et quand nécessaire, nous avons besoin de la fonctionnalité pour changer le niveau de journal pour déboguer et revenir à l'erreur, selon le besoin, sans redémarrer l'application. L'enregistreur Winston est livré avec cette fonction prête à l'emploi.

`gist:ludovicwyffels/83041af3c695c6fb4aa5604c95ac77ec`

Nous pouvons aussi exposer une API pour changer le niveau dynamiquement, exposer l'API REST et dans le handler exécuter la ligne #14 pour changer le niveau.

- **Transport**: Pour notre environnement de production, nous aimerions avoir un système de journalisation centralisé où tous nos microservices poussent les logs, et nous aurons le tableau de bord, le filtrage et la recherche des logs. Il s'agit de la configuration standard ELK ou d'une configuration équivalente.

`gist:ludovicwyffels/bf2d41e1833699baf1fc2b28901f8a44`

Winston est livré avec la configuration pour écrire nos journaux dans un fichier de sorte que tout agent expéditeur de journaux puisse pousser les journaux vers le système centralisé.

### 6) Incidence sur le rendement

Si la fréquence d'écriture du journal de l'application est élevée, cela peut avoir un impact direct sur les performances de l'application.

Le niveau debug et info contribue à plus de 95% des logs, c'est pourquoi nous devrions seulement activer le niveau d'erreur et d'avertissement, et changer le niveau pour déboguer quand nous voulons résoudre le problème et le ramener sur l'erreur.

Les journaux sont un sauveur de vie quand il y a un problème sur l'application. Si vous n'avez pas actuellement de pratiques d'enregistrement, encadrez une pratique d'enregistrement et ajoutez les enregistrements obligatoires dans la liste de contrôle de l'examen du code.
