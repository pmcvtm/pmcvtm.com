---
layout: page
title: Archive
permalink: /archive/
icon: fa-archive
---

Here's a list of all the posts on the site:

{% for post in site.posts reversed %}

- {{ post.date | date: "%Y-%m-%d" }} [{{ post.title }}]({{ post.url | relative_url }}) {% if post.tags.size > 0 %} &nbsp;&mdash; {% for tag in post.tags %}&nbsp;{{ tag }}{% endfor %}{% endif %}

{% endfor %}

