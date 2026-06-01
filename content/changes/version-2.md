---
title: WhereTheyStand, v2
date: 2026-06-01
---

I'm pleased to share that over the last few months I have — with the help of Cursor, which wasn't around back when I initially made this site — completely rewritten WhereTheyStand.  There are some new features, some temporarily removed features, and a generally improved backend system.

I welcome feedback, corrections or bug reports: just head to the [contact](/contact) page to share these.

## New features

* **Ministerial portfolios** are now shown on person profiles.
* ***Gazette* notices** linked to a person's parliamentary office (notices of election and of vacancy) are now linked to each parliamentary term.
* **Credit card reconciliations** for members of the executive are now shown on WhereTheyStand.  These are updated as they are released by the Department of Internal Affairs.
* **Votes** now show a link to the vote in Hansard if one is available, even if the vote breakdown hasn't been added to WhereTheyStand.
* **Electorates** now have a map of the recent boundaries.
* **Financial and other interests** now let you view previous returns, not just the most recent one.
* **Source information** is now more readily accessible.  For example, financial interests now contain a link to view the original PDF disclosure, as do *Gazette* notices.

And, in the back:
* I've made it easier for me to ingest new information, so that every update doesn't require a command line script or manual changes to several rows in the database.  This should lead to more prompt updates.
* Automatically updating information (like bills and votes) is now updated by a queue-based system (Celery on Redis), rather than scripts and cron jobs which had a tendency to crash the site if they went on too long.

## Temporarily removed features

* **Photos** for members of Parliament have, in the majority of cases, been removed.  It's a lot of work to find a suitable photo, check copyright and licensing requirements, then process the photo.
* **Parliamentary and ministerial expenses** (other than the credit card reconciliations) have been taken offline.  These hadn't been updated on WhereTheyStand in a few years because they hadn't been displayed with explanatory notes.  This caused some confusion and risked being misleading, because the raw numbers were presented without important context.
* **Election results** previously hosted at elections.wheretheystand.nz and other by-election-specific subdomains have been taken away.
* **Votes** are still not updating.  Parsing these has proven to be tricky.  That said, I am making good progress which has allowed me to add other quality-of-life features in the meantime (like better links to Hansard, mentioned above).

## Bug fixes

Rewriting the backend has fixed a lot of niggly bugs present in the old version.  These included, as an example, members' party affiliations not properly updating if they became independent.