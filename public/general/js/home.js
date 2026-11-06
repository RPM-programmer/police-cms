function toggleDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("servicesDropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
  }
}
window.onclick = function (event) {
  const dropdown = document.getElementById("servicesDropdown");
  if (dropdown && dropdown.classList.contains("active")) {
    if (!event.target.closest(".dropdown")) {
      dropdown.classList.remove("active");
    }
  }
};

function switchPage(event, pageName) {
  event.preventDefault();
  const sections = document.querySelectorAll(".info-section");
  sections.forEach((section) => {
    section.style.display = "none";
  });
  const targetSection = document.getElementById("page-" + pageName);
  if (targetSection) {
    targetSection.style.display = "block";
  }
}
