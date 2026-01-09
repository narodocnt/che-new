/**
 * cheruta.js - Фінальна версія: Кнопки по кутах + Таймер + Перевірка авторизації
 */

function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    // Видаляємо старий інтерфейс, якщо він був
    const oldUI = document.getElementById('ruta-ui-layer');
    if (oldUI) oldUI.remove();

    const uiHtml = `
    <div id="ruta-ui-layer" style="
        position: absolute; bottom: 0; left: 0; width: 100%;
        background: linear-gradient(to top, rgba(0,0,0,0.95) 40%, transparent);
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 12px; box-sizing: border-box; z-index: 999;
    ">
        <div style="flex: 1; display: flex; justify-content: flex-start;">
            <button onclick="window.open('https://narodocnt.online/polozhennya.pdf', '_blank')" 
                style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 7px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap; text-transform: uppercase;">
                ПОЛОЖЕННЯ
            </button>
        </div>

        <div id="ruta-timer-display" style="display: flex; gap: 6px; color: #f1c40f; text-align: center; flex: 1; justify-content: center; font-family: sans-serif;">
            <div style="line-height:1"><b id="d-val" style="display:block; font-size:17px;">00</b><small style="font-size:7px; color:white; text-transform:uppercase;">дн</small></div>
            <div style="line-height:1"><b id="h-val" style="display:block; font-size:17px;">00</b><small style="font-size:7px; color:white; text-transform:uppercase;">год</small></div>
            <div style="line-height:1"><b id="m-val" style="display:block; font-size:17px;">00</b><small style="font-size:7px; color:white; text-transform:uppercase;">хв</small></div>
            <div style="line-height:1"><b id="s-val" style="display:block; font-size:17px;">00</b><small style="font-size:7px; color:white; text-transform:uppercase;">сек</small></div>
        </div>

        <div style="flex: 1; display: flex; justify-content: flex-end;">
            <button onclick="goToGeneralForm()" 
                style="background: #ff4500; border: none; color: white; padding: 7px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap; text-transform: uppercase; box-shadow: 0 0 10px rgba(255,69,0,0.3);">
                ЗАЯВКА
            </button>
        </div>
    </div>
    `;

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    // Логіка таймера
    const target = new Date("March 21, 2026 09:00:00").getTime();

    const update = () => {
        const now = new Date().getTime();
        const diff = target - now;

        if (diff < 0) {
            const timerBox = document.getElementById("ruta-timer-display");
            if (timerBox) timerBox.innerHTML = "<b style='font-size:10px; color:white;'>РОЗПОЧАТО!</b>";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const dEl = document.getElementById("d-val");
        const hEl = document.getElementById("h-val");
        const mEl = document.getElementById("m-val");
        const sEl = document.getElementById("s-val");

        if (dEl) dEl.innerText = d.toString().padStart(2, '0');
        if (hEl) hEl.innerText = h.toString().padStart(2, '0');
        if (mEl) mEl.innerText = m.toString().padStart(2, '0');
        if (sEl) sEl.innerText = s.toString().padStart(2, '0');
    };

    setInterval(update, 1000);
    update();
} // <-- ТУТ БУЛА ПОМИЛКА (закриття функції initRutaUI)

/**
/**
 * Функція обробки натискання на кнопку ЗАЯВКА з перевіркою авторизації
 */
function goToGeneralForm() {
    // 1. Спроба отримати користувача (з localStorage або глобальної змінної вашого сайту)
    const userJson = localStorage.getItem('user');
    let user = null;

    try {
        if (userJson) user = JSON.parse(userJson);
        else if (window.currentUser) user = window.currentUser;
    } catch (e) {
        console.error("Помилка парсингу даних користувача", e);
    }

    // 2. Якщо користувача не знайдено — показуємо попередження
    if (!user) {
        alert("🔒 Авторизуйтесь, будь ласка!\n\nЩоб подати заявку на 'Червону руту', потрібно увійти через Google на нашому сайті.");
        
        const loginBtn = document.querySelector('.login-btn') || document.querySelector('#auth-button') || document.querySelector('.auth-trigger');
        if (loginBtn) {
            loginBtn.click();
        }
        return;
    }

    // 3. Якщо авторизований — готуємо посилання
    // Використовуємо саме те посилання, яке у вас працює в браузері
    const userName = encodeURIComponent(user.displayName || user.name || "Учасник");
    const n8nFormUrl = `https://n8n.narodocnt.online/webhook/cheruta/n8n-form?name=${userName}`;

    // 4. Відкриваємо форму
    window.open(n8nFormUrl, '_blank');
}
