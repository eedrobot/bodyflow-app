<template>
    <div class = "button-comp">
        <div class = "wrapper">
            <button class="btn bright menu-btn" @click="$emit('toggle')">
            {{ label }}
            </button>
        </div>
    </div>
</template>

<script setup>
    defineProps({ label: String })
    defineEmits(['toggle'])
</script>

<style lang="scss" scoped>
    .button-comp {
        background: $color-lgreen;
        .wrapper {
            padding: 2rem 2rem 3rem 2rem;
            .menu-btn {
                display: block;
                width: 37vw;
                margin: 0 auto;
            }
        }
    }

    @media (max-width: 991.98px) {
        .button-comp {
            .wrapper {
                padding: 2rem 2rem 3rem 2rem;
                .menu-btn {
                    width: 70%;
                }
            }
        }
    }


     @media (max-width: 575.98px) {
        .button-comp {
            background: $color-beige-l;
            .wrapper {
                padding: 2rem 2rem 3rem 2rem;
                .menu-btn {
                    width: 100%;
                }
            }
        }
    }
</style>