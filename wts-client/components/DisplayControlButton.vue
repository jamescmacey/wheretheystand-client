<template>
<button>
    <h6>
        <slot></slot>
    </h6>
</button>
</template>

<script>
export default {
  name: 'DisplayControlButton'
}
</script>

<style scoped>
    button, button:focus {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        outline: inherit;
        margin-bottom: 5px;
    }
</style>
