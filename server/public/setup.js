const company_name = document.getElementById("company_name"),
  company_email = document.getElementById("company_email"),
  company_desc = document.getElementById("company_desc");

const submit_button = document.getElementById("submit-button"),
  alert_box = document.getElementById("alert");

submit_button.addEventListener("click", async (e) => {
  e.preventDefault();
  await fetch(window.location.origin + "company/onboarding", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company_name: company_name.value,
      company_email: company_email.value,
      company_desc: company_desc.value,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      displayAlert(res.status, res.message);
    });
});

function displayAlert(status, message) {
  alert_box.innerHTML = message;
  if (status != 200) {
    alert_box.style.opacity = "1";
    alert_box.style.backgroundColor = "red";
  }
}
