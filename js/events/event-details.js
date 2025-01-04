import {API_EVENTS, API_FAMILY, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const event_id = new URLSearchParams(window.location.search).get("eventId");
  const eventTitle = document.getElementById("event-title");
  const eventDescription = document.getElementById("event-description");
  const eventStartDate = document.getElementById("event-start-date");
  const eventStartTime = document.getElementById("event-start-time");
  const eventLocation = document.getElementById("event-location");
  const eventCreatedBy = document.getElementById("event-created-by");
  const eventParticipants = document.getElementById("event-participants");
  const editButton = document.getElementById("edit-event");
  const deleteButton = document.getElementById("delete-event");

  if (!event_id) {
    window.location.href = "../../pages/events/calendar.html";
    return;
  }


  // Fetch event details
  async function fetchEventDetails() {
    try {
      const responseEvent = await apiRequest(API_EVENTS.GET_EVENT_INFO, 'GET', null, {event_id});
      const responseUser = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

      if (responseEvent.ok && responseUser.ok) {
        const eventEvent = await responseEvent.json();
        const eventFamily = await responseUser.json();
        console.log(eventFamily)

        const participantNames = eventEvent.participants
          .map(participant => {
            const member = eventFamily.members.find(member => member.id === participant.user_id);
            if (member) {
              return ` ${member.first_name} ${member.last_name}`;
            }
            return null; // Если участник не найден в списке членов семьи
          })
          .filter(name => name !== null); // Удаляем пустые значения


        const creator = eventFamily.members.find((member) => member.id === eventEvent.created_by);
        eventTitle.textContent = eventEvent.title || "Без названия";
        eventDescription.textContent = eventEvent.description || "Нет описания";
        eventStartDate.textContent = eventEvent.start_date || "Не указано";
        eventStartTime.textContent = `${eventEvent.start_time} - ${eventEvent.end_time}` || "Не указано";
        eventLocation.textContent = eventEvent.location || "Не указано";
        eventCreatedBy.textContent = creator
          ? `${creator.first_name} ${creator.last_name}`
          : "Не указано";
        eventParticipants.textContent = participantNames;
      } else {
        alert("Не удалось загрузить данные события.");
        window.location.href = "../dashboard/dashboard.html";
      }
    } catch (error) {
      console.error("Ошибка загрузки данных события:", error);
      alert("Ошибка сети. Попробуйте позже.");
    }
  }

  // Redirect to edit page
  editButton.addEventListener("click", () => {
    window.location.href = `../../pages/events/edit-event.html?eventId=${event_id}`;
  });

  function deleteEvent() {
    window.location.href = `../../pages/events/delete-event.html?eventId=${event_id}`;
  }

  deleteButton.addEventListener("click", deleteEvent)

  window.goBack = () => window.location.href = "../../pages/events/calendar.html";

  fetchEventDetails();
});
