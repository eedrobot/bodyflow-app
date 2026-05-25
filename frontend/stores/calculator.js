// stores/calculator.js
import { defineStore } from 'pinia'

import { getMenuDataFromApi, solveMenuDataFromApi } from '@/utils/api.js'

// --- TTL storage for pinia persistedstate ---
const TTL_MS = 30 * 60 * 1000 // 30 minutes

const ttlStorage = {
  getItem(key) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return null

      const parsed = JSON.parse(raw)
      const expires = Number(parsed?.expires || 0)
      if (!expires || Date.now() > expires) {
        localStorage.removeItem(key)
        return null
      }
      return parsed?.value ?? null
    } catch (e) {
      localStorage.removeItem(key)
      return null
    }
  },

  setItem(key, value) {
    try {
      const payload = {
        expires: Date.now() + TTL_MS,
        value,
      }
      localStorage.setItem(key, JSON.stringify(payload))
    } catch (e) {
      try { localStorage.removeItem(key) } catch (_) {}
    }
  },

  removeItem(key) {
    localStorage.removeItem(key)
  },
}

export const useCalculatorStore = defineStore('calculator', {
  persist: {
  key: 'bf_calculator',
  storage: process.client ? ttlStorage
    : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
  pick: [
    'gender','birthDate', 'age','height','weight','activity','selectedGoal',
    'BMI','BMIStatus','BMR','TDEE','TDEE_loss','TDEE_gain',
    'protein','protein_loss','protein_gain',
    'fat','fat_loss','fat_gain',
    'crabs','crabs_loss','crabs_gain',
    'water_norm',
    'desiredWeight', 'waist', 'neck', 'hip',
    'menuData',
    'orderId','orderToken','calculationId','email',
  ],
},
  state: () => ({
    resultVisible: false,
    isLoading: false,

    gender: 'male',
    birthDate: '',
    age: 0,
    height: 0,
    weight: 0,
    activity: 1.2,

        // ------------------------------
    // advanced inputs (optional)
    // ------------------------------
    desiredWeight: null, // kg
    waist: null,         // cm
    neck: null,          // cm
    hip: null,           // cm, female formula only

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

        // ------------------------------
    // backend calc/order state
    // ------------------------------
    orderId: null,
    orderToken: '',
    calculationId: null,

    // Preview metrics for the calculation ready screen.
    calcPreview: null, // { bmi, body_fat_percent, body_fat_method, fat_mass_kg, lean_mass_kg }

    // Email is provided later during payment.
    email: '',

    // Status/error fields for create.php.
    createCalcLoading: false,
    createCalcError: '',

    goalsReady: false,
    solvedAllGoalsReady: false,
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
    normalizeGender(value) {
      return String(value || '').toLowerCase() === 'female' ? 'female' : 'male'
    },

    setGender(value) {
      this.gender = this.normalizeGender(value)
    },

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

    // ---------- base calculations ----------
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

        let protein, proteinMin, proteinMax
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
            protein = this.smartRound(this.weight * 1.8)
            break
          case 1.9:
            protein = this.smartRound(this.weight * 2)
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
          Math.min(Math.max(protein * 1.3, 1.5 * this.weight), 2.2 * this.weight),
        )
        const protCal_loss = this.protein_loss * 4
        this.TDEE_loss = this.smartRound(this.TDEE * 0.85)
        const fatLossCal = this.TDEE_loss * 0.25
        this.fat_loss = this.smartRound(Math.max(fatLossCal / 9, 0.8 * this.weight))
        this.crabs_loss = this.smartRound((this.TDEE_loss - protCal_loss - this.fat_loss * 9) / 4)

        this.protein_gain = this.smartRound(
          Math.min(Math.max(protein * 1.2, 1.2 * this.weight), 2 * this.weight),
        )
        const protCal_gain = this.protein_gain * 4
        this.TDEE_gain = this.smartRound(this.TDEE * 1.1)
        const fatGainCal = this.TDEE_gain * 0.25
        this.fat_gain = this.smartRound(Math.max(fatGainCal / 9, 1 * this.weight))
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
        params: { days },
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

    // ---------- goals ----------
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

    async runAllCalculations() {
  if (this.isLoading) return

  try {
    this.isLoading = true
    this.resultVisible = true
    this.errorKey = ''
    this.setGender(this.gender)

    this.solvedAllGoalsReady = false
    this.goalsReady = false

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

  const targetsByGoal = {
    loss: this.getMainNutrientsForGoal('loss'),
    maintenance: this.getMainNutrientsForGoal('maintenance'),
    gain: this.getMainNutrientsForGoal('gain'),
  }

  const response = await solveMenuDataFromApi({
    menuData: this.menuData,
    targetsByGoal,
    selectedGoal: this.selectedGoal,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Menu solver failed: HTTP ${response.status}`)
  }

  this.menuData = data?.menuData || { days: [] }

  this.solvedAllGoalsReady = true
},

    resetAdvancedFields() {
      this.desiredWeight = null
      this.waist = null
      this.neck = null
      this.hip = null
    },

    resetBackendState() {
      this.orderId = null
      this.orderToken = ''
      this.calculationId = null
      this.calcPreview = null
      this.email = ''
      this.createCalcLoading = false
      this.createCalcError = ''
    },

    clearPersistedCalculatorData() {
      this.$reset()
      if (process.client) {
        ttlStorage.removeItem('bf_calculator')
      }
    },

    setEmail(email) {
      this.email = String(email || '').trim()
    },
  }
})
