<template>
  <!-- Decorative: the wordmark, the navbar title or a nav label always names
       the site or the page next to it, so a screen reader gains nothing here. -->
  <img
    src="/favicons/apple-touch-icon.png"
    alt=""
    aria-hidden="true"
    width="180"
    height="180"
  >
</template>

<script setup lang="ts">
/**
 * The arch mark on its own, for places too narrow for `AppLogo`.
 *
 * The favicon is the only raster of the mark in the repo; it is the same
 * artwork, at 180px, so it stays crisp at the sizes used here. Callers set the
 * size, as they do for `AppLogo`.
 */
</script>
