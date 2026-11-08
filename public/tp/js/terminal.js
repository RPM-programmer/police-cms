function getHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-id": localStorage.getItem("gov_user_id") || "",
  };
}

async function createNewFine(event) {
  event.preventDefault();
  const body = {
    car: document.getElementById("fineCarNumber").value,
    ouwner: document.getElementById("fineOwnerName").value,
    violation: document.getElementById("fineViolation").value,
    punishment_type: "штраф",
    punishment_value: document.getElementById("fineAmount").value,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };

  const response = await fetch("../api/fines/add", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const result = await response.json();
  alert(result.message || result.error);
  if (result.success) document.getElementById("addFineForm").reset();
}

async function payEmployeeSalary(event) {
  event.preventDefault();
  const body = {
    employeeId: document.getElementById("salaryEmployeeId").value,
    employeeAccountId: document.getElementById("salaryEmployeeBankId").value,
    salaryAmount: document.getElementById("salaryAmount").value,
  };

  const response = await fetch("../api/boss/pay-salary", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  const result = await response.json();
  alert(result.message || result.error);
  if (result.success) document.getElementById("salaryForm").reset();
}
