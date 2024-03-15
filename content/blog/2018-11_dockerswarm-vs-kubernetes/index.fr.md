---
title: "Docker Swarm vs Kubernetes"
authors: [ludovicwyffels]
date: 2018-11-01T11:38:38+02:00
summary: "J'ai trouvé que Docker Swarm est très facile à installer et à configurer, alors que Kubernetes est un peu plus difficile à installer mais reste simple à utiliser."
draft: false
categories: ["DevOps"]
tags:
  - "Kubernetes"
  - "Docker"
  - "DevOps"
---

J'ai installé Docker Swarm et Kubernetes sur deux machines virtuelles. J'ai trouvé que Docker Swarm est très facile à installer et à configurer, alors que Kubernetes est un peu plus difficile à installer mais reste simple à utiliser.

## Introduction

Cela fait des années que je veux essayer des conteneurs: la configuration manuelle de serveurs prend du temps, n’est pas reproductible et risque d’introduire des différences entre mon environnement de test local et la production. Les containers offrent une solution à tous ces problèmes et facilite beaucoup l'exécution d'instances supplémentaires d'une application. Cela peut rendre un service plus évolutif.

Pour exécuter un service évolutif, vous avez besoin d'un moteur Container Orchestration qui répartit la charge en exécutant des conteneurs sur plusieurs ordinateurs et en envoyant des demandes à chaque instance de l'application. [Docker Swarm](https://docs.docker.com/engine/swarm/) et [Kubernetes](https://kubernetes.io/) sont deux moteurs d’orchestration populaires. J'ai décidé d'essayer les deux en déployant la même application avec chaque moteur.

## Création du conteneur

J'ai décidé d'utiliser Samba pour l'application de test. [Samba](https://fr.wikipedia.org/wiki/Samba_(informatique)) est un serveur de fichiers populaire permettant aux ordinateurs Linux de partager des fichiers avec des ordinateurs Windows. Il communique via TCP sur le port 445.

C’est la première fois que je travaille avec Docker, j’ai donc modifié un [conteneur Samba standard](https://github.com/crops/samba) afin d’inclure le fichier que je voulais servir.

Après le [tutoriel de Docker](https://docs.docker.com/get-started/part2/), j’ai lancé manuellement le conteneur à partir de la ligne de commande pour vérifier son fonctionnement:

```
docker build -t sambaonly-v1 .
docker run --init -p 445:445 -i sambaonly-v1
```

Et en effet, j'ai pu me connecter au serveur Samba dans le conteneur avec [smbclient](https://www.samba.org/samba/docs/current/man-html/smbclient.1.html)

```
~$ smbclient \\\\localhost\\workdir -U %
WARNING: The "syslog" option is deprecated
Try "help" to get a list of possible commands.
smb: \> ls
.                          D        0  Fri Oct  5 12:14:43 2018
..                         D        0  Sun Oct  7 22:09:49 2018
hello.txt                  N       13  Fri Oct  5 11:17:34 2018

102685624 blocks of size 1024. 72252576 blocks available
smb: \>
```

Maintenant que je sais que le conteneur fonctionne, je peux l'utiliser dans un moteur d'orchestration de conteneur.

## Préparer les machines virtuelles

J'ai créé deux machines virtuelles exécutant Ubuntu 18.04 dans VirtualBox.

J'ai ajouté une carte réseau supplémentaire à chaque machine virtuelle, configurée pour le réseau interne afin qu'ils puissent se parler:

https://cdn-images-1.medium.com/max/1600/1*chCjRdcU_mV9ioAyQ7oB5A.png

Ensuite, j'ai [ajouté un serveur DHCP](https://www.virtualbox.org/manual/ch08.html#vboxmanage-dhcpserver) pour attribuer des adresses IP à chaque machine virtuelle:

```
VBoxManage dhcpserver add --netname intnet --ip 10.133.7.99 --netmask 255.255.255.0 --lowerip 10.133.7.100 --upperip 10.133.7.200 --enable
```

Les machines virtuelles peuvent désormais communiquer entre elles. Cela donne à ma machine virtuelle principale l'adresse IP 10.133.7.100.

## Docker Swarm

Docker Swarm est un moteur d’orchestration de conteneur intégré à Docker lui-même. Quand je l'ai trouvé, j'étais sceptique: pourquoi l'utiliser à la place des Kubernetes, beaucoup plus célèbres? La réponse: Docker Swarm est axé sur la simplicité par rapport à la configuration. Cela ressemblait à l’iOS des moteurs d’orchestration de conteneurs par rapport à l’Android de Kubernetes.

### Mise en place de Docker Swarm

Docker Swarm est facile à installer: il suffit d'installer Docker et docker-compose. Ensuite, après le [tutoriel officiel](https://docs.docker.com/engine/swarm/swarm-tutorial/create-swarm/), j'ai exécuté la seule commande nécessaire pour démarrer le noeud du gestionnaire, en transmettant l'adresse IP de la machine virtuelle actuelle:

```
~$ docker swarm init --advertise-addr 10.133.7.100 
Swarm initialized: current node (abcdefghijklmnopqrstuvwxy) is now a manager.

To add a worker to this swarm, run the following command:

docker swarm join --token SWMTKN-1-abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx-abcdefghijklmnopqrstuvwxy 10.133.7.100:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

C’est tout: le moteur Docker tourne maintenant en mode Swarm.

Ensuite, j'ai déployé un registre privé Docker afin que les autres noeuds puissent extraire des images, en suivant à nouveau les [instructions d'installation](https://docs.docker.com/engine/swarm/stack-deploy/#set-up-a-docker-registry):

```
docker service create --name registry --publish published=5000,target=5000 registry:2
```

## Déploiement de l'application

Docker Swarm utilise le format [Docker Compose](https://docs.docker.com/compose/overview/) pour spécifier les conteneurs à exécuter et les ports qu'ils exportent.

Après le [didacticiel Docker Compose](https://docs.docker.com/compose/gettingstarted/#step-3-define-services-in-a-compose-file), j'ai créé ce manifeste Docker Compose:

```
version: '3.7'
services:
  samba:
    image: 127.0.0.1:5000/samba
    build: sambaonly
    init: true
    stdin_open: true
    ports:
      - "445:445"
```

Cela indique à Docker Compose de créer le fichier Docker à partir du répertoire «sambaonly», d'upload/pull les conteneurs construits vers mon registre privé nouvellement configuré et d’exporter le port 445 à partir du conteneur.

Pour déployer ce manifeste, j’ai suivi le tutoriel de Docker Swarm. J'ai d'abord utilisé Docker Compose pour créer et télécharger le conteneur dans le registre privé:

```
docker-compose build
docker-compose push
```

Une fois le conteneur créé, l'application peut être déployée avec la commande `docker stack deploy`, en spécifiant le nom du service:

```
$ docker stack deploy --compose-file docker-compose.yml samba-swarm
Ignoring unsupported options: build
Creating network samba-swarm_default
Creating service samba-swarm_samba
~/Documents/docker$ docker stack services samba-swarm
ID           NAME                  MODE       REPLICAS IMAGE PORTS
yg8x8yfytq5d samba-swarm_samba     replicated 1/1
```

Et maintenant, l'application fonctionne sous Samba Swarm. J'ai testé qu'il fonctionne toujours avec `smbclient`:

```
~$ smbclient \\\\localhost\\workdir -U %
WARNING: The "syslog" option is deprecated
Try "help" to get a list of possible commands.
smb: \> ls
.                          D        0  Fri Oct  5 12:14:43 2018
..                         D        0  Sun Oct  7 22:09:49 2018
hello.txt                  N       13  Fri Oct  5 11:17:34 2018

102685624 blocks of size 1024. 72252576 blocks available
smb: \>
```

## Ajout d'un autre noeud

Ici encore, la simplicité de Docker Swarm transparaît. Pour installer un deuxième noeud, j'ai d'abord installé Docker, puis exécuté la commande que Docker m'avait donnée lors de l'installation de swarm:

```
ralph:~# docker swarm join --token SWMTKN-1-abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwx-abcdefghijklmnopqrstuvwxy 10.133.7.100:2377

This node joined a swarm as a worker.
```

Pour exécuter mon application sur les deux nœuds, j'ai exécuté la commande scale de Docker Swarm sur le nœud du gestionnaire:

```
~/Documents/docker$ docker service scale samba-swarm_samba=2
samba-swarm_samba scaled to 2 overall progress: 2 out of 2 tasks
1/2: running [==================================================>]
2/2: running [==================================================>] verify: Service converged
```

Sur le nouveau noeud de travail, le nouveau conteneur est apparu:

```
ralph:~# docker container ls
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
7539549283bd 127.0.0.1:5000/samba:latest "/usr/sbin/smbd -FS …" 20 seconds ago Up 18 seconds 445/tcp samba-swarm_samba.1.abcdefghijklmnopqrstuvwxy
```

## Test de l'équilibrage de charge (load balancing)

Docker Swarm comprend un load balancing intégré appelé routeur Mesh: les demandes adressées à l’adresse IP de tout noeud sont automatiquement réparties sur l’ensemble de Swarm.

Pour tester cela, j’ai établi 1000 connexions à l’adresse IP du noeud du gestionnaire avec `nc`:

```
print("#!/bin/bash")
for i in range(1000):
    print("nc -v 10.133.7.100 445 &")
print("wait")
```

Samba génère un nouveau processus pour chaque connexion. Par conséquent, si l'équilibrage de la charge fonctionne, je m'attendrais à environ 500 processus Samba sur chaque noeud de Swarm. C'est bien ce qui se passe.

Après avoir exécuté le script pour établir 1000 connexions, j'ai vérifié le nombre de processus Samba sur le gestionnaire (10.133.7.100):

```
~$ ps -ef|grep smbd|wc
506 5567 42504
```

Et sur le noeud travailleur (10.133.7.50):

```
ralph:~# ps -ef|grep smbd|wc
506 3545 28862
```

Ainsi, exactement la moitié des demandes adressées au noeud de gestion ont été redirigées de manière magique vers le premier noeud de travail, ce qui montre que le cluster Swarm fonctionne correctement.

J'ai trouvé que Docker Swarm était très facile à installer et il fonctionnait bien sous une charge (légère).

# Kubernetes

Kubernetes est en train de devenir l'industrie standard de l'orchestration de conteneurs. C'est beaucoup plus flexible que Docker Swarm, mais cela rend plus difficile la configuration. Je l'ai trouvé pas si difficile, cependant.

Pour cette expérience, au lieu d'utiliser un environnement de développement Kubernetes pré-construit tel que [`minikube`](https://kubernetes.io/docs/setup/minikube/), j'ai décidé de configurer mon propre cluster, à l'aide de Kubadm, WeaveNet et MetalLB.

## Mise en place de Kubernetes

Kubernetes à la réputation d'être difficile à configurer: vous avez entendu le processus complexe en plusieurs étapes du didacticiel [Kubernetes the Hard Way](https://github.com/kelseyhightower/kubernetes-the-hard-way)

Les développeurs de Kubernetes ont simplifié l'utilisation de `kubeadm`.

Malheureusement, Kubernetes étant si flexible, le [tutoriel sur `kubeadm`](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/) ne couvre pas encore quelques étapes. J'ai donc dû déterminer le réseau et l'équilibreur de charge à utiliser moi-même.

Voici ce que j'ai fini par lancer.

J'ai d'abord dû désactiver Swap sur chaque noeud:

```
root@dora:~# swapoff -a
root@dora:~# systemctl restart kubelet.service
```

Ensuite, j'ai configuré le noeud maître (10.133.7.100) avec la commande suivante:

```
sudo kubeadm init --pod-network-cidr=10.134.0.0/16 --apiserver-advertise-address=10.133.7.100 --apiserver-cert-extra-sans=10.0.2.15
```

L'option `--pod-network-cidr` attribue une adresse réseau interne à tous les noeuds du réseau, utilisée pour les communications internes dans Kubernetes.

Les options `--apiserver-advertise-address` et `--apiserver-cert-extra-sans` ont été ajoutées à cause d'un problème particulier dans l'installation de VirtualBox: la carte virtuelle principale des machines virtuelles (IP 10.0.2.15) ne peut accéder qu'à l'Internet. J'ai dû préciser que d'autres noeuds doivent accéder au maître à l'aide de l'adresse IP 10.133.7.100.

Après avoir exécuté cette commande, Kubeadm a affiché quelques instructions:

```
Your Kubernetes master has initialized successfully!
To start using your cluster, you need to run the following as a regular user:

mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
https://kubernetes.io/docs/concepts/cluster-administration/addons/
You can now join any number of machines by running the following on each node as root:

kubeadm join 10.133.7.100:6443 --token abcdefghijklmnopqrstuvw --discovery-token-ca-cert-hash sha256:abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl
```

J'ai raté ces instructions la première fois et je n’ai donc pas terminé la configuration. J'ai ensuite passé une semaine entière à me demander pourquoi aucun de mes conteneurs ne fonctionnait!

Après avoir enfin lu les instructions, je devais faire trois autres choses:

- Tout d'abord, je devais exécuter les commandes données par `kubeadm` pour configurer un fichier de configuration.
- Par défaut, Kubernetes ne planifie pas les conteneurs sur le nœud maître, mais uniquement sur les noeuds de travail. Comme je n'ai qu'un seul noeud pour le moment, le [tutoriel](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#master-isolation) m'a montré cette commande pour autoriser l'exécution de conteneurs sur le seul noeud:

```
kubectl taint node --all node-role.kubernetes.io/master-
```

- Enfin, je devais choisir un réseau pour mon cluster.

## Installation du réseau

Contrairement à Docker Swarm, qui doit utiliser sa propre couche de routage maillé pour la mise en réseau et l'équilibrage de la charge, Kubernetes offre de multiples choix pour la mise en réseau et l'équilibrage de la charge.

Le composant de mise en réseau permet aux conteneurs de communiquer en interne. J'ai fait des recherches et [cet article comparatif](https://www.objectif-libre.com/en/blog/2018/07/05/k8s-network-solutions-comparison/) suggérait Flannel ou WeaveNet, car ils sont faciles à configurer. Ainsi, j'ai décidé d'essayer WeaveNet. J'ai suivi les instructions du [didacticiel kubeadm](https://kubernetes.io/docs/setup/independent/create-cluster-kubeadm/#pod-network) pour appliquer la configuration de WeaveNet:

```
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

Ensuite, pour permettre aux conteneurs de communiquer avec le monde extérieur, j'ai besoin d'un équilibreur de charge. D'après mes recherches, j'ai eu l'impression que la plupart des implémentations de l'équilibreur de charge Kubernetes se concentrent uniquement sur les services HTTP, et non sur le TCP brut. Heureusement, j’ai trouvé MetalLB, un projet récent (vieux d’un an) qui comble cette lacune.

Pour installer MetalLB, j'ai suivi son [didacticiel de mise en route](https://metallb.universe.tf/tutorial/layer2/) et j'ai tout d'abord déployé MetalLB:

```
kubectl apply -f https://raw.githubusercontent.com/google/metallb/v0.7.3/manifests/metallb.yaml
```

Ensuite, j'ai attribué la plage d'adresses IP 10.133.7.200 à 10.133.7.230 à MetalLB, en créant et en appliquant [ce fichier de configuration](https://gist.github.com/ludovicwyffels/917a399b423868f9415e6c384138e550):

```
kubectl apply -f metallb-config.yaml
```

## Déploiement de l'application

Les fichiers de configuration du service de Kubernetes sont plus détaillés que ceux de Docker Swarm, en raison de la flexibilité de Kubernetes. En plus de spécifier le conteneur à exécuter, comme Docker Swarm, je dois spécifier comment chaque port doit être traité.

Après avoir lu [le tutoriel de Kubernetes](https://kubernetes.io/docs/tasks/run-application/run-stateless-application-deployment/), j’ai proposé cette configuration de Kubernetes, composée d’un service et d’un déploiement.

https://gist.github.com/ludovicwyffels/911bb25b611f3519745aeee0d53c6447

Ce [service](https://kubernetes.io/docs/concepts/services-networking/#defining-a-service) demande à Kubernetes d’exporter le port TCP 445 de nos conteneurs Samba vers l’équilibreur de charge.

https://gist.github.com/ludovicwyffels/41022da159c539e45027c68776f459d8

Cet objet `Deployment` indique à Kubernetes d'exécuter mon conteneur et d'exporter un port que le service doit gérer.

Notez le `replicas: 1` - c'est le nombre d'instances du conteneur que je veux exécuter.

Je peux déployer ce service sur Kubernetes en utilisant `kubectl apply`:

```
ludo@dora:~/Documents/docker$ kubectl apply -f kubernetes-samba.yaml
service/samba configured
deployment.apps/samba configured
```

Et, après avoir redémarré ma machine virtuelle à quelque reprises, le déploiement a finalement commencé à fonctionner:

```
ludo@dora:~/Documents/docker$ kubectl get pods
NAME                   READY STATUS  RESTARTS AGE
samba-57945b8895-dfzgl 1/1   Running 0        52m
ludo@dora:~/Documents/docker$ kubectl get service samba
NAME  TYPE         CLUSTER-IP     EXTERNAL-IP  PORT(S)       AGE
samba LoadBalancer 10.108.157.165 10.133.7.200 445:30246/TCP 91m
```

Mon service est maintenant disponible sur l'adresse IP externe attribuée par MetalLB:

```
ludo@dora:~$ smbclient \\\\10.133.7.200\\workdir -U %
WARNING: The "syslog" option is deprecated
Try "help" to get a list of possible commands.
smb: \> ls
.                          D        0  Fri Oct  5 12:14:43 2018
..                         D        0  Sun Oct  7 22:09:49 2018
hello.txt                  N       13  Fri Oct  5 11:17:34 2018

102685624 blocks of size 1024. 72252576 blocks available
smb: \>
```

## Ajout d'un autre noeud

Ajouter un autre noeud dans un cluster Kubernetes est beaucoup plus simple: il me suffisait d'exécuter la commande donnée par `kubeadm` sur le nouvel ordinateur:

```
ludo@davy:~$ sudo kubeadm join 10.133.7.100:6443 --token abcdefghijklmnopqrstuvw --discovery-token-ca-cert-hash sha256:abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl

(snip...)

This node has joined the cluster:* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.

Run 'kubectl get nodes' on the master to see this node join the cluster.
```

## Bizarreries de ma configuration

J'ai dû faire deux changements en raison de la configuration de VirtualBox:

Premièrement, comme ma machine virtuelle dispose de deux cartes réseau, je dois indiquer manuellement l’adresse IP de ma machine à Kubernetes. Selon [ce problème](https://github.com/kubernetes/kubeadm/issues/203), je devais éditer

```
/etc/systemd/system/kubelet.service.d/10-kubeadm.conf
```

Et changer une ligne en

```
Environment="KUBELET_CONFIG_ARGS=--config=/var/lib/kubelet/config.yaml --node-ip=10.133.7.101"
```

avant de redémarrer Kubernetes:

```
root@davy:~# systemctl daemon-reload
root@davy:~# systemctl restart kubelet.service
```

L’autre solution concerne le registre Docker: comme le nouveau noeud ne peut accéder à mon registre privé sur le noeud maître, j’ai décidé de procéder à un terrible hack et de partager le registre de mon noeud maître vers la nouvelle machine à l’aide de `ssh`:

```
ludo@davy:~$ ssh dora.local -L 5000:localhost:5000
```

Cela transmet le port 5000 du noeud principal, dora (qui exécute le registre Docker) à localhost, où Kubernetes peut le trouver sur cette machine.

En production réelle, il est probable que le registre Docker sera hébergé sur une machine distincte, afin que tous les noeuds puissent y accéder.

## "Scaling" de l'application

Lors de la deuxième installation de l'ordinateur, j'ai modifié mon déploiement d'origine pour ajouter une autre instance de l'application:

```
replicas: 2
```

Après avoir redémarré le maître et le worker à quelques reprises, la nouvelle instance de mon application a finalement quitté le statut de `CreatingContainer` et a commencé à s'exécuter:

```
ludo@dora:~/Documents/docker$ kubectl get pods
NAME                   READY STATUS  RESTARTS AGE
samba-57945b8895-dfzgl 1/1   Running 0        62m
samba-57945b8895-qhrtl 1/1   Running 0        12m
```

## Test de l'équilibrage de charge

J'ai utilisé la même procédure pour ouvrir 1000 connexions à Samba s'exécutant sur Kubernetes. Le résultat est intéressant.

Master:

```
ludo@dora$ ps -ef|grep smbd|wc
492 5411 41315
```

Worker:

```
ludo@davy:~$ ps -ef|grep smbd|wc
518 5697 43499
```

Kubernetes / MetalLB a également équilibré la charge sur les deux machines, mais la machine principale a eu un peu moins de connexions que le worker. Je me demande pourquoi.

Quoi qu'il en soit, cela montre que j'ai finalement réussi à installer Kubernetes après plusieurs détours.

# Comparaison et conclusion

**Fonctionnalités communes aux deux**: les deux peuvent gérer des conteneurs et gérer intelligemment les demandes d'équilibrage de charge sur la même application TCP sur deux machines virtuelles différentes. Les deux ont une bonne documentation pour la configuration initiale.

**Les atouts de Docker Swarm**: une configuration simple, aucune configuration requise, une intégration étroite avec Docker.

**Les points forts de Kubernetes**: composants souples, nombreuses ressources disponibles et add-ons.

Kubernetes vs Docker Swarm est un compromis entre simplicité et flexibilité.

J’ai trouvé plus facile d’installer Docker Swarm, mais je ne peux pas, par exemple, échanger l’équilibreur de charge contre un autre composant. Il n’ya aucun moyen de le configurer: je devrais [tout désactiver en même temps](https://docs.docker.com/engine/swarm/ingress/#using-the-routing-mesh).

Sur Kubernetes, il m'a fallu un certain temps pour trouver la bonne configuration, mais en échange, je pouvais changer certaines parties de mon cluster selon les besoins et installer facilement des add-ons, tels qu'un [tableau de bord sophistiqué](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/).

Si vous voulez juste essayer Kubernetes sans toute cette configuration, je vous suggère d’utiliser [`minikube`](https://kubernetes.io/docs/setup/minikube/), qui offre une machine virtuelle de cluster Kubernetes prédéfinie, aucune installation requise.

Enfin, je suis impressionné par le fait que les deux moteurs ont pris en charge les services TCP bruts: d’autres fournisseurs de services d’infrastructure en tant que services, tels que Heroku ou Glitch, ne prennent en charge que l’hébergement de sites Web HTTP. La disponibilité des services TCP signifie que l’on peut déployer ses propres serveurs de base de données, ses serveurs de cache et même ses serveurs Minecraft en utilisant les mêmes outils pour déployer des applications Web, faisant de la gestion de l’orchestration de conteneurs une compétence très utile.

En conclusion, si je construisais un cluster, j'utiliserais Docker Swarm. Si je payais quelqu'un d'autre pour construire un cluster pour moi, je demanderais Kubernetes.

# Ce que j'ai appris

- Comment travailler avec les conteneurs Docker
- Comment configurer un cluster Docker Swarm à deux noeuds
- Comment configurer un cluster Kubernetes à deux noeuds et quels choix fonctionneraient pour une application basée sur TCP
- Comment déployer une application sur Docker Swarm et Kubernetes
- Comment réparer quoi que ce soit en redémarrant un ordinateur assez souvent, comme si je utilisais encore Windows 98
- Kubernetes et Docker Swarm ne sont pas aussi intimidants qu’ils semblent
