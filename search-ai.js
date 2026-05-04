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
    
// Переконайтеся, що функція має назву performSearch
window.performSearch = function(query) {
    if (!query) return;
    // ... ваша логіка пошуку ...
    console.log("Пошук запущено для:", query);
};
    var q = query.toLowerCase().trim();
    var foundResults = "";
    var count = 0; // Лічильник для загальної кількості
    var allPossibleSuggestions = []; 

    if (typeof collectivesData !== 'undefined') {
        for (var key in collectivesData) {
            var categoryHtml = collectivesData[key];
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = categoryHtml;
            var items = tempDiv.getElementsByTagName('li');

            for (var i = 0; i < items.length; i++) {
                var itemText = items[i].innerText;
                var itemTextLower = itemText.toLowerCase();
                
                // 1. Прямий пошук
                if (itemTextLower.includes(q)) {
                    count++; // Збільшуємо лічильник при кожному збігу
                    
                    // Додаємо порядковий номер перед текстом колективу
                    var numberedContent = "<strong>" + count + ".</strong> " + items[i].innerHTML;
                    foundResults += "<li style='margin-bottom: 10px;'>" + numberedContent + "</li>";
                }

                // 2. Збір бази для підказок
                var parts = itemText.split(/[—,.]/); 
                parts.forEach(p => {
                    var clean = p.trim();
                    if (clean.length > 3) allPossibleSuggestions.push(clean);
                });
            }
        }
    }

    // ВИВЕДЕННЯ РЕЗУЛЬТАТІВ
    if (foundResults !== "") {
        // Додаємо заголовок із загальною кількістю знайдених колективів
        var header = "<div style='margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #ccc;'>" +
                     "Знайдено колективів: <strong>" + count + "</strong></div>";
        
        var finalHtml = header + "<ul style='list-style: none; padding: 0;'>" + foundResults + "</ul>";
        
        if (window.showModal) {
            window.showModal(finalHtml);
        } else {
            var display = document.getElementById('collectives-display');
            if (display) display.innerHTML = finalHtml;
        }
    } else {
        // ОБРОБКА ПОМИЛОК (Можливо, ви мали на увазі...)
        var suggestion = findBestMatch(q, allPossibleSuggestions);
        var errorMsg = "За запитом '" + query + "' нічого не знайдено.";
        
        if (suggestion) {
            errorMsg += "<br><br><strong>Можливо, ви мали на увазі:</strong><br><em>" + suggestion + "</em>";
        }

        if (window.showModal) {
            window.showModal("<div style='text-align:center; padding:20px;'>" + errorMsg + "</div>");
        } else {
            alert(errorMsg.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, ""));
        }
    }
};

/**
 * Функція пошуку схожого слова (Алгоритм Левенштейна або спрощений варіант)
 */
function findBestMatch(input, list) {
    var bestWord = null;
    var minDistance = 3; // Максимальна кількість помилок у слові (чим менше, тим суворіше)

    // Прибираємо дублікати з бази підказок
    var uniqueList = [...new Set(list)];

    for (var i = 0; i < uniqueList.length; i++) {
        var word = uniqueList[i];
        var distance = levenshtein(input, word.toLowerCase());
        
        if (distance < minDistance) {
            minDistance = distance;
            bestWord = word;
        }
    }
    return bestWord;
}

/**
 * Обчислення дистанції між словами (кількість правок)
 */
function levenshtein(a, b) {
    var matrix = [];
    for (var i = 0; i <= b.length; i++) matrix[i] = [i];
    for (var j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (var i = 1; i <= b.length; i++) {
        for (var j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

    // --- ЛОГІКА МІКРОФОНУ ---
   // --- ЛОГІКА МІКРОФОНУ ТА КЛАВІАТУРИ ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (micBtn && SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'uk-UA';
    recognition.interimResults = false; // Повертати тільки фінальний результат

    micBtn.onclick = () => {
        try {
            recognition.start();
            if (banduraImg) banduraImg.src = 'bandura-listening.png';
            if (textField) {
                textField.value = ""; 
                textField.placeholder = "Слухаю вас...";
            }
        } catch (e) { 
            recognition.stop(); 
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        
        // 1. Записуємо розпізнаний текст у поле введення
        if (textField) {
            textField.value = transcript;
            textField.placeholder = "Пошук колективів...";
        }
        
        // 2. Відправляємо текст у функцію пошуку
        if (typeof window.performSearch === "function") {
            window.performSearch(transcript);
        }
    };

    recognition.onend = () => {
        if (banduraImg) {
            // Повертаємо початковий стан бандури
            banduraImg.src = 'bandura-idle.png';
        }
        if (textField && textField.value === "") {
            textField.placeholder = "Пошук колективів...";
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (banduraImg) banduraImg.src = 'bandura-idle.png';
    };
}

// Виправлення для клавіші Enter
if (textField) {
    textField.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') {
            // Передаємо значення з поля в функцію пошуку
            window.performSearch(textField.value); 
        }
    });
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
