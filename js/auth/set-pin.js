// import { decryptData, getKey, encryptData } from '../utils/cryptoUtils.js';
// import {API_PIN, apiRequest} from "../utils/api.js";
//
// let password = ""; // Хранит текущий ввод пользователя
// let confirmPassword = ""; // Хранит пароль для повторного ввода
// let isConfirming = false; // Флаг, показывающий текущий этап ввода
// const passwordDisplay = document.getElementById("passwordDisplay");
// const formTitle = document.getElementById("formTitle");
// let email;
// let key;
//
//
// // Основная асинхронная функция инициализации
// async function initialize() {
//   key = await getKey();
//   const savedEncryptedData = JSON.parse(localStorage.getItem('encryptedEmail'));
//   if (savedEncryptedData) {
//     const { iv, encryptedData } = savedEncryptedData;
//     email = await decryptData(encryptedData, iv, key);
//   }
//     handlePasswordForm(email);
// }
//
//
// // Функция обработки формы пароля
// function handlePasswordForm(user_id) {
//   function updateDisplay() {
//     // Обновляем отображение маленьких кругов
//     passwordDisplay.innerHTML = "";
//     const length = isConfirming ? confirmPassword.length : password.length;
//     for (let i = 0; i < 4; i++) {
//       const circle = document.createElement("div");
//       circle.className = i < length ? "filled" : "";
//       passwordDisplay.appendChild(circle);
//     }
//   }
//
//   async function saveEncryptedPin(pin, key) {
//     const encryptedData = await encryptData(pin, key);  // Шифруем PIN
//     const iv = encryptedData.iv;
//     const encryptedPin = encryptedData.encryptedData;
//
//     // Сохраняем зашифрованный PIN в localStorage
//     localStorage.setItem('encryptedPIN', JSON.stringify({ iv, encryptedData: encryptedPin }));
//   }
//
//   async function validatePasswords() {
//       const response = await apiRequest(API_PIN.SET_PIN, 'POST', {
//         pin: password,
//         email: email
//       });
//
//       if (response.ok) {
//         await saveEncryptedPin(password, key);
//         window.location.href = "../../pages/auth/pin-login.html";
//       }
//   }
//
//   async function addDigit(digit) {
//     if (isConfirming) {
//       if (confirmPassword.length < 4) {
//         confirmPassword += digit;
//         updateDisplay();
//         if (confirmPassword.length === 4) {
//           await validatePasswords();
//         }
//       }
//     } else {
//       if (password.length < 4) {
//         password += digit;
//         updateDisplay();
//         if (password.length === 4) {
//           // Переход на этап подтверждения
//           isConfirming = true;
//           formTitle.textContent = "Повторите код";
//           clearPasswordDisplay();
//         }
//       }
//     }
//   }
//
//   window.addDigit = addDigit;
//
//   function clearPasswordDisplay() {
//     // Очищает отображение, не сбрасывая данные
//     passwordDisplay.innerHTML = "";
//     for (let i = 0; i < 4; i++) {
//       const circle = document.createElement("div");
//       circle.className = "";
//       passwordDisplay.appendChild(circle);
//     }
//   }
//
//   function clearPassword() {
//     if (isConfirming) {
//       confirmPassword = "";
//     } else {
//       password = "";
//     }
//     updateDisplay();
//   }
//
//   window.clearPassword = clearPassword;
//
//   function resetForm() {
//     password = "";
//     confirmPassword = "";
//     isConfirming = false;
//     formTitle.textContent = "Установите код";
//     clearPasswordDisplay();
//   }
//
//   // Инициализация отображения
//   updateDisplay();
// }
//
// // Запуск функции инициализации
// initialize();
//


import { decryptData, getKey, encryptData } from '../utils/cryptoUtils.js';
import { API_PIN, apiRequest } from "../utils/api.js";

let password = ""; // Хранит текущий ввод пользователя
let confirmPassword = ""; // Хранит пароль для повторного ввода
let isConfirming = false; // Флаг, показывающий текущий этап ввода
const passwordDisplay = document.getElementById("passwordDisplay");
const formTitle = document.getElementById("formTitle");
const savePinButton = document.getElementById("savePin"); // Кнопка сохранения PIN
let email;
let key;

// Основная асинхронная функция инициализации
async function initialize() {
  key = await getKey();
  const savedEncryptedData = JSON.parse(localStorage.getItem('encryptedEmail'));
  if (savedEncryptedData) {
    const { iv, encryptedData } = savedEncryptedData;
    email = await decryptData(encryptedData, iv, key);
  }
  handlePasswordForm(email);
}

// Функция обработки формы пароля
function handlePasswordForm(email) {
  function updateDisplay() {
    // Обновляем отображение маленьких кругов
    passwordDisplay.innerHTML = "";
    const length = isConfirming ? confirmPassword.length : password.length;
    for (let i = 0; i < 4; i++) {
      const circle = document.createElement("div");
      circle.className = i < length ? "filled" : "";
      passwordDisplay.appendChild(circle);
    }
  }

  async function saveEncryptedPin(pin, key) {
    const encryptedData = await encryptData(pin, key); // Шифруем PIN
    const iv = encryptedData.iv;
    const encryptedPin = encryptedData.encryptedData;

    // Сохраняем зашифрованный PIN в localStorage
    localStorage.setItem('encryptedPIN', JSON.stringify({ iv, encryptedData: encryptedPin }));
  }

  async function validateAndSavePin() {
    if (password !== confirmPassword || password.length !== 4) {
      alert("Коды не совпадают или не полные. Попробуйте снова.");
      resetForm();
      return;
    }

    const response = await apiRequest(API_PIN.SET_PIN, 'POST', {
      pin: password,
      email: email
    });

    if (response.ok) {
      await saveEncryptedPin(password, key); // Сохраняем зашифрованный PIN
      window.location.href = "../../pages/auth/pin-login.html";
    } else {
      alert("Ошибка при установке PIN. Попробуйте снова.");
      resetForm();
    }
  }

  function addDigit(digit) {
    if (isConfirming) {
      if (confirmPassword.length < 4) {
        confirmPassword += digit;
        updateDisplay();
      }
    } else {
      if (password.length < 4) {
        password += digit;
        updateDisplay();
        if (password.length === 4) {
          // Переход на этап подтверждения
          isConfirming = true;
          formTitle.textContent = "Повторите код";
          clearPasswordDisplay();
        }
      }
    }
  }

  window.addDigit = addDigit;

  function clearPasswordDisplay() {
    passwordDisplay.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const circle = document.createElement("div");
      circle.className = "";
      passwordDisplay.appendChild(circle);
    }
  }

  function clearPassword() {
    if (isConfirming) {
      confirmPassword = "";
    } else {
      password = "";
    }
    updateDisplay();
  }

  function resetForm() {
    password = "";
    confirmPassword = "";
    isConfirming = false;
    formTitle.textContent = "Установите код";
    clearPasswordDisplay();
  }

  window.resetForm = resetForm;

  // Привязываем событие к кнопке
  savePinButton.addEventListener("click", validateAndSavePin);

  updateDisplay(); // Инициализация отображения
}

// Запуск функции инициализации
initialize();
