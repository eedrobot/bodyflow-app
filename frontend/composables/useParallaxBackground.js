import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useParallaxBackground({
  bgRef,
  descRef,
  desktopMin = 1199.98,
  getBgPosition,
  getDescTransform = (scrollY) => `translateY(${scrollY * 0.2}px)`,
}) {
  const scrollY = ref(0)
  const rafId = ref(null)

  const isDesktop = () => process.client && window.innerWidth >= desktopMin

  const resetInlineStyles = () => {
    if (bgRef?.value) bgRef.value.style.backgroundPosition = ''
    if (descRef?.value) descRef.value.style.transform = ''
  }

  const apply = () => {
    if (!process.client) return
    if (!bgRef?.value) return

    const w = window.innerWidth
    const y = scrollY.value

    if (w < desktopMin) {
      resetInlineStyles()
      return
    }

    if (typeof getBgPosition === 'function') {
      const pos = getBgPosition({ w, y })
      bgRef.value.style.backgroundPosition = pos == null ? '' : pos
    }

    if (descRef?.value) {
      descRef.value.style.transform = getDescTransform(y)
    }
  }

  const scheduleApply = () => {
    if (!process.client) return
    if (rafId.value) return
    rafId.value = requestAnimationFrame(() => {
      rafId.value = null
      apply()
    })
  }

  const onScroll = () => {
    if (!isDesktop()) return
    scrollY.value = window.scrollY || 0
    scheduleApply()
  }

  const onResize = () => {
    if (!isDesktop()) resetInlineStyles()
    scheduleApply()
  }

  onMounted(() => {
    if (!process.client) return
    scrollY.value = window.scrollY || 0
    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    if (!process.client) return
    if (rafId.value) cancelAnimationFrame(rafId.value)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
  })

  return { scrollY, apply }
}
