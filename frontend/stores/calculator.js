// stores/calculator.js
import { defineStore } from 'pinia'

import { getMenuDataFromApi } from '@/utils/api.js'
import { GROUP_BOUNDS } from '@/utils/nutritionBounds.js'

// ⚠️ useApiCache должен быть доступен в этом файле (импортни его, если он не глобальный)
// import { useApiCache } from '@/utils/useApiCache'

export const useCalculatorStore = defineStore('calculator', {
  state: () => ({
    resultVisible: false,
    isLoading: false,

    gender: 'male',
    birthDate: '',
    age: 0,
    height: 0,
    weight: 0,
    activity: 1.2,

    BMI: 0,
    BMIStatus: '',
    BMR: 0,

    TDEE: 0,
    TDEE_loss: 0,
    TDEE_gain: 0,

    protein: 0,
    protein_loss: 0,
    protein_gain: 0,

    fat: 0,
    fat_loss: 0,
    fat_gain: 0,

    crabs: 0,
    crabs_loss: 0,
    crabs_gain: 0,

    water_norm: 0,

    selectedGoal: 'loss',
    menuData: { days: [] },
    errorKey: '',

    goalsReady: false,
    solvedAllGoalsReady: false,

    // solver/runtime state (на один meal)
    productsForSolve: [],
    A: [],
    b: [],
    solutionX: [],
    solutionMacros: {},
    currentMealKey: null,
    currentMealTargets: null,
  }),

  getters: {
    bmiPosition: (state) => {
      const bmi = parseFloat(state.BMI)
      const maxBMI = 40
      let pos = (bmi / maxBMI) * 100
      if (pos > 100) pos = 100
      if (pos < 0) pos = 0
      return pos
    },

    mainNutrients: (state) => {
      const ratio = { breakfast: 0.3, lunch: 0.4, dinner: 0.3 }

      const base =
        state.selectedGoal === 'loss'
          ? { kcal: state.TDEE_loss, p: state.protein_loss, f: state.fat_loss, c: state.crabs_loss }
          : state.selectedGoal === 'gain'
            ? { kcal: state.TDEE_gain, p: state.protein_gain, f: state.fat_gain, c: state.crabs_gain }
            : { kcal: state.TDEE, p: state.protein, f: state.fat, c: state.crabs }

      const result = {}
      Object.keys(ratio).forEach((mealKey) => {
        result[mealKey] = {
          kcal: Math.round(base.kcal * ratio[mealKey]),
          p: Math.round(base.p * ratio[mealKey]),
          f: Math.round(base.f * ratio[mealKey]),
          c: Math.round(base.c * ratio[mealKey]),
        }
      })

      return result
    },
  },

  actions: {
    // ---------- utils ----------
    safe(v) {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    },

    smartRound(value) {
      const n = Number(value)
      if (!Number.isFinite(n)) return 0
      return n < 100 ? Math.round(n) : Math.round(n / 10) * 10
    },

    yieldToUI() {
      return new Promise((resolve) => requestAnimationFrame(() => resolve()))
    },

    // ---------- базовые расчёты ----------
    calculatedAge() {
      if (!this.birthDate) {
        this.age = 0
        return
      }

      const birth = new Date(this.birthDate)
      if (Number.isNaN(birth.getTime())) {
        this.age = 0
        return
      }

      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      const dayDiff = today.getDate() - birth.getDate()
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--

      this.age = age
    },

    calculateBMI() {
      if (this.height > 0 && this.weight > 0) {
        this.BMI = (this.weight / ((this.height / 100) ** 2)).toFixed(1)

        switch (true) {
          case this.BMI < 18.5:
            this.BMIStatus = 'underweight'
            break
          case this.BMI >= 18.5 && this.BMI <= 24.9:
            this.BMIStatus = 'normal'
            break
          case this.BMI >= 25 && this.BMI <= 29.9:
            this.BMIStatus = 'overweight'
            break
          case this.BMI >= 30:
            this.BMIStatus = 'obesity'
            break
          default:
            this.BMIStatus = ''
        }
      } else {
        this.BMI = 0
        this.BMIStatus = ''
      }
    },

    calculateBMR() {
      if (this.height > 0 && this.weight > 0 && this.birthDate !== '') {
        if (this.gender === 'male') {
          this.BMR = this.smartRound(10 * this.weight + 6.25 * this.height - 5 * this.age + 5)
        } else if (this.gender === 'female') {
          this.BMR = this.smartRound(10 * this.weight + 6.25 * this.height - 5 * this.age - 161)
        }
      } else {
        this.BMR = 0
      }
    },

    calculateTDEE() {
      if (this.height > 0 && this.weight > 0 && this.birthDate !== '' && this.activity > 0) {
        this.TDEE = this.smartRound(this.BMR * this.activity)

        let protein
        switch (Number(this.activity)) {
          case 1.2:
            protein = this.smartRound(this.weight * 1)
            break
          case 1.375:
            protein = this.smartRound(this.weight * 1.2)
            break
          case 1.55:
            protein = this.smartRound(this.weight * 1.5)
            break
          case 1.725:
            protein = this.smartRound(this.weight * 2)
            break
          case 1.9:
            protein = this.smartRound(this.weight * 2.2)
            break
          default:
            protein = this.smartRound(this.weight * 1)
        }

        const protCal = protein * 4
        this.protein = this.smartRound(protein)

        const fatCal = this.TDEE * 0.25
        this.fat = this.smartRound(Math.max(fatCal / 9, 0.8 * this.weight))

        this.crabs = this.smartRound((this.TDEE - protCal - this.fat * 9) / 4)

        this.protein_loss = this.smartRound(
          Math.min(Math.max(protein * 1.25, 1.4 * this.weight), 2.2 * this.weight),
        )
        const protCal_loss = this.protein_loss * 4
        this.TDEE_loss = this.smartRound(this.TDEE * 0.8)
        const fatLossCal = this.TDEE_loss * 0.25
        this.fat_loss = this.smartRound(Math.max(fatLossCal / 9, 0.8 * this.weight))
        this.crabs_loss = this.smartRound((this.TDEE_loss - protCal_loss - this.fat_loss * 9) / 4)

        this.protein_gain = this.smartRound(
          Math.min(Math.max(protein * 1.2, 1.2 * this.weight), 2.2 * this.weight),
        )
        const protCal_gain = this.protein_gain * 4
        this.TDEE_gain = this.smartRound(this.TDEE * 1.1)
        const fatGainCal = this.TDEE_gain * 0.25
        this.fat_gain = this.smartRound(Math.max(fatGainCal / 9, 0.8 * this.weight))
        this.crabs_gain = this.smartRound((this.TDEE_gain - protCal_gain - this.fat_gain * 9) / 4)

        this.goalsReady = true
      }
    },

    calculateWaterNorm() {
      if (this.height > 0 && this.weight > 0 && this.birthDate !== '' && this.activity > 0) {
        switch (this.activity) {
          case 1.2:
            this.water_norm = Math.round(((30 * this.weight) / 1000) * 10) / 10
            break
          case 1.375:
            this.water_norm = Math.round(((35 * this.weight) / 1000) * 10) / 10
            break
          case 1.55:
            this.water_norm = Math.round(((40 * this.weight) / 1000) * 10) / 10
            break
          case 1.725:
            this.water_norm = Math.round(((45 * this.weight) / 1000) * 10) / 10
            break
          case 1.9:
            this.water_norm = Math.round(((50 * this.weight) / 1000) * 10) / 10
            break
          default:
            break
        }
      }
    },

    // ---------- API ----------
    async getMenuData(days = 5) {
      return await useApiCache({
        apiFn: getMenuDataFromApi,
        params: { days }, // ✅ без lang
        store: this,

        ttl: false,
        cacheKey: 'menuData',

        setter: (data) => {
          this.menuData = data
        },

        customError: (error) => {
          console.error('Menu load error:', error)
          this.menuData = { days: [] }
          this.errorKey = 'error.general'
        },
      })
    },

    // ---------- цели ----------
    setGoal(goal) {
      this.selectedGoal = goal
      if (this.solvedAllGoalsReady) this.applySolvedGoal(goal)
    },

    applySolvedGoal(goal) {
      if (!this.menuData?.days?.length) return

      this.menuData.days.forEach((day) => {
        Object.values(day.meals || {}).forEach((meal) => {
          ;(meal.products || []).forEach((prod) => {
            prod.solvedGram = prod.solvedByGoal?.[goal] ?? 0
          })
        })
      })
    },

    getMainNutrientsForGoal(goal) {
      const ratio = { breakfast: 0.3, lunch: 0.4, dinner: 0.3 }

      const base =
        goal === 'loss'
          ? { kcal: this.TDEE_loss, p: this.protein_loss, f: this.fat_loss, c: this.crabs_loss }
          : goal === 'gain'
            ? { kcal: this.TDEE_gain, p: this.protein_gain, f: this.fat_gain, c: this.crabs_gain }
            : { kcal: this.TDEE, p: this.protein, f: this.fat, c: this.crabs }

      const res = {}
      for (const mealKey of Object.keys(ratio)) {
        res[mealKey] = {
          kcal: Math.round(base.kcal * ratio[mealKey]),
          p: Math.round(base.p * ratio[mealKey]),
          f: Math.round(base.f * ratio[mealKey]),
          c: Math.round(base.c * ratio[mealKey]),
        }
      }
      return res
    },

    // ------------------ СБОР МАТРИЦ A, b ------------------
    generateMatrixForMeal(mealKey, products, targets) {
      if (!products?.length) return

      this.productsForSolve = products
      this.currentMealKey = mealKey

      const coeffs = products.map((prod) => {
        const n = prod.nutrients || {}
        return {
          p: this.safe(n.protein) / 100,
          f: this.safe(n.fat) / 100,
          c: this.safe(n.carb) / 100,
          k: this.safe(n.calories) / 100,
          groupId: Number(prod.menu_nutrient_id) || null,
        }
      })

      const rowsA = [
        coeffs.map((c) => c.p),
        coeffs.map((c) => c.f),
        coeffs.map((c) => c.c),
        coeffs.map((c) => c.k),
      ]

      const nutrients = targets || { p: 0, f: 0, c: 0, kcal: 0 }
      this.currentMealTargets = nutrients

      const b = [nutrients.p, nutrients.f, nutrients.c, nutrients.kcal]

      // kcal в матрице
      const wK = 3
      rowsA.push(coeffs.map((c) => c.k * wK))
      b.push(nutrients.kcal * wK)

      // мягкие цели по группам
      Object.entries(GROUP_BOUNDS).forEach(([groupIdStr, bounds]) => {
        const groupId = Number(groupIdStr)
        const { min, max } = bounds

        const row = coeffs.map((c) => (c.groupId === groupId ? 1 : 0))
        if (!row.some((v) => v !== 0)) return

        const target = (min + max) / 2
        const weight = 1.5

        rowsA.push(row.map((v) => v * weight))
        b.push(target * weight)
      })

      // регуляризация
      const lambda = 0.03
      products.forEach((_, i) => {
        const regRow = coeffs.map((_, j) => (i === j ? Math.sqrt(lambda) : 0))
        rowsA.push(regRow)
        b.push(0)
      })

      this.A = rowsA
      this.b = b
    },

solveQPSystem() {
  if (!this.A.length || !this.b.length || !this.productsForSolve.length) {
    this.solutionX = []
    return
  }

  const A = this.A
  const b = this.b
  const m = A.length
  const n = A[0]?.length || 0
  if (!n) {
    this.solutionX = []
    return
  }

  // ========= helpers =========
  const safe = (v) => this.safe(v)

  const getCategoryIds = (p) => {
    // поддержка и category_id, и category_ids:[...]
    const ids = []
    const cid = Number(p?.category_id)
    if (Number.isFinite(cid)) ids.push(cid)

    const arr = p?.category_ids
    if (Array.isArray(arr)) {
      for (const x of arr) {
        const nx = Number(x)
        if (Number.isFinite(nx)) ids.push(nx)
      }
    }
    return ids
  }

  const hasCategory = (p, id) => getCategoryIds(p).includes(Number(id))

  // ========= hard rules =========
  const TOTAL_MIN = 300
  const TOTAL_MAX = 500

  const EGGS_MAX = 120 // ✅ category 12 <= 120g

  const OIL_PID = 735
  const OIL_MIN = 5
  const OIL_MAX = 8

  const FAT_GROUP_ID = 5
  const FAT_MIN = 15
  const FAT_MAX = 25

  const BREAD_PID = 583
  const BREAD_MAX_QP = 80

  const VEG_GREEN_MAX_SUM = 250

  // ========= indexes =========
  const eggsIdx = []
  let oilIdx = null
  const fatIdx = []
  let breadIdx = null
  const vegGreenIdx = []

  this.productsForSolve.forEach((p, i) => {
    const pid = Number(p.product_id)
    const gid = Number(p.menu_nutrient_id)

    if (hasCategory(p, 12)) eggsIdx.push(i)

    if (pid === OIL_PID) oilIdx = i
    if (gid === FAT_GROUP_ID && pid !== OIL_PID) fatIdx.push(i)

    if (pid === BREAD_PID) breadIdx = i
    if (gid === 3 || gid === 7) vegGreenIdx.push(i)
  })

  // ========= step size =========
  let maxRowNormSq = 0
  for (let i = 0; i < m; i++) {
    let s = 0
    for (let j = 0; j < n; j++) s += (A[i][j] || 0) ** 2
    if (s > maxRowNormSq) maxRowNormSq = s
  }
  const alpha = maxRowNormSq > 0 ? 0.4 / (maxRowNormSq + 1e-6) : 0.01

  const x = new Array(n).fill(0)
  const kcalPerGram = this.productsForSolve.map((p) => safe(p?.nutrients?.calories) / 100)

  const mealTargets =
    this.currentMealTargets ||
    this.mainNutrients?.[this.currentMealKey] ||
    { kcal: 0 }

  const targetKcal = safe(mealTargets.kcal)
  const kcalMin = targetKcal * 0.95
  const kcalMax = targetKcal * 1.05

  // ========= caps =========
  const capEggs = (xArr) => {
    if (!eggsIdx.length) return
    const sum = eggsIdx.reduce((s, i) => s + safe(xArr[i]), 0)
    if (sum > EGGS_MAX && sum > 0) {
      const f = EGGS_MAX / sum
      eggsIdx.forEach((i) => (xArr[i] *= f))
    }
  }

  const applyCaps = (xArr) => {
    // bread <= 80
    if (breadIdx !== null && xArr[breadIdx] > BREAD_MAX_QP) xArr[breadIdx] = BREAD_MAX_QP

    // eggs sum <= 120
    capEggs(xArr)

    // veg+green <= 250
    if (vegGreenIdx.length) {
      let sum = 0
      for (const i of vegGreenIdx) sum += safe(xArr[i])
      if (sum > VEG_GREEN_MAX_SUM && sum > 0) {
        const f = VEG_GREEN_MAX_SUM / sum
        for (const i of vegGreenIdx) xArr[i] *= f
      }
    }
  }

  // ========= projection =========
  const project = (xArr) => {
    // >=0
    for (let j = 0; j < n; j++) xArr[j] = Math.max(0, safe(xArr[j]))

    // oil 5–8
    if (oilIdx !== null) {
      const v = xArr[oilIdx]
      if (v < OIL_MIN) xArr[oilIdx] = OIL_MIN
      if (v > OIL_MAX) xArr[oilIdx] = OIL_MAX
    }

    // fat group5 15–25 sum
    if (fatIdx.length) {
      let sum = fatIdx.reduce((s, i) => s + safe(xArr[i]), 0)
      if (sum > 0 && sum < FAT_MIN) {
        const f = FAT_MIN / sum
        fatIdx.forEach((i) => (xArr[i] *= f))
      }
      sum = fatIdx.reduce((s, i) => s + safe(xArr[i]), 0)
      if (sum > FAT_MAX && sum > 0) {
        const f = FAT_MAX / sum
        fatIdx.forEach((i) => (xArr[i] *= f))
      }
    }

    // caps before scaling
    applyCaps(xArr)

    // total weight 300–500
    let total = xArr.reduce((s, v) => s + safe(v), 0)
    if (total > 0 && total < TOTAL_MIN) {
      const f = TOTAL_MIN / total
      for (let j = 0; j < n; j++) xArr[j] *= f
    }
    total = xArr.reduce((s, v) => s + safe(v), 0)
    if (total > TOTAL_MAX && total > 0) {
      const f = TOTAL_MAX / total
      for (let j = 0; j < n; j++) xArr[j] *= f
    }

    // kcal EXACT (строго)
    if (targetKcal > 0) {
    let kcal = 0
    for (let j = 0; j < n; j++) kcal += safe(xArr[j]) * (kcalPerGram[j] || 0)

    if (kcal > 0) {
        const f = targetKcal / kcal
        for (let j = 0; j < n; j++) xArr[j] *= f
    }
    }

    // final caps (scaling can break them)
    applyCaps(xArr)
  }

  project(x)

  // ========= iterations =========
  const maxIter = 350
  for (let it = 0; it < maxIter; it++) {
    const Ax = new Array(m).fill(0)
    for (let i = 0; i < m; i++) {
      let s = 0
      for (let j = 0; j < n; j++) s += (A[i][j] || 0) * x[j]
      Ax[i] = s
    }

    const r = Ax.map((v, i) => v - b[i])

    const grad = new Array(n).fill(0)
    for (let j = 0; j < n; j++) {
      let s = 0
      for (let i = 0; i < m; i++) s += (A[i][j] || 0) * r[i]
      grad[j] = 2 * s
    }

    let maxChange = 0
    for (let j = 0; j < n; j++) {
      const old = x[j]
      const next = old - alpha * grad[j]
      maxChange = Math.max(maxChange, Math.abs(next - old))
      x[j] = next
    }

    project(x)
    if (maxChange < 1e-3) break
  }

  this.solutionX = x.map((v) => Math.max(0, Number(v) || 0))
},

// ---------- постпроцесс ----------
postProcessResult(goal = this.selectedGoal) {
  if (!this.solutionX?.length || !this.productsForSolve?.length) return

  const targets = this.currentMealTargets || {}
  const targetK = Number(targets.kcal || 0)
  const targetP = Number(targets.p || 0)

  const safe = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0)

  const kcalPerGramAt = (i) => safe(this.productsForSolve[i]?.nutrients?.calories) / 100
  const protPerGramAt = (i) => safe(this.productsForSolve[i]?.nutrients?.protein) / 100

  // category helper
  const getCategoryIds = (p) => {
    const ids = []
    const cid = Number(p?.category_id)
    if (Number.isFinite(cid)) ids.push(cid)
    const arr = p?.category_ids
    if (Array.isArray(arr)) {
      for (const x of arr) {
        const nx = Number(x)
        if (Number.isFinite(nx)) ids.push(nx)
      }
    }
    return ids
  }
  const hasCategory = (p, id) => getCategoryIds(p).includes(Number(id))

  // =========================
  // SETTINGS
  // =========================
  const PID_BREAD = 583
  const BREAD_MAX = 40

  const EGGS_MAX = 120

  const VEG_GREEN_MAX_SUM = 250
  const VEG_MIN = 150
  const GREEN_MIN = 20

  const COMPLEX_MIN = 80

  const PROTEIN_TOL = 0.25
  const MAX_ITERS_PROTEIN = 10

  const EPS_KCAL = 0.05   // точность калорий
  const EPS_GRAM = 1e-6

  // =========================
  // INDEXES
  // =========================
  const idxByGroup = (gid) =>
    this.productsForSolve
      .map((p, i) => ({ p, i }))
      .filter((x) => Number(x.p.menu_nutrient_id) === gid)
      .map((x) => x.i)

  const idxProteinG1 = idxByGroup(1)
  const idxComplex   = idxByGroup(2)
  const idxVeg       = idxByGroup(3)
  const idxGreen     = idxByGroup(7)
  const idxVegGreen  = [...idxVeg, ...idxGreen]

  const idxBread = this.productsForSolve
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => Number(p.product_id) === PID_BREAD)
    .map(({ i }) => i)

  const idxEggs = this.productsForSolve
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => hasCategory(p, 12))
    .map(({ i }) => i)

  // =========================
  // SUMS / TOTALS
  // =========================
  const sumGrams = (idx) => idx.reduce((s, i) => s + safe(this.solutionX[i]), 0)

  const proteinFromG1 = () =>
    idxProteinG1.reduce((s, i) => s + safe(this.solutionX[i]) * protPerGramAt(i), 0)

  const calcTotals = () => {
    let P = 0, F = 0, C = 0, K = 0
    this.productsForSolve.forEach((prod, i) => {
      const g = safe(this.solutionX[i])
      const n = prod.nutrients || {}
      P += safe(n.protein)  * g / 100
      F += safe(n.fat)      * g / 100
      C += safe(n.carb)     * g / 100
      K += safe(n.calories) * g / 100
    })
    return { P, F, C, K }
  }

  // =========================
  // HELPERS
  // =========================
  const clampNonNegative = () => {
    for (let i = 0; i < this.solutionX.length; i++) {
      this.solutionX[i] = Math.max(0, safe(this.solutionX[i]))
    }
  }

  const cutToCap = (idx, capGrams) => {
    const cur = sumGrams(idx)
    if (!idx.length || cur <= capGrams + EPS_GRAM) return
    const ratio = capGrams / cur
    idx.forEach((i) => { this.solutionX[i] = safe(this.solutionX[i]) * ratio })
  }

  const cutEggsToMax = () => {
    if (idxEggs.length) cutToCap(idxEggs, EGGS_MAX)
  }

  const ensureVegGreenMin = () => {
    if (idxVeg.length) {
      const cur = sumGrams(idxVeg)
      const need = VEG_MIN - cur
      if (need > 0.5) {
        const addPer = need / idxVeg.length
        idxVeg.forEach((i) => { this.solutionX[i] = safe(this.solutionX[i]) + addPer })
      }
    }
    if (idxGreen.length) {
      const cur = sumGrams(idxGreen)
      const need = GREEN_MIN - cur
      if (need > 0.5) {
        const addPer = need / idxGreen.length
        idxGreen.forEach((i) => { this.solutionX[i] = safe(this.solutionX[i]) + addPer })
      }
    }
    if (idxVegGreen.length) cutToCap(idxVegGreen, VEG_GREEN_MAX_SUM)
  }

  const ensureComplexMinStrict = () => {
    if (!idxComplex.length) return
    const cur = sumGrams(idxComplex)
    const needG = COMPLEX_MIN - cur
    if (needG <= 0.5) return
    const addPer = needG / idxComplex.length
    idxComplex.forEach((i) => { this.solutionX[i] = safe(this.solutionX[i]) + addPer })
  }

  const fitProteinG1ToTarget = () => {
    if (!idxProteinG1.length || targetP <= 0) return
    for (let it = 0; it < MAX_ITERS_PROTEIN; it++) {
      const pG1 = proteinFromG1()
      const diff = targetP - pG1
      if (Math.abs(diff) <= PROTEIN_TOL) break
      if (pG1 <= 0.0001) break

      const factor = 1 + (diff / pG1)
      const clamped = Math.min(1.4, Math.max(0.6, factor))
      idxProteinG1.forEach((i) => { this.solutionX[i] = safe(this.solutionX[i]) * clamped })

      cutEggsToMax()
    }
  }

  // =========================
  // ✅ ТОЧНАЯ ПОДГОНКА КАЛОРИЙ
  // =========================
  const fitKcalExact = () => {
    if (targetK <= 0) return

    // Фиксы: овощи/зелень/яйца мы НЕ трогаем в финальном калибровании (иначе “тарелка” ломается)
    const isLocked = (i) => idxVegGreen.includes(i) || idxEggs.includes(i)

    // Нижние границы для некоторых групп
    const floorAt = (i) => {
      // complex: не ниже COMPLEX_MIN суммарно
      if (idxComplex.includes(i)) return 0 // floor распределим отдельно
      // bread: не ниже 0
      return 0
    }

    // кандидаты: сначала complex, потом bread, потом остальные “не-локнутые”
    const candidates = []
    const pushUnique = (arr) => {
      for (const i of arr) {
        if (isLocked(i)) continue
        if (kcalPerGramAt(i) <= 0) continue
        if (!candidates.includes(i)) candidates.push(i)
      }
    }
    pushUnique(idxComplex)
    pushUnique(idxBread)
    pushUnique(this.productsForSolve.map((_, i) => i))

    // хелпер: текущие калории
    const currentKcal = () => calcTotals().K

    // 1) если нужно УМЕНЬШИТЬ — сначала уменьшаем “прочее”, но соблюдаем COMPLEX_MIN
    // 2) если нужно ДОБРАТЬ — добираем через complex/bread/прочее

    // Чтобы не провалить complex ниже минимума — считаем “запас” complex
    const complexSlack = () => Math.max(0, sumGrams(idxComplex) - COMPLEX_MIN)

    let guard = 0
    while (guard++ < 200) {
      const curK = currentKcal()
      const diff = targetK - curK
      if (Math.abs(diff) <= EPS_KCAL) break

      if (diff > 0) {
        // надо ДОБРАТЬ kcal
        let progressed = false
        for (const i of candidates) {
          const kpg = kcalPerGramAt(i)
          if (kpg <= 0) continue

          // сколько грамм добавить, чтобы закрыть diff
          const addG = diff / kpg
          if (addG <= 0) continue

          this.solutionX[i] = safe(this.solutionX[i]) + addG
          progressed = true
          break
        }
        if (!progressed) break
      } else {
        // надо УМЕНЬШИТЬ kcal
        const needCutKcal = -diff

        let progressed = false
        for (const i of candidates.slice().reverse()) {
          const kpg = kcalPerGramAt(i)
          if (kpg <= 0) continue
          const curG = safe(this.solutionX[i])
          if (curG <= EPS_GRAM) continue

          // Нельзя резать овощи/зелень/яйца (лок)
          if (isLocked(i)) continue

          // Не даём уйти complex ниже минимума: резать complex можно только в пределах slack
          let maxCutG = curG
          if (idxComplex.includes(i)) {
            const slack = complexSlack()
            if (slack <= EPS_GRAM) continue
            maxCutG = Math.min(maxCutG, slack)
          }

          const needCutG = needCutKcal / kpg
          const cutG = Math.min(maxCutG, needCutG)
          if (cutG <= EPS_GRAM) continue

          this.solutionX[i] = Math.max(0, curG - cutG)
          progressed = true
          break
        }
        if (!progressed) break
      }

      // после любых правок — соблюдаем твои обязательные ограничения
      clampNonNegative()
      if (idxBread.length) cutToCap(idxBread, BREAD_MAX)
      cutEggsToMax()
      ensureVegGreenMin()
      ensureComplexMinStrict()
    }
  }

  // =========================
  // PIPELINE
  // =========================
  clampNonNegative()

  if (idxBread.length) cutToCap(idxBread, BREAD_MAX)
  cutEggsToMax()

  ensureVegGreenMin()
  fitProteinG1ToTarget()

  ensureComplexMinStrict()

  // ✅ вот тут: строго попадаем в targetKcal
  fitKcalExact()

  // финальная нормализация
  clampNonNegative()
  if (idxBread.length) cutToCap(idxBread, BREAD_MAX)
  cutEggsToMax()
  ensureVegGreenMin()
  ensureComplexMinStrict()

  // apply solved grams
  this.productsForSolve.forEach((prod, i) => {
    prod.solvedGram = Math.max(0, safe(this.solutionX[i]))
  })

  const final = calcTotals()
  this.solutionMacros = {
    protein: Number(final.P.toFixed(2)),
    fat: Number(final.F.toFixed(2)),
    carbs: Number(final.C.toFixed(2)),
    kcal: Number(final.K.toFixed(2)),
    complex_g: Number(sumGrams(idxComplex).toFixed(2)),
    veg_g: Number(sumGrams(idxVeg).toFixed(2)),
    green_g: Number(sumGrams(idxGreen).toFixed(2)),
    eggs_g: Number(sumGrams(idxEggs).toFixed(2)),
  }
},

    // ---------- запуск всего пайплайна ----------
    async runAllCalculations() {
  if (this.isLoading) return

  try {
    this.isLoading = true
    this.resultVisible = true
    this.errorKey = ''

    // ✅ ВАЖНО: сброс флагов готовности
    this.solvedAllGoalsReady = false
    this.goalsReady = false

    // ✅ (опционально) очистить прошлое решение, чтобы не мигали старые граммы
    // this.menuData = { days: [] }  // если ок, что меню пропадет до конца расчёта
    // или мягче:
    if (this.menuData?.days?.length) {
      this.menuData.days.forEach(day => {
        Object.values(day.meals || {}).forEach(meal => {
          (meal.products || []).forEach(p => {
            p.solvedGram = 0
            if (p.solvedByGoal) p.solvedByGoal = {}
          })
        })
      })
    }

    await this.yieldToUI()

    this.calculatedAge()
    this.calculateBMI()
    this.calculateBMR()
    this.calculateTDEE()
    this.calculateWaterNorm()

    await this.getMenuData()
    await this.calculateAllMeals()

    // ✅ вот здесь значит всё посчитано
    this.solvedAllGoalsReady = true

    this.applySolvedGoal(this.selectedGoal)
  } finally {
    this.isLoading = false
  }
},

async calculateAllMeals() {
  if (this.solvedAllGoalsReady) return
  if (!this.goalsReady) return
  if (!this.menuData?.days?.length) return

  const goalsList = ['loss', 'maintenance', 'gain']

  let step = 0

  for (const goal of goalsList) {
    const targetsByMeal = this.getMainNutrientsForGoal(goal)

    for (const day of this.menuData.days) {
      if (!day.meals) continue

      for (const [mealKey, meal] of Object.entries(day.meals)) {
        const products = meal.products || []
        if (!products.length) continue

        this.generateMatrixForMeal(mealKey, products, targetsByMeal[mealKey])

        this.solveQPSystem()
        this.postProcessResult(goal)


        products.forEach((prod, i) => {
          if (!prod.solvedByGoal) prod.solvedByGoal = {}
          prod.solvedByGoal[goal] = this.solutionX[i] || 0
        })

        // ✅ ДАЁМ БРАУЗЕРУ ОТРЕПЕЙНТИТЬ ЛОАДЕР
        step++
        if (step % 1 === 0) await this.yieldToUI()  // можешь 1,2,3 подобрать
      }
    }
  }

  this.solvedAllGoalsReady = true
}
  },
})
