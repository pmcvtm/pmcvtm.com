---
layout: post
title:  "JS in .NET Without Node"
date:   2014-06-14 06:00:00 -0600
category: nerds
tags: development .net nodejs
---

## Or, Not Node, .Net.

I don't have to tell you that javascript is the new hotness. In fact, at this point, some may even call it the old hotness. More and more web applications are built as SPAs, or at least have much richer client-sides. The tools and libraries that've come through [node](http://nodejs.org/) and the [npm](http://npmjs.org/) have proven so useful that many developers are taking advantage of them outside of core- node.js projects.
<!--more-->

The npm is a beautiful thing, but a readme for a .NET application with **"You must have node.js installed first"** scrawled across the top defeats the intent of the *clone &raquo; build &raquo; rock* lifestyle.

The good news is that it's possible to take advantage of those sweet tools without adding a *developer-dependency* on the npm. Many of those server-side js libraries you love are also available on [nuget](http://nuget.org/), including [bower](http://nuget.org/packages/Bower/), which is hopefully how you're managing your client-side javascript packages (or, at least, you're not using npm).

The Web.Optimization bundler can be leveraged to minify, uglify, or otherwise scrunch your scripts, and doesn't require an additional 'watch' build task to update files. In addition, you can leverage it to replicate other front-end development needs. I'm currently using [this custom bundler](http://github.com/kingpin2k/HandlebarsHelper/) to precompile my Handlebars templates for Ember.js, instead of a javascript task-runner.

Including beacoup javascript in web applications is nearly, if not now, the new norm. Node is great, but there's no need to break out of your regular programming paradigm to take advantage of what's available.
