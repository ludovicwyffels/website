---
title: "Exécuter des containers sur MacOS avec Lima"
authors: [ludovicwyffels]
date: 2023-11-25T15:14:35+02:00
summary: ""
draft: false
showToc: true
cover: cover.png
# cover:
#     image: "cover.png"
#     relative: true
#     caption: Photos de [Andy Li](https://unsplash.com/fr/@andylid0) sur [Unsplash](https://unsplash.com)
tags:
  - "Docker"
  - "MacOS"
  - "Lima"
categories: ["Docker"]
slug: run-conteners-on-macos-with-lima
---

Utiliser Docker sur MacOS peut être un problème, étant donné que Docker Desktop est un peu agressif avec la consommation des ressources de la machine et le [changement de leur license depuis le 31 janvier 2022](https://www.docker.com/blog/updating-product-subscriptions/), c'est pourquoi certaines alternatives ont été créées, Lima en fait partie, et c'est de cela que je vais parler un peu.

## Le projet Lima

Le projet [lima-vm](https://lima-vm.io/) (Linux Machines) utilise des machines virtuelles Linux pour effectuer un partage automatique de fichiers et une redirection de port (similaire à WSL2).

L'objective inital de Lima était de provouvoir [`containerd`](https://containerd.io/), y compris [nerdctl](https://github.com/containerd/nerdctl) ([contaiNEAD CTL](https://github.com/containerd/nerdctl)), auprès des utilisateurs de MacOS, mais Lima peut également être utilisé pour des applications non conteneurisées.

Lima prend également en charge:

- d'autres moteur de containers, tels que `docker`, `podman`, `apptainer`.
- des orchestrateurs de conteneurs tels que `Kubernetes` (avec `k3s` et via `kubeadm`), `faasd` et `nomad`.
- un bon nombre de distributions Linux, tel que `Alpine`, `Debian`, `Fedora`, `openSUSE`, `Arch Linux`, etc.

Vous pouvez consulter plus de détails dans le référentiel Github: [lima-vm](https://github.com/lima-vm/lima)

## Il est temps de l'utiliser

L'installation sur MacOS peut se faire avec homebrew:

```shell
brew install lima
```

Après cela, utilisez simplement la CLI (`limactl`) pour démarrer une instance:

```shell
limactl start
```

Les paramètres d'instance par défaut (`default`) sont:

- Système d'exploitation: la dernière version d'Ubuntu (actuellement: Ubuntu 23.10)
- Processeur: 4 cores
- Mémoire: 4 Go
- Disque: 100 Go
- Montages:
  - `~` (lecture seule)
  - `/tmp/lima` (écriture)
- SSH: 127.0.0.1:60022

Vous pouvez lancer une instance à partir d'un modèle, pour voir les modèles disponibles:

```shell
limactl start --list-templates
```

Le résultat ressemblera à ceci:

```text
almalinux-8
almalinux-9
almalinux
alpine
apptainer-rootful
apptainer
archlinux
buildkit
centos-stream-8
centos-stream-9
centos-stream
debian-11
debian-12
debian
default
...
```

Démarrage de l'instance à partir d'un modèle:

```shell
limactl start --name=alpine-instance template://alpine
```

Vous pouvez lister les instances créées/démarrées avec:

```shell
limactl list
```

Pour accéder à l'instance, vous pouvez utiliser la commande `limactl shell` de deux manières:

- ouvrir un shell: `limactl shell <instance-name>`
- exécuter une commande: `lima shell <instance-name> <command>`

Si vous le souhaitez arrêter une instance, utilisez simplement:

```shell
limactl stop <instance-name>
```

Et si vous souhaitez supprimer:

```shell
limatcl delete <instance-name>
```

Il existe d'autre commandes, vous pouvez consulter la liste [ici](https://lima-vm.io/docs/reference/).

