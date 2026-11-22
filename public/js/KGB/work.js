window.initDepartmentWork("KGB", ({ API_BASE, showResult }) => {
  document
    .getElementById("load-audit-logs-btn")
    ?.addEventListener("click", async () => {
      const res = await fetch(`${API_BASE}/kgb/audit-logs?limit=50`, {
        credentials: "include",
      });
      const json = await res.json();
      showResult(json);
    });
});
