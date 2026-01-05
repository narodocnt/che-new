document.addEventListener("DOMContentLoaded", function() {
    // 1. Шукаємо конкретний блок за ID "about", який ми видаляємо
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // Створюємо новий контейнер для картинки та кнопок
        const newBanner = document.createElement('div');
        newBanner.className = 'cheruta-banner-container';
        newBanner.style.cssText = `
            position: relative;
            width: 100%;
            max-width: 800px;
            margin: 30px auto;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            line-height: 0;
        `;

        // Вставляємо картинку та кнопки
        newBanner.innerHTML = `
            <img src="cheruta.jpg" alt="Червона Рута 2026" style="width: 100%; height: auto; display: block;">
            
            <div style="
                position: absolute; 
                bottom: 15px; 
                left: 0; 
                right: 0; 
                display: flex; 
                justify-content: space-between; 
                padding: 0 20px;
                gap: 15px;
            ">
                <a href="ПОСИЛАННЯ_НА_ПОЛОЖЕННЯ" target="_blank" class="cheruta-btn btn-left">
                    ЧИТАТИ ПОЛОЖЕННЯ
                </a>

                <a href="ПОСИЛАННЯ_НА_ЗАЯВКУ" target="_blank" class="cheruta-btn btn-right">
                    ПОДАТИ ЗАЯВКУ
                </a>
            </div>

            <style>
                .cheruta-btn {
                    flex: 1;
                    padding: 12px 10px;
                    text-align: center;
                    text-decoration: none;
                    font-family: 'Arial', sans-serif;
                    font-size: 14px;
                    font-weight: bold;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    line-height: 1.2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-transform: uppercase;
                }
                .btn-left {
                    background-color: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                    border: 2px solid #ffffff;
                    backdrop-filter: blur(5px);
                }
                .btn-left:hover {
                    background-color: #ffffff;
                    color: #000000;
                }
                .btn-right {
                    background-color: #ff4500; /* Помаранчевий під колір "Рути" */
                    color: white;
                    border: 2px solid #ff4500;
                }
                .btn-right:hover {
                    background-color: #e63e00;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 69, 0, 0.5);
                }
                /* Адаптація для мобільних */
                @media (max-width: 480px) {
                    .cheruta-btn { font-size: 10px; padding: 8px 5px; }
                    .cheruta-banner-container { margin: 15px auto; }
                }
            </style>
        `;

        // Замінюємо старий блок новим
        aboutSection.parentNode.replaceChild(newBanner, aboutSection);
    }

    document.addEventListener("DOMContentLoaded", function() {
    const aboutSection = document.getElementById('about');

    if (aboutSection) {
        // Створюємо банер (ваша картинка + кнопки)
        const newBanner = document.createElement('div');
        newBanner.style.cssText = 'position: relative; width: 100%; max-width: 900px; margin: 20px auto; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);';

        newBanner.innerHTML = `
            <img src="cheruta.jpg" alt="Червона Рута 2026" style="width: 100%; display: block;">
            <div style="position: absolute; bottom: 20px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 30px; gap: 20px;">
                <a href="URL_ПОЛОЖЕННЯ" target="_blank" style="flex: 1; text-align: center; padding: 15px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 8px; text-decoration: none; font-weight: bold; backdrop-filter: blur(5px);">ЧИТАТИ ПОЛОЖЕННЯ</a>
                <button id="openFormBtn" style="flex: 1; text-align: center; padding: 15px; background: #ff4500; color: white; border: 2px solid #ff4500; border-radius: 8px; font-weight: bold; cursor: pointer; text-transform: uppercase;">ПОДАТИ ЗАЯВКУ</button>
            </div>
        `;

        aboutSection.parentNode.replaceChild(newBanner, aboutSection);

        // Створюємо модальне вікно з усіма полями анкети
        const modal = document.createElement('div');
        modal.id = 'rutaModal';
        modal.style.cssText = 'display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); overflow-y: auto; padding: 20px; box-sizing: border-box;';

        modal.innerHTML = `
            <div style="background: #fff; margin: auto; padding: 30px; border-radius: 12px; max-width: 600px; position: relative; font-family: Arial, sans-serif; color: #333;">
                <span id="closeModal" style="position: absolute; right: 20px; top: 15px; font-size: 28px; cursor: pointer;">&times;</span>
                <h2 style="text-align: center; color: #ff4500;">АНКЕТА УЧАСНИКА - 2026</h2>
                <p style="font-size: 12px; text-align: center; margin-bottom: 20px;">Усі поля є обов’язковими для заповнення</p>
                
                <form id="rutaEntryForm">
                    <label>01. Жанр музики:</label>
                    <select name="genre" required style="width: 100%; padding: 10px; margin: 10px 0 20px; border: 1px solid #ccc; border-radius: 4px;">
                        <option value="фольклор">Фольклор</option>
                        <option value="поп-музика">Поп-музика</option>
                        <option value="танцювальна">Танцювальна</option>
                        <option value="акустична">Акустична</option>
                        <option value="рок-музика">Рок-музика</option>
                        <option value="інша">Інша музика</option>
                    </select>

                    <label>03. Прізвище, ім’я соліста / Назва гурту:</label>
                    <input type="text" name="participant_name" required style="width: 100%; padding: 10px; margin: 10px 0 20px; border: 1px solid #ccc; border-radius: 4px;">

                    <label>04. Володіння інструментами (для соліста або склад гурту):</label>
                    <textarea name="instruments" required style="width: 100%; padding: 10px; margin: 10px 0 20px; border: 1px solid #ccc; border-radius: 4px; height: 60px;"></textarea>

                    <div style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label>05. Номер мобільного:</label>
                            <input type="tel" name="phone" placeholder="+380..." required style="width: 100%; padding: 10px; margin: 10px 0 20px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label>Email:</label>
                            <input type="email" name="email" required style="width: 100%; padding: 10px; margin: 10px 0 20px; border: 1px solid #ccc; border-radius: 4px;">
                        </div>
                    </div>

                    <label>10. Конкурсний репертуар (1, 2, 3 пісні - назва/автори):</label>
                    <textarea name="repertoire" required style="width: 100%; padding: 10px; margin: 10px 0 20px; border: 1px solid #ccc; border-radius: 4px; height: 80px;" placeholder="1 пісня: ... &#10;2 пісня: ..."></textarea>

                    <button type="submit" style="width: 100%; padding: 15px; background: #ff4500; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;">ВІДПРАВИТИ ЗАЯВКУ</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Обробка кнопок
        document.getElementById('openFormBtn').onclick = () => modal.style.display = 'block';
        document.getElementById('closeModal').onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

        // Відправка в n8n
        document.getElementById('rutaEntryForm').onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.innerText = 'ВІДПРАВКА...';
            btn.disabled = true;

            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('https://n8n.narodocnt.online/webhook/ruta-zayavka', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Дякуємо! Ваша заявка прийнята.');
                    modal.style.display = 'none';
                    e.target.reset();
                } else {
                    throw new Error();
                }
            } catch (err) {
                alert('Помилка відправки. Перевірте з’єднання з n8n.');
            } finally {
                btn.innerText = 'ВІДПРАВИТИ ЗАЯВКУ';
                btn.disabled = false;
            }
        };
    }
});
});
