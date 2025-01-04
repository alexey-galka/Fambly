import {API_TASKS, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const toDoSection = document.getElementById("toDoTasks");
  const inProgressSection = document.getElementById("inProgressTasks");
  const completedSection = document.getElementById("completedTasks");
  const overdueSection = document.getElementById("overdueTasks");

  let currentTasks = []; // Хранение текущего списка задач

  async function fetchTasks() {
    try {
      const response = await apiRequest(API_TASKS.GET_ALL_FAMILY_TASKS, 'GET');

      if (response.ok) {
        const tasks = await response.json();
        currentTasks = tasks; // Сохраняем список задач
        renderTasks(tasks);
      } else {
        alert("Не удалось загрузить задачи. Попробуйте снова.");
      }
    } catch (error) {
      console.error("Ошибка при получении задач:", error);
    }
  }

  function renderTasks(tasks) {
    const sections = {
      "To Do": toDoSection,
      "In Progress": inProgressSection,
      "Completed": completedSection,
      "Overdue": overdueSection,
    };

    Object.values(sections).forEach(section => (section.innerHTML = ""));

    tasks.forEach(task => {
      if (calculateOverdue(task.due_date) > 0 && task.status !== "Completed") {
        task.status = "Overdue";
      }

      const assignee = task.assignee_first_name && task.assignee_last_name
        ? `${task.assignee_first_name} ${task.assignee_last_name}`
        : "Не назначено";

      const taskItem = document.createElement("li");
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      taskItem.className = "task-item";
      taskItem.innerHTML = `
        <div>
          <h3>${task.title}</h3>
          <p>Ответственный: ${assignee}</p>
          <small>Срок: ${new Date(task.due_date).toLocaleDateString('en-GB', options)}</small>
        </div>
      `;

        taskItem.addEventListener("click", () => {
          window.location.href = `task-info.html?taskId=${task.id}`;
        });

      sections[task.status]?.appendChild(taskItem);
    });

    updateTaskCounters(tasks);
  }

  function updateTaskCounters(tasks) {
    document.getElementById("toDoCount").textContent = `(${tasks.filter(task => task.status === "To Do").length})`;
    document.getElementById("inProgressCount").textContent = `(${tasks.filter(task => task.status === "In Progress").length})`;
    document.getElementById("completedCount").textContent = `(${tasks.filter(task => task.status === "Completed").length})`;
    document.getElementById("overdueCount").textContent = `(${tasks.filter(task => task.status === "Overdue").length})`;
  }

  function calculateOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  // function goToTaskInfo(taskId) {
  //   window.location.href = `task-info.html?taskId=${taskId}`;
  // }
  // window.goToTaskInfo = goToTaskInfo;

  function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.toggle("hidden");
  }
  window.toggleSection = toggleSection;

  function goToDashboard() {
    window.location.href = "../../pages/dashboard/dashboard.html";
  }
  window.goToDashboard = goToDashboard;

  fetchTasks();
});
