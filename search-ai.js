// 1. Глобальна функція, щоб її бачили кнопки в HTML
window.performSearch = null;

document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const micBtn = document.getElementById('btn-mic');
    const closeBtn = document.querySelector('.close-modal');

    // --- ФУНКЦІЇ МОДАЛКИ ---
    const showModal = (html) => {
        if (!modal || !modalText) return;
        modalText.innerHTML = html;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    window.onclick = (event) => { if (event.target === modal) closeModal(); };

    // --- ДОПОМІЖНА ФУНКЦІЯ ВІДОБРАЖЕННЯ ---
    function displayLocalResults(items, query) {
        if (banduraImg) banduraImg.src = 'bandura-pointing.png';
        let content = `<h3>Результати пошуку ("${query}")</h3><p>Знайдено: ${items.length}</p><hr>`;
        
        items.forEach(item => {
            content += `
                <div style="margin-bottom: 15px; border-left: 4px solid #e67e22; padding-left: 10px; text-align: left;">
                    <div style="font-size: 14px;">${item.назва}</div>
                    <div style="font-size: 11px; color: #7f8c8d; text-transform: uppercase; margin-top: 5px;">
                        📂 Категорія: ${item.категорія}
                    </div>
                </div>`;
        });
        showModal(content);
    }

    // --- ГОЛОВНА ФУНКЦІЯ ПОШУКУ (ЛОКАЛЬНА) ---
    window.performSearch = async function(query) {
        const searchText = (query || (textField ? textField.value : "")).trim().toLowerCase();
        if (searchText.length < 2) return;

        if (banduraImg) banduraImg.src = 'bandura-thinking.png';
        if (textField) textField.value = "Шукаю у базі...";

        try {
            // Перевіряємо, чи підключено файл з базою даних
            if (typeof collectivesData === 'undefined') {
                showModal("Помилка: База даних колективів не завантажена.");
                return;
            }

            let allResults = [];

            // Проходимо по категоріях у collectives.js
            for (const genre in collectivesData) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = collectivesData[genre];
                const items = tempDiv.querySelectorAll('li');
                
                items.forEach(li => {
                    if (li.innerText.toLowerCase().includes(searchText)) {
                        allResults.push({
                            назва: li.innerHTML,
                            категорія: genre
                        });
                    }
                });
            }

            if (allResults.length > 0) {
                displayLocalResults(allResults, searchText);
            } else {
                if (banduraImg) banduraImg.src = 'bandura-idle.png';
                showModal(`За запитом "<strong>${searchText}</strong>" нічого не знайдено.`);
            }

        } catch (error) {
            console.error("Помилка пошуку:", error);
            showModal("Сталася помилка при обробці даних.");
        } finally {
            if (textField && textField.value === "Шукаю у базі...") {
                textField.value = "";
            }
        }
    };

    // --- ЛОГІКА МІКРОФОНУ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (micBtn && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            try {
                recognition.start();
                if (banduraImg) banduraImg.src = 'bandura-listening.png';
                if (textField) textField.value = "Слухаю вас...";
            } catch (e) { console.error("Мікрофон уже активний"); }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (textField) textField.value = transcript;
            window.performSearch(transcript);
        };

        recognition.onend = () => {
            if (banduraImg && banduraImg.src.includes('listening')) {
                banduraImg.src = 'bandura-idle.png';
            }
        };
    }

    // Додаємо обробку Enter у полі пошуку
    if (textField) {
        textField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.performSearch();
        });
    }
});
