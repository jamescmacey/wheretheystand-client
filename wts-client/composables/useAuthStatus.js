import { ref } from 'vue'
import { PassageUser } from '@passageidentity/passage-elements/passage-user'

export function useAuthStatus(){
  const isLoading = ref(true)
  const isAuthorized = ref(false)
  const username = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const webauthnDevices = ref(null)

  try {
    new PassageUser().userInfo().then(userInfo => {
      if(userInfo === undefined){
          isLoading.value = false
          return
      }
      username.value = userInfo.email ? userInfo.email : userInfo.phone
      isAuthorized.value = true
      isLoading.value = false
      firstName.value = userInfo.user_metadata.first_name
      lastName.value = userInfo.user_metadata.last_name
      webauthnDevices.value = userInfo.webauthn_devices
  })
  } catch {
    isLoading.value = false
  }
  
  return {
    isLoading,
    isAuthorized,
    username,
    firstName,
    lastName,
    webauthnDevices
  }
}