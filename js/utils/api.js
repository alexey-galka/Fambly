const IP = '192.168.0.34';
const PORT = '8000';

// export const URL = `http://${IP}:${PORT}`;
export const URL = 'https://fresh-tapir-really.ngrok-free.app';

// Ручки (эндпоинты) API
export const API_AUTH = {
  CREATE_USER: '/auth/sign-up',
  LOGIN_USER: '/auth/sign-in',
  JOIN_FAMILY: '/auth/join-family',
  CREATE_PASSWORD: '/auth/create-password',
  DELETE_COOKIE: '/auth/logout',
  TOKEN_REFRESH: '/auth/refresh'
};


export const API_PIN = {
  SET_PIN: '/pin/set-pin',
  LOGIN_WITH_PIN: '/pin/login-with-pin',
  RESET_PIN: '/pin/reset-pin'
};

export const API_FAMILY = {
  CREATE_FAMILY: '/family',
  FAMILY_INFO: '/family',
};

export const API_MEMBER = {
  DELETE_MEMBER: '/member/{user_id}',
  INVITE_NEW_MEMBER: '/member/invite',
  GET_ALL_INVITATIONS: '/member/invitations',
  CANCEL_INVITATION: '/member/invite/{invitation_id}',
};

export const API_TASKS = {
  CREATE_TASK: '/tasks',
  GET_ALL_FAMILY_TASKS: '/tasks',
  GET_TASK: '/tasks/{task_id}',
  UPDATE_TASK: '/tasks/{task_id}',
  DELETE_TASK: '/tasks/{task_id}'
};

export const API_PROFILE = {
  USER_INFO: '/profile'
}

export const API_SETTINGS = {
  UPDATE_USER_INFO: '/settings/update-info',
  UPDATE_PASSWORD: '/settings/update-password'
};

export const API_EVENTS = {
  GET_ALL_FAMILY_EVENTS: '/event',
  CREATE_EVENT: '/event',
  GET_EVENT_INFO: '/event/{event_id}',
  DELETE_EVENT: '/event/{event_id}',
  UPDATE_EVENT: '/event/{event_id}'
};


/**
 * Базовая функция для выполнения HTTP-запросов.
 * @param {string} endpoint - URL-эндпоинт (например, '/auth/sign-in').
 * @param {string} method - HTTP-метод ('GET', 'POST', 'PUT', 'DELETE').
 * @param {object} [body] - Тело запроса для методов POST или PUT.
 * @param {object} [params] - Параметры для подстановки в URL.
 * @returns {Promise<object>} Ответ сервера.
 */
export async function apiRequest(endpoint, method, body = null, params = {}) {
  // Подстановка параметров в endpoint
  let url = `${URL}${endpoint}`;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, value);
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Попробуем обновить токен с помощью refresh token
    const refreshResponse = await refreshTokens();

    if (refreshResponse) {
      // Если токены обновлены, повторим запрос с новым access token
      response = await fetch(url, options);
    } else {
      throw new Error('Token refresh failed. Please log in again.');
    }
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response;
  return data;
}


// Функция для обновления токенов
  async function refreshTokens() {
    const refresh_token = getCookie('refresh_token');

    if (!refresh_token) {
      redirectToLogin();
      return null;
    }

    const refreshResponse = await fetch('http://192.168.0.34:8000/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({refresh_token}),
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      document.cookie = `access_token=${data.access_token}; path=/;`;
      return true;
    } else {
      redirectToLogin();
      return null;
    }
  }

// Вспомогательная функция для получения куки
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

// Перенаправление на страницу входа
  function redirectToLogin() {
    window.location.href = '../../pages/auth/sign-in.html';
  }



  export async function apiRequestWithoutCookies(endpoint, method, body = null, params = {}) {
    // Подстановка параметров в endpoint
    let url = `${URL}${endpoint}`;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value);
    }

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response;
    return data;
  }
