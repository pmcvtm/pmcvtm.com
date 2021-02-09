---
layout: post
title:  "Debugging Shortcuts in Visual Studio 2017"
date:   2017-08-29 03:25:00 -0600
categories: Development
color: vermilion
tags: .net visual-studio debugging
---

How do you debug your application in Visual Studio? Is it something like:

> _F5_

Or maybe, **if you're hep**, you

> _Ctrl+F5_
>
> _Debug ➡ Attach to Process... ➡ Dialog..._

so can develop and re-build with the app still running, and debug only when you want to.

Or maybe you **use the mouse**; I won't give you a hard time.

I will, however, tell all of you that if you have Visual Studio 2017, **you're working more slowly than you could be.**

<!--more-->

As stated above, the smoother way to debug your app is to run it without debugging, and manually attach the debugger. Launching and simultaneously attaching the debugger, or tearing down and detaching, (the default **Start Debugging**) can be slow, and prevents you from quickly pulling up the app to test after small changes. 

When we instead use **Start Without Debugging**, the app runs independent of whatever Visual Studio is up to. We can code, temporarily break the build, run tests, and recompile, all while checking behavior in the live app. It's only when we need to debug that we attach the debugger, and when we stop, the app continues to run.

The problem with manually attaching the debugger is its break from flow. Following through the attachment dialog window is a mostly mouse-driven activity. Sometimes, depending on the speed of your laptop, it can be as-or-more time consuming to do this compared to waiting for the regular debug start.

Enter **Reattach to Process**, a new option under the Debug menu in Visual Studio 2017. Selecting this will (you guessed it) re-attach the debugger to the last process you attached it to. You still have to go through the process selection dialog the first time after opening your solution, but from then on, you're good to go as long as your process stays on. What's more, you can call reattach to process using the shortcut

> Alt + Shift + P

getting us that much closer to **never touching the mouse** again.
