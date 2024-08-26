import { defineStore } from 'pinia'
import { API_BASE } from './config'

export const useNotificationsStore = defineStore('notifications', {
    state () {
        return {
            banners: [
            ],
            toasts: [
            ],
            loaded: false,
            toastId: 0
        }
    },
    actions: {
        async fetchNotifications() {
            var state = this
            if (!this.loaded) {
                await useFetch(API_BASE + 'banners/', {
                    onResponse({ request, response, options }) {
                        state.banners = response._data
                        state.loaded = true
                    },
                    onResponseError({ request, response, options }) {
                        state.postResponseError(response)
                    },
                    onRequestError({ request, options, error }) {
                        state.addToast('Error fetching resource (request)', error)
                    }
                })
            }
        },
        addToast(title, message, error = null) {
            this.toasts.push({
                id: this.toastId,
                title: title,
                message: message,
                error: error
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
        postResponseError(response, fatalError = false) {
            if (fatalError) {
                this.addToast('Error fetching resource (response)', response.status + ' ' + response._data.detail, { statusCode: response.status, statusMessage: response._data.detail })
            } else {
                this.addToast('Error fetching resource (response)', response.status + ' ' + response._data.detail)
            }
        }
    }
})