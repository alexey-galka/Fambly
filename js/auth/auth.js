import { encryptData, getKey } from '../utils/cryptoUtils.js';
import { apiRequestWithoutCookies , API_AUTH} from '../utils/api.js';

const registerForm = document.getElementById('registerForm');
// const registerErrorMessage = document.getElementById('errorMessage');

const key = await getKey();


registerForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Предотвращаем стандартное поведение формы

  const formData = new FormData(registerForm);
  const userData = Object.fromEntries(formData); // Преобразуем FormData в объект

  // Проверяем обязательные поля
  if (!userData.first_name || !userData.last_name) {
    alert('Пожалуйста, заполните все поля.');
    return;
  }

  if (userData.password.length < 4) {
    alert('Пароль должен содержать минимум 4 символа.');
    return;
  }

  if (userData.password !== userData.confirm_password) {
    alert('Пароли не совпадают.');
    return;
  }

  delete userData.confirm_password; // Удаляем поле подтверждения пароля перед отправкой

  try {
    const response = await apiRequestWithoutCookies(API_AUTH.CREATE_USER, 'POST', userData);

    if (response.ok) {
      const data = await response.json();

      // Проверка на существование data.email
      if (data && data.email) {
        if (key) {
          try {
            const { iv, encryptedData } = await encryptData(data.email.toString(), key);
            localStorage.setItem('encryptedEmail', JSON.stringify({ iv: Array.from(iv), encryptedData: Array.from(encryptedData) }));
          } catch (encryptError) {
            console.error("Ошибка при шифровании данных:", encryptError);
            // registerErrorMessage.textContent = 'Ошибка при шифровании данных.';
            return;
          }
        } else {
          console.error("Ключ для шифрования не сгенерирован.");
          // registerErrorMessage.textContent = 'Ошибка при генерации ключа.';
          return;
        }

        // Перенаправление на страницу ввода кода
        window.location.href = '../../pages/auth/registration-success.html';
      } else {
        console.error("Ошибка: ID не найден в ответе.");
        // registerErrorMessage.textContent = 'Ошибка регистрации. Попробуйте позже.';
      }
    } else {
      // Обработка ошибок сервера
      const error = await response.json();
      // registerErrorMessage.textContent = error.detail || 'Произошла ошибка при регистрации.';
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    // registerErrorMessage.textContent = 'Ошибка сети. Попробуйте позже.';
  }
});
