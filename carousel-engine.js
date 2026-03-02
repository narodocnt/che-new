// Вставте сюди посилання, яке ви щойно скопіювали (CSV)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTGW5Qf1YBD0b2T0JQy-N3Wb63RWZlkSK_blVTcF5FK8-ODb_CQAV9IqIudEyMsZp8jE_g2Gd5AUC17/pub?gid=1813409784&single=true&output=csv';

async function initCarousel() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const rows = data.split('\n').slice(1); // Пропускаємо заголовок таблиці
        
        const wrapper = document.querySelector('.swiper-wrapper');
        wrapper.innerHTML = ''; 

        rows.forEach(row => {
            // Розділяємо колонки
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (cols[0]) { // Якщо назва колективу є
                const slide = `
                <div class="swiper-slide">
                    <div class="collective-card">
                        <img src="${cols[5]?.trim() || 'https://via.placeholder.com/400x300'}" alt="Фото">
                        <div class="card-content">
                            <h3>${cols[0].replace(/"/g, '')}</h3>
                            <p class="location">🏢 ${cols[1].replace(/"/g, '')}</p>
                            <p class="leader">👤 <strong>Керівник:</strong> ${cols[3].replace(/"/g, '')}</p>
                        </div>
                    </div>
                </div>`;
                wrapper.insertAdjacentHTML('beforeend', slide);
            }
        });

        // Запуск Swiper
      const swiper = new Swiper('.swiper-container', {
    effect: 'coverflow',        // Активація 3D
    grabCursor: true,
    centeredSlides: true,       // Головний слайд суворо по центру
    slidesPerView: 'auto',      // Дозволяє боковим слайдам "підповзати" під центральний
    loop: true,                 // Нескінченне коло
    coverflowEffect: {
        rotate: 20,             // Кут повороту бокових (не ставте забагато, 20-30 достатньо)
        stretch: 50,            // Це "стискає" слайди до центру (зробить коло щільнішим)
        depth: 300,             // Глибина: чим більше число, тим менші бокові фото
        modifier: 1,
        slideShadows: true,     // Тіні для об'єму
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});
    } catch (error) {
        console.error("Помилка завантаження даних:", error);
    }
}

document.addEventListener('DOMContentLoaded', initCarousel);
