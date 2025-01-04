import { decryptData, getKey } from '../utils/cryptoUtils.js';
import { apiRequest, API_AUTH } from "../utils/api.js";

const form = document.getElementById("setPasswordForm");
const messageElement = document.getElementById("message");
let email;

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  async function initialize() {
    // Получаем зашифрованные данные из localStorage
    const key = await getKey();
    const savedEncryptedData = JSON.parse(localStorage.getItem('encryptedEmail'));
    if (savedEncryptedData) {
      const { iv, encryptedData } = savedEncryptedData;
      email = await decryptData(encryptedData, iv, key);
    }
  }

  await initialize();


  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!password || !confirmPassword) {
    messageElement.textContent = "Пожалуйста, заполните все поля.";
    return;
  }

  if (password !== confirmPassword) {
    messageElement.textContent = "Пароли не совпадают.";
    return;
  }

  try {
    const response = await apiRequest(API_AUTH.CREATE_PASSWORD, 'POST', { email: email, password, confirm_password: confirmPassword })

    if (response.ok) {
      alert("Пароль успешно установлен!");

      // localStorage.removeItem("userEmail");
      window.location.href = "../../pages/auth/registration-success.html";
      form.reset();
    } else {
      const errorData = await response.json();
      messageElement.textContent = errorData.detail || "Ошибка при установке пароля.";
    }
  } catch (error) {
    console.error("Ошибка:", error);
    messageElement.textContent = "Ошибка при подключении. Попробуйте позже.";
  }
});
