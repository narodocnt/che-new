// bitva-cards.js - ТІЛЬКИ ШАБЛОН ТА СТИЛІ
const rankingContainer = document.getElementById('rankingList');

// Функція, яка просто малює порожній каркас карток
function createEmptyCards() {
    if (!rankingContainer) return;
    
    // Очищуємо контейнер і додаємо стилі (якщо їх немає в CSS)
    rankingContainer.innerHTML = '';
    
    // Беремо назви громад з нашого локального списку
    if (typeof hromadasGeoJSON !== 'undefined') {
        hromadasGeoJSON.features.forEach(hromada => {
            const card = document.createElement('div');
            card.className = 'battle-card';
            card.id = `card-${hromada.name.trim().toLowerCase()}`; // ID для пошуку
            
            card.innerHTML = `
                <div class="card-rank">--</div>
                <div class="card-info">
                    <h4>${hromada.name}</h4>
                    <div class="card-stats">
                        <span>❤️ Бали: <b class="score-val">0</b></span>
                    </div>
                </div>
            `;
            rankingContainer.appendChild(card);
        });
    }
}

// Малюємо каркас відразу, як тільки завантажився HTML
document.addEventListener('DOMContentLoaded', createEmptyCards);
