<template>
    <div>
        <div class="row mt-3" v-if="isAuthorized">
            <div class="col-xl-6 col-lg-6 col-12">
                <h4>Authentication</h4>
                <span>You don't have a password; you log in using a passkey or a one-time code.</span>
                <Card>
                    <ClientOnly>
                        <h5>Your details</h5>
                        <strong>Email address: </strong> {{ username }}
                        <hr>
                        <ul class="property-list">
                            <li v-if="firstName.length > 1"><strong>First name: </strong>{{ firstName}}</li>
                            <li v-if="lastName.length > 1"><strong>Surname: </strong>{{ lastName }}</li>
                        </ul>
                        <h5>Passkeys</h5>
                        <WebauthnDevice v-for="device in webauthnDevices" :key="device.id" :device="device"></WebauthnDevice>
                    </ClientOnly>
                </Card>
            </div>
            <div class="col-xl-6 col-lg-6 col-12">
                <h4>Authorisations</h4>
                <span>These roles and permissions keep track of what you're allowed to do on WhereTheyStand.</span>
                <Card>
                    <ClientOnly>
                        You have no authorisations.
                    </ClientOnly>
                </Card>
            </div>
        </div>
        <div class="row mt-3" v-else-if="!isLoading && !isAuthorized">
            <div class="d-flex justify-content-center">
                <div class="col-xl-4 col-lg-5 col-12">
                    <h4>You need to sign in.</h4>
                    <Card class="text-center">
                        <NuxtLink to="/auth">Sign in <FontAwesomeIcon :icon="['fas', 'arrow-right']"></FontAwesomeIcon></NuxtLink>
                    </Card>
                </div>
                </div>
        </div>
        <div class="row mt-3" v-else>
            <div class="d-flex justify-content-center">
                <div class="col-xl-4 col-lg-5 col-12">
                    <h4>Loading...</h4>
                    <Card class="text-center">
                        <Spinner></Spinner>
                    </Card>
                </div>
                </div>
        </div>
    </div>
</template>

<style>
passage-profile {
    /* Passage Container Styles */
    --passage-container-background: transparent;
    --passage-container-background-color: #ffffff;

    --passage-container-max-width: 500px;
    --passage-container-margin: auto;
    --passage-container-padding: 10px 10px 0px;
    --passage-error-color: #ff0000;

    /* Body Font Styles */
    --passage-body-font-family: 'Open Sans', sans-serif;
    /*--passage-body-font-size: 16px;*/
    --passage-body-font-weight: 400;
    --passage-body-text-color: #000;

    /* Header Font Styles */
    --passage-header-font-family: 'Open Sans', sans-serif;
    --passage-header-font-weight: 700;
    --passage-header-text-color: #000;
    /*--passage-header-font-size: 32px;*/

    /* Button Styles */
    /*--passage-button-font-size: 16px;*/
    --passage-button-font-weight: 400;
    --passage-button-width: 50%;
    --passage-button-border-radius: 0px;

    /* Color Palette */
    --passage-onprimary-color: #fff;
    /* text color on primary control background */
    --passage-primary-color: #58787f;
    /* main color used for controls */

    --passage-onhover-color: #fff;
    --passage-hover-color: #4d4d4d;

    --passage-onactive-color: #fff;
    --passage-active-color: #6b6b6b;

    /* Email and Phone Input Box Styles */
    --passage-control-border-radius: 0px;
    --passage-control-border-color: #dbdbdb;
}
</style>

<style scoped>
.property-list {
    padding: 0;
    list-style-type: none;
}

</style>

<script>
export default {
    name: 'MePage',
    setup() {
        const { isLoading, isAuthorized, username, firstName, lastName, webauthnDevices } = useAuthStatus()
        return {
            isLoading,
            isAuthorized,
            username,
            firstName,
            lastName,
            webauthnDevices
        }
    }
}
</script>