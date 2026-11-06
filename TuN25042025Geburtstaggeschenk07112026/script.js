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
const largeVideo = document.getElementById("largeVideo");
const nextPhoto = document.getElementById("nextPhoto");

const richtigesPasswort = "passwort123";

let reiseziele = [];
let aktuellerOrt = null;
let aktuellerBildIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let zoomLevel = 1;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let pinchActive = false;
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
function istVideo(url) { return /\.(mp4|mov|webm|m4v)(?:[?#].*)?$/i.test(url); }


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
        fehler.textContent = "Das Passwort stimmt leider nicht.";
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
            "<p>Die Reiseziele konnten nicht geladen werden. Bitte prüfe, ob der Server läuft.</p>";
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

        const coverUrl = (ort.bilder || []).find(url => !istVideo(url));
        if (coverUrl) {
            const bild = document.createElement("img");
            bild.className = "place-cover-image";
            bild.src = coverUrl;
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
            ((ort.bilder && ort.bilder.length === 1) ? " Medium" : " Fotos/Videos");
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

    // Bilder und Videos anzeigen
    if (!ort.bilder || ort.bilder.length === 0) {
        emptyMessage.hidden = false;
        return;
    }

    emptyMessage.hidden = true;

    ort.bilder.forEach(function (mediaUrl, index) {
        let element;
        if (istVideo(mediaUrl)) {
            element = document.createElement("video");
            element.className = "gallery-photo gallery-video";
            element.src = mediaUrl;
            element.muted = true;
            element.playsInline = true;
            element.preload = "metadata";
            element.setAttribute("aria-label", ort.name + " – Video " + (index + 1));
        } else {
            element = document.createElement("img");
            element.src = mediaUrl;
            element.alt = ort.name + " – Foto " + (index + 1);
            element.loading = "lazy";
            element.className = "gallery-photo";
        }
        element.addEventListener("click", function () {
            oeffneLightbox(index);
        });
        photos.appendChild(element);
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
// Vollbild-Fotogalerie mit Video und Zoom
// ------------------------------

function oeffneLightbox(index) {
    if (!aktuellerOrt || !aktuellerOrt.bilder.length) return;
    aktuellerBildIndex = index;
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    zeigeGrossesBild();
}

function setZoom(value) {
    zoomLevel = Math.max(1, Math.min(4, value));
    const media = istVideo(aktuellerOrt?.bilder?.[aktuellerBildIndex] || "") ? largeVideo : largePhoto;
    media.style.transform = `scale(${zoomLevel})`;
    media.style.cursor = zoomLevel > 1 ? "zoom-out" : "zoom-in";
}

function zeigeGrossesBild() {
    if (!aktuellerOrt || !aktuellerOrt.bilder.length) return;
    const mediaUrl = aktuellerOrt.bilder[aktuellerBildIndex];
    const video = istVideo(mediaUrl);
    zoomLevel = 1;
    largePhoto.style.transform = "scale(1)";
    largeVideo.style.transform = "scale(1)";
    largePhoto.hidden = video;
    largeVideo.hidden = !video;

    if (video) {
        largePhoto.removeAttribute("src");
        largeVideo.pause();
        largeVideo.src = mediaUrl;
        largeVideo.load();
        largeVideo.currentTime = 0;
    } else {
        largeVideo.pause();
        largeVideo.removeAttribute("src");
        largePhoto.src = mediaUrl;
        largePhoto.alt = aktuellerOrt.name + " – Foto " + (aktuellerBildIndex + 1);
    }

    photoCounter.textContent = (aktuellerBildIndex + 1) + " / " + aktuellerOrt.bilder.length;
    prevPhoto.disabled = aktuellerBildIndex === 0;
    nextPhoto.disabled = aktuellerBildIndex === aktuellerOrt.bilder.length - 1;
}

function zeigeVorherigesBild() {
    if (aktuellerBildIndex > 0) { aktuellerBildIndex--; zeigeGrossesBild(); }
}
function zeigeNaechstesBild() {
    if (aktuellerOrt && aktuellerBildIndex < aktuellerOrt.bilder.length - 1) {
        aktuellerBildIndex++; zeigeGrossesBild();
    }
}
function schliesseLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("lightbox-open");
    largePhoto.removeAttribute("src");
    largeVideo.pause();
    largeVideo.removeAttribute("src");
    largeVideo.load();
    largePhoto.style.transform = "scale(1)";
    largeVideo.style.transform = "scale(1)";
}

closeLightbox.addEventListener("click", schliesseLightbox);
prevPhoto.addEventListener("click", zeigeVorherigesBild);
nextPhoto.addEventListener("click", zeigeNaechstesBild);

lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) schliesseLightbox();
});

// Mausrad zoomt in der Großansicht
const lightboxContent = document.querySelector(".lightbox-content");
lightboxContent.addEventListener("wheel", function (event) {
    if (lightbox.hidden || istVideo(aktuellerOrt?.bilder?.[aktuellerBildIndex] || "")) return;
    event.preventDefault();
    setZoom(zoomLevel + (event.deltaY < 0 ? 0.15 : -0.15));
}, { passive: false });

document.addEventListener("keydown", function (event) {
    if (lightbox.hidden) return;
    if (event.key === "Escape") schliesseLightbox();
    else if (event.key === "ArrowLeft") zeigeVorherigesBild();
    else if (event.key === "ArrowRight") zeigeNaechstesBild();
});

// Zwei-Finger-Pinch-Zoom auf Touchscreens; Ein-Finger-Wischen wechselt Medien.
function fingerAbstand(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
}

lightboxContent.addEventListener("touchstart", function (event) {
    if (event.touches.length === 2) {
        pinchActive = true;
        pinchStartDistance = fingerAbstand(event.touches);
        pinchStartZoom = zoomLevel;
        touchStartX = 0;
        touchStartY = 0;
    } else if (event.touches.length === 1 && !pinchActive) {
        touchStartX = event.touches[0].screenX;
        touchStartY = event.touches[0].screenY;
    }
}, { passive: true });

lightboxContent.addEventListener("touchmove", function (event) {
    if (event.touches.length === 2 && pinchActive) {
        event.preventDefault();
        const distance = fingerAbstand(event.touches);
        if (pinchStartDistance > 0) setZoom(pinchStartZoom * (distance / pinchStartDistance));
    }
}, { passive: false });

lightboxContent.addEventListener("touchend", function (event) {
    if (event.touches.length < 2) pinchActive = false;
    // Nur ein einzelner Finger-Wisch wechselt das Bild; Pinch-Gesten nicht.
    if (event.changedTouches.length !== 1 || zoomLevel > 1.02 || touchStartX === 0) return;
    const touchEndX = event.changedTouches[0].screenX;
    const touchEndY = event.changedTouches[0].screenY;
    const differenzX = touchEndX - touchStartX;
    const differenzY = touchEndY - touchStartY;
    if (Math.abs(differenzX) > 50 && Math.abs(differenzX) > Math.abs(differenzY)) {
        if (differenzX > 0) zeigeVorherigesBild();
        else zeigeNaechstesBild();
    }
}, { passive: true });
