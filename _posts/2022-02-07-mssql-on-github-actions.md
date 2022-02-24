---
layout: post
title: Using MS SQL Server in GitHub Actions
date: 2022-02-07 09:56:00 -0600
categories: DevOps
color: vermilion
tags: github-actions mssql-server docker container-services
image: /assets/post-cards/2022-02-07-mssql-on-github-actions.jpg
---

One of my favorite features in Azure DevOps is the [Service Container](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/service-containers), which allows spinning up infrastructure dependencies for build process as Docker containers. They are also available in [GitHub Actions](https://docs.github.com/en/actions/using-containerized-services/about-service-containers), which comes as no surprise since Microsoft runs both those shows. GitHub provides some great tutorials for [PostgreSQL](https://docs.github.com/en/actions/using-containerized-services/creating-postgresql-service-containers) and [Redis](https://docs.github.com/en/actions/using-containerized-services/creating-redis-service-containers) Service Containers, but recently when needing to run Microsoft SQL Server we ran into some hiccups, so I thought I'd share what ended up working.

<!--more-->
⚠ If you're not familiar with GitHub actions or want more info about Service Containers, peep the linked documentation above, they do a much better job explaining than I might.

We'll dive right into using SQL Server. Let's start with a dead-simple build that is using a PowerShell script to compile and run automated tests that use a Database.

```yaml
name: Test for PRs
on:
  pull_request:
  workflow_dispatch:
jobs:
  run-tests:
    runs-on: ubuntu-latest
  steps:
    - name: Compile and Test from Build Script
      shell: pwsh
      run: .\build.ps1 ci-pr ${{ github.run_number }}
```

## Adding Service Container

Believe it or not, MS SQL Server **is** available as a [Linux container on DockerHub](https://hub.docker.com/_/microsoft-mssql-server), which is pretty incredible in the grand scheme of history. There are versions for both 2017 and 2019, and while there is an option to set the license for production use, the option defaults to the free `Developer` edition, which is exactly what we need for use on our Continuous Integration agent.

We can plug the image we want as Service Container in our workflow definition:

```yaml
name: Test for PRs
# omitted, see above
jobs:
  run-tests:
    runs-on: ubuntu-latest
    services:
      mssql:
        image: mcr.microsoft.com/mssql/server:2019-latest
        env:
          SA_PASSWORD: MyTestPassword
          ACCEPT_EULA: 'Y'
        ports:
          - 1433:1433
 steps:
 # omitted, see above
```

The `ACCEPT_EULA` and `SA_PASSWORD` environment variables are required to run, the latter of which is relevant to our app. Even though the password is just for test, it can't hurt to save it as a [Secret](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-secrets) for the repository, in which case we would replace the value above with `${{ env.SECRET_NAME }}`.

## Configuring Tests to Use the Container

Now that our build is spinning up that database as a Service Container, we'll need to make sure our tests know how to connect to it. If you're working with MS SQL Server, it's likely your connection string is authenticating "the easy way" with local-trusted Windows `Trusted_Connection=True`. That's not going to fly on Linux, and we need will need to use a username/password connection string, with the container's automatic `sa` and the password we used above.

We'll pass in the connection string for the Service Container as an environment variable to the step we run our tests on:

```yaml
# omitted, see above
  steps:
    - name: Compile and Test from Build Script
      shell: pwsh
      run: .\build.ps1 ci-pr ${{ github.run_number }}
      env:
        ConnectionStrings__MyConnString: "Server=localhost,1433;Initial Catalog=MyTestDb;User Id=sa;Password=MyTestPassword;"
```

Again, it's a good practice to save any password as a Secret, in which case you'd use `Password=${{ env.SECRET_NAME }}`.

For the tests to use this new value, we need to include environment variables in our app's configuration. Assuming you're in .NET and using Hosting extensions and the default `Host.CreateDefaultBuilder()`, your config will [include them automatically](https://docs.microsoft.com/en-us/dotnet/core/extensions/configuration#configure-console-apps). Otherwise you'll need to add the [`Microsoft.Extensions.Configuration.EnvironmentVariables`](https://www.nuget.org/packages/Microsoft.Extensions.Configuration.EnvironmentVariables/) NuGet package, and add it to your Configuration buildup:

```csharp
var configuration = new ConfigurationBuilder()
    //other providers like appsettings.json
    .AddEnvironmentVariables()
    .Build();
```

And that's it! Our tests will use that environment variable for the Connection String, and connect to our Service Container database when they run. When the job is complete, GitHub Actions will tear down the container, so don't use this for anything that requires persistent data between runs. Docker is a slick fit for infrastructure and dependencies during development (and in production), so it's nice we can use them in our build environment as well!
