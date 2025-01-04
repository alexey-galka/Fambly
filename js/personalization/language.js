// Объект для хранения текущего языка
let currentLang = localStorage.getItem("language") || "en";

// Функция для загрузки переводов
async function loadTranslations(lang) {
  try {
    const response = await fetch(`../../assets/locales/${lang}.json`);
    return await response.json();
  } catch (error) {
    console.error("Ошибка загрузки переводов:", error);
    return {}; // Возвращаем пустой объект, если не удалось загрузить переводы
  }
}

// Функция для применения переводов на страницу
async function applyTranslations() {
  const translations = await loadTranslations(currentLang);

  // Применяем переводы для всех элементов с атрибутом data-i18n
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    const translation = translations[key];

    if (translation) {
      element.textContent = translation; // Заменяем текст
    }
  });
}

// Обработчик смены языка
document.getElementById("languageSelect").addEventListener("change", (event) => {
  currentLang = event.target.value; // Обновляем текущий язык
  localStorage.setItem("language", currentLang); // Сохраняем выбранный язык в localStorage

  // Применяем переводы для нового языка
  applyTranslations();
});

// Инициализация перевода при загрузке страницы
document.addEventListener("DOMContentLoaded", applyTranslations);




// // language.js
//
// // Глобальный объект для хранения данных
// let globalData = {};
//
// // Получение текущих настроек языка из localStorage
// let currentLang = localStorage.getItem("language") || "en";  // Значение языка по умолчанию — "en"
//
// // Функция для загрузки переводов
// async function loadTranslations(lang) {
//   try {
//     const response = await fetch(`../../assets/locales/${lang}.json`);
//     return await response.json();
//   } catch (error) {
//     console.error("Ошибка загрузки переводов:", error);
//     return {};
//   }
// }
//
// // Функция для применения динамического контента с переводами
// async function applyDynamicContentWithTranslations() {
//   const translations = await loadTranslations(currentLang);
//
//   document.querySelectorAll("[data-i18n]").forEach((element) => {
//     const key = element.getAttribute("data-i18n");
//
//     if (key) {
//       // Получаем перевод
//       const translation = translations[key];
//
//       if (translation) {
//         // Заменяем {{placeholders}} значениями из globalData (с поддержкой вложенности)
//         element.textContent = translation.replace(/{{(.*?)}}/g, (_, placeholder) => {
//           // Разбиваем placeholder на части (например, "profile.first_name")
//           return placeholder.split(".").reduce((obj, part) => obj?.[part], globalData) || placeholder;
//         });
//       }
//     }
//   });
// }
//
// // Обработчик смены языка
// const languageSelect = document.getElementById("languageSelect");
// if (languageSelect) {
//   languageSelect.value = currentLang;  // Устанавливаем текущий язык в выпадающем списке
//
//   languageSelect.addEventListener("change", async (event) => {
//     const selectedLang = event.target.value;
//     localStorage.setItem("language", selectedLang); // Сохраняем новый язык в localStorage
//
//     // Обновляем текущий язык
//     currentLang = selectedLang;
//
//     // Перезагружаем переводы для нового языка
//     await applyDynamicContentWithTranslations();
//   });
// }
//
// // Запуск инициализации при загрузке страницы
// document.addEventListener("DOMContentLoaded", async () => {
//   await applyDynamicContentWithTranslations();
// });
