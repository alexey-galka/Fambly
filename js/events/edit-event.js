import {API_EVENTS, API_FAMILY, apiRequest} from "../utils/api.js";


document.addEventListener("DOMContentLoaded", async () => {
  const event_id = new URLSearchParams(window.location.search).get("eventId");
  const editForm = document.getElementById("editEventForm");
  const cancelButton = document.getElementById("cancelEdit");
  const isRecurringCheckbox = document.getElementById("isRecurring");
  const recurringOptions = document.getElementById("recurringOptions");
  const recurringType = document.getElementById("recurringType");
  const dailyOptions = document.getElementById("dailyOptions");
  const weeklyOptions = document.getElementById("weeklyOptions");
  const recurringEndInput = document.getElementById("recurringEnd");
  const participantsSelect = document.getElementById("participants");

  if (!event_id) {
    alert("Событие не найдено.");
    window.location.href = "../dashboard/dashboard.html";
    return;
  }

  // Fetch event details and populate the form
  async function fetchEventDetails() {
    try {
      const response = await apiRequest(API_EVENTS.GET_EVENT_INFO, 'GET', null, {event_id});

      if (response.ok) {
        const event = await response.json();
        populateForm(event);
        populateParticipants(event.participants);
      } else {
        alert("Не удалось загрузить данные события.");
        window.location.href = "../dashboard/dashboard.html";
      }
    } catch (error) {
      console.error("Ошибка загрузки данных события:", error);
      alert("Ошибка сети. Попробуйте позже.");
    }
  }

  // Populate the form with event data
  function populateForm(event) {
    document.getElementById("title").value = event.title;
    document.getElementById("description").value = event.description || "";
    document.getElementById("startDateTime").value = `${event.start_date}T${event.start_time}`;
    document.getElementById("endDateTime").value = `${event.end_date}T${event.end_time}`;
    document.getElementById("location").value = event.location || "";
    console.log(event)

    if (event.is_recurring) {
      isRecurringCheckbox.checked = true;
      recurringOptions.classList.remove("hidden");
      recurringType.value = event.recurring_pattern || "daily";
      if (recurringType.value === "daily") {
        document.getElementById("dailyInterval").value = event.recurring_interval || 1;
        dailyOptions.classList.remove("hidden");
      } else if (recurringType.value === "weekly") {
        document.getElementById("weeklyInterval").value = event.recurring_interval || 1;
        const weekdays = event.weekdays || [];
        weekdays.forEach((day) => {
          document.querySelector(`[name='weekdays'][value='${day}']`).checked = true;
        });
        weeklyOptions.classList.remove("hidden");
      }
      recurringEndInput.value = event.recurring_end_date || "";
    }
  }

  // Populate participants
  async function populateParticipants(selectedParticipants = []) {
    try {
      const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

      if (response.ok) {
        const familyData = await response.json();
        familyData.members.forEach((member) => {
          const option = document.createElement("option");
          option.value = member.id;
          option.textContent = `${member.first_name} ${member.last_name}`;
          if (selectedParticipants.some((p) => p.id === member.id)) {
            option.selected = true;
          }
          participantsSelect.appendChild(option);
        });
      } else {
        console.error("Не удалось загрузить участников семьи.");
      }
    } catch (error) {
      console.error("Ошибка загрузки участников:", error);
    }
  }

  // Handle form submission
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(editForm);
    const updatedEvent = {
      title: formData.get("title"),
      description: formData.get("description"),
      start_date: formData.get("startDateTime").split("T")[0],
      start_time: formData.get("startDateTime").split("T")[1],
      end_date: formData.get("endDateTime").split("T")[0],
      end_time: formData.get("endDateTime").split("T")[1],
      location: formData.get("location"),
      is_recurring: isRecurringCheckbox.checked,
      recurring_pattern: isRecurringCheckbox.checked ? formData.get("recurringType") : null,
      recurring_interval: isRecurringCheckbox.checked
        ? formData.get("dailyInterval") || formData.get("weeklyInterval") || 1
        : null,
      weekdays: isRecurringCheckbox.checked
        ? Array.from(document.querySelectorAll("[name='weekdays']:checked")).map((checkbox) => checkbox.value)
        : [],
      recurring_end_date: isRecurringCheckbox.checked ? formData.get("recurringEnd") : null,
      participants: Array.from(participantsSelect.selectedOptions).map((option) => option.value),
    };

    try {
      const response = await apiRequest(API_EVENTS.UPDATE_EVENT, 'PUT', updatedEvent, {event_id});

      if (response.ok) {
        alert("Событие успешно обновлено.");
        window.location.href = "event-details.html?eventId=" + event_id;
      } else {
        alert("Не удалось обновить событие.");
      }
    } catch (error) {
      console.error("Ошибка обновления события:", error);
      alert("Ошибка сети. Попробуйте позже.");
    }
  });

  // Handle cancel button
  cancelButton.addEventListener("click", () => {
    window.location.href = `event-details.html?eventId=${event_id}`;
  });

  // Handle recurring checkbox change
  isRecurringCheckbox.addEventListener("change", () => {
    if (isRecurringCheckbox.checked) {
      recurringOptions.classList.remove("hidden");
    } else {
      recurringOptions.classList.add("hidden");
    }
  });

  // Handle recurring type change
  recurringType.addEventListener("change", () => {
    if (recurringType.value === "daily") {
      dailyOptions.classList.remove("hidden");
      weeklyOptions.classList.add("hidden");
    } else {
      dailyOptions.classList.add("hidden");
      weeklyOptions.classList.remove("hidden");
    }
  });

  // Fetch event details
  fetchEventDetails();
});

window.goBack = () => window.history.back();