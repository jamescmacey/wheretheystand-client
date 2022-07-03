import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useNotificationsStore = defineStore('notifications', {
    state () {
        return {
            banners: [
            ],
            toasts: [
            ],
            loaded: true,
            toastId: 0
        }
    },
    actions: {
        async fetch() {
            if (!this.loaded) {
                const banners = await $fetch(API_BASE + 'notifications/banners/')
                this.banners = banners
            }
        },
        addToast(title, message) {
            this.toasts.push({
                id: this.toastId,
                title: title,
                message: message
            })
            this.toastId = this.toastId + 1
        },
        closeToast(id) {
            var removeIndex = this.toasts.map(item => item.id).indexOf(id)
            if (removeIndex >= 0) {
                this.toasts.splice(removeIndex, 1)
            }
        },
        closeBanner(id) {
            var removeIndex = this.banners.map(item => item.id).indexOf(id)
            if (removeIndex >= 0) {
                this.banners.splice(removeIndex, 1)
            }
        }
    }
})