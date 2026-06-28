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
const mapInstructions = document.getElementById('map-instructions');
const steamInputs = document.getElementById('steam-inputs');
const steamInput = document.getElementById('steamid64');
const loadMapBtn = document.getElementById('load-map-button');
const mainMenu = document.getElementById('main-menu');
const downloadSection = document.getElementById('download-section');
const statusSection = document.querySelector('.status-section');
const bgMusic = document.getElementById('bgMusic');
const includedItemsText = document.getElementById('included-items-text');
const includedItemsSection = document.getElementById('included-items-section');
const unlockToolSection = document.getElementById('unlocks-tools-section');
const unlocksToolBtn = document.getElementById('unlocks-tool-btn');
const toolSteamID64 = document.getElementById('tool-steamid64');
const toolInput = document.getElementById('tool-input');
const toolOutput = document.getElementById('tool-output');
const toolWarning = document.getElementById('tool-warning');
const tierStatsEl = document.getElementById('tier-stats');
const globalPatternSelect = document.getElementById('global-pattern-select');
const cryptCopySection = document.getElementById('crypt-copy-section');
const tooManyAudio = document.getElementById('tooMany1');

const DEF_PATH = 'defs/vehicle_component_definitions.json';
const CLOTHING_DEF_PATH = 'defs/inventory_definitions.json';
const TILES_DIR = 'defaultCreativeSave/tiles/';
const BASE_SAVE_DIR = 'defaultCreativeSave/';
const DUNGEONS_DIR = 'defaultCreativeSave/dungeons/';

const PATTERNS = [
    'camo_abu_tiger_stripe',
    'camo_desert',
    'camo_desert_night',
    'camo_frog_skin',
    'camo_marpat',
    'camo_military_ocp',
    'camo_nwu_navy',
    'camo_woodland',
    'dogtooth_pattern',
    'flat_blue',
    'flat_bone',
    'flat_clay_brown',
    'flat_dark_grey',
    'flat_dark_navy',
    'flat_davy_grey',
    'flat_forest_green',
    'flat_green',
    'flat_green_pea',
    'flat_lava_red',
    'flat_light_blue',
    'flat_light_grey',
    'flat_mineral_green',
    'flat_mustard_yellow',
    'flat_navy',
    'flat_olive_green',
    'flat_onyx_black',
    'flat_orange',
    'flat_pink',
    'flat_purple',
    'flat_red',
    'flat_redwood',
    'flat_saffron_yellow',
    'flat_salmon',
    'flat_sand',
    'flat_steel_blue',
    'flat_taupe_grey',
    'flat_teal_green',
    'flat_violet',
    'flat_yellow',
    'grid',
    'grid_blue',
    'plaid_red',
    'plaid_simple_blue',
    'shirt_pattern_blue',
    'shirt_pattern_blue_red',
    'shirt_pattern_green',
    'shirt_pattern_rainbow',
    'shirt_salmon_stripes_vertical',
    'stripes_blue_horizontal',
    'tartan_clan_campbell',
    'tartan_clan_wallace',
    'tartan_macleod_of_lewis',
    'tartan_st_andrews',
    'tartan_stewart_modern'
];

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
const selectedItemKeys = new Set(JSON.parse(localStorage.getItem('selectedItemKeys') || '[]'));
const selectedPatterns = JSON.parse(localStorage.getItem('selectedPatterns') || '{}');
const cachedSteamId = localStorage.getItem('steamId64');
const itemByKey = new Map();
const paintCount = 85;

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
let globalPatternValue = null;

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
            const baseItem = {
                id: obj.id,
                tier: typeof obj.tech_tier === 'number' ? obj.tech_tier : null,
                category: typeof obj.category === 'string' ? obj.category : null,
                class: typeof obj.class === 'string' ? obj.class : null,
                loot_group: typeof obj.loot_group === 'string' ? obj.loot_group : null,
                isComponent: isComp,

                patterns: Array.isArray(obj?.patterns?.patterns)
                    ? obj.patterns.patterns.map((p, index) => ({
                            id: p.id,
                            idx: index
                        }))
                    : []
            };

            if(obj.id === 'vehicle_editor_paint') {
                for(let i = 1; i <= paintCount; i++) {
                    foundComponents.push({
                        ...baseItem,
                        col: i
                    });
                }
            } else {
                foundComponents.push(baseItem);
            }
        }
    });

    return foundComponents;
}

function getPatternIndex(searchString) {
    return PATTERNS.indexOf(searchString); // index 0 in game is the default pattern
}

function resolvePattern(item) {
    if(!item.patterns?.length) return null;

    const globalPatternName = String(globalPatternSelect.value);
    const selectedPatternName = selectedPatterns[item.id];
    const randomPatternIndex = (Math.floor(Math.random() * PATTERNS.length));

    console.log(item, item.id, selectedPatternName);

    if(selectedPatternName) {
        const selectedPatternIndex = getPatternIndex(selectedPatternName);
        console.log(selectedPatternIndex);

        if(selectedPatternName === '__random__') return randomPatternIndex;
        
        return selectedPatternIndex;
    }

    if(!globalPatternName) return null;
    if(globalPatternName === '__random__') return randomPatternIndex;

    const globalPatternIndex = getPatternIndex(globalPatternName);

    console.log('if random, then', randomPatternIndex);
    console.log('returned', globalPatternIndex !== -1 ? globalPatternIndex : null);

    return globalPatternIndex !== -1 ? globalPatternIndex : null;
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
        row.className = `item-row ${selectedItemKeys.has(getItemKey(item)) ? 'selected' : ''}`;
        row.textContent = getItemDisplayText(item);
        row.style.cursor = 'pointer';
        row.style.padding = '6px 8px';
        row.style.borderBottom = '1px solid #222';
        row.style.userSelect = 'none'; 

        if(item.patterns?.length) {
            const select = document.createElement('select');

            select.innerHTML = `
                <option value="">Use Default</option>
                <option value="__random__">Random</option>
                ${PATTERNS.map(p =>
                    `<option value="${p}">${idToTitleCase(p)}</option>`
                ).join('')}
            `;

            select.value = selectedPatterns[item.id] || '';

            select.addEventListener('click', e => e.stopPropagation());

            select.addEventListener('change', e => {
                console.log(e.target.value);
                selectedPatterns[item.id] = e.target.value;
                localStorage.setItem(
                    'selectedPatterns',
                    JSON.stringify(selectedPatterns)
                );
            });

            row.appendChild(document.createElement('br'));
            row.appendChild(select);
        }

        row.addEventListener('mousedown', (e) => {
            if(e.target.tagName === 'SELECT' ||
                e.target.tagName === 'OPTION' ||
                e.target.closest('select')) {
                return;
            }

            isMouseDown = true;
            shouldSelectMode = !selectedItemKeys.has(getItemKey(item));
            toggleSingleRowSelection(getItemKey(item), shouldSelectMode, row);
            e.preventDefault();
        });

        row.addEventListener('mouseenter', () => {
            if(isMouseDown) {
                toggleSingleRowSelection(getItemKey(item), shouldSelectMode, row);
            }
        });

        listContainer.appendChild(row);
    });
    
    updateSelectedCount();
}

function toggleSingleRowSelection(key, forceState, rowElement) {
    if(forceState) {
        selectedItemKeys.add(key);
        rowElement.classList.add('selected');
    } else {
        selectedItemKeys.delete(key);
        rowElement.classList.remove('selected');
    }

    updateSelectedCount();
}

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

function updateSelectedCount() {
    selectedCount.textContent = selectedItemKeys.size;
    updateTierStats();
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

            const createdItemObj = {
                definition_id: item.id
            };

            if(item?.col) createdItemObj['paint_index'] = item.col;

            if(item.patterns?.length) {
                const pattern = resolvePattern(item);

                if(pattern !== null && pattern !== undefined)
                    createdItemObj['pattern_index'] = Number(pattern) || 0;
            }

            return createdItemObj;
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

            if(itemObj.patterns?.length) {
                const pattern = resolvePattern(itemObj);

                if(pattern !== null && pattern !== undefined) {
                    itemData.pattern = Number(pattern) || 0;
                }
            }

            if(itemObj?.col) itemData.col = itemObj.col;

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
    if(selectedItemKeys.size === 0) {
        setStatus('Please select at least one item.', true);
        return;
    }

    pickerSection.style.display = 'none';
    mapInstructions.classList.remove('hidden');

    try {
        setStatus("Hold on, I'm zipping over here...");
        const selectedDefs = allItems.filter(item => selectedItemKeys.has(getItemKey(item)));
        localStorage.setItem('selectedItemKeys', JSON.stringify([...selectedItemKeys]));

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

        downloadSection.classList.remove('hidden');
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

function mergeAllItems(vehicleComponents, clothingComponents) {
    const itemMap = new Map();

    function priority(item) {
        return item.isComponent ? 2 : 1; // prefer vehicle defs over inventory defs
    }

    const combined = [...vehicleComponents, ...clothingComponents];

    for(const item of combined) {
        const key = getItemKey(item);

        if(!itemMap.has(key)) {
            itemMap.set(key, item);
            continue;
        }

        const existing = itemMap.get(key);

        if(priority(item) > priority(existing)) {
            itemMap.set(key, item);
        }
    }

    return [...itemMap.values()];
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

        allItems = mergeAllItems(vehicleComponents, clothingComponents);
        populateGlobalPatternDropdown();

        itemByKey.clear();
        allItems.forEach(item => {
            itemByKey.set(getItemKey(item), item);
        });

        renderItemList(allItems, searchFilter.value);

        setStatus('Loaded map! Select items to add. ⸜(｡˃ ᵕ ˂ )⸝♡');
        setProgress('');
        pickerSection.style.display = 'block';

        bgMusic.volume = 0.5;
        bgMusic.play();
    } catch (err) {
        console.error(err);
        setStatus('Error: ' + err.message, true);
    }
}

function idToTitleCase(id) {
    return id
        .toLowerCase()
        .replace(/[_-]+/g, ' ')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase());
}

function populateGlobalPatternDropdown() {
    globalPatternSelect.innerHTML = `
        <option value="">Default</option>
        <option value="__random__">Random</option>
        ${PATTERNS.map(p =>
            `<option value="${p}">${idToTitleCase(p)}</option>`
        ).join('')}
    `;

    const saved = localStorage.getItem('globalPatternValue') || '';
    globalPatternSelect.value = saved;

    if(![...globalPatternSelect.options].some(o => o.value === saved)) {
        globalPatternSelect.value = '';
        localStorage.setItem('globalPatternValue', '');
    }
}

function updateTierStats() {
    let exceeded = false;

    const max = {
        "-1": 19,
        "4": 20,
        "5": 20
    };

    const counts = {
        "-1": 0,
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        "5": 0,
        "none": 0
    };

    for(const key of selectedItemKeys) {
        const item = itemByKey.get(key);
        if(!item) continue;

        const tier = item.tier;

        if(tier == null) {
            counts["none"]++;
        } else if(tier === -1) {
            counts["-1"]++;
        } else if(typeof tier === "number" && tier >= 0 && tier <= 5) {
            counts[String(tier)]++;
        }
    }

    for(const [tier, limit] of Object.entries(max)) {
        const current = counts[tier] ?? 0;

        if(current > limit) {
            exceeded = true;
            break;
        }
    }

    if(exceeded) tooManyAudio.play();

    const box = (label, value, limit = null) => {
        const over = limit !== null && value > limit;

        return `
            <div class="tier-box ${over ? 'overlimit' : ''}">
                <div class="tier-label">${label}</div>
                <div>${value} / ${limit ?? "∞"}</div>
                ${over && label === "-1"
                    ? `<div class="tier-warning">
                        You have too many Tier -1 items. Remove some.<br>
                        You will get detected otherwise.
                       </div>`
                    : ""
                }
            </div>
        `;
    };

    tierStatsEl.innerHTML = `
        ${box("No Tier", counts["none"])}
        ${box("Tier -1", counts["-1"], max["-1"])}
        ${box("Tier 0", counts["0"])}
        ${box("Tier 2", counts["2"])}
        ${box("Tier 3", counts["3"])}
        ${box("Tier 4", counts["4"], max["4"])}
        ${box("Tier 5", counts["5"], max["5"])}
    `;
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

    if(item.id === "vehicle_editor_paint" && item.col != null) {
        displayStr += ` C${item.col} `;
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

function getItemKey(item) {
    return item.col != null
        ? `${item.id}|${item.col}`
        : item.id;
}

function showIncludedItems() {
    includedItemsSection.classList.remove('hidden')
    includedItemsText.innerText = [...selectedItemKeys].join(", ");
}

excludeFilter.addEventListener('input', (e) => {
    selectedItemKeys.clear();
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
        const key = getItemKey(item);

        let matchesSearch = true;
        if(searchTerms.length > 0) {
            matchesSearch = searchTerms.some(term => displayStr.includes(term));
        }
        
        let matchesExclude = false;
        if(excludeTerms.length > 0) {
            matchesExclude = excludeTerms.some(term => displayStr.includes(term));
        }

        if(matchesSearch && !matchesExclude) {
            selectedItemKeys.add(key);
        }
    });
    
    renderItemList(allItems, searchFilter.value);
    updateSelectedCount();
});

btnClearAll.addEventListener('click', () => {
    selectedItemKeys.clear();
    renderItemList(allItems, searchFilter.value);
    updateSelectedCount();
});

btnApplyCrypto.addEventListener('click', async () => {
    if(selectedItemKeys.size === 0) {
        setStatus('Please select at least one item.', true);
        return;
    }

    if(cachedSteamId) {
        steamInput.value = cachedSteamId;
        encryptAndShow(cachedSteamId);
    } else {
        setStatus('We need your information to encrypt the file for you.');
        steamInputs.classList.remove('hidden');
    }

    showIncludedItems();
});

btnApply.addEventListener('click', async () => {
    applyToMap(false);
    showIncludedItems();
    cryptCopySection.classList.add('hidden');

    window.scrollTo(0, 0);
});

downloadBtn.addEventListener('click', () => {
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

function encryptAndShow(key) {
    setStatus("Hold on, I'm encrypting over here...");

    const selectedDefs = allItems.filter(item => selectedItemKeys.has(getItemKey(item)));
    localStorage.setItem('selectedItemKeys', JSON.stringify([...selectedItemKeys]));

    unlockJsonText = encode(JSON.stringify(buildUnlockJson(selectedDefs)), key);

    console.log('Selected items:', selectedDefs);
    console.log('Using key:', key);
    console.log(buildUnlockJson(selectedDefs));
    console.log(unlockJsonText);

    const output = document.getElementById('crypt-main-output');
    output.value = unlockJsonText;

    cryptCopySection.classList.remove('hidden');

    setStatus('Ready to copy!');
    setProgress('');

    output.focus();
    output.select();

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

    encryptAndShow(value);
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

globalPatternSelect.addEventListener('input', () => {
    localStorage.setItem('globalPatternValue', globalPatternSelect.value);
});

// Time for refactoring... some other day, or never because this project is short-lived anyway!