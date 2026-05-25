<template>
  <div class="content-container tariff-description" :class="wrapperClass">
    <h4 v-if="title">{{ title }}</h4>

    <div
      v-for="(item, idx) in items"
      :key="item.key ?? idx"
      class="tariff-item"
    >
      <img v-if="item.icon" :src="item.icon" :alt="item.title || 'icon'" />
      <p>
        <span v-if="item.title">{{ item.title }}:</span>
        {{ item.descr }}
      </p>
    </div>

    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  items: {
    type: Array,
    default: () => [],
    // ожидаем формат:
    // [{ key?: string|number, icon?: string, title?: string, descr: string }]
  },
  wrapperClass: { type: [String, Array, Object], default: '' },
})
</script>

<style lang="scss" scoped>
.content-container {
  margin: 0 0;

  h4 {
    text-align: center;
  }

  &.tariff-description {
    width: 63%;

    .tariff-item {
      @include flex(row, center, start);

      img {
        width: 100px;
      }

      p span {
        font-weight: 700;
        margin-right: 0.25rem;
      }
    }
  }
}

 @media (max-width: 991.98px) {
  .content-container {
    &.tariff-description {
      width: 100%;
      max-width: 70vw;
    }
  }
 }
  @media (max-width: 575.98px) {
   .content-container {
    &.tariff-description {
      max-width: 100%;
    }
  }
 }
</style>