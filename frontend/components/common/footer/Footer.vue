<template>
  <footer class = "footer">
    <div class="footer-content">
      <FooterMenu class = "footer-menu"/>
      <div class = "footer-copyright">
        &copy;2026 BodyFlow
      </div>
      <Social class = "footer-social"/>
    </div>
  </footer>
</template>

<script setup>
  import FooterMenu from './FooterMenu.vue'
  import Social from '../Social.vue'
</script>

<style lang="scss" scoped>
  .footer {
    padding: 0 4rem;
    .footer-content {
      @include flex(row, center, space-between);
      // display: grid;
      // grid-template-columns: 1fr 1fr 1fr;
      // align-items: center;
      padding: 1rem 2rem;
      text-align: center;
      font-weight: 600;
      color: $color-green;
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
       .footer-social { order: 2; }
        .footer-menu { order: 1; }
        .footer-copyright { 
          order: 3; 
          width: 100%;
          padding: 1rem 0;
          align-self: center;
          @include border-sides(top, $color-lg-2);
        }
    }
  }
}
</style>
