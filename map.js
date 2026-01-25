const map = L.map('map').setView([49.2, 31.5], 8);
let currentMode = 'collectives'; // Початковий режим


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);



// Функція зміни режиму

function setMode(mode) {

    currentMode = mode;

    document.getElementById('btn-collectives').className = mode === 'collectives' ? 'map-btn active-btn' : 'map-btn inactive-btn';

    document.getElementById('btn-battle').className = mode === 'battle' ? 'map-btn active-btn' : 'map-btn inactive-btn';

    

    // Закриваємо всі попапи при зміні режиму

    map.closePopup();

}



function onEachFeature(feature, layer) {

    // Якщо у вас були точки (Center of hromada), Leaflet може автоматично ставити маркер

    layer.on('click', function (e) {

        const name = feature.properties.name.trim().toLowerCase();

        let content = `<h3>${feature.properties.name}</h3>`;



        if (currentMode === 'collectives') {

            const list = collectivesList[name] || [];

            content += `<b>Колективів: ${list.length}</b><hr>`;

            content += `<div style="max-height:200px; overflow-y:auto;">${list.join('<br>')}</div>`;

        } else {

            // Режим битви (приклад даних, можна підключити ratings.json)

            content += `<div style="text-align:center;">

                <p>🏆 Позиція в рейтингу: <b>№1</b></p>

                <p>❤️ Вподобайок: <b>1240</b></p>

                <button style="padding:5px 10px; background:#e74c3c; color:white; border:none; border-radius:5px;">Голосувати</button>

            </div>`;

        }

        

        layer.bindPopup(content).openPopup();

    });



    // Підсвічування при наведенні

    layer.on('mouseover', () => layer.setStyle({ fillOpacity: 0.8, weight: 3 }));

    layer.on('mouseout', () => layer.setStyle({ fillOpacity: 0.6, weight: 2 }));

}



const geojson = L.geoJson(hromadasData, {

    style: { fillColor: '#3498db', weight: 2, color: 'white', fillOpacity: 0.6 },

    onEachFeature: onEachFeature

}).addTo(map);
