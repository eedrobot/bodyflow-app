<template>
    <div class = "menu-notation">
        {{ t('menu.menu_notation') }}
    </div>
</template>
<script setup>
const { t } = useI18n()
</script>
<style lang = "scss" scoped>
    .menu-notation {
        color: #555;
        font-size: 0.8rem;
        margin-top: 1rem;
    }
</style>
