async function loadBattleRanking() {
    var N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    try {
        var response = await fetch(N8N_URL);
        var rawData = await response.json();
        var processedItems = [];
        window.currentBattleData = {}; // Очищаємо перед оновленням

        rawData.forEach(function(item) {
            var fullText = (item.message || item.text || "").trim();
            if (!fullText || fullText.length < 10) return;

            var t = fullText.toLowerCase();
            var foundId = null;

            // ЗРІВНЯННЯ ТА ПОРІВНЯННЯ з базою даних
            // Шукаємо, до якого ID з реєстру належить цей пост
            for (var id in window.collectivesDatabase) {
                var dbItem = window.collectivesDatabase[id];
                // Перевіряємо за назвою колективу або за локацією (громадою)
                if (t.includes(dbItem.location.toLowerCase()) || 
                    t.includes(dbItem.key.toLowerCase()) || 
                    t.includes(dbItem.name.toLowerCase().substring(0, 10))) {
                    foundId = id;
                    break;
                }
            }

            // Якщо знайшли збіг у таблиці — беремо дані з неї, інакше пропускаємо або беремо "як є"
            if (foundId) {
                var official = window.collectivesDatabase[foundId];
                var score = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);

                var entry = {
                    id: foundId,
                    name: official.name, // Беремо офіційну назву з реєстру
                    score: score,
                    url: item.facebookUrl || item.url || "#",
                    media: official.media, // Беремо офіційне фото
                    leader: official.leader, // Беремо офіційного керівника
                    hromada: official.location.toLowerCase()
                };

                processedItems.push(entry);

                // Оновлюємо дані для мапи (тільки найкращий результат для цієї локації)
                var locKey = official.location.toLowerCase();
                if (!window.currentBattleData[locKey] || score > window.currentBattleData[locKey].score) {
                    window.currentBattleData[locKey] = entry;
                }
            }
        });

        // Сортуємо за балами
        processedItems.sort(function(a, b) { return b.score - a.score; });
        
        // Призначаємо ранги (місця)
        processedItems.forEach(function(item, index) { 
            item.rank = index + 1; 
            // Оновлюємо ранг у даних для мапи
            if (window.currentBattleData[item.hromada] && window.currentBattleData[item.hromada].id === item.id) {
                window.currentBattleData[item.hromada].rank = item.rank;
            }
        });

        window.currentData = processedItems;

        // Викликаємо малювання карток та маркерів
        if (typeof renderList === 'function') renderList();
        if (typeof renderMarkers === 'function') renderMarkers('battle');

    } catch (e) { console.error("Помилка порівняння даних:", e); }
}

// Примусовий запуск режиму громад при старті
setTimeout(() => {
    setMode('collectives');
}, 500);

