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
     // Запуск Swiper
const swiper = new Swiper('.swiper-container', {
    effect: 'coverflow',
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,

    // 1. Додаємо автоплей
    autoplay: {
        delay: 3000, // Гортати кожні 3 секунди
        disableOnInteraction: false, // НЕ вимикати назовсім після кліку
    },

    coverflowEffect: {
        rotate: 20,
        stretch: 50,
        depth: 300,
        modifier: 1,
        slideShadows: true,
    },

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    // 2. Логіка зупинки та відновлення (твоє замовлення на 10 сек)
    on: {
        touchStart: function() {
            this.autoplay.stop(); // Зупинити, коли користувач торкнувся
        },
        navigationNext: function() {
            this.autoplay.stop(); // Зупинити при натисканні стрілки
            resetAutoplay(this);
        },
        navigationPrev: function() {
            this.autoplay.stop(); // Зупинити при натисканні стрілки
            resetAutoplay(this);
        },
        click: function() {
            this.autoplay.stop(); // Зупинити при кліку на слайд
            resetAutoplay(this);
        }
    }
});

// Функція для відновлення через 10 секунд
function resetAutoplay(instance) {
    clearTimeout(instance.resumeTimer); 
    instance.resumeTimer = setTimeout(() => {
        instance.autoplay.start();
    }, 10000); // 10 секунд паузи
}
    } catch (error) {
        console.error("Помилка завантаження даних:", error);
    }
}

document.addEventListener('DOMContentLoaded', initCarousel);
