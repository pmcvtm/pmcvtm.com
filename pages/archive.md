---
layout: page
title: Archive
permalink: /archive/
color: teal
icon: fa-book-dead
---

<ul class="archive blurb">
{% for post in site.posts %}
    <li class="hover-{{post.color}}">
        <a class="hover-{{post.color}}" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        | <span class="{{post.color}}">{{ post.categories }}</span>
        | {{ post.date | date: "%Y-%m-%d" }}
    </li>
{% endfor %}
</ul>
