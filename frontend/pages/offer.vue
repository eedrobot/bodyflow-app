<template>
  <div class="terms-comp">
    <div class="wrapper">
      <h1 class="title info-pages">
        {{ t('offer.title') }}
      </h1>

      <div class="info-card">
        <div class="info-content">

          <!-- Intro -->
          <p class="info-p">
            {{ t('offer.intro') }}
          </p>

          <!-- 1 -->
          <h2>{{ t('offer.s1_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s1_li1') }}</li>
            <li>{{ t('offer.s1_li2') }}</li>
            <li>{{ t('offer.s1_li3') }}</li>
          </ul>

          <!-- 2 -->
          <h2>{{ t('offer.s2_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s2_li1') }}</li>
            <li>{{ t('offer.s2_li2') }}</li>
          </ul>

          <!-- 3 -->
          <h2>{{ t('offer.s3_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s3_li1') }}</li>
            <li>{{ t('offer.s3_li2') }}</li>
            <li>{{ t('offer.s3_li3') }}</li>
          </ul>

          <!-- 4 -->
          <h2>{{ t('offer.s4_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s4_li1') }}</li>
            <li>{{ t('offer.s4_li2') }}</li>
            <li>{{ t('offer.s4_li3') }}</li>
          </ul>

          <!-- 5 -->
          <h2>{{ t('offer.s5_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s5_li1') }}</li>
            <li>{{ t('offer.s5_li2') }}</li>
          </ul>

          <!-- 6 -->
          <h2>{{ t('offer.s6_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s6_li1') }}</li>
            <li>{{ t('offer.s6_li2') }}</li>
            <li>{{ t('offer.s6_li3') }}</li>
             <li>{{ t('offer.s6_li4') }}</li>
            <li>{{ t('offer.s6_li5') }}</li>
          </ul>

          <!-- 7 -->
          <h2>{{ t('offer.s7_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s7_li1') }}</li>
            <li>{{ t('offer.s7_li2') }}</li>
            <li>{{ t('offer.s7_li3') }}</li>
          </ul>

          <!-- 8 -->
          <h2>{{ t('offer.s8_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s8_li1') }}</li>
            <li>{{ t('offer.s8_li2') }}</li>
          </ul>

          <!-- 9 -->
          <h2>{{ t('offer.s9_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('offer.s9_li1') }}</li>
            <li>{{ t('offer.s9_li2') }}</li>
          </ul>

          <!-- 10 -->
          <h2>{{ t('offer.s10_title') }}</h2>
          <p class="info-p">
            {{ t('offer.s10_text') }}
            <br />
            <strong>{{ t('offer.s10_email_label') }}</strong>
            <a href="mailto:info@bodyflow.com.ua">
              info@bodyflow.com.ua
            </a>
          </p>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
</script>

<style lang="scss" scoped>
.wrapper {
  grid-template-areas:
    "title"
    "content";
}
</style>