---
layout: long-links
title: Patrick McVeety-Mill's Links
permalink: /linkinbio/
description: Patrick McVeety-Mill's social links.
---

_The Link in the Bio_

<ul>
{% for link in site.data.social_links %}
  {% if link.linkinbio == true %}
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
