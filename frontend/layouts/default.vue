<template>
  <div class="container">
    <Header />
    <main class = "main">
      <slot />
    </main>
    <Footer />
  </div>
</template>
<script setup>
import Header from '@/components/common/header/Header.vue'
import Footer from '@/components/common/footer/Footer.vue'
useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }
  ],
   meta: [
    { name: 'color-scheme', content: 'light' },
  ]
})
</script>