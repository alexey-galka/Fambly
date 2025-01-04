import {API_TASKS, apiRequest} from "../utils/api.js";

document.addEventListener('DOMContentLoaded', async () => {
  const taskId = new URLSearchParams(window.location.search).get("taskId");
  const taskTitleElement = document.getElementById("taskTitle");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  // Получение данных задачи
  async function fetchTaskDetails() {
    try {
      // const response = await apiRequest(API_TASKS.GET_TASK, 'GET')
      const response = await apiRequest(API_TASKS.GET_TASK.replace("{task_id}", taskId), 'GET');

      if (response.ok) {
        const task = await response.json();
        populateTaskDetails(task);
      } else {
        alert("Не удалось загрузить данные задачи.");
      }
    } catch (error) {
      console.error("Ошибка при загрузке задачи:", error);
      alert("Произошла ошибка при загрузке задачи.");
    }
  }

  // Заполнение заголовка с названием задачи
  function populateTaskDetails(task) {
    taskTitleElement.textContent = `Вы уверены, что хотите удалить задачу "${task.title}"?`;
  }

  // Удаление задачи
  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      const response = await apiRequest(API_TASKS.GET_TASK.replace("{task_id}", taskId), 'DELETE');

      if (response.ok) {
        alert("Задача успешно удалена.");
        window.location.href = "../../pages/tasks/tasks.html"; // Редирект на список задач
      } else {
        alert("Не удалось удалить задачу.");
      }
    } catch (error) {
      console.error("Ошибка при удалении задачи:", error);
      alert("Произошла ошибка при удалении задачи. Попробуйте снова.");
    }
  });

  // Отмена удаления
  window.cancelDeletion = function () {
    window.location.href = `task-info.html?taskId=${taskId}`;
  };

  // Инициализация
  fetchTaskDetails();
});
