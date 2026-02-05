// utils/menuPages.js
export const menuPages = [
  {
    key: 'home',
    titleKey: 'pages.title.home',
    routeName: 'index',         // главная
    icon: '/icons/house-solid.svg'
  },
  {
    key: 'nutrition',
    titleKey: 'pages.title.nutrition',
    routeName: 'nutrition',     // совпадает с i18n.pages.nutrition
    icon: '/icons/utensils-solid.svg'
  },
   {
    key: 'contact',
    titleKey: 'pages.title.contact',
    routeName: 'contact',     // совпадает с i18n.pages.nutrition
    icon: '/icons/file-contract-solid.svg'
  }
  // сюда можно добавить ещё пункты, если нужно
]
