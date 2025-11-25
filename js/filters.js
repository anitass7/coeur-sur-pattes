document.addEventListener('DOMContentLoaded', () => {

    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const resetButton = document.getElementById('resetFilters');
    const cards = document.querySelectorAll('.animal-card');

    const activeFilters = {
        age: "tous",
        taille: "tous",
        caractere: "tous",
        sexe: "tous"
    };

    function filterCards() {
        const searchValue = searchInput.value.toLowerCase().trim();

        cards.forEach(card => {
            const age = card.dataset.age;
            const taille = card.dataset.taille;
            const caractere = card.dataset.caractere;
            const sexe = card.dataset.sexe;

            const name = (card.dataset.name || "").toLowerCase();
            const description = (card.dataset.description || "").toLowerCase();

            const matchSearch = name.includes(searchValue) || description.includes(searchValue);
            const matchAge = activeFilters.age === "tous" || activeFilters.age === age;
            const matchTaille = activeFilters.taille === "tous" || activeFilters.taille === taille;
            const matchCaractere = activeFilters.caractere === "tous" || activeFilters.caractere === caractere;
            const matchSexe = activeFilters.sexe === "tous" || activeFilters.sexe === sexe;

            if (matchSearch && matchAge && matchTaille && matchCaractere && matchSexe) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.filterGroup;
            const value = btn.dataset.filter;

            document.querySelectorAll(`.filter-btn[data-filter-group="${group}"]`)
                .forEach(b => b.classList.remove('active'));

            btn.classList.add('active');

            activeFilters[group] = value;
            filterCards();
        });
    });

    searchInput.addEventListener('input', filterCards);

    resetButton.addEventListener('click', () => {
        searchInput.value = "";
        Object.keys(activeFilters).forEach(key => activeFilters[key] = "tous");

        filterButtons.forEach(btn => {
            if (btn.dataset.filter === "tous") btn.classList.add('active');
            else btn.classList.remove('active');
        });

        filterCards();
    });

    filterCards();
});
