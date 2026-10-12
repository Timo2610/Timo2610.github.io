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
const photos = document.getElementById("photos");
const emptyMessage = document.getElementById("emptyMessage");

const lightbox = document.getElementById("lightbox");
const closeLightbox = document.getElementById("closeLightbox");
const photoCounter = document.getElementById("photoCounter");
const prevPhoto = document.getElementById("prevPhoto");
const largePhoto = document.getElementById("largePhoto");
const nextPhoto = document.getElementById("nextPhoto");

const richtigesPasswort = "123";

let reiseziele = [];
let aktuellerOrt = null;
let aktuellerBildIndex = 0;
let touchStartX = 0;
let touchStartY = 0;


// ------------------------------
// Passwort
// ------------------------------

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


// ------------------------------
// Reiseziel-Daten laden
// ------------------------------

async function ladeReiseziele() {
    orteContainer.innerHTML = "<p>Unsere Reiseziele werden geladen ...</p>";

    try {
        const antwort = await fetch("orte_web.json");

        if (!antwort.ok) {
            throw new Error("Die Reiseziele konnten nicht geladen werden.");
        }

        reiseziele = await antwort.json();
        zeigeReiseziele();
    } catch (error) {
        console.error(error);
        orteContainer.innerHTML =
            "<p>Die Reiseziele konnten nicht geladen werden. Bitte prüfe, ob die Website-Dateien vollständig hochgeladen wurden.</p>";
    }
}


// ------------------------------
// Reisezielkarten anzeigen
// ------------------------------

function zeigeReiseziele() {
    orteContainer.innerHTML = "";

    if (reiseziele.length === 0) {
        orteContainer.innerHTML =
            "<p>Hier sind noch keine Reiseziele vorhanden. ❤️</p>";
        return;
    }

    reiseziele.forEach(function (ort) {
        const karte = document.createElement("article");
        karte.className = "place-card";

        const cover = document.createElement("div");
        cover.className = "place-cover";

        const emoji = document.createElement("span");
        emoji.className = "place-cover-emoji";
        emoji.textContent = "❤️";
        cover.appendChild(emoji);

        if (ort.bilder && ort.bilder.length > 0) {
            const bild = document.createElement("img");
            bild.className = "place-cover-image";
            bild.src = ort.bilder[0];
            bild.alt = "Titelbild von " + ort.name;

            bild.addEventListener("load", function () {
                emoji.hidden = true;
            });

            bild.addEventListener("error", function () {
                bild.remove();
                emoji.hidden = false;
            });

            cover.appendChild(bild);
        }

        const inhalt = document.createElement("div");
        inhalt.className = "place-card-content";

        const titel = document.createElement("h3");
        titel.textContent = ort.name;
        inhalt.appendChild(titel);

        if (ort.datum) {
            const datum = document.createElement("p");
            datum.className = "place-date";
            datum.textContent = ort.datum;
            inhalt.appendChild(datum);
        }

        const anzahl = document.createElement("p");
        anzahl.textContent =
            (ort.bilder ? ort.bilder.length : 0) +
            ((ort.bilder && ort.bilder.length === 1) ? " Foto" : " Fotos");
        inhalt.appendChild(anzahl);

        karte.appendChild(cover);
        karte.appendChild(inhalt);

        karte.addEventListener("click", function () {
            zeigeOrt(ort);
        });

        orteContainer.appendChild(karte);
    });
}


// ------------------------------
// Einzelnes Reiseziel anzeigen
// ------------------------------

function zeigeOrt(ort) {
    aktuellerOrt = ort;

    home.hidden = true;
    detail.hidden = false;

    placeTitle.textContent = ort.name;
    photos.innerHTML = "";
    placeDescription.innerHTML = "";

    // Datum
    if (ort.datum) {
        const datum = document.createElement("p");
        datum.className = "place-date";
        datum.textContent = "📅 " + ort.datum;
        placeDescription.appendChild(datum);
    }

    // Aktivitäten
    if (Array.isArray(ort.aktivitaeten) && ort.aktivitaeten.length > 0) {
        const liste = document.createElement("ul");
        liste.className = "activity-list";

        ort.aktivitaeten.forEach(function (aktivitaet) {
            const eintrag = document.createElement("li");
            eintrag.textContent = aktivitaet;
            liste.appendChild(eintrag);
        });

        placeDescription.appendChild(liste);
    }

    // Persönliche Erinnerungen
    if (ort.erinnerungen && ort.erinnerungen.trim() !== "") {
        const erinnerungsTitel = document.createElement("h3");
        erinnerungsTitel.textContent = "Unsere Erinnerungen ❤️";
        placeDescription.appendChild(erinnerungsTitel);

        const erinnerung = document.createElement("p");
        erinnerung.className = "personal-memory";
        erinnerung.textContent = ort.erinnerungen;
        placeDescription.appendChild(erinnerung);
    }

    // Standardtext, wenn noch keine Angaben vorhanden sind
    if (
        !ort.datum &&
        (!ort.aktivitaeten || ort.aktivitaeten.length === 0) &&
        (!ort.erinnerungen || ort.erinnerungen.trim() === "")
    ) {
        const standardtext = document.createElement("p");
        standardtext.textContent =
            "Hier warten unsere gemeinsamen Erinnerungen. ❤️";
        placeDescription.appendChild(standardtext);
    }

    // Bilder anzeigen
    if (!ort.bilder || ort.bilder.length === 0) {
        emptyMessage.hidden = false;
        return;
    }

    emptyMessage.hidden = true;

    ort.bilder.forEach(function (bildUrl, index) {
        const bild = document.createElement("img");
        bild.src = bildUrl;
        bild.alt = ort.name + " – Foto " + (index + 1);
        bild.loading = "lazy";
        bild.className = "gallery-photo";

        bild.addEventListener("click", function () {
            oeffneLightbox(index);
        });

        photos.appendChild(bild);
    });
}


// ------------------------------
// Zurück zur Übersicht
// ------------------------------

backButton.addEventListener("click", function () {
    schliesseLightbox();
    detail.hidden = true;
    home.hidden = false;
    aktuellerOrt = null;
});


// ------------------------------
// Vollbild-Fotogalerie
// ------------------------------

function oeffneLightbox(index) {
    if (!aktuellerOrt || !aktuellerOrt.bilder.length) {
        return;
    }

    aktuellerBildIndex = index;
    lightbox.hidden = false;
    zeigeGrossesBild();
}

function zeigeGrossesBild() {
    if (!aktuellerOrt || !aktuellerOrt.bilder.length) {
        return;
    }

    const bildUrl = aktuellerOrt.bilder[aktuellerBildIndex];

    largePhoto.src = bildUrl;
    largePhoto.alt =
        aktuellerOrt.name +
        " – Foto " +
        (aktuellerBildIndex + 1);

    photoCounter.textContent =
        (aktuellerBildIndex + 1) +
        " / " +
        aktuellerOrt.bilder.length;

    prevPhoto.disabled = aktuellerBildIndex === 0;
    nextPhoto.disabled =
        aktuellerBildIndex === aktuellerOrt.bilder.length - 1;
}

function zeigeVorherigesBild() {
    if (aktuellerBildIndex > 0) {
        aktuellerBildIndex--;
        zeigeGrossesBild();
    }
}

function zeigeNaechstesBild() {
    if (
        aktuellerOrt &&
        aktuellerBildIndex < aktuellerOrt.bilder.length - 1
    ) {
        aktuellerBildIndex++;
        zeigeGrossesBild();
    }
}

function schliesseLightbox() {
    lightbox.hidden = true;
    largePhoto.removeAttribute("src");
}

closeLightbox.addEventListener("click", schliesseLightbox);
prevPhoto.addEventListener("click", zeigeVorherigesBild);
nextPhoto.addEventListener("click", zeigeNaechstesBild);

lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
        schliesseLightbox();
    }
});

document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) {
        return;
    }

    if (event.key === "Escape") {
        schliesseLightbox();
    } else if (event.key === "ArrowLeft") {
        zeigeVorherigesBild();
    } else if (event.key === "ArrowRight") {
        zeigeNaechstesBild();
    }
});


// ------------------------------
// Wischen auf dem Handy
// ------------------------------

largePhoto.addEventListener("touchstart", function (event) {
    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
}, { passive: true });

largePhoto.addEventListener("touchend", function (event) {
    const touchEndX = event.changedTouches[0].screenX;
    const touchEndY = event.changedTouches[0].screenY;

    const differenzX = touchEndX - touchStartX;
    const differenzY = touchEndY - touchStartY;

    if (
        Math.abs(differenzX) > 50 &&
        Math.abs(differenzX) > Math.abs(differenzY)
    ) {
        if (differenzX > 0) {
            zeigeVorherigesBild();
        } else {
            zeigeNaechstesBild();
        }
    }
}, { passive: true });