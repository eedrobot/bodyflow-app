<template>
  <div class="terms-comp">
    <div class="wrapper ">
      <h1 class="title info-pages">
        {{ t('terms.title') }}
      </h1>

      <div class="info-card">
        <div class="info-content">

          <!-- Intro -->
          <p class="info-p">
            {{ t('terms.intro') }}
          </p>

          <!-- 1 -->
          <h2>{{ t('terms.s1_title') }}</h2>
          <p class="info-p">{{ t('terms.s1_text') }}</p>

          <!-- 2 -->
          <h2>{{ t('terms.s2_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('terms.s2_li1') }}</li>
            <li>{{ t('terms.s2_li2') }}</li>
            <li>{{ t('terms.s2_li3') }}</li>
            <li>{{ t('terms.s2_li4') }}</li>
          </ul>

          <!-- 3 -->
          <h2>{{ t('terms.s3_title') }}</h2>
          <p class="info-p">{{ t('terms.s3_text') }}</p>
          <ul class="info-ul">
            <li>{{ t('terms.s3_li1') }}</li>
            <li>{{ t('terms.s3_li2') }}</li>
            <li>{{ t('terms.s3_li3') }}</li>
            <li>{{ t('terms.s3_li4') }}</li>
          </ul>

          <!-- 4 -->
          <h2>{{ t('terms.s4_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('terms.s4_li1') }}</li>
            <li>{{ t('terms.s4_li2') }}</li>
            <li>{{ t('terms.s4_li3') }}</li>
            <li>{{ t('terms.s4_li4') }}</li>
          </ul>

          <!-- 5 -->
          <h2>{{ t('terms.s5_title') }}</h2>
          <p class="info-p">{{ t('terms.s5_text') }}</p>
          <ul class="info-ul">
            <li>{{ t('terms.s5_li1') }}</li>
            <li>{{ t('terms.s5_li2') }}</li>
            <li>{{ t('terms.s5_li3') }}</li>
          </ul>

          <!-- 6 -->
          <h2>{{ t('terms.s6_title') }}</h2>
          <p class="info-p">{{ t('terms.s6_text') }}</p>
          <ul class="info-ul">
            <li>{{ t('terms.s6_li1') }}</li>
            <li>{{ t('terms.s6_li2') }}</li>
            <li>{{ t('terms.s6_li3') }}</li>
            <li>{{ t('terms.s6_li4') }}</li>
            <li>{{ t('terms.s6_li5') }}</li>
          </ul>

          <!-- 7 -->
          <h2>{{ t('terms.s7_title') }}</h2>
          <p class="info-p">{{ t('terms.s7_text') }}</p>
          <ul class="info-ul">
            <li>{{ t('terms.s7_li1') }}</li>
            <li>{{ t('terms.s7_li2') }}</li>
            <li>{{ t('terms.s7_li3') }}</li>
          </ul>

          <!-- 8 -->
          <h2>{{ t('terms.s8_title') }}</h2>
          <ul class="info-ul">
            <li>{{ t('terms.s8_li1') }}</li>
            <li>{{ t('terms.s8_li2') }}</li>
            <li>{{ t('terms.s8_li3') }}</li>
            <li>{{ t('terms.s8_li4') }}</li>
          </ul>

          <!-- 9 -->
          <h2>{{ t('terms.s9_title') }}</h2>
          <p class="info-p">{{ t('terms.s9_text') }}</p>

          <!-- 10 -->
          <h2>{{ t('terms.s10_title') }}</h2>
          <p class="info-p">{{ t('terms.s10_text') }}</p>

          <!-- 11 -->
          <h2>{{ t('terms.s11_title') }}</h2>
          <p class="info-p">{{ t('terms.s11_text') }}</p>

          <!-- 12 -->
          <h2>{{ t('terms.s12_title') }}</h2>
          <p class="info-p">{{ t('terms.s12_text') }}</p>

          <!-- 13 -->
          <h2>{{ t('terms.s13_title') }}</h2>
          <p class="info-p">{{ t('terms.s13_text') }}</p>

          <!-- 14 -->
          <h2>{{ t('terms.s14_title') }}</h2>
          <p class="info-p">
            {{ t('terms.s14_text') }}
            <br />
            <strong>{{ t('terms.s14_email_label') }}</strong>
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