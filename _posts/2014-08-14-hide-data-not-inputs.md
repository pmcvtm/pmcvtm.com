---
layout: post
title:  "Hide Data, Not Inputs"
date:   2014-08-14 09:05:00 -0600
category: nerds
tags: development html
---

Today's data-rich, dynamic internet can mean shoving context and metadata wherever you can to support content styling, drive data usage, or otherwise spruce up your UI. Recently I was tasked with sorting and grouping items in a list by date, with display headers over each group. The list item sort-by dates initially came from the server, so I was able to leverage Razor helpers to generate the headers. Things got complicated, however, when I needed to dynamically show or hide each header based on whether its contents matched the current filter settings. Luckily we were using [Knockout](http://knockoutjs.com/), so a framework for fancy front-end logic was in place.

My first inclination was to nest hidden inputs inside the header element. An element with a built-in "value" that isn't shown by nature seemed like a good choice. I then captured those values when I created my Knockout viewmodels for the list headers:
<!--more-->

**Markup:**
```html
<div class="list-group-header">
  <input type="hidden" name="dateStart" value="@dateStart" />
  <input type="hidden" name="dateEnd" value="@dateEnd" />
  <!-- Header Content -->
</div>
```
**In the Viewmodel:**
```javascript
var dateStart = $(headerElement).find("input[type='hidden' [name='dateStart']").val();
var dateEnd = $(headerElement).find("input[type='hidden' [name='dateEnd']").val();

header.dateStart = ko.observable(dateStart);
header.dateEnd = ko.observable(dateEnd);
```

While this got the job done, there were some issues. I had the data I needed to group the list items with the headers and check for the behavior I wanted on the viewmodel, but the markup doesn't make much sense. An input belongs in a form, for something that the user could potentially change, or needs to be sent to the server. I could play around with other attributes on css-hidden elements, but that may not fly on some browsers, and still leaves the DOM cluttered with elements that aren't representative of their purpose. Thankfully, there is a clearer option available.

### The Data Attribute

The html [custom data attribute](http://www.w3.org/html/wg/drafts/html/master/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes), written as `data-x= "y"` has been around for more than a few years. If you're familiar with Knockout, you have probably seen it in action with the `data-bind` attribute that's used to tie your viewmodel observables to your html. What you may not have known is that the `bind` in `data-bind` is just a special word "reserved" by the framework. You can replace it with _anything you want_ and subsequently access it in your javascript!

In my case, this meant adding two data attribues on the header's main element. That's right, _you can add more than one of these bad boys_ to your elements. So long as the names are unique, you can pile on as many you want. Here's what I ended up with:

```html
<div class="list-group-header" data-datestart="@dateStart" data-dateend="@dateEnd">
  <!-- Header Content -->
</div>
```
Boy, that's a lot cleaner. Then, in the Viewmodel:
```javascript
var dateStart = $(headerElement).data('datestart');
var dateEnd = $(headerElement).data('dateend');

header.dateStart = ko.observable(dateStart);
header.dateEnd = ko.observable(dateEnd);
```

As you can see, I utlized the jQuery [`.data()`](http://api.jquery.com/jQuery.data/) method to access the field, but you can also access the data attributes directly via `[element].dataset.[x]`. While the spec definition is older, the support is not, so you may have to fall back to using `[element].getAttribute` for older browsers.

The front-end languages of the internet are fairly free-form and easy to bend to you needs, but it's better to consider the purpose of your elements to keep your DOM clean and intent clear. Using the `data-*` attribute in place of hidden inputs _that aren't actual inputs_ provides access to data you need without misleading intent or cluttering your markup.
