(async () => {
  const { API_BASE, DEPARTMENTS, initNavbar } = window.PoliceCms;
  await initNavbar();

  const filtersEl = document.getElementById("news-filters");
  DEPARTMENTS.forEach((d) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-chip";
    btn.dataset.dept = d.code;
    btn.textContent = d.name;
    filtersEl.appendChild(btn);
  });

  filtersEl.addEventListener("click", async (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;

    filtersEl
      .querySelectorAll(".filter-chip")
      .forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    await window.HomeNews.loadFeed(API_BASE, chip.dataset.dept);
  });

  await window.HomeNews.loadFeed(API_BASE);
})();
