---
layout: page
title: Arts
permalink: /arts/
color: "citron"
icon: fa-paint-brush
description: Dedicated doodles and stress-relieving crafts.
---

_Click an image to view it full size in a new window._

<div class="pure-g arts-list">
{% for art in site.data.arts %}
    <div class="art-entry pure-u-1-2 pure-u-md-1-4">
        <a href="{{art.fullSrc}}" target="blank">
            <img src="{{art.thumbSrc}}" />
            <span class="art-title">{{art.title}}</span><br />
            <span class="art-meta">
                {{art.media}} <br />
                {{art.date}}
            </span>
        </a>
    </div>
{% endfor %}
</div>
