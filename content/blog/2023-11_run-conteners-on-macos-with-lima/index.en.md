---
title: "Running containers on MacOS with Lima"
authors: [ludovicwyffels]
date: 2023-11-25T15:14:35+02:00
summary: ""
draft: true
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


Using Docker on MacOS can be a problem, given that Docker Desktop is a bit aggressive with the machine's resource consumption, which is why some alternatives have been created, Lima being one of them, and that's what I'm going to talk about a bit.

## The Lima project

The [lima-vm](https://lima-vm.io/) (Linux Machines) project uses Linux virtual machines to perform automatic file sharing and port forwarding (similar to WSL2).

Lima's original aim was to promote [`containerd`](https://containerd.io/), including [nerdctl](https://github.com/containerd/nerdctl) ([contaiNEAD CTL](https://github.com/containerd/nerdctl)), to MacOS users, but Lima can also be used for non-containerised applications.

Lima also supports:

- other container engines, such as `docker`, `podman`, `apptainer`.
- container orchestrators such as `Kubernetes` (with `k3s` and via `kubeadm`), `faasd` and `nomad`.
- a number of Linux distributions, such as `Alpine`, `Debian`, `Fedora`, `openSUSE`, `Arch Linux`, etc.

More details can be found in the Github repository: [lima-vm](https://github.com/lima-vm/lima)

## It's time to use it

Installation on MacOS can be done with homebrew:

```shell
brew install lima
```

After that, simply use the CLI (`limactl`) to start an instance:

```shell
limactl start
```

The default instance settings (`default`) are:

- Operating system: the latest version of Ubuntu (currently Ubuntu 23.10)
- Processor: 4 cores
- Memory: 4 GB
- Disk: 100 GB
- Mounts:
  - `~` (read-only)
  - `/tmp/lima` (write)
- SSH: 127.0.0.1:60022

You can start an instance from a template, to see the available templates:

```shell
limactl start --list-templates
```

The result will look like this:

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
deprecated/centos-7
docker-rootful
docker
experimental/9p
experimental/armv7l
experimental/net-user-v2
experimental/opensuse-tumbleweed
experimental/riscv64
experimental/rke2
experimental/virtiofs-linux
experimental/vnc
experimental/vz
experimental/wsl2
faasd
fedora
k3s
k8s
opensuse
oraclelinux-8
oraclelinux-9
oraclelinux
podman-rootful
podman
rocky-8
rocky-9
rocky
ubuntu-lts
ubuntu
vmnet
```

Start instance from template:

```shell
limactl start --name=alpine-instance template://alpine
```

You can list instances created/started with:

```shell
limactl list
```

To access the instance, you can use the `limactl shell` command in one of two ways:

- open a shell: `limactl shell <instance-name>`
- execute a command: `lima shell <instance-name> <command>`

If you want to stop an instance, simply use:

```shell
limactl stop <instance-name>
```

And if you wish to delete:

```shell
limatcl delete <instance-name>
```

There are other commands, you can see the list [here](https://lima-vm.io/docs/reference/).

{{< figure
    src="featured.jpg"
    alt="Port of Seatle"
    caption="Photos by [Andy Li](https://unsplash.com/fr/@andylid0) on [Unsplash](https://unsplash.com)"
    >}}
