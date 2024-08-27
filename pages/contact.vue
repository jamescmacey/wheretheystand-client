<template>
  <div>
  <PageHeader pageTitle="Contact"></PageHeader>
  <div class="container">
    <div class="row mt-3">
      <div class="col-12">
        <h4>How to get in touch</h4>
          <p>If you have feedback, a corrrection or want to ask a question, please use the form below.  WhereTheyStand's <NuxtLink to="/terms">Privacy and Use Terms</NuxtLink> set out the basis on which the information you provide will be used.</p>
        <Card v-if="!sentItem && error">
          <h4>Sorry, something went wrong.</h4>
          <p>Your feedback was not sent.</p>
        </Card>
        <Card v-if="!sentItem">
          <form @submit.prevent="onSubmit" >
            <label for="feedbackType" class="form-label" required>Feedback type</label>
            <div class="mb-3">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="feedbackType" id="inlineRadio1" v-model="feedbackType" value="feedback">
                <label class="form-check-label" for="inlineRadio1">Feedback</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="feedbackType" id="inlineRadio2" v-model="feedbackType" value="correction">
                <label class="form-check-label" for="inlineRadio2">Correction</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="feedbackType" id="inlineRadio3" v-model="feedbackType" value="general">
                <label class="form-check-label" for="inlineRadio3">General enquiry</label>
              </div>
            </div>
            <div class="mb-3">
              <label for="emailInput" class="form-label" required>Email address</label>
              <input type="email" class="form-control" id="emailInput" aria-describedby="emailHelp" v-model="email" :class='{"is-invalid": !emailValid}'>
              <div id="emailHelp" class="form-text">This will only be used to contact you in relation to your feedback.</div>
            </div>
            <div class="mb-3">
              <label for="linkInput" class="form-label">Page link <span class="text-muted">(optional)</span></label>
              <input type="text" class="form-control" id="linkInput" aria-describedby="linkHelp" v-model="link">
              <div id="linkHelp" class="form-text">If you're submitting a correction, please provide a link to the relevant page.</div>
            </div>
            <div class="mb-3">
              <label for="textField" class="form-label">Comments</label>
              <textarea class="form-control" id="textField" rows="5" required v-model="comments"></textarea>
            </div>
            <div class="mb-3">
              <label for="recaptcha-checkbox" class="form-label">{{ response ? 'Verified!' : 'Please confirm you aren\'t a robot.' }}</label>
              <RecaptchaCheckbox v-model="response" theme="light" id="recaptcha-checkbox " aria-describedby="recaptchaHelpBlock"/>
              <div id="recaptchaHelpBlock" class="form-text">
                The reCAPTCHA tick-box protects this form from spam and abuse. Its inclusion means that the Google
                <ExternalLinkInline link="https://links.wheretheystand.nz/google-recaptcha-privacy">Privacy Policy</ExternalLinkInline> and
                <ExternalLinkInline link="https://links.wheretheystand.nz/google-recaptcha-terms">Terms of Service</ExternalLinkInline> apply.
              </div>
            </div>
            <button :disabled="!valid" type="submit" class="btn btn-primary">Submit</button>
          </form>
        </Card>
        <Card v-else="sentItem">
          <h4>Thank you for your feedback!</h4>
          <p>Your feedback has been sent.</p>
        </Card>
      </div>
    </div>
  </div>
</div>
</template>
<style scoped>
textarea,
input,
button,
select {
    border-radius: var(--wts-card-border-radius);
}
</style>

<script>

import { useRecaptchaProvider } from 'vue-recaptcha'
import { API_BASE } from '~~/stores/config';
import ExternalLinkInline from '~/components/ExternalLinkInline.vue'

export default {
  setup () {
    const recaptcha = useRecaptchaProvider()
  },
  name: 'Contact',
  data() {
    return {
      response: "",
      feedbackType: "feedback",
      email: "",
      link: "",
      comments: "",
      sentItem: null,
      error: false
    }
  },
  computed: {
    valid() {
      if (["feedback","correction","general"].includes(this.feedbackType) && this.email && this.emailValid && this.comments && this.response) {
        return true
      } else {
        return false
      }
    },
    emailValid() {
      if (this.email) {
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email)) {
            return true
        } else {
            return false
        } 
      } else {
        return true
      }
    }
  },
  methods : {
    async onSubmit() {
      const { item } = await $fetch(API_BASE + 'feedback/', {
        method: 'POST',
        body: {
          feedbackType: this.feedbackType,
          email: this.email,
          link: this.link,
          comments: this.comments,
        },
        headers: {
          'Content-Type': 'application/json',
          'g-recaptcha-response': this.response
        }
      }).then((res) => {
        console.log(res)
        return { item: res }}
      ).catch((err) => {
        console.log(err)
        return { item: null }
      })
      this.response = ""
      if (item) {
        this.sentItem = item
        this.error = false
      } else {
        this.error = true
      }
    }
  }
}
</script>