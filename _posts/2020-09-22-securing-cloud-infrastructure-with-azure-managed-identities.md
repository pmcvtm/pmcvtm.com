---
layout: post
title:  Securing Azure with Managed Identities
date:   2020-09-22 09:48:00 -0600
categories: Cloud
color: vermilion
tags: azure security devops
image: /assets/post-cards/2020-09-22-securing-cloud-infrastructure-with-azure-managed-identities.jpg
---

Of the Azure features I’ve become more acquainted with these past couple years, **Managed Identities** are one of my favorites. Managed Identities are system-managed service principals that allow for a level of security control I hadn’t considered before, where keys and passwords can be ‘eliminated’ or rotated so frequently that **no human** has (at-ready) access to resources, without requiring (even automated) code or configuration changes for applications. They are a breeze to set up in .NET Core, and "you can too" using this guide.

_This article once appeared on [headspring.com](https://web.archive.org/web/20210617055836/https://headspring.com/2020/09/22/better-than-passwords-securing-cloud-infrastructure-with-azure-managed-identities/)._

<!--more-->

Security is a critical concern for any application, but especially so for cloud-native ones. Besides network security and access control, keeping keys and passwords secret and regularly rotated is fundamental. But even automated rotations can be time-consuming, and the presence of any key comes with risk of exposure or human error.

For applications hosted in Azure, however, there is a better way in [Azure Managed Identities](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/overview). With a few configuration tweaks and even fewer lines of code, we can replace our application’s password-oriented infrastructure authentication with a trusted, system-managed service principal. This guarantees a secure connection with no need for knowing, keeping, or rotating secret keys.

## Mise en place

Our application is a cloud-native .NET Core 3.1 web app with a few external dependencies: an Azure SQL database, files in Azure Blob Storage, and configuration secrets saved to Azure KeyVaut. A facsimile of our app is [available on Github](https://github.com/pmcvtm/azureference-app/tree/blog-1-start) for reference. It uses the following Nuget packages to interface with those dependencies, using traditional username / password or secret-key-based authentication:

- EntityFrameworkCore.SqlServer
- Storage.Blobs
- Security.KeyVault.Secrets

There are many other Azure services that allow authentication and authorization through Managed Identity; the steps for granting access and updating the code all follow a similar pattern. Likewise, most application-hosting services in Azure support creating a Managed Identity, including [App Services](https://docs.microsoft.com/en-us/azure/app-service/overview-managed-identity?tabs=dotnet), Virtual Machines ([Windows](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/tutorial-windows-vm-access-arm) and [Linux](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/tutorial-linux-vm-access-arm)), [Logic Apps](https://docs.microsoft.com/en-us/azure/logic-apps/create-managed-service-identity) and even for containerized apps on [Container Instances](https://docs.microsoft.com/en-us/azure/container-instances/container-instances-managed-identity) or [Azure Kubernetes Services](https://docs.microsoft.com/en-us/azure/aks/use-managed-identity). For this guide, we’ll be using App Services, Azure’s elastic application host.

_NOTE: While the following steps can all be executed with just a few clicks in the Azure Portal’s web interface, our examples are [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest) commands for the sake of brevity, precision, and repeatability. Be sure to [sign in](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli?view=azure-cli-latest) and set the desired [subscription to active](https://docs.microsoft.com/en-us/cli/azure/manage-azure-subscriptions-azure-cli?view=azure-cli-latest) before continuing._

## Enabling Managed Identity

We have the option to use an existing AD service principal, but we’ll prefer the System Managed Identity, wherein Azure will generate and manage a principal for us. This provides an extra layer of protection, as **no** users can alter the definition of the identity. We assign the system identity using the name of our App Service and the Resource Group it’s in:

```console
az webapp identity assign --name MyAppService --resource-group  MyResourceGroup
```

Assigning the identity to our service will reveal a unique identifier for the new service principal; called `principalId` in the CLI result (or “Object Id” in the Portal). Make note of this ID, as we’ll need it in the next steps.

## Granting access for the Service Principal

After enabling Managed Identity, we can grant the new principal access to our dependencies.

For Azure SQL, we have to create a user that maps to the new service principal and assign it the necessary database roles. This must be done using an existing authentication method, either an existing user in Active Directory with a password, or the server’s default SQL administrator account. We’ll open a connection and run the following commands, naming the new user to match the App Service name:

```sql
CREATE USER [MyAppService] FROM EXTERNAL PROVIDER

ALTER ROLE db_datareader ADD MEMBER [MyAppService]
ALTER ROLE db_datawriter ADD MEMBER [MyAppService]
-- alter other roles as needed
```

​We can also create a user for an Azure AD Security Group, which is helpful when we want multiple users or principals to have similar roles for interacting with the database. If you have configured your database this way already, simply add the App Service’s principal to the existing security group.

_NOTE: You may have seen the option to authorize our Managed Identity using the [Azure Active Directory Admin](https://docs.microsoft.com/en-us/azure/azure-sql/database/authentication-aad-overview) feature, which grants an AD principal administrator privileges for the entire server. While a simple solution, that gives our application too much control over the server in the event of some malicious action through our application. Our code is secure, but it’s irresponsible to grant more than the minimum roles required by the application’s functionality._

Azure Storage Accounts provide a specific Access Control role for making read / write changes to Blobs in a container or account. We can grant this role to our new Service Principal using the `PrincipalId` we gathered in the first step and the full “Resource ID” of the storage account:

```console
 az role assignment create --role "Storage Blob Data Contributor" --assignee MyPrincipalId --scope /subscriptions/my-subscription-id/resourcegroups/my-resource-group/providers/Microsoft.Storage/storageAccounts/my-storage-account==
```

Finally, Azure Key Vault authenticates and authorizes using individual Access Policies for Active Directory principals. Policies can be created for human users, security groups, or service principals, including our Managed Identity. Each policy has individual controls for secrets, keys, and certificates separately. We’ll add a policy for our application to list and read any stored secrets, using that same `PrincipalId and` the name of the Key Vault:

```console
az keyvault set-policy --name MyKeyVault --object-id MyPrincipalId --secret-permissions get list
```

With all our resources configured to grant access to our new principal, we’re ready to configure our code to use Managed Identity to authenticate, rather than traditional keys or passwords.

## Updating application code

The SDK for authenticating with Managed Identity is found in the `Azure.Identity` library, and is compatible with our `Azure.*` SDKs for KeyVault and Azure Storage. Apps using the older (deprecated) `Microsoft.Azure.*` libraries can still use Managed Identity, with the `Microsoft.Azure.Services.AppAuthentication` Nuget Package, although the implementation varies slightly. Also, keep in mind the resource URLs used here may vary for Azure Government or other cloud environments.

Starting with SQL server, we need to change our connection string to remove the username and password, as they will be replaced with the trusted identity token. We want to keep the rest of the connection string info, in particular the server address and initial database. Chances are, this is a change in your App Service settings or, better yet, your deployment process. The updated connection string may look something like this:

```plaintext
Server=tcp:mysqlserver.database.windows.net,1433;Initial Catalog=MyDB;Persist Security Info=False MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

Now, we can update our Entity Framework Database Context to fetch an authorization token for our Managed Identity principal, when configured to do so:

```csharp
public class MyDatabase : DbContext
{
  public MyDatabase(DbContextOptions<MyDatabase> options, IConfiguration config) : base(options)
  {
    if(config.GetValue<bool>("UseManagedIdentity"))
      AddTokenToConnection().Wait();
  }

  private async Task AddTokenToConnection()
  {
    var managedIdentityCred = new DefaultAzureCredential();
    var tokenRequestContext = new TokenRequestContext(new[] { "https://database.windows.net//.default" });
    var tokenRequestResult = await managedIdentityCred.GetTokenAsync(tokenRequestContext);

    var connection = (Microsoft.Data.SqlClient.SqlConnection)Database.GetDbConnection();
    connection.AccessToken = tokenRequestResult.Token;
  }
}
```

The key here  is the `DefaultAzureCredential`, which will seek out [enabled authentication schemes](https://docs.microsoft.com/en-us/dotnet/api/azure.identity.defaultazurecredential?view=azure-dotnet) and request a token for the given `TokenRequestContext`, which, here, is the Azure Database scheme. We can then include the token’s value on our SQL Server Connection. An error is thrown if the token is added to a connection string that also includes username and password, so we use an explicit configuration flag `UseManagedIdentity` that will be set in the deployed environment. Instead, you might get clever about the structure of your connection string to conditionally include the token.

Azure Storage also leverages the `DefaultAzureCredential`, and since the library is more catered to Azure than Entity Framework, there is a specific overload when creating a new `BlobContainerClient`. Simply replace the connection string or configured key with the default token, in conjunction with the resource URL for the Storage Account:

```csharp
var storageAccountUri = new Uri(_config.GetValue<string>("File:StorageAccountUrl"));

var managedIdentityCred = new DefaultAzureCredential();
var blobContainerClient = new BlobContainerClient(myStorageAccoutnUri, managedIdentityCred);
```

Unlike with SQL Server, we do not need to request a token directly with `GetTokenAsync()`, or set the `TokenRequestContext`. Both of these will happen under the hood, as part of the Azure Storage library. Like SQL Server, however, this token is not compatible with local or emulated storage, so depending on the nature of the application’s configuration, additional changes may be necessary to support both schemes.

The implementation for connecting to Azure Key Vault is almost identical to Blob Storage:

```csharp
var keyVaultUri = new Uri(_config.GetValue<string>("KeyVaultUrl"));
var keyVaultClient = new SecretClient(new Uri(kvUri), new DefaultAzureCredential());
```

In the `Azure.Security.KeyVault.Secrets` library, the **only** overload for a new `SecretClient` is with some `TokenCredential`. So if you currently depend on Key Vault, be prepared to wrap your current authentication scheme with a custom implementation, or make a move towards Managed Identity or another existing secure option. The implementation of all the above changes can be seen on [this pull request](https://github.com/pmcvtm/azureference-app/pull/2) in our facsimile repository.

## What about testing?

The `DefaultAzureToken` is the code mechanism to provide the appropriate `Azure.TokenCredential` given the current runtime context. When an application is hosted by a service with Managed Identity enabled, it resolves to a `ManagedIdentityCredential`, but is compatible with other “environmental” contexts, including configured values or shared tokens. During local development, the token resolves as a `VisualStudioCredential` or `VisualStudioCodeCredential`, using your signed-in user info to authenticate. This also provides a safe way to connect to shared cloud resources for development without sharing any keys or passwords that might accidentally be committed to the repository. This enables integration testing without any extra hurdles, however it's probably still a good idea to wrap these tools in abstractions for mocking, stubbing, or faking in your unit tests.

## Securing your future

Cloud infrastructure and the code that interfaces with it is always on the move, and [new options for development](https://github.com/Azure/azure-sdk-for-net/blob/64463f361c3dfeb8f96bb1d335710b383424bdb6/sdk/core/Microsoft.Extensions.Azure/README.md) with Azure will surely arise. Regardless of what namespaces your code is under, consider securing your applications using trusted service principles, rather than storing hard-written keys, to reduce risk, reduce effort, and elevate security.

_This article once appeared on [headspring.com](https://web.archive.org/web/20210617055836/https://headspring.com/2020/09/22/better-than-passwords-securing-cloud-infrastructure-with-azure-managed-identities/)._
