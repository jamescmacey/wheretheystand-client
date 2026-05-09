---
title: Updates to WhereTheyStand
description: Copyright and privacy terms for using WhereTheyStand.
date: 2026-04-25
---

## What happened
When I first started working on this website in 2020, I was a university student with a lot of free time.  As my studies drew to a close so too did my free time diminish, and since graduating and starting a real job, that diminution has only intensified.

Over that time a few other things have changed.  Significantly, Parliament has also improved its website, with the result that:
* the "value add" of WhereTheyStand in its old form was less because Parliament's website became easier to use; and
* several of the integrations I had written back in 2020 to pull data from the Parliament website no longer work.

The latter factor has meant that bill and vote information on WhereTheyStand hasn't been updated in over a year

Fortunately, in that time there have been enormous advances in generative artificial intelligence (GenAI). Now, major feature improvements to WhereTheyStand can be achieved in much less time.  Over the summer of 2025–2026, and the first four months of 2026, I have been able to use GenAI to make the most of the limited free time I have available. 

## Changes so far

### Financial information
Ministerial, parliamentary and election expenses have been temporarily removed.  However ministers' credit card statement files are now shown in their profile.

### Source documentation
Where possible I am now adding source material to the website in addition to the relevant information itself.  For example, the dates attached to new members of Parliament's terms are now supported with a direct link to the *New Zealand Gazette* notice declaring them elected or declaring that their seat has become vacant.

### Electorate maps
For a very brief period in 2023, WhereTheyStand showed maps of each electorate however that quickly broke.  Those are now back and the way they are stored is much more flexible, to accommodate for future boundary changes.

### Profile pictures
I had not updated members' profile pictures on this site since I originally launched it.  This is because it is a manual and time-consuming process: first, suitable pictures have to be identified (taking into account both visual utility and licensing factors); secondly, they have to be cropped; thirdly they must be uploaded and information about their licensing added to their database entry.  

### Technical changes
#### Replatforming
The old Django backend and database are gone.  The new backend is still built on Django but the models have been refactored and the backend has been designed for a decoupled frontend from day one.  Hopefully the backend is faster and will be easier to maintain.  The old backend had become a bit of a graveyard.

#### Layout refresh
The "second generation" WhereTheyStand version that preceded this version was a single-page application built on Nuxt 3 and used Bootstrap as its CSS library.  It was an improvement on the traditional, server rendered site that preceded it but still had room for improvement.  It was usable but lacked many quality-of-life features. 

Like the second generation, this version is also built on Nuxt (version 4 this time) but now uses the NuxtUI library.  That has made it easier to achieve consistency across the site and is particularly useful when working with Cursor.  

#### Deployment
Rather than both the frontend and backend being deployed on a single virtual machine, the frontend is now deployed as a Cloudflare Worker and the backend in a Docker container (currently in a virtual machine, but now much more easily moved).  Hopefully this improves reliability.

## What will change
### Election results
As I mentioned above, I've previously provided results websites for by-elections.  The tricky thing with these has been integrating them with the existing WhereTheyStand database.  

### Financial data

### Ministerial diaries
I would also like to explore adding copies of ministers' diaries to this site and, further, extracting their information with the help of artificial intelligence. 
