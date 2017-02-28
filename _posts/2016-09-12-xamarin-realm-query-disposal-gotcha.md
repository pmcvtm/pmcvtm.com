---
layout: post
title:  "Xamarin Realm Query Disposal Gotcha"
date:   2016-09-16 11:24:00 -0600
category: nerds
tags: development mobile xamarin
---

## `using` More Than You'd Think

Recently I've been getting my feet wet with mobile app development using [Xamarin](https://www.xamarin.com/). It's been a change of pace from the usual web fare, but it's also familiar enough to not be afraid of.

<!--more-->

One notable difference from the concerns on the web is the importance of your app's size on a phone, as well as how much processing and memory it uses. You don't want to be the battery drainer! To both alleviate our in-memory load and more easily manage our app's data stores, we are using [Realm](https://realm.io/). Setting up Realm is straightforward, in part thanks to their [nice set-up guide](https://realm.io/docs/xamarin/latest/#installation). Working with it, however, led to something unexpected.

### Laziness
Most robust ORM-type libraries I've worked with have had some notion of lazily loading objects from the data store (that is, only nabbing the parts you need as you need them). It's handy. Usually, though, the tool also is smart about when to "solidify" or otherwise eager-fill the entirety of the object, such as before a connection is closed: 

````
var turbo = new Pupper();
using(var gonnegtion = PetStore.Open())
{
    turbo = gonnegtion.All<Pupper>.Single(x => x.Id == id);
}
```
In the above, I would expect that after and outside the using block, `turbo` would be fully fleshed from whatever was saved in the `PetStore`. Unfortunately, this is not the case with Realm. Attempting to access an object outside of the block after populating it will throw a `Realms.RealmClosedException` at you.

We find an indication of this semi-buried in the ["Queries"](https://realm.io/docs/xamarin/latest/#more-query-examples) section of the documentation:

>Objects are not copied - you get a list of references to the matching objects, and you work directly with the original objects that match your query.

### There You Have It

Reading back, in their [main example codeblock](https://realm.io/docs/xamarin/latest/#getting-started), they don't wrap their Realm instance in a `using` at all:

```
var realm = Realm.GetInstance();

//... example contents
```

Later they also point out when explaining [Realms (Databases)](https://realm.io/docs/xamarin/latest/#closing-realm-instances) that you can close a Realm at any time. This might imply that you should just have one around and open and at-length, maybe even for the lifetime of the app.

That option seems risky, but mobile development is new to me. Is Realm intended to be GetInstance()'d and closed willy nilly? Is that a normal pattern?
If I find out, you'll be the first to know.
