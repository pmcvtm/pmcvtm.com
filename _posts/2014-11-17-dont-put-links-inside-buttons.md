---
layout: post
title:  "Don't Put Links Inside Buttons"
date:   2014-11-17 07:52:00 -0600
category: nerds
tags: development html
---

_And Vice Versa_

This assertion may be old news to you, and if it is feel free to breeze by, but I just made this mistake and surely I'm not the only or the last one to come upon it.

### Links and buttons

The anchor (`<a>`) and button (`<button>`) html tags are designed for different purposes. Buttons act in forms, anchors (links) are practically anywhere and go to other pages. Thinking people like [Chris Coyier](https://twitter.com/chriscoyier) have posted [some thoughts](http://css-tricks.com/use-button-element/) about that before, and I'm sure there are many opinions about it, as living things like html are wont to lead to.

<!--more-->

In the post-fancy-css-framework world (read: **THE FUTURE**), the line becomes hazier, where a button-like _appearance_ lends itself more to intent than surrounding markup. [Most](http://getbootstrap.com/css/#buttons-tags) [major](http://foundation.zurb.com/docs/components/buttons.html) [css](http://purecss.io/buttons/) [frameworks](http://jqueryui.com/button/) allow you to 'button-ify' any link as you see fit, accordingly.

But this can be harder for older applications. I recently ran into a situation where I wanted to convey that button-type intent, but backed with a link under the hood. The links acted in a way that seemed more like a form submission than a page-change, and I wanted to reflect that. This UI "look" also existed on other pages, using a hidden input and actual buttons, but that seemed uglier and like more work than using pre-parameterized links. I ended up with this markup:

```html
<button type="button" class="button-link">
    <a href="/Task/Create/someparams" title="This link feels more like a button">Create Task</a>
</button>
```

Or one might end up with the reverse of that, because why not?

```html
<a href="/Task/Create/someparams" title="This link feels more like a button">
    <button type="button" class="button-link">Create Task</button>
</a>
```

Watch out, buddy &mdash; these don't always work. Both options are Chrome-approved, but silently do nothing in Firefox and IE. The latter is also just plain invalid html. In retrospect, both look a little off, so it's not wholely suprising that they don't act as expected.

### What to do instead

If you're living in the future (and you should be), this is a non-issue. Use your fancy CSS framework to style your links to look like fancy, colorful buttons. If you're not (like me and this codebase) you have a few options:

#### Just use links
Any time you're rubbing against the grain of a pattern is a good opportunity to re-evaluate why you need something to work or look a certain way. Think about why you want buttons that link instead of links that link before continuing.

#### Make your own button styles
You can make your links look like buttons with CSS borders, backgrounds, and hover/click behavior. The challenge is that each browser has slightly different default button appearance, so if you're making your own button style, you'll want to make your _real_ buttons are styled to match.

#### Use javascript
The path of least-fuss once you've decided you really need button-links is to use javascript to force a location change. This could be as simple as an onclick in the button element:
```html
<button type="button" onclick="window.location = '/Task/Create/someparams'">Create Task</button>
```
But personally I think it's cooler (and more reusable) to wire it up using a data attribute:
```html
<button type="button" class="buttonLink" data-url="/Task/Create/someparams">Create Task</button>
```

```js
$('.buttonLink').on('click', function(event){
    event.preventDefault();
    window.location = $(this).data('url');
});
```
Either way with this method, what you're left with are buttons that look like buttons (because they _are_ buttons) but act like links. Directly setting window.location always makes me raise my eyebrows a little, but for something so straightforward I'm not as concerned. This also does not address the issue of button vs. anchor markup integrity, but that can be saved for another time. For now this simple, valid html works with modern (and a little older) browsers, without putting links inside buttons.
