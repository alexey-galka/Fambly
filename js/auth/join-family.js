import { encryptData, getKey } from '../utils/cryptoUtils.js';
import { apiRequest , API_AUTH } from '../utils/api.js';

const form = document.getElementById("joinFamilyForm");
const messageElement = document.getElementById("message");

const key = await getKey();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const code = document.getElementById("code").value.trim();

  if (!email || !code) {
    alert("Пожалуйста, заполните все поля.");
    return;
  }

  try {
    const response = await apiRequest(API_AUTH.JOIN_FAMILY, 'POST', { email: email, code: code });

    if (response.ok) {
      const data = await response.json();

      if (data && data.email) {
        if (key) {
          try {
            const {iv, encryptedData} = await encryptData(data.email.toString(), key);
            localStorage.setItem('encryptedEmail', JSON.stringify({
              iv: Array.from(iv),
              encryptedData: Array.from(encryptedData)
            }));
          } catch (encryptError) {
            console.error("Ошибка при шифровании данных:", encryptError);
            return;
          }
        } else {
          console.error("Ключ для шифрования не сгенерирован.");
          return;
        }
      }

      window.location.href = "../../pages/auth/set-password.html";
    } else {
      const errorData = await response.json();
      messageElement.textContent = errorData.detail || "Ошибка при присоединении.";
    }
  } catch (error) {
    console.error("Ошибка:", error);
    messageElement.textContent = "Ошибка при подключении. Попробуйте позже.";
  }
});


function goBack() {
  window.location.href = "../../pages/auth/sign-in.html";
}

window.goBack = goBack;