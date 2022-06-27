---
layout: post
title: Debug, Development, Release, and Production in .NET
date: 2022-02-23 13:26:00 -0600
categories: Development
color: vermilion
tags: .net compilation environment debugging
image: /assets/post-cards/2022-06-23-debug-dev-release-prod-in-dotnet.jpg
---

A recent exchange between coworkers revealed a confusing but important distinction in .NET runtime nomenclature. These folks were looking to reproduce the same behavior on their individual machines, but just couldn't stick it. One of them was running the application "in Production mode" and the other "with Release build." The terms "Release" and "Production" seem to go together naturally, similarly with "Debug" and "Development," but in practice these keywords refer to distinct elements of a running application.

<!-- more -->

**Debug** and **Release** are [_build_ configurations](https://docs.microsoft.com/en-us/visualstudio/debugger/how-to-set-debug-and-release-configurations?view=vs-2022) which impact code compilation. Applications that were compiled in _Debug_ have less-optimized, lengthier source code you can set breakpoints against, compared to _Release_ which are optimized and more performant. You can pick which configuration to build with in Visual Studio or using the `--configuration` option in the `dotnet` CLI. You _can_ write code with `#regions` that are included or excluded by build config, but it's mostly ill-advised.

**Development** and **Production** are special name-values for what [environment](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/environments?view=aspnetcore-6.0) a .NET application is running in, drawn from the `DOTNET_ENVIRONMENT` or (for web) `ASPNETCORE_ENVIRONMENT` environment variables. These settings are sneaky, since applications will run as _Production_ by default, and for most developers, the actual setting for _Development_ is hidden in a project's `launchsettings.json` file instead of as an actual environment variable on their machine. There's also _Staging_ which doesn't get as much love typically. While hidden, these are important; influencing what configuration files load, or branching logic outright, like the condition below from a boilerplate `Startup.cs`:

```csharp
if (!app.Environment.IsDevelopment())
{
  // do some stuff for dev only
}
```

So while it's helpful to use _Debug_ while in development, and important to publish _Release_-compiled applications to production, these **build** configurations have no bearing on the actual configuration of your application. For those you must set the appropriate `ENVIRONMENT` variable to _Development_ or _Production_.

Hope this helps.
