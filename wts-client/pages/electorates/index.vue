<template>
<div>
    <PageHeader pageTitle="Electorates"></PageHeader>
    <div class="container">
        <div class="row mt-3">
      
            <div class="col-12">
                <h4>New Zealand has 72 electoral districts, commonly known as electorates.</h4>
                <p>There are 65 general electorates and 7 Māori electorates. The number, sizes, shapes, and names of these electorates are determined by the Representation Commission after each Census in accordance with requirements set out in the Electoral Act 1993. Generally, this means that the electorate boundaries are reviewed every eight years, or after every second general election.</p>
                <p>At an election, voters cast a vote for a candidate who is contesting the electorate they live in. Whichever candidate receives the most votes (a plurality) becomes that electorate's Member of Parliament. In a general election, voters also cast a vote for their preferred political party; this vote determines how the remaining seats in Parliament (usually another 48 seats) are filled.</p>
                <ExternalLinkButton link="https://vote.nz/enrolling/get-ready-to-enrol/find-your-electorate-on-a-map/" text="Find your electorate on a map"></ExternalLinkButton>
                <ExternalLinkButton link="https://elections.nz/democracy-in-nz/historical-events/boundary-review-2019-2020/" text="Learn about the 2019-2020 Electorate Boundary Review"></ExternalLinkButton>
                <p>By-elections are special, one-off elections that take place in an electorate outside the normal election cycle. These happen when an electorate MP leaves Parliament early, usually by resigning, and a new electorate MP needs to be elected to replace them. In 2020, there were two by-elections: one in Tauranga, and one in Hamilton West.</p>
                <ExternalLinkButton link="https://tauranga.election.wheretheystand.nz/" text="View Tauranga by-election results (June 2022)"></ExternalLinkButton>
                <ExternalLinkButton link="https://election.wheretheystand.nz/" text="View Hamilton West by-election results (December 2022)"></ExternalLinkButton>
                <h5 class="mt-3">Current electorates</h5>
                <div class="row">
                    <div v-for="(electorate, i) in electorates" :key="electorate.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
                        <ElectorateCard :electorate="electorate">

                        </ElectorateCard>
                    </div>
                </div>

                <h5 class="mt-3">Former electorates</h5>
                <p class="mt-0">Only electorates that have existed since 2014 have profiles on WhereTheyStand.</p> 
                <div class="row">
                    <div v-for="(electorate, i) in historicElectorates" :key="electorate.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
                        <ElectorateCard :electorate="electorate">

                        </ElectorateCard>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</div>
</template>

<script>
import ElectorateCard from '~~/components/ElectorateCard.vue'
import { useGroupsStore } from '../../stores/groups'




export default {
    name: "Electorates",
    setup() {
        const groupsStore = useGroupsStore();
        return { groupsStore };
    },
    created() {
        this.groupsStore.fetchElectorates("allCurrent");
        this.groupsStore.fetchElectorates("allHistoric");
    },
    computed: {
        electorates() {
            return (this.groupsStore.byName("allCurrent", "electorates") || []).sort((a, b) => {
                if (a.slug.toLowerCase() < b.slug.toLowerCase()) {
                    return -1;
                }
                return 1;
            });
        },
        historicElectorates() {
            return (this.groupsStore.byName("allHistoric", "electorates") || []).sort((a, b) => {
                if (a.slug.toLowerCase() < b.slug.toLowerCase()) {
                    return -1;
                }
                return 1;
            });
        },
    },
    components: { ElectorateCard }
}
</script>