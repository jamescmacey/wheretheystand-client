// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-10-29',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  modules: [
    '@nuxtjs/algolia',
    '@pinia/nuxt',
    'nuxt-gtag',
    'nuxt-mapbox',
    '@nuxt/ui',
    '@nuxtjs/robots',
    '@nuxtjs/mdc',
    "@nuxt/image"
  ],
  css: [
    '~/assets/css/main.css',
  ],
  gtag: {
    id: 'G-WBR7239726'
  },
  algolia: {
    apiKey: process.env.ALGOLIA_SEARCH_API_KEY,
    applicationId: process.env.ALGOLIA_APPLICATION_ID,
    instantSearch: {
      theme: 'reset'
    }
  },
  mapbox: {
    accessToken: 'pk.eyJ1IjoiamFtZXNjbWFjZXkiLCJhIjoiY2xiN2VhYzVqMGE5YTN2bnhuM3l6d3pxbyJ9.CN_c4Tf7wXMtxyLKWrtvJg'
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://127.0.0.1:8000/v2/',
      apiBaseLegacy: 'https://api.wheretheystand.nz/api/',
      valueKeys: {
        startReasons: {
          e93_137: {
            statutoryProvision: "Electoral Act 1993, s 137",
            description: "Supply of list vacancy",
          },
          ge_elecorate: {
            statutoryProvision: null,
            description: "Successful constituency candidate at general election",
          },
          ge_list: {
            statutoryProvision: null,
            description: "Successful list candidate following general election",
          },
          by_electorate: {
            statutoryProvision: null,
            description: "Successful constituency candidate at by-election",
          },
        },
        endReasons: {
          e93_55_1_a: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(a)",
            description: "Non-attendance",
          },
          e93_55_1_b: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(b)",
            description: "Allegiance to foreign state",
          },
          e93_55_1_c: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(c)",
            description: "Subject or citizen of foreign state",
          },
          e93_55_1_ca: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(ca)",
            description: "Cessation of New Zealand citizenship",
          },
          e93_55_1_cb_i: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(cb)(i)",
            description: "Candidate in foreign parliamentary election",
          },
          e93_55_1_cb_ii: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(cb)(ii)",
            description: "Candidate in foreign governing body election",
          },
          e93_55_1_d: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(d)",
            description: "Serious conviction or corruption",
          },
          e93_55_1_e: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(e)",
            description: "Became public servant",
          },
          e93_55_1_ea: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(ea)",
            description: "Appointed as electoral official",
          },
          e93_55_1_f: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(f)",
            description: "Resignation",
          },
          e93_55_1_f_by: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(f)",
            description: "Resignation due to being elected as an electorate member at a by-election",
          },
          e93_55_1_fa: {
            statutoryProvision: "Electoral Act 1993, ss 55(1)(fa) and 55A",
            description: "Cessation of party membership",
          },
          e93_55_1_g: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(g)",
            description: "Election voided on petition",
          },
          e93_55_1_h: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(h)",
            description: "Death",
          },
          e93_55_1_i: {
            statutoryProvision: "Electoral Act 1993, s 55(1)(i)",
            description: "Mental disorder",
          },
          c86_18_2: {
            statutoryProvision: "Constitution Act 1986, s 18(2)",
            description: "Dissolution of Parliamentary term",
          },
          c86_17: {
            statutoryProvision: "Constitution Act 1986, s 17",
            description: "Expiry of Parliamentary term",
          },
          e93_54: {
            statutoryProvision: "Electoral Act 1993, s 54",
            description: "Close of polling day at the next general election",
          },
        },
        billStatuses: {
          unknown: {
            description: "Unknown",
            colour: "neutral"
          },
          in_progress: {
            description: "In progress",
            colour: "primary"
          },
          defeated: {
            description: "Defeated",
            colour: "error"
          },
          withdrawn: {
            description: "Withdrawn",
            colour: "warning"
          },
          passed: {
            description: "Passed",
            colour: "success"
          },
          enacted: {
            description: "Enacted",
            colour: "success"
          },
          divided: {
            description: "Divided",
            colour: "info"
          },
          lapsed: {
            description: "Lapsed",
            colour: "info"
          },
          unknown_not_current: {
            description: "Unknown / Not Current",
            colour: "neutral"
          },
          discharged: {
            description: "Discharged",
            colour: "neutral"
          },
        },
        billTypes: {
          government: {
            description: "Government bill",
          },
          members: {
            description: "Member's bill",
          },
          private: {
            description: "Private bill",
          },
          local: {
            description: "Local bill",
          }
        }
      }
    },
  },
  site: { indexable: false },
  ssr: true
})