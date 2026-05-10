// 1. Глобальні змінні
window.performSearch = null;
let currentUtterance = null;

// Функція Левенштейна для пошуку помилок
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

// Функція підбору схожого слова
function findBestMatch(input, list) {
    let bestWord = null;
    let minDistance = 3; // Поріг: 1-2 помилки
    const uniqueList = [...new Set(list)];
    for (let i = 0; i < uniqueList.length; i++) {
        let distance = levenshteinDistance(input.toLowerCase(), uniqueList[i].toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            bestWord = uniqueList[i];
        }
    }
    return bestWord;
}

// Функція перемикання анімації пошуку (виїзд з-під бандури)
window.toggleBanduraSearch = function() {
    const wrapper = document.getElementById('search-wrapper');
    const field = document.getElementById('bandura-text-field');
    
    if (!wrapper) return;

    if (wrapper.style.width === "0px" || wrapper.style.width === "0" || !wrapper.style.width) {
        wrapper.style.width = "380px"; 
        wrapper.style.border = "1px solid #ccc";
        wrapper.style.paddingLeft = "10px";
        field.placeholder = "Пошук по базі колективів...";
        setTimeout(() => field.focus(), 500);
    } else {
        wrapper.style.width = "0";
        wrapper.style.border = "0";
        wrapper.style.paddingLeft = "0";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const micBtn = document.getElementById('btn-mic');
    const searchBtn = document.getElementById('btn-execute-search'); // Лупа
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const closeBtn = document.getElementById('modal-close-btn');
    const voiceBtn = document.getElementById('btn-voice'); // Кнопка прослуховування

    // --- МОДАЛЬНЕ ВІКНО ---
    const showModal = (html) => {
        if (!modal || !modalText) return;
        modalText.innerHTML = html;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (modal) modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.speechSynthesis.cancel();
    };

    if (closeBtn) closeBtn.onclick = closeModal;

    // --- ГОЛОВНА ФУНКЦІЯ ПОШУКУ ---
    window.performSearch = function(query) {
        if (!query || query.trim() === "") return;
        
        const q = query.toLowerCase().trim();
        textField.value = "Шукаю: " + query + "..."; // Бандура пише, що шукає

        let foundResults = "";
        let count = 0;
        let suggestionsBase = [];

        if (typeof collectivesData !== 'undefined') {
            for (let key in collectivesData) {
                let tempDiv = document.createElement('div');
                tempDiv.innerHTML = collectivesData[key];
                let items = tempDiv.getElementsByTagName('li');

                for (let i = 0; i < items.length; i++) {
                    let itemText = items[i].innerText;
                    if (itemText.toLowerCase().includes(q)) {
                        count++;
                        foundResults += `<li style="margin-bottom:12px;"><strong>${count}.</strong> ${items[i].innerHTML}</li>`;
                    }
                    // Збираємо базу для Левенштейна
                    itemText.split(/[—,.]/).forEach(p => {
                        if (p.trim().length > 3) suggestionsBase.push(p.trim());
                    });
                }
            }
        }

        // Імітація процесу пошуку
        setTimeout(() => {
            if (foundResults !== "") {
                textField.value = query; // Повертаємо текст запиту
                let header = `<div style="margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #ddd;">Знайдено колективів: <strong>${count}</strong></div>`;
                showModal(header + `<ul style="list-style:none; padding:0;">${foundResults}</ul>`);
            } else {
                let suggestion = findBestMatch(q, suggestionsBase);
                if (suggestion) {
                    textField.value = "Мається на увазі: " + suggestion + "?"; // Бандура уточнює в рядку
                    let errorMsg = `За запитом "<strong>${query}</strong>" нічого не знайдено.<br><br>
                                   <strong>Можливо, ви мали на увазі:</strong><br>
                                   <span style="color:#d32f2f; cursor:pointer; font-weight:bold; text-decoration:underline;" 
                                   onclick="window.performSearch('${suggestion.replace(/'/g, "\\'")}')">${suggestion}</span>`;
                    showModal(`<div style="text-align:center; padding:20px;">${errorMsg}</div>`);
                } else {
                    textField.value = "Нічого не знайдено";
                    showModal(`<div style="text-align:center; padding:20px;">На жаль, за запитом "${query}" збігів немає.</div>`);
                }
            }
        }, 600);
    };

    // Лупа (Кнопка пошуку)
    if (searchBtn) {
        searchBtn.onclick = () => window.performSearch(textField.value);
    }

    // Прослуховування в модалці
    if (voiceBtn) {
        voiceBtn.onclick = () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                voiceBtn.innerHTML = "🔊 Слухати повністю";
            } else {
                const utterance = new SpeechSynthesisUtterance(modalText.innerText);
                utterance.lang = 'uk-UA';
                utterance.onstart = () => voiceBtn.innerHTML = "🔇 Зупинити звук";
                utterance.onend = () => voiceBtn.innerHTML = "🔊 Слухати повністю";
                window.speechSynthesis.speak(utterance);
            }
        };
    }

    // --- ЛОГІКА МІКРОФОНУ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (micBtn && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            textField.value = "Слухаю..."; // Бандура пише "слухаю"
            recognition.start();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textField.value = transcript; // Підставляє текст
            window.performSearch(transcript);
        };
    }

    // Enter у полі
    if (textField) {
        textField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.performSearch(textField.value);
        });
    }
});
