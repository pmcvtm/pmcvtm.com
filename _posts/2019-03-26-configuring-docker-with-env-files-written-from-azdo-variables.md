---
layout: post
title:  "Configuring Docker with Env Files Written from Azure DevOps Variables"
date:   2019-03-26 13:53:00 -0600
tags: dev-ops ci-cd azure-dev-ops docker configuration environment-variables powershell
---

I've become a big fan of [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/). It's a powerful and robust tool that enables really slick automated build and release processes. I wrote last about [sexy auto-semversioning Nuget libraries]({{ site.baseurl }}{% post_url 2019-01-22-effective-nuget-versioning-in-azure-devops %}) using Build Pipelines. I'm still no expert in AzDO but am continuing to extend and improve the ways we leverage it. Recently I found a way to optimize against one of release pipelines' biggest annoyances: app configuration for "non-transformable" config formats such as environment variables for Docker containers. <!--more-->

Deploy tools like Azure DevOps Pipelines or [Octopus Deploy](https://octopus.com/) allow setting environment- and process- scoped variables to be plugged into an application as it's deployed. This can be a huge boon: it keeps secrets out of source control, enables sharing config values where convenient, and creates a single source-of-truth for the configuration of released applications. Often, the properly scoped variables are plugged in via file transforms or the a hosting platform automatically. By "non-transformable" config formats, I mean ones the toolset does not update in this fashion.

For our system, this comes up most with "vanilla" Docker containers running on a VM: no Kubernetes, no cloud container instances, not even `docker-compose`, despite how these might ease orchestration. This is straightforward to set up in a release pipeline, either with the built-in [Docker task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/build/Docker?view=azure-devops#run-command) or, in our case, calling the `docker` cli explicitly. We do this via a powershell script to enable looping to "scale" to a configured number of containers during a release. The following configuration technique became an obvious fit for this low-orchestration script or the built-in Docker task, however you may find it useful even with Kubernetes, Docker Swarm, or docker-compose'd services. Likewise, it can apply to other configuration formats that don't fit into a tool's "magic update" paradigm.

## More Work More Problems

For Docker, there are [a few options](https://docs.Docker.com/engine/reference/commandline/run/#set-environment-variables--e---env---env-file) for passing configuration to a container at runtime, specifically as environment variables, which are then [scooped up by the application](https://docs.microsoft.com/en-us/dotnet/api/microsoft.extensions.configuration.environmentvariablesextensions.addenvironmentvariables?view=aspnetcore-2.2) at startup. Settings could also be transformed on a config file directly at `docker build`-time, but this eliminates the visibility into what is set with `docker inspect` or a similar tool. Unfortunately, none of these methods fit particularly well with Azure DevOps's release pipeline variables.

Initially, we opted to set variables that needed updating individually in our script with the `-e` (or `--env`) flag:

```powershell
 docker run -d -p 80:5000 --name my.api `
    -e ConnectionStrings__AzureStorage=$env:ConnectionStrings__AzureStorage `
    -e Serilog__Properties__Environment=$env:Serilog__Properties__Environment `
    "myregistry/my.api:2.11.2"
```

This was fine for one or two variables, but it got out of hand as the variable changed and grew. Besides setting the variables in the app and pipeline, each addition or removal required an update to the pipeline's step(s), or a code change if the script was committed to the repository. As a lazy and typo-prone developer myself, this was totally unsustainable.

## Paring to Prefixes

Now, instead of having the variable written in so many places, we leverage the list of all variables to our benefit. During an Azure DevOps Pipeline release, all scoped custom and built-in variables become environment variables on the agent. This is logged during the "Initialize job" step (some omitted for brevity):

```console
Environment variables available are below.  Note that these environment variables can be referred to in the task (in the ReleaseDefinition) by replacing "_" with "." e.g. AGENT_NAME environment variable can be referenced using Agent.Name in the ReleaseDefinition:
        [AGENT_DEPLOYMENTGROUPID] --> [84]
        [AGENT_HOMEDIRECTORY] --> [/home/myteam/azagent/azagent]
        [AGENT_OS] --> [Linux]
        [AGENT_VERSION] --> [2.148.1]
        [API_AUTHENTICATION__ENABLED] --> [true]
        [API_AUTHENTICATION__PASSWORD] --> [AxjnxkekzDcaW8lwgKz/W8jdKXl68yUl/ATGqxOeeEs=]
```

The last two in this list, prefixed with `API_`, are [custom variables set in the pipeline](https://docs.microsoft.com/en-us/azure/devops/pipelines/release/variables#custom-variables). The prefix in the key is important, as it allows separation of custom variables from Azure DevOps's built-in ones. In powershell, given all environment variables `env:*` and a relevant `$prefix`, we can extract only those we've deemed to be set on the application config and write them to a file as `KEY=VALUE`:

```powershell
$myEnvironmentFilePath = # find, create, or clean file

ForEach($var in Get-ChildItem env:*) {
  if ($var.Key.StartsWith($prefix) {
    $key = $var.Key.Substring($prefix.Length)
    $value = $var.Value
    Add-Content -Path $myEnvironmentFilePath "$key=$value"
  }
}
```

### Getting Fancy

If a pipeline relates to more than one application (or container), it's possible to iterate over a set of prefixes, including a `SHARED_` one that all apps should pull in. Prefixes can be used to represent other scopes like machine kind, or release purpose, enabling a level of configuration specificity beyond just environment. It may serve to set the list of prefixes themselves as a pipeline variable that you can update at release-time to change config for special cases.

```powershell
#env:PREFIXES = API_,SHARED_,LOAD_TEST_
$prefixes = $env:PREFIXES.Split(',')
ForEach($var in Get-ChildItem env:*) {
  $matchedPrefix = ''
  ForEach($prefix in $prefixes) {
    if ($var.Key.StartsWith($prefix)) { $matchedPrefix = $prefix; }
  }

  if($matchedPrefix -ne '') #continue as above...
}
```

Once the file has been fully written, the `docker run` call changes from listing all variables with `-e` to the much more concise `--env-file`. If the call is in the same script as the config creation (or set as another pipeline variable), we can avoid hard-coding the environment file path:

```powershell
docker run -d -p 80:5000 --name my.api --env-file $myEnvironmentFilePath "myregistry/my.api:2.11.2"
```

## Other Applications

Besides Docker `.env` files, this method of iteration and prefixed extraction can be applied to plugging values into placeholders in `.ini` files, adding rows to an `.xml` config, or changing up a `json` object. Before getting out your big paintbrush, though, communicate with your team and agree on a standard for applying these. Save a baseline as a reference Task Group, or a shared script in a repository, and document it. As in software development, patterns are only useful when they're followed, and should be scrutinized as they are applied to new situations.
