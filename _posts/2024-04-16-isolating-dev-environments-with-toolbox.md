---
layout: post
title: Isolated Dev Environments with Toolbx
date:  2024-04-16 15:02:00 -0600
categories: Tech
color: vermillion
tags: development linux
---

I recently got a laptop for doing work on the go. I went with a [Framework](https://frame.work/) model, and decided to go for using Linux, because I'm frugal, and Windows seems to be getting worse. In picking out a distro I am trying out [Fedora Silverblue](https://fedoraproject.org/atomic-desktops/silverblue/), an _atomic_ desktop environment. All updates and non-containerized installations are saved in a git-like history, so when there are issues you can "roll back" to the previous state of the operating system. This is a welcome guardrail as someone who's bungled a Linux desktop setup or two trying to sort out drivers and customizations. When getting set up to develop however, it can be a bit of a pain.

To alleviate said pain, Silverblue comes pre-installed with [Toolbx](https://containertoolbx.org/), a CLI tool that provides a containerized environment where you can safely install things "the normal way" in a non-atomic distro like plain Fedora or Ubuntu. It's amazing simple to start up:

```shell
toolbox create --distro fedora --release f39 hyde
toolbox enter hyde
```

From here inside "Hyde," I installed Ruby using Fedora's package manager `dnf`, and proceeded to pull down this blog, which runs on Jekyll. All of my git config aliases and config "just worked," since the box shares the Home folder with the host. Outside of Hyde, however, there's no Ruby to be found. Similarly, to work on a .NET app, I created a different container to install that SDK on, safe from and unbothered by what dependencies lurk for other projects.

In practice, using Toolbx reminded me a bit of using the [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/about) on Windows: Here's a little alternative OS that lives within my OS, without a VM. Just like WSL, you select which distro you'd like, install it, and then interact with it through a separate shell, with some important shared parts with the host. It's possible to go beyond using the container from the CLI, though, with fancy desktop integrations and even the ability to [boot from the container](https://containertoolbx.org/use/#boot-from-container) directly.

There are plenty of options to isolate your dev environment, and I will likely try some others, but I would also recommend Toolbx to any Linux users for its ease of use and flexibility.
