function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-id": localStorage.getItem("gov_user_id") || "",
  };
}

async function checkBankSystemStatus() {
  const response = await fetch("../api/bank/status");
  const status = await response.json();
  const acc = document.getElementById("bankAccountId");
  const pin = document.getElementById("bankPinCode");
  const btn = document.getElementById("payBtn");
  const notice = document.getElementById("bankNotice");

  if (!status.available) {
    acc.disabled = pin.disabled = btn.disabled = true;
    notice.innerText = `⚠️ ${status.message}`;
  } else {
    acc.disabled = pin.disabled = btn.disabled = false;
    notice.innerText = "✓ Система электронных платежей активна.";
  }
}

async function loadCabinetData() {
  await checkBankSystemStatus();
  const container = document.getElementById("finesContainer");

  try {
    const response = await fetch("../api/fines/my", { headers: getHeaders() });
    const resData = await response.json();

    if (!resData.success || resData.data.length === 0) {
      container.innerHTML =
        "<p style='color: #34c759;'>✓ Неоплаченных штрафов не обнаружено.</p>";
      return;
    }

    container.innerHTML = "";
    resData.data.forEach((fine) => {
      const item = document.createElement("div");
      item.className = "fine-item";
      item.innerHTML = `
        <div><strong>${fine.violation}</strong><br><small style="color: #64748b;">Номер: ${fine.car}</small></div>
        <button onclick="selectFine(${fine.id}, ${fine.punishment_value})" class="login-btn">${fine.punishment_value} $</button>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    container.innerHTML =
      "<p style='color: #ff3b30;'>Ошибка связи с базой данных.</p>";
  }
}

function selectFine(id, amount) {
  document.getElementById("selectedFineId").value = id;
  document.getElementById("payBtn").innerText =
    `Оплатить штраф #${id} (${amount} $)`;
}

async function executeFinePayment(event) {
  event.preventDefault();
  const fineId = document.getElementById("selectedFineId").value;
  if (!fineId) return alert("Выберите штраф из списка!");

  const body = {
    fineId,
    accountId: document.getElementById("bankAccountId").value,
    pinCode: document.getElementById("bankPinCode").value,
  };

  const response = await fetch("../api/fines/pay", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const result = await response.json();
  alert(result.message || result.error);
  if (result.success) loadCabinetData();
}

document.addEventListener("DOMContentLoaded", loadCabinetData);
