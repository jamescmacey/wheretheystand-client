<template>
    <footer class="footer text-light">
      <div class="container">
        <div class="row">
          <div class="col-12 col-lg-4">
            <h5>Pages</h5>
            <hr />
            <ul style="list-style: none; padding-left: 0">
              <li><RouterLink class="text-light footer-link" to="/people">People</RouterLink></li>
              <li>
                <RouterLink class="text-light footer-link" to="/parties">Parties</RouterLink>
              </li>
              <li>
                <RouterLink class="text-light footer-link" to="/electorates">Electorates</RouterLink>
              </li>
              <li>
                <RouterLink class="text-light footer-link" to="/bills">Bills</RouterLink>
              </li>
              <li>
                <RouterLink class="text-light footer-link" to="/votes">Votes</RouterLink>
              </li>
            </ul>
          </div>
          <div class="col-12 col-lg-4">
            <h5>About</h5>
            <hr />
            <ul style="list-style: none; padding-left: 0">
              <li>
                <RouterLink class="text-light footer-link" to="/about">About WhereTheyStand</RouterLink>
              </li>
              <li>
                <a class="text-light footer-link" href="/feedback">Feedback</a>
              </li>
              <li>
                <a class="text-light footer-link" href="/corrections">Corrections</a>
              </li>
              <li>
                <RouterLink class="text-light footer-link" to="/terms">Copyright and Privacy</RouterLink>
              </li>
              <li>
                <ExternalLinkInline class="text-light footer-link" link="https://status.wheretheystand.nz">System status</ExternalLinkInline>
              </li>
              <li v-if="authStore.isAuthenticated && authStore.requiresSession">
                <a class="text-light footer-link" v-on:click="goToDjango()" href="#">
                  Django
                </a>
              </li>
            </ul>
          </div>
          <div class="col-12 col-lg-4">
            <h5>Social media</h5>
            <hr />
            <ul style="list-style: none; padding-left: 0">
              <li>
                <ExternalLinkInline class="text-light footer-link" link="https://twitter.com/wherestandnz">Twitter</ExternalLinkInline>
              </li>
              <Card :gradient='true'>
                <h5>Like WhereTheyStand?</h5>
                You can shout me a hot chocolate (or two).<br>
                <ExternalLinkInline class="text-light footer-link" link="https://www.buymeacoffee.com/jamescmacey">buymeacoffee.com/jamescmacey</ExternalLinkInline>
              </Card>
            </ul>
          </div>
        </div>

        <small v-if="$route.fullPath.length <= 1">
          <ExternalLinkInline class="text-light footer-link" link="https://commons.wikimedia.org/wiki/File:Beehive_and_Parliament_House_in_New_Zealand.jpg">
            Header image by Wikimedia user "Melonblob", used under CC BY-SA 4.0. Cropped and resized.
          </ExternalLinkInline>
        </small>

        <hr />
        <h4>
          <a class="footer-link text-light special-font" href="https://wheretheystand.nz">wheretheystand.nz</a>
        </h4>
      </div>
    </footer>
</template>

<style scoped>
.footer {
  margin-top: 10px;
  padding-top: 20px;
  padding-bottom: 10px;
  background-color: var(--wts-solid);
  flex-shrink: none;
}

.footer-link {
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>


<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Footer',
  setup () {
    const authStore = useAuthStore();
    return { authStore }
  },
  methods: {
    async goToDjango() {
      const sessionLink = await this.authStore.getSessionLink()
      console.log(sessionLink)
      await navigateTo(sessionLink, { external: true })
      return
    }
  }
}

</script>