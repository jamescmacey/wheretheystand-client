<template>
<a :href="link" class="me-2" target="_blank" :download="saveName">
        <font-awesome-icon class="me-1" :icon="['fas', fasIconName]"></font-awesome-icon>{{ fileType.toUpperCase() }}
</a>
</template>

<style scoped>
a {
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}


</style>

<script>
export default {
  name: 'DownloadLink',
  data () {
    return {
      apiRoot: "http://0.0.0.0:8000"
    }
  },
  props: {
    fileType: {
      type: String,
      default: "csv",
      validator(value) {
        // The value must match one of these strings
        return ['csv','json', 'xlsx'].includes(value)
      }
    },
    resourceType: {
      type: String,
      validator(value) {
        // The value must match one of these strings
        return ['vote', 'bill'].includes(value)
      }
    },
    resourceId: {
      type: String
    },
    friendlyName: {
      default: null
    }
  },
  computed: {
    fasIconName () {
      if (this.fileType == 'csv') {
        return 'file-csv'
      } else if (this.fileType == 'json') {
        return 'file-code'
      } else if (this.fileType == 'xlsx') {
        return 'file-excel'
      }
    },
    link () {
      switch (this.fileType) {
        case "csv":
          switch (this.resourceType) {
            case "vote":
              return this.apiRoot + "/api/votes/" + this.resourceId + "?df=csv"
          } 
        case "xlsx":
          switch (this.resourceType) {
            case "vote":
              return this.apiRoot + "/api/votes/" + this.resourceId + "?df=xlsx"
          } 
        case "json":
          switch (this.resourceType) {
            case "vote":
              return this.apiRoot + "/api/votes/" + this.resourceId + "?format=json"
            case "bill":
              return this.apiRoot + "/api/bills/" + this.resourceId + "?format=json"
          } 
      }
    },
    saveName () {
      if (!this.friendlyName) {
        return this.resourceType + "_" + this.resourceId + "." + this.fileType
      } else {
        return this.friendlyName + "_" + this.resourceId + "." + this.fileType
      }
    }
  }
}
</script>
