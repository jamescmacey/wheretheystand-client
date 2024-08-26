<template>
    <div>
        <h6>{{ device.friendly_name }}</h6>
        <div class="row">
            <div class="col-12 col-md-6">
                <strong>Created:</strong> {{ relativeDate(device.created_at) }}
            </div>
            <div class="col-12 col-md-6">
                <strong>Last used:</strong> {{ relativeDate(device.last_login_at) }}
            </div>
            <div class="col-12 col-md-6">
                <strong>Used: </strong>{{ device.usage_count }} time<span v-if="device.usage_count != 1">s</span>.
            </div>
        </div>
        <hr>
    </div>
</template>

<script>
import { formatDistanceToNow, parseISO } from 'date-fns'

export default {
    name: 'WebauthnDevice',
    props: ['device'],
    methods: {
        relativeDate(date) {
            return formatDistanceToNow(parseISO(date)) + " ago"
        },
    }
}

</script>