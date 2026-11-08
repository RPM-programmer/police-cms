function switchAuthMode(mode) {
  const tabCitizen = document.getElementById("tab-citizen");
  const tabWorker = document.getElementById("tab-worker");
  const authRoleInput = document.getElementById("authRole");
  const labelIdentifier = document.getElementById("labelIdentifier");
  const labelCredential = document.getElementById("labelCredential");
  const submitBtn = document.getElementById("submitAuthBtn");
  const errorDiv = document.getElementById("loginError");

  errorDiv.style.display = "none";
  authRoleInput.value = mode;

  if (mode === "citizen") {
    tabCitizen.style.backgroundColor = "#006aff";
    tabCitizen.style.opacity = "1";
    tabWorker.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
    tabWorker.style.opacity = "0.5";

    labelIdentifier.innerText = "ID гражданина (UID):";
    labelCredential.innerText = "ID паспорта (PID):";
    submitBtn.innerText = "Войти";
    submitBtn.style.backgroundColor = "#006aff";
  } else {
    tabWorker.style.backgroundColor = "#ff9500";
    tabWorker.style.opacity = "1";
    tabCitizen.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
    tabCitizen.style.opacity = "0.5";

    labelIdentifier.innerText = "ID сотрудника (WID):";
    labelCredential.innerText = "Служебный пароль:";
    submitBtn.innerText = "Войти";
    submitBtn.style.backgroundColor = "#ff9500";
  }
}

// public/tp/js/login.js

async function executeLogin(event) {
  event.preventDefault();
  const userId = document.getElementById("authUserId").value;
  const password = document.getElementById("authPassword").value;
  const currentMode = document.getElementById("authRole").value;
  const errorDiv = document.getElementById("loginError");

  errorDiv.style.display = "none";

  try {
    const response = await fetch("../api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });

    const result = await response.json();

    // Проверяем явный успех ответа сервера (status 200)
    if (response.ok && result.success) {
      const userWork = result.work || "citizen";
      const isSystemWorker = ["gai_officer", "gai_boss", "admin"].includes(
        userWork,
      );

      if (currentMode === "worker" && !isSystemWorker) {
        triggerAuthFlash("error");
        errorDiv.innerText =
          "Ошибка доступа: Аккаунт не найден в реестре сотрудников.";
        errorDiv.style.display = "block";
        return;
      }

      if (currentMode === "citizen" && isSystemWorker && userWork !== "admin") {
        triggerAuthFlash("error");
        errorDiv.innerText =
          "Данный ID принадлежит сотруднику. Используйте вкладку 'Сотрудник'.";
        errorDiv.style.display = "block";
        return;
      }

      localStorage.setItem("gov_user_id", result.userId);
      localStorage.setItem("gov_user_work", userWork);
      localStorage.setItem("gov_user_name", result.name);

      triggerAuthFlash("success");

      setTimeout(() => {
        window.location.href = isSystemWorker
          ? "/gov/sti/html/terminal.html"
          : "/gov/sti/html/cabinet.html";
      }, 1000);
    } else {
      // Здесь обрабатываются статусы 401 и другие ошибки ответа бэкенда
      triggerAuthFlash("error");
      errorDiv.innerText =
        result.message || result.error || "Неверный ID или пароль!";
      errorDiv.style.display = "block";
    }
  } catch (err) {
    // Сюда код попадёт только если сервер физически выключен (ошибка сети)
    triggerAuthFlash("error");
    errorDiv.innerText = "Критический сбой: Нет связи с сервером.";
    errorDiv.style.display = "block";
  }
}

// Вспомогательная функция управления классами вспышек
function triggerAuthFlash(type) {
  const bodyElement = document.body;

  if (type === "success") {
    bodyElement.classList.remove("auth-error");
    bodyElement.classList.add("auth-success");
  } else if (type === "error") {
    bodyElement.classList.remove("auth-success");
    bodyElement.classList.add("auth-error");

    // Ровно через 1 секунду (1000 мс) плавно выключаем красный цвет
    setTimeout(() => {
      bodyElement.classList.remove("auth-error");
    }, 1000);
  }
}
