document.addEventListener("DOMContentLoaded", function() {
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // Заміна старого банера на картинку з кнопками
        const newBanner = document.createElement('div');
        newBanner.className = 'cheruta-banner-container';
        newBanner.style.cssText = `
            position: relative; width: 100%; max-width: 900px; margin: 30px auto; 
            border-radius: 15px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.3); line-height: 0;
        `;

        newBanner.innerHTML = `
            <img src="cheruta.jpg" alt="Червона Рута 2026" style="width: 100%; height: auto; display: block;">
            <div style="position: absolute; bottom: 15px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 20px; gap: 15px;">
                <a href="URL_ПОЛОЖЕННЯ" target="_blank" class="cheruta-btn btn-left">ЧИТАТИ ПОЛОЖЕННЯ</a>
                <button id="openFormBtn" class="cheruta-btn btn-right">ПОДАТИ ЗАЯВКУ</button>
            </div>
            <style>
                .cheruta-btn { flex: 1; padding: 12px 10px; text-align: center; text-decoration: none; font-family: 'Arial', sans-serif; font-size: 14px; font-weight: bold; border-radius: 8px; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; text-transform: uppercase; cursor: pointer; border: none; }
                .btn-left { background-color: rgba(255, 255, 255, 0.15); color: #ffffff; border: 2px solid #ffffff !important; backdrop-filter: blur(5px); }
                .btn-right { background-color: #ff4500; color: white; border: 2px solid #ff4500 !important; }
                @media (max-width: 480px) { .cheruta-btn { font-size: 10px; } }
            </style>
        `;
        aboutSection.parentNode.replaceChild(newBanner, aboutSection);

        // Створення модального вікна з офіційною анкетою
        const modal = document.createElement('div');
        modal.id = 'rutaModal';
        modal.style.cssText = `display: none; position: fixed; z-index: 99999; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); overflow-y: auto; padding: 20px; box-sizing: border-box;`;

        modal.innerHTML = `
            <div style="background: #fff; margin: 10px auto; padding: 30px; border-radius: 8px; max-width: 800px; position: relative; font-family: Arial, sans-serif; color: #333; font-size: 14px; line-height: 1.4;">
                <span id="closeModal" style="position: absolute; right: 20px; top: 10px; font-size: 30px; cursor: pointer;">&times;</span>
                <h2 style="text-align: center; color: #0056b3; margin-bottom: 5px; text-transform: uppercase;">Анкета учасника</h2>
                <h3 style="text-align: center; margin-top: 0; font-size: 16px;">ОБЛАСНОГО ВІДБІРКОВОГО КОНКУРСУ - 2026</h3>
                <p style="color: red; text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 20px;">! ! ! УСІ ПОЛЯ АНКЕТИ Є ОБОВ’ЯЗКОВИМИ ДЛЯ ЗАПОВНЕННЯ ! ! !</p>

                <form id="rutaEntryForm" style="display: grid; gap: 15px;">
                    <div>
                        <label><b>01. Жанр музики:</b></label>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px;">
                            ${['фольклор', 'поп-музика', 'танцювальна', 'акустична', 'рок-музика', 'інша музика'].map(g => `<label><input type="radio" name="genre" value="${g}" required> ${g}</label>`).join('')}
                        </div>
                    </div>

                    <label><b>02. Область, яку представляєте:</b><input type="text" name="region" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <label><b>03. Учасник відбіркового конкурсу (ПІБ соліста / назва гурту):</b><input type="text" name="participant" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <label><b>04. Володіння інструментами (соліст) / склад гурту (ПІБ – інструмент):</b><textarea name="instruments" required style="width:100%; height:60px; border:1px solid #999;"></textarea></label>
                    
                    <label><b>05. Контакти соліста / учасників (адреса, мобільний, email):</b><textarea name="contacts_main" required style="width:100%; height:60px; border:1px solid #999;"></textarea></label>
                    
                    <label><b>06. Контакти керівника (ПІБ, мобільний, email):</b><input type="text" name="manager_contacts" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <label><b>07. Дата народження виконавця(ів):</b><input type="text" name="birth_dates" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <label><b>08. Фах, місце роботи / навчання:</b><textarea name="occupation" required style="width:100%; height:50px; border:1px solid #999;"></textarea></label>
                    
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <label style="flex:1; min-width: 200px;"><b>09. Національність:</b><input type="text" name="nationality" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                        <label style="flex:1; min-width: 200px;"><b>Мова спілкування:</b><input type="text" name="language" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    </div>

                    <fieldset style="border:1px solid #ccc; padding:15px; border-radius: 5px;">
                        <legend><b>10. Конкурсний репертуар (назва / хронометраж / автори):</b></legend>
                        <label style="display:block; margin-bottom:10px;">1 пісня: <input type="text" name="song1" required style="width:100%; border:1px solid #999; padding:5px;"></label>
                        <label style="display:block; margin-bottom:10px;">2 пісня: <input type="text" name="song2" required style="width:100%; border:1px solid #999; padding:5px;"></label>
                        <label style="display:block;">3 пісня: <input type="text" name="song3" required style="width:100%; border:1px solid #999; padding:5px;"></label>
                    </fieldset>

                    <label><b>11. Студія звукозапису / місце репетицій (адреса, тел.):</b><input type="text" name="studio" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <label><b>12. Участь у фестивалях / конкурсах (три заходи та призові місця):</b><textarea name="past_festivals" required style="width:100%; height:60px; border:1px solid #999;"></textarea></label>

                    <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center; background: #f9f9f9; padding: 10px; border-radius: 5px;">
                        <b>13. Репертуар укр. мовою:</b>
                        <span>К-сть пісень: <input type="text" name="ua_songs_count" style="width:40px; border:1px solid #999;"></span>
                        <span>Час звучання: <input type="text" name="total_time" style="width:60px; border:1px solid #999;"></span>
                        <span>Авторських: <input type="text" name="original_songs" style="width:40px; border:1px solid #999;"></span>
                    </div>

                    <label><b>14. Улюблені музиканти (3 укр. / 3 закордонні):</b><input type="text" name="favorite_artists" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <label><b>15. Ваші очікування від фестивалю:</b><input type="text" name="expectations" required style="width:100%; padding:8px; border:1px solid #999;"></label>
                    
                    <div>
                        <label><b>16. Звідки Ви дізналися про конкурс?</b></label>
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px;">
                            ${['зовнішня реклама', 'регіональна преса', 'телебачення', 'fm-радіо', 'інтернет', 'знайомі'].map(s => `<label><input type="checkbox" name="source" value="${s}"> ${s}</label>`).join('')}
                        </div>
                    </div>

                    <button type="submit" id="submitBtn" style="width: 100%; padding: 18px; background: #ff4500; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px; margin-top: 10px;">ВІДПРАВИТИ ОФІЦІЙНУ ЗАЯВКУ</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Логіка кнопок модального вікна
        document.getElementById('openFormBtn').onclick = () => { modal.style.display = 'block'; document.body.style.overflow = 'hidden'; };
        document.getElementById('closeModal').onclick = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; };
        
        // Відправка в n8n
        document.getElementById('rutaEntryForm').onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
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
                    alert('Дякуємо! Ваша офіційна заявка прийнята.'); 
                    modal.style.display = 'none'; 
                    document.body.style.overflow = 'auto';
                    e.target.reset(); 
                }
            } catch (err) { alert('Помилка відправки. Перевірте з’єднання.'); }
            finally { btn.innerText = 'ВІДПРАВИТИ ОФІЦІЙНУ ЗАЯВКУ'; btn.disabled = false; }
        };
    }
});
