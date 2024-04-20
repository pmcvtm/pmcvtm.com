---
layout: long-links
title: Patrick McVeety-Mill's Card
permalink: /card/
description: Patrick McVeety-Mill's online business card.
---

<ul>
{% for link in site.data.social_links %}
  {% if link.card == true %}
    <li>
      <a href="{{link.url}}" title="{{link.title}}" target="_blank">
        <span class="link-text">
          <i class="{{link.icon}}"></i>
          <span>{{link.text}}</span>
        </span>
      </a>
    </li>
  {% endif %}
{% endfor %}
</ul>
