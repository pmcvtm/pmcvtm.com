---
layout: post
title:  "Database Migrations For Azure SQL Elastic Pools Using RoundhousE"
date:   2019-10-15 03:24:00 -0600
categories: Cloud
tags: azure sql roundhouse
---

Databases are important for most applications, but keeping their schemas consistent across versions and environments can become a sticky date pudding without proper care. Tools like [RoundhousE](https://github.com/chucknorris/roundhouse) provide streamlined, repeatable, script-based migrations and work like a charm out of the box. If using the very cool and atmospheric [Azure SQL Elastic Pools](https://docs.microsoft.com/en-us/azure/sql-database/sql-database-elastic-pool), however, the default behavior lands us adjacent to the pool, not in it. Let's not be hasty to abandon database host nor migrator; it's easy to correct this with little configuration. <!--more-->

## Not The Desired Databases

RoundhousE is kind to its users and [creates databases if they do not exist](https://github.com/chucknorris/roundhouse/wiki/CustomCreateDatabase) at the start of a migration. When working with Azure SQL, this creates a [single database](https://docs.microsoft.com/en-us/azure/sql-database/sql-database-single-database) on the connected [database server](https://docs.microsoft.com/en-us/azure/sql-database/sql-database-servers). That certainly fits as expected behavior, but if you've provisioned an elastic pool on your Azure SQL Server, you'll find it sadly empty after a first-time migration.

Databases can be pushed into the pool (not recommended for physical servers) after the fact from the Azure Portal or CLI, but I'm lazy and would prefer RoundhousE to carry me the whole way through.

## Custom Database Create

RoundhousE is as easy to customize as it is to use unconfigured, and provides a flag for overriding the default create database behavior in favor of a  [custom script](https://github.com/chucknorris/roundhouse/wiki/CustomCreateDatabase) (`-cds`). This script can then leverage the [T-SQL instruction](https://docs.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-database-service-objectives-azure-sql-database) for _where_ to create an Azure SQL database: `SERVICE_OBJECTIVE`. We can adapt RoundhousE's [sample custom create script](https://github.com/chucknorris/roundhouse/blob/master/product/roundhouse.databases.sqlserver/SqlServerDatabase.cs#L108-L115) to set both the service objective and the elastic pool's name:

```sql
USE master
DECLARE @Created bit
SET @Created = 0

IF NOT EXISTS(SELECT * FROM sys.databases WHERE [name] = '{{DatabaseName}}')
BEGIN
        Set @Created = 1

        CREATE DATABASE {{DatabaseName}}
        ( SERVICE_OBJECTIVE = ELASTIC_POOL ( name = [#REPLACE_ELASTIC_POOL_NAME#] ) )
END

SELECT @Created
```

At runtime, RoundhousE will connect as normal, but will run the above before any migration scripts. The `{% raw  %} {{DatabaseName}} {% endraw  %}` token will be filled in automatically, but `#REPLACE_ELASTIC_POOL_NAME#` will need to be hard-coded, or better yet plugged by some other process.

## Using in a CI/CD Pipeline

That works fine for a single elastic pool, but hard-coding names is brittle and may not work across environments. We give the script a little nudge; personally, I use powershell to plug in the elastic pool name from an environment variable, before calling RoundhousE:

```powershell
$replacedContent = (Get-Content -path $createDbScript -Raw) -replace '#REPLACE_ELASTIC_POOL_NAME#', $env:ElasticPoolName

Set-Content -Path $createDbScript -Value $replacedContent

&$roundhouse_exe_path -c "$env:MyConnectionString" -f "./scripts/" -cds $createDbScript --env $env:Environment --vf MyApp.dll
```

If you use other kinds of SQL hosts besides elastic pools, you can set a flag to only conditionally use the `-cds` option, or if you prefer writing SQL, knock yourself out on the create script.

Whether or not you need to get fancy, it's important to noodle around with our tools in the face of odd behavior, especially if it allows us to use more ideal technologies.
