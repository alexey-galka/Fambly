const themeSelect = document.getElementById("themeSelect");
if (themeSelect) {
  const currentTheme = localStorage.getItem("theme") || "light";
  themeSelect.value = currentTheme;

  themeSelect.addEventListener("change", (event) => {
    const selectedTheme = event.target.value;
    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
}
