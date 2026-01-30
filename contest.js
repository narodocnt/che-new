/**
 * contest.js - Версія з пошуком за postId
 */
var currentData = [];

async function loadRanking() {
    const N8N_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    const listElement = document.getElementById('rankingList');
    
    if (!listElement) return;

    try {
        const response = await fetch(N8N_URL);
        const data = await response.json();
        const db = window.collectivesDatabase;

        if (!db) {
            console.error("База collectivesDatabase не знайдена!");
            return;
        }

        let groups = {};

        data.forEach(item => {
            // ВикористовуємоpostId або url для ідентифікації
            const pId = String(item.postId || "");
            const fbUrl = String(item.url || "").toLowerCase();
            let id = null;

            // Зіставлення за реальними даними з вашої консолі
            if (pId === "1393924596111813" || fbUrl.includes("2030897574364185")) id = 10; // Сміла
            else if (pId === "1395880485916224" || fbUrl.includes("1472787384850228")) id = 11; // Звенигородка
            else if (pId === "1382677543903185" || fbUrl.includes("846728421312742")) id = 12; // Кам'янка
            else if (pId === "1395890575915215" || fbUrl.includes("1317445256737431")) id = 14; // Тальне
            else if (pId === "1384574163713523" || fbUrl.includes("1260839919431949")) id = 17; // Христинівка
            else if (pId === "1390245389813067" || fbUrl.includes("4422636818000921")) id = 20; // Водограй (Городище)

            if (id && db[id]) {
                const total = (parseInt(item.likes) || 0) + (parseInt(item.shares) || 0) + (parseInt(item.comments) || 0);
                
                // Зберігаємо лише найкращий результат для цього колективу
                if (!groups[id] || total > groups[id].score) {
                    groups[id] = {
                        ...db[id],
                        score: total,
                        link: fbUrl
                    };
                }
            }
        });

        const sorted = Object.values(groups).sort((a, b) => b.score - a.score);
        console.log("ОСТАТОЧНИЙ РЕЗУЛЬТАТ ПІСЛЯ ПЕРЕВІРКИ ID:", sorted);

        if (sorted.length > 0) {
            renderRanking(sorted);
        } else {
            listElement.innerHTML = "<p style='color:orange;'>Збігів не знайдено. ПеревіртеpostId у коді.</p>";
        }

    } catch (e) {
        console.error("Помилка завантаження:", e);
    }
}

function renderRanking(data) {
    const listElement = document.getElementById('rankingList');
    if (!listElement) return;

    listElement.innerHTML = data.map((item, index) => `
        <div style="background: white; margin: 10px 0; padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-left: 6px solid ${index === 0 ? '#f1c40f' : '#e67e22'};">
            <div style="text-align: left; display: flex; align-items: center;">
                <span style="font-weight: 800; font-size: 1.3rem; color: ${index === 0 ? '#f1c40f' : '#bdc3c7'}; min-width: 40px;">#${index + 1}</span>
                <div style="margin-left: 10px;">
                    <div style="font-weight: bold; font-size: 1.1rem; color: #2c3e50;">${item.name}</div>
                    <div style="font-size: 0.85rem; color: #7f8c8d;">${item.location || 'Громада'}</div>
                </div>
            </div>
            <div style="background: #fdf2e9; padding: 8px 18px; border-radius: 25px; font-weight: bold; color: #e67e22; font-size: 1.2rem; display: flex; align-items: center;">
                ${item.score} <span style="margin-left: 5px; font-size: 1rem;">🔥</span>
            </div>
        </div>
    `).join('');
}

// Запуск
window.addEventListener('load', () => setTimeout(loadRanking, 1000));
