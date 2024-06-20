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
        <a class="hover-{{post.color}}" href="{{ post.url | relative_url }}">
          <span class="post-date">{{ post.date | date: "%Y-%m-%d" }}</span>
          | {{ post.title }}
          | <span class="{{post.color}}">{{ post.categories }}</span>
        </a>
    </li>
{% endfor %}
</ul>
