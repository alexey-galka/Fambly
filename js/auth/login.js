import { API_AUTH, apiRequest } from '../utils/api.js';

const loginForm = document.getElementById("loginForm");

// Обработка отправки формы
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Предотвращаем стандартное поведение формы

  const formData = new FormData(loginForm);
  const userData = Object.fromEntries(formData.entries()); // Преобразуем FormData в объект

  try {
    // Выполняем запрос на авторизацию
    const response = await apiRequest(API_AUTH.LOGIN_USER, 'POST', userData);

    if (!response.ok) {
      const error = await response.json();
      alert(error.detail || 'Произошла ошибка при входе');
      return;
    }

    const data = await response.json();

    // Проверяем наличие токена
    if (!data.access_token) {
      alert('Не удалось получить токен. Повторите попытку.');
      // return;
    } else {
      window.location.href = '../../pages/dashboard/dashboard.html';
    }
  } catch (error) {
    console.error("Ошибка при авторизации:", error);
    alert('Ошибка сети. Проверьте подключение и попробуйте позже.');
  }
});