const statusEl = document.getElementById('status-message');
const progressEl = document.getElementById('progress');
const pickerSection = document.getElementById('picker-section');
const listContainer = document.getElementById('list-container');
const searchFilter = document.getElementById('search-filter');
const excludeFilter = document.getElementById('exclude-filter');
const btnSelectAll = document.getElementById('btn-select-all');
const btnClearAll = document.getElementById('btn-clear-all');
const btnApply = document.getElementById('btn-apply');
const btnApplyCrypto = document.getElementById('btn-apply-crypto');
const downloadBtn = document.getElementById('btn-download-zip');
const downloadNote = document.getElementById('download-note');
const selectedCount = document.getElementById('selected-count');
const cryptoInstructions = document.getElementById('crypto-instructions');
const mapInstructions = document.getElementById('map-instructions');
const steamInputs = document.getElementById('steam-inputs');
const steamInput = document.getElementById('steamid64');
const loadMapBtn = document.getElementById('load-map-button');
const mainMenu = document.getElementById('main-menu');
const downloadSection = document.getElementById('download-section');
const statusSection = document.querySelector('.status-section');
const bgMusic = document.getElementById('bgMusic');
const welcomeVocal = document.getElementById('welcomeVocal');
const includedItemsText = document.getElementById('included-items-text');
const includedItemsSection = document.getElementById('included-items-section');
const unlockToolSection = document.getElementById('unlocks-tools-section');
const unlocksToolBtn = document.getElementById('unlocks-tool-btn');
const toolSteamID64 = document.getElementById('tool-steamid64');
const toolInput = document.getElementById('tool-input');
const toolOutput = document.getElementById('tool-output');
const toolWarning = document.getElementById('tool-warning');

const DEF_PATH = 'defs/vehicle_component_definitions.json';
const CLOTHING_DEF_PATH = 'defs/inventory_definitions.json';
const TILES_DIR = 'defaultCreativeSave/tiles/';
const BASE_SAVE_DIR = 'defaultCreativeSave/';
const DUNGEONS_DIR = 'defaultCreativeSave/dungeons/';

const TILE_FILES = [
    'tile_100_125_1_level_3.json',
    'tile_100_125_1_static.json',
    'tile_100_126_0_level_3.json',
    'tile_100_126_0_static.json',
    'tile_100_126_1_level_3.json',
    'tile_100_127_0_static.json',
    'tile_101_122_1_static.json',
    'tile_101_123_0_static.json',
    'tile_101_124_0_static.json',
    'tile_101_124_1_static.json',
    'tile_101_125_0_level_3.json',
    'tile_101_125_0_static.json',
    'tile_101_125_1_level_3.json',
    'tile_101_125_1_static.json',
    'tile_101_126_0_level_3.json',
    'tile_101_126_0_static.json',
    'tile_101_127_1_static.json',
    'tile_101_128_0_static.json',
    'tile_102_122_1_static.json',
    'tile_102_123_0_static.json',
    'tile_102_123_1_static.json',
    'tile_102_124_0_static.json',
    'tile_102_124_1_static.json',
    'tile_102_125_0_static.json',
    'tile_102_125_1_static.json',
    'tile_102_126_1_static.json',
    'tile_103_123_0_static.json',
    'tile_103_123_1_static.json',
    'tile_103_124_0_static.json',
    'tile_103_124_1_static.json',
    'tile_103_125_0_static.json',
    'tile_103_125_1_static.json',
    'tile_103_126_0_static.json',
    'tile_103_127_0_static.json',
    'tile_104_122_0_static.json',
    'tile_104_124_0_static.json',
    'tile_104_124_1_static.json',
    'tile_104_125_0_static.json',
    'tile_104_126_0_static.json'
];
const dungeonFilenames = [
    'dungeon_0_entrance.json',
    'dungeon_0_static.json'
];
const tileToModify = 'tile_101_125_0_level_3.json';
const selectedIds = new Set(JSON.parse(localStorage.getItem('selectedIds') || '[]'));
const cachedSteamId = localStorage.getItem('steamId64');

let defsJson = null;
let clothingJson = null;
let allItems = [];
let tileFiles = {};
let dungeonFiles = {};
let metaJson = null;
let sceneJson = null;
let zipBlob = null;
let isMouseDown = false;
let shouldSelectMode = true;
let unlockJsonText = '';

const savedSearch = localStorage.getItem('searchFilterValue');
if(savedSearch !== null) searchFilter.value = savedSearch;

const savedExclude = localStorage.getItem('excludeFilterValue');
if(savedExclude !== null) excludeFilter.value = savedExclude;

async function fetchText(url) {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`${url} -> ${res.status}`);
    return await res.text();
}

async function fetchJson(url) {
    const res = await fetch(url);
    if(!res.ok) throw new Error(`${url} -> ${res.status}`);
    return await res.json();
}

function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.className = isError ? 'error' : 'success';
}

function setProgress(msg) {
    progressEl.textContent = msg;
}

function listTileFiles() {
    return TILE_FILES.map(file => TILES_DIR + file);
}

function findItemNamesFromCompDefs(jsonObj, excludeClasses = [], isComp = true) {
    const foundComponents = [];
    const excludedSet = new Set(excludeClasses);
    const definitions = jsonObj?.definitions;

    if(!Array.isArray(definitions)) {
        return foundComponents;
    }

    definitions.forEach(obj => {
        if(!obj || typeof obj !== 'object') return;

        if(typeof obj.class === 'string' && excludedSet.has(obj.class)) {
            return;
        }

        if(typeof obj.id === 'string') {
            console.log('Found item:', `${isComp ? '[Vehicle Defs]' : '[Inventory Defs]'}`, obj);

            foundComponents.push({
                id: obj.id,
                tier: typeof obj.tech_tier === 'number' ? obj.tech_tier : null,
                category: typeof obj.category === 'string' ? obj.category : null,
                class: typeof obj.class === 'string' ? obj.class : null,
                loot_group: typeof obj.loot_group === 'string' ? obj.loot_group : null,
                isComponent: isComp
            });
        }
    });

    return foundComponents;
}

function renderItemList(allItems, filterText = '') {
    listContainer.innerHTML = '';
    
    const searchTerms = filterText.split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term !== '');

    const excludeTerms = excludeFilter.value.split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term !== '');

    allItems.forEach(item => {
        const displayStr = getItemDisplayText(item).toLowerCase();

        if(searchTerms.length > 0) {
            const matchesSearch = searchTerms.some(term => displayStr.includes(term));
            if(!matchesSearch) return;
        }

        if(excludeTerms.length > 0) {
            const matchesExclude = excludeTerms.some(term => displayStr.includes(term));
            if(matchesExclude) return;
        }

        const row = document.createElement('div');
        row.className = `item-row ${selectedIds.has(item.id) ? 'selected' : ''}`;
        row.textContent = getItemDisplayText(item);
        row.style.cursor = 'pointer';
        row.style.padding = '6px 8px';
        row.style.borderBottom = '1px solid #222';
        row.style.userSelect = 'none'; 

        row.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            shouldSelectMode = !selectedIds.has(item.id);
            toggleSingleRowSelection(item.id, shouldSelectMode, row);
            e.preventDefault(); 
        });

        row.addEventListener('mouseenter', () => {
            if(isMouseDown) {
                toggleSingleRowSelection(item.id, shouldSelectMode, row);
            }
        });

        listContainer.appendChild(row);
    });
    
    updateSelectedCount();
}

function toggleSingleRowSelection(id, forceState, rowElement) {
    if(forceState) {
        selectedIds.add(id);
        rowElement.classList.add('selected');
    } else {
        selectedIds.delete(id);
        rowElement.classList.remove('selected');
    }
    updateSelectedCount();
}

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

function updateSelectedCount() {
    selectedCount.textContent = selectedIds.size;
}

function buildUnlockJson(selectedDefs) {
    return {
        unlocked_items: selectedDefs.map(item => {
            if(item.isComponent) {
                return {
                    definition_id: "vehicle_editor_add_component",
                    component_definition_id: item.id
                };
            }

            return {
                definition_id: item.id
            };
        })
    };
}

function buildItems(tileJson, componentDefs, cfg = {}) {
    const cloned = JSON.parse(JSON.stringify(tileJson));
    const items = cloned.floor_items?.items;
    if(!Array.isArray(items)) throw new Error('floor_items.items is not an array');

    const {
        startX = 83965,
        startY = 5,
        startZ = 55837,
        maxWidth = 50,
        xSpacing = 0.5,
        zSpacing = 0.5
    } = cfg;

    function findMaxId(obj) {
        let max = 0;
        if(!obj || typeof obj !== 'object') return max;
        if(typeof obj.id === 'number') max = obj.id;
        for(const key in obj) {
            if(Object.prototype.hasOwnProperty.call(obj, key)) {
                const childMax = findMaxId(obj[key]);
                if(childMax > max) max = childMax;
            }
        }
        return max;
    }

    let nextId = findMaxId(cloned) + 1;

    componentDefs.forEach((itemObj, index) => {
        const row = Math.floor(index / maxWidth);
        const col = index % maxWidth;
        
        const posX = +(startX - (row * xSpacing)).toFixed(2);
        const posY = startY;
        const posZ = +(startZ + (col * zSpacing)).toFixed(2);

        let itemData = {};

        if(itemObj.isComponent) {
            itemData = {
                _type: 'vehicle_editor_add_component',
                id: nextId++,
                is_loot: true,
                component_def: itemObj.id
            };

            console.log(`Adding unlock box item (ID: ${itemObj.id})`);
        } else {
            itemData = {
                _type: itemObj.id,
                id: nextId++,
                is_loot: true
            };

            console.log(`Adding inventory item (ID: ${itemObj.id})`);
        }

        const itemEntry = {
            transform: {
                m: [-1, 0, 0, 0, 1, 0, 0, 0, -1],
                t: [posX, posY, posZ]
            },
            item: itemData
        };
        
        items.push(itemEntry);
    });

    return cloned;
}

async function applyToMap() {
    if(selectedIds.size === 0) {
        setStatus('Please select at least one item.', true);
        return;
    }

    pickerSection.style.display = 'none';
    mapInstructions.classList.remove('hidden');

    try {
        setStatus("Hold on, I'm zipping over here...");
        const selectedDefs = allItems.filter(item => selectedIds.has(item.id));
        localStorage.setItem('selectedIds', JSON.stringify([...selectedIds]));

        const zip = new JSZip();
        
        const rootFolder = zip.folder('creativeLootSave');
        const tilesFolder = rootFolder.folder('tiles');
        const dungeonsFolder = rootFolder.folder('dungeons');

        // 1. Process and package the tile files
        let count = 0;
        const totalTiles = Object.keys(tileFiles).length;

        for(const [tileName, tileData] of Object.entries(tileFiles)) {
            setProgress(`Processing tiles ${++count}/${totalTiles}: ${tileName}`);
            
            let outputData;
            if(tileName === tileToModify) {
                outputData = buildItems(tileData, selectedDefs);
            } else {
                outputData = tileData;
            }
            
            const jsonString = JSON.stringify(outputData);
            const fileBlob = new Blob([jsonString], { type: 'application/json' });
            tilesFolder.file(tileName, fileBlob);
        }

        // 2. Package meta.json into creativeLootSave/
        if(metaJson) {
            const metaBlob = new Blob([JSON.stringify(metaJson)], { type: 'application/json' });
            rootFolder.file('meta.json', metaBlob);
        }

        // 3. Package scene.json into creativeLootSave/
        if(sceneJson) {
            const sceneBlob = new Blob([JSON.stringify(sceneJson)], { type: 'application/json' });
            rootFolder.file('scene.json', sceneBlob);
        }

        // 4. Package dungeon files into creativeLootSave/dungeons/
        for(const [dungeonName, dungeonData] of Object.entries(dungeonFiles)) {
            const dungeonBlob = new Blob([JSON.stringify(dungeonData)], { type: 'application/json' });
            dungeonsFolder.file(dungeonName, dungeonBlob);
        }

        setProgress('Generating ZIP file...');
        
        zipBlob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'STORE' 
        });
        
        setStatus('Ready to download!');
        setProgress('');
        downloadNote.style.display = 'block';
        downloadBtn.disabled = false;
    } catch (err) {
        console.error(err);
        setStatus('Error: ' + err.message, true);
    }
}

async function initAndShowPicker() {
    try {
        setStatus('Loading default creative map...');
        const [vehicleData, clothingData] = await Promise.all([
            fetchJson(DEF_PATH),
            fetchJson(CLOTHING_DEF_PATH).catch(e => {
                console.warn('Inventory definitions not found, skipping.', e);
                return { definitions: [] };
            })
        ]);
        
        defsJson = vehicleData;
        clothingJson = clothingData;
        
        setProgress('Listing tile files...');

        const urls = await listTileFiles();
        if(!urls.length) {
            setStatus('No tile files found.', true);
            return;
        }

        setProgress(`Found ${urls.length} tiles. Loading...`);

        for(let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const name = url.split('/').pop();

            setProgress(`Loading tile ${i + 1}/${urls.length}: ${name}`);

            try {
                const tileData = await fetchJson(url);
                tileFiles[name] = tileData;
            } catch (e) {
                console.warn(`Failed to load ${url}:`, e);
                setProgress(`Failed tile ${i + 1}/${urls.length}: ${name}`);
            }
        }

        if(Object.keys(tileFiles).length === 0) {
            setStatus('Failed to load any tiles.', true);
            return;
        }

        setProgress('Fetching structural metadata files...');
        try {
            metaJson = await fetchJson(BASE_SAVE_DIR + 'meta.json');
        } catch (e) { 
            console.warn('meta.json not found, skipping.', e); 
        }

        try {
            sceneJson = await fetchJson(BASE_SAVE_DIR + 'scene.json');
        } catch (e) { 
            console.warn('scene.json not found, skipping.', e); 
        }

        setProgress('Loading dungeon blueprints...');
        for(const filename of dungeonFilenames) {
            try {
                const dungeonData = await fetchJson(DUNGEONS_DIR + filename);
                dungeonFiles[filename] = dungeonData;
            } catch (e) {
                console.warn(`Failed to read dungeon file ${filename}:`, e);
            }
        }

        const vehicleComponents = findItemNamesFromCompDefs(defsJson, [], true);
        const clothingComponents = findItemNamesFromCompDefs(clothingJson, [], false);

        allItems = [...vehicleComponents, ...clothingComponents];

        renderItemList(allItems, searchFilter.value);

        setStatus('Loaded map! Select items to add.');
        setProgress('');
        pickerSection.style.display = 'block';
        downloadSection.classList.remove('hidden');

        bgMusic.volume = 0.1;
        bgMusic.play();
        welcomeVocal.volume = 0.6;
        welcomeVocal.play();

        setTimeout(() => {
            bgMusic.volume = 0.5;
        }, 2000);
    } catch (err) {
        console.error(err);
        setStatus('Error: ' + err.message, true);
    }
}

function getItemDisplayText(item) {
    let formattedId = item.id
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    let displayStr = formattedId;
    
    const tags = [];

    if(item.tier !== null) {
        tags.push(`Tier ${item.tier}`);
    }
    
    if(item.category !== null && item.category !== undefined && item.category.trim() !== '') {
        tags.push(item.category);
    }
    
    if(item.loot_group !== null && item.loot_group !== undefined && item.loot_group.trim() !== '') {
        tags.push(item.loot_group);
    }
    
    if(tags.length === 0 && item.class !== null && item.class !== undefined && item.class.trim() !== '') {
        tags.push(item.class);
    }
    
    const uniqueTags = [...new Set(tags)];
    
    if(uniqueTags.length > 0) {
        const formattedTags = uniqueTags.map(tag => {
            return tag
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }).join(' / ');

        displayStr += ` (${formattedTags})`;
    }
    
    return displayStr;
}

function showIncludedItems() {
    includedItemsSection.classList.remove('hidden')
    includedItemsText.innerText = [...selectedIds].join(", ");
}

excludeFilter.addEventListener('input', (e) => {
    selectedIds.clear();
    renderItemList(allItems, searchFilter.value);
    updateSelectedCount();
    localStorage.setItem('excludeFilterValue', e.target.value);
});

searchFilter.addEventListener('input', (e) => {
    renderItemList(allItems, e.target.value);
    updateSelectedCount();
    localStorage.setItem('searchFilterValue', e.target.value);
});

btnSelectAll.addEventListener('click', () => {
    const searchTerms = searchFilter.value.split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term !== '');

    const excludeTerms = excludeFilter.value.split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term !== '');
    
    allItems.forEach(item => {
        const displayStr = getItemDisplayText(item).toLowerCase();
        
        let matchesSearch = true;
        if(searchTerms.length > 0) {
            matchesSearch = searchTerms.some(term => displayStr.includes(term));
        }
        
        let matchesExclude = false;
        if(excludeTerms.length > 0) {
            matchesExclude = excludeTerms.some(term => displayStr.includes(term));
        }
        
        if(matchesSearch && !matchesExclude) {
            selectedIds.add(item.id);
        }
    });
    
    renderItemList(allItems, searchFilter.value);
    updateSelectedCount();
});

btnClearAll.addEventListener('click', () => {
    selectedIds.clear();
    renderItemList(allItems, searchFilter.value);
    updateSelectedCount();
});

btnApplyCrypto.addEventListener('click', async () => {
    if(selectedIds.size === 0) {
        setStatus('Please select at least one item.', true);
        return;
    }

    if(cachedSteamId) {
        steamInput.value = cachedSteamId;
        encryptAndDownload(cachedSteamId);
    } else {
        setStatus('We need your information to encrypt the file for you.');
        steamInputs.classList.remove('hidden');
    }

    pickerSection.style.display = 'none';
    cryptoInstructions.classList.remove('hidden');
    showIncludedItems();
});

btnApply.addEventListener('click', async () => {
    applyToMap(false);
    showIncludedItems();
});

downloadBtn.addEventListener('click', () => {
    if(unlockJsonText) {
        const blob = new Blob([unlockJsonText], {
            type: 'text/plain;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'unlocks.txt';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        return;
    }

    if(!zipBlob) return;

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'creativeLootSave_unzip_me.zip';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
});

function encryptAndDownload(key) {
    setStatus("Hold on, I'm encrypting over here...");

    const selectedDefs = allItems.filter(item => selectedIds.has(item.id));
    localStorage.setItem('selectedIds', JSON.stringify([...selectedIds]));

    unlockJsonText = encode(JSON.stringify(buildUnlockJson(selectedDefs)), key);

    console.log('Selected items:', selectedDefs);
    console.log('Using key:', key);
    console.log('Generated unlocks.txt content:', unlockJsonText + '\nLength: ' + unlockJsonText.length);

    setStatus('Ready to download!');
    setProgress('');
    downloadNote.style.display = 'block';
    downloadBtn.disabled = false;

    steamInputs.classList.add('hidden');
}

steamInput.addEventListener('change', () => {
    const value = steamInput.value.trim();

    if(value === '') {
        setStatus('SteamID64 cannot be empty.', true);
        return;
    }

    const isValidPattern = /^[0-9]{17}$/.test(value);
    const hasValidPrefix = value.startsWith('7656119');

    if(!isValidPattern || !hasValidPrefix) {
        setStatus('Invalid SteamID64. Must be 17 digits and start with 7656119.', true);
        return;
    }

    localStorage.setItem('steamId64', value);

    encryptAndDownload(value);
});

document.getElementById("clear-cache-btn").addEventListener("click", async () => {
    localStorage.clear();
    sessionStorage.clear();

    document.cookie.split(";").forEach(cookie => {
    document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
    });

    if("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
    }

    alert("Site data cleared. Reloading...");
    location.reload();
});

loadMapBtn.addEventListener('click', () => {
    initAndShowPicker();
    mainMenu.style.display = 'none';
    statusSection.classList.remove('hidden');
});

unlocksToolBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    unlockToolSection.classList.remove('hidden');
});

let toolSteamID = 0;

toolSteamID64.addEventListener('input', (event) => {
    const steamID = Number(event.target.value);

    if(!steamID) {
        toolOutput.value = 'Error: Please input proper SteamID64!';
        console.warn('No')
        return;
    }

    toolSteamID = steamID;
    toolInputChanged();
});

function toolInputChanged() {
    const inputText = toolInput.value;

    if(typeof toolSteamID !== 'number') {
        toolOutput.value = 'Error: Please input SteamID64!';
        return;
    }

    if(!inputText) {
        toolOutput.value = '';
        return;
    }

    try {
        JSON.parse(inputText);
        toolOutput.value = encode(inputText, toolSteamID);
        toolWarning.classList.add('hidden');
    } catch (e) {
        const decoded = decode(inputText, toolSteamID);
        try {
            const parsed = JSON.parse(decoded);
            toolOutput.value = JSON.stringify(parsed, null, 4);
        } catch (jsonError) {
            toolOutput.value = decoded;
        }
        toolWarning.classList.remove('hidden');
    }

    toolOutput.style.height = 'auto';
    toolOutput.style.height = (toolOutput.scrollHeight + 5) + 'px';
}

toolInput.addEventListener('input', (event) => {
    toolInputChanged();
});