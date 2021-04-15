---
layout: post
title:  An OK Use for Tuples in C#
date:   2021-04-15 10:12:00 -0500
categories: Development
color: vermilion
tags: tuples c# types
---

Tuples get a bad rap in C#, mostly because until recently they were a pain to work with. As of C# 7, [they are much nicer](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-tuples), but I am still missing the instinct to use them. Last night a friend was streaming work on a side-project using the [Unity](https://unity.com/) game engine. It's been too long for me to provide any help with geometry, but we started talking about readability when I saw a nice opportuplety. 

<!--more-->

Specifically, my friend was working on a [Perlin Noise](https://en.wikipedia.org/wiki/Perlin_noise) generator, used to make sets of random-but-smoothed-and-normalized numbers. Pop those numbers onto a 3-D grid and add some conditional lighting or color effects and you can have an attractive, real-ish-looking mountain landscape with little effort. Unity makes generating Perlin Noise [very easy](https://docs.unity3d.com/ScriptReference/Mathf.PerlinNoise.html) so the work is distributing the noise over the space, or map.

## Expanding Signatures Elicit Confusion

We won't worry about the algorithm itself, just the method signature for generating the map of values:

```csharp
public float[,] CreateNoiseMap(int length, int width, float scale)

```

After finishing the core generation, he added _origin_ values that shift the center of the noise. To make the arguments clearer he also renamed the map dimension params:

```csharp
public float[,] CreateNoiseMap(int mapLength, int mapWidth, float scale, int originX, int originZ)
```

This signature has  more potential to be confusing, especially if we give into temptation and shorten the names to save space and keystrokes:

```csharp
public float[,] CreateNoiseMap(int mapL, int mapW, float scale, int oX, int oZ)
```

At least we've got `scale` to break up the two pairs on `int`s, but it's all numbers, and if you're not using an IDE that lists every argument name, or are like me and turned that off because it's annoying, you're likely to get them messed up:

```csharp

mapGenerator.CreateNoiseMap(1000, 1000, 100f, 10, 10); // What are these values?!
```

## Refactoring to Tuples

That _Clean Code_ book or a object orienteer might tell us to make a new class to hold these params like `NoiseMapOptions` or maybe a couple more potentially reusable ones like `MapDimensions2d` and `OriginPoint`.

Having a dedicated "parameter container class" has its place, but is best when something outside of code does the populating (like a web request or messaging framework). Here, we are only using them in `CreateNoiseMap`, and calling it ourselves. Writing out parameter classes and then newing them up just to pass them in is too much work.

Instead, we can tuple:

```csharp
public float[,] CreateNoiseMap((int width, int length) dimensions, float scale, (int x, int z) origin)
```

This signature isn't any smaller, but our number pairs are now logically grouped. Those extra parentheses make it less likely to jumble values when calling the method. Even better, this might encourage using well-named tuples outside the method, instead of passing in variables or values.

### Before:

```csharp
var originX = 10;
var originY = 10;

mapGenerator.CreateNoiseMap(1000, 1000, 100f, originX, originY);
```

### After:

```csharp
var dimensions = (1000,1000);
var noiseOrigin = (10, 10);

mapGenerator.CreateNoiseMap(dimensions, 100f, noiseOrigin);
```

A solution like this may be a six egg omelet to half a dozen donuts -style preference, but refactoring away from many same-typed args is the important part. And we can always come back and refactor our tuples into types / classes if the need presents; for example if the caller of `mapGenerator.CreateNoiseMap()` is _also_ passing around the map dimensions.

So next time you're about to create a parameter container for a method, or have two or three related variables, maybe consider a Tuple instead!
