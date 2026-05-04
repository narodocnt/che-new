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

document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const micBtn = document.getElementById('btn-mic');
    const closeBtn = document.getElementById('modal-close-btn');

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
        if (!query) return;
        
        var q = query.toLowerCase().trim();
        var foundResults = "";
        var count = 0; 
        var allPossibleSuggestions = []; 

        console.log("Пошук запущено для:", q);

        if (typeof collectivesData !== 'undefined') {
            for (var key in collectivesData) {
                var categoryHtml = collectivesData[key];
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = categoryHtml;
                var items = tempDiv.getElementsByTagName('li');

                for (var i = 0; i < items.length; i++) {
                    var itemText = items[i].innerText;
                    var itemTextLower = itemText.toLowerCase();
                    
                    if (itemTextLower.includes(q)) {
                        count++;
                        var numberedContent = "<strong>" + count + ".</strong> " + items[i].innerHTML;
                        foundResults += "<li style='margin-bottom: 10px;'>" + numberedContent + "</li>";
                    }

                    var parts = itemText.split(/[—,.]/); 
                    parts.forEach(p => {
                        var clean = p.trim();
                        if (clean.length > 3) allPossibleSuggestions.push(clean);
                    });
                }
            }
        }

        if (foundResults !== "") {
            var header = "<div style='margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid #ccc;'>" +
                         "Знайдено колективів: <strong>" + count + "</strong></div>";
            showModal(header + "<ul style='list-style: none; padding: 0;'>" + foundResults + "</ul>");
        } else {
            var suggestion = findBestMatch(q, allPossibleSuggestions);
            var errorMsg = "За запитом '" + query + "' нічого не знайдено.";
            if (suggestion) {
                errorMsg += "<br><br><strong>Можливо, ви мали на увазі:</strong><br><em>" + suggestion + "</em>";
            }
            showModal("<div style='text-align:center; padding:20px;'>" + errorMsg + "</div>");
        }
    };

    // --- ЛОГІКА МІКРОФОНУ ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (micBtn && SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';

        micBtn.onclick = () => {
            recognition.start();
            if (textField) textField.placeholder = "Слухаю вас...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (textField) textField.value = transcript;
            window.performSearch(transcript);
        };
    }

    if (textField) {
        textField.addEventListener('keypress', (e) => { 
            if (e.key === 'Enter') window.performSearch(textField.value); 
        });
    }
});

function findBestMatch(input, list) {
    var bestWord = null;
    var minDistance = 3;
    var uniqueList = [...new Set(list)];
    for (var i = 0; i < uniqueList.length; i++) {
        var distance = levenshteinDistance(input, uniqueList[i].toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            bestWord = uniqueList[i];
        }
    }
    return bestWord;
}
