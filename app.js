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

// 👉 Mets ici l'URL de ton Apps Script (web app)
const WAITLIST_ENDPOINT = "https://script.google.com/macros/s/AKfycby1AdGCv9KXnY_RIcl5f3wNaOauc3TZGrTCOAErVkJf1ylrVt3apZUdq875VAHKQLZHZg/exec";

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("waitlist-email");
const msg = document.getElementById("waitlist-msg");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "";

  const email = emailInput.value.trim().toLowerCase();
  if (!email) return;

  try {
    const res = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      // Apps Script aime bien text/plain
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ email, source: "qr-code-generator" }),
    });

    // Lire en texte pour être compatible avec Apps Script
    const raw = await res.text();

    // Essayer JSON.parse, sinon fallback
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch (_) {
      data = null;
    }

    // ✅ Si HTTP ok -> on considère que c’est réussi
    // (puisque tu vois déjà la ligne dans le Sheet)
    if (res.ok) {
      msg.textContent = "✅ Merci ! Tu es ajouté à la liste.";
      emailInput.value = "";
      return;
    }

    // Si jamais pas OK, mais JSON avec erreur
    if (data?.error) {
      msg.textContent = `❌ ${data.error}`;
      return;
    }

    msg.textContent = "❌ Oups, inscription impossible. Réessaie.";
  } catch (err) {
    msg.textContent = "❌ Erreur réseau. Réessaie plus tard.";
  }
});