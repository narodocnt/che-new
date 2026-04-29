window.performSearch = async function(query) {
    const searchText = (query || textField.value).trim().toLowerCase();
    if (searchText.length < 2) return;

    if (banduraImg) banduraImg.src = 'bandura-thinking.png';
    if (textField) textField.value = "Шукаю у базі...";

    try {
        // Ми не робимо fetch, а шукаємо прямо в об'єкті collectivesData з collectives.js
        let allResults = [];

        for (const genre in collectivesData) {
            // Створюємо віртуальний елемент, щоб витягнути текст із HTML-рядків
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = collectivesData[genre];
            
            // Шукаємо всі елементи списку (колективи)
            const items = tempDiv.querySelectorAll('li');
            
            items.forEach(li => {
                const text = li.innerText.toLowerCase();
                if (text.includes(searchText)) {
                    // Парсимо текст, щоб витягнути назву та керівника (приблизно)
                    allResults.push({
                        назва: li.innerHTML, // зберігаємо з оформленням
                        категорія: genre
                    });
                }
            });
        }

        if (allResults.length > 0) {
            displayLocalResults(allResults, searchText);
        } else {
            showModal(`За запитом "<strong>${searchText}</strong>" нічого не знайдено.`);
        }

    } catch (error) {
        console.error("Помилка пошуку:", error);
        showModal("Сталася помилка при обробці даних.");
    } finally {
        if (banduraImg) banduraImg.src = 'bandura-idle.png';
        if (textField && textField.value === "Шукаю у базі...") {
            textField.value = "";
        }
    }
};

// Додайте цю допоміжну функцію для відображення
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
