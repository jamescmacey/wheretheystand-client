<template>
  <div>
    <PageHeader pageTitle="Copyright and Privacy"></PageHeader>
    <div class="container">
      <div class="row mt-3">
        <div class="col-12">
          <h4>Copyright</h4>
          <Card>
            <h5>Original content</h5>
            <p>Original content on WhereTheyStand is licensed under a <ExternalLinkInline link="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International Licence.</ExternalLinkInline></p>
            <p>This excludes the interactive election results available at <ExternalLinkInline link="https://election.wheretheystand.nz">election.wheretheystand.nz</ExternalLinkInline> and at <ExternalLinkInline link="https://tauranga.election.wheretheystand.nz">tauranga.election.wheretheystand.nz</ExternalLinkInline>. While the election results themselves are not subject to copyright, and the mapping contained in the interactive maps belongs to another copyright holder, copyright is retained in the election results interface.</p>
          
            <h5>Third-party content</h5>
            <p>Much of the content on WhereTheyStand is not original. As a rule, you should assume that full copyright is retained in all non-original content (either by me or the original copyright holder) and ask before reuse.</p>
            <p>Note that some official information (such as Hansard) does not attract any copyright. This means that the work is not even licensed under the Creative Commons licence; it is free to use without any attribution. You should check this before reusing information.</p>
          </Card>
          <h4>Privacy</h4>
          <Card>
            <h5>Privacy for the public</h5>
            <p>
              When you use WhereTheyStand, some personal information about you is collected.
              <Grid class="mt-2" 
              :columns="['Information','When you...','So that...']"
              :rows="
                [
                  [
                    'Your name and contact information',
                    'provide it when you complete a feedback or correction form',
                    'you can be contacted regarding your query.',
                  ],
                  [
                    'Basic details about your browser and network',
                    'access any resource on WhereTheyStand',
                    'limited system resources can be protected from abuse and misuse, and to produce aggregated insights into how users access WhereTheyStand.',
                  ],
                  [
                    'Your activity on WhereTheyStand',
                    'interact with WhereTheyStand',
                    'the user experience can be understood and improved',
                  ],
                  [
                    'Your searches on WhereTheyStand',
                    'search for something',
                    'search trends can be understood, and to optimise search functionality',
                  ],
                  [
                    'Your Hansard reader (coming soon) settings',
                    'change the default settings in the Hansard reader',
                    'they can be automatically set each time you browse Hansard',
                  ],
                ]
              "
              ></Grid> 
              You have the right to correct and access any personal information held about you. However, in the vast majority of cases, identifying you from this information will not be possible; as a result, you won't be able to access or correct this information.
            </p>
            <p>Google Analytics and Google Recaptcha are in use on WhereTheyStand. You may wish to familiarise yourself with Google's privacy policies.</p>
            <p>Hosting providers for WhereTheyStand hold your information on behalf of WhereTheyStand. Most information is held by Microsoft in Australia.</p>
            <p>Occasionally, personal information about you may be contained in Hansard, the written record of Parliamentary debates. This is then republished on WhereTheyStand. Even if this information is wrong, it cannot and will not be corrected. Republished Hansard is a true copy of a document published under the authority of the House and cannot be the subject of a defamation proceeding.</p>
            <h5>Privacy for Members of Parliament</h5>
            <p>Information about Members of Parliament is collected from a wide variety of sources</p>
            <h6>Companies Register matching</h6>
            <p>WhereTheyStand also accesses the NZBN API to match your pecuniary and other interests in companies to those companies' Companies Register records. To ensure accuracy, the company name must match the listing on the Register of Members' Pecuniary and Other Specified Interests exactly.
            </p>
            <h6>Individual (personal or split-party) vote records</h6>
            <p>
              When WhereTheyStand updates vote records, it interprets the vote record listed in Hansard on the Parliament website. Hansard only records your surname (and first initial, if necessary) against a voting position. 
              WhereTheyStand must then match this to your profile on WhereTheyStand.
            </p> 
            <p>
              Numerous safeguards are in place to ensure the accuracy of this matching. First, names are only matched against a pool of MPs who were Members of Parliament and who had voting rights on the day of the vote (i.e. had been sworn in). Secondly, a vote cannot match to an MP if another vote has already done so for that vote. Finally, after all the individual votes are matched, the totals for each position (ayes, noes, abstentions) are checked against the totals reported by Hansard. These must match for the vote to appear on WhereTheyStand.
            </p>
            <p>
              If you find that you are listed as voting in a way contrary to the way you actually voted, first check that the original Hansard accurately records your position. If it does, and it is still wrong on WhereTheyStand, please get in touch to correct this.
            </p>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Terms',
}
</script>