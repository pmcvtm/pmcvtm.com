---
layout: post
title:  "Deploying Multiple WebJobs via Azure DevOps"
date:   2019-06-20 16:02:00 -0600
tags: dev-ops ci-cd azure-dev-ops azure-app-services webjobs powershell
---

Unsurprisingly, [App Services](https://docs.microsoft.com/en-us/azure/app-service/) are one of Azure's more useful and persistent offerings. Somewhat surprising (to me at least) is that [WebJobs](https://docs.microsoft.com/en-us/azure/app-service/webjobs-create) stand firmly beside them, after seeming like a tack-on, albeit a cool one. The way they are developed has evolved, however, now leveraging the [same SDK that Azure Functions is built on](https://docs.microsoft.com/en-us/azure/app-service/webjobs-sdk-how-to). From a user's perspective, WebJobs' deploy-and-run-time is conversely unchanged. Unfortunately, that means deploying them is primarily advertised as a manual process from Visual Studio, the Azure Portal, or using Powershell. We know better, though, and can integrate WebJobs with our App Services in [Azure DevOps Pipelines](https://docs.microsoft.com/en-us/azure/devops/pipelines/), even if we're straying from the happy path.<!--more-->

## Single Job per Project

The preferred and straightforward way of developing and deploying WebJobs is [_very_ straightforward](https://docs.microsoft.com/en-us/azure/app-service/webjobs-dotnet-deploy-vs), but comes with some stipulations:

- WebJobs are built alongside a web app
- WebJobs are C# console app projects
- WebJobs are 1:1 project-to-job

Put differently: while you can have as many WebJobs as you like, each must be distinct, and its own console app project. The solution with the jobs also contains a web app project that will be built and released with them. If this fits your needs, CONGRATULATIONS; simply add the [Microsoft.Web.WebJobs.Publish](https://www.nuget.org/packages/Microsoft.Web.WebJobs.Publish/) Nuget package to each console app, and include a simple [JSON file](https://docs.microsoft.com/en-us/azure/app-service/webjobs-dotnet-deploy-vs#publishsettings) that details the job's settings. That's it! Your WebJobs will be published with the web app and run when you deploy to App Services.

## Multiple Jobs for the Same Project

Running multiple instances of a WebJob can be effective for replicating a process over different data sources, running on different schedules, or even to scale without [paying for more VMs](https://docs.microsoft.com/en-us/azure/app-service/overview-hosting-plans). While it seems _easiest_ to do this by uploading .zip files and configuring through the Azure Portal, we value repeatability and parity between the jobs. Thankfully, we have a way. WebJobs' aforementioned unchanged under-the-hood is [Project Kudu](https://github.com/projectkudu/kudu/wiki/WebJobs): the Swiss Army knife **K** from the App Service `Advanced Tools` menu in the Azure Portal. Among lots of nit-grit in the documentation is this non-obvious detail about how WebJobs run:

> **Jobs are deployed by copying them to the right place in the file-system...**
>
> To deploy a triggered job copy your binaries to: `d:\home\site\wwwroot\app_data\jobs\triggered\{job name}`
> To deploy a continuous job copy your binaries to: `d:\home\site\wwwroot\app_data\jobs\continuous\{job name}`

The `Microsoft.Web.WebJobs.Publish` package includes the magic instructions to publish jobs to these folders, but we can do this manually using a powershell and a couple `$env` variables in our Pipeline:

```powershell
$WEBJOB_PUBLISH_PATH = # pipeline variable: location of published or extracted console app artifact
$APP_SERVICE_ROOT =    # pipeline variable: location to stage the whole app service for deployment

$KUDU_MAGIC_PATH = "$APP_SERVICE_ROOT/app_data/jobs/continuous" # or /triggered

function Copy-WebJobRuntime ($webjobName) {
    Copy-Item -Path $WEBJOB_PUBLISH_PATH -Destination "$KUDU_MAGIC_PATH/$webjobName" -Recurse
}

Copy-WebJobRuntime "my-webjob-1"
Copy-WebJobRuntime "my-webjob-2"
```

After copying the jobs into their magic folders, we can deploy the application in `$AppServiceRoot` either with [the pipeline deploy task](https://docs.microsoft.com/en-us/azure/devops/pipelines/tasks/deploy/azure-rm-web-app-deployment) or more powershell. The Webjobs will go with it, appearing in the Azure Portal or Kudu Advanced Tools as if we had deployed any other way.

### Configuring Individual Jobs

App configuration can throw a wrench into our process when we have different WebJobs to deploy. Settings set at the App Service level will apply to _all_ jobs. This becomes problematic for the replicated-job-per-data-source use case, among others. The solution is to change the individual app settings **files**, which remain unique so long as they aren't overridden by the App Service:

```powershell
function ConfigureWebjob-Queue($webjobName, $queueName) {
    $webjob_settings_path = Join-Path $KUDU_MAGIC_PATH $webjobName './appsettings.json' #this is PS6, use [IO.Path]::Combine if you're old school
    $webjob_settings = Get-Content $webjob_settings_path | ConvertFrom-Json

    Write-Host ("Configuring $webjob_name to watch $queueName")
    $webjob_settings.QueueToWatch = $queueName

    $webjob_settings | ConvertTo-Json | Set-Content $webjob_settings_path
}

ConfigureWebjob-Queue "my-webjob-1" "queue1"
ConfigureWebjob-Queue "my-webjob-2" "queue2"
```

Here, we assume the only difference between the jobs is which queue they monitor. This method gets complex with more settings, or increased variability between jobs. Thankfully, app settings consistent across WebJobs can be set on the App Service like normal. Using a prefix-based naming convention with pipeline variables and WebJob names can also ease pain and reduce the amount of hard-code in the deploy step. See my [post on .env files with pipelines variables]({{ site.baseurl }}{% post_url 2019-03-26-configuring-docker-with-env-files-written-from-azdo-variables %})) for such an approach for varying docker containers. With the right conventions it's possible to even dynamically create all WebJobs from an array of names configured in the pipeline.

## Look Before You Leap

Before running down the "Multiple Jobs" path, consider if [WebJobs are really right choice](https://docs.microsoft.com/en-us/azure/azure-functions/functions-compare-logic-apps-ms-flow-webjobs) for the problem you're solving. Just because powershell and Azure Pipelines afford us the ability to configure Webjobs in ths way doesn't mean it's ideal. In fact, in many cases I'd say it's _not_. Even so, whether you're running one or one hundred Webjobs, it's hard to argue against repeatable machine-driven processes. Ditch the manual portal upload and get automated!
