(() => {
  const API_BASE = "/api/police-cms";
  const UI_BASE = "/police-cms";

  document
    .getElementById("login-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const errBox = document.getElementById("login-error");
      errBox.classList.add("hidden");

      const raw = Object.fromEntries(new FormData(e.target));
      const payload = {
        login: String(raw.login || "").trim(),
        password: String(raw.password || "").trim(),
      };

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = `${UI_BASE}/cabinet`;
      } else {
        errBox.textContent = data.error || "Ошибка авторизации";
        errBox.classList.remove("hidden");
      }
    });
})();
