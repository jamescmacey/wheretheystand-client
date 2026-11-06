---
title: Elections
date: 2026-11-06
---

I've now published the [elections](/elections) pages to this site.  On election nights, the dashboard functions as a live platform where results are streamed as they are released.  After elections, you will be able to view results in much the same way.  The intention is to retain two versions of results for each election: preliminary results (as they were released on election night) and final results (after the official count, including special declaration votes).

For those interested: live results are delivered using Google Cloud Firestore, which I've found to be the easiest way to ensure scalable realtime delivery of results.  During election night, several scripts pull results from the official feed and upload results into Firestore.  Archived results are published as static files.

As a result of this development there's been one slight change to the [privacy terms](/terms) of WhereTheyStand.  That's because there is a new feature to help you find voting places near to your current location.