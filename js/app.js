/* =========================================================
   FICHIER : app.js
   Projet : Coeur sur pattes
   Objectif : Charger les données JSON et les afficher
              Version optimisée et simplifiée
   ========================================================= */


/* =========================================================
   0. OUTILS
   ========================================================= */

/* Convertir âge "2 ans" ou "6 mois" → nombre */
function convertAgeToNumber(ageString) {
    ageString = ageString.toLowerCase();

    if (ageString.includes("mois")) {
        return parseInt(ageString) / 12;
    }
    if (ageString.includes("an")) {
        return parseInt(ageString);
    }
    return 0;
}



/* =========================================================
   1. STATISTIQUES (Accueil)
   ========================================================= */

function loadStats() {
    const container = document.getElementById("stats-container");
    if (!container) return;

    fetch("data/stats.json")
        .then(r => r.json())
        .then(stats => {
            container.innerHTML = stats.map(item => `
                <div class="col-md-3 text-center">
                    <div class="stat-card p-4 shadow-sm rounded-4">
                        <i class="bi bi-star-fill fs-2 text-accent-purple mb-2"></i>
                        <div class="stat-value">${item.value}</div>
                        <p class="mt-2">${item.label}</p>
                    </div>
                </div>
            `).join("");
        });
}



/* =========================================================
   2. TÉMOIGNAGES (Accueil)
   ========================================================= */

function loadTestimonials() {
    const container = document.getElementById("testimonials-container");
    if (!container) return;

    fetch("data/testimonials.json")
        .then(r => r.json())
        .then(list => {
            container.innerHTML = list.map(t => `
                <div class="col-md-4">
                    <div class="testimonial-card">
                        <img src="${t.photo}" class="testimonial-photo" alt="${t.name}">
                        <h5 class="testimonial-name">${t.name}</h5>
                        <p class="testimonial-text">${t.text}</p>
                    </div>
                </div>
            `).join("");
        });
}



/* =========================================================
   3. CARROUSEL ANIMAUX (Accueil)
   ========================================================= */

function loadAnimalsCarousel() {
    const container = document.getElementById("carousel-animals-container");
    if (!container) return;

    Promise.all([
        fetch("data/animals-cats.json").then(r => r.json()),
        fetch("data/animals-dogs.json").then(r => r.json())
    ])
    .then(([cats, dogs]) => {
        const animals = [...cats, ...dogs];

        container.innerHTML = "";

        for (let i = 0; i < animals.length; i += 4) {
    const group = animals.slice(i, i + 4);

    const cards = group.map(a => `
        <div class="col-12 col-sm-6 col-md-3 d-flex justify-content-center">
            <div class="animal-card-carousel shadow-sm">

                <img src="${a.photo}" 
                     class="animal-photo-carousel" 
                     alt="${a.nom}">
                
                <div class="info-carousel text-center p-2">
                    <h5 class="mb-1">${a.nom}</h5>
                    <p class="mb-1">${a.age} • ${a.sexe}</p>
                    <p class="mb-0">${a.race}</p>
                </div>

            </div>
        </div>
    `).join("");

    container.innerHTML += `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <div class="row g-4 justify-content-center">${cards}</div>
        </div>
    `;
}

    })
    .catch(err => console.error("Erreur carousel animaux :", err));
}




/* =========================================================
   4. PAGE NOS ANIMAUX – chargement + filtres
   ========================================================= */

let allAnimals = [];

function loadAnimals() {
    const container = document.getElementById("animals-list");
    if (!container) return;

    Promise.all([
        fetch("data/animals-cats.json").then(r => r.json()),
        fetch("data/animals-dogs.json").then(r => r.json())
    ]).then(([cats, dogs]) => {

        allAnimals = [...cats, ...dogs].map(a => ({
            ...a,
            type: a.id.startsWith("CT") ? "chat" : "chien",
            ageNum: convertAgeToNumber(a.age)
        }));

        renderAnimals(allAnimals);
    });
}

function renderAnimals(list) {
    const container = document.getElementById("animals-list");
    const noResults = document.getElementById("no-results");
    if (!container) return;

    if (list.length === 0) {
        noResults && (noResults.style.display = "block");
        container.innerHTML = "";
        return;
    }

    noResults && (noResults.style.display = "none");

    container.innerHTML = list.map(a => `
        <div class="col-12 col-md-4 animal-card-wrapper">
            <div class="animal-card card shadow-sm border-0">
                <img src="${a.photo}" class="card-img-top">
                <div class="card-body">
                    <h5>${a.nom}</h5>
                    <p class="small mb-1"><strong>ID :</strong> ${a.id}</p>
                    <p class="small mb-1"><strong>Age :</strong> ${a.age}</p>
                    <p class="small mb-1"><strong>Sexe :</strong> ${a.sexe}</p>
                    <p class="small mb-1"><strong>Race :</strong> ${a.race}</p>
                </div>
            </div>
        </div>
    `).join("");
}


function applyFilters() {
    const type = document.getElementById("filter-type")?.value.toLowerCase() || "";
    const age = document.getElementById("filter-age")?.value || "";
    const sexe = document.getElementById("filter-sex")?.value.toLowerCase() || "";
    const race = document.getElementById("filter-race")?.value.toLowerCase() || "";
    const search = document.getElementById("search-input")?.value.toLowerCase() || "";

    const filtered = allAnimals.filter(a => {
        if (type && a.type !== type) return false;
        if (sexe && a.sexe.toLowerCase() !== sexe) return false;
        if (race && !a.race.toLowerCase().includes(race)) return false;

        if (age === "0-1" && !(a.ageNum <= 1)) return false;
        if (age === "1-3" && !(a.ageNum > 1 && a.ageNum <= 3)) return false;
        if (age === "3+" && !(a.ageNum > 3)) return false;

        if (search && !(
            a.nom.toLowerCase().includes(search) ||
            a.race.toLowerCase().includes(search)
        )) return false;

        return true;
    });

    renderAnimals(filtered);
}



/* =========================================================
   5. PAGE PROMENADES
   ========================================================= */

function initCalendarForWalks() {
    const input = document.getElementById("walks-calendar");
    if (!input) return;

    fetch("data/walks.json")
        .then(r => r.json())
        .then(walks => {
            const dates = walks.map(w => w.date);

            flatpickr(input, {
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d F Y",
                locale: "fr",
                minDate: "today",

                onDayCreate(_, __, ___, dayElem) {
    const year  = dayElem.dateObj.getFullYear();
    const month = String(dayElem.dateObj.getMonth() + 1).padStart(2, "0");
    const day   = String(dayElem.dateObj.getDate()).padStart(2, "0");
    const d = `${year}-${month}-${day}`; // формат YYYY-MM-DD

    if (dates.includes(d)) {
        dayElem.classList.add("slot-available");
    }
},


                onChange(_, dateStr) {
                    loadWalks(dateStr);
                }
            });
        });
}

function initWalksPage() {
    const container = document.getElementById("walks-container");
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center py-4">
                <p>Veuillez choisir une date pour afficher les créneaux disponibles.</p>
            </div>`;
    }
}

function loadWalks(dateFilter = null) {
    const container = document.getElementById("walks-container");
    if (!container) return;

    container.innerHTML = "<p>Chargement...</p>";

    fetch("data/walks.json")
        .then(r => r.json())
        .then(walks => {

            if (dateFilter)
                walks = walks.filter(w => w.date === dateFilter);

            if (walks.length === 0) {
                container.innerHTML = `
                    <div class="col-12 text-center py-4">
                        <p>Aucun créneau disponible.</p>
                    </div>`;
                return;
            }

            container.innerHTML = walks.map(w => `
                <div class="col-md-4">
                    <div class="walk-card card shadow-sm p-3">
                        <h5>${w.dayLabel} – ${w.time}</h5>
                        <p>${w.description}</p>
                        <button class="btn btn-green-custom"
                                data-bs-toggle="modal"
                                data-bs-target="#modalWalk"
                                data-slot-label="${w.dayLabel} ${w.time}">
                            Réserver ce créneau
                        </button>
                    </div>
                </div>
            `).join("");

            attachWalkButtonsEvents();
        });
}

function attachWalkButtonsEvents() {
    const buttons = document.querySelectorAll("#walks-container button[data-slot-label]");
    const slot = document.getElementById("selected-slot");
    if (!slot) return;

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            slot.value = btn.dataset.slotLabel;
        });
    });
}

function loadDogsForWalkSelect() {
    fetch("data/animals-dogs.json")
        .then(r => r.json())
        .then(dogs => {
            const select = document.getElementById("walk-dog-select");
            if (!select) return; // нет select — выходим

            select.innerHTML = '<option value="">Sélectionnez un chien</option>';

            dogs.forEach(dog => {
                const option = document.createElement("option");
                option.value = dog.nom;
                option.textContent = dog.nom + " – " + dog.race;
                select.appendChild(option);
            });
        });
}






/* =========================================================
   6. FORMULAIRES MODALES (Bénévole + Don)
   ========================================================= */

/* ---- Bénévole ---- */
const volunteerModal = document.getElementById("modalVolunteer");
const volunteerForm = volunteerModal?.querySelector("#volunteerForm");
const volunteerSuccess = volunteerModal?.querySelector("#volunteer-success-inside");
const volunteerError = volunteerModal?.querySelector("#volunteer-error-inside");

if (volunteerForm && volunteerSuccess && volunteerError) {

   
    volunteerModal.addEventListener("show.bs.modal", () => {
        volunteerSuccess.classList.add("d-none");
        volunteerError.classList.add("d-none");
        volunteerForm.classList.remove("d-none");
    });

    volunteerForm.addEventListener("submit", e => {
        e.preventDefault();

        const fields = volunteerForm.querySelectorAll("input, textarea");

        let name = fields[0].value.trim();
        let email = fields[1].value.trim();
        let message = fields[2].value.trim();

        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

       
        if (!name || !email || !emailValid || !message) {
            volunteerError.classList.remove("d-none");
            volunteerSuccess.classList.add("d-none");
            return; 
        }

      
        volunteerError.classList.add("d-none");
        volunteerSuccess.classList.remove("d-none");

        volunteerForm.reset();

        
        setTimeout(() => {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(volunteerModal);
            modalInstance.hide();

            volunteerSuccess.classList.add("d-none");
            volunteerForm.classList.remove("d-none");

        }, 2000);
    });
}



/* =========================================================
   FORMULAIRE : DON (VALIDATION + LOGIQUE)
   ========================================================= */

const donateModal = document.getElementById("modalDonate");
const donateForm = document.getElementById("donateForm");
const donateSuccess = document.getElementById("donate-success-inside");
const donateError = document.getElementById("donate-error-inside");

if (donateForm && donateModal) {

  
    donateModal.addEventListener("show.bs.modal", () => {
        donateSuccess.classList.add("d-none");
        donateError.classList.add("d-none");
        donateForm.classList.remove("d-none");
    });

    donateForm.addEventListener("submit", function (e) {
        e.preventDefault();

       
        const name = document.getElementById("don-name").value.trim();
        const email = document.getElementById("don-email").value.trim();
        const customAmount = document.getElementById("don-custom").value.trim();
        const donType = document.getElementById("don-type").value;
        const payment = document.querySelector("input[name='payment']:checked");

       
        let montant = customAmount;
        document.querySelectorAll(".don-amount-btn").forEach(btn => {
            if (btn.classList.contains("btn-active")) {
                montant = btn.dataset.value;
            }
        });

        
        const emailValid =
            email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        
        if (
            !name ||                       
            !montant || Number(montant) <= 0 || 
            !donType ||                     
            !payment ||                     
            !emailValid                     
        ) {
            donateError.classList.remove("d-none");
            donateSuccess.classList.add("d-none");
            return; // 
        }

    
        donateError.classList.add("d-none");
        donateSuccess.classList.remove("d-none");

       
        const modalInstance = bootstrap.Modal.getOrCreateInstance(donateModal);
        setTimeout(() => {
            modalInstance.hide();
            donateSuccess.classList.add("d-none");
        }, 1500);

        donateForm.reset();
    });
}


document.querySelectorAll(".don-amount-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".don-amount-btn")
            .forEach(b => b.classList.remove("btn-active"));

        btn.classList.add("btn-active");
        document.getElementById("don-custom").value = btn.dataset.value;
    });
});






/* =========================================================
   7. INITIALISATION GLOBALE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /** Page Accueil **/
    loadStats();
    loadTestimonials();
    loadAnimalsCarousel();

    /** Page Nos Animaux **/
    loadAnimals();
    if (document.getElementById("filter-type")) {
        document.getElementById("filter-type").addEventListener("change", applyFilters);
        document.getElementById("filter-age").addEventListener("change", applyFilters);
        document.getElementById("filter-sex").addEventListener("change", applyFilters);
        document.getElementById("filter-race").addEventListener("input", applyFilters);
        document.getElementById("search-input").addEventListener("input", applyFilters);
    }

    /** Page Promenades **/
    initWalksPage();
    initCalendarForWalks();
    loadDogsForWalkSelect();

    /** Modales **/
    initForms();

});

/* =========================================================
   FORMULAIRE : INSCRIPTION À UN CRÉNEAU
   ========================================================= */

const walkForm = document.getElementById("walk-form");
const successMessage = document.getElementById("success-message");
const errorMessage = document.getElementById("error-message");
const modalWalk = document.getElementById("modalWalk");

if (walkForm && modalWalk && successMessage) {

    // При открытии модалки скрываем старые сообщения
    modalWalk.addEventListener("show.bs.modal", () => {
        successMessage.classList.add("d-none");
        if (errorMessage) {
            errorMessage.classList.add("d-none");
        }
        walkForm.classList.remove("d-none");
    });

    walkForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const slot = document.getElementById("selected-slot").value.trim();
        const name = document.getElementById("walk-name").value.trim();
        const email = document.getElementById("walk-email").value.trim();
        const dog = document.getElementById("walk-dog-select").value.trim();

        // Проверка формата email
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        // Проверка полей
        if (!slot || !name || !email || !dog || !emailValid) {
            if (errorMessage) {
                errorMessage.classList.remove("d-none");
            }
            successMessage.classList.add("d-none");
            return; // модалка НЕ закрывается
        }

        // Скрываем ошибку, показываем успех
        if (errorMessage) {
            errorMessage.classList.add("d-none");
        }
        successMessage.classList.remove("d-none");

        // Очищаем форму
        walkForm.reset();

        // Закрываем модалку через 1.5 сек
        setTimeout(() => {
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalWalk);
            if (modalInstance) {
                modalInstance.hide();
            }
            successMessage.classList.add("d-none");
        }, 1500);
    });
}
