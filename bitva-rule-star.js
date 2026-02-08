var toggleRules = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    var box = document.getElementById('rating-rules-popup');
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = "position:absolute; background:#fff; border:2px solid #f1c40f; padding:15px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.2); z-index:10000; width:240px; font-size:14px; color:#333; display:none; line-height:1.5;";
        box.innerHTML = '<div style="font-weight:bold; color:#e67e22; border-bottom:1px solid #eee; margin-bottom:8px; padding-bottom:5px;">📏 Правила рейтингу</div>' +
                        '👍 Лайк — <b>1 бал</b><br>' +
                        '💬 Коментар — <b>1 бал</b><br>' +
                        '🔄 Репост — <b>1 бал</b><br>' +
                        '<p style="font-size:11px; color:#888; margin-top:8px;">* Рейтинг оновлюється двічі на добу з Facebook*</p>';
        document.body.appendChild(box);
    }

    var isVisible = box.style.display === 'block';
    if (isVisible) {
        box.style.display = 'none';
    } else {
        box.style.display = 'block';
        if (e) {
            // Розумне позиціонування біля курсора
            var x = e.pageX + 15;
            var y = e.pageY + 15;
            // Перевірка, щоб не вилізло за правий край екрана
            if (x + 250 > window.innerWidth) x = window.innerWidth - 260;
            box.style.left = x + 'px';
            box.style.top = y + 'px';
        }
    }

    var close = function() { box.style.display = 'none'; document.removeEventListener('click', close); };
    if (!isVisible) setTimeout(function() { document.addEventListener('click', close); }, 10);
};
// Робимо функцію глобальною
window.toggleRules = toggleRules;
