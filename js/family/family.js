import {API_FAMILY, API_PROFILE, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const familyContainer = document.getElementById("family-container");

  // Функция для проверки семьи
  async function checkFamily() {
    try {
      const response_user = await apiRequest(API_PROFILE.USER_INFO, 'GET');

      if (response_user.status === 401) {
        window.location.href = "../../pages/auth/sign-in.html";
        return;
      }

      if (!response_user.ok) {
        console.error("Ошибка при получении информации о пользователе.");
        return;
      }

      const user_info = await response_user.json();

      if (!user_info.family_id) {
        redirectToCreateFamily();
        return;
      }

      const response_family = await apiRequest(API_FAMILY.FAMILY_INFO, 'GET');

      if (!response_family.ok) {
        console.error("Ошибка при получении информации о семье.");
        return;
      }

      const family_info = await response_family.json();
      renderFamilyPage(family_info);
    } catch (error) {
      console.error("Ошибка при проверке семьи:", error);
    }
  }


  // Рендер страницы семьи
  function renderFamilyPage(family_info) {
    const familyHTML = `
      <div class="family-info">
        <h2>Информация о семье</h2>
        <p><strong>Семья:</strong> ${family_info.family_name}</p>
        <p>
          <strong>Дата создания:</strong>
          ${new Date(family_info.created_at).toLocaleDateString("en-RU", {
              day: "2-digit",
              month: "short", // Короткое название месяца
              year: "numeric",
            }).replace(".", "")} <!-- Убираем точку, если нужна -->
        </p>
        <p><strong>Администратор:</strong> ${family_info.owner}</p>
      </div>

      <section class="family-members">
        <h2>Члены семьи</h2>
        <ul class="members-list">
          ${family_info.members.map(member => `
            <li class="member-card">
              <p><strong>Имя:</strong> ${member.first_name} ${member.last_name}</p>
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
            </li>
          `).join("")}
        </ul>
      </section>
    `;
    familyContainer.innerHTML = familyHTML;
  }

  // Функция редиректа на страницу создания семьи
  function redirectToCreateFamily() {
    window.location.href = "../../pages/family/create-family.html";
  }

  // Функции для переходов
  function goToDashboard() {
    window.location.href = "../../pages/dashboard/dashboard.html";
  }

  window.goToDashboard = goToDashboard;

  function goToFamilySettings() {
    window.location.href = "../../pages/family/family-settings.html";
  }

  window.goToFamilySettings = goToFamilySettings;

  // Инициализация при загрузке страницы
  await checkFamily();
});
