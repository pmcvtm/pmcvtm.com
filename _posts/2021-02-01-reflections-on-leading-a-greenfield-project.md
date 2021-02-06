---
layout: post
title:  "Reflections on Leading a Greenfield Project"
date:   2021-02-01 15:22:00 -0600
categories: Development
color: vermilion
tags: commentary process
---

Today is my first day 'off' after leading a development project for a bit more than a year. Besides being a pretty long time for consulting, this was unique in being the first _greenfield_ project I've tech-led. Overall it was a success, but as in all things, there were lots of lessons learned I am now reflecting on.

<!--more-->

> A [greenfield project](https://en.wikipedia.org/wiki/Greenfield_project#Software_development) is new development on a clean and to-be-defined slate, as compared to [brownfield development](https://en.wikipedia.org/wiki/Brownfield_(software_development)): new development on existing or legacy software.

## Time and Opportunity

Being a tech lead requires [wearing many hats](https://podcasts.apple.com/us/podcast/ep-7-perspectives-on-role-splitting-with-lola-mullen/id1498262181?i=1000493201497) to meet the needs of any project. For greenfield, **time management** is as-if-not-more important. There is a disastrous temptation (I fell prey to at times) to write more code yourself, scaffolding patterns or implementing important or preliminary features. For some teams, this may work out; and delegation is great, if not necessary, for 'creating' time for yourself. But no matter what, implementing a 🆒 feature or a key piece of infrastructure from top-to-bottom takes time and attention away from steering the ship and establishing the broader landscape of the new system.

Besides an increased desire to do-it-yourself, there is a special risk of analysis paralysis when designing **new** systems to requirements. A blank canvas _should_ be a boon: "Finally a chance to have it my way!" Science, though, says that [constraints help with creativity](https://www.npr.org/2016/11/29/503594516/in-praise-of-mess-why-disorder-may-be-good-for-us), and existing architecture or widespread ugly patterns can make the path ahead more obvious compared to the near-infinite possibility of greenfield dev. Take the opportunity to explore, but time-box your spikes, and favor pragmatism over ideal perfection.

## Team, Guidance, Guardrails

Autonomy is critical for software developers, for morale, execution, and growth. However, totally unbridled developers are closer to wandering bears than a fluid herd of wild horses. Assuming your team shares your brain is an easy pitfall. Capable developers can replicate implementation patterns in an existing codebase, and more experienced devs may understand your designs without much direction, but many folks will need more guidance to start from new files and independently arrive at a single vibe for the codebase. [Shared languages](https://betterway.headspring.com/development-guidelines/) or [pattern blueprints](https://github.com/jbogard/ContosoUniversityDotNetCore-Pages) go a long way when you're at step 0.

Code reviews are a must, but for features that introduce new patterns, if you wait for the pull request to course-correct, it's too late: You leave some `Won't Fix` comments (for yourself) and reluctantly click `Merge` to the sound of the project manager's tapping foot. The feature is functional, but hard to navigate should a bug arise, and if it gets copied a month later, is a new anti-pattern.

I eventually moved beyond talking through the technical and business needs of a feature to including pseudocode sketches in ticket descriptions when I had a workable pattern in mind. You might also ask for a similar sketch before work gets too far, or do daily or mid-day check-ins to guide the _shape_ of new code. Be careful not to cross over into micro-management, though.

## Communication Artifacts

When anyone leaves a project, there is a scramble to dump their unique head-knowledge into something more permanent. I was pleasantly surprised with the amount of documentation already written. Even outdated wiki pages were _mostly_ right, and it takes less time to make a correction or expand on a bullet than to write from scratch. Documenting-as-you-go is so valuable, sometimes I even left a comment on PRs: "MUST: Add a page documenting how to use this [new thing]."

Besides the obvious how-tos and explainers, I left a long list of weak-spots, areas of improvement, and refactoring opportunities that were bouncing around my head and not _quite_ ready for a ticket. That list would have been valuable to share earlier, if only to allow the team to side-step falling into or digging those holes deeper.

The colleague who took over for me asked a great question that I was less prepared for: "What are your unlabeled duties?" The team _saw me_ review code, add details to tickets, meet with clients, and coach them. There were also less visible tasks, regular or one-off, that I was responsible for. Here, my daily working notes became a good resource, but were only so detailed. I wracked my brain for a few tasks, but now that I'm gone we can only hope I remembered everything critical. Being explicit about role-duties is already important for setting clear expectations, but here going into extra detail would've been a confidence boost.

## Parting Thoughts

There are lots of smaller, less helpful things to think: "I wish I had made the domain tighter," "Wow those test helpers are a wreck," "I could have documented the naming conventions, to help **me** be consistent" My code review checklist grew exponentially over the course of the project, and in reflecting there are still things that slipped by me. But I take comfort that all these are small things, and for every little error or could've-been-better there is a much larger value to the end user and their doings.
