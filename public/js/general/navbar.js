const API_BASE = "/api/police-cms";
const UI_BASE = "/police-cms";

const DEPARTMENTS = [
  { code: "traffic_police", name: "ГАИ", color: "#0284c7" },
  { code: "police", name: "Милиция", color: "#dc2626" },
  { code: "security", name: "Охрана", color: "#1e3a8a" },
  { code: "border_guards", name: "Пограничная служба", color: "#15803d" },
  {
    code: "InspectionMinistry",
    name: "Инспекционное министерство",
    color: "#eab308",
  },
  { code: "court", name: "Суд", color: "#7f1d1d" },
  { code: "KGB", name: "Госбезопасность", color: "#71717a" },
];

async function initNavbar() {
  const navEl = document.getElementById("app-navbar");
  if (!navEl) return null;

  const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
  const auth = await res.json();
  const path = window.location.pathname;

  const linksHtml = DEPARTMENTS.map(
    (d) => `
      <a href="${UI_BASE}/dept/${d.code}" class="nav-item ${path.includes(`/dept/${d.code}`) ? "active" : ""}">
        <span class="nav-dot" style="background: ${d.color};"></span>
        <span>${d.name}</span>
      </a>
    `,
  ).join("");

  const authHtml = auth.authenticated
    ? `
      <a href="${UI_BASE}/cabinet" class="nav-item" style="color:#fff; background:#1e293b;">
        ${auth.user.uid}
      </a>
      <button type="button" id="nav-logout-btn" class="btn btn-danger" style="padding: 6px 12px;">Выйти</button>
    `
    : `
      <a href="${UI_BASE}/login" class="btn btn-primary" style="padding: 7px 14px;">Войти</a>
    `;

  navEl.innerHTML = `
    <div class="navbar-wrap">
      <a href="${UI_BASE}" class="brand">
        <img src="${UI_BASE}/logo/logo.png" alt="POLICE-CMS" onerror="this.style.display='none'">
        <span>POLICE-CMS</span>
      </a>

      <nav class="nav-menu">
        <a href="${UI_BASE}" class="nav-item ${path === UI_BASE ? "active" : ""}">Новости</a>
        ${linksHtml}
        <div class="nav-auth">${authHtml}</div>
      </nav>
    </div>
  `;

  document
    .getElementById("nav-logout-btn")
    ?.addEventListener("click", async () => {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      window.location.href = UI_BASE;
    });

  return auth;
}

window.PoliceCms = { API_BASE, UI_BASE, DEPARTMENTS, initNavbar };
