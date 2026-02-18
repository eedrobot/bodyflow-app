<template>
  <footer class = "footer">
    <div class="footer-content">
      <FooterMenu class = "footer-menu"/>
      <FooterUseful class = "footer-useful"/>
      <div class = "footer-social">
        <h3>{{ t('footer.contacts') }}:</h3>
        <Social class = "footer-social"/>
      </div>
    </div>
    <div class = "footer-copyright">
      <FooterCopyright class = "copyright-info" />
    </div>
  </footer>
</template>

<script setup>
  import FooterMenu from './FooterMenu.vue'
  import FooterUseful from './FooterUseful.vue'
  import Social from '../Social.vue'
  import FooterCopyright from './FooterCopyright.vue'

  const { t } = useI18n()
</script>

<style lang="scss" scoped>
  .footer {
    padding: 0 4rem;
    color: $color-green;
    font-weight: 600;
    .footer-content {
      @include flex(row, start, space-between);
      padding: 2rem;
      text-align: center;
      h3 {
        text-decoration: underline;
        margin-bottom: 1rem;
      }
      .footer-social {
        text-align: left;
      }
    }
    .footer-copyright {
      @include border-sides(top, $color-white);
      padding: 1rem 0;
      color: $color-dg;
    }
  }

  @media (max-width: 767.98px) {
     .footer {
        padding: 0 15px;
      }
  }

@media (max-width: 575.98px) {
  .footer {
    .footer-content {
      @include flex(column, start, center);
      gap: 12px;
       .footer-social { order: 3; }
        .footer-menu { order: 1; }
        .footer-useful { order: 2; }
        .copyright-info { 
          order: 4; 
          width: 100%;
          padding: 1rem 0;
          align-self: center;
          @include border-sides(top, $color-lg-2);
        }
    }
  }
}
</style>
