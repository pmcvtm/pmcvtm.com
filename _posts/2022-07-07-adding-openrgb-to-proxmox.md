---
layout: post
title: Adding OpenRGB to Proxmox
date: 2022-07-07 20:46:00 -0600
categories: HomeServer
color: vermilion
tags: hardware server openrgb proxmox
image: /assets/post-cards/2022-07-07-adding-openrgb-to-proxmox.jpg
---

I am currently working on my "home server" which is more or less a couple hard drives in an old gaming computer. Some of the parts have fun RGB (red, green, blue) lights which can be seen through the case. They have a nice rainbow default but _can_ be controlled to show colors or patterns, most robustly through using the [OpenRGB](https://openrgb.org/) application. This is very cool, but my server is just a ProxMox hypervisor: a host for virtual machines (VMs) that do specific jobs, so there's no desktop to run OpenRGB on. Also, since the VMs are _virtual_ they aren't aware of the lights on the _physical_ hardware. Sheesh! Thankfully the solution wasn't too difficult to set up, and maybe you need this, too.

<!--more-->

## OpenRGB

OpenRGB is _super_ easy to set up when you have direct access to the machine. You launch it, it reads the hardware, and you can control the lights. Boom! 💥

![Screenshot of OpenRGB application showing list of lit hardware on the left and robust color selector on the right](https://openrgb.org/images/OpenRGB-Windows.webp)
_Image from [openrgb.org/](https://openrgb.org/)_

OpenRGB also supports a _headless server mode_ which runs the app in the background. When running in this mode, you can control the lights on the server machine from another instance of the application, the _client_.  I believe OpenRGB also has a CLI (command line interface) to execute options with on the server if you'd prefer, but I did not explore that.

## Setting Up The Server

> **📝 Note**
> People say you shouldn't really do anything on your hypervisor except run the virtualized parts. This is a pretty casual scenario - most real servers don't have ✨pretty lights✨ - and a lightweight operation, so I am not too worried about it.

After ssh'ing into the ProxMox host server (or using the shell in the web UI), we download and install the OpenRBG `.deb` package. Make sure to check which version to grab based on your OS. We'll run the install and then try to start up the server manually.

```shell
$ apt update && apt upgrade

$ wget -O openrgb.deb https://gitlab.com/CalcProgrammer1/OpenRGB/-/jobs/artifacts/master/download?job=Linux%2064%20.deb%20(Debian%20Bullseye) 

$ dpkg -i openrgb.deb

$ apt install -f #necessary since `dpkg -i` does not install dependencies

$ openrgb --server
```

## Connecting with the Client

Now, on a machine with an actual desktop (either a VM on ProxMox or something else) we download and install OpenRGB "the regular way" from their website. We'll then launch the application, and head on over to the "Client SDK" tab.

![Screenshot of OpenRGB application on the "SDK Client" tab with the IP address 192.168.21.12 typed in to the "IP" input, and "6742" in the port input. Below the same IP is listed under "Connected Clients" along with 2 interfaces called "Cool RAM"](/assets/post-resources/2022-07-07-adding-openrgb-to-proxmox-client-connect.jpg)

Here we can type in the IP address of our server box (here `192.168.21.12`) and change the port if you need to (I kept the default 6742) and click "Connect." We _should_ now see the server IP appear below, along with the list of light-up hardware available to set. In this case, we have a couple of Cool RAM sticks we can control. We should see those on the "Devices" tab, too **and be able to set the colors there**!

## Running as a Service

Great, we've got lights! I'm lazy, however and don't want to start up OpenRGB every dang time so let's head back to the server to make this an always-on background service. I've never done this so I looked it up and found [this guide](https://medium.com/@benmorel/creating-a-linux-service-with-systemd-611b5c8b91d6) which seemed good enough for me.

First, we create a new file at `/etc/systemd/system/openrgb.service` and fill it out to define what our service does:

```ini
[Unit]
Description= Open RGB Color Controller
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
ExecStart=openrgb --server

[Install]
WantedBy=multi-user.target
```

This includes _when_ to start the service in the lineup (`After`) how to handle it stopping (`Restart`) who to run it for (`WantedBy`) and most importantly **what to do** (`ExecStart`). After saving this in place, we can turn it on (be sure to stop the manual running one first if you haven't yet). We should get some happy output after the last command:

```shell 
$ systemctl start openrgb
$ systemctl enable openrgb
$ systemctl status openrgb

● openrgb.service - Open RGB Color Controller
     Loaded: loaded (/etc/systemd/system/openrgb.service; enabled; vendor preset: enabled)
     Active: active (running) since Sun 2022-07-27 18:47:08 CDT; 1min 0s ago
   Main PID: 190258 (openrgb)
      Tasks: 17 (limit: 37983)
     Memory: 3.4M
        CPU: 701ms
     CGroup: /system.slice/openrgb.service
             └─190258 openrgb --server
```

That's it! Now the OpenRGB server is running in the background, and should restart if we ever need to restart our sever.

## Was This Dumb?

Maybe this was a bad idea - most people have their servers on racks, without any fun bells or whistles. But this works for me, and I enjoy a little flair in my life. Maybe you do too, and if so, I hope this guide sheds some light into your server closet.
