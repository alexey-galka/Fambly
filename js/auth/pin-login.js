import {API_PIN, apiRequest} from "../utils/api.js";
import {decryptData, getKey} from "../utils/cryptoUtils.js";

let pin = ""; // Хранит вводимый PIN
let email;
const passwordDisplay = document.getElementById("passwordDisplay");

// Инициализация формы логина по PIN
async function initialize() {
  try {
    const key = await getKey();
    const savedEncryptedData = JSON.parse(localStorage.getItem('encryptedEmail'));
    if (savedEncryptedData) {
      const { iv, encryptedData } = savedEncryptedData;
      email = await decryptData(encryptedData, iv, key);
  }

    handlePinLogin();
  } catch (error) {
    console.error("Ошибка при инициализации:", error);
    alert("Произошла ошибка. Попробуйте снова.");
    window.location.href = "../../pages/auth/sign-in.html";
  }


  // Работа с локальным хранилищем
  let isPinVerified = null;
  try {
    isPinVerified = localStorage.getItem('encryptedPIN');
  } catch (storageError) {
    alert('Возникла проблема с доступом к локальному хранилищу. Проверьте настройки браузера.');
    return;
  }

  // Редирект на соответствующую страницу
  if (!isPinVerified) {
    window.location.href = '../../pages/auth/set-pin.html'; // Установка пина
  }
}

// Логика ввода PIN
function handlePinLogin() {
  function updateDisplay() {
    // Обновляет отображение маленьких кругов
    passwordDisplay.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const circle = document.createElement("div");
      circle.className = i < pin.length ? "filled" : "";
      passwordDisplay.appendChild(circle);
    }
  }

  async function validatePin() {
    const pinData = {
      email: email,
      pin: pin,
    };

    try {
      // Отправляем PIN и user_id на сервер для проверки
      const response = await apiRequest(API_PIN.LOGIN_WITH_PIN, 'POST', pinData);


      if (response.ok) {
        alert("Авторизация успешна!");
        window.location.href = "../../pages/dashboard/dashboard.html"; // Перенаправление на главную страницу
      } else {
        const error = await response.json();
        alert(error.detail || "Неверный PIN. Попробуйте снова.");
        resetPin();
      }
    } catch (error) {
      console.error("Ошибка при проверке PIN:", error);
      alert("Произошла ошибка. Попробуйте снова.");
      resetPin();
    }
  }

  function addDigit(digit) {
    if (pin.length < 4) {
      pin += digit;
      updateDisplay();
      if (pin.length === 4) {
        validatePin();
      }
    }
  }

  window.addDigit = addDigit;

  function clearPin() {
    pin = "";
    updateDisplay();
  }

  window.clearPin = clearPin;

  function resetPin() {
    pin = "";
    updateDisplay();
  }

  // Инициализация отображения
  updateDisplay();
}

// Запуск функции инициализации
initialize();

function goBack () {
  window.location.href = '../../pages/auth/sign-in.html';
}

window.goBack = goBack;