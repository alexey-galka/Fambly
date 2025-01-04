import {API_FAMILY, API_TASKS, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const editTaskForm = document.getElementById("editTaskForm");
  const taskTitleInput = document.getElementById("taskTitle");
  const taskDescriptionInput = document.getElementById("taskDescription");
  const dueDateInput = document.getElementById("dueDate");
  const assignedToSelect = document.getElementById("assignedTo");
  const taskStatusSelect = document.getElementById("taskStatus");

  const taskId = new URLSearchParams(window.location.search).get("taskId");

  let currentTask = null;

  // Получение данных задачи
  async function fetchTaskDetails() {
    try {
      const response = await apiRequest(API_TASKS.GET_TASK.replace("{task_id}", taskId), 'GET');


      if (response.ok) {
        const task = await response.json();
        currentTask = task; // Сохраняем данные задачи
        return task;
      }
    } catch (error) {
      console.error("Ошибка при загрузке задачи:", error);
    }
  }

  // Получение списка членов семьи
  async function fetchFamilyMembers() {
    try {
      const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

      if (response.ok) {
        const familyData = await response.json();
        return familyData.members;
      } else {
        alert("Не удалось загрузить членов семьи.");
      }
    } catch (error) {
      console.error("Ошибка при загрузке членов семьи:", error);
    }
  }

  // Заполнение формы данными задачи
  function populateForm(task, members) {
    taskTitleInput.value = task.title;
    taskDescriptionInput.value = task.description;
    dueDateInput.value = new Date(task.due_date).toLocaleDateString("sv-SE");

    // Заполнение выпадающего списка
    members.forEach(member => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = `${member.first_name} ${member.last_name}`;
      assignedToSelect.appendChild(option);
    });

    // Установка значения "Ответственный"
    assignedToSelect.value = task.assignee_id || "";

    // Установка текущего статуса
    taskStatusSelect.value = task.status || "To Do";
  }

  // Обработка отправки формы
  editTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedTask = {
      title: taskTitleInput.value,
      description: taskDescriptionInput.value,
      due_date: dueDateInput.value,
      assignee_id: assignedToSelect.value || null,
      status: taskStatusSelect.value, // Передаем текущий статус задачи
    };
    console.log(assignedToSelect.value)

    try {
      const response = await apiRequest(API_TASKS.GET_TASK.replace("{task_id}", taskId), 'PUT', updatedTask);

      if (response.ok) {
        window.location.href = `task-info.html?taskId=${taskId}`;
      }
    } catch (error) {
      console.error("Ошибка при обновлении задачи:", error);
    }
  });


  // Инициализация: загрузка данных задачи и членов семьи
  const [task, members] = await Promise.all([fetchTaskDetails(), fetchFamilyMembers()]);
  if (task && members) {
    populateForm(task, members);
  }
});

window.goBack = function () {
  window.history.back();
};

window.goBack = goBack;
