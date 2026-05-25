// store/ui.js
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    isResultActive: false,

    activeMenuDayTab: 0,

    isMenuOpen: false,

    activeModal: null

  }),
  actions: {
    setActiveMenuDayTab(index) {
      this.activeMenuDayTab = index
    },

     toggleMenuOpen() {
      this.isMenuOpen = !this.isMenuOpen
    },

    openMenu() {
      this.isMenuOpen = true
    },

    closeMenu() {
      this.isMenuOpen = false
    },

    resetMenuUi() {
      this.activeMenuDayTab = 0
      this.isMenuOpen = false
    },

    openModal(name) {
      this.activeModal = name
    },

    closeModal() {
      this.activeModal = null
    },

    isModalActive(name) {
      return this.activeModal === name
    }
  }
})
 