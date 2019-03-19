---
layout: post
title:  "Cleaning Up After Dropbox with Powershell"
date:   2019-02-01 15:01:00 -0600
tags: powershell dropbox music housekeeping
---

Here's an aging thought: I am **old-school** when it comes to music. I don't mean the shoebox of  cassettes in my old car, Doreen (RIP), or my fledgling vinyl collection. My day-to-day listening habits revolve around a massive collection of `.mp3` files (and `.flac` &emdash; I see you nerds). Instead of streaming or algorithms, I have bootlegs, full discographies regardless of label, and some _good_ hand-curated playlists. It's well backed up, including on [Dropbox](), in addition to multiple physical spots. I use the Dropbox as my "master record" of the current state, but recently had a scare with some GB of tunes seemingly disappearing. In my panic I caused some weird problems, but thankfully, Powershell, of all things, was there to help.<!--more-->

## My Setup

My `Music/` folder has three subdirectories: `/Sorted`, `/Unsorted` and `/New`. I keep new tracks separate; thinking (foolishly) they require less clean-up, and to make it very easy to isolate them for listening. There once were two other subdirectories: `/Synced` and `/Needs Attention`. These included tracks I had sorted, then uploaded to a cloud music service, and tracks with tags **so** out of whack I needed to dedicate time to organize them (looking at you, classical music) respectively. Within each subdirectory, music is organized as `./Artist/Album/tracks`. An artist may have a folder in any or all of the subdirectories, which doesn't pose a problem for any music library app worth its salt. Not long ago I ditched the cloud music service. I also realized that after so many transfers to my Zune and accidental openings of iTunes or Microsoft Groove, my `/Sorted` and `/Synced` folders weren't really _that_ organized.

The solution seemed clear: Cut and Paste all the `./Artist/` folders into `/Unsorted` and start afresh.

## A Crisis

After the move, Windows showed I had only **60 GB** of music, down from a few hundred! WHAT. NOT OK. PANIC!

I don't know much about Dropbox's internals, especially when it comes to versioning. I'd like to think it's smart, cause I pay money for it, but who can really say. I _do_ know a little now of what behavior to expect when you move **hundreds of GBs** of files on your OS and let the Dropbox sync itself. Moved files show as _deleted_ in the old location and _new_ in the destination. That makes a lot of sense. The tricky part comes when restoring those moved files.


## Powershell

```

```


Here's the whole script, you filthy animals:

``` powershell
$basePath = "C:\Users\Patrick\Dropbox\Music\Unsorted"

ForEach ($copiedDirName in Get-ChildItem -Path $basePath -Directory -Name){
  if($copiedDirName.endswith(")")) {
    $originalDirName = $copiedDirName.subString(0, $copiedDirName.length-4)

    $source = [io.path]::combine($basePath, $copiedDirName)
    $destination = [io.path]::combine($basePath, $originalDirName)

    # Write-Host "Will copy '$source' into '$destination'"

    robocopy /E /MOVE /XC /XN /XO  $source $destination

    Remove-Item -Path $source -Recurse
  }
}
```
