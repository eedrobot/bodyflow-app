<template>
    <div class = "button-comp">
        <div class = "wrapper">
            <Button
                :label="label"
                :disabled="disabled"
                @toggle="$emit('toggle')"
                class="menu-btn"
            />
        </div> 
    </div>
</template>

<script setup>
import Button from '@/components/ui/Button.vue'

defineProps({
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['toggle'])
</script>

<style lang="scss" scoped>
    .button-comp {
        background: $color-lgreen;
        .wrapper {
            padding: 2rem 2rem 3rem 2rem;
        }
    }

    @media (max-width: 991.98px) {
        .button-comp {
            .wrapper {
                padding: 2rem 2rem 3rem 2rem;
            }
        }
    }


     @media (max-width: 575.98px) {
        .button-comp {
            background: $color-beige-l;
            .wrapper {
                padding: 0rem 1rem 4rem 1rem;
            }
        }
    }
</style>