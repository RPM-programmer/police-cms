window.initDepartmentWork("court", ({ API_BASE, showResult }) => {
  // Загрузка ожидающих ордеров
  document
    .getElementById("load-pending-warrants-btn")
    ?.addEventListener("click", async () => {
      const res = await fetch(`${API_BASE}/court/warrants/pending`, {
        credentials: "include",
      });
      const json = await res.json();
      showResult(json);
    });

  // Отправка приговора с упаковкой блока punishment
  document
    .getElementById("court-verdict-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const payload = {
        docketNumber: String(fd.get("docketNumber") || "").trim(),
        verdictType: fd.get("verdictType"),
        resolutionText: String(fd.get("resolutionText") || "").trim(),
        punishment: {
          prisonDays: Number(fd.get("prisonDays")) || 0,
          fineAmount: Number(fd.get("fineAmount")) || 0,
          revokeLicense: fd.get("revokeLicense") === "on",
          freezeCompany: fd.get("freezeCompany") === "on",
        },
      };

      const res = await fetch(`${API_BASE}/court/verdicts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      showResult(json);
      if (json.success) e.target.reset();
    });
});
