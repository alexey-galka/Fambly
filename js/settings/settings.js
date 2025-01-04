const settingsForm = document.getElementById('settingsForm');
import {API_AUTH, API_PROFILE, API_SETTINGS, apiRequest} from "../utils/api.js";

const editPersonButton = document.getElementById('editButton');
const savePersonButton = document.getElementById('saveButton');
const cancelPersonButton = document.getElementById('cancelButton');

// Поля формы
const emailInput = document.getElementById('email');
const firstNameInput = document.getElementById('first_name');
const lastNameInput = document.getElementById('last_name');
const birthDateInput = document.getElementById('birth_date');


const editPasswordButton = document.getElementById('editBtn');
const savePasswordButton = document.getElementById('saveBtn');
const cancelPasswordButton = document.getElementById('cancelBtn');

const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmNewPasswordInput = document.getElementById('confirmPassword');

const logoutButton = document.getElementById('logout');

// Функция загрузки данных пользователя
async function fetchUserData() {
  try {
    const response = await apiRequest(API_PROFILE.USER_INFO, 'GET');

    if (!response.ok) {
      throw new Error('Ошибка при получении данных пользователя.');
    }

    const userData = await response.json();
    populateUserData(userData); // Заполняем форму
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    alert('Не удалось загрузить данные. Попробуйте снова.');
  }
}

// Функция заполнения формы данными пользователя
function populateUserData(userData) {
  emailInput.value = userData.email || '';
  firstNameInput.value = userData.first_name || '';
  lastNameInput.value = userData.last_name || '';
  birthDateInput.value = userData.birth_date || ''; // Убедитесь, что дата в формате YYYY-MM-DD
}

// Переключение режима редактирования Персональных данных
function toggleEditPersonMode(isEditing) {
  const editableFields = [firstNameInput, lastNameInput, birthDateInput];
  editableFields.forEach(input => input.disabled = !isEditing);

  editPersonButton.classList.toggle('hidden', isEditing);
  savePersonButton.classList.toggle('hidden', !isEditing);
  cancelPersonButton.classList.toggle('hidden', !isEditing);
}

// Переключение режима редактирования Персональных данных
function toggleEditPasswordMode(isEditing) {
  const editableFields = [currentPasswordInput, newPasswordInput, confirmNewPasswordInput];
  editableFields.forEach(input => input.disabled = !isEditing);

  editPasswordButton.classList.toggle('hidden', isEditing);
  savePasswordButton.classList.toggle('hidden', !isEditing);
  cancelPasswordButton.classList.toggle('hidden', !isEditing);
}

// Обработка кнопок
editPersonButton.addEventListener('click', () => toggleEditPersonMode(true));
cancelPersonButton.addEventListener('click', () => toggleEditPersonMode(false));

editPasswordButton.addEventListener('click', () => toggleEditPasswordMode(true));
cancelPasswordButton.addEventListener('click', () => toggleEditPasswordMode(false));

// Сохранение данных
savePersonButton.addEventListener('click', async () => {
  const updatedData = {
    first_name: firstNameInput.value,
    last_name: lastNameInput.value,
    birth_date: birthDateInput.value,
    email: emailInput.value
  };

  try {
    const response = await apiRequest(API_SETTINGS.UPDATE_USER_INFO, 'PUT', updatedData);

    if (!response.ok) {
      throw new Error('Ошибка при сохранении данных.');
    }

    toggleEditPersonMode(false);
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    alert('Не удалось сохранить изменения.');
  }
});

savePasswordButton.addEventListener('click', async () => {
  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmNewPasswordInput.value.trim();

  // Проверка совпадения нового пароля и подтверждения пароля
  if (newPassword !== confirmPassword) {
    alert('Новый пароль и подтверждение пароля не совпадают.');
    return;
  }

  const updatedData = {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  };

  try {
    const response = await apiRequest(API_SETTINGS.UPDATE_PASSWORD, 'PUT', updatedData);

    if (!response.ok) {
      throw new Error('Ошибка при сохранении данных.');
    }

    alert('Пароль успешно обновлен.');
    toggleEditPasswordMode(false);
    currentPasswordInput.value = '';
    newPasswordInput.value = '';
    confirmNewPasswordInput.value = '';

  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    alert('Не удалось сохранить изменения.');
  }
});

logoutButton.addEventListener('click', async () =>{
  try {
    const response = await apiRequest(API_AUTH.DELETE_COOKIE, 'POST');

    if (response.ok) {
      // localStorage.removeItem('encryptedPIN');
      window.location.href = '../../pages/auth/sign-in.html'
    }
  } catch (error) {
    console.error('Ошибка при выходе:', error);
    alert('Не удалось выйти из системы.');
  }
})

// Загрузка данных пользователя при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchUserData);

function deleteAccount() {
  if (confirm('Вы уверены, что хотите удалить аккаунт?')) {
    alert('Аккаунт удалён.');
  }
}

function goBack() {
  window.location.href = "../../pages/dashboard/dashboard.html";
}

window.goBack = goBack;
window.deleteAccount = deleteAccount;
