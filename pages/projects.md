---
layout: page
title: Projects
permalink: /projects/
color: "#148261"
icon: fa-code-fork
---

My modest portfolio of recent side projects and prideworthy leftovers from my college daze.

<div class="pure-g">
<div class="pure-u-1 pure-u-md-1-3">
<em>Click a project to read more about it.</em>
<ul class="projects-list">
    {% for project in site.data.projects %}
    <li class="selector pure-g">
        <span class="project-name pure-u-2-3">{{ project.name }}</span>
        <span class="project-tag pure-u-1-3">{{ project.tag }}</span>
        <div class="project-content">
            <div class=""></div>
            <!-- <img class="project-image pure-img" src={{project.image}} /> -->
            <h2 class="project-title">{{project.name}}</h2>
            {{project.description}}
        </div>
    </li>
    {% endfor %}
</ul>
<em>And here are all my sleepy github repos</em>
<ul id="repos" class="projects-list"></ul>
</div>
<div class="pure-u-1 pure-u-md-2-3">
    <div id="selected-project"></div>
</div>
</div>

<script>
    $('document').ready(function(){
        var repos = $.ajax("https://api.github.com/users/{{site.author.github}}/repos?sort=updated", {
            success: function(data) {
                $.each(data, function(i, repo){
                    $('#repos').append(
                        `<li class="selector"><a href="${repo.html_url}" target="blank">${repo.name}</li>`
                    )
                });
            }
        });
    });

    $('.selector').click(function(event){
        $('#selected-project').empty();
        var target = $(event.target);
        var content = target.hasClass('selector')
            ? target.find('.project-content')
            : target.parents('.selector').find('.project-content');
        $('#selected-project').html($(content).html());
    });
</script>