import {API_FAMILY, API_TASKS, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  const createTaskForm = document.getElementById("createTaskForm");
  const assignedToSelect = document.getElementById("assignedTo");

  // Получаем список членов семьи
  async function fetchFamilyMembers() {
    try {
      const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET')

      if (response.ok) {
        const familyData = await response.json();
        if (familyData.members) {
          populateMembersSelect(familyData.members);
        }
      } else {
        alert("Не удалось загрузить данные о семье.");
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных о семье:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    }
  }

  // Заполняем выпадающий список членами семьи
  function populateMembersSelect(members) {
    members.forEach(member => {
      const option = document.createElement("option");
      option.value = member.id; // ID члена семьи
      option.textContent = `${member.first_name} ${member.last_name}`;
      assignedToSelect.appendChild(option);
    });
  }

  // Отправка данных о новой задаче
  createTaskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const taskTitle = document.getElementById("taskTitle").value;
    const taskDescription = document.getElementById("taskDescription").value;
    const dueDate = document.getElementById("dueDate").value;
    const assignedTo = assignedToSelect.value;

    try {
      const response = await apiRequest(API_TASKS.CREATE_TASK, 'POST', {
        title: taskTitle,
        description: taskDescription,
        due_date: dueDate,
        assignee_id: assignedTo || null,
      });

      if (response.ok) {
        const taskData = await response.json();
        window.location.href = "tasks.html"; // Переход к задачам
      } else {
        const error = await response.json();
        alert(`Ошибка при создании задачи: ${error.detail || "Попробуйте снова."}`);
      }
    } catch (error) {
      console.error("Ошибка при создании задачи:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    }
  });

  // Инициализация: загружаем список членов семьи
  fetchFamilyMembers();
});


function goToTasks() {
  window.location.href="../../pages/tasks/tasks.html";
}

window.goToTasks = goToTasks;