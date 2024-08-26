<template>
  <external-link-button :link="link">
    <font-awesome-icon :icon="['fab', iconName]"></font-awesome-icon> {{ prefix}}{{ username }}
  </external-link-button>
</template>

<script>
import ExternalLinkButton from './ExternalLinkButton.vue'
export default {
  name: 'SocialMediaLink',
  components: {
    ExternalLinkButton
  },
  props: {
    username: String,
    platform: {
      validator: function (value) {
        return ['snapchat', 'wikipedia', 'facebook', 'instagram'].indexOf(value) !== -1
      }
    }
  },
  computed: {
    iconName () {
      switch (this.platform) {
        case 'snapchat':
          return 'snapchat'
        case 'wikipedia':
          return 'wikipedia-w'
        case 'instagram':
          return 'instagram'
        case 'facebook':
          return 'facebook'
        case 'twitter':
          return 'twitter'
        default:
          return ''
      }
    },
    prefix () {
      switch (this.platform) {
        case 'snapchat':
          return ''
        case 'wikipedia':
          return ''
        case 'instagram':
          return '@'
        case 'facebook':
          return ''
        case 'twitter':
          return '@'
        default:
          return ''
      }
    },
    link () {
      switch (this.platform) {
        case 'snapchat':
          return 'https://www.snapchat.com/add/' + this.username
        case 'wikipedia':
          return 'https://en.wikipedia.org/wiki/' + this.username
        case 'instagram':
          return 'https://www.instagram.com/' + this.username
        case 'facebook':
          return 'https://www.facebook.com/' + this.username
        case 'twitter':
          return 'https://twitter.com/' + this.username
        default:
          return ''
      }
    }
  }
}
</script>

<style scoped>
</style>
