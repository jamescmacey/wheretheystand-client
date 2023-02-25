<template>
  <div class="container">
      <div class="row mt-3">
        <div class="col-12">
          <h4 v-if="leaders && leaders.length == 1">{{ party.party_leader_role }}</h4>
          <h4 v-else-if="leaders && leaders.length > 1">{{ party.party_leader_role_plural }}</h4>
          <Card v-if="leaders && leaders.length >= 1">
            <PersonList :people="leaders">
          </PersonList>
          </Card>
          <h4 v-if="members && members.length == 1">Member</h4>
          <h4 v-else-if="members && members.length > 1">Members</h4>
          <Card v-if="members && members.length >= 1">
            <PersonList :people="members">
          </PersonList>
          </Card>
          
        </div>
      </div>
    </div>
</template>

<script>
import { usePartiesStore } from '../../../stores/parties'

export default {
  name: 'PersonHome',
  setup() {
    const partiesStore = usePartiesStore()

    return { partiesStore }
  },
  created () {
    this.partiesStore.fetchMembers(this.$route.params.id)
    this.partiesStore.fetchLeaders(this.$route.params.id)
  },
  computed: {
    members () {
      var members = this.partiesStore.membersByIdentifier(this.$route.params.id)
      if (members === undefined) {
        members = []
      }
      return members.filter(member => {
        if (this.leaders.find(leader => (leader.id == member.id)) === undefined) {
          return true
        } else {
          return false
        }
      })
    },
    leaders () {
      return this.partiesStore.leadersByIdentifier(this.$route.params.id)
    },
    party () {
      return this.partiesStore.byIdentifier(this.$route.params.id)
    },
  }
}
</script>

<style scoped>

</style>
