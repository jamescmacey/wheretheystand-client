<template>
    <div v-if="notificationsStore.toasts.length > 0" class="toast-container position-absolute p-3 top-0 end-0">
        <div v-for="toast in notificationsStore.toasts" :key="toast.id" class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                {{ checkError(toast) }}
                <strong class="me-auto">{{ toast.title }}</strong>
                <button type="button" class="btn-close" aria-label="Close" @click="closeToast(toast.id)"></button>
            </div>
            <div class="toast-body">
                {{ toast.message }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.toast-container {
    margin-top: 50px;
}
</style>

<script>
import { useNotificationsStore } from '../stores/notifications'


export default {
    name: 'Toasts',
    setup() {
        const notificationsStore = useNotificationsStore()
        return { notificationsStore }
    },
    methods: {
        closeToast(id) {
            this.notificationsStore.closeToast(id)
        },
        checkError(toast) {
            if (toast.error && (Object.keys(toast.error).length !== 0)) {
                throw createError(toast.error)
            }
            return ""
        }
    }
}
</script>