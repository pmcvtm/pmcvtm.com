---
layout: post
title:  Options for a More Agile Data Architecture
date:   2021-06-17 10:29:00 -0600
categories: Data
color: vermilion
tags: sql 
image: /assets/post-cards/2021-06-17-options-for-more-agile-data-architecture.jpg
---

The old data strategy standard of “chuck it in SQL” is as low-effort as ever to implement. But as time passes and applications change, hard-set relational data structures become easy to trip over, and the ceremony required to make changes is a slog to step through. Today, new technologies in data architecture allow dev organizations to achieve previously unreachable levels of agility in managing and utilizing data.

_This article once appeared on [headspring.com](https://web.archive.org/web/20210629150417/https://headspring.com/2021/06/17/options-for-a-more-agile-data-architecture/)._

<!--more-->

## Leveraging document databases

One of the most obvious ways to keep on your technological toes is by focusing developer time on what matters. Data structures that are easy to develop against will leave more hours in the day for fine-tuning, nice-to-haves, and experimentation. NoSQL Document Databases like MongoDB provide alternatives to relational databases that are more naturally fitted for the object-oriented programming languages that most of us software consultants primarily use.

The low ceremony of Document DBs empowers developers to work quickly. Eliminating the need for schema definition or management can lead to faster time-to-live on feature delivery. In addition, cloud offerings such as Amazon DynamoDB and Azure Cosmos DB have low up-front costs with built-in scaling, so your agile data architecture is always available and can grow with your business needs.

## Avoiding painful integrations

SQL is powerful in its rigidity, but that comes with a cost, especially when agile operations demand flexibility. Consider a distributed system, such as a microservices architecture or any other integration-heavy solution: Sharing data across an SQL-centric data architecture often requires complex and frequent replication for availability, unique ETL processes for every service, and the added maintenance to update those processes any time a connected schema is altered.

## The elegance of Event Streams

Event-driven messages are an ideal alternative in highly integrated systems like these. Event Streams such as Kafka, AWS EventBridge, or Azure Event Hubs allow processing data changes as they occur, and the ability to transform, filter, and re-stream messages in a lightweight way for different consumers. As with Document DBs, the reduction in ceremony required to work with data streamlines the development process and keeps options open when requirements and needs change.

## Don’t turn your back

It is important to consider all your options when designing a thoughtful data architecture, and SQL is still one of those options. Even though it may no longer be the best fit for some modern problems, SQL is still the relational-model champ and is near-guaranteed to serve an important role in creating a more agile data architecture: reporting. Keeping a relational translation of your less-relational data for generating quick and reliable reports enables informed, agile decision-making. “Move fast and break things” is only a good strategy when things are broken intentionally.

## The importance of agile data architecture

Changes in technology demand changes in your culture and organization. Roles like DBAs may no longer be needed as teams adopt more developer-driven practices, while other roles in DevOps and tool implementation may emerge that are necessary to support the new system and processes. But don’t be intimidated; it’s never too late to move, migrate, and modernize, especially when it’s in the interest of future development and business agility.
