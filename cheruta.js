document.addEventListener("DOMContentLoaded", function() {
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // 1. СТВОРЮЄМО БАНЕР З КВІТКАМИ-КНОПКАМИ
        const newBanner = document.createElement('div');
        newBanner.style.cssText = `
            position: relative; width: 100%; max-width: 900px; margin: 30px auto; 
            border-radius: 15px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            background: #000; line-height: 0;
        `;

        newBanner.innerHTML = `
            <img src="cheruta.jpg" alt="Червона Рута" style="width: 100%; height: auto; display: block;">

            <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 120px; pointer-events: none;">
                <div style="position: absolute; left: 20px; bottom: 15px; pointer-events: auto; display: flex; flex-direction: column; align-items: center;">
                    <div class="ruta-hint">ЧИТАТИ ПОЛОЖЕННЯ <br> <span style="font-size: 20px;">↘</span></div>
                    <a href="ruta-2026_polozhennia.pdf" target="_blank" class="flower-btn">
                        <div class="flower-icon"></div>
                    </a>
                </div>

                <div style="position: absolute; right: 20px; bottom: 15px; pointer-events: auto; display: flex; flex-direction: column; align-items: center;">
                    <div class="ruta-hint">ПОДАТИ ЗАЯВКУ <br> <span style="font-size: 20px;">↙</span></div>
                    <button id="openRutaFormBtn" class="flower-btn">
                        <div class="flower-icon"></div>
                    </button>
                </div>
            </div>

            <style>
                .ruta-hint { color: white; font-family: 'Arial Black', sans-serif; font-size: 11px; text-align: center; margin-bottom: 5px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1.1; }
                .flower-btn { background: none; border: none; cursor: pointer; padding: 0; transition: transform 0.3s ease; width: 65px; height: 65px; display: flex; align-items: center; justify-content: center; text-decoration: none; }
                .flower-btn:hover { transform: scale(1.1) rotate(10deg); }
                .flower-icon { position: relative; width: 40px; height: 40px; background: #ffcc00; border-radius: 50%; }
                .flower-icon::before { content: '✿'; font-size: 80px; color: #d32f2f; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -51%); line-height: 1; z-index: -1; }
                @media (max-width: 480px) { .flower-btn { width: 50px; height: 50px; } .flower-icon::before { font-size: 60px; } .ruta-hint { font-size: 9px; } }
            </style>
        `;

        aboutSection.parentNode.replaceChild(newBanner, aboutSection);

        // 2. СТВОРЮЄМО ОФІЦІЙНУ АНКЕТУ (ВСІ 16 ПУНКТІВ)
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
                    <button type="submit" id="submitRutaBtn" style="width: 100%; padding: 15px; background: #ff4500; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top:10px;">ВІДПРАВИТИ ЗАЯВКУ</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // 3. ЛОГІКА КНОПОК ТА ВІДПРАВКИ
        document.getElementById('openRutaFormBtn').onclick = () => { modal.style.display = 'block'; document.body.style.overflow = 'hidden'; };
        document.getElementById('closeRutaModal').onclick = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; };

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
                if (response.ok) { 
                    alert('Заявка на Руту відправлена успішно!'); 
                    modal.style.display = 'none'; 
                    e.target.reset(); 
                }
            } catch (err) { alert('Помилка сервера n8n'); }
            finally { 
                btn.innerText = 'ВІДПРАВИТИ ЗАЯВКУ'; 
                btn.disabled = false; 
                document.body.style.overflow = 'auto'; 
            }
        };
    }
});
