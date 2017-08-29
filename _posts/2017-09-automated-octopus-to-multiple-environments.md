# Automated Octopus Deployments To Multiple Environments

## The Environments

The project I am working on has a single web app that is skinned, recconfigured and redeployed for a set and unchanging number of tenants. In addition, we deploy different versions of the app across typical escalating-release-level environments. We end up with an environment per tenant, per release-level: `Dev Tenant 1`, `Dev Tenant 2`, `QA Tenant 1`, `QA Tenant 2`, `Production Tenant 1`, etc...

We're interested in testing quickly to catch issues as early as possible, so we'd like our initial deployments to be automatic. Since each tenant is running the same application (the differences are only in appearance and underlying data source), we should test and deploy them simulatenously to keep versions consistent. We'd also like to minimize the complexity and duplication of our process to make it easy to track and change for our team members who are new to integrated dev ops.

## Octopus Lifecycles

Initially we went the route of [Lifecylces in Octopus Deploy](https://octopus.com/docs/key-concepts/lifecycles). Lifecycles are a great way to help manage and enforce consistency between separate environments that should be on the same version.

**The easiest way to set up automatic deploys is using LifeCycles**. We set up our three "Dev" phase environments to automatically deploy as soon as a release is created, as seen below.

![](../assets/brands_lifecycle.png)
