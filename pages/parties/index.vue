<template>
<div>
    <PageHeader pageTitle="Parties"></PageHeader>
    <div class="container">
        <div class="row mt-3">
      
            <div class="col-12">
                <h4>Most Members of Parliament belong to a political organisation, called a party.</h4>
                <p>The number of seats a party has in Parliament is determined by the proportion of votes it receives under the party vote at each general election. If any electorate seats are won by a party's candidates, its seats first go to those candidates. Any leftover seats are then given to list candidates, who are elected according to a ranked list of candidates finalised before the election.</p>
                <p>Political parties and their funding are regulated in New Zealand by the Electoral Commission in accordance with the Electoral Act 1993.</p>
                <ExternalLinkButton link="https://elections.nz/democracy-in-nz/political-parties-in-new-zealand/">Learn more about the role of political parties in New Zealand's democracy</ExternalLinkButton>
                <p>Outside of elections, parties play an important role in Parliament and in government. Many votes cast in Parliament on proposed laws are cast as party votes, where a party casts a vote on behalf of all its member MPs. Party membership and size also determines the allocation of Parliamentary resources, like Oral Questions and Select Committee membership. It's also a major factor in deciding which party or parties form the Government, and who becomes the Prime Minister or a Minister.</p>
                
                <h5 class="mt-3">Parties with seats in Parliament</h5>
                <div class="row">
                    <div v-for="(party, i) in parties" :key="party.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
                        <PartyCard :party="party">

                        </PartyCard>
                    </div>
                </div>

                <!--
                <h5 class="mt-3">Registered parties without seats in Parliament</h5>
                <p class="mt-0">These parties are registered with the Electoral Commission, but don't have any seats in Parliament.</p>
                <div class="row">
                    <div v-for="(party, i) in outsideParties" :key="party.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
                        <PartyCard :party="party">

                        </PartyCard>
                    </div>
                </div>

                <h5 class="mt-3">Deregistered parties</h5>
                <p class="mt-0">These parties are no longer registered with the Electoral Commission and don't have seats in Parliament.</p>
                <div class="row">
                </div>-->

                <p class="text-muted">For registered parties, their registered name is shown on this page. Some parties may have adopted different names in a Parliamentary context or for marketing purposes.</p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import PartyCard from '~~/components/PartyCard.vue'
import { useGroupsStore } from '../../stores/groups'


export default {
    name: "Parties",
    setup() {
        const groupsStore = useGroupsStore();
        return { groupsStore };
    },
    created() {
        this.groupsStore.fetchParties("allInParliament");
        //this.groupsStore.fetchParties("allOutOfParliament");
    },
    computed: {
        parties() {
            return (this.groupsStore.byName("allInParliament", "parties") || []).sort((a, b) => {
                if (a.seats > b.seats) {
                    return -1;
                }
                return 1;
            });
        },
        outsideParties() {
            return (this.groupsStore.byName("allOutOfParliament", "parties") || []).sort((a, b) => {
                if (a.slug.toLowerCase() < b.slug.toLowerCase()) {
                    return -1;
                }
                return 1;
            });
        }
    },
    components: { PartyCard }
}
</script>