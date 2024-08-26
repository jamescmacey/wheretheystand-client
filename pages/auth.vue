<template>
    <div>
        <div class="container">
            <div class="row mt-3">
                <div class="d-flex justify-content-center">
                <div class="col-xl-4 col-lg-5 col-12">
                    <Card>
                        <ClientOnly>
                        <div class="authContainer">
                            <passage-auth :app-id="'RqTRCEafMhvh0y4p1LqTMQyB'"></passage-auth>
                        </div>
                        </ClientOnly>
                    </Card>
                    <p class="mt-0">
                    <span class="text-muted">There are currently no public features that require signing in. Inclusion of an authentication platform exists, at this stage, for administrative purposes only.</span>
                </p>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
passage-auth {
  /* Passage Container Styles */
  --passage-container-background: transparent;
  --passage-container-background-color: #ffffff;

  --passage-container-max-width: 500px;
  --passage-container-margin: auto;
  --passage-container-padding: 10px 10px 0px;
  --passage-error-color: #ff0000;

  /* Body Font Styles */
  --passage-body-font-family: 'Open Sans', sans-serif;
  --passage-body-font-size: 16px;
  --passage-body-font-weight: 400;
  --passage-body-text-color: #000;

  /* Header Font Styles */
  --passage-header-font-family: 'Mulish', 'Open Sans', sans-serif;
  --passage-header-font-weight: 700;
  --passage-header-text-color: #000;
  --passage-header-font-size: 32px;

  /* Button Styles */
  --passage-button-font-size: 16px;
  --passage-button-font-weight: 400;
  --passage-button-width: 50%;
  --passage-button-border-radius: 0px;

  /* Color Palette */
  --passage-onprimary-color: #fff; /* text color on primary control background */
  --passage-primary-color: #58787f; /* main color used for controls */

  --passage-onhover-color: #fff;
  --passage-hover-color: #4d4d4d;

  --passage-onactive-color: #fff;
  --passage-active-color: #6b6b6b;

  /* Email and Phone Input Box Styles */
  --passage-control-border-radius: 0px;
  --passage-control-border-color: #dbdbdb;
}
</style>
  
<script>
export default {
    name: 'Auth'
}
</script>