import { apiRequest , API_PROFILE, API_TASKS, API_FAMILY, API_EVENTS } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  const userNameElement = document.getElementById('userName');
  const taskCountElement = document.getElementById('taskCount');
  const nextTaskElement = document.getElementById('nextTask');
  const calendarReminderElement = document.getElementById('calendarReminder');
  const calendarMenuItem = document.getElementById("calendar");
  const tasksMenuItem = document.getElementById("tasks");


  // Функция для получения данных пользователя
  async function fetchUserData() {
    try {
      const response = await apiRequest(API_PROFILE.USER_INFO, 'GET');

      if (response.ok) {
        const data = await response.json();

        userNameElement.textContent = data.first_name;

        if (!data.family_id) {
          tasksMenuItem.style.pointerEvents = "none"; // Отключает клики
          tasksMenuItem.style.opacity = "0.5";       // Уменьшает видимость
          calendarMenuItem.style.pointerEvents = "none";
          calendarMenuItem.style.opacity = "0.5";
        }

        fetchAssignedTasks(data.id); // Передаем ID пользователя
        fetchUserEventsAndBirthdays(data.id);
      } else {
        console.error('Ошибка при получении данных пользователя:', response.status, response.statusText);
        alert('Не удалось загрузить данные. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Сетевая ошибка:', error);
      alert('Ошибка сети. Попробуйте позже.');
    }
  }


  // Функция для получения задач, назначенных текущему пользователю
  async function fetchAssignedTasks(userId) {

    try {
      const response = await apiRequest(API_TASKS.GET_ALL_FAMILY_TASKS, 'GET')

      if (response.ok) {
        const tasks = await response.json();

        // Получаем текущую дату без времени
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Фильтруем задачи: не закрытые и не просроченные
        const activeTasks = tasks.filter(task => {
          const taskDate = new Date(task.due_date);
          taskDate.setHours(0, 0, 0, 0); // Сравниваем только дату без времени
          return !task.is_closed && task.assignee_id === userId;
        });

        taskCountElement.textContent = activeTasks.length;

        // Определяем ближайшую задачу
        const nextTask = activeTasks.reduce((closest, task) => {
          const taskDate = new Date(task.due_date);
          return (!closest || taskDate < new Date(closest.due_date)) ? task : closest;
        }, null);

        nextTaskElement.innerHTML = nextTask
          ? `<h3 class="nextTask">
                <strong>${nextTask.title}&nbsp;</strong>

                (${new Date(nextTask.due_date).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                })})
            </h3>`
          : '<h3 class="nextTask">Нет задач</h3>';
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  }


  // Функция для получения событий и дней рождения
  async function fetchUserEventsAndBirthdays(userId) {

    try {
      // Запрашиваем информацию о семье и пользователях
      const userResponse = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET')

      if (!userResponse.ok) {
        console.error('Ошибка при загрузке данных пользователя:', userResponse.status, userResponse.statusText);
        return;
      }

      const familyData = await userResponse.json();

      // Находим пользователя по userId
      const userMember = familyData.members.find(member => member.id === userId);
      const birthday = userMember?.birth_date ? new Date(userMember.birth_date) : null;

      // Запрашиваем события
      const eventResponse = await apiRequest(API_EVENTS.GET_ALL_FAMILY_EVENTS, 'GET');

      if (!eventResponse.ok) {
        console.error('Ошибка при загрузке событий:', eventResponse.status, eventResponse.statusText);
        return;
      }

      const events = await eventResponse.json();

      // Фильтруем события, где пользователь является участником и статус "Pending" или "Accepted"
      const userEvents = events.filter(event =>
        event.participants.some(participant =>
          participant.user_id === userId &&
          (participant.status === 'Pending' || participant.status === 'Accepted')
        )
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Убираем время для сравнения только по дате

      // События на сегодня
      const todayEvents = userEvents.filter(event => {
        const eventDate = new Date(event.start_date);
        eventDate.setHours(0, 0, 0, 0); // Убираем время
        return eventDate.getTime() === today.getTime();
      });

      // Сортируем события на сегодня по времени
      const sortedTodayEvents = todayEvents.sort((a, b) => {
        const aTime = a.start_time ? new Date(`1970-01-01T${a.start_time}`) : new Date(0);
        const bTime = b.start_time ? new Date(`1970-01-01T${b.start_time}`) : new Date(0);
        return aTime - bTime;
      });

      // Логика дня рождения
      let reminders = [];

      if (birthday) {
        console.log(birthday)
        const thisYearBirthday = new Date(new Date().getFullYear(), birthday.getMonth(), birthday.getDate());
        const nextBirthday = thisYearBirthday >= today ? thisYearBirthday :
          new Date(thisYearBirthday.getFullYear() + 1, birthday.getMonth(), birthday.getDate());

        if (thisYearBirthday.getTime() === today.getTime()) {
          reminders.push(`<strong>День рождения:&nbsp;</strong> ${userMember.first_name} ${userMember.last_name} (${thisYearBirthday.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short'
          })})`);
        }
      }

      // Добавляем сегодняшние события в напоминания
      sortedTodayEvents.forEach(event => {
        const eventTime = event.start_time ? `в ${event.start_time.slice(0, 5)}` : '';
        reminders.push(
          `<strong>${event.title}:&nbsp;</strong> ${new Date(event.start_date).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short'
          })} ${eventTime}`
        );
      });

// Выводим напоминания списком
      const calendarReminderElement = document.getElementById('calendarReminder'); // Элемент, в который выводим список
      if (reminders.length > 0) {
        calendarReminderElement.innerHTML = ''; // Очищаем содержимое
        const ul = document.createElement('ul'); // Создаем список
        reminders.forEach(reminder => {
          const li = document.createElement('li'); // Создаем элемент списка для каждого напоминания
          li.innerHTML = reminder; // Используем innerHTML для вставки HTML-контента
          ul.appendChild(li); // Добавляем элемент списка в ul
        });
        calendarReminderElement.appendChild(ul); // Добавляем ul в контейнер
      } else {
        calendarReminderElement.innerHTML = '<span>Нет событий</span>';
      }

    } catch (error) {
      console.error('Ошибка при загрузке данных:', error);
    }
  }

  // Загрузка данных пользователя
  fetchUserData();
});
