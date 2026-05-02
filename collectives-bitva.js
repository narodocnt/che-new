/**
 * collectives-bitva.js - Офіційний реєстр учасників (ОНОВЛЕНО: Локальні фото)
 */

window.collectivesDatabase = {
    "10": {
        "key": "smila",
        "name": "Духовий оркестр «Божидар»",
        "institution": "Смілянська ДМШ №2",
        "leader": "Владислав Сірий",
        "location": "Смілянська",
        // Пряме посилання на ваш репозиторій
        "media": "https://narodocnt.online/img/bitva/bogidar.jpg"
    },
    "14": {
        "key": "zveny",
        "name": "Оркестр духових інструментів",
        "institution": "Звенигородський Центр культури і дозвілля ім. Т. Шевченка",
        "leader": "Володимир Дзеціна",
        "location": "Звенигородська",
        "media": "https://narodocnt.online/img/bitva/zvenigorodka.jpg"
    },
    "11": {
        "key": "kamyanka",
        "name": "Духовий ансамбль",
        "institution": "Будинок культури Кам’янської громади",
        "leader": "Володимир Кравець",
        "location": "Кам’янська",
        "media": "https://narodocnt.online/img/bitva/kamjanka.jpg"
    },
    "20": {
        "key": "talne",
        "name": "Народний аматорський духовий оркестр «Сурми Тальнівщини»",
        "institution": "Центр культурних послуг Тальнівської міської ради",
        "leader": "Володимир Таран",
        "location": "Тальнівська",
        "media": "https://narodocnt.online/img/bitva/taljne.jpg"
    },
    "17": {
        "key": "hrist",
        "name": "Духовий оркестр",
        "institution": "Великосевастянівський БК (Христинівська громада)",
        "leader": "Віталій Сверблик",
        "location": "Христинівська",
        "media": "https://narodocnt.online/img/bitva/velikosevastjyanivka.jpg"
    },
    "12": {
        "key": "vodogray",
        "name": "Народний аматорський естрадно-духовий ансамбль «Водограй»",
        "institution": "Великоканівецький СБК",
        "leader": "Павло Лещенко",
        "location": "Чорнобаївська",
        "media": "https://narodocnt.online/img/bitva/vodogray.jpg"
    }
};

/**
 * Допоміжна функція для отримання медіафайлу за ID колективу
 * Використовуйте її в основному скрипті рейтингу
 */
function getBitvaPhotoById(id) {
    const db = window.collectivesDatabase;
    if (db[id] && db[id].media) {
        return db[id].media;
    }
    // Якщо ID не знайдено, повертаємо загальну картинку
    return "https://narodocnt.online/img/bitva/bitva-general.jpg";
}
