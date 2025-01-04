import { decryptData, getKey, encryptData } from '../utils/cryptoUtils.js';
import {API_EVENTS, API_FAMILY, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  const createEventForm = document.getElementById("createEventForm");
  const startDateTimeInput = document.getElementById("startDateTime");
  const endDateTimeInput = document.getElementById("endDateTime");
  const isRecurringCheckbox = document.getElementById("isRecurring");
  const recurringOptions = document.getElementById("recurringOptions");
  const recurringType = document.getElementById("recurringType");
  const dailyOptions = document.getElementById("dailyOptions");
  const weeklyOptions = document.getElementById("weeklyOptions");
  const recurringEndInput = document.getElementById("recurringEnd");
  const recurringSummary = document.getElementById("recurringSummary");
  const clearEndDateButton = document.getElementById("clearEndDate");
  const participantsSelect = document.getElementById("participants");

  let user_id;

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

  // Загружаем участников семьи
  async function loadParticipants() {
    try {
      const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');
      if (response.ok) {
        const familyData = await response.json();
        populateParticipants(familyData.members, user_id);
      } else {
        console.error("Не удалось загрузить участников семьи.");
      }
    } catch (error) {
      console.error("Ошибка загрузки участников:", error);
    }
  }

  function populateParticipants(members, user_id) {
    members.forEach((member) => {
      if (String(member.id) !== String(user_id)) { // Приводим к строке для гарантии
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = `${member.first_name} ${member.last_name}`;
        participantsSelect.appendChild(option);
      }
    });
  }

  // Управляем полями для повторения события
  isRecurringCheckbox.addEventListener("change", () => {
    const isRecurring = isRecurringCheckbox.checked;
    recurringOptions.classList.toggle("hidden", !isRecurring);
    if (isRecurring) {
      recurringType.value = "daily"; // Устанавливаем "День" по умолчанию
      dailyOptions.classList.remove("hidden");
      weeklyOptions.classList.add("hidden");
    }
    updateRecurringSummary();
  });


  recurringType.addEventListener("change", () => {
    const selectedType = recurringType.value;
    console.log(selectedType)
    dailyOptions.classList.toggle("hidden", selectedType !== "daily");
    weeklyOptions.classList.toggle("hidden", selectedType !== "weekly");

    updateRecurringSummary();
  });

  recurringEndInput.addEventListener("change", updateRecurringSummary);

  // Обновляем текст повторения
  function updateRecurringSummary() {
    if (!isRecurringCheckbox.checked) {
      recurringSummary.textContent = "";
      return;
    }

    const startDate = startDateTimeInput.value.split("T")[0];
    const endDate = recurringEndInput.value;
    const interval =
      recurringType.value === "daily"
        ? document.getElementById("dailyInterval").value
        : document.getElementById("weeklyInterval").value;
    const weekdays = Array.from(document.querySelectorAll("[name='weekdays']:checked")).map(
      (checkbox) => checkbox.value
    );

    let summary = "";
    if (recurringType.value === "daily") {
      summary = `Повторяется каждые ${interval} дня с ${startDate}`;
    } else if (recurringType.value === "weekly") {
      const weekdaysText =
        weekdays.length === 7
          ? "каждый день"
          : weekdays.length === 5 &&
          weekdays.includes("Mon") &&
          weekdays.includes("Fri")
            ? "каждый будний день"
            : `каждые ${weekdays.join(", ")}`;
      summary = `Повторяется каждые ${interval} недели ${weekdaysText} с ${startDate}`;
    }

    if (endDate) {
      summary += ` до ${endDate}`;
    }
    recurringSummary.textContent = summary + ".";
  }

  // Очистка даты окончания
  clearEndDateButton.addEventListener("click", () => {
    recurringEndInput.value = "";
    updateRecurringSummary();
  });


  // Обрабатываем отправку формы
  createEventForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(createEventForm);
    const selectedParticipants = Array.from(participantsSelect.selectedOptions).map(
      (option) => option.value
    );

    // Добавляем создателя, если его нет в списке
    if (!selectedParticipants.includes(user_id.toString())) {
      selectedParticipants.push(user_id.toString());
    }

    const eventData = {
      title: formData.get("title"),
      description: formData.get("description"),
      start_date: formData.get("startDateTime"),
      start_time: formData.get("startDateTime"),
      end_date: formData.get("endDateTime"),
      end_time: formData.get("endDateTime"),
      location: formData.get("location"),
      is_recurring: isRecurringCheckbox.checked,
      recurring_pattern: formData.get("recurringType"),
      recurring_interval: formData.get("dailyInterval") || formData.get("weeklyInterval") || 1,
      weekdays: Array.from(document.querySelectorAll("[name='weekdays']:checked")).map(el => el.value),
      recurring_end_date: formData.get("recurringEnd") || null,
      participants: selectedParticipants,
    };

    console.log("Event data:", eventData);

    const [start_date, start_time] = eventData.start_date.split('T');
    eventData.start_date = start_date;
    eventData.start_time = start_time;

    const [end_date, end_time] = eventData.end_date.split('T');
    eventData.end_date = end_date;
    eventData.end_time = end_time;


    try {
      const response = await apiRequest(API_EVENTS.CREATE_EVENT, 'POST', eventData);
      // const response = await fetch("http://127.0.0.1:8000/event", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(eventData),
      // });

      if (response.ok) {
        alert("Событие успешно создано.");
        window.location.href = "../../pages/events/calendar.html";
      } else {
        const errorDetails = await response.json();
        console.error("Ошибка при создании события:", errorDetails);
        alert(`Ошибка: ${errorDetails.detail}`);
      }
    } catch (error) {
      console.error("Ошибка сети:", error);
      alert("Произошла ошибка. Попробуйте снова.");
    }
  });

  // Инициализация
  loadParticipants();
  updateRecurringSummary(); // Устанавливаем начальное описание
});


window.goBack = () => window.history.back();