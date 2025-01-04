import { API_FAMILY, API_MEMBER, apiRequest } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", function () {
  const invitationForm = document.getElementById("invitationForm");
  const emailInput = document.getElementById("email");
  const familyMembersList = document.getElementById("familyMembersList");
  const invitationsList = document.getElementById("invitationsList");

  // Проверка и загрузка данных о семье
  async function checkFamily() {
    try {
      const response = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

      if (response.ok) {
        const familyData = await response.json();
        renderFamilyMembers(familyData);
      } else if (response.status === 401) {
        window.location.href = "../../pages/auth/sign-in.html";
      } else {
        alert("Ошибка загрузки данных о семье.");
      }
    } catch (error) {
      console.error("Ошибка при проверке семьи:", error);
    }
  }

  // Отображение членов семьи
  function renderFamilyMembers(familyData) {
    const familyHTML = `
      <section class="family-members">
        <ul class="members-list">
          ${familyData.members
      .map(
        (member) => `
            <li class="member-card">
              <p><strong>Имя:</strong> ${member.first_name} ${member.last_name}</p>
              <p><strong>Роль:</strong> ${member.role}</p>
              <p>
                <strong>День рождения:</strong>
                ${
          member.birth_date
            ? new Date(member.birth_date)
              .toLocaleDateString("en-RU", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              .replace(".", "") // Убираем точку
            : "Не указан"
        }
              </p>
              ${
          member.role !== "Администратор"
            ? `<button class="delete-button" data-id="${member.id}">Удалить</button>`
            : ""
        }
            </li>`
      )
      .join("")}
        </ul>
      </section>
    `;
    familyMembersList.innerHTML = familyHTML;

    // Добавление обработчиков для кнопок удаления
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async function () {
        const memberId = this.dataset.id;
        await deleteFamilyMember(memberId);
      });
    });
  }

  // Удаление члена семьи
  async function deleteFamilyMember(user_id) {
    try {
      const response = await apiRequest(API_MEMBER.DELETE_MEMBER, 'DELETE', null, {user_id});

      if (response.ok) {
        checkFamily();
      } else {
        alert("Ошибка при удалении члена семьи.");
      }
    } catch (error) {
      console.error("Ошибка при удалении члена семьи:", error);
    }
  }

  // Отправка приглашения
  invitationForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = emailInput.value.trim();

    if (email) {
      let familyId;

      try {
        const responseFamily = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

        if (responseFamily.ok) {
          const familyData = await responseFamily.json();
          familyId = await familyData.id;
        } else {
          alert("Не удалось получить информацию о семье.");
          return;
        }

        const responseInvite = await apiRequest(API_MEMBER.INVITE_NEW_MEMBER, 'POST',
          {email: email, family_id: familyId});

        if (responseInvite.ok) {
          emailInput.value = "";
          fetchInvitations();
        } else {
          const error = await responseInvite.json();
          alert(`Ошибка при создании задачи: ${error.detail || "Попробуйте снова."}`);
        }
      } catch (error) {
        console.error("Ошибка при отправке приглашения:", error);
      }
    }
  });

  // Загрузка приглашений
  async function fetchInvitations() {
    try {
      const response = await apiRequest(API_MEMBER.GET_ALL_INVITATIONS, 'GET');

      if (response.ok) {
        const invitations = await response.json();
        renderInvitations(invitations);
      } else {
        alert("Ошибка при загрузке приглашений.");
      }
    } catch (error) {
      console.error("Ошибка при загрузке приглашений:", error);
    }
  }

  // Отображение приглашений
  function renderInvitations(invitations) {
    // Фильтруем приглашения, исключая те, которые уже использованы
    const pendingInvitations = invitations.filter((invitation) => !invitation.is_used);

    if (pendingInvitations.length === 0) {
      invitationsList.innerHTML = `<p>Не отправлено ни одного приглашения</p>`;
      return;
    }

    invitationsList.innerHTML = pendingInvitations
      .map((invitation) => {
        console.log("Rendering invitation:", invitation); // Проверяем данные
        return `
        <li>
            <p><strong>Email: </strong>${invitation.email}</p>
            <p><strong>Код: </strong>${invitation.code}</p>
            <p><strong>Статус: </strong>${invitation.status}</p>
          <button class="delete-button" data-id="${invitation.id}">Отменить</button>
        </li>`;
      })
      .join("");

    // Добавление обработчиков для отмены приглашений
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async function () {
        const invitationId = this.dataset.id;
        console.log("Attempting to delete invitation with ID:", invitationId); // Проверяем ID
        await deleteInvitation(invitationId);
      });
    });
  }


  // Удаление приглашения
  async function deleteInvitation(invitation_id) {
    if (!invitation_id) {
      console.error("Нет ID для удаления приглашения.");
      return;
    }

    try {
      const response = await apiRequest(API_MEMBER.CANCEL_INVITATION, 'DELETE', null, {invitation_id});

      if (response.ok) {
        console.log("Приглашение успешно удалено.");
        fetchInvitations();
      } else {
        const errorData = await response.json();
        console.error("Ошибка при удалении приглашения:", errorData);
        alert("Ошибка при удалении приглашения.");
      }
    } catch (error) {
      console.error("Ошибка при удалении приглашения:", error);
      alert("Произошла ошибка при удалении приглашения.");
    }
  }

  function goBack() {
    window.location.href = "../../pages/family/family.html";
  }

  window.goBack = goBack;


  // Инициализация данных
  checkFamily();
  fetchInvitations();
});
