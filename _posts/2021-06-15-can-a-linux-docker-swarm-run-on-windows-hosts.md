---
layout: post
title: Can A Linux Docker Swarm Run on Windows Hosts?
date:   2021-06-15 9:42:00 -0500
categories: DevOps
color: vermilion
tags: docker swarm linux windows
---

## TL,DR: Not Yet in Production

I am currently working on a failover orchestration for a small system of servers running a medium number of applications. Most of those, and their supporting infrastructures, are packaged and deployed using Docker. Container orchestration tools like Docker Swarm and Kubernetes have some righteous features like automatic internal DNS, service discovery, routing, and system-self-healing that make failing over when a host fails a breeze to set up. The only trick is, our hosts are _Windows_ servers (Windows 10 IoT to be specific) which aren't particularly known for playing nice with Docker. Can we have it our way? Come with me on my journey to find out!

<!--more-->

## What We Need

Let's start by taking inventory: We have a more than a handful of Docker Linux containers, including applications built in-house by different teams, supporting third-party apps, as well as infrastructure like databases and queues. We have a handful Windows 10 machines we're looking run them on, ideally joined together as [Docker Swarm Mode](https://docs.docker.com/engine/swarm/) "nodes" to get those nice features mentioned above.

All together, that means we need these features in conjunction with each other:

- [ ] multi-node swarm
- [ ] windows hosts
- [ ] linux containers

## Rage Against Docker Machine

To figure out if we can get all those features at the same time, we'll start by going to the Docker docs. Here in the [Getting started](https://docs.docker.com/engine/swarm/swarm-tutorial/#use-docker-desktop-for-mac-or-docker-desktop-for-windows) tutorial, it looks like we can't do multi-node on Windows without _docker machine_:

> Alternatively, install the latest Docker Desktop for Mac or Docker Desktop for Windows application on one computer. You can test both single-node and multi-node swarm from this computer, but you need to use Docker Machine to test the multi-node scenarios.

There's not a whole lot of other information on the surface of how that works. We can find that [Docker Machine](http://docs.docker.oeynet.com/machine/overview/) is the cli tool for remote Docker management, either on cloud or local VMs or manually joining to hosts by `ssh`. A bit deeper in there's a guide for the Swarm tutorial setup with [Docker Machine and Hyper-V](http://docs.docker.oeynet.com/machine/drivers/hyper-v/). After combing through it all, we can conclude `machine` allows us to remotely manage _Linux_ machines running the Docker Engine.

- [X] multi-node swarm
- [ ] ~~windows hosts~~ Windows hosts _calling Linux hosts_
- [X] linux containers

## Docker [Engine] on Windows [Desktop]

The documentation on Docker Machine included an interesting bit that had me wanting to learn more about Docker and Windows in general.

> Machine was the only way to run Docker on Mac or Windows previous to Docker v1.12.

We know "Docker Desktop" is a bundle of cli tools, Kubernetes, and most importantly the _Docker Engine_ which is the critical piece for working with containers on the Docker daemon. If we check out the page for [installing the Docker Engine](https://docs.docker.com/engine/install/#server) the only operating systems listed under "Server" are Linux varieties. And yet somehow folks have hosted Windows containers, right? Searching for "docker windows server" can get us to the [Windows Containers product page](https://www.docker.com/products/windows-containers) and a little more digging in the docs can get us to installation instructions for [Docker Engine Enterprise on Windows Server](https://docker-docs.netlify.app/install/windows/docker-ee/).

This is where the documentation starts getting a little fuzzy. It doesn't say anywhere explicitly that these are Windows containers, only, but they most likely are. We also see some references to "Docker for Windows" but all links are updated to redirect to the newer "Docker Desktop for Windows." There's also "Swarm" ambiguity in some Stack Overflow questions, blogs, and guides, between the new Swarm mode and [Swarm Classic](https://github.com/docker/classicswarm).

A wider search of the internet yields a promising [video series from Microsoft](https://www.youtube.com/watch?v=ZfMV5JmkWCY) on how to run a Swarm of both Linux and Windows hosts and containers. There we can see that Docker Engine Enterprise can host Swarms on Windows Servers, but only Windows containers can run on the Windows nodes. Linux containers can be added to the Swarm, but require a Linux host to run on. Once again we come up short.

- [X] multi-node swarm
- [X] windows hosts
- [ ] ~~linux containers~~ only run on Linux nodes

## Coming Soon(?) to a Windows Server Near You

That same wider search for "windows server linux containers" yields a [couple](https://blog.eldernode.com/run-linux-containers-on-windows-server/) [tutorials](https://www.altaro.com/msp-dojo/linux-containers-windows-server-2019/) on exactly what we're looking for: running **Linux** containers on **Windows** server 2019, using Docker Enterprise which supports **Swarm Mode**. Fantastic! However, the module is in preview.

```powershell
Install-Package Docker -ProviderName DockerProvider -RequiredVersion preview
```

Software in preview often works great! But if you're like me, you'd be nervous to use it in production. And unfortunately there's no indication of when it will be ready for primetime. Even [slightly newer articles](https://mountainss.wordpress.com/2020/03/31/docker-linux-container-running-on-windows-server-2019-winserv-docker-containers/) include turning on experimental features within Docker. I guess we omitted an important implicit requirement from our list:

- [X] multi-node swarm
- [X] windows hosts
- [X] linux containers
- [ ] production ready

Maybe next time, friends. Till then, if you're planning on using container orchestration, plan on hosting it in Linux!
