<template>
    <div>
      <div :style="{ backgroundImage: gradient }">
        <UContainer class="py-12 text-inverted dark:text-default">
            <h1 class="text-4xl font-semibold">{{ pageTitle }}</h1>
            <h2 class="text-2xl font-semibold mt-2" v-if="pageSubtitle">{{ pageSubtitle }}</h2>
            <h3 class="text-sm mt-2" v-if="pageDate">{{ formatDate(pageDate) }}</h3>
        </UContainer>
        <div class="bg-accented/70">
                <UContainer>
                    <div v-if="$slots.search" class="py-4">
                        <slot name="search" class="w-full" />
                    </div>
                    <UNavigationMenu v-else-if="items.length > 0" :items="items" variant="link" highlight color="neutral"/>
                </UContainer>
        </div>
        <div v-if="backLink" class="bg-accented/70">
          <UContainer>
            <UButton :to="backLink" class="text-sm" icon="i-lucide-arrow-left" color="neutral" variant="link" as="link" :ui="{ root: '!p-0' }">{{ backText }}</UButton>
          </UContainer>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { harmonizeColourPair } from '~/utils/colourHarmony'
  import { format, parse } from 'date-fns'
  
  export default {
    name: 'PageHeader',
    props: {
      pageTitle: String,
      pageSubtitle: String,
      pageDate: String,
      image: String,
      colour: String,
      secondaryColour: String,
      pageLinks: {
        type: Array,
        default: () => { return [] }
      },
      backLink: {
        type: String,
        default: null,
      },
      backText: {
        type: String,
        default: "Go back"
      },
      searchBar: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      harmony: function () {
        return harmonizeColourPair(this.colour, this.secondaryColour)
      },
      gradient: function () {
        return `linear-gradient(230deg, ${this.harmony[1]} 0%, ${this.harmony[0]} 50%)`
      },
      items: function () {
        return this.pageLinks.map(link => ({
          label: link.name,
          to: link.to,
          exact: true,
          disabled: Boolean(link.disabled)
        }))
      }
    },
    methods: {
      formatDate(date) {
        return format(parse(date, 'yyyy-MM-dd', new Date()), 'd MMMM yyyy')
      }
    }
  }
  </script>