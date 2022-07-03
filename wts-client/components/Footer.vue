<template>
    <footer class="footer text-light">
      <div class="container">
        <div class="row">
          <div class="col-12 col-lg-4">
            <h5>Pages</h5>
            <hr />
            <ul style="list-style: none; padding-left: 0">
              <li><a class="a-no-format text-light" href="/people">People</a></li>
              <li>
                <a class="a-no-format text-light" href="/parties">Parties</a>
              </li>
              <li>
                <a class="a-no-format text-light" href="/bills">Bills and Votes</a>
              </li>
              <li>
                <a class="a-no-format text-light" href="/electorates">Electorates</a>
              </li>
              <li><a class="a-no-format text-light" href="/data/">Data</a></li>
            </ul>
          </div>
          <div class="col-12 col-lg-4">
            <h5>About</h5>
            <hr />
            <ul style="list-style: none; padding-left: 0">
              <li>
                <a class="a-no-format text-light" href="/docs/about">About WhereTheyStand</a>
              </li>
              <li>
                <a class="a-no-format text-light" href="/feedback">Submit feedback</a>
              </li>
              <li>
                <a class="a-no-format text-light" href="/corrections">Submit corrections</a>
              </li>
              <li>
                <a class="a-no-format text-light" href="/docs/copyright">Copyright</a>
              </li>
            </ul>
          </div>
          <div class="col-12 col-lg-4">
            <h5>Social media</h5>
            <hr />
            <ul style="list-style: none; padding-left: 0">
              <li>
                <a class="a-no-format text-light" href="https://twitter.com/wherestandnz">Twitter</a>
              </li>
              <Card :gradient='true'>
                <h5>Like WhereTheyStand?</h5>
                <p>You can shout me a hot chocolate (or two).</p>
              </Card>
            </ul>
          </div>
        </div>

        <p>
          <i><a class="a-no-format text-light"
              href="https://commons.wikimedia.org/wiki/File:Beehive_and_Parliament_House_in_New_Zealand.jpg">Header
              image by Wikimedia user "Melonblob", used under CC BY-SA
              4.0. Cropped and resized.</a></i>
        </p>

        <hr />
        <h4>
          <a class="a-no-format text-light special-font" href="https://wheretheystand.nz">wheretheystand.nz</a>
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
</style>

<script>
export default {
  name: 'Footer'
}
</script>