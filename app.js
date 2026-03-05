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