---
layout: post
title:  "Flagrant Error: Function Syntax In PowerShell"
date:   2015-04-14 09:15:00 -0600
tags: development powershell troubleshooting
---

The modarn developer can easily find themselves knee-deep in several programming languages. Between javascript and the server language of your choice for the web, the various options for mobile platforming, or the many hats of the academic, chances are if you're making for computers you're some degree of a [polyglot](http://en.wikipedia.org/wiki/Polyglotism).

Despite the challenges of context-changing between languages, most of them (particularly of the object-oriented variety) are similar enough in appearance and general methodologies. And yet sometimes this familiarity betrays us. Below is a simplified scenario roughly akin to the pickle I recently found myself in, wherein I was calling a PowerShell function from an external module:
**Disclaimer**: I don't know PowerShell

<!--more-->

```powershell
# from the module
function yellWordAtFriend ($word, $friend){
    $yelledWord = $word.ToUpper()
    $friend.speakAt($yelledWord)
}

# my code
yellWordAtFriend("pancake", $rodolfo)
```
Looks fine, right? Well it's not. I got this error:
```
Cannot convert 'System.Object[]' to the type 'System.String' required by parameter 'word'. Specified method is not supported.
```
Recall this is the PowerShell. So while it may appear to be correct in familiar language X, the syntax should really be:
```powershell
yellWordAtFriend "pancake" $rodolfo
```
Since there's a comma in between `"pancake",$rodolfo` these intended-to-be-two parameters are interpreted as a single array. The function I was calling had some rules to bark at me for messing up, but without any nice checking you're likely to just see *incorrect behavior*, which is perhaps worse than an actual error.It took me longer than it might should have to realize that this was a syntax error. For a while I wondered if `"pancake"` was being read as a char-array, based on the error message. It never occurred to me that I had just typed in the wrong language.

Unfortunately, there isn't a catch-all quick-fix for problems like this. Further familiarity with a language can certainly help with context-switching, but flubs and blubs along the way are hard to avoid. The good news is, in the aftermath of a code-wrestling match, the blunders made are not soon forgotten.

