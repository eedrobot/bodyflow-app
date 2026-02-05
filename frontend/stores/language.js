export const useLanguageStore = defineStore('language', {
  state: () => ({
    languages: [
      { code: "en", short: "En", name: "English", flag: flagsIcons.en },
      { code: "ru", short: "Ru", name: "Русский", flag: flagsIcons.ru },
      { code: "uk", short: "Ua", name: "Українська", flag: flagsIcons.uk }
    ]
  }),
})
