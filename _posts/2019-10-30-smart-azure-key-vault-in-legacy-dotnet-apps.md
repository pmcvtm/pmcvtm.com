---
layout: post
title:  "Smart Azure Key Vault in Legacy .NET Apps"
date:   2019-10-30 10:29:00 -0600
tags:   dotnet azure-key-vault app-config legacy
---

I say it in almost every post: It's the future, damnit! But getting with it is a lot easier said than done. Theoretically there's not a _whole_ lot stopping you from tossing a legacy app .NET up into Azure, if the number of dependencies is low and well-analogue'd to cloud offerings. But if you give a mouse a cloud platform, he'll ask for a glass of leveraging new features. Let's take a look at one of the handier Azure services: [Key Vault](https://docs.microsoft.com/en-us/azure/key-vault/key-vault-overview) and how we can use it for configuration and saving secrets.<!--more-->

If you're unfamiliar with 

## Easy Days in .NET Core

If you're using .NET Core, you have the great privilege of cascading config plugins out of the box (just make sure they're [in the right order](https://devblogs.microsoft.com/premier-developer/order-of-precedence-when-configuring-asp-net-core/)). There's one for KeyVault, naturally. So you just have to download a handy [NugetPackage]() and plug-in this to your config building:

```C#

```

With this in place, when we inject and call on our `IConfiguration`

## For the Rest of Us
