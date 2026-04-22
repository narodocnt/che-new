/**
 * Розумний пошук для сайту народної творчості ОЦНТ
 * Голос + Локальна база (collectives-list.js) + PDF + ШІ (Mistral via n8n)
 */
document.getElementById('search-btn').addEventListener('click', performSearch);
document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const status = document.getElementById('search-status');

    // 1. НАЛАШТУВАННЯ ГОЛОСОВОГО ПОШУКУ
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';
        recognition.interimResults = false;

        micBtn.onclick = () => {
            recognition.start();
            micBtn.style.color = 'red'; // Візуальний сигнал
            status.innerText = "Слухаю вас...";
            status.style.display = 'block';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            searchInput.value = transcript;
            performSearch(); // Автоматичний пошук після розпізнавання
        };

        recognition.onend = () => {
            micBtn.style.color = '';
            status.style.display = 'none';
        };
    }

    // 2. ФУНКЦІЯ ЛОКАЛЬНОГО ПОШУКУ ПО ОБ'ЄКТУ (collectivesList)
    function searchLocally(query) {
        const q = query.toLowerCase();
        let results = [];

        if (window.collectivesList) {
            for (const hromada in window.collectivesList) {
                const matches = window.collectivesList[hromada].filter(item => 
                    item.toLowerCase().includes(q)
                );
                if (matches.length > 0) {
                    results.push({ hromada: hromada.toUpperCase(), items: matches });
                }
            }
        }
        return results;
    }

    // 3. ФУНКЦІЯ ГОЛОВНОГО ПОШУКУ (ОБ'ЄДНАНА)
    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        // Крок А: Швидка перевірка на PDF-файли
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes("чит") || lowerQuery.includes("читц")) {
            if(confirm("Відкрити Положення конкурсу читців?")) {
                window.open('Polozhennya_chit_2026.pdf', '_blank');
                return;
            }
        }
        if (lowerQuery.includes("авраменко")) {
            window.open('polozhennya_avram.pdf', '_blank');
            return;
        }

        // Крок Б: Спроба знайти в локальному списку громад
        const localMatches = searchLocally(query);
        
        // Крок В: Звернення до ШІ Mistral через n8n
        status.innerText = "ШІ аналізує запит...";
        status.style.display = "block";

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    query: query,
                    localResults: localMatches,
                    context: window.collectivesList // Передаємо базу ШІ
                })
            });

            if (!response.ok) throw new Error('AI Error');

            const data = await response.json();
            
            // Виводимо відповідь у модальне вікно (як ми робили для About)
            alert("🤖 ВІДПОВІДЬ ШІ:\n\n" + (data.output || data.text || "Інформацію знайдено, перевірте розділ заходів."));

        } catch (error) {
            console.warn("ШІ недоступний, використовуємо стандартний пошук:", error);
            
            // Якщо ШІ впав, показуємо локальні результати або Google
            if (localMatches.length > 0) {
                let msg = "Знайдено в колективах:\n";
                localMatches.forEach(r => msg += `\n📍 ${r.hromada}:\n${r.items.join('\n')}`);
                alert(msg);
            } else {
                const googleQuery = `site:narodocnt.online "${query}"`;
                window.open(`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`, '_blank');
            }
        } finally {
            status.style.display = "none";
        }
    }

    // Слухачі кнопок
    searchBtn.onclick = performSearch;
    searchInput.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
});
