---
title: "Bash - Vérifier les variables d'environnement sont définies ou s'il existe des fichiers/références"
authors: [ludovicwyffels]
date: 2019-05-21T22:02:31+02:00
summary: ""
draft: false
categories: ["Bash"]
tags:
  - "Bash"
  - "DevOps"
---

La configuration, le CI et les flux de déploiement représente un peu l'ancien script bash.

Malgré mon profond intérêt pour les subtilités de Bash (_/sarcasme_), j'ai continué à chercher des solution aux mêmes situations sur  Google et StackOverflow.

Pour éviter d'avoir à le refaire moi-même et pour votre plaisir de lecture, les voici.

## Vérifier si un fichier existe

```bash
if [ ! -f ./pdfgen/pdfgen ]; then
    echo "Building pdfgen binary"
    npm run --prefix pdfgen build:linux
else
    echo "Pdfgen binary already exists, skipping build"
fi
```

## Vérifier si un lien symbolique existe

```bash
if [ ! -L /usr/local/bin/heroku ];
then
    wget https://cli-assets.heroku.com/branches/stable/heroku-linux-amd64.tar.gz
    sudo mkdir -p /usr/local/lib /usr/local/bin
    sudo tar -xvzf heroku-linux-amd64.tar.gz -C /usr/local/lib
    sudo ln -s /usr/local/lib/heroku/bin/heroku /usr/local/bin/heroku
fi
```

## Vérifier si une variable d'environnement est définie

```bash
# long
if [[ -z "${CIRCLE_BRANCH}"] ]; then
    npm run redis-cli flushall
fi

npm run sync

# one-liner
[-z "${CIRCLE_BRANCH}"] && npm run redis-cli flushall; npm run sync
```

## Basculer une variable d'environnement

```bash
case $CIRCLE_BRANCH in
    "develop")
        export ENVIRONMENT="dev"
        export HEROKU_APP=dev-app
        ;;
    "staging")
        export ENVIRONMENT="staging"
        export HEROKU_APP=staging-app
        ;;
    "production")
        export ENVIRONMENT="production"
        export HEROKU_APP=production-app
        ;;
esac
```

## Demander à l'utilisateur

```bash
read -p "Are you sure you want to merge 'develop' into 'staging'? (y/N)" -n 1 -r
echo # we like having a new line

if [[ $REPLY =~ ^[Yy]$ ]]
then
  git merge develop --ff-only
  git push
fi
```

Un dernier conseil, s'il s'agit de plusieurs lignes, essayez d'utiliser quelque chose comme JavaScript ou Python pour écrire votre script.

## Injecter .env dans votre session/environnement

Nous avons des fichiers `.env`, Docker Compose traite cela avec une utilisation habituelle, mais disons que nous voulons que quelque chose tourne en dehors de Docker (et sans utiliser quelque chose comme [dotenv](https://github.com/motdotla/dotenv)).

Voici l'extrait de code pour un shell UNIX

```bash
export $(cat .env | xargs)
```
