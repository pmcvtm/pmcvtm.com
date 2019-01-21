---
layout: post
title:  "Effective Nuget Package Versioning in Azure DevOps with Git Tags and GitVersion"
date:   2019-01-21 09:15:00 -0600
tags: dev-ops ci-cd azure-dev-ops nuget git gitversion
---

If you blinked last year (or [hiked the Appalachian trail]({{ site.baseurl }}{% post_url 2018-03-19-incoming-at-updates %})) you may have missed Microsoft's big continuous integration redesign and rebranding from Visual Studio Team Services to _Azure Dev Ops_. I've had the surprising pleasure to work extensively on the platform since returning; migrating my clients CI/CD pipeline over from a mix of Powershell, AppVeyor, and Octopus Deploy to **mostly** consistent implementations of Build and Release Pipelines in AzDvOps. So far, it has been a dream, especially compared to my past experiences with VSTS.

Microsoft's [docuementation]() on AzDvOps is fantastic, and I'm not looking to reinvent any wheels. Instead, I'll share one of my successes, specifically with managing nuget packages. We are developing a distributed system with services that live across multiple repositories. Many of these services include a code library to be consumed by their clients, to ease and enforce how they communicate. In addition, there are code libraries that most-or-all services consume to keep some business rules consistent. It's annoying enough managing, planning and coordinating releases between versions; our client libraries should be easy to release and easier to track. Here are our goals:

- version numbering is automatic, _but can be overridden_
- nuget package is deployed automatically when there's a new version
- source git repo is marked per each version using tags

## Set the Version

To keep things straightforward, our example repository is dedicated to its nuget package, so it has a simple branching strategy: a single `master` mainline, with `feature/*` branches to represent additions and changes.

## Do the Work

The meat of the build is typical for a sexy modern .NET project. After we set the version we'll build, run tests, and publish the releaseable parts for our nuget package.

``` yml
steps:
# [the sexy versioning from above]
- script: dotnet build ./MyProject.sln -c Release /p:Version='$(Build.BuildNumber)'
- script: dotnet test ./src/MyLibrary/MyLibrary.csproj -c Release --no-build
- script: dotnet pack ./src/MyLibrary/MyLibrary.csproj -c Release --no-build -o '$(build.artifactStagingDirectory)'
```

There are _lots_ of variations on this. For instance, we could set the project to automatically publish when it compiles (and trust steps end if tests fail), or in AzDevOps, instead of `script:` we could leverage [Task]() helpers in our azure-pipelines.yml.

The important part is this option, during compilation: `/p:Version='$(Build.BuildNumber)'`. The `/p:` flag is for parameters in MSBuild (woof), but it works to set the version on our assemblies. By using the `--no-build` flag on subsequent steps, we lock in the results of this initial compilation.

## Publish the Result

After we've verified our code compiles, passes the tests, and packages nicely, we'll pubish it to a Nuget feed to be consumed.

## Tag the Repo

Now that the Nuget package is live, we want our consumers to be able to look up _what_ they've signed up for. This could be out of curiosity, for feature requests, or more likely, because **something has gone wrong**. In this case our consumers are other development teams we're coordinating with, but it's not a bad practice when your Nuget package is open source, either. Since we're using GitVersion, one _could_ work their way backwards to a merge commit, but because we're empathy-driven, we'll make it easier for them and add a [git tag]() to the repository that corresponds with the release we just made. There are a few extensions to AzDevOps that provide this functionality, but we'll go with this one for now. The step ends up looking like this:

``` yml
- GitTag:

```

## Go Forth and Code

This example
