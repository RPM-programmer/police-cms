window.initDepartmentWork = async function (deptCode, customCallback) {
  const API_BASE = "/api/police-cms";
  const UI_BASE = "/police-cms";

  // Словарь человекочитаемых названий колонок БД
  const FIELD_LABELS = {
    id: "ID",
    uid: "UID гражданина",
    pid: "PID паспорта",
    cid: "CID компании",
    citizenUid: "UID гражданина",
    targetUid: "UID субъекта",
    ownerUid: "UID владельца",
    ownerId: "ID владельца",
    ownerType: "Тип владельца",
    firstName: "Имя",
    lastName: "Фамилия",
    middleName: "Отчество",
    phone: "Телефон",
    email: "Email",
    birthDate: "Дата рождения",
    vin: "VIN-номер",
    plateNumber: "Госномер",
    brand: "Марка",
    model: "Модель",
    color: "Цвет",
    isStolen: "В угоне",
    isIntercepted: "В розыске (Поток)",
    hasRegBan: "Запрет рег. действий",
    isImpounded: "На штрафстоянке",
    licenseNumber: "Номер удостоверения / лицензии",
    categories: "Категории",
    penaltyPoints: "Штрафные баллы",
    fineNumber: "Номер постановления",
    article: "Статья",
    amount: "Сумма",
    pointsAdded: "Начислено баллов",
    accidentCode: "Номер ДТП",
    location: "Место происшествия",
    description: "Описание",
    caseNumber: "Номер дела",
    title: "Название / Заголовок",
    summary: "Фабула",
    dangerLevel: "Уровень опасности",
    reason: "Причина / Основание",
    detainedUntil: "Задержан до",
    callCode: "Код вызова",
    priority: "Приоритет",
    badgeNumber: "Номер жетона",
    departmentCode: "Ведомство",
    isChief: "Начальник",
    specializations: "Допуски",
    clearanceLevel: "Форма допуска",
    status: "Статус",
    decision: "Решение",
    reasons: "Причины / Примечания",
    fileCode: "Шифр архива",
    secrecyLevel: "Гриф секретности",
    warrantNumber: "Номер ордера",
    docketNumber: "Номер судопроизводства",
    verdictNumber: "Номер приговора",
    createdAt: "Дата создания",
    updatedAt: "Обновлено",
  };

  const HIDDEN_KEYS = new Set([
    "passwordHash",
    "encryptedPayload",
    "iv",
    "authTag",
  ]);

  function formatLabel(key) {
    return FIELD_LABELS[key] || key;
  }

  function formatValue(key, val) {
    if (val === null || val === undefined || val === "") return "—";
    if (typeof val === "boolean") {
      return val
        ? '<span class="badge-bool-yes">Да</span>'
        : '<span class="badge-bool-no">Нет</span>';
    }
    if (Array.isArray(val)) {
      return val.length ? val.join(", ") : "—";
    }
    if (typeof val === "object") {
      return Object.entries(val)
        .map(([k, v]) => `${formatLabel(k)}: ${v}`)
        .join("; ");
    }
    if (
      (key === "createdAt" || key === "updatedAt" || key === "detainedUntil") &&
      !isNaN(Date.parse(val))
    ) {
      return new Date(val).toLocaleString("ru-RU");
    }
    return String(val);
  }

  function renderCleanTable(container, response) {
    if (!container) return;
    container.className = "result-panel";
    container.classList.remove("hidden");

    if (!response || response.success === false) {
      container.innerHTML = `
        <div class="result-status err">Ошибка: ${response?.error || "Не удалось выполнить операцию"}</div>
      `;
      return;
    }

    const statusText = response.message || "Операция успешно выполнена";
    const payload = response.data !== undefined ? response.data : response;

    // Если данных внутри нет или пришло только сообщение
    if (
      !payload ||
      (typeof payload === "object" && Object.keys(payload).length === 0)
    ) {
      container.innerHTML = `<div class="result-status ok">✓ ${statusText}</div>`;
      return;
    }

    // Вариант 1: Массив объектов -> многоколоночная таблица
    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        container.innerHTML = `
          <div class="result-status ok">✓ ${statusText}</div>
          <div style="padding: 16px; color: var(--text-muted); font-size: 14px;">Записей по запросу не найдено.</div>
        `;
        return;
      }

      const columns = Object.keys(payload).filter((k) => !HIDDEN_KEYS.has(k));
      const thead = columns
        .map((col) => `<th>${formatLabel(col)}</th>`)
        .join("");
      const tbody = payload
        .map(
          (row) =>
            `<tr>${columns.map((col) => `<td>${formatValue(col, row[col])}</td>`).join("")}</tr>`,
        )
        .join("");

      container.innerHTML = `
        <div class="result-status ok">✓ ${statusText} (Найдено записей: ${payload.length})</div>
        <div class="table-scroll">
          <table class="clean-table">
            <thead><tr>${thead}</tr></thead>
            <tbody>${tbody}</tbody>
          </table>
        </div>
      `;
      return;
    }

    // Вариант 2: Одиночный объект -> таблица «Параметр — Значение»
    if (typeof payload === "object") {
      const entries = Object.entries(payload).filter(
        ([k]) => !HIDDEN_KEYS.has(k) && k !== "success",
      );
      const rows = entries
        .map(
          ([k, v]) => `
          <tr>
            <td class="kv-key">${formatLabel(k)}</td>
            <td>${formatValue(k, v)}</td>
          </tr>
        `,
        )
        .join("");

      container.innerHTML = `
        <div class="result-status ok">✓ ${statusText}</div>
        <div class="table-scroll">
          <table class="clean-table">
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="result-status ok">✓ ${payload}</div>`;
  }

  // 1. Проверка cookie-сессии и принадлежности к ведомству
  const authRes = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  const auth = await authRes.json();

  const isKgbSupervisor =
    auth?.officer?.departmentCode === "KGB" &&
    auth.officer.clearanceLevel > 0 &&
    auth.officer.clearanceLevel <= 2;

  const isDeptMember = auth?.officer?.departmentCode === deptCode;

  if (!auth?.authenticated || (!isDeptMember && !isKgbSupervisor)) {
    window.location.href = `${UI_BASE}/login`;
    return;
  }

  const isChief =
    Boolean(auth.officer.isChief && isDeptMember) || isKgbSupervisor;
  const userSpecs = Array.isArray(auth.officer.specializations)
    ? auth.officer.specializations
    : [];

  const roleLabel = isKgbSupervisor
    ? "Надзор КГБ"
    : isChief
      ? "Начальник ведомства"
      : "Рядовой состав";
  const infoEl = document.getElementById("officer-info");
  if (infoEl) {
    infoEl.textContent = `${auth.user.lastName} ${auth.user.firstName} (${auth.user.uid}) | Жетон: ${auth.officer.badgeNumber} | Статус: ${roleLabel}`;
  }

  const resultBox = document.getElementById("result-box");
  const showResult = (data) => renderCleanTable(resultBox, data);

  // 2. Открытие вкладок Начальника
  if (isChief) {
    document
      .querySelectorAll(".chief-only")
      .forEach((el) => el.classList.remove("hidden"));
  }

  // 3. Фильтрация вкладок по допускам рядового
  const allTabBtns = Array.from(document.querySelectorAll(".tab-btn"));
  const visibleBtns = allTabBtns.filter((btn) => {
    if (btn.classList.contains("chief-only")) return isChief;
    const reqSpec = btn.dataset.spec;
    if (!reqSpec || isChief || userSpecs.includes(reqSpec)) return true;

    btn.classList.add("hidden");
    document.getElementById(btn.dataset.tab)?.classList.add("hidden");
    return false;
  });

  visibleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      visibleBtns.forEach((b) => {
        b.className = b.classList.contains("chief-only")
          ? "btn btn-outline tab-btn chief-only"
          : "btn btn-outline tab-btn";
      });
      btn.className = btn.classList.contains("chief-only")
        ? "btn btn-primary tab-btn chief-only"
        : "btn btn-primary tab-btn";

      document.querySelectorAll(".tab-section").forEach((sec) => {
        sec.classList.toggle("hidden", sec.id !== btn.dataset.tab);
      });
      resultBox?.classList.add("hidden");
    });
  });

  if (visibleBtns.length > 0) {
    visibleBtns[0].click();
  } else {
    const container = document.querySelector("main.container");
    if (container) {
      const emptyCard = document.createElement("div");
      emptyCard.className = "panel-card";
      emptyCard.textContent =
        "У вас пока нет активных допусков ни к одному разделу. Обратитесь к Начальнику ведомства.";
      container.appendChild(emptyCard);
    }
  }

  // 4. Универсальная отправка форм
  document.querySelectorAll("form[data-endpoint]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const raw = Object.fromEntries(new FormData(form));
      const payload = {};

      for (const [k, v] of Object.entries(raw)) {
        if (v === "true") payload[k] = true;
        else if (v === "false") payload[k] = false;
        else payload[k] = typeof v === "string" ? v.trim() : v;
      }

      if (payload.jsonPayload) {
        try {
          payload.payload = JSON.parse(payload.jsonPayload);
        } catch {
          payload.payload = { note: payload.jsonPayload };
        }
        delete payload.jsonPayload;
      }

      const method = (form.dataset.method || "POST").toUpperCase();
      let url = `${API_BASE}${form.dataset.endpoint}`;
      url = url.replace(/:([a-zA-Z0-9_]+)/g, (_, param) =>
        encodeURIComponent(payload[param] || ""),
      );

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: method === "GET" ? undefined : JSON.stringify(payload),
      });

      const json = await res.json();
      showResult(json);
      if (json.success && method !== "GET") form.reset();
    });
  });

  // 5. Блок Начальника (штат, допуски, увольнение, статистика, сбор, новости)
  if (isChief) {
    let deptSpecs = [];

    const specRes = await fetch(
      `${API_BASE}/departments/${deptCode}/specializations`,
      { credentials: "include" },
    );
    const specJson = await specRes.json();
    if (specJson.success) {
      deptSpecs = specJson.data;
      const specsContainer = document.getElementById("hire-specs-list");
      if (specsContainer) {
        specsContainer.innerHTML = deptSpecs.length
          ? deptSpecs
              .map(
                (s) => `
`,
              )
              .join("")
          : "Для этого ведомства нет отдельных специализаций.";
      }
    }
    document
      .getElementById("chief-hire-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = {
          targetUid: String(fd.get("targetUid") || "").trim(),
          rankTitle: String(fd.get("rankTitle") || "Рядовой").trim(),
          specializations: fd.getAll("specs"),
        };
        const res = await fetch(`${API_BASE}/departments/${deptCode}/hire`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        showResult(json);
        if (json.success) {
          e.target.reset();
          await loadStaffAndStats();
        }
      });
    document
      .getElementById("chief-news-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target));
        payload.departmentCode = deptCode;
        const res = await fetch(`${API_BASE}/news`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        showResult(json);
        if (json.success) e.target.reset();
      });
    document
      .getElementById("chief-portal-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const raw = Object.fromEntries(new FormData(e.target));
        const socialLinks = {};
        if (raw.telegram) socialLinks["Telegram"] = raw.telegram.trim();
        if (raw.discord) socialLinks["Discord"] = raw.discord.trim();
        if (raw.forum) socialLinks["Устав / Форум"] = raw.forum.trim();
        const body = { socialLinks };
        if (raw.aboutText && raw.aboutText.trim())
          body.aboutText = raw.aboutText.trim();
        const res = await fetch(`${API_BASE}/departments/${deptCode}/portal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        showResult(await res.json());
      });
    document
      .getElementById("chief-call-duty-btn")
      ?.addEventListener("click", async () => {
        const res = await fetch(
          `${API_BASE}/departments/${deptCode}/call-duty`,
          {
            method: "POST",
            credentials: "include",
          },
        );
        showResult(await res.json());
      });
    async function loadStaffAndStats() {
      const staffEl = document.getElementById("chief-staff-list");
      if (staffEl) {
        const res = await fetch(`${API_BASE}/departments/${deptCode}/staff`, {
          credentials: "include",
        });
        const json = await res.json();
        if (!json.success || !json.data.length) {
          staffEl.innerHTML = "В штате пока нет сотрудников.";
        } else {
          const specNames = Object.fromEntries(
            deptSpecs.map((s) => [s.code, s.label]),
          );
          const rows = json.data
            .map((o) => {
              const readableSpecs = (o.specializations || [])
                .map((code) => specNames[code] || code)
                .join(", ");
              const fireButton = !o.isChief
                ? `
                <button
                  type="button"
                  class="btn btn-outline fire-btn"
                  data-uid="${o.citizenUid}"
                  style="color:#dc2626; border-color:#dc2626; padding:4px 10px; font-size:12.5px;"
                >
                  Уволить
                </button>
              `
                : "—";
              const roleText = o.isChief
                ? "Начальник"
                : o.rank?.title || "Рядовой";
              return `
\(o.citizen?.lastName||^{\prime \prime }\){o.citizen?.firstName || ''}
${o.citizenUid}${o.badgeNumber}${roleText}${readableSpecs || "Не назначены"}${fireButton}`;
            })
            .join("");
          staffEl.innerHTML = `
            <div class="table-scroll">
              <table class="clean-table">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>UID</th>
                    <th>Жетон</th>
                    <th>Должность</th>
                    <th>Допуски</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          `;

          staffEl.querySelectorAll(".fire-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
              if (
                !confirm(`Уволить сотрудника ${btn.dataset.uid} из ведомства?`)
              )
                return;
              const delRes = await fetch(
                `${API_BASE}/departments/${deptCode}/staff/${btn.dataset.uid}`,
                {
                  method: "DELETE",
                  credentials: "include",
                },
              );
              showResult(await delRes.json());
              await loadStaffAndStats();
            });
          });
        }
      }
      const statsEl = document.getElementById("chief-stats-box");
      if (statsEl) {
        const sRes = await fetch(`${API_BASE}/departments/${deptCode}/stats`, {
          credentials: "include",
        });
        const sJson = await sRes.json();
        if (sJson.success && sJson.data) {
          statsEl.innerHTML = Object.entries(sJson.data)
            .map(
              ([label, val]) => `
              <div style="padding:14px; background:#f8fafc; border:1px solid var(--border); border-radius:8px;">
                {" "}
                <div style="font-size:12px; color:var(--text-muted);">
                  ${label}
                </div>{" "}
                <div style="font-size:22px; font-weight:800; margin-top:4px;">
                  ${val}
                </div>{" "}
              </div>
            `,
            )
            .join("");
        }
      }
    }
    await loadStaffAndStats();
  }
  if (typeof customCallback === "function") {
    await customCallback({ API_BASE, UI_BASE, auth, isChief, showResult });
  }
};
