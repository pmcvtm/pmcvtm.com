---
layout: post
title:  Nuget Conflicts While Upgrading EF Core
date:   2020-12-06 4:12:00 -0600
categories: Development
color: vermilion
tags: dotnet entity-framework nuget
---

I have the great privilege of using a fresh version of .NET for my current client (no shade to y'all 4.X folks, you'll get there). We're looking to get even shinier by upgrading Entity Framework Core from 3.1 to 5 to chase some [hot new features](https://docs.microsoft.com/en-us/ef/core/what-is-new/ef-core-5.0/whatsnew). The framework and library are _technically_ compatible, but we ran into some intimidating errors during the change.

<!--more-->

A caveat: **it's not always a good idea to upgrade.** Here we worked through the brambles, but that's not always possible, or more importantly, not always worth your time. .NET 5 is still in the earliest adoption stage, and it doesn't work everywhere (e.g. Azure Functions). Look hard before you leap.

This application has web and console app projects that both reference a core library. All three reference `Microsoft.EntityFrameworkCore` and `Microsoft.EntityFrameworkCore.SqlServer` so they can share entities but also do their own specific `Context` setups. Each project also has its own test project that references it, and one or both of the 'app' test projects may also reference the core library, I can't remember.

We'll start the upgrade as simple as any other: clicking "go" in the Nuget Package manager for the solution:

![image]

So far so good! `Microsoft.EntityFrameworkCore` upgrades from 3.1.9 to 5.0.1 without any issues. Let's also upgrade `Microsoft.EntityFrameworkCore.SqlServer` so it matches:

![image]

![image]

Not so good! We get bunch of reference errors in our Test projects. It looks like they're all the same packages, though, so we maybe we can upgrade the lowkey referenced packages to 5.0.X to match entity framework:

![image]

Upgrading one or the other package yields similar reference errors, but the upgrade won't even complete. They must be tangled up in their own DLL hell!

![image]


This is an intimidating situation. This app only had a few projects, but imagine doing this in a solution with a baker's dozen of projects, you might have over a hundred compiler errors, none of which have a clear path to resolution in their messages. So what do we do??

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Configuration" Version="3.1.9" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Abstractions" Version="3.1.9" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="3.1.9" />
  </ItemGroup>
```

```xml
  <ItemGroup>
    <PackageReference Include="Microsoft.Extensions.Configuration" Version="5.0.0" />
    <PackageReference Include="Microsoft.Extensions.Configuration.Abstractions" Version="5.0.0" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="5.0.0" />
  </ItemGroup>
```



Using Entity Framework 5 in a .NET Core 3 App

- on .NET standard / compatibilities
- upgrade main package
- errors
- upgrade lowkey side packages
  - errors
- upgrade by hand
- csproj or paket
