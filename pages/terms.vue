<script setup lang="ts">
const value = `## About these terms
These terms set out the copyright and privacy terms of WhereTheyStand.  By using WhereTheyStand you agree to these terms.

## Copyright
### Original content
Original content on WhereTheyStand is licensed under a [Creative Commons Attribution 4.0 International Licence](https://creativecommons.org/licenses/by/4.0/).  This excludes the source code and user interface, for which full copyright is retained.

### Third-party content
Much of the content on WhereTheyStand is not original. As a rule, you should assume that full copyright is retained in all non-original content (either by me or the original copyright holder) and ask before reuse or make enquiries which the original provider of the information.

Some content on WhereTheyStand is not original but is not subject to copyright.  This includes the actual text of bills, acts, parliamentary debates and select committee reports.

## Privacy
### For users of WhereTheyStand
When you use WhereTheyStand, some personal information about you is collected.
* When you contact WhereTheyStand using the contact form, your name and contact information is collected.  This is so that WhereTheyStand can contact you regarding your query.
* When you access any resource on WhereTheyStand, basic details about your browser and network are collected.  This is so that limited system resources can be protected from abuse and misuse, and to produce aggregated insights into how users access WhereTheyStand.
* When you interact with WhereTheyStand, your activity on WhereTheyStand is collected.  This is so that the user experience can be understood and improved.
* When you search for something on WhereTheyStand, your searches are collected.  This is so that search trends can be understood, and to optimise search functionality.

Some parts of WhereTheyStand have options which can be set to your preferences.  These options are stored in your web browser's local storage.  They are not sent to WhereTheyStand or any third party.

Google Analytics and Google Recaptcha are in use on WhereTheyStand. You may wish to familiarise yourself with Google's privacy policies.

### For members of Parliament
Information about members of Parliament is collected from a wide variety of sources. 

#### Companies
WhereTheyStand accesses the New Zealand Business Number (NZBN) service to match your pecuniary and other interests in companies to those companies' Companies Office records. To ensure accuracy, the company name must match the listing on the Register of Members' Pecuniary and Other Specified Interests exactly.

#### Matching voting records
When WhereTheyStand updates voting records, it interprets the vote record listed in Hansard on the Parliament website. Hansard only records your surname (and first initial, if necessary) against a voting position. WhereTheyStand must then match this to your profile on WhereTheyStand.

Numerous safeguards are in place to ensure the accuracy of this matching. First, names are only matched against a pool of people who were members of Parliament and who had voting rights on the day of the vote (ie they had been sworn in). Secondly, a vote cannot match to a member if another vote has already done so for that vote. Finally, after all the individual votes are matched, the totals for each position (ayes, noes, abstentions) are checked against the totals reported by Hansard. These must match for the vote to appear on WhereTheyStand.

If you find that you are listed as voting in a way contrary to the way you actually voted, first check that the original Hansard accurately records your position. If it does, and it is still wrong on WhereTheyStand, please get in touch to correct this.

### For political parties
WhereTheyStand operates a party communication archive, called Venus, which stores all subscriber emails your party sends to it. In the future this archive will be public.

In the event that an email containing personal information is inadvertently sent, that email may show on WhereTheyStand — if this is the case, please get in touch and this will be manually edited out.

No edits will be made where they do not relate to privacy, safety, or compliance with the law.
`
</script>

<template>
<div>
    <PageHeader pageTitle="Terms"></PageHeader>
<UContainer class="my-8">
    <UCard variant="subtle">
        <div class="-mt-8">
        <MDC :value="value"/>
        </div>
    </UCard>
    
</UContainer>

</div>
</template>

