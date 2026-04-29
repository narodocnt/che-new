// 1. Глобальні змінні
window.performSearch = null;
let currentUtterance = null;

// Функції для виправлення помилок (Алгоритм Левенштейна)
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
    }
    return matrix[b.length][a.length];
}

function getCloserWord(word, list) {
    let closest = null;
    let minDistance = 3; // Поріг чутливості (1-2 букви помилки)
    list.forEach(item => {
        let distance = levenshteinDistance(word.toLowerCase(), item.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closest = item;
        }
    });
    return closest;
}

document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const micBtn = document.getElementById('btn-mic');
    const closeBtn = document.getElementById('modal-close-btn');
    const btnVoice = document.getElementById('btn-voice');

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
        window.speechSynthesis.cancel(); // Вимикаємо звук при закритті
        if (btnVoice) btnVoice.innerHTML = '🔊 Слухати повністю';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    window.onclick = (event) => { if (event.target === modal) closeModal(); };

    // --- ГОЛОВНА ФУНКЦІЯ ПОШУКУ ---
    window.performSearch = async function(query) {
        const searchText = (query || (textField ? textField.value : "")).trim().toLowerCase();
        if (searchText.length < 2) return;

        // Візуалізація пошуку
        if (banduraImg) banduraImg.src = 'bandura-thinking.png';
        if (textField) textField.value = `Шукаю: ${searchText}...`;

        try {
            let allResults = [];
            let suggestion = null;
            let isCountQuery = searchText.includes("скільки") || searchText.includes("кількість");

            // 1. Складаємо базу для "виправлення помилок" (прізвища керівників)
            let allLeaders = [];
            for (let gr in window.collectivesList) {
                window.collectivesList[gr].forEach(item => {
                    let match = item.match(/Керівник:\s*([^)]+)/);
                    if (match) {
                        let names = match[1].split(' ');
                        allLeaders.push(...names.filter(n => n.length > 3));
                    }
                });
            }

            // 2. Пошук пропозиції (якщо Пазюк -> Панзюк)
            let searchWords = searchText.split(' ');
            searchWords.forEach(w => {
                let found = getCloserWord(w, allLeaders);
                if (found && found.toLowerCase() !== w.toLowerCase()) suggestion = found;
            });

            // 3. Фільтрація по громадах та жанрах
            const genresMap = { "вокальн": "хор", "хоров": "хор", "хореографіч": "танцю", "танцювальн": "танцю", "інструментальн": "інструм", "театр": "театр" };
            let targetGenreKey = Object.keys(genresMap).find(key => searchText.includes(key));
            let targetGenreRegex = targetGenreKey ? new RegExp(genresMap[targetGenreKey], "i") : null;

            for (const hromada in window.collectivesList) {
                const hromadaMatch = searchText.includes(hromada);
                
                window.collectivesList[hromada].forEach(itemText => {
                    const itemLower = itemText.toLowerCase();
                    let isMatch = false;

                    if (hromadaMatch) {
                        // Якщо назвали громаду — шукаємо в ній (і перевіряємо жанр, якщо він вказаний)
                        if (!targetGenreRegex || targetGenreRegex.test(itemLower)) isMatch = true;
                    } else if (itemLower.includes(searchText) || (suggestion && itemLower.includes(suggestion.toLowerCase()))) {
                        // Звичайний текстовий пошук
                        isMatch = true;
                    }

                    if (isMatch) {
                        allResults.push({ text: itemText, hromada: hromada });
                    }
                });
            }

            // 4. ВІДОБРАЖЕННЯ
            if (allResults.length > 0) {
                if (banduraImg) banduraImg.src = 'bandura-pointing.png';
                
                let resultHTML = "";
                if (suggestion) resultHTML += `<p style="color: #d35400; font-style: italic;">Можливо, ви мали на увазі: <b>${suggestion}</b>?</p>`;

                if (isCountQuery) {
                    resultHTML += `
                        <div style="text-align: center; padding: 10px;">
                            <h1 style="font-size: 48px; color: #e67e22; margin: 0;">${allResults.length}</h1>
                            <p>колективів знайдено за вашим запитом</p>
                            <hr>
                        </div>`;
                }

                allResults.forEach(res => {
                    resultHTML += `
                        <div style="margin-bottom: 12px; border-left: 4px solid #ffd700; padding-left: 10px; text-align: left;">
                            <div style="font-size: 14px;">${res.text}</div>
                            <div style="font-size: 11px; color: #7f8c8d;">📍 Громада: ${res.hromada.toUpperCase()}</div>
                        </div>`;
                });
                showModal(resultHTML);
            } else {
                showModal(`На жаль, за запитом "<strong>${searchText}</strong>" нічого не знайдено.`);
            }

        } catch (error) {
            console.error("Помилка:", error);
            showModal("Помилка при обробці запиту.");
        } finally {
            if (textField) textField.value = "";
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
            } catch (e) { recognition.stop(); }
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            window.performSearch(transcript);
        };

        recognition.onend = () => {
            if (banduraImg && banduraImg.src.includes('listening')) {
                banduraImg.src = 'bandura-idle.png';
            }
        };
    }

    if (textField) {
        textField.addEventListener('keypress', (e) => { if (e.key === 'Enter') window.performSearch(); });
    }
});

// --- ФУНКЦІЯ ГОЛОСУ (TOGGLE) ---
function toggleSpeech() {
    const modalText = document.getElementById('modal-text');
    const btn = document.getElementById('btn-voice');

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (btn) btn.innerHTML = '🔊 Слухати повністю';
        return;
    }

    if (modalText && modalText.innerText.trim() !== "") {
        const textToRead = modalText.innerText;
        currentUtterance = new SpeechSynthesisUtterance(textToRead);
        currentUtterance.lang = 'uk-UA';

        currentUtterance.onstart = () => { if (btn) btn.innerHTML = '🔇 Зупинити звук'; };
        currentUtterance.onend = () => { if (btn) btn.innerHTML = '🔊 Слухати повністю'; };

        window.speechSynthesis.speak(currentUtterance);
    }
}
