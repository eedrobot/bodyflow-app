<template>
  <div class="tabs">
    <button
      v-for="(tab, idx) in tabs"
      :key="idx"
      :class="['btn','tab-btn', { active: active === idx }]"
      type="button"
      @click="emit('change', idx)"
    >
      {{ tab }}
    </button>
  </div>
</template>

<script setup>
const { tabs, activeTab } = defineProps({
  tabs: { type: Array, required: true },
  active: { type: Number, default: 0 },
})
const emit = defineEmits(['change'])
</script>
<style lang="scss" scoped>
 .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 1.5rem;
    
    .tab-btn {
        min-width: auto;
        &.active {
          background: $color-orange-gr;
        }
        &:hover {
          background: $color-sb;
          color: $color-white;
        }
    }
}
 @media (max-width: 575.98px) {
  .tabs {
    justify-content: center;
    .tab-btn {
        border-radius: 50%;
        min-width: 50px;
        width: 65px;
        min-height: 50px;
        height: 65px;
    }
  }
 }
</style>