import {decryptData, getKey} from '../utils/cryptoUtils.js';
import {apiRequest, API_EVENTS, API_TASKS, API_FAMILY} from "../utils/api.js";

let selectedDate = new Date();
let currentMonth = new Date();
let user_id;

document.addEventListener("DOMContentLoaded", async () => {
  const calendarGrid = document.getElementById("calendarGrid");
  const eventsList = document.getElementById("events");
  const today = new Date();
  let selectedDate = today;
  const currentMonthElement = document.getElementById("currentMonth");

  async function initialize() {
    // Получаем зашифрованные данные из localStorage
    const key = await getKey();
    const savedEncryptedData = JSON.parse(localStorage.getItem('encryptedId'));
    if (savedEncryptedData) {
      const { iv, encryptedData } = savedEncryptedData;
      user_id = await decryptData(encryptedData, iv, key);
    }
  }

  initialize();


  document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
  document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

  updateCurrentMonth();
  renderCalendar(today);
  await fetchAndRenderEventsAndTasks(selectedDate);


  function updateCurrentMonth() {
    const monthNames = [
      "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];
    const year = currentMonth.getFullYear();
    const month = monthNames[currentMonth.getMonth()];
    document.getElementById("currentMonth").textContent = `${month} ${year}`;
  }


  async function changeMonth(offset) {
    currentMonth.setMonth(currentMonth.getMonth() + offset);
    renderCalendar(currentMonth);
    updateCurrentMonth();
    selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    await fetchAndRenderEventsAndTasks(selectedDate);
  }


// Получение задач и событий
  async function fetchAndRenderEventsAndTasks(date) {
    try {
      const eventsResponse = await apiRequest(API_EVENTS.GET_ALL_FAMILY_EVENTS, 'GET');
      const tasksResponse = await apiRequest(API_TASKS.GET_ALL_FAMILY_TASKS, 'GET');

      const events = eventsResponse.ok ? await eventsResponse.json() : [];
      console.log(events)
      const tasks = tasksResponse.ok ? await tasksResponse.json() : [];

      const activeTasks = tasks.filter(task => task.is_closed == false);
      const activeEvents = events.filter(event =>
        event.participants.some(participant => participant.user_id == user_id)
      );
      console.log("active Events", activeEvents)

      // const formattedEvents = events.flatMap(event => expandRecurringEvent(event));
      const formattedTasks = activeTasks.map(formatTaskAsEvent)
      const formattedEvents = activeEvents.flatMap(event => expandRecurringEvent(event));

      renderEventsAndTasks(formattedEvents, formattedTasks, date);

      // Обновляем маркеры в календаре для всего месяца
      markCalendarDaysWithEvents(formattedEvents, formattedTasks);
    } catch (error) {
      console.error("Ошибка загрузки событий и задач:", error);
    }
  }


// Обработка задач
  function formatTaskAsEvent(task) {
    return {
      id: task.id,
      title: task.title,
      due_date: task.due_date,
      type: "task",
      assignee_first_name: task.assignee_first_name,
      assignee_last_name: task.assignee_last_name,
      status: task.status,
      is_closed: task.is_closed
    };
  }


// Отображение маркеров на календаре
  function markCalendarDaysWithEvents(events, tasks) {
    const daysWithEvents = new Set();

    // Обработка повторяющихся событий
    events.forEach(event => {
      if (!event.start_date) return;

      const startDate = new Date(event.start_date);
      const endDate = event.recurring_end_date ? new Date(event.recurring_end_date) : startDate;
      const interval = event.recurring_interval || 1; // Интервал повтора (по умолчанию 1)
      const repeatDays = event.weekdays || [];

      if (!event.is_recurring || event.recurring_pattern === "none") {
        daysWithEvents.add(event.start_date);
      } else {
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          const daysOfWeekMapping = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayOfWeekString = daysOfWeekMapping[dayOfWeek];
          if (event.recurring_pattern === "daily") {
            // Добавляем текущую дату
            daysWithEvents.add(currentDate.toISOString().split("T")[0]);
            currentDate.setDate(currentDate.getDate() + interval);
          } else if (event.recurring_pattern === "weekly") {
            // Проверяем, совпадает ли день недели с repeatDays
            if (repeatDays.includes(dayOfWeekString)) {
              daysWithEvents.add(currentDate.toISOString().split("T")[0]);
            }
            currentDate.setDate(currentDate.getDate() + 1); // Переходим на следующий день
          }
        }
      }
    });

    const daysWithTasks = new Set(tasks.map(task => {
      if (!task.due_date) {
        return null;
      }
      if (task.is_closed) {
        return null;
      }
      const eventDate = new Date(task.due_date);
      return eventDate.toLocaleDateString("sv-SE");
    }).filter(Boolean));


    // Проверяем дни в календаре
    document.querySelectorAll(".calendar-grid .date").forEach(day => {
      const eventDate = day.dataset.date;
      const taskDate = day.dataset.date;
      day.querySelector(".marker-event")?.remove();
      day.querySelector(".marker-task")?.remove();

      if (daysWithEvents.has(eventDate)) {
        const eventMarker = document.createElement("div");
        eventMarker.classList.add("marker-event");
        day.appendChild(eventMarker);
      }

      if (daysWithTasks.has(taskDate)) {
        const taskMarker = document.createElement("div");
        taskMarker.classList.add("marker-task");
        day.appendChild(taskMarker);
      }
    });
  }


// Создание массива событий с датами для всех дней повторения
  function expandRecurringEvent(event) {
    const expandedEvents = [];
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.recurring_end_date || event.start_date);
    const interval = event.recurring_interval || 1;

    if (!event.is_recurring || event.recurring_pattern === "none") {
      // Если событие не повторяется, возвращаем его как есть
      return [event];
    }

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.toLocaleDateString("en-US", { weekday: "short" });

      if (
        (event.recurring_pattern === "daily") ||
        (event.recurring_pattern === "weekly" && event.weekdays.includes(dayOfWeek)) ||
        (event.recurring_pattern === "weekday" && ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(dayOfWeek))
      ) {
        // Создаём копию события для каждой даты
        expandedEvents.push({
          ...event,
          start_date: currentDate.toISOString().split("T")[0], // Устанавливаем текущую дату
        });
      }

      // Увеличиваем дату в зависимости от интервала
      currentDate.setDate(
        currentDate.getDate() + (event.recurring_pattern === "daily" ? interval : 1)
      );
    }

    return expandedEvents;
  }


// Отрисовка событий и задач в ленте
  async function renderEventsAndTasks(events, tasks, selectedDate) {
    eventsList.innerHTML = "";

    function formatTime(time) {
      const date = new Date(`1970-01-01T${time}`);
      return new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit' }).format(date);
    }

    // Фильтруем события и задачи для выбранной даты
    const filteredEvents = events.filter(event => isSameDate(new Date(event.start_date), selectedDate));
    const filteredTasks = tasks.filter(task => isSameDate(new Date(task.due_date), selectedDate));

    // Получение данных о днях рождения
    async function fetchBirthdays() {
      try {
        const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

        if (response.ok) {
          const familyData = await response.json();
          const currentYear = new Date().getFullYear();

          // Преобразование дней рождения в даты текущего года
          return familyData.members.map(member => {
            if (!member.birth_date) return null;
            const [year, month, day] = member.birth_date.split("-");
            return {
              id: member.id,
              name: `${member.first_name} ${member.last_name}`,
              birthday: new Date(currentYear, month - 1, day),
            };
          }).filter(birthday => birthday && isSameDate(birthday.birthday, selectedDate));
        }

        return [];
      } catch (error) {
        console.error("Ошибка загрузки данных о днях рождения:", error);
        return [];
      }
    }

    // Рендер событий и задач
    function render() {
      if (filteredEvents.length === 0 && filteredTasks.length === 0 && !birthdays.length) {
        eventsList.innerHTML = "<p>Событий и задач нет</p>";
        return;
      }

      // Рендер событий
      filteredEvents.forEach(event => {
        const li = document.createElement("li");
        li.dataset.id = event.id;
        li.dataset.type = "event";

        li.innerHTML = `
        <div class="event-item">
          <p><strong>Событие: </strong>${event.title}</p>
          <p><strong>Место:</strong> ${event.location || "-"}</p>
          <p><strong>Время:</strong> ${formatTime(event.start_time)} - ${formatTime(event.end_time)}</p>
        </div>
      `;

        li.addEventListener("click", () => {
          window.location.href = `../../pages/events/event-details.html?eventId=${event.id}`;
        });

        eventsList.appendChild(li);
      });

      // Рендер задач
      filteredTasks.forEach(task => {
        const li = document.createElement("li");
        li.dataset.id = task.id;
        li.dataset.type = "task";
        console.log(task)

        li.innerHTML = `
        <div class="task-item">
          <p><strong>Задача:</strong> ${task.title}</p>
          <p>
            <strong>Ответственный:</strong> 
            ${task.assignee_first_name
                    ? `${task.assignee_first_name} ${task.assignee_last_name || ''}`
                    : "Не назначено"}
          </p>
          <p><strong>Статус:</strong> ${task.status}</p>
        </div>
      `;

        li.addEventListener("click", () => {
          window.location.href = `../../pages/tasks/task-info.html?taskId=${task.id}`;
        });

        eventsList.appendChild(li);
      });

      // Рендер дней рождения
      birthdays.forEach(birthday => {
        const li = document.createElement("li");
        li.dataset.id = birthday.id;
        li.dataset.type = "birthday";

        li.innerHTML = `
        <div class="birthday-item">
          <p><strong>День рождения:</strong> ${birthday.name}</p>
          <p><strong>Дата:</strong> ${selectedDate.toLocaleDateString('ru')}</p>
        </div>
      `;

        eventsList.appendChild(li);
      });
    }

    // Загружаем дни рождения и рендерим список
    const birthdays = await fetchBirthdays();
    render();
  }


// Отрисовка календаря
  function renderCalendar(currentDate) {
    calendarGrid.innerHTML = ""; // Очистка календаря

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const daysInMonth = lastDayOfMonth.getDate();
    const startDay = (firstDayOfMonth.getDay() + 6) % 7; // Понедельник как первый день

    // Пустые ячейки перед первым днем месяца
    for (let i = 0; i < startDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.classList.add("empty");
      calendarGrid.appendChild(emptyCell);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayCell = document.createElement("button");
      dayCell.classList.add("date");
      dayCell.textContent = day;

      const formattedDate = date.toLocaleDateString("sv-SE");
      dayCell.dataset.date = formattedDate;

      if (isSameDate(date, new Date())) {
        dayCell.classList.add("current");
      }

      if (isSameDate(date, selectedDate)) {
        dayCell.classList.add("selected");
      }

      dayCell.addEventListener("click", () => {
        selectedDate = date;
        renderCalendar(currentMonth);

        fetchAndRenderEventsAndTasks(selectedDate);

        /////
        fetchAndMarkBirthdays()
      });

      calendarGrid.appendChild(dayCell);
    }
  }


// Сравнение даты
  function isSameDate(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }




  ///////
  async function fetchAndMarkBirthdays() {
    try {
      const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

      if (response.ok) {
        const familyData = await response.json();
        const currentYear = new Date().getFullYear();

        // Преобразование дней рождения в даты текущего года
        const birthdays = familyData.members.map(member => {
          if (!member.birth_date) return null;
          const [year, month, day] = member.birth_date.split("-");
          return new Date(currentYear, month - 1, day).toLocaleDateString("sv-SE");
        }).filter(Boolean);

        markBirthdaysOnCalendar(birthdays);
      }
    } catch (error) {
      console.error("Ошибка загрузки данных о семье:", error);
    }
  }

// Добавить дни рождения в календарь
  function markBirthdaysOnCalendar(birthdays) {
    document.querySelectorAll(".calendar-grid .date").forEach(day => {
      const date = day.dataset.date;

      if (birthdays.includes(date)) {
        const birthdayMarker = document.createElement("div");
        birthdayMarker.classList.add("marker-birthday");
        day.appendChild(birthdayMarker);
      }
    });
  }
  //////




  window.addNewEvent = () => (window.location.href = `../../pages/events/create-event.html`);
  window.goToDashboard = () => (window.location.href = "../../pages/dashboard/dashboard.html");
  updateCurrentMonth();



  ////
  await fetchAndMarkBirthdays();

});
