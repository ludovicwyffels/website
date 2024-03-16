---
title: "Automatisez les mises à jour des dépendances"
authors: [ludovicwyffels]
date: 2019-08-10T13:58:25+02:00
summary: "Voyons comment automatiser ce processus dans un environnement d'entreprise en supposant que vous ayez un environnement CI/CD et un repo GitHub privé."
draft: false
categories: ["Node.js"]
tags:
  - "Node.js"
---

Une application Node raisonnablement grande aura des centaines de dépendances. Les garder tous à jour est une chose qu'un développeur doit réaliser à un moment ou à un autre. Soit vous ignorez les mises à jour des dépendances jusqu'à ce que vous soyez coincé avec un très ancien ensemble de dépendances qui entravent votre progression avec les vulnérabilités de sécurité ou vous passez votre précieux temps de développement d'application à tester manuellement les mises à jour sur une cadence raisonnable.

Voyons comment automatiser ce processus dans un environnement d'entreprise en supposant que vous ayez un environnement CI/CD et un repo GitHub privé.

## Ingrédients

1. Tests unitaires solides pour votre code. Points bonus si vous avez des tests de e2e et des tests snapshot pour les composants de l'interface utilisateur.
2. `next-update` _Un paquet npm qui teste si vos dépendances peuvent être mises à jour sans casser les tests_.
3. `hub` CLI Il s'agit d'une application en ligne de commande de Git "Hub" qui peut interagir avec votre GitHub repo. `hub` est exactement similaire à `git` CLI et constitue un remplacement immédiat, mais dispose des fonctionnalités supplémentaires pour interagir avec GitHub. Pratique pour ouvrir une Pull Request après l'opération de mise à jour.

## Recette

- `npm install next-update --save-dev`
  Installez next-update en tant que dev-dependency.
- Configurez un script npm `dep:update` dans votre section de scripts du fichier `package.json`

```json
// package.json
{
  "name": "a-sample-node-project",
  "version": "0.0.1",
  "description": "A sample node project",
  "scripts": {
    "test": "jest",
    "start": "node app.js",
    "dep:update": "next-update" // Configure an npm script
  },
  "devDependencies": {
    "next-update": "^3.6.0"
  },
  "dependencies": {
  },
}
```

- `npm run dep:update`
  Exécutez le script. `next-update` ira de l'avant et trouvera tous les nouveaux paquets. Les met à jour en séquence et conserve la mise à jour si vos tests réussissent.
- Téléchargez et installez le `hub` cli

```bash
# download-hub.sh
HUB_CLI=/opt/hub-linux/bin/hub
if [[ ! -f $HUB_CLI ]]; then
  wget https://github.com/github/hub/releases/download/v2.12.2/hub-linux-amd64-2.12.2.tgz
  tar zxvf hub-linux-amd64-2.12.2.tgz
  rm -rf hub-linux-amd64-2.12.2.tgz /opt/hub-linux
  mv hub-linux-amd64-2.12.2 /opt/hub-linux
fi
```

- Configurez hub

```bash
git config --global --replace-all hub.host github.yourdomain.com
git config --global --replace-all hub.protocol git
```

- Demander au bot d'ouvrir une Pull Request

```bash
$HUB_CLI add package.json package-lock.json
$HUB_CLI commit -m "[BOT] Automated dependency update"
$HUB_CLI pull-request \
  --push \
  -m "Pull Request Subject" \
  -m "Pull Request Description" \
  --no-edit \
  --reviewer user-id1,user-id2
```

Raccordez ce script dans votre environnement CI/CD pour qu'il s'exécute quotidiennement
