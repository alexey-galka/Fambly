import {API_TASKS, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const task_id = new URLSearchParams(window.location.search).get("taskId");

  // Получение данных задачи
  async function fetchTaskDetails() {
    try {
      const response = await apiRequest(API_TASKS.GET_TASK, 'GET', null, {task_id});

      if (response.ok) {
        const task = await response.json();
        populateTaskDetails(task);
      }
    } catch (error) {
      console.error("Ошибка при загрузке задачи:", error);
    }
  }

  // Заполнение данных задачи
  function populateTaskDetails(task) {
    console.log(task)
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    document.getElementById("taskTitle").textContent = task.title;
    document.getElementById("taskDescription").textContent = task.description;
    document.getElementById("taskDueDate").textContent = new Date(task.due_date).toLocaleDateString('en-GB', options);
    document.getElementById("taskAssignee").textContent =
      task.assignee_first_name && task.assignee_last_name
        ? `${task.assignee_first_name} ${task.assignee_last_name}`
        : "Не назначено";

    // Установка текущего статуса в выпадающий список
    const taskStatus = document.getElementById("taskStatus");
    taskStatus.value = task.status;  // Устанавливаем текущий статус задачи в select
  }

  // Функция для обновления статуса
  async function updateTaskStatus(newStatus) {
    try {
      const response = await apiRequest(API_TASKS.UPDATE_TASK, 'PUT', { status: newStatus }, {task_id});

      if (response.ok) {
        fetchTaskDetails(); // Перезагрузка данных для отображения изменений
      }
    } catch (error) {
      console.error("Ошибка при обновлении статуса задачи:", error);
    }
  }

  const editButton = document.getElementById("editButton");
  const deleteButton = document.getElementById("deleteButton");
  const backButton = document.getElementById("backButton");

  function editTask() {
    window.location.href = `edit-task.html?taskId=${task_id}`;
  }

  function deleteTask() {
    window.location.href = `delete-task.html?taskId=${task_id}`;
  }

  function goBack() {
    const tasksPage = '../../pages/tasks/tasks.html';
    const calendarPage = '../../pages/events/calendar.html';

    const referrer = document.referrer; // Предыдущий URL

    if (referrer.includes("tasks")) {
      window.location.href = tasksPage;
    } else if (referrer.includes("calendar")) {
      window.location.href = calendarPage;
    } else {
      // Если предыдущий URL не указан или не совпадает, перенаправляем на календарь
      window.location.href = calendarPage;
    }
  }

  editButton.addEventListener("click", editTask);
  deleteButton.addEventListener("click", deleteTask);
  backButton.addEventListener("click", goBack);


  window.updateTaskStatus = updateTaskStatus;

  // Инициализация
  fetchTaskDetails();
});
