<template>
  <div class="goal-toggle">
    <input type = "button"
      class="btn gender-btn"
      :class="{ active: value === 'loss' }"
      @click="emitGoal('loss')"
      :value = "t('result.loss')"
    />

    <input
      class="btn gender-btn"
      :class="{ active: value === 'maintenance' }"
      @click="emitGoal('maintenance')"
      type="button"
      :value = "t('result.maintenance')"
    />

    <input
      class="btn gender-btn"
      :class="{ active: value === 'gain' }"
      @click="emitGoal('gain')"
      type="button"
      :value = " t('result.gain')"
    />
  </div>
</template>

<script setup>
    const props = defineProps({
    value: { type: String, required: true }, // 'loss' | 'maintenance' | 'gain'
    })

    const emit = defineEmits(['change'])

    const { t } = useI18n()

    function emitGoal(goal) {
    // чтобы не слать лишние события
    if (props.value === goal) return
    emit('change', goal)
    }
</script>
<style lang="scss" scoped>
  .goal-toggle {
    display: contents;
    .gender-btn {
      min-width: 167px;
      &.active {
        background: $color-orange-gr;
      }
      &:hover {
        background: $color-sb;
      }
      &:first-child {
        border-radius: $b-r 0 0 $b-r;
        @include border-sides((right), $color-mg-2);
      }
      &:nth-child(2) {
        border-radius: 0;
      }
      &:last-of-type {
        border-radius: 0 $b-r $b-r 0;
        @include border-sides((left), $color-mg-2);
      }
    }
  }

   @media (max-width: 991.98px) {
      .goal-toggle {
        .gender-btn {
          flex: 0;
          min-width: 65vw;
          margin-bottom: 1rem;
          &:first-child,
          &:nth-child(2),
          &:last-of-type {
            border-radius: $b-r;
            border: none;
          }
        }
      }
    }
    @media (max-width: 575.98px) {
      .goal-toggle {
        .gender-btn {
          min-width: 100%;
          margin-bottom: 1rem;
          &:first-child,
          &:nth-child(2),
          &:last-of-type {
            border-radius: $b-r;
            border: none;
          }
        }
      }
    }
</style>

