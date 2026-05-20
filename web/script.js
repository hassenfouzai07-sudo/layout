let machinesData = [];
let zoom = 1;
let selectedMachine = null;
const INITIAL_ZOOM = 1;
const ZOOM_STEP = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

// Charger les données
async function loadData() {
    try {
        const response = await fetch('../data/machines_data.json');
        const data = await response.json();
        machinesData = data.machines;
        renderLayout();
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        // Afficher un message d'erreur ou utiliser des données de secours
        loadLocalData();
    }
}

// Données de secours en cas d'erreur
function loadLocalData() {
    machinesData = [
        { id: 'TN-CM01', ref: '355-0310', type: 'Classique', category: 'CM', x: 0, y: 0, width: 100, height: 100, color: '#3498db' },
        { id: 'TN-CR01', ref: 'Croiseuse', type: 'Croiseuse', category: 'CR', x: 900, y: 0, width: 100, height: 100, color: '#e74c3c' },
        { id: 'TN-WM01', ref: 'Bobineuse', type: 'Bobineuse', category: 'WM', x: 0, y: 500, width: 100, height: 100, color: '#2ecc71' },
        { id: 'TN-TW01', ref: 'PS9580-3', type: 'Bobine', category: 'TW', x: 0, y: 600, width: 100, height: 100, color: '#f39c12' }
    ];
    renderLayout();
}

// Rendu du layout
function renderLayout() {
    const svg = document.getElementById('layoutCanvas');
    svg.innerHTML = '';

    // Déterminer les dimensions
    const maxX = Math.max(...machinesData.map(m => m.x + m.width)) + 100;
    const maxY = Math.max(...machinesData.map(m => m.y + m.height)) + 100;

    svg.setAttribute('viewBox', `0 0 ${maxX} ${maxY}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Grille en arrière-plan
    drawGrid(svg, maxX, maxY);

    // Dessiner les machines
    machinesData.forEach(machine => {
        drawMachine(svg, machine);
    });
}

// Dessiner la grille
function drawGrid(svg, width, height) {
    const gridSize = 100;
    const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    gridGroup.setAttribute('id', 'grid');
    gridGroup.setAttribute('opacity', '0.1');

    for (let x = 0; x <= width; x += gridSize) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', x);
        line.setAttribute('y2', height);
        line.setAttribute('stroke', '#999');
        gridGroup.appendChild(line);
    }

    for (let y = 0; y <= height; y += gridSize) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', width);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#999');
        gridGroup.appendChild(line);
    }

    svg.appendChild(gridGroup);
}

// Dessiner une machine
function drawMachine(svg, machine) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'machine-group');
    group.setAttribute('data-id', machine.id);

    // Rectangle
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', machine.x);
    rect.setAttribute('y', machine.y);
    rect.setAttribute('width', machine.width);
    rect.setAttribute('height', machine.height);
    rect.setAttribute('fill', machine.color);
    rect.setAttribute('class', 'machine-rect');
    rect.addEventListener('click', () => selectMachine(machine));

    // Texte
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', machine.x + machine.width / 2);
    text.setAttribute('y', machine.y + machine.height / 2 + 5);
    text.setAttribute('class', 'machine-label');
    text.setAttribute('fill', 'white');
    text.textContent = machine.id;

    group.appendChild(rect);
    group.appendChild(text);
    svg.appendChild(group);
}

// Sélectionner une machine
function selectMachine(machine) {
    // Désélectionner l'ancienne machine
    const previousSelected = document.querySelector('.machine-rect.selected');
    if (previousSelected) {
        previousSelected.classList.remove('selected');
    }

    // Sélectionner la nouvelle
    event.target.classList.add('selected');
    selectedMachine = machine;

    // Afficher les détails
    displayMachineInfo(machine);
}

// Afficher les détails de la machine
function displayMachineInfo(machine) {
    const infoContent = document.getElementById('infoContent');
    infoContent.innerHTML = `
        <strong>ID Machine:</strong>
        <p>${machine.id}</p>
        
        <strong>Référence:</strong>
        <p>${machine.ref}</p>
        
        <strong>Type:</strong>
        <p>${machine.type}</p>
        
        <strong>Catégorie:</strong>
        <p>${machine.category}</p>
        
        <strong>Dimensions:</strong>
        <p>${machine.width} × ${machine.height} pixels</p>
        
        <strong>Position:</strong>
        <p>X: ${machine.x}, Y: ${machine.y}</p>
    `;
}

// Recherche
function searchMachine(query) {
    const found = machinesData.find(m => 
        m.id.toUpperCase().includes(query.toUpperCase()) ||
        m.ref.toUpperCase().includes(query.toUpperCase())
    );

    if (found) {
        selectMachine(found);
    } else {
        document.getElementById('infoContent').innerHTML = '<p>Machine non trouvée</p>';
    }
}

// Zoom
function zoomIn() {
    zoom = Math.min(zoom + ZOOM_STEP, MAX_ZOOM);
    applyZoom();
}

function zoomOut() {
    zoom = Math.max(zoom - ZOOM_STEP, MIN_ZOOM);
    applyZoom();
}

function resetZoom() {
    zoom = INITIAL_ZOOM;
    applyZoom();
}

function applyZoom() {
    const svg = document.getElementById('layoutCanvas');
    svg.style.transform = `scale(${zoom})`;
    svg.style.transformOrigin = '0 0';
}

// Event listeners
document.getElementById('searchInput').addEventListener('input', (e) => {
    if (e.target.value.trim() !== '') {
        searchMachine(e.target.value);
    }
});

document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
document.getElementById('resetBtn').addEventListener('click', resetZoom);

// Initialiser au chargement
window.addEventListener('DOMContentLoaded', loadData);
