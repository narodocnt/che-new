document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');

    async function performSearch(query) {
        const searchText = query || textField.value.trim().toLowerCase();
        if (!searchText || searchText.length < 2) return;

        banduraImg.src = 'bandura-thinking.png';
        textField.value = "Шукаю у базі...";

        try {
            // Запит до n8n, який просто віддає дані з Google Таблиці
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchText })
            });

            const allCollectives = await response.json(); 
            // Очікуємо, що n8n віддасть масив об'єктів з таблиці
            
            // Фільтрація прямо в браузері (по прізвищу, громаді або жанру)
            const results = allCollectives.filter(item => {
                const content = Object.values(item).join(' ').toLowerCase();
                return content.includes(searchText);
            });

            if (results.length > 0) {
                renderResults(results, searchText);
            } else {
                showResultInModal("На жаль, за запитом '" + searchText + "' нічого не знайдено. Спробуйте змінити назву громади чи прізвище.");
            }

        } catch (error) {
            console.error("Помилка:", error);
            textField.value = "Помилка зв'язку з таблицею";
            banduraImg.src = 'bandura-idle.png';
        }
    }

    function renderResults(data, query) {
        banduraImg.src = 'bandura-pointing.png';
        
        let html = `<h3>Знайдено колективів: ${data.length}</h3><ul>`;
        data.forEach(col => {
            // Тут вкажіть назви колонок з вашої Google Таблиці
            const name = col['Назва колективу'] || col['назва'] || "Без назви";
            const leader = col['Керівник'] || col['керівник'] || "";
            const hromada = col['Громада'] || col['громада'] || "";
            
            html += `<li style="margin-bottom:15px;">
                        <strong>${name}</strong><br>
                        <span>📍 Громада: ${hromada}</span><br>
                        <span>👤 Керівник: ${leader}</span>
                     </li>`;
        });
        html += `</ul>`;
        
        showResultInModal(html);
    }

    function showResultInModal(content) {
        modalText.innerHTML = content;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        banduraImg.src = 'bandura-idle.png';
        textField.value = "";
    }

    // Прив'язка до кнопок
    document.getElementById('btn-search').onclick = () => performSearch();
    textField.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
    
    // Функція для меню (тепер вона працює з цією ж логікою)
    window.filterCollectives = (category) => {
        const genreMap = {
            'vocal': 'вокально-хоровий',
            'choreographic': 'хореографічний',
            'instrumental': 'інструментальний',
            'theatrical': 'театральний'
        };
        performSearch(genreMap[category] || category);
    };
});
