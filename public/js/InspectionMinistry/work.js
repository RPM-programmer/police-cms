window.initDepartmentWork("InspectionMinistry", ({ API_BASE, showResult }) => {
  document
    .getElementById("load-pending-companies-btn")
    ?.addEventListener("click", async () => {
      const res = await fetch(`${API_BASE}/inspection/companies/pending`, {
        credentials: "include",
      });
      const json = await res.json();
      showResult(json);
    });
});
