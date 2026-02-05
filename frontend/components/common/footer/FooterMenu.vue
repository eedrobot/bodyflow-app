<template>
     <nav class="nav-footer">
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

const localePath = useLocalePath()
</script>

<style lang="scss" scoped>
.footer-menu {
    text-align: left;
    li {
        margin-bottom: 1rem;
        a {
            color: $color-green;
            &:hover {
              text-decoration: underline;
            }
        }
    }
}
</style>
