<template>
  <header class="header">

    <MobileMenu />
    <!-- LOGO -->
    <div class="logo-container">
      <NuxtLink :to="localePath('index')">
        <img src="/public/img/bodyflow_logo.svg" alt="logo" class="logo-img" />
        <span>BodyFlow</span>
      </NuxtLink>

    </div>

    <!-- DESKTOP NAV -->
    <nav class="nav-header">
      <ul>
        <li v-for="page in menuPages" :key="page.key">
          <NuxtLink :to="localePath(page.routeName)">
            {{ $t(page.titleKey) }}
          </NuxtLink>
        </li>
      </ul>

    </nav> 
    <Lang />
  </header>
</template>

<script setup>
import Auth from './Auth.vue'
import Lang from './Lang.vue'
import MobileMenu from './MobileMenu.vue'
import { menuPages } from '@/utils/menuPages.js'

const localePath = useLocalePath()

</script>


<style lang="scss" scoped>
header {
  grid-area: header;
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  padding: 0 4rem;
  color: $color-navy;
  background: transparent;
  font-size: $fs-middle;

  a {
    color: $color-navy;
  }

  .nav-header {
    display: block;
    margin-left: 50px;

    ul {
      @include flex(row, center, stretch);

      li {
        margin-right: 30px;
        padding: 10px 15px;
        transition: all ease-in-out 0.2s;
        border-radius: $b-r;
        cursor: pointer;

        &:hover {
          background: $color-sb;
          color: $color-white;
        }
        a {
          transition: all ease-in-out 0.2s;
          font-size: $fs-middle;
          &:hover {
            color: $color-white;
          }
        }
      }
    }
  }

  .logo-container a {
    font-size: $fs-primary;
    @include flex(row, center, stretch);
    .logo-img {
      height: 45px;
      width: auto;
      margin-right: 5px;
    }
  }
}
@media (max-width: 991.98px) {
  header {
    .nav-header {
      display: none;
    }
  }
}

@media (max-width: 767.98px) {
  header {
    padding: 0 15px;
    .logo-container a {
      span {
        font-size: $fs-middle;
      }
      .logo-img {
        height: 30px;
      }
    }
  }
}
</style>
