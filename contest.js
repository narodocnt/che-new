async function loadRanking() {
    const N8N_GET_RANKING_URL = "https://n8n.narodocnt.online/webhook/get-ranking";
    
    try {
        const response = await fetch(N8N_GET_RANKING_URL);
        const rawData = await response.json();
        const list = document.getElementById('rankingList');
        if (!list) return;

        list.innerHTML = ''; 

        // 1. Видаляємо дублікати за URL, щоб рейтинг був чесним
        const uniqueData = Array.from(new Map(rawData.map(item => [item.url, item])).values());

        // 2. Сортуємо за лайками (тепер ключ просто "likes")
        uniqueData.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        
        const maxLikes = Math.max(...uniqueData.map(item => item.likes || 0)) || 1;

        uniqueData.forEach((item, index) => {
            const likes = item.likes || 0;
            const percentage = (likes / maxLikes) * 100;
            
            // Відображаємо pageName, якщо воно порожнє — пишемо "Учасник №..."
            const displayName = item.pageName && item.pageName.trim() !== "" 
                ? item.pageName 
                : `Колектив №${item.row_number - 1}`;

            // Використовуємо фото учасника або стандартну іконку
            const photoUrl = item.photo && item.photo.trim() !== "" 
                ? item.photo 
                : 'фото_для_боту.png'; 
            
            list.innerHTML += `
                <div class="rank-card">
                    <img src="${photoUrl}" class="rank-photo" alt="photo">
                    <div class="rank-details">
                        <div class="rank-header">
                            <span class="rank-name">#${index + 1} ${displayName}</span>
                            <span class="likes-count"><i class="fas fa-heart"></i> ${likes}</span>
                        </div>
                        <div class="progress-wrapper">
                            <div class="progress-fill" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Помилка завантаження рейтингу:", error);
        document.getElementById('rankingList').innerHTML = "<p style='text-align:center;'>Дані оновлюються, зачекайте хвилинку...</p>";
    }
}

document.addEventListener('DOMContentLoaded', loadRanking);
