 <template>
     <nav class="breadcrumbs" aria-label="Breadcrumb">
        <button class = "back" type = "button" @click = "goBack">
            ← {{ t('general.back')  }}
        </button>
    </nav>
 </template>
 <script setup>
 const router = useRouter()
const localePath = useLocalePath()
 const { t } = useI18n()

 const props = defineProps({
  fallbackPath: {
    type: String,
    default: '/'
  }
})

 function goBack() {
    if(window.history.length > 1) {
        router.back()
    } else {
        router.push(localePath(props.fallbackPath))
    }
 }
</script>
<style lang="scss" scoped>
    .breadcrumbs {
        grid-area: breadcrumbs;
     }
</style>
