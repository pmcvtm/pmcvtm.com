---
layout: post
title: Isolated Dev Environments with Dev Containers
date:  2024-05-10 11:29:00 -0500
categories: Tech
color: vermillion
tags: development docker vscode
---

About a month ago, I wrote about [using Toolbx]({% post_url 2024-04-16-isolating-dev-environments-with-toolbox %}) to keep dependencies separated between different dev environments, on Fedora Silverblue. Well I eventually ran into enough friction to be frustrating, and decided my atomic desktop experiment was over. But I couldn't let go of how nice it was to avoid cluttering my host machine whenever I needed to install dependencies for a given project.

While I _could_ install Toolbx on my new setup, I decided to try out something else: Development Containers. Dev containers are an [open spec](https://containers.dev/) with tight integrations for [different](https://code.visualstudio.com/docs/devcontainers/create-dev-container) [tools](https://www.jetbrains.com/help/idea/connect-to-devcontainer.html) that isolates by allowing you to edit and execute your code inside a Docker container. You may remember hubbub about [GitHub Codespaces](https://docs.github.com/en/codespaces/overview) - cloud-based dev environments - which also utilize this tech.

Setting up a dev container is incredibly straightforward. The VS Code extension will guide you through selecting from many functioning templates, but ultimately it's as simple as one file. Here're the contents of the one for [the repository](https://github.com/pmcvtm/pmcvtm.com/blob/main/.devcontainer/devcontainer.json) which powers this blog:

```json
{
    "name": "Jekyll",
    "image": "mcr.microsoft.com/devcontainers/jekyll:2-bullseye",

    "forwardPorts": [4000],
    "postCreateCommand": "bundle exec jekyll serve",

    "remoteUser": "root"
}
```

This is a very simple example, but the schema is [incredibly robust](https://containers.dev/implementors/json_schema/) and there is lots of guidance out there for handling more complex scenarios. Let's break down its parts:

- A `name` and the docker `image`, which is the magic of it. That `jekyll` image is pre-installed with Ruby, the bundle gem, and all the other dependencies needed.
  - It comes prefab from Microsoft (as do many others), but you could _build_ your own Docker image to fit your application's needs and put that here too
- The `forwardPorts` to expose to the host, here Jekyll's default 4000
- An (optional) `postCreateCommand`: I work on my blog in "watch" mode so I start it up and keep it running by default. You can also leave this blank and interact with the container through your editor's terminal as-needed.
- The `remoteUser` will often be root, but if your image runs as another user, say so here

Now, regardless of what computer I'm on, so long as it's got Docker, I can pull the repo down and just start working. All of the dependencies I would normally install for setup have been pushed into the "build the image" step. Of course, if you're container-averse, you can still install everything on the host and run it the old fashioned way.

I, on the other hand, am a big believer in anything that makes development faster and less frustrating, so I've been plugging this on all my GH Pages sites, into some new python projects I'm working on, and can't wait to stretch into more advanced situations.
