document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');

    // ОСНОВНА ФУНКЦІЯ ПОШУКУ
    async function performSearch(query) {
        const searchText = (query || textField.value).trim().toLowerCase();
        if (searchText.length < 2) return;

        console.log("Шукаю:", searchText);
        banduraImg.src = 'bandura-thinking.png';
        textField.value = "Звертаюся до бази...";

        try {
            // Запит до n8n (важливо: n8n має повертати JSON масив рядків з таблиці)
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchText })
            });

            if (!response.ok) throw new Error('Помилка сервера');

            const data = await response.json(); 
            // data має бути масивом об'єктів [{}, {}] з вашої таблиці

            // ФІЛЬТРАЦІЯ (пошук по прізвищах, громадах, жанрах)
            const filtered = data.filter(row => {
                const combinedString = Object.values(row).join(' ').toLowerCase();
                return combinedString.includes(searchText);
            });

            if (filtered.length > 0) {
                displayResults(filtered);
            } else {
                showModal("Нічого не знайдено за запитом '" + searchText + "'. Перевірте прізвище або назву громади.");
            }

        } catch (error) {
            console.error("CORS або Помилка мережі:", error);
            textField.value = "Помилка зв'язку (CORS)";
            banduraImg.src = 'bandura-idle.png';
        }
    }

    function displayResults(items) {
        banduraImg.src = 'bandura-pointing.png';
        let content = `<h3>Знайдено колективів: ${items.length}</h3><hr>`;
        
        items.forEach(item => {
            // Використовуйте назви стовпчиків з вашої таблиці
            const name = item['назва'] || item['Назва'] || "Без назви";
            const leader = item['керівник'] || item['Керівник'] || "Не вказано";
            const hromada = item['громада'] || item['Громада'] || "";

            content += `
                <div style="margin-bottom: 20px; border-left: 4px solid #ffd700; padding-left: 10px;">
                    <strong style="font-size: 1.1em;">${name}</strong><br>
                    <span>👥 Керівник: ${leader}</span><br>
                    <span>📍 Громада: ${hromada}</span>
                </div>`;
        });

        showModal(content);
    }

    function showModal(html) {
        modalText.innerHTML = html;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        banduraImg.src = 'bandura-idle.png';
        textField.value = "";
    }

    // Прив'язка кнопок
    const searchBtn = document.getElementById('btn-search');
    if (searchBtn) searchBtn.onclick = () => performSearch();
    
    textField.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    // Повертаємо функцію для МЕНЮ
    window.filterCollectives = (type) => {
        const types = {
            'vocal': 'вокальний',
            'choreographic': 'хореографічний',
            'instrumental': 'інструментальний',
            'theatrical': 'театральний'
        };
        performSearch(types[type] || type);
    };
});
