<template>
    <UiDropdown contentClass = "header-auth">
      <template #drop-toggle>
        <img src = "/public/icons/profile.svg" alt = "profile" class = "auth-img">
      </template>
      <template #drop-content>
        <ul class = "auth-list">
          <li>{{ t('auth.login') }}</li>
          <li>{{ t('auth.register') }}</li>
        </ul>
      </template>
    </UiDropdown>
</template>

<script setup>
import UiDropdown from '@/components/ui/UiDropdown.vue'

const { t } = useI18n()

</script>

<style lang="scss" scoped>
  :deep(.header-auth) {
      background: $color-navy-d;
      color: $color-white;
      top: 100%;
      right: 0;
      border-radius: 2rem 0 2rem 2rem;
      .auth-img {
          height: 30px;
          width: auto;
      }
    .auth-list {
      padding: 15px 20px;
      li {
        padding: 10px 0;
        font-size: 14px;
        &:hover {
          font-weight: bold;
        }
      }
    }
  }

</style>
