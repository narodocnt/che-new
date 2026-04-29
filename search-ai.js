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
    if (textField) textField.value = "Аналізую запит...";

    try {
        let allResults = [];
        let isCountQuery = searchText.includes("скільки") || searchText.includes("кількість");

        // Список громад для розпізнавання (можна розширити)
        const hromadas = ["золотоніська", "багачівська", "смілянська", "черкаська", "уманська", "чигиринська"];
        let targetHromada = hromadas.find(h => searchText.includes(h.toLowerCase()));

        // Список жанрів для розпізнавання
        const genresMap = {
            "вокальн": "vocal",
            "хоров": "vocal",
            "хореографіч": "choreographic",
            "танцювальн": "choreographic",
            "інструментальн": "instrumental",
            "фольклор": "folklore"
        };
        let targetGenreKey = Object.keys(genresMap).find(key => searchText.includes(key));
        let targetGenre = targetGenreKey ? genresMap[targetGenreKey] : null;

        // ШУКАЄМО
        for (const genre in collectivesData) {
            // Якщо в запиті вказано конкретний жанр, ігноруємо інші категорії
            if (targetGenre && genre !== targetGenre) continue;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = collectivesData[genre];
            const items = tempDiv.querySelectorAll('li');
            
            items.forEach(li => {
                const text = li.innerText.toLowerCase();
                let match = false;

                if (targetHromada) {
                    // Якщо шукаємо по громаді + жанр
                    if (text.includes(targetHromada)) match = true;
                } else {
                    // Звичайний пошук по тексту
                    if (text.includes(searchText)) match = true;
                }

                if (match) {
                    allResults.push({ назва: li.innerHTML, категорія: genre });
                }
            });
        }

        // ВІДОБРАЖЕННЯ
        if (allResults.length > 0) {
            if (isCountQuery) {
                // Спеціальна відповідь для запитів "Скільки..."
                let genreName = targetGenreKey || "колективів";
                let hromadaName = targetHromada ? `у ${targetHromada[0].toUpperCase() + targetHromada.slice(1)} громаді` : "";
                
                let countHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <h1 style="font-size: 50px; color: #e67e22; margin: 0;">${allResults.length}</h1>
                        <p style="font-size: 18px;">Саме стільки <strong>${genreName}</strong> колективів знайдено ${hromadaName}.</p>
                        <button onclick='window.showFullList()' style="background: #2c3e50; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Показати список</button>
                    </div>
                `;
                // Зберігаємо список, щоб показати його за кнопкою
                window.lastResults = allResults;
                window.showFullList = () => displayLocalResults(window.lastResults, searchText);
                
                showModal(countHTML);
            } else {
                displayLocalResults(allResults, searchText);
            }
        } else {
            showModal(`На жаль, за запитом "<strong>${searchText}</strong>" інформації не знайдено.`);
        }

    } catch (error) {
        console.error("Помилка:", error);
        showModal("Сталася помилка при аналізі даних.");
    } finally {
        if (textField && (textField.value.includes("Шукаю") || textField.value.includes("Аналізую"))) {
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

let currentUtterance = null; // Глобальна змінна для відстеження мовлення

function toggleSpeech() {
    const modalText = document.getElementById('modal-text');
    const btn = document.querySelector('.btn-listen'); // Переконайтеся, що у кнопки є цей клас

    // 1. Якщо зараз уже звучить голос — зупиняємо його
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (btn) btn.innerHTML = '🔊 Слухати повністю';
        return;
    }

    // 2. Якщо тиша — починаємо читати
    if (modalText) {
        const textToRead = modalText.innerText;
        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = 'uk-UA';

        // Змінюємо текст кнопки, поки грає звук
        currentUtterance.onstart = () => {
            if (btn) btn.innerHTML = '🔇 Зупинити прослуховування';
        };

        // Повертаємо текст кнопки, коли закінчив читати
        currentUtterance.onend = () => {
            if (btn) btn.innerHTML = '🔊 Слухати повністю';
        };

        window.speechSynthesis.speak(currentUtterance);
    }
}

// Важливо: зупиняти звук при закритті модалки
const originalCloseModal = closeModal; 
const closeModalWithAudio = () => {
    window.speechSynthesis.cancel(); // Вимикаємо звук при закритті
    if (typeof originalCloseModal === 'function') originalCloseModal();
};
