---
layout: card
title: Patrick McVeety-Mill's Links
permalink: /linkinbio/
description: Patrick McVeety-Mill's social links.
---

<ul>
{% for link in site.data.bio_links %}
  {% if link.show == true %}
    <li class="business-card-link-{{link.color | default:'brown'}}">
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
