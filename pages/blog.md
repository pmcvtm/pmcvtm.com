---
layout: page-wheadline
title: Blog
headline: Blog
headline-link: /blog/
permalink: /blog/
subtitle: "Positive Spirits, Helpful Shouting"
description: Blog posts regarding technology, travel, and more, including tutorials, references, guides, and essays, all by Patrick McVeety-Mill.

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
