(async () => {
  const API_BASE = "/api/police-cms";
  const UI_BASE = "/police-cms";

  const DEPT_NAMES = {
    traffic_police: "ГАИ",
    police: "Милиция",
    security: "Охрана",
    border_guards: "Пограничная служба",
    InspectionMinistry: "Инспекционное министерство",
    court: "Суд",
    KGB: "Госбезопасность",
  };

  const authRes = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  const auth = await authRes.json();

  if (!auth.authenticated) {
    window.location.href = `${UI_BASE}/login`;
    return;
  }

  document
    .getElementById("cabinet-logout-btn")
    .addEventListener("click", async () => {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = UI_BASE;
    });

  const res = await fetch(`${API_BASE}/user/dossier/me`, {
    credentials: "include",
  });
  const json = await res.json();
  if (!json.success || !json.data) return;

  const c = json.data;

  if (auth.officer) {
    const deptName =
      DEPT_NAMES[auth.officer.departmentCode] || auth.officer.departmentCode;
    document.getElementById("officer-action").innerHTML = `
      <a href="${UI_BASE}/dept/${auth.officer.departmentCode}/work" class="btn btn-primary">
        Рабочая панель (${deptName}) →
      </a>
    `;
  }

  document.getElementById("passport-box").innerHTML = `
    <h2 style="font-size: 18px; margin-bottom: 16px;">Цифровой паспорт</h2>
    <div class="passport-grid">
      <div class="passport-item"><div class="passport-label">UID гражданина</div><div class="passport-value">${c.uid}</div></div>
      <div class="passport-item"><div class="passport-label">PID паспорта</div><div class="passport-value">${c.pid}</div></div>
      <div class="passport-item"><div class="passport-label">ФИО</div><div class="passport-value">${c.lastName} ${c.firstName} ${c.middleName || ""}</div></div>
      <div class="passport-item"><div class="passport-label">Дата рождения</div><div class="passport-value">${c.birthDate}</div></div>
      <div class="passport-item"><div class="passport-label">Телефон</div><div class="passport-value">${c.phone}</div></div>
      <div class="passport-item"><div class="passport-label">Email</div><div class="passport-value">${c.email}</div></div>
    </div>
  `;

  document.getElementById("status-box").innerHTML = `
    <h2 style="font-size: 18px; margin-bottom: 14px;">Правовой статус</h2>
    <div class="status-pills">
      <div class="status-pill">Розыск: ${c.isWanted ? '<span style="color:#dc2626;">В РОЗЫСКЕ</span>' : '<span style="color:#15803d;">Нет</span>'}</div>
      <div class="status-pill">Арест / ИВС: ${c.isArrested ? '<span style="color:#dc2626;">Задержан</span>' : '<span style="color:#15803d;">Нет</span>'}</div>
      <div class="status-pill">Выезд за границу: ${c.travelBanned ? '<span style="color:#dc2626;">Запрещён</span>' : '<span style="color:#15803d;">Разрешён</span>'}</div>
      <div class="status-pill">Судимости: ${c.criminalRecordsCount}</div>
    </div>
  `;

  const companies = c.companies || [];
  document.getElementById("companies-box").innerHTML = `
    <h2 style="font-size: 18px; margin-bottom: 14px;">Зарегистрированные компании</h2>
    ${
      companies.length
        ? companies
            .map(
              (comp) => `
              <div class="passport-item" style="margin-bottom: 10px;">
                <strong>${comp.name}</strong> (<code>${comp.cid}</code>) — Статус: <strong>${comp.status}</strong> | Капитал: ${comp.initialCapital}
              </div>
            `,
            )
            .join("")
        : '<p style="color: var(--text-muted);">Зарегистрированных компаний нет.</p>'
    }
  `;
})();
