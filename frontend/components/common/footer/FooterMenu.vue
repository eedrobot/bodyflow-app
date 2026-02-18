<template>
     <nav class="nav-footer">
      <h3>{{ t('footer.info') }}:</h3>
      <ul class = "footer-menu">
        <li v-for="page in menuPagesFooter" :key="page.key">
          <NuxtLink :to="localePath(page.routeName)">
            {{ $t(page.titleKey) }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
</template>

<script setup>
import { menuPagesFooter } from '@/utils/menuPagesFooter.js'
const { t } = useI18n()

const localePath = useLocalePath() 
</script>

<style lang="scss" scoped>

</style>
