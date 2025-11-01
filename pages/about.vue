<script setup lang="ts">
const value = `## What is WhereTheyStand?
WhereTheyStand aims to aggregate key data about New Zealand's politicians, Parliament, and political parties.

## Historical reach
Information on WhereTheyStand goes back as far as the 51st Parliament (2014-2017). Members of Parliament who were members of that or any subsequent parliamentary terms have profiles on WhereTheyStand.

## Site development
WhereTheyStand is a personal side project.  I started it when I was in my first year of university in 2020, and have been slowly working on it in my free time ever since.  I aim to keep it completly apolitical; editorial annotations to substantive content will be made rarely and with substantial disclosure.

If you would like to support the development of WhereTheyStand, please consider supporing me on [Buy Me A Coffee](https://www.buymeacoffee.com/jamescmacey).

## Acknowledgements and inspiration
First, great Parliamentary monitoring sites overseas have given me a lot of ideas and inspiration for WhereTheyStand. [TheyWorkForYou](https://www.theyworkforyou.com/) is a great site built by the mySociety charity in the UK. It sets a gold standard for sites like these and I can only hope to get there with WhereTheyStand one day.

Secondly, the data and information that is presented on WhereTheyStand comes from a wide range of organisations. They are not affiliated with WhereTheyStand, but public information they provide is used on WhereTheyStand:
* Information about bills, votes, members' expenses and financial interests comes from the Office of the Clerk of the House of Representatives.
* Substantive bill content comes from the Parliamentary Counsel Office.
* Ministers' expenses come from the Department of Internal Affairs.
* Links to company details in financial interests are provided by the Companies Office through the Ministry of Business, Innovation and Employment.
* Party name and registration information comes from the Electoral Commission.
* Electorate boundaries and geographic statistics come from Stats NZ, the Representation Commission and the Electoral Commission.
`
</script>

<template>
<div>
    <PageHeader pageTitle="About WhereTheyStand"></PageHeader>
<UContainer class="my-8">
    <UCard variant="subtle">
        <MDC :value="value"/>
    </UCard>
    
</UContainer>

</div>
</template>

