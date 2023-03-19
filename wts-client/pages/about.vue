<template>
  <div>
  <PageHeader pageTitle="About WhereTheyStand"></PageHeader>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <Card>
          <h4>WhereTheyStand aims to aggregate key data about New Zealand's politicians, Parliament, and political
            parties.</h4>

          <h5>Historical reach</h5>
          <p>Information on WhereTheyStand goes back as far as the 51st Parliament (2014-2017). Members of Parliament
            who were members of that or any subsequent parliamentary terms have profiles on WhereTheyStand.</p>

          <h5>Site development</h5>
          <p>WhereTheyStand is a personal side-project by me, James Macey. I am a fourth-year law and commerce student
            at Victoria University of Wellington, and
            I work on this site when I have free time. I aim to keep
            WhereTheyStand completly apolitical; editorial annotations to substantive content will be made rarely and
            with substantial disclosure.</p>
          <p>Most of the funding for running WhereTheyStand comes from me. Of course, I've taken steps to keep costs
            down, including by utilising student discounts I have access to, and reserving cloud capacity ahead of time.
            Nevertheless, there are substantial
            yearly costs to keep the site online, in the region of NZD $400 to NZD $500.
          </p>
          <ExternalLinkButton link="https://www.buymeacoffee.com/jamescmacey">If you really like this site, please
            consider buying me a hot choccy!</ExternalLinkButton>

          <h5>Acknowledgements and inspiration</h5>
          <p>First, great Parliamentary monitoring sites overseas have given me a lot of ideas and inspiration for
            WhereTheyStand. <ExternalLinkInline link="https://www.theyworkforyou.com/">TheyWorkForYou
            </ExternalLinkInline> is a great site built by the mySociety charity in the UK. It sets a gold standard for
            sites like these and I can only hope to get there with WhereTheyStand one day.</p>
          <p>Secondly, the data and information that is presented on WhereTheyStand comes from a wide range of
            organisations. They are not affiliated with WhereTheyStand (save for some API access agreements), but public
            information they provide is used on WhereTheyStand:
          <ul>
            <li><strong>Office of the Clerk of the House of Representatives</strong>: Bill data, Hansard (Parliamentary
              debates and votes), Register of Members' Pecuinary and Other Interests, MPs' expenses, MPs' email
              addresses</li>
            <li><strong>Parliamentary Counsel Office</strong>: Substantive bill content</li>
            <li><strong>Department of Internal Affairs</strong>: Ministers' expenses</li>
            <li><strong>Ministry of Business, Innovation and Employment</strong>: Companies Register information</li>
            <li><strong>Electoral Commission</strong>: Party name and registration information</li>
            <li><strong>Stats NZ, the Representation Commission and the Electoral Commission</strong>: Electorate
              boundaries and geographic statistics</li>
            <li><strong>Twitter</strong>: MP and Party Twitter account statistics</li>
          </ul>
          </p>
          <p>Thirdly, lots of open source software has been used in the creation of WhereTheyStand and this needs to be
            acknowledged to fulfil licensing obligations.</p>
        </Card>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import ExternalLinkButton from '~/components/ExternalLinkButton.vue'
import ExternalLinkInline from '~/components/ExternalLinkInline.vue'

export default {
  name: 'About',
  components: ['ExternalLinkInline', 'ExternalLinkButton']
}
</script>