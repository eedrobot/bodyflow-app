<template>
  <div class="tabs">
    <button
      v-for="(tab, idx) in tabs"
      :key="idx"
      :class="[
        'btn',
        'tab-btn',
        {
          active: active === idx,
          locked: isLocked(idx)
        }
      ]"
      type="button"
      @click="handleClick(idx)"
    >
      {{ tab }}
      <span v-if="isLocked(idx)" class="lock-icon">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path
            d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zm-6 7.73V18h2v-1.27a2 2 0 1 0-2 0zM10 9V7a2 2 0 1 1 4 0v2h-4z"
          />
        </svg>
      </span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  tabs: { type: Array, required: true },
  active: { type: Number, default: 0 },
  lockedTabs: { type: Array, default: () => [] }
})

const emit = defineEmits(['change', 'locked-click'])

const isLocked = (idx) => props.lockedTabs.includes(idx)

const handleClick = (idx) => {
  if (isLocked(idx)) {
    emit('locked-click', idx)
    return
  }

  emit('change', idx)
}
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 1.5rem;
}

.tab-btn {
  min-width: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: $color-dg;

  &.active {
    background: $color-orange-gr;
    color: $color-white;
  }

  &.locked {
    opacity: 0.9;
  }

  &:hover {
    background: $color-sb;
    color: $color-white;
  }
}

.lock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lock-icon svg {
  fill: currentColor;
  transition: 0.2s;
}

@media (max-width: 575.98px) {
  .tabs {
    justify-content: center;
  }

  .tab-btn {
    border-radius: 50%;
    min-width: 50px;
    width: 65px;
    min-height: 50px;
    height: 65px;
    flex-direction: column;
    gap: 2px;
  }
}
</style>