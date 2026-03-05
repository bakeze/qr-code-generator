const input = document.getElementById("url");
const btn = document.getElementById("btn");
const qrDiv = document.getElementById("qrcode");
const download = document.getElementById("download");

let qr;

function clearQR() {
  qrDiv.innerHTML = "";
  download.style.display = "none";
  download.removeAttribute("href");
}

function makeQR(value) {
  clearQR();
  qr = new QRCode(qrDiv, {
    text: value,
    width: 240,
    height: 240,
    correctLevel: QRCode.CorrectLevel.L,
  });

  // Attendre que l'image soit rendue puis activer le téléchargement
  setTimeout(() => {
    const img = qrDiv.querySelector("img");
    const canvas = qrDiv.querySelector("canvas");

    const dataUrl = img?.src || canvas?.toDataURL("image/png");
    if (dataUrl) {
      download.href = dataUrl;
      download.style.display = "inline-flex";
    }
  }, 50);
}

btn.addEventListener("click", () => {
  const value = input.value.trim();
  if (!value) return alert("Entre une URL 🙂");
  try {
    new URL(value); // validation basique
    makeQR(value);
  } catch {
    alert("URL invalide. Exemple: https://exemple.com");
  }
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btn.click();
});

const WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycbz6N4gqCvTGu7SdpusF74Tbri_2pbr2PS9tsBjPd2InBcODxdxvzYSxfa_k5dR_aqZjFQ/exec"; // .../exec

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("waitlist-email");
const hpInput = document.getElementById("waitlist-hp");
const msg = document.getElementById("waitlist-msg");

// Afficher un message si confirmé via URL ?confirmed=1
const params = new URLSearchParams(window.location.search);
if (params.get("confirmed") === "1") {
  msg.textContent = "✅ Email confirmé ! Merci 🙌";
}
if (params.get("confirmed") === "0") {
  // Optionnel: msg.textContent = "❌ Lien de confirmation invalide.";
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const email = emailInput.value.trim().toLowerCase();
  const hp = (hpInput?.value || "").trim();

  if (!email) return;

  try {
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email, source: "qr-code-generator", hp })
    });

    const data = await res.json().catch(() => ({}));

    if (data.ok && data.pending) {
      msg.textContent = "📩 Presque fini : clique sur le lien de confirmation envoyé par email.";
      emailInput.value = "";
      if (hpInput) hpInput.value = "";
      return;
    }

    if (data.ok && data.alreadyConfirmed) {
      msg.textContent = "✅ Tu es déjà inscrit(e). Merci !";
      return;
    }

    msg.textContent = "❌ Oups, inscription impossible. Réessaie.";
  } catch (err) {
    msg.textContent = "❌ Erreur réseau. Réessaie plus tard.";
  }
});