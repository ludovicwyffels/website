---
title: "Configuration locale de Kubernetes avec minikube sur MacOS"
authors: [ludovicwyffels]
date: 2019-05-23T08:19:47+02:00
summary: Dans ce guide, je vais essayer de vous aider à le mettre en marche sur votre machine locale, à donner quelques conseils sur où et comment effectuer certaines tâches et à le rendre aussi capable (je suppose quand vous utilisez k8s que vous veulent apprendre et utiliser Helm, etcd, istio, etc.).
draft: false
categories: ["Kubernetes", "DevOps"]
tags:
  - "Kubernetes"
  - "DevOps"
  - "Minikube"
---

[Minikube](https://kubernetes.io/docs/setup/minikube/) est un outil idéal pour configuer localement [Kubernetes](https://kubernetes.io/) afin de tester et d'expérimenter vos déploiements.

Dans ce guide, je vais essayer de vous aider à le mettre en marche sur votre machine locale, à donner quelques conseils sur où et comment effectuer certaines tâches et à le rendre aussi capable (je suppose quand vous utilisez k8s que vous veulent apprendre et utiliser Helm, etcd, istio, etc.).

# Installation de minikube

Minikube fonctionne avec une machine virtuelle. Pour cela, on peut utiliser diverses options en fonction de vos préférences et de votre système d'exploitation. Ma préférence dans ce cas est Orable [VirtualBox](https://www.virtualbox.org/wiki/Downloads).

Vous pouvez utiliser **brew** pour tout installer:

```bash
brew cask install virtualbox minikube
```

Dans ce cas, vous pourriez obtenir une erreur d'installation peu concluante liée à l'installation de virtualbox, en particulier sur Mojave et problablement par la suite.

Quoi qu'il en soit, il s'agit problablement d'une nouvelle fonctionnalité de sécurité dans MacOs X qui vous gêne.

Allez dans **Préférences Système> Sécurité et confidentialité** et sur l'écran **Général**, vous verrez un (ou quelques) messages concernant certains logiciels nécessitant une approbation pour être installés. Vous devez examiner attentivement la liste s'il en existe plusieurs et autoriser l'installation du logiciel dont vous avez besoin - dans ce cas, le logiciel **Oracle**.

Cela fait, vous pourrez relancer la commande ci-dessus et vous devrez alors être prêt pour les étapes suivantes.

# Exécuter et accéder au cluster

```bash
minikube start
```

Afin d'utiliser de manière optimale les ressources de votre ordinateur local, je suggérerais de l'arrêter quand vous n'en avez plus besoin… Avec VirtualBox au centre, il utilisera la batterie de votre ordinateur portable assez rapidement. Recommencer plus tard vous ramènera là où vous l'avez laissé:

```bash
minikube stop
```

Le tableau de bord Kubernetes est également disponible (lorsque minikube est en cours d'exécution):

```bash
minikube dashboard
```

Je vais supposer que vous avez kubectl installé localement et que vous l'utilisez déjà pour certains clusters distants, vous disposez donc de plusieurs contextes. Dans ce cas, vous devez répertorier les contextes et passer à minikube.

```bash
kubectl config get-contexts
kubectl config use-context minikube
```

Vous vous trouvez maintenant dans le contexte de votre cluster k8 local qui s’exécute sur minikube et vous pouvez effectuer toutes les opérations k8 qu’il contient.

# Ingress

Pour exécuter vos déploiements comportant un ingress, vous aurez besoin d'un add-on d'entrée:

```bash
minikube addons enable ingress
```

Assurez-vous que vous configurez l'ingress en fonction de vos hôtes locaux. Cela signifie fondamentalement que tout ce que vous définissez comme hôte dans vos règles d'ingress doit être configuré dans votre fichier /etc/hosts

```text
[minikube ip] your.host
```

Où `[minikube ip]` devrait être remplacé par l'ip actuel de minikube. Il fonctionne également avec plusieurs hôtes locaux séparés par des espaces après l'adresse ip de minikube.

Voici un raccourci pour le faire en bash

```bash
echo "$(minikube ip) local.host" | sudo tee -a /etc/hosts
```

# Docker registry

> La réalité de l'utilisation réelle du registre de conteneurs dans l'environnement local est rude. Je vais donc vous fournir une option simple, rapide et simpliste qui facilite le déploiement de votre travail local sur vos k8s locaux, mais vous prive de l'expérience très importante du registre de conteneurs.
## Registre de conteneurs local

Obtenez le contexte de votre docker local pour pointer vers le context minikube: 

```bash
eval $(minikube docker-env)
```

Dans le contexte minikube, pour démarrer le registre docker local

```bash
docker run -d -p 5000:5000 --restart=always --name registry registry:2
```

Donc, vous avez maintenant un registre local dans lequel pousser des choses (tant que votre docker est dans le contexte minikube)

Vous pouvez maintenant faire:

```bash
docker build . -t <your_tag>
docker tag <your_tag> localhost:5000/<your_tag>:<version>
```

A ce stade, vous pouvez utiliser `localhost:5000/<your_tag>`: comme image dans votre déploiement et c'est tout.

## Utilisation du référentiel de conteneur distant

Pour utiliser localement le référentiel de conteneur distant, vous devez fournir un moyen d'authentification, qui se base sur les [secrets](https://kubernetes.io/docs/concepts/configuration/secret/) de Kubernetes.

Pour la gestion des secrets locaux pour ECR, GCR and Docker registry, je recommande d'utiliser l'addon minikube appelé [registry-creds](https://github.com/upmc-enterprises/registry-creds). Je ne le considère pas suffisamment sûr pour être utilisé ailleurs que dans l'environnement local.

```bash
minikube addons configure registry-creds
minikube addons enable registry-creds
```

# Helm

Helm est un gestionnaire de paquets pour k8s et est souvent utilisé pour la gestion de la configuration d'un déploiement à l'autre. Compte tenu de la grande popularité de l'outil et de son adoption croissante, je voudrais terminer ce guide par une note sur l'ajout de helm à votre environnement Kubernetes local.

C'est assez facile à ce stade, il suffit de mettre en place minikube et:

```bash
brew install kubernetes-helm
helm init
```

> Helm utilise un backend appelé **Tiller**. C'est ce qui est installé/déployé lors de l'exécution de `helm init`.
Une lecture précieuse: https://helm.sh/docs/using_helm/

Maintenant, vous disposez d'un environnement Kubernetes local complet capable d'accepter tous vos déploiements de test avant de décider de les placer dans le cloud.
