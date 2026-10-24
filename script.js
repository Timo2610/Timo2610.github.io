// ==============================
// EINSTELLUNGEN
// ==============================
// Das Passwort ist wie in der bisherigen Version nur ein einfacher Sichtschutz.
// Es ist kein echter Schutz vor dem direkten Abruf der Website-Dateien.
const richtigesPasswort = "123";

const login = document.getElementById("login");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const fehler = document.getElementById("fehler");
const home = document.getElementById("home");
const orteContainer = document.getElementById("orte");
const detail = document.getElementById("detail");
const backButton = document.getElementById("backButton");
const placeTitle = document.getElementById("placeTitle");
const placeDescription = document.getElementById("placeDescription");
const albumArea = document.getElementById("albumArea");

let reiseziele = [];
let aktuellerOrt = null;

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  if (passwordInput.value === richtigesPasswort) {
    login.hidden = true;
    home.hidden = false;
    fehler.textContent = "";
    ladeReiseziele();
  } else {
    fehler.textContent = "Das Passwort stimmt leider nicht. ❤️";
    passwordInput.value = "";
    passwordInput.focus();
  }
});

async function ladeReiseziele() {
  orteContainer.innerHTML = "<p>Unsere Reiseziele werden geladen ...</p>";
  try {
    const antwort = await fetch("orte_web.json");
    if (!antwort.ok) throw new Error("Reiseziele konnten nicht geladen werden.");
    reiseziele = await antwort.json();
    zeigeReiseziele();
  } catch (error) {
    console.error(error);
    orteContainer.innerHTML = "<p>Die Reiseziele konnten nicht geladen werden. Bitte prüfe die veröffentlichte Website.</p>";
  }
}

function zeigeReiseziele() {
  orteContainer.innerHTML = "";
  if (reiseziele.length === 0) {
    orteContainer.innerHTML = "<p>Hier sind noch keine Reiseziele vorhanden. ❤️</p>";
    return;
  }

  reiseziele.forEach(function (ort) {
    const karte = document.createElement("button");
    karte.type = "button";
    karte.className = "place-card";

    const cover = document.createElement("div");
    cover.className = "place-cover";
    cover.style.setProperty("--cover", ort.farbe || "#e9d9d0");
    const emoji = document.createElement("span");
    emoji.className = "place-cover-emoji";
    emoji.textContent = ort.emoji || "❤️";
    cover.appendChild(emoji);

    const inhalt = document.createElement("div");
    inhalt.className = "place-card-content";
    const titel = document.createElement("h3");
    titel.textContent = ort.name;
    inhalt.appendChild(titel);

    if (ort.datum) {
      const datum = document.createElement("p");
      datum.textContent = "📅 " + ort.datum;
      inhalt.appendChild(datum);
    }
    const status = document.createElement("p");
    status.textContent = ort.albumLink ? "Fotoalbum ansehen ♥" : "Erinnerungen entdecken ♥";
    inhalt.appendChild(status);

    karte.appendChild(cover);
    karte.appendChild(inhalt);
    karte.addEventListener("click", () => zeigeOrt(ort));
    orteContainer.appendChild(karte);
  });
}

function zeigeOrt(ort) {
  aktuellerOrt = ort;
  home.hidden = true;
  detail.hidden = false;
  placeTitle.textContent = ort.name;
  placeDescription.innerHTML = "";
  albumArea.innerHTML = "";

  if (ort.datum) {
    const datum = document.createElement("p");
    datum.className = "place-date";
    datum.textContent = "📅 " + ort.datum;
    placeDescription.appendChild(datum);
  }

  if (Array.isArray(ort.aktivitaeten) && ort.aktivitaeten.length) {
    const liste = document.createElement("ul");
    liste.className = "activity-list";
    ort.aktivitaeten.forEach(text => {
      const eintrag = document.createElement("li");
      eintrag.textContent = text;
      liste.appendChild(eintrag);
    });
    placeDescription.appendChild(liste);
  }

  if (ort.erinnerungen && ort.erinnerungen.trim()) {
    const ueberschrift = document.createElement("h3");
    ueberschrift.textContent = "Unsere Erinnerungen ❤️";
    placeDescription.appendChild(ueberschrift);
    const erinnerung = document.createElement("p");
    erinnerung.className = "personal-memory";
    erinnerung.textContent = ort.erinnerungen;
    placeDescription.appendChild(erinnerung);
  }

  const icon = document.createElement("div");
  icon.className = "album-icon";
  icon.textContent = "📷";
  albumArea.appendChild(icon);

  const ueberschrift = document.createElement("h2");
  ueberschrift.textContent = "Unsere Fotos";
  albumArea.appendChild(ueberschrift);

  const text = document.createElement("p");
  text.textContent = ort.albumLink
    ? "Alle gemeinsamen Bilder an einem Ort – öffne unser Fotoalbum."
    : "Hier fehlt noch der Link zu unserem Fotoalbum. Du kannst ihn später in der Datei OneDrive_Alben/orte.json ergänzen.";
  albumArea.appendChild(text);

  if (ort.albumLink && istGueltigerWebLink(ort.albumLink)) {
    const link = document.createElement("a");
    link.className = "album-link";
    link.href = ort.albumLink;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Fotoalbum öffnen ♥ ↗";
    albumArea.appendChild(link);
  } else {
    const hinweis = document.createElement("div");
    hinweis.className = "no-link";
    hinweis.textContent = "Der OneDrive-Link wird noch ergänzt. ♥";
    albumArea.appendChild(hinweis);
  }
}

function istGueltigerWebLink(wert) {
  try {
    const url = new URL(wert);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

backButton.addEventListener("click", function () {
  detail.hidden = true;
  home.hidden = false;
  aktuellerOrt = null;
});
