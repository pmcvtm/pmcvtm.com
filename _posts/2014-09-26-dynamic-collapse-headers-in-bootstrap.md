---
layout: post
title:  "Dynamic Collapse Headers in Bootstrap"
date:   2014-09-26 18:01:00 -0600
category: nerds
tags: development html bootstrap
---

[Twitter Bootstrap](http://getbootstrap.com/) sure is fancy. With it or cousin framework [Foundation](http://foundation.zurb.com/), you can whip up a pretty nice, modern-looking website with minimal effort. (Though personally, I often prefer the less-opinionated [Pure](http://purecss.io/) framework.) These libraries and tools provide the groundwork and components to style your way into the future, but also leave out some of the nuances to enhance your user experience to primo usability and slickness.
<!--more-->

Bootstrap's [Collapse](http://getbootstrap.com/javascript/#collapse) component is pretty handy. It looks like this:

<div class="panel panel-default">
  <div class="panel-heading">
    <div data-toggle="collapse" data-parent="#accordion" data-target="#collapseSample">
      <strong>Click This To Toggle the Collapse</strong>
    </div>
  </div>
  <div id="collapseSample" class="panel-collapse collapse">
    <div class="panel-body">
        The collapse content is in here.
    </div>
  </div>
</div>

<p>Unfortunately, it's not immediately apparent that a collapse component is interactive, after all, their example is styled just like a regular Bootstrap panel. To resolve this, it's common to indicate usage with icons like these: <i class="fa fa-chevron-right"></i> <i class="fa fa-chevron-down"></i> for closed and open collapsables, respectively. But how do you show the right icon given the panel's state?</p>

Bootstrap provides `show.bs.collapse` and `hide.bs.collapse` javascript events that fire when a component opens or closes that you can tie functions to like so: `$('collapseDiv').on('show.bs.collapse', function(){...})` It wouldn't be difficult to add some jQuery to toggle your icons, but you'll end up having to wire each collapse component separately. Pair that with having to add and remove classes on both your icon elements, and things get hairy, or at least a little more verbose than is ideal.

The folks who made Bootstrap were also thoughtful enough to provide css classes that are automatically added or removed to both the collapse trigger and its content, based on the state of the component. When closed, the trigger element is given the `collapsed` class, and when open, the content has the `in` class. By playing off the `collapsed` class, we can show or hide elements within our trigger using strictly css:

```
.collapse-trigger .show-when-collapsed{
    display: none;
}

.collapse-trigger.collapsed .show-when-collapsed{
    display: inline-block;
}

.collapse-trigger .show-when-open{
    display: inline-block;
}

.collapse-trigger.collapsed .show-when-open{
    display: none;
}
```
The child element classes have their style rules keyed from the state of the the container.
Our collapse trigger markup then looks like this:
```
<div class="collapse-trigger collapsed" data-toggle="collapse" data-target="#collapse-content">
	<i class="icon-chevron-down show-when-open"></i>
    <i class="icon-chevron-right show-when-collapsed"></i>
    An Informative Header
</div>
```
And here is the result:
<div class="panel panel-default">
  <div class="panel-heading">
    <div data-toggle="collapse" data-target="#collapseWithIcon" class="collapse-trigger collapsed">
    	<i class="fa fa-chevron-down show-when-open"></i>
    	<i class="fa fa-chevron-right show-when-collapsed"></i>
      <strong>An Informative Header</strong>
    </div>
  </div>
  <div id="collapseWithIcon" class="panel-collapse collapse">
    <div class="panel-body">
        The collapse content is in here.
    </div>
  </div>
</div>

While admittedly the css isn't as straightforward as regular stylings, the result is less wordy than the javascript-driven alternative, and easier to reuse. You could remove the `.collapse-trigger` class (and instead work only off of the presence or absence of `.collapsed`), but I find it makes the intent of the markup a lot clearer. I've left it in, since a clear intent is part of the point. Utilizing css to drive the visual state of your application can lead to cleaner readability, easier reusability, and overall fewer lines of code.

---
My decision to see how I could use css to control the state of the icons in this way was inspired by a lunchtime presentation by my colleague [Chris Missal](http://twitter.com/ChrisMissal) about how to write "smart client-side code." Also, if you're interested in seeing more 'state-driven' css and what you can do with it, my former collegue [Tim Thomas](http://twitter.com/timgthomas) has a bunch of really cool use cases and examples on his [blog](http://timgthomas.com/).



<style>
  .collapse-trigger .show-when-collapsed{ display: none; }

  .collapse-trigger.collapsed .show-when-collapsed{ display: inline-block; }

  .collapse-trigger .show-when-open{ display: inline-block; }

  .collapse-trigger.collapsed .show-when-open{ display: none; }
</style>
