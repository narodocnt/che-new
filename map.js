/**
 * map.js
 * Основна логіка мапи
 */
// Створюємо глобальну змінну map, щоб інші файли її бачили
const map = L.map('map').setView([49.2, 31.5], 8);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function style(feature) {
    return {
        fillColor: '#3498db',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6
    };
}

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.8
    });
    layer.bringToFront();
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function (e) {
            const hromadaName = feature.properties.name.trim().toLowerCase();
            const collectives = collectivesList[hromadaName];
            
            let popupContent = `<div style="min-width: 250px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
                    ${feature.properties.name}
                </h3>`;

            if (collectives && collectives.length > 0) {
                popupContent += `
                    <div style="margin-bottom: 10px; font-weight: bold; color: #e67e22;">
                        Звання «народний (зразковий)»: ${collectives.length}
                    </div>
                    <div style="max-height: 250px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
                        <ul style="list-style-type: none; padding: 0; margin: 0;">`;
                
                collectives.forEach(item => {
                    popupContent += `<li style="margin-bottom: 8px; font-size: 13px; line-height: 1.4; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                        ${item}
                    </li>`;
                });
                popupContent += `</ul></div>`;
            } else {
                popupContent += `<p style="color: #7f8c8d; font-style: italic;">Дані оновлюються...</p>`;
            }
            popupContent += `</div>`;
            layer.bindPopup(popupContent).openPopup();
        }
    });
}

const geojson = L.geoJson(hromadasData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);
