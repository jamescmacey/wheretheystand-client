<template>
    <Card>
      <h5>X (Twitter) account</h5>
      <a :href="user.profile_url" target="_blank">
        <h6><font-awesome-icon :icon="['fab', 'twitter']"></font-awesome-icon> @{{ user.username }}</h6>
      </a>
      <hr>
      <div class="row">
        <div class="col-4 text-center">
          <h3>{{ formatNumber(user.followers_count) }}</h3>
          <h6 class="text-muted text-uppercase">Followers</h6>
        </div>
        <div class="col-4 text-center">
          <h3>{{ formatNumber(user.following_count) }}</h3>
          <h6 class="text-muted text-uppercase">Following</h6>
        </div>
        <div class="col-4 text-center">
          <h3>{{ formatNumber(user.tweet_count) }}</h3>
          <h6 class="text-muted text-uppercase">Tweets</h6>
        </div>
      </div>
      <hr>
      <h6>Chart settings</h6>
      <div class="row">
        <div class="col-12 col-md-6">
          <select class="form-select col-12 mb-3" aria-label="X (Twitter) metric type" v-model="activeDataset">
            <option selected value="followers">Followers</option>
            <option value="following">Following</option>
            <option value="tweets">Tweets</option>
          </select>
        </div>
        <div class="col-12 col-md-6 mb-3">
          <select class="form-select col-12" aria-label="X (Twitter) graph type" v-model="mode">
            <option selected value="raw">Raw counts</option>
            <option value="percent_change">Percentage daily change</option>
            <option value="number_change">Numeric daily change</option>
          </select>
        </div>
      </div>
      <ScatterChart v-if="user.time_series.length" :chartData="chartData" :options="chartOptions"></ScatterChart>
      <p class="text-muted" v-if="mode === 'number_change'">Since measurements cannot be taken at exactly the same time each day, you may find that daily changes do not show as whole numbers; this is because they are calculated based on the growth over the actual interval between measurements.</p>
      <p class="text-muted">X (Twitter) changed its API access terms in 2023 which has stopped routine statistics tracking. While the future of this feature is being evaluated, it is disabled.</p>
    </Card>
</template>

<script>
import Card from './Card.vue'
import { ScatterChart } from 'vue-chart-3'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)
import { parse, format, fromUnixTime } from 'date-fns'

export default {
  name: 'TwitterUserCard',
  components: {
    Card,
    ScatterChart
  },
  props: {
    user: Object
  },
  data () {
    return {
      activeDataset: 'followers',
      mode: 'raw'
    }
  },
  methods: {
    formatNumber (number) {
      return Intl.NumberFormat('en-NZ').format(number)
    }
  },
  computed: {
    formattedDate () {
      return format(parse(this.bill.date_modified, 'yyyy-MM-dd', new Date()), 'd.M.yyyy')
    },
    displayedDataset () {
      if (this.activeDataset === 'followers') {
        return this.followersDataset
      } else if (this.activeDataset === 'following') {
        return this.followingDataset
      } else if (this.activeDataset === 'tweets') {
        return this.tweetsDataset
      } else {
        return null
      }
    },
    dailyNumberChange () {
      var data = this.displayedDataset.data
      var newData = []
      var lastTimestamp = data[0].x
      var lastValue = data[0].y
      data.forEach(datum => {
        /* Only calculate change if the gap between the last data points is more than 12 hours */
        if ((datum.x - 43200000) > lastTimestamp) {
          var change = datum.y - lastValue
          var timeDelta = datum.x - lastTimestamp
          var dailyChange = 86400000 * change / timeDelta

          newData.push({
            x: datum.x,
            y: dailyChange
          })
          lastValue = datum.y
          lastTimestamp = datum.x
        }
      })

      var dataset = {
        label: this.displayedDataset.label + ' - Numeric daily change',
        borderColor: '#58787f',
        fill: false,
        showLine: true,
        data: newData
      }
      return dataset
    },
    dailyPercentChange () {
      var data = this.displayedDataset.data
      var newData = []
      var lastTimestamp = data[0].x
      var lastValue = data[0].y
      data.forEach(datum => {
        /* Only calculate change if the gap between the last data points is more than 12 hours */
        if ((datum.x - 43200000) > lastTimestamp) {
          var change = datum.y - lastValue
          var timeDelta = datum.x - lastTimestamp
          var dailyChange = 86400000 * change / timeDelta

          newData.push({
            x: datum.x,
            y: (dailyChange / lastValue) * 100
          })
          lastValue = datum.y
          lastTimestamp = datum.x
        }
      })

      var dataset = {
        label: this.displayedDataset.label + ' - Percentage daily change',
        borderColor: '#58787f',
        fill: false,
        showLine: true,
        data: newData
      }
      return dataset
    },
    chartData () {
      if (this.mode === 'percent_change') {
        return {
          datasets: [
            this.dailyPercentChange
          ]
        }
      } else if (this.mode === 'number_change') {
        return {
          datasets: [
            this.dailyNumberChange
          ]
        }
      } else {
        return {
          datasets: [
            this.displayedDataset
          ]
        }
      }
    },
    chartOptions () {
      return {
        scales: {
          x: {
            ticks: {
              callback: function (label, index, labels) {
                return format(fromUnixTime(label/1000),"d.M.yyyy")
              }
            }
          }
        },
        elements: {
          point: {
            radius: 2
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                var label = ['', '']
                if (context.parsed.y !== null) {
                  label[0] = Intl.NumberFormat('en-NZ').format(context.parsed.y)
                }
                if (context.parsed.x !== null) {
                  label[1] = format(fromUnixTime(context.parsed.x/1000),"d.M.yyyy")
                }
                return label
              }
            }
          },
          legend: {
            display: false
          }
        }
      }
    },
    followersDataset () {
      var data = []
      this.user.time_series.forEach(x => {
        data.push({
          x: Date.parse(x.timestamp),
          y: x.followers_count
        })
      })

      var dataset = {
        label: 'Followers',
        borderColor: '#58787f',
        fill: false,
        showLine: true,
        data: data
      }

      return dataset
    },
    followingDataset () {
      var data = []
      this.user.time_series.forEach(x => {
        data.push({
          x: Date.parse(x.timestamp),
          y: x.following_count
        })
      })

      var dataset = {
        label: 'Following',
        borderColor: '#58787f',
        fill: false,
        showLine: true,
        data: data
      }

      return dataset
    },
    tweetsDataset () {
      var data = []
      this.user.time_series.forEach(x => {
        data.push({
          x: Date.parse(x.timestamp),
          y: x.tweet_count
        })
      })

      var dataset = {
        label: 'Tweets',
        borderColor: '#58787f',
        fill: false,
        showLine: true,
        data: data
      }

      return dataset
    }
  }
}
</script>

<style scoped>
</style>
