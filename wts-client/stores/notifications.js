import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useNotificationsStore = defineStore('notifications', {
    state () {
        return {
            banners: [
                {
                    id: 0,
                    linkBehaviour: 'none',
                    title: 'New look',
                    message: 'WhereTheyStand has had a facelift! The new design is still in the early stages, so if you run into any issues, try refreshing the page. You\'re always welcome to leave feedback via the link in the footer.'
                }
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
                var state = this
                await useFetch(API_BASE + 'notifications/banners/', {
                    onResponse({ request, response, options }) {
                        this.banners = response._data
                    },
                    onResponseError({ request, response, options }) {
                    },
                    onRequestError({ request, options, error }) {
                    }
                })
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
        },
        postResponseError(response) {
            this.addToast('Error fetching resource (response)', response.status + ' ' + response._data.detail)
        }
    }
})