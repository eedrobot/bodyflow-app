<template>
    <p class = "notation">
        <slot></slot>
    </p>
</template>
<script setup>
</script>

<style lang="scss" scoped>
    .notation {
        color: $color-dg;
        font-size: $fs-small;
        margin-top: 1rem;
    }
</style>