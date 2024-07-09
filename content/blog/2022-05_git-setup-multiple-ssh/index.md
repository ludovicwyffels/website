---
title: "Comment configurer plusieurs clés SSH pour plusieurs comptes"
date: 2022-05-14T15:03:35+02:00
summary: "Vous possèdez peut-être plusieurs compte git. Nous allons voir comment connecter une identité personnelle et professionelle pour chaque compte avec des clés SSH."
draft: false
cover:
    image: "cover.jpg"
    relative: true
    caption: Photos de [Kelly Sikkema](https://unsplash.com/@kellysikkema) sur [Unsplash](https://unsplash.com)
tags:
  - "git"
  - "sécurité"
  - "ssh"
categories: ["git"]
series: ["Git"]
authors:
  - ludovicwyffels
---

Je possède des comptes personnels et professionnels sur [GitHub](https://github.com/), [GitLab](https://about.gitlab.com/) et [Bitbucket](https://bitbucket.org/).
Comment pourrais-je définir tout cela pour qu'il fonctionne correctement grâce aux clés SSH afin que mon système s'appuie sur la bonne clé SSH en fonction de l'identité qu'il doit utiliser.

Pour ce post particulier, nous allons connecter une identité personnelle et professionnelle pour chaque compte.
Mais vous pouvez en ajouter autant que vous le souhaitez. 😉

## 🔑 Génération de clés

Nous allons créer des identités par défaut.

Nous pouvons utiliser la même clé SSH pour cela ou utiliser une clé spécifique par compte.
- Même clé : `id_rsa`
- Clé spécifique par compte : `id_rsa_github` ; `id_rsa_bitbucket` ; `id_rsa_gitlab`

Utilisons la méthode de la "clé spécifique par compte". Il sera alors plus clair pour tout le monde de comprendre le concept.
De plus, nous avons besoin de l'adresse e-mail que vous utilisez pour ces comptes.
Mais n'hésitez pas à faire ce qui vous convient.😉 

### 👨‍💻 🗝️ Génération de clés personnelles

#### ✍️ Informations nécessaires

Résumons ce dont nous avons besoin dans un tableau.

Compte | Nom de la clé SSH | E-mail
--- | --- | ---
Github | `id_rsa_github` | nom.github@gmail.com
Gitlab | `id_rsa_gitlab` | nom.gitlab@gmail.com
Bitbucket | `id_rsa_bitbucket` | nom.bitbucket@gmail.com

#### 🛠️ Création de clés SSH

Exécutons ces commandes pour créer les clés SSH.
```bash
ssh-keygen -f "~/.ssh/id_rsa_github" -t rsa -b 4096 -C "nom.github@gmail.com"
ssh-keygen -f "~/.ssh/id_rsa_gitlab" -t rsa -b 4096 -C "nom.gitlab@gmail.com"
ssh-keygen -f "~/.ssh/id_rsa_bitbucket" -t rsa -b 4096 -C "nom.bitbucket@gmail.com"
```

Maintenant, nous avons 3 clés pour notre usage personnel.

### 🏢 🔑 Génération de clés d'organisation

#### ✍️ Informations requises

Résumons ce dont nous avons besoin dans un tableau.

Compte | Nom de la clé SSH | E-mail
--- | --- | ---
Github Entreprise | `id_rsa_github_nomOrganisation` | nom.github@organisation.com
Gitlab Entreprise | `id_rsa_gitlab_nomOrganisation` | nom.gitlab@organisation.com
Bitbucket Entreprise | `id_rsa_bitbucket_nomOrganisation` | nom.bitbucket@organisation.com

#### 🛠️ Création de clés SSH

Exécutons ces commandes pour créer les clés SSH.
```bash
ssh-keygen -f "~/.ssh/id_rsa_github_nomOrganisation" -t rsa -b 4096 -C "nom.github@organisation.com"
ssh-keygen -f "~/.ssh/id_rsa_gitlab_nomOrganisation" -t rsa -b 4096 -C "nom.gitlab@organisation.com"
ssh-keygen -f "~/.ssh/id_rsa_bitbucket_nomOrganisation" -t rsa -b 4096 -C "nom.bitbucket@organisation.com"
```

Maintenant, nous avons 3 clés pour notre usage professionnel.

## 📦 Ajouter les clés SSH à l'agent SSH

Nous avons maintenant 6 clés SSH. Ajoutons-les à l'agent SSH.

```bash
# Ajout des clés personnelles
ssh-add ~/.ssh/id_rsa_github
ssh-add ~/.ssh/id_rsa_gitlab
ssh-add ~/.ssh/id_rsa_bitbucket

# Ajout des clés d'organisation
ssh-add ~/.ssh/id_rsa_github_nomOrganisation
ssh-add ~/.ssh/id_rsa_gitlab_nomOrganisation
ssh-add ~/.ssh/id_rsa_bitbucket_nomOrganisation
```

Nous avons donc dans l'agent SSH les 3 clés pour notre usage personnel et les 3 clés pour l'usage professionnel.

Maintenant il est obligatoire de mettre en place la configuration afin de définir quelle clé doit être utilisée en fonction du contexte.

## 📝 Configuration

Ouvrir le fichier `~/.ssh/config` ou le créer s'il n'existe pas encore.

```bash
vim ~/.ssh/config
```

Nous allons définir quelques règles basées sur les hôtes.

```txt
Host github.com
  HostName github.com
  IdentityFile ~/.ssh/id_rsa_github

Host gitlab.com
  HostName gitlab.com
  IdentityFile ~/.ssh/id_rsa_gitlab

Host bitbucket.org
  HostName bitbucket.org
  IdentityFile ~/.ssh/id_rsa_bitbucket


Host organisation.github.com
  HostName github.com
  IdentityFile ~/.ssh/id_rsa_github_nomOrganisation

Host organisation.gitlab.com
  HostName gitlab.com
  IdentityFile ~/.ssh/id_rsa_gitlab_nomOrganisation

Host organisation.bitbucket.org
  HostName bitbucket.org
  IdentityFile ~/.ssh/id_rsa_bitbucket_nomOrganisation
```

Enregistrez et fermez le fichier.

## 💭 Ajouter les clés à vos comptes de dépôts

Tout est correctement configuré en local. Il faut maintenant ajouter les **clés SSH publiques** aux services que vous utilisez.

```bash
# macOS
tr -d '\n' < ~/.ssh/id_rsa.pub | pbcopy

# Linux (nécessite le paquet xclip)
xclip -sel clip < ~/.ssh/id_rsa.pub

# Git Bash sur Windows
cat ~/.ssh/id_rsa.pub | clip
```

Connectons-nous à vos comptes et allons dans les paramètres pour ajouter nos clés SSH.

Suivez la documentation de votre service pour savoir comment ajouter les clés.

- Github: [documentation](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- Gitlab: [documentation](https://docs.gitlab.com/ee/user/ssh.html)
- Bitbucket: [documentation](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

## 👨‍👦 Cloner des dépôts

Maintenant que nous avons notre Setup pour tous nos environnements, nous pouvons cloner des dépôts depuis Github, Gitlab ou Bitbucket avec l'identité appropriée.

### 👨‍💻 Dépôts personnels

Nous pouvons donc cloner les projets en utilisant une commande que vous avez dû utiliser de nombreuses fois.

```bash
git clone git@bitbucket.org:yourPersonalAccount/pet-project.git
```

Avec cette commande, git utilise la clé SSH "par défaut". C'est celle qui a été définie pour l'hôte `"Host github.com"` dans le fichier `~/.ssh/config`.

Vous pouvez alors pull ou push sur le dépôt avec cette identité.

### 🏢 Dépôts d'organisations

Pour les projets de votre organisation, il vous suffit de cloner le projet remplaçant `bitbucket.org` par `organisation.bitbucket.org` (tel que défini dans le fichier `~/.ssh/config`).

```bash
git clone git@companyname.bitbucket.org:companyName/company-project.git
```

C'est donc la bonne identité qui va être utilisée.
Vous pouvez ensuite pullor push autant de fois que vous le souhaitez avec l'identité de votre organisation.

J'espère que cela vous aidera.