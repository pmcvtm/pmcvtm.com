---
layout: post
title:  "Effective Nuget Package Versioning in Azure DevOps with Git Tags and GitVersion"
date:   2019-01-22 16:21:00 -0600
tags: dev-ops dotnet ci-cd azure-dev-ops nuget git gitversion
---

If you blinked last year (or [hiked the Appalachian trail]({% post_url 2018-03-19-incoming-at-updates %})) you may have missed Microsoft's big continuous integration service redesign and rebranding; from Visual Studio Team Services to [_Azure DevOps_](https://dev.azure.com). I've had the surprising pleasure to work extensively on the platform since returning; migrating my client's CI/CD operations over to build and release pipelines in Azure DevOps. So far, it has been a dream, especially compared to my past experiences with VSTS. Microsoft's [documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/) on Azure DevOps is fantastic, and I'm not looking to reinvent any wheels. Instead, I'll share a success we've had with managing internal Nuget packages.<!--more--> These code libraries are used to ease and enforce communication between services in a distributed system that are sourced from multiple git repositories. It's challenging enough planning and coordinating releases between versions of the services themselves; our client libraries should be easy to publish and even easier to track. Here are our goals:

- version numbering is automatic, _but can be overridden_
- new production-ready versions are pushed automatically, _but anything can be pushed manually_
- source git repository is marked per each new release using tags, _no exceptions_

## _Mis en place_

The source of our Nuget package is written in dotnet core, and includes two projects: a C# class library that includes the consumable code, and another C# class library that has our unit tests. To keep things straightforward, our example repository is dedicated to this nuget package, with a simple branching strategy: a single `master` mainline, with `feature/*` branches to allow working on concurrent changes. To prepare Azure DevOps, we'll complete [this guide](https://docs.microsoft.com/en-us/azure/devops/pipelines/get-started-yaml): connect our GitHub account, select this repository, and create a new **build pipeline** with a blank `yaml` template to instruct its behavior.

## Set the Version

First, we'll define and set the version. To achieve our goal of automatic version-numbering, we'll use [GitVersion](https://github.com/GitTools/GitVersion). GitVersion is a command line utility that leverages a repository's commit history to generate a [semantic version number](https://gitversion.readthedocs.io/en/latest/reference/intro-to-semver/). It's highly configurable, with a variety of modes to accommodate different branching and release strategies. We've got it easy, with just one mainline (`master`), which is a perfect fit for the [Mainline Development mode](https://gitversion.readthedocs.io/en/latest/reference/mainline-development/). This will increment the _patch_ part for every merge into master (1.0.1 -> 1.0.2). We can override this behavior with magic phrases in our commit messages, such as `+semver: minor`, to bump the _minor_ part (1.0.1 -> 1.1.0) or `+semver: skip` to not increment at all (1.0.1 -> 1.0.1). In every GitVersion mode, **tags are truth**. Tagging a commit on master with `v#.#.#` will reset the baseline calculation regardless of what came before it. All these options are succinctly defined in a **GitVersion.yml** file, which for us is pleasantly boring:

```yml
# GitVersion.yml
mode: Mainline
branches: {}
ignore:
  sha: []
```

If you're building on a Windows-based [build agent](https://docs.microsoft.com/en-us/azure/devops/pipelines/agents/hosted), there is a VSTS extension for GitVersion. We're hep, though, and using Linux with dotnet core, so it doesn't work. Instead, we'll create steps to pull the tool from Nuget, and then call the executable using mono. We'll specify we're running GitVersion for CI with the `/output buildserver` option, which both changes the `Build.BuildNumber` to match the version, and exposes a collection of version-related [variables](https://gitversion.readthedocs.io/en/latest/more-info/variables/). The one we care about now is `GitVersion.NuGetVersion`. Here's what our azure-pipelines.yml looks like:

_Note: For all our YAML steps, I've excluded the `displayName` option for brevity, but would highly encourage using it at home._

``` yml
# azure-pipelines.yml
pool:
  vmImage: 'Ubuntu 16.04'

steps:
- task: NuGetCommand@2
  inputs:
    command: custom
    arguments: install GitVersion.CommandLine -Version 4.0.0 -OutputDirectory $(Build.BinariesDirectory)/tools -ExcludeVersion
- script: mono $(Build.BinariesDirectory)/tools/GitVersion.CommandLine/tools/GitVersion.exe /output buildserver /nofetch
```

## Do the Work

The meat of our automated build is typical for a sexy modern .NET core project. After we set the version we'll compile, run tests, and package our consumable library.

``` yml
# azure-pipelines.yml, continued
- script: dotnet build ./MyLibrary.sln -c Release /p:Version='$(GitVersion.NuGetVersion)'
- script: dotnet test ./src/MyLibraryTests/MyLibraryTests.csproj -c Release --no-build
- script: dotnet pack ./src/MyLibrary/MyLibrary.csproj -c Release --no-build -o '$(build.artifactStagingDirectory)'
```

This option during compilation is noteworthy: `/p:Version='$(GitVersion.NuGetVersion)'`. The `/p:` flag is for MSBuild parameters (woof); here we're setting built assemblies to use our automatically defined version. By using the `--no-build` flag on subsequent steps, we lock in the results of this initial compilation. We output our packaged library to the built-in staging location on the agent with `$(build.artifactStagingDirectory)`.

There are _lots_ of variations on this. For instance, we could set the project to automatically publish when it compiles, with the version set to the environment variable in the .csproj, or instead of `script:` steps we could leverage [Task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/build/dotnet-core-cli?view=vsts) helpers. The `pack` command task even includes an option to set the package version by environment variable, like we're doing here already.

## Publish the Result

After we've verified our code compiles, passes our tests, and packages nicely, we'll push it to a Nuget feed to be then consumed. Azure DevOps includes a private Nuget feed in the form of [Azure Artifacts](https://azure.microsoft.com/en-us/services/devops/artifacts/), but you could just as easily publish your package to Nuget.org, ProGet, or any other feed. The Nuget pipeline task has a seamless option for integrating with Azure Artifacts, requiring only the magic identifier of the feed; using an internal authorization. Regardless of what hosts our feed, we'll save the connection info in our pipeline as a variable to keep it secret, and allow reuse between our pipelines. Here's our new step:

``` yml
steps:
# azure-pipelines.yml, continued again
- task: NuGetCommand@2
  inputs:
    command: 'push'
    packagesToPush: '$(build.artifactStagingDirectory)/**/MyLibrary*.nupkg'
    publishVstsFeed: '$(ARTIFACT_FEED_ID)'
  condition: and(succeeded(), or(eq(variables['Build.SourceBranch'], 'refs/heads/master'), eq('true', variables['FORCE_PUSH_NUGET']))
```

Unlike previous steps, this one is _conditional_. We don't want to push a new package every time new code is pushed to the repository, especially for in-flight work. First, our `condition:` checks that previous steps succeeded. Then, we check if we're on the master branch, which we trust is production-ready, or if a special flag to 'force' a new release has been set. To do this, we create a variable called `FORCE_PUSH_NUGET` in the pipeline settings that is `false` by default, and settable at queue-time (below, top). This variable will then appear when a new build is being queued (below, bottom).

![A screenshot showing setting up a variable named FORCE_PUSH_NUGET in a build pipeline's settings](/assets/post-resources/2019-01-22-effective-nuget-versioning-in-azure-devops-1-variable-setup.jpg)

![A screenshot showing the queue build dialog with the FORCE_PUSH_NUGET variable set to 'true'](/assets/post-resources/2019-01-22-effective-nuget-versioning-in-azure-devops-2-queue-build.jpg)

When a package is pushed in this way, the automatically generated version will reflect that this is from a feature branch by appending a _-tag_ (1.0.1 -> 1.0.1-my-feature-branch) to the version, and Nuget will flag it as prerelease. This way, users can deliberately use this version, but we minimize accidental pulls from upgrading or installing the package new.

![A screenshot of the Azure Artifact feed, showing the list of packages and their corresponding versions](/assets/post-resources/2019-01-22-effective-nuget-versioning-in-azure-devops-3-package-list.jpg)

## Tag the Repo

Now that the Nuget package is live, we want our consumers to be able to look up _what exactly_ they've signed up for. This could be out of curiosity, for feature requests, or more likely, because **something is wrong**. Since we're using GitVersion, users _could_ work their way backwards to a specific commit, but because we're empathy-driven, we'll make it easy to look up by adding a [git tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) that matches the version of this release. There are a few extensions that provide this functionality in Azure DevOps, but we'll go with [this one](https://github.com/mikaelkrief/GitHub-Tools-vsts-extensions/wiki/Tag-GitHub-source-code) for our example. Using our [GitHub connection](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/github) from that starting guide, it infers the source repository and adds a tag we specify. The step ends up looking like this:

``` yml
# azure-pipelines.yml, continued one more time
- task: KriefMikael.githubtools.GitHubTag.GitHubTag@1
  inputs:
    githubEndpoint: myGithubConnection
    tag: 'v$(GitVersion.NuGetVersion)'
  condition: and(succeeded(), or(eq(variables['Build.SourceBranch'], 'refs/heads/master'), eq('true', variables['FORCE_PUSH_NUGET']))
```

Here again we have the `condition:` from the push step, since we only want to tag when we publish a new package. We also see our `GitVersion.NuGetVersion` variable in action again, prepended with 'v' to be clear what the number means. It may seem excessive to tag every release, when we release on every merge into `master`. Tags guarantee users will be able to pair a package's behavior to source code, however, especially when we're lazy about release notes. As a bonus, GitVersion works faster, since counting commits takes time. The latest tag serves as the starting point for calculating the next version, so it never has to count very high. Tags can be viewed from the command line with `git tag -l`, where they can also be checked out (in a detached HEAD), but they'll also be visible in GitHub:

![A screenshot of a GitHub repository with the "tags" dropdown open, showing a list of version tags](/assets/post-resources/2019-01-22-effective-nuget-versioning-in-azure-devops-4-github-tags.jpg)

## Now You

This example is pretty minimal, and might not match how you or your team organizes code or releases. This pattern can be adapted for a second mainline to release from, other versioning strategies, or push frequencies. Change the `GitVersion.yml` config and the conditions for pushing new packages to match your needs. The _how_ of this is less important than the _why_: We use these tools (continuous integration, Nuget, GitVersion) to make our lives, and the lives of those we work with, easier. Release often, tag your repository for visibility, and automate as much as you can, and you can take comfort in knowing you probably helped someone today.
