window.initDepartmentHome = async function (deptCode) {
  const { API_BASE, UI_BASE, initNavbar } = window.PoliceCms;
  const auth = await initNavbar();

  // 1. Загрузка информации о ведомстве и ссылок на сообщества
  const portalRes = await fetch(`${API_BASE}/departments/${deptCode}/portal`, {
    credentials: "include",
  });
  const portalJson = await portalRes.json();

  if (portalJson.success && portalJson.data) {
    const dept = portalJson.data;
    document.title = `${dept.name} — POLICE-CMS`;
    document.getElementById("dept-title").textContent = dept.name;
    document.getElementById("dept-about").textContent = dept.aboutText || "";

    const linksEl = document.getElementById("dept-links");
    const links = dept.socialLinks || {};
    const entries = Object.entries(links);

    linksEl.innerHTML = entries.length
      ? entries
          .map(
            ([label, url]) =>
              `<a href="${url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">${label}</a>`,
          )
          .join("")
      : '<span style="color: var(--text-muted); font-size: 14px;">Официальные ссылки пока не добавлены.</span>';
  }

  // 2. Умная кнопка перехода в рабочую панель (видна ТОЛЬКО сотрудникам этой службы или КГБ)
  const actionsEl = document.getElementById("dept-actions");
  actionsEl.innerHTML = "";

  if (auth?.authenticated && auth?.officer) {
    const isKgbSupervisor =
      auth.officer.departmentCode === "KGB" &&
      auth.officer.clearanceLevel > 0 &&
      auth.officer.clearanceLevel <= 2;

    const isDeptEmployee = auth.officer.departmentCode === deptCode;

    if (isDeptEmployee || isKgbSupervisor) {
      const btnText =
        auth.officer.isChief || isKgbSupervisor
          ? "Рабочая панель (Управление ведомством) →"
          : "Рабочая панель сотрудника →";

      actionsEl.innerHTML = `
        <a href="${UI_BASE}/html/${deptCode}/work.html" class="btn" style="background: #ffffff; color: #0f172a; font-weight: 700;">
          ${btnText}
        </a>
      `;
    }
  }

  // 3. Лента новостей только этого ведомства
  const newsRes = await fetch(`${API_BASE}/news?dept=${deptCode}`, {
    credentials: "include",
  });
  const newsJson = await newsRes.json();
  const newsEl = document.getElementById("dept-news");

  if (!newsJson.success || !newsJson.data.length) {
    newsEl.innerHTML =
      '<div class="panel-card">У данного ведомства пока нет опубликованных сводок.</div>';
    return;
  }

  newsEl.innerHTML = newsJson.data
    .map(
      (item) => `
      <article class="news-card ${item.isEmergency ? "emergency" : ""}" data-dept="${deptCode}">
        <div class="news-stripe"></div>
        <div class="news-body">
          <div class="news-header">
            <span class="dept-tag">${item.departmentName}</span>
            <time class="news-time">${new Date(item.createdAt).toLocaleString("ru-RU")}</time>
          </div>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-content">${item.content}</p>
          ${item.photoUrl ? `<div class="news-media"><img src="${item.photoUrl}" alt="Фото сводки"></div>` : ""}
        </div>
      </article>
    `,
    )
    .join("");
};
