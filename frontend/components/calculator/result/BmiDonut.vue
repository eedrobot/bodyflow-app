<template>
  <div class="bmi-donut">
    <div class="donut-ring"></div>
    <div class="donut-hole"></div>

    <!-- ARROW -->
    <div
      class="bmi-indicator"
      :style="{
        left: `${arrowPosition.x - arrowWidth / 2}px`,
        top: `${arrowPosition.y - arrowHeight / 2}px`,
        transform: `rotate(${arrowPosition.angleDeg}deg)`
      }"
    ></div>

    <!-- BMI STATUS -->
    <div class="bmi-center">
      <small>{{ statusText }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  bmi: { type: Number, required: true },
  statusKey: { type: String, default: '' }, // например: "normal", "underweight"...
  statusText: { type: String, default: '' } // уже переведённая строка
})

/* ARROW PARAMS */
const arrowWidth = 18
const arrowHeight = 18

// центр donut
const cx = 75
const cy = 75
const radius = 94

const arrowPosition = computed(() => {
  let bmi = Number.isFinite(props.bmi) ? props.bmi : 0
  if (bmi < 0) bmi = 0
  if (bmi > 40) bmi = 40

  let angleDeg

  if (bmi <= 18.5) {
    angleDeg = (bmi / 18.5) * 90
  } else if (bmi <= 24.9) {
    angleDeg = 91 + ((bmi - 18.5) / (24.9 - 18.5)) * (180 - 91)
  } else if (bmi <= 29.9) {
    angleDeg = 181 + ((bmi - 25) / (29.9 - 25)) * (270 - 181)
  } else {
    angleDeg = 271 + ((bmi - 30) / (40 - 30)) * (360 - 271)
  }

  const angleRad = (angleDeg - 90) * (Math.PI / 180)
  const outerRadius = radius
  const innerRadius = (radius * 0.75) / 2
  const safeRadius = innerRadius + (outerRadius - innerRadius) / 2

  const x = cx + safeRadius * Math.cos(angleRad)
  const y = cy + safeRadius * Math.sin(angleRad)

  return { x, y, angleDeg }
})
</script>

<style lang="scss" scoped>
.bmi-donut {
    position: relative;
    width: 150px;
    height: 150px;
    transform-origin: center center;

    .donut-ring {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: conic-gradient(
        #e2851c 0% 25%,   // Недостаток
        #76b7b2 25% 50%,  // Норма
        #f4db34 50% 75%,  // Избыточный
        #e15759 75% 100%  // Ожирение
        );
        position: relative;
    }

    .donut-hole {
        width:75%;
        height: 75%;
        background: $color-white-tr;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2;
    }

    .bmi-indicator {
        position: absolute;
        transform-origin: center center;
        transition: transform 1s ease-in-out;
        z-index: 3;
        width: 0;
        height: 0;
        border-left: 9px solid transparent;
        border-right: 9px solid transparent;
        border-top: 18px solid #00008b;
    }

    .bmi-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 4;

        small {
        font-weight: bold;
        font-size: 14px;
        }
    }
}
</style>
