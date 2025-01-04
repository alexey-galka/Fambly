import {API_FAMILY, apiRequest} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  const createFamilyForm = document.getElementById("createFamilyForm");

  createFamilyForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const familyName = document.getElementById("familyName").value.trim();

    try {
      const response = await apiRequest(API_FAMILY.CREATE_FAMILY, 'POST', {
        family_name: familyName
      });

      if (response.ok) {
        // const familyData = await response.json();
        window.location.href = "../../pages/family/family.html"; // Редирект на страницу семьи
      } else {
        const error = await response.json();
        alert(`Ошибка при создании семьи: ${error.detail || "Попробуйте снова."}`);
      }
    } catch (error) {
      console.error("Ошибка при создании семьи:", error);
      alert("Произошла ошибка. Попробуйте позже.");
    }
  });
});

/** Функция для возврата на главную */
function goToDashboard() {
  window.location.href = "../../pages/dashboard/dashboard.html";
}
window.goToDashboard = goToDashboard;
