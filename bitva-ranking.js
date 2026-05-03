// ФУНКЦІЯ ПРИВ'ЯЗКИ КАРТИНКИ ДО URL АБО ГРОМАДИ (Локальна версія для карток)
function getLocalThumbnail(fbUrl, location) {
    const url = fbUrl || "";
    const loc = (location || "").toLowerCase();
    
    // Базовий шлях до вашого репозиторію на GitHub
    const basePath = "https://raw.githubusercontent.com/narodocnt/che-new/main/img/bitva/";
    let fileName = "bitva-general.jpg"; // Картинка за замовчуванням

    // 1. ПЕРЕВІРКА ЗА КОНКРЕТНИМИ URL (з вашого списку)
    if (url.includes("WyzPQSpMreCz7auctnxkKwtcdYg97h6HCqNiWmjFfSRvckA9JU4PBntEU4BMZYQtl")) fileName = 'bogidar.jpg';
    else if (url.includes("035nKVaG1KrQG5GRDYCoNZqVwi6KGepE8tjx4bBgskbVPLM11gxpTmTZGCcoMmqks5l")) fileName = 'zvenigorodka.jpg';
    else if (url.includes("w2GwfuX2MHDWtxTUUeddGY3g9WiSgPnRpaiXivEsjewVEi8yxKyuQqB1PVr5eFxRl")) fileName = 'kamjanka.jpg';
    else if (url.includes("CQjwz6ULaUAzdxZiz3T6w9LmeaFju4enkotcLiW8teoRexMPFNw5BtLH4xEUtwAKl")) fileName = 'taljne.jpg';
    else if (url.includes("eG6BzQLzt1Y1i72KwycW1Qu8b7g6mZfGnGDiTAkSjFkv4Dye9R1RFkJhcsEX5piCl")) fileName = 'velikosevastjyanivka.jpg';
    else if (url.includes("2WJ8S4ZoMXeEbdNrFbid9MpybW6fscRvSTWC3ptKZ4tqRAdrRJZ7KznrovDENHkkl")) fileName = 'vodogray.jpg';
    
    // 2. ДОДАТКОВА ПЕРЕВІРКА ЗА НАЗВОЮ ГРОМАДИ (на випадок зміни URL у FB)
    else if (loc.includes('богодар')) fileName = 'bogidar.jpg';
    else if (loc.includes('звенигород')) fileName = 'zvenigorodka.jpg';
    else if (loc.includes('кам’ян')) fileName = 'kamjanka.jpg';
    else if (loc.includes('тальн')) fileName = 'taljne.jpg';
    else if (loc.includes('севаст')) fileName = 'velikosevastjyanivka.jpg';
    else if (loc.includes('водогр')) fileName = 'vodogray.jpg';

    return basePath + fileName;
}

function loadBattleRanking() {
    const container = document.getElementById('rankingList');
    // Перевіряємо, чи завантажена база даних з вашого файлу
    if (!container || !window.collectivesDatabase) return;

    fetch("https://n8n.narodocnt.online/webhook/get-ranking")
        .then(res => res.json())
        .then(rawData => {
            const db = window.collectivesDatabase;
            const resultsMap = {};

            rawData.forEach(item => {
                const tableText = (item.text || "").toLowerCase();
                const likes = parseInt(item.likes) || 0;
                const comments = parseInt(item.comments) || 0;
                const shares = parseInt(item.shares) || 0;
                const totalScore = likes + comments + shares;

                let foundId = null;
                for (let id in db) {
                    // Використовуємо логіку на основі унікальних ID громади
                    const locSearch = db[id].location.toLowerCase().substring(0, 5);
                    const keySearch = db[id].key.toLowerCase();
                    
                    if (tableText.includes(locSearch) || tableText.includes(keySearch)) {
                        foundId = id;
                        break;
                    }
                }

                if (foundId) {
                    if (!resultsMap[foundId] || totalScore > resultsMap[foundId].total) {
                        
                        // ОСНОВНА ЗМІНА ТУТ:
                        // Ми ігноруємо те, що прийшло з n8n, і беремо media прямо з вашого об'єкта db
                        const localPhoto = db[foundId].media || "https://narodocnt.online/img/bitva/bitva-general.jpg";

                        resultsMap[foundId] = {
                            ...db[foundId],
                            likes, comments, shares,
                            total: totalScore,
                            finalMedia: localPhoto, // Це посилання з вашого файлу collectives-bitva.js
                            url: item.facebookUrl
                        };
                    }
                }
            });

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            container.innerHTML = sorted.map((el, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;

                return `
                <a href="${el.url}" target="_blank" style="text-decoration: none; color: inherit; display: block; margin-bottom: 15px;">
                    <div class="battle-card" style="background: #ffffff; border-radius: 12px; display: flex; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: none; min-height: 120px;">
                        <div style="width: 140px; min-width: 140px; position: relative;">
                            <img src="${el.finalMedia}" onerror="this.src='https://narodocnt.online/img/bitva/bitva-general.jpg'" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${medal}</div>
                        </div>
                        <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; text-align: left;">
                            <span style="color: #e67e22; font-size: 11px; font-weight: bold;">📍 ${el.location} громада</span>
                            <h3 style="margin: 5px 0; font-size: 16px; color: #2c3e50;">${el.name}</h3>
                            <p style="margin: 0; font-size: 13px; color: #7f8c8d;">Керівник: ${el.leader}</p>
                            <div style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; background: #f8f9fa; padding: 5px 10px; border-radius: 6px;">
                                <span style="font-size: 12px;">👍 ${el.likes} + 💬 ${el.comments} + 🔁 ${el.shares}</span>
                                <span style="font-weight: bold; color: #2c3e50;">= ${el.total}</span>
                            </div>
                        </div>
                    </div>
                </a>`;
            }).join('');
        })
        .catch(err => {
            console.error("Помилка:", err);
            container.innerHTML = '<p style="text-align:center; color:white;">Помилка завантаження даних</p>';
        });
}

            const sorted = Object.values(resultsMap).sort((a, b) => b.total - a.total);

            container.innerHTML = sorted.map((el, index) => {
                const rank = index + 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;

                return `
                <a href="${el.url}" target="_blank" style="text-decoration: none; color: inherit; display: block; margin-bottom: 15px;">
                    <div class="battle-card" style="background: #ffffff; border-radius: 12px; display: flex; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2); border: none; min-height: 120px;">
                        <div style="width: 140px; min-width: 140px; position: relative;">
                            <img src="${el.finalMedia}" onerror="this.src='narodocnt.jpg'" style="width: 100%; height: 100%; object-fit: cover;">
                            <div style="position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.7); color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${medal}</div>
                        </div>
                        <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; text-align: left;">
                            <span style="color: #e67e22; font-size: 11px; font-weight: bold;">📍 ${el.location} громада</span>
                            <h3 style="margin: 5px 0; font-size: 16px; color: #2c3e50;">${el.name}</h3>
                            <p style="margin: 0; font-size: 13px; color: #7f8c8d;">Керівник: ${el.leader}</p>
                            <div style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; background: #f8f9fa; padding: 5px 10px; border-radius: 6px;">
                                <span style="font-size: 12px;">👍 ${el.likes} + 💬 ${el.comments} + 🔁 ${el.shares}</span>
                                <span style="font-weight: bold; color: #2c3e50;">= ${el.total}</span>
                            </div>
                        </div>
                    </div>
                </a>`;
            }).join('');
        })
        .catch(err => {
            console.error("Помилка:", err);
            container.innerHTML = '<p style="text-align:center; color:white;">Помилка завантаження даних</p>';
        });
}

window.addEventListener('load', loadBattleRanking);
