import {API_EVENTS, API_TASKS, apiRequest} from "../utils/api.js";

document.addEventListener('DOMContentLoaded', async () => {
  const event_id = new URLSearchParams(window.location.search).get("eventId");
  const eventTitleElement = document.getElementById("eventTitle");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  // Получение данных задачи
  async function fetchEventDetails() {
    try {
      const response = await apiRequest(API_EVENTS.GET_EVENT_INFO, 'GET', null, {event_id});

      if (response.ok) {
        const event = await response.json();
        populateEventDetails(event);
      }
    } catch (error) {
      console.error("Ошибка при загрузке задачи:", error);
    }
  }

  // Заполнение заголовка с названием задачи
  function populateEventDetails(event) {
    eventTitleElement.textContent = `Вы уверены, что хотите удалить событие "${event.title}"?`;
  }

  // Удаление задачи
  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      const response = await apiRequest(API_EVENTS.DELETE_EVENT, 'DELETE', null, {event_id})

      if (response.ok) {
        window.location.href = "../../pages/events/calendar.html";
      }
    } catch (error) {
      console.error("Ошибка при удалении события:", error);
      alert("Произошла ошибка при удалении события. Попробуйте снова.");
    }
  });

  // Отмена удаления
  window.cancelDeletion = function () {
    window.history.back()
  };

  // Инициализация
  fetchEventDetails();
});
