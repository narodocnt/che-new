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
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    
    // Беремо текст із мікрофона або з поля вводу
    const searchText = (query || (textField ? textField.value : "")).trim().toLowerCase();
    if (searchText.length < 2) return;

    // 1. ВІЗУАЛІЗАЦІЯ ЗАПИТУ (як ви просили)
    if (textField) textField.value = `Шукаю: ${searchText}...`;
    if (banduraImg) banduraImg.src = 'bandura-thinking.png';

    try {
        let allResults = [];
        let isCountQuery = searchText.includes("скільки") || searchText.includes("кількість");

        // Визначаємо ГРОМАДУ
        const hromadaKeys = Object.keys(window.collectivesList);
        let targetHromada = hromadaKeys.find(h => searchText.includes(h));

        // Визначаємо ЖАНР
        const genresMap = {
            "театр": ["театр", "драматич", "сміхограй", "березіль", "брама", "театральн"],
            "хореографіч": ["танцю", "хореографіч", "бального", "герц", "сузір", "ясочка", "ансамбль танцю"],
            "вокальн": ["хор", "вокальн", "ансамбль пісні", "тріо", "дует", "капела", "гурт", "співу", "вокально-хоров"],
            "інструментальн": ["оркестр", "інструмент", "музик", "баян", "гармош", "рок-гурт", "біг-бенд"]
        };

        let activeGenreWords = null;
        let genreLabel = "колективів";

        for (let genre in genresMap) {
            if (searchText.includes(genre.slice(0, 5))) {
                activeGenreWords = genresMap[genre];
                genreLabel = genre + "их колективів";
                break;
            }
        }

        // 2. ПОШУК ПО БАЗІ
        for (const hromada in window.collectivesList) {
            if (targetHromada && hromada !== targetHromada) continue;

            window.collectivesList[hromada].forEach(item => {
                const itemLower = item.toLowerCase();
                let matches = false;

                if (activeGenreWords) {
                    matches = activeGenreWords.some(word => itemLower.includes(word));
                } else {
                    matches = itemLower.includes(searchText);
                }

                if (matches) {
                    allResults.push({ text: item, hromada: hromada });
                }
            });
        }

        // 3. ФОРМУВАННЯ РЕЗУЛЬТАТУ
        if (allResults.length > 0) {
            if (banduraImg) banduraImg.src = 'bandura-pointing.png';
            
            let html = "";
            const hromadaName = targetHromada ? `у ${targetHromada} громаді` : "";
            
            // Текст-підсумок (відображається в модалці)
            let resultSummary = `За вашим запитом знайдено ${allResults.length} ${genreLabel} ${hromadaName}.`;

            html += `
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="font-size: 55px; color: #e67e22; margin: 0;">${allResults.length}</h1>
                    <p style="font-size: 16px; font-weight: bold;">${resultSummary}</p>
                    <hr>
                </div>`;

            allResults.forEach(res => {
                html += `
                    <div style="margin-bottom: 12px; border-left: 4px solid #ffd700; padding-left: 10px; text-align: left;">
                        <div style="font-size: 14px;">${res.text}</div>
                        <div style="font-size: 11px; color: #7f8c8d; text-transform: uppercase;">📍 ${res.hromada}</div>
                    </div>`;
            });

            showModal(html);
        } else {
            showModal(`За запитом "<strong>${searchText}</strong>" нічого не знайдено.`);
        }

    } catch (error) {
        console.error("Помилка:", error);
    } finally {
        // Очищаємо поле пошуку через невелику паузу, щоб встигли прочитати "Шукаю..."
        setTimeout(() => {
            if (textField) textField.value = "";
        }, 1500);
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
