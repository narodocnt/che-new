/**
 * bitva-rule-star.js - Логіка зірочки з правилами
 */
window.toggleRules = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    var box = document.getElementById('rating-rules-popup');
    if (!box) {
        box = document.createElement('div');
        box.id = 'rating-rules-popup';
        box.style.cssText = "position:absolute; background:#fff; border:2px solid #f1c40f; padding:15px; border-radius:10px; box-shadow:0 10px 25px rgba(0,0,0,0.2); z-index:9999; width:220px; font-size:14px; color:#333; display:none; pointer-events: auto;";
        box.innerHTML = 
            '<div style="font-weight: bold; color: #e67e22; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">' +
                '📏 Правила рейтингу' +
            '</div>' +
            '<div style="display: flex; flex-direction: column; gap: 5px;">' +
                '<div>👍 Лайк — <b>1 бал</b></div>' +
                '<div>💬 Коментар — <b>1 бал</b></div>' +
                '<div>🔄 Репост — <b>1 бал</b></div>' +
            '</div>';
        document.body.appendChild(box);
    }

    var isVisible = box.style.display === 'block';
    
    if (isVisible) {
        box.style.display = 'none';
    } else {
        box.style.display = 'block';
        if (e) {
            box.style.left = (e.pageX + 10) + 'px';
            box.style.top = (e.pageY + 10) + 'px';
        }
    }

    // Закриття при кліку в будь-якому іншому місці
    var closeRules = function() {
        box.style.display = 'none';
        document.removeEventListener('click', closeRules);
    };
    
    if (!isVisible) {
        setTimeout(function() {
            document.addEventListener('click', closeRules);
        }, 10);
    }
};
