$(document).ready(function () {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    $("html").attr("data-bs-theme", savedTheme);
    updateToggleIcon(savedTheme);
  }

  $("#theme-toggle").on("click", function () {
    // const html = $("html");
    // const img = $(this).find("img");

    // const currentTheme = html.attr("data-bs-theme") || "light";
    // const newTheme = currentTheme === "dark" ? "light" : "dark";
    // html.attr("data-bs-theme", newTheme);

    // localStorage.setItem("theme", newTheme);

    updateToggleIcon(newTheme);
  });

  function updateToggleIcon(theme) {
    const img = $("#theme-toggle").find("img");
    if (theme === "dark") {
      img.attr("src", "assets/images/icons/light-mod.svg");
    } else {
      img.attr("src", "assets/images/icons/dark-mod.svg");
    }
  }
});
