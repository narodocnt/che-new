function initRutaUI() {
    // Встановлюємо дату: 21 березня 2026 року
    const target = new Date("March 21, 2026 09:00:00").getTime();

    const update = () => {
        const now = new Date().getTime();
        const diff = target - now;

        // Шукаємо елементи, які ми вже прописали в HTML
        const dEl = document.getElementById("d-val");
        const hEl = document.getElementById("h-val");
        const mEl = document.getElementById("m-val");
        const sEl = document.getElementById("s-val");

        if (diff < 0) {
            const display = document.getElementById("ruta-timer-display");
            if (display) display.innerHTML = "РОЗПОЧАТО";
            return;
        }

        // Розрахунок часу
        const d = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

        // Оновлюємо текст, якщо елементи існують
        if (dEl) dEl.innerText = d;
        if (hEl) hEl.innerText = h;
        if (mEl) mEl.innerText = m;
        if (sEl) sEl.innerText = s;
    };

    setInterval(update, 1000);
    update();
}

    banner.style.position = 'relative';
    banner.insertAdjacentHTML('beforeend', uiHtml);

    const target = new Date("March 21, 2026 09:00:00").getTime();
    const update = () => {
        const now = new Date().getTime();
        const diff = target - now;
        if (diff < 0) {
            if (document.getElementById("ruta-timer-display")) document.getElementById("ruta-timer-display").innerHTML = "РОЗПОЧАТО";
            return;
        }
        const d = Math.floor(diff / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

        if (document.getElementById("d-val")) document.getElementById("d-val").innerText = d;
        if (document.getElementById("h-val")) document.getElementById("h-val").innerText = h;
        if (document.getElementById("m-val")) document.getElementById("m-val").innerText = m;
        if (document.getElementById("s-val")) document.getElementById("s-val").innerText = s;
    };
    setInterval(update, 1000);
    update();
}

function goToGeneralForm(type = 'main') {
    const user = localStorage.getItem('user');

    if (!user) {
        alert("🔒 Авторизуйтесь, будь ласка!");
        if (typeof handleAuthClick === 'function') handleAuthClick();
        return;
    }

    const userName = encodeURIComponent(user);
    let url = "";

    if (type === 'cheruta') {
        // Посилання для банера "Червона Рута"
        url = `https://n8n.narodocnt.online/webhook/cheruta/n8n-form?name=${userName}`;
    } else {
        // Посилання для верхньої жовтої кнопки (Загальна заявка)
        url = `https://n8n.narodocnt.online/webhook/main-zajavka/n8n-form?name=${userName}`;
    }

    window.open(url, '_blank');
}

if (document.readyState === 'loading') window.addEventListener('load', initRutaUI);
else initRutaUI();
