---
layout: post
title:  "Checked=\"checked\" in Razor"
date:   2014-11-17 08:03:00 -0600
category: nerds
tags: development razor html
---

I often see the following [Razor-enhanced](http://www.asp.net/mvc/overview/views) form markup for writing out input checkboxes, particularly in loops where a given checkbox may be checked or unchecked based on some state in the Model. In the completely real scenario below, I have a form on a webpage where I select fruits for a smoothie:
<!--more-->

```c#
@foreach(var fruit in Model.AllFruits)
{
    var id = "SelectedFruits_" + fruit.Id;
    if (Model.SelectedFruits.Contains(fruit.Id))
    {
        <input id="@id" name="SelectedFruits" type="checkbox" value="@fruit.Id" checked="checked" />
    }
    else
    {
        <input id="@id" name="SelectedFruits" type="checkbox" value="@fruit.Id" />
    }
}
```
Alternatively, I can simplify that verbose if/else-ing by creating a variable that represents the presence or absence of the `checked="checked"` attribute, using a ternary statement:

```c#
@foreach(var fruit in Model.AllFruits)
{
    var id = "SelectedFruits_" + fruit.Id;
    var isChecked = Model.SelectedFruits.Contains(fruit.Id) ? "checked=\"checked\"" : "";

    <input id="@id" name="SelectedFruits" type="checkbox" value="@fruit.Id" @isChecked/>
}
```

While this does leave you with some functionality in your View, I find it's much cleaner and more readable than the alternative. If you're using the checked/unchecked flag for other logic, you can separate it out to its own variable to be used both for the markup ternary and whatever else you need it for. (Or better yet, pull it back to the Model because you shouldn't have lots of logic into your View.)

Is there a reason this isn't the common practice? It's worked for me so far, but I'm concerned there's something I'm missing. Tell me what you think, or about your favorite [Razor cleaner](http://i.imgur.com/ykc2UCx.jpg) down there in the comments.
