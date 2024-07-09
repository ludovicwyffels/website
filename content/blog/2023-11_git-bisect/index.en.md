---
title: "Be more productive with Git bisect"
authors: [ludovicwyffels]
date: 2023-11-18T15:03:35+02:00
summary: ""
draft: false
tags:
  - "git"
categories: ["git"]
# series: ["Sécuriser git"]
---

When we're developing, we're not going to lie: we waste a lot of our time debugging.

If I had to divide up the time I spend developing, I'd do it like this:

- 30% Pure design
- 25% Design / Code writing
- 15% Testing
- 30% Debugging

If there's one area I'd like to keep to a minimum, it's debugging. Not that I don't like it, but rather that I'd like to spend more time writing code or designing my application.

One of the solutions / proposals for our problem is to progress in your language. Of course, this is absolutely true. But, whatever our level, our experience or the knowledge you have, we'll always waste time looking for where the bug might be in the code.

Git proposes to reduce this famous search time thanks to `git bisect`.

## Let the debugging begin

Git bisect is a really simple command to use. Unfortunately, this command is little known by Git users.

The principle is as follows: You tell Git that you're looking for a bug, it moves from commit to commit, you test the version and you tell it whether the bug is present in the current commit or not.

The aim is to find the first buggy commit, the one where the bug appeared. This will tell you that one of the changes made in that commit caused the bug.

Hence the importance of very small commits: the smaller your commits, the more useful the use of `git bisect` will be, as it will enable you to locate the bug more precisely in your code.

The command to start debugging is as follows:

```shell
git bisect start [bad] [good]
```

Two optional parameters are expected here. Each is a reference to a commit: it can be its hash, a tag or `HEAD`.

The first parameter is therefore a commit where you already know that the bug is present. The second is a commit that you know has no bug.

If you don't specify both parameters, you'll have to select the bad commit with a `git bisect bad [commit]` and the good commit with a `git bisect good [commit]`.

Once it knows the interval, Git moves on to another commit. You play your tests and tell Git whether they are good or bad with :

```shell
git bisect good # The commit I've just tested is good
git bisect bad # The commit I've just tested is bad
```

These are the same commands we used to define the interval to work on, but we didn't specify a commit number. Git therefore took the current commit numbers.

```text
b047b02ea83310a70fd603dc8cd7a6cd13d15c04 is first bad commit
commit b047b02ea83310a70fd603dc8cd7a6cd13d15c04
Author: PJ Hyett <pjhyett@example.com>
Date: Tue Jan 27 14:48:32 2009 -0800

    secure this thing
```

Once Git has enough information, it tells you the offending commit, the one that introduced the bug into your code as above.

## Speed

Some people may be thinking that this isn't much use. If Git just moves from one commit to the next, you can do it yourself.

If, in addition, there are hundreds of commits between the one where the bug is discovered and the one where it is introduced, you'll have a long time before you can identify the introductory commit...

But that's why Git doesn't just move on to the next commit. The real advantage of this command is that it uses dichotomy in its navigation.

If you have 1000 commits in your range to test, at the end of the first iteration `git bisect` has discarded 500 commits, at the end of the second iteration 750 commits are discarded. The search time is considerably reduced!

And it makes your life easier, because if you had to do it by hand, it would be a real pain. Between counting the commits to find the central commit of a given interval and retaining the commit hashes to test them and decide whether they are good or bad... Nobody would do it.

I think `git bisect` could well change the way you debug. What do you think about it?
