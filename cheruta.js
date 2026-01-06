document.addEventListener("DOMContentLoaded", function() {
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // 1. Створюємо банер (тільки для Червоної Рути)
        const newBanner = document.createElement('div');
        newBanner.className = 'cheruta-banner-container';
        newBanner.style.cssText = `
            position: relative; width: 100%; max-width: 900px; margin: 30px auto; 
            border-radius: 15px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.3); line-height: 0;
        `;

        newBanner.innerHTML = `
            <img src="cheruta.jpg" alt="Червона Рута 2026" style="width: 100%; height: auto; display: block;">
            <div style="position: absolute; bottom: 15px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 20px; gap: 15px;">
                <a href="ruta-2026_polozhennia.pdf" target="_blank" class="cheruta-btn btn-left">ЧИТАТИ ПОЛОЖЕННЯ</a>
                <button id="openRutaFormBtn" class="cheruta-btn btn-right">ПОДАТИ ЗАЯВКУ</button>
            </div>
            <style>
                .cheruta-btn { flex: 1; padding: 12px 10px; text-align: center; text-decoration: none; font-family: 'Arial', sans-serif; font-size: 14px; font-weight: bold; border-radius: 8px; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; text-transform: uppercase; cursor: pointer; border: none; }
                .btn-left { background-color: rgba(255, 255, 255, 0.15); color: #ffffff; border: 2px solid #ffffff !important; backdrop-filter: blur(5px); }
                .btn-right { background-color: #ff4500; color: white; border: 2px solid #ff4500 !important; }
                @media (max-width: 480px) { .cheruta-btn { font-size: 10px; } }
            </style>
        `;
        aboutSection.parentNode.replaceChild(newBanner, aboutSection);

        // 2. Створюємо модальне вікно (тільки для Червоної Рути)
        const modal = document.createElement('div');
        modal.id = 'rutaModal';
        modal.style.cssText = `display: none; position: fixed; z-index: 99999; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); overflow-y: auto; padding: 20px; box-sizing: border-box;`;

        modal.innerHTML = `
            <div style="background: #fff; margin: 10px auto; padding: 30px; border-radius: 8px; max-width: 800px; position: relative; font-family: Arial, sans-serif; color: #333; font-size: 14px;">
                <span id="closeRutaModal" style="position: absolute; right: 20px; top: 10px; font-size: 30px; cursor: pointer;">&times;</span>
                <h2 style="text-align: center; color: #0056b3; text-transform: uppercase;">Анкета учасника</h2>
                <h3 style="text-align: center; font-size: 16px;">ОБЛАСНОГО ВІДБІРКОВОГО КОНКУРСУ - 2026</h3>
                
                <form id="rutaEntryForm" style="display: grid; gap: 15px; margin-top:20px;">
                    <div>
                        <label><b>01. Жанр музики:</b></label>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px;">
                            ${['фольклор', 'поп-музика', 'танцювальна', 'акустична', 'рок-музика', 'інша музика'].map(g => `<label><input type="radio" name="genre" value="${g}" required> ${g}</label>`).join('')}
                        </div>
                    </div>
                    <label><b>02. Область:</b><input type="text" name="region" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <label><b>03. ПІБ / Назва гурту:</b><input type="text" name="participant" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <label><b>04. Інструменти / Склад:</b><textarea name="instruments" required style="width:100%; height:50px; border:1px solid #999;"></textarea></label>
                    <label><b>05. Контакти (адреса, тел, email):</b><textarea name="contacts_main" required style="width:100%; height:50px; border:1px solid #999;"></textarea></label>
                    <label><b>06. Керівник (ПІБ, тел):</b><input type="text" name="manager_contacts" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <label><b>07. Дати народження:</b><input type="text" name="birth_dates" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <label><b>08. Фах / Місце навчання:</b><textarea name="occupation" required style="width:100%; height:50px; border:1px solid #999;"></textarea></label>
                    <div style="display: flex; gap: 10px;"><label style="flex:1;"><b>09. Національність:</b><input type="text" name="nationality" required style="width:100%; padding:8px; border:1px solid #999;"></label><label style="flex:1;"><b>Мова:</b><input type="text" name="language" required style="width:100%; padding:8px; border:1px solid #999;"></label></div>
                    <fieldset style="border:1px solid #ccc; padding:10px;"><legend><b>10. Репертуар:</b></legend>
                        1: <input type="text" name="song1" required style="width:90%; margin-bottom:5px;"><br>
                        2: <input type="text" name="song2" required style="width:90%; margin-bottom:5px;"><br>
                        3: <input type="text" name="song3" required style="width:90%;">
                    </fieldset>
                    <label><b>11. Студія:</b><input type="text" name="studio" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <label><b>12. Фестивалі (три):</b><textarea name="past_festivals" required style="width:100%; height:50px; border:1px solid #999;"></textarea></label>
                    <div style="background:#f0f0f0; padding:10px;"><b>13. Укр. репертуар:</b> К-сть: <input type="text" name="ua_songs_count" style="width:30px;"> Час: <input type="text" name="total_time" style="width:50px;"> Авторських: <input type="text" name="original_songs" style="width:30px;"></div>
                    <label><b>14. Улюблені музиканти:</b><input type="text" name="favorite_artists" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <label><b>15. Очікування:</b><input type="text" name="expectations" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    <div><b>16. Звідки дізналися?</b><br>${['реклама', 'преса', 'ТБ', 'радіо', 'інтернет', 'знайомі'].map(s => `<label><input type="checkbox" name="source" value="${s}"> ${s}</label>`).join(' ')}</div>
                    <button type="submit" id="submitRutaBtn" style="width: 100%; padding: 15px; background: #ff4500; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">ВІДПРАВИТИ В n8n</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Кнопка на банері відкриває форму Рути
        document.getElementById('openRutaFormBtn').onclick = () => { modal.style.display = 'block'; document.body.style.overflow = 'hidden'; };
        document.getElementById('closeRutaModal').onclick = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; };

        // Відправка форми "Рути" в n8n [cite: 5, 6]
        document.getElementById('rutaEntryForm').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitRutaBtn');
            btn.innerText = 'ВІДПРАВКА...'; btn.disabled = true;
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            data.source = formData.getAll('source').join(', ');

            try {
                const response = await fetch('https://n8n.narodocnt.online/webhook/ruta-zayavka', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) { alert('Заявка на Руту відправлена в Таблицю!'); modal.style.display = 'none'; e.target.reset(); }
            } catch (err) { alert('Помилка n8n'); }
            finally { btn.innerText = 'ВІДПРАВИТИ В n8n'; btn.disabled = false; document.body.style.overflow = 'auto'; }
        };
    }
});

// Кнопка у верхньому меню (ПОДАТИ ЗАЯВКУ) залишається для Телеграму
function goToForm() {
    // Тут ваша стара логіка для Телеграму, яку ми не чіпаємо
    window.open('ПОСИЛАННЯ_НА_ВАШ_ТЕЛЕГРАМ_БОТ_АБО_ФОРМУ', '_blank');
}
