// ========================================
// Configuration & Variables globales
// ========================================

const CONFIG = {
    mapCenter: [45.07, 5.82],
    mapZoom: 12,
    csvPath: 'data/victimes.csv',
    views: {
        'Basse Romanche': [[45.050, 5.770], [45.095, 5.860]],
        'Oisans élargi': [[45.030, 5.750], [45.145, 6.060]]
    }
};

let map;
let markers = [];
let allVictims = [];
let markerClusterGroup;
let currentFilters = {
    categories: ['executions', 'combats', 'civils'],
    communes: [],
    dateStart: '1944-08-01',
    dateEnd: '1944-08-31'
};

// ========================================
// Initialisation
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    loadData();
    initEventListeners();
});

// ========================================
// Initialisation de la carte
// ========================================

function initMap() {
    map = L.map('map', {
        center: CONFIG.mapCenter,
        zoom: CONFIG.mapZoom,
        zoomControl: true
    });

    // Couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);

    // Initialiser le cluster de marqueurs
    markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });
    map.addLayer(markerClusterGroup);

    // Bouton home personnalisé
    addHomeControl();
    
    // Sélecteur de vues
    addViewSelector();
}

// ========================================
// Contrôles personnalisés
// ========================================

function addHomeControl() {
    const HomeControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar');
            const button = L.DomUtil.create('a', '', container);
            button.href = '#';
            button.title = 'Recentrer';
            button.innerHTML = '⌂';
            button.style.fontWeight = '700';
            button.style.fontSize = '18px';
            button.style.lineHeight = '30px';
            button.style.width = '30px';
            button.style.height = '30px';
            button.style.textAlign = 'center';
            
            L.DomEvent.on(button, 'click', (e) => {
                L.DomEvent.stop(e);
                map.setView(CONFIG.mapCenter, CONFIG.mapZoom, { animate: true });
            });
            
            return container;
        }
    });
    
    new HomeControl().addTo(map);
}

function addViewSelector() {
    const ViewControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar');
            container.style.background = 'white';
            container.style.padding = '4px';
            
            const select = L.DomUtil.create('select', '', container);
            select.style.border = 'none';
            select.style.padding = '4px 8px';
            select.style.fontSize = '13px';
            select.title = 'Changer de vue';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Vues prédéfinies';
            select.appendChild(defaultOption);
            
            for (const [name, bounds] of Object.entries(CONFIG.views)) {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                select.appendChild(option);
            }
            
            L.DomEvent.on(select, 'change', function() {
                if (this.value && CONFIG.views[this.value]) {
                    map.fitBounds(CONFIG.views[this.value], { padding: [20, 20] });
                }
                this.value = '';
            });
            
            return container;
        }
    });
    
    new ViewControl().addTo(map);
}

// ========================================
// Chargement des données CSV
// ========================================

function loadData() {
    Papa.parse(CONFIG.csvPath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            allVictims = results.data;
            processData();
            hideLoading();
        },
        error: function(error) {
            console.error('Erreur de chargement du CSV:', error);
            alert('Erreur lors du chargement des données. Veuillez réessayer.');
            hideLoading();
        }
    });
}

// ========================================
// Traitement des données
// ========================================

function processData() {
    // Grouper les victimes par lieu
    const groupedByLocation = groupVictimsByLocation(allVictims);
    
    // Créer les marqueurs
    createMarkers(groupedByLocation);
    
    // Initialiser les filtres
    populateCommuneFilters();
    updateCounts();
    
    // Vue initiale
    map.fitBounds(CONFIG.views['Basse Romanche'], { padding: [20, 20] });
}

function groupVictimsByLocation(victims) {
    const groups = {};
    
    victims.forEach(victim => {
        const key = `${victim.commune}_${victim.lieu_dit}`;
        
        if (!groups[key]) {
            groups[key] = {
                commune: victim.commune,
                lieu_dit: victim.lieu_dit,
                victims: [],
                dates: new Set(),
                lat: null,
                lon: null
            };
        }
        
        groups[key].victims.push(victim);
        groups[key].dates.add(victim.date);
    });
    
    return Object.values(groups);
}

// ========================================
// Création des marqueurs
// ========================================

function createMarkers(locationGroups) {
    // Coordonnées approximatives pour chaque lieu
    const coordinates = getLocationCoordinates();
    
    locationGroups.forEach(group => {
        const coordKey = `${group.commune}_${group.lieu_dit}`;
        const coords = coordinates[coordKey];
        
        if (coords) {
            const marker = createMarker(group, coords);
            markers.push({ marker, group });
        }
    });
    
    applyFilters();
}

function createMarker(group, coords) {
    const category = determineCategory(group.victims);
    const icon = createCustomIcon(category);
    
    const marker = L.marker([coords.lat, coords.lon], { icon });
    marker.bindPopup(createPopupContent(group));
    marker.bindTooltip(createTooltipContent(group), { sticky: true });
    
    // Ajouter les métadonnées pour le filtrage
    marker.category = category;
    marker.commune = group.commune;
    marker.dates = Array.from(group.dates);
    
    return marker;
}

function createCustomIcon(category) {
    let className = 'custom-marker';
    
    switch(category) {
        case 'executions':
            className += ' marker-execution';
            break;
        case 'combats':
            className += ' marker-combat';
            break;
        case 'civils':
            className += ' marker-civil';
            break;
    }
    
    return L.divIcon({
        className: className,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
    });
}

function determineCategory(victims) {
    const statuts = victims.map(v => v.statut.toLowerCase());
    
    if (statuts.some(s => s.includes('combat'))) {
        return 'combats';
    } else if (statuts.some(s => s.includes('civil'))) {
        return 'civils';
    } else {
        return 'executions';
    }
}

function createPopupContent(group) {
    const dates = Array.from(group.dates).sort();
    const dateStr = dates.length === 1 ? formatDate(dates[0]) : 
                    `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
    
    let html = `
        <div class="popup-title">${group.lieu_dit}</div>
        <div class="popup-meta">
            <div class="popup-meta-item">
                <span class="popup-meta-label">Commune :</span>
                <span class="popup-meta-value">${group.commune}</span>
            </div>
            <div class="popup-meta-item">
                <span class="popup-meta-label">Date(s) :</span>
                <span class="popup-meta-value">${dateStr}</span>
            </div>
        </div>
        <div class="popup-victims">
            <div class="popup-victims-title">Victimes (${group.victims.length}) :</div>
            <ul class="popup-victims-list">
    `;
    
    group.victims.forEach(victim => {
        html += `<li>${victim.nom} — ${victim.statut}</li>`;
    });
    
    html += `
            </ul>
        </div>
    `;
    
    return html;
}

function createTooltipContent(group) {
    const dates = Array.from(group.dates).sort();
    const dateStr = dates.length === 1 ? formatDate(dates[0]) : 
                    `${formatDate(dates[0])} - ${formatDate(dates[dates.length - 1])}`;
    
    return `<div>
        <strong>${group.lieu_dit}</strong><br>
        ${group.victims.length} victime(s) — ${dateStr}
    </div>`;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ========================================
// Coordonnées des lieux
// ========================================

function getLocationCoordinates() {
    return {
        'Allemont (Allemond)_Fonderie d\'Allemont': { lat: 45.1318, lon: 6.0395 },
        'Allemont (Allemond)_Les Granges (chalet)': { lat: 45.137, lon: 6.046 },
        'Claix_Les Peyrouses': { lat: 45.138, lon: 5.6675 },
        'La Morte_Les Combaz': { lat: 45.0275, lon: 5.862 },
        'La Morte_La Blache': { lat: 45.0315, lon: 5.8675 },
        'Le Bourg-d\'Oisans_La Paute': { lat: 45.0747, lon: 6.012 },
        'Le Bourg-d\'Oisans_Salle des fêtes (arrière)': { lat: 45.0558, lon: 6.0303 },
        'Le Bourg-d\'Oisans_Les Ilats': { lat: 45.0635, lon: 6.035 },
        'Livet-et-Gavet_Poursollet': { lat: 45.0511, lon: 5.8986 },
        'Livet-et-Gavet_Livet - La Chambre d\'eau': { lat: 45.095, lon: 5.915 },
        'Livet-et-Gavet_Gavet - L\'Adret': { lat: 45.06, lon: 5.86 },
        'Livet-et-Gavet_Grand Gris': { lat: 45.085, lon: 5.885 },
        'Livet-et-Gavet_Gavet - Fonfroide': { lat: 45.055, lon: 5.87 },
        'Livet-et-Gavet_Rioupéroux - Les Clots / Les Ponants': { lat: 45.091165, lon: 5.909787 },
        'Livet-et-Gavet_Gavet': { lat: 45.055, lon: 5.87 },
        'Livet-et-Gavet_Rioupéroux': { lat: 45.0919, lon: 5.9031 },
        'Séchilienne_Village / Les Clots (stèle)': { lat: 45.0575, lon: 5.8375 },
        'Séchilienne_Combats de repli': { lat: 45.0542, lon: 5.8348 },
        'Séchilienne_Les Rivoirands (lieu-dit)': { lat: 45.05575, lon: 5.79536 },
        'Vizille_La Glacière (bord de route, après arrestation)': { lat: 45.0798, lon: 5.7798 },
        'Vizille_La Glacière (domicile Bontoux)': { lat: 45.0798, lon: 5.7798 },
        'Vizille_Domicile Georges Daillencourt (jardin)': { lat: 45.0753, lon: 5.7729 },
        'Vizille_Place du château (mitraillage)': { lat: 45.0753, lon: 5.7729 },
        'Vizille_Les Rivoirands (lieu-dit, soirée)': { lat: 45.05575, lon: 5.79536 }
    };
}

// ========================================
// Filtres
// ========================================

function populateCommuneFilters() {
    const communes = [...new Set(allVictims.map(v => v.commune))].sort();
    const container = document.getElementById('communeFilters');
    
    communes.forEach(commune => {
        const count = allVictims.filter(v => v.commune === commune).length;
        const label = createCheckboxLabel(commune, count, 'commune');
        container.appendChild(label);
    });
}

function createCheckboxLabel(value, count, filterType) {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'filter-checkbox';
    checkbox.dataset.filter = filterType;
    checkbox.value = value;
    checkbox.checked = true;
    
    const custom = document.createElement('span');
    custom.className = 'checkbox-custom';
    
    const text = document.createElement('span');
    text.className = 'checkbox-text';
    text.innerHTML = `${value} <span class="count">${count}</span>`;
    
    label.appendChild(checkbox);
    label.appendChild(custom);
    label.appendChild(text);
    
    return label;
}

function applyFilters() {
    // Récupérer les filtres
    const categoryCheckboxes = document.querySelectorAll('.filter-checkbox[data-filter="category"]:checked');
    const communeCheckboxes = document.querySelectorAll('.filter-checkbox[data-filter="commune"]:checked');
    
    currentFilters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);
    currentFilters.communes = Array.from(communeCheckboxes).map(cb => cb.value);
    currentFilters.dateStart = document.getElementById('dateStart').value;
    currentFilters.dateEnd = document.getElementById('dateEnd').value;
    
    // Vider le cluster
    markerClusterGroup.clearLayers();
    
    // Filtrer et ajouter les marqueurs
    markers.forEach(({ marker, group }) => {
        if (shouldShowMarker(marker, group)) {
            markerClusterGroup.addLayer(marker);
        }
    });
}

function shouldShowMarker(marker, group) {
    // Filtre par catégorie
    if (!currentFilters.categories.includes(marker.category)) {
        return false;
    }
    
    // Filtre par commune
    if (currentFilters.communes.length > 0 && !currentFilters.communes.includes(marker.commune)) {
        return false;
    }
    
    // Filtre par date
    const markerDates = marker.dates;
    const hasValidDate = markerDates.some(date => {
        return date >= currentFilters.dateStart && date <= currentFilters.dateEnd;
    });
    
    if (!hasValidDate) {
        return false;
    }
    
    return true;
}

function resetFilters() {
    // Réinitialiser les checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(cb => {
        cb.checked = true;
    });
    
    // Réinitialiser les dates
    document.getElementById('dateStart').value = '1944-08-01';
    document.getElementById('dateEnd').value = '1944-08-31';
    
    // Réappliquer
    applyFilters();
    updateCounts();
}

function updateCounts() {
    // Compter par catégorie
    const executions = allVictims.filter(v => 
        v.statut.toLowerCase().includes('exécuté')).length;
    const combats = allVictims.filter(v => 
        v.statut.toLowerCase().includes('combat')).length;
    const civils = allVictims.filter(v => 
        v.statut.toLowerCase().includes('civil')).length;
    
    document.getElementById('count-executions').textContent = executions;
    document.getElementById('count-combats').textContent = combats;
    document.getElementById('count-civils').textContent = civils;
}

// ========================================
// Statistiques
// ========================================

function showStats() {
    const content = document.getElementById('statsContent');
    
    // Statistiques générales
    const totalVictims = allVictims.length;
    const communes = [...new Set(allVictims.map(v => v.commune))];
    const dates = [...new Set(allVictims.map(v => v.date))].sort();
    
    // Grouper par commune
    const byCommune = {};
    allVictims.forEach(v => {
        byCommune[v.commune] = (byCommune[v.commune] || 0) + 1;
    });
    
    const sortedCommunes = Object.entries(byCommune)
        .sort((a, b) => b[1] - a[1]);
    
    const maxCount = sortedCommunes[0][1];
    
    let html = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${totalVictims}</div>
                <div class="stat-label">Victimes recensées</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${communes.length}</div>
                <div class="stat-label">Communes touchées</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${dates.length}</div>
                <div class="stat-label">Jours d'événements</div>
            </div>
        </div>
        
        <div class="stats-section">
            <h3>Répartition par commune</h3>
            <div class="commune-list">
    `;
    
    sortedCommunes.forEach(([commune, count]) => {
        const percentage = (count / maxCount) * 100;
        html += `
            <div class="commune-item">
                <div class="commune-name">${commune}</div>
                <div class="commune-bar-wrapper">
                    <div class="commune-bar" style="width: ${percentage}%"></div>
                    <div class="commune-count">${count}</div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    document.getElementById('statsModal').classList.add('active');
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Sidebar toggle
    document.getElementById('toggleSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    document.getElementById('closeSidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });
    
    // Filtres
    document.getElementById('applyFilters').addEventListener('click', () => {
        applyFilters();
    });
    
    document.getElementById('resetFilters').addEventListener('click', () => {
        resetFilters();
    });
    
    // Modales
    document.getElementById('helpBtn').addEventListener('click', () => {
        document.getElementById('helpModal').classList.add('active');
    });
    
    document.getElementById('closeHelp').addEventListener('click', () => {
        document.getElementById('helpModal').classList.remove('active');
    });
    
    document.getElementById('statsBtn').addEventListener('click', () => {
        showStats();
    });
    
    document.getElementById('closeStats').addEventListener('click', () => {
        document.getElementById('statsModal').classList.remove('active');
    });
    
    // Fermer les modales en cliquant à l'extérieur
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // ESC pour fermer les modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

// ========================================
// Utilitaires
// ========================================

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 300);
}
