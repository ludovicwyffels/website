---
title: "Vim Modelines Vulnerable"
authors: [ludovicwyffels]
date: 2019-06-23T19:00:00+02:00
summary: "Mettez à jour Vim avec la dernière version en quelques minutes."
draft: fales
categories: ["vim"]
tags:
  - "vim"
  - "MacOS"
---

Si vous travaillez dans le terminal, vous utilisez probablement Vim fréquemment. Beaucoup de gens ont une relation d'amour/haine avec Vim, mais personnellement c'est mon éditeur de ligne de commande préféré, surtout quand je suis sur une machine Linux, et je l'utilise aussi fréquemment sur mon Mac, aussi.

Récemment, une [vulnérabilité](https://nvd.nist.gov/vuln/detail/CVE-2019-12735) a été [identifiée](https://github.com/numirias/security/blob/master/doc/2019-06-04_ace-vim-neovim.md) à Vim. La vulnérabilité concerne l'utilisation malveillante de la fonction `modelines` de Vim.

Cette vulnérabilité affecte toutes les versions de Vim antérieures à la version 8.1.1365, ce qui signifie qu'elle affecte aussi votre Mac, si vous utilisez la version fournie avec macOS 10.14.5, qui est 8.0.1283. Au moment d'écrire ces lignes, la version que nous installons est la 8.1.1573, ce qui permettra de corriger la vulnérabilité.

Nous allons discuter comment mettre à jour Vim à la dernière version pour éviter ce problème et aussi couvrir brièvement ce que signifie cette vulnérabilité.

Parlons d'abord des mauvaises choses.

## Que sont les _modelines_ et pourquoi devrais-je m'en soucier?

Sans vous ennuyer avec les détails précis, nous pouvons dire que les _modelines_ sont un moyent de configurer les préréglages dans Vim en ajoutant des commandes en haut des fichier qui définissent ces préréglages lors de l'exécution du fichier.

Alors qu'est-ce que cela signifie?

En termes de vulnérabilité, cela signifie que bien que les _modelines_ aient des cas d’utilisation légitimes, si vous avez une version vulnérable de Vim, il est possible d’abuser de cette fonctionnalité et d’échapper à la sandbox d’exécution de Vim, ce qui permet d’exécuter du code arbitraire de manière non sécurisée.

## Comment fonctionne cette vulnérabilité?

Imaginez un scénario dans lequel un acteur malveillant a chargé un script contenant des _modelines_ dans GitHub et a réussi à valider le fichier dans un référentiel que vous utilisez. L'attaquant a ajouté quelques lignes de commandes _modeline_ en haut d'un script censé être un script Bash standard. Vous décidez d'ouvrir le fichier dans Vim pour lire le code avant de l'exécuter (toujours une bonne idée... en général).

C’est tout ce dont nous avons besoin; le code malveillant s’exécute car tout ce que Vim doit faire est de lire le fichier et les _modelines_ sont exécutées, c’est ainsi que les _modelines_ sont supposées fonctionner. Malheureusement pour vous, votre version de Vim est obsolète et vous avez été infecté car ce code malveillant peut maintenant être exécuté en dehors de Vim.

Ou peut-être pas, parce que vous avez lu cet article en premier, puis vous avez mis à jour Vim.

## Liste de pré-installation

Il convient de discuter de certaines mises en garde avant de poursuivre. Chaque fois que vous apportez des modifications à macOS en utilisant un terminal, et en particulier en exécutant des commandes utilisant `sudo`, vous devez faire **attention car il est facile de casser des choses**.

**Premièrement**, nous ne pouvons pas supprimer la version de Vim installée avec macOS. Au lieu de cela, nous allons installer la dernière version et nous assurer que c'est celle utilisée lorsque vous accédez au terminal.

La raison pour laquelle nous ne pouvons pas supprimer la version de Vim fournie avec macOS est due à la configuration des autorisations dans macOS. Apple a configuré en toute sécurité les autorisations de sorte que l'utilisateur ne puisse plus modifier (ni même casser les composants) du système principal, y compris Vim.

De plus, nous ne souhaitons pas vraiment supprimer les logiciels de base afin de ne pas causer de conflits. Nous apportons un changement qui peut facilement être annulé si quelque chose se passait mal ou devait être changé à l'avenir.

**Deuxièmement**, nous allons exécuter quelques commandes en utilisant _sudo_. Cela signifie que vous allez exécuter ces commandes comme si vous étiez l'utilisateur _root_. Cela pourrait poser problème _si vous ne lisez pas et ne suivez pas les instructions à la lettre_.

Cela signifie également que vous devez avoir un accès administrateur dans macOS et que vous devrez fournir votre mot de passe lors de l'exécution de la commande.

Tu as été prévenu.

Mais ne vous inquiétez pas, ce que nous faisons est assez simple, et utiliser `sudo` n’est pas mauvais, c’est juste que vous voulez vous rappeler qu’un grand pouvoir implique de grandes responsabilités, et que `sudo` a définitivement un grand pouvoir.

> Un grand pouvoir implique de grandes responsabilités.
> 
> -- Oncle Ben (Spider Man)

Cela dit, passons à autre chose et commençons à mettre à jour Vim.

## Compiler Vim sur macOS

Pour commencer, ouvrons l’application Terminal. Vous pouvez rechercher cela en utilisant Spotlight (Cmd + Space) ou ouvrir votre dossier Applications, cliquez sur Utilitaires, puis sur Terminal.

Tout d’abord, nous devons récupérer la dernière version de Vim dans le dépôt officiel GitHub, puis nous allons changer de répertoire dans le répertoire `vim` qui vient d’être créé.

```bash
git clone https://github.com/vim/vim.git
cd vim
```

Nous venons de télécharger le code source de Vim, ce qui signifie que nous devrons le compiler avant de pouvoir l’installer. Pour ce faire, tapez simplement `make` dans le même répertoire.

Vous allez voir un mur de texte en cours de création lors de la compilation de l'application. Cela prendra probablement quelques minutes, en fonction de la vitesse de votre Mac. Une fois terminé, vous serez renvoyé à l’invite de commande.

## Installer le dernier Vim sur macOS

Maintenant que nous avons compilé Vim, il est temps de terminer l’installation. Pour exécuter la commande d’installation, vous devrez utiliser `sudo`. C’est une considération importante car cela signifie que nous installons dans un répertoire système et, comme je l’ai mentionné ci-dessus, nous souhaitons faire attention, veillez à exécuter correctement la commande suivante.

Exécutez ce qui suit dans le même dossier vim que nous utilisions. Votre mot de passe vous sera demandé, indiquez-le et la commande sera exécutée.

```bash
sudo make install
```

Encore une fois, vous verrez un mur de texte semblable à celui que vous avez vu lors de la compilation de Vim. Une fois ce processus terminé, Vim sera installé et vous reviendrez à l'invite de commande, mais **nous ne l'avons pas encore terminée**.

Comme je l’ai mentionné plus tôt, nous installons une installation supplémentaire de Vim. Nous voulons être certains que lorsque nous exécutons `vim` à partir du terminal, nous obtenons vraiment la bonne version.

Lisez la suite pour voir comment configurer ceci correctement.

## Configurer le bon Vim

Lorsque nous avons installé Vim, l'application binaire exécutable a été placée dans `/usr/local/bin/vim`. Toutefois, l'installation initiale de MacOS se trouve toujours dans `/usr/bin/vim`. Cela ne posera aucun problème lorsque nous utiliserons `vim` depuis le terminal, mais cela posera des problèmes si nous exécutons `vi`, ce qui est très courant pour les utilisateurs de longue date de Vim, car Vi est l’application sur laquelle Vim est basé.

Sur macOS, la commande `vi` est un lien symbolique vers `/usr/bin/vim` et cela n’a pas changé après notre installation. Vous remarquerez que la version affichée sur l'écran d'accueil de Vim est différente si vous exécutez `vim` vs. `vi`.

Cela pourrait causer des problèmes plus tard. Voyons ce qui se passe.

Que se passe t-il ici? Le problème est notre `PATH` - il sait toujours que le lien symbolique vi existe et lit le répertoire `/usr/bin` lorsque notre profil est chargé. Cependant, par défaut, `/usr/local/bin` est lu en premier, puis `/usr/bin`, ce qui signifie que nous devons simplement fournir un lien symbolique vers le chemin de l'application que nous voulons exécuter lorsque nous exécutons `vi`.

Faisons-le maintenant. Créez un lien symbolique à l'aide de la commande suivante, puis redémarrez votre terminal.

```bash
sudo ln -s /usr/local/bin/vim /usr/local/bin/vi
```

C'est tout! Une fois que vous aurez redémarré votre terminal, que vous utilisiez Vi ou Vim, vous obtiendrez la même installation mise à jour de Vim.

## Conclusion

J'espère que cela a été une expérience éducative, mais simple, mettant à jour l'éditeur de texte en ligne de commande préféré de tout le monde.

Merci d'avoir lu!
