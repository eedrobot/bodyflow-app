<template>
    <button 
        class="btn bright" 
        @click="$emit('toggle')"
        type = "button"
        :disabled="disabled">
        {{ label }}
    </button>
</template>

<script setup>
    defineProps({
        label: { type: String, default: '' },
        disabled: { type: Boolean, default: false },
    })
    defineEmits(['toggle'])
</script>

<style lang="scss" scoped>

</style> 