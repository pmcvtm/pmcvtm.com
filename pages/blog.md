---
layout: page-wheadline
title: Blog
headline: Blog
permalink: /blog/
description: "Positive Spirits, Helpful Shouting"

color: citron
icon: "fas fa-book-open"

banner-show: true
banner-order: 3

pagination:
  enabled: true
---

{% if page.pagination_info.curr_page == 1 %}
<div class="blurb news">
  <h2>What's New</h2>
    <ul>
      {% include whatsnew.html %}
    </ul>
</div>
{% endif %}

{% include pagination.html %}
