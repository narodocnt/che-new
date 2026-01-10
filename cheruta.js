/**
 * cheruta.js - Версія з таймером БЕЗ тексту підписів
 */

function initRutaUI() {
    const banner = document.querySelector('.ruta-container');
    if (!banner) return;

    const oldUI = document.getElementById('ruta-ui-layer');
    if (oldUI) oldUI.remove();

    const uiHtml = `
    <div id="ruta-ui-layer" style="
        position: absolute; 
        bottom: 0; 
        left: 0; 
        width: 100%;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
        display: flex; 
        align-items: center; 
        justify-content: space-between;
        padding: 5px 12px; 
        box-sizing: border-box; 
        z-index: 999;
    ">
        <div style="flex: 1; display: flex; justify-content: flex-start;">
            <button onclick="window.open('https://narodocnt.online/polozhennya.pdf', '_blank')" 
                style="background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 6px 10px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap; text-transform: uppercase;">
                ПОЛОЖЕННЯ
            </button>
        </div>

        <div id="ruta-timer-display" style="display: flex; gap: 4px; color: #f1c40f; text-align: center; flex: 1; justify-content: center; font-family: monospace; font-size: 18px; font-weight: bold; text-shadow: 1px 1px 2px black;">
            <span id="d-val">00</span>:
            <span id="h-val">00</span>:
            <span id="m-val">00</span>:
            <span id="s-val">00</span>
        </div>

        <div style="flex: 1; display: flex; justify-content: flex-end;">
            <button onclick="goToGeneralForm('cheruta')" 
                style="background: #ff4500; border: none; color: white; padding: 7px 12px; border-radius: 6px; font-size: 10px; font-weight: bold; cursor: pointer; white-space: nowrap; text-transform: uppercase; box-shadow: 0 0 10px rgba(255,69,0,0.3);">
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
            if (timerBox) timerBox.innerHTML = "<b style='font-size:12px; color:white;'>РОЗПОЧАТО</b>";
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
}

/**
 * Функція для відкриття форм
 */
function goToGeneralForm(type = 'main') {
    const user = localStorage.getItem('user');

    if (!user) {
        alert("🔒 Авторизуйтесь, будь ласка, через Google!");
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.click();
        return;
    }

    const userName = encodeURIComponent(user);
    const n8nUrl = `https://n8n.narodocnt.online/webhook/cheruta/n8n-form?name=${userName}`;
    window.open(n8nUrl, '_blank');
}

// Запуск
if (document.readyState === 'loading') {
    window.addEventListener('load', initRutaUI);
} else {
    initRutaUI();
}
