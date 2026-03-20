// ═══════════════════════════════════════════════════════════════
// CORE MATERIALS - Most commonly used materials (loaded immediately)
// Основные материалы - самые часто используемые (загружаются сразу)
// ═══════════════════════════════════════════════════════════════

const CORE_MATERIALS = [
  // Популярные блоки
  { id: 'STONE', name: 'Stone', icon: 'stone', tags: ['stone'] },
  { id: 'COBBLESTONE', name: 'Cobblestone', icon: 'cobblestone', tags: ['cobblestone'] },
  { id: 'DIRT', name: 'Dirt', icon: 'dirt', tags: ['dirt'] },
  { id: 'GRASS_BLOCK', name: 'Grass Block', icon: 'grass-block', tags: ['grass', 'block'] },
  { id: 'OAK_PLANKS', name: 'Oak Planks', icon: 'oak-planks', tags: ['oak', 'planks'] },
  { id: 'OAK_LOG', name: 'Oak Log', icon: 'oak-log', tags: ['oak', 'log'] },
  { id: 'GLASS', name: 'Glass', icon: 'glass', tags: ['glass'] },
  { id: 'SAND', name: 'Sand', icon: 'sand', tags: ['sand'] },
  { id: 'GRAVEL', name: 'Gravel', icon: 'gravel', tags: ['gravel'] },
  
  // Популярные предметы
  { id: 'DIAMOND', name: 'Diamond', icon: 'diamond', tags: ['diamond'] },
  { id: 'EMERALD', name: 'Emerald', icon: 'emerald', tags: ['emerald'] },
  { id: 'GOLD_INGOT', name: 'Gold Ingot', icon: 'gold-ingot', tags: ['gold', 'ingot'] },
  { id: 'IRON_INGOT', name: 'Iron Ingot', icon: 'iron-ingot', tags: ['iron', 'ingot'] },
  { id: 'COAL', name: 'Coal', icon: 'coal', tags: ['coal'] },
  { id: 'REDSTONE', name: 'Redstone Dust', icon: 'redstone', tags: ['redstone', 'dust'] },
  { id: 'LAPIS_LAZULI', name: 'Lapis Lazuli', icon: 'lapis-lazuli', tags: ['lapis', 'lazuli'] },
  
  // Популярные инструменты
  { id: 'DIAMOND_SWORD', name: 'Diamond Sword', icon: 'diamond-sword', tags: ['diamond', 'sword'] },
  { id: 'DIAMOND_PICKAXE', name: 'Diamond Pickaxe', icon: 'diamond-pickaxe', tags: ['diamond', 'pickaxe'] },
  { id: 'BOW', name: 'Bow', icon: 'bow', tags: ['bow'] },
  { id: 'ARROW', name: 'Arrow', icon: 'arrow', tags: ['arrow'] },
  
  // Популярная еда
  { id: 'BREAD', name: 'Bread', icon: 'bread', tags: ['bread', 'food'] },
  { id: 'APPLE', name: 'Apple', icon: 'apple', tags: ['apple', 'food'] },
  { id: 'COOKED_BEEF', name: 'Steak', icon: 'cooked-beef', tags: ['steak', 'beef', 'food'] },
  { id: 'GOLDEN_APPLE', name: 'Golden Apple', icon: 'golden-apple', tags: ['golden', 'apple', 'food'] },
  
  // Популярные декоративные блоки
  { id: 'BOOKSHELF', name: 'Bookshelf', icon: 'bookshelf', tags: ['bookshelf', 'book'] },
  { id: 'CHEST', name: 'Chest', icon: 'chest', tags: ['chest'] },
  { id: 'CRAFTING_TABLE', name: 'Crafting Table', icon: 'crafting-table', tags: ['crafting', 'table'] },
  { id: 'FURNACE', name: 'Furnace', icon: 'furnace', tags: ['furnace'] },
  { id: 'TORCH', name: 'Torch', icon: 'torch', tags: ['torch'] },
  
  // Популярные цветные блоки
  { id: 'WHITE_WOOL', name: 'White Wool', icon: 'white-wool', tags: ['white', 'wool'] },
  { id: 'RED_WOOL', name: 'Red Wool', icon: 'red-wool', tags: ['red', 'wool'] },
  { id: 'BLUE_WOOL', name: 'Blue Wool', icon: 'blue-wool', tags: ['blue', 'wool'] },
  { id: 'GREEN_WOOL', name: 'Green Wool', icon: 'green-wool', tags: ['green', 'wool'] },
  
  // Популярные редкие предметы
  { id: 'NETHERITE_INGOT', name: 'Netherite Ingot', icon: 'netherite-ingot', tags: ['netherite', 'ingot'] },
  { id: 'ENDER_PEARL', name: 'Ender Pearl', icon: 'ender-pearl', tags: ['ender', 'pearl'] },
  { id: 'BLAZE_ROD', name: 'Blaze Rod', icon: 'blaze-rod', tags: ['blaze', 'rod'] },
  { id: 'NETHER_STAR', name: 'Nether Star', icon: 'nether-star', tags: ['nether', 'star'] },
  
  // Популярные блоки для строительства
  { id: 'BRICKS', name: 'Bricks', icon: 'bricks', tags: ['bricks'] },
  { id: 'STONE_BRICKS', name: 'Stone Bricks', icon: 'stone-bricks', tags: ['stone', 'bricks'] },
  { id: 'QUARTZ_BLOCK', name: 'Block of Quartz', icon: 'quartz-block', tags: ['quartz', 'block'] },
  { id: 'OBSIDIAN', name: 'Obsidian', icon: 'obsidian', tags: ['obsidian'] },
  
  // Популярные функциональные блоки
  { id: 'ANVIL', name: 'Anvil', icon: 'anvil', tags: ['anvil'] },
  { id: 'ENCHANTING_TABLE', name: 'Enchanting Table', icon: 'enchanting-table', tags: ['enchanting', 'table'] },
  { id: 'BREWING_STAND', name: 'Brewing Stand', icon: 'brewing-stand', tags: ['brewing', 'stand'] },
  { id: 'BEACON', name: 'Beacon', icon: 'beacon', tags: ['beacon'] },
  
  // Популярные транспортные предметы
  { id: 'MINECART', name: 'Minecart', icon: 'minecart', tags: ['minecart'] },
  { id: 'BOAT', name: 'Oak Boat', icon: 'oak-boat', tags: ['boat', 'oak'] },
  { id: 'ELYTRA', name: 'Elytra', icon: 'elytra', tags: ['elytra'] },
  
  // Барьер для тестирования
  { id: 'BARRIER', name: 'Barrier', icon: 'barrier', tags: ['barrier'] }
];

// Маппинг основных материалов к CSS классам иконок
const CORE_MATERIAL_TO_ICON = {
  'STONE': 'stone',
  'COBBLESTONE': 'cobblestone',
  'DIRT': 'dirt',
  'GRASS_BLOCK': 'grass-block',
  'OAK_PLANKS': 'oak-planks',
  'OAK_LOG': 'oak-log',
  'GLASS': 'glass',
  'SAND': 'sand',
  'GRAVEL': 'gravel',
  'DIAMOND': 'diamond',
  'EMERALD': 'emerald',
  'GOLD_INGOT': 'gold-ingot',
  'IRON_INGOT': 'iron-ingot',
  'COAL': 'coal',
  'REDSTONE': 'redstone',
  'LAPIS_LAZULI': 'lapis-lazuli',
  'DIAMOND_SWORD': 'diamond-sword',
  'DIAMOND_PICKAXE': 'diamond-pickaxe',
  'BOW': 'bow',
  'ARROW': 'arrow',
  'BREAD': 'bread',
  'APPLE': 'apple',
  'COOKED_BEEF': 'cooked-beef',
  'GOLDEN_APPLE': 'golden-apple',
  'BOOKSHELF': 'bookshelf',
  'CHEST': 'chest',
  'CRAFTING_TABLE': 'crafting-table',
  'FURNACE': 'furnace',
  'TORCH': 'torch',
  'WHITE_WOOL': 'white-wool',
  'RED_WOOL': 'red-wool',
  'BLUE_WOOL': 'blue-wool',
  'GREEN_WOOL': 'green-wool',
  'NETHERITE_INGOT': 'netherite-ingot',
  'ENDER_PEARL': 'ender-pearl',
  'BLAZE_ROD': 'blaze-rod',
  'NETHER_STAR': 'nether-star',
  'BRICKS': 'bricks',
  'STONE_BRICKS': 'stone-bricks',
  'QUARTZ_BLOCK': 'quartz-block',
  'OBSIDIAN': 'obsidian',
  'ANVIL': 'anvil',
  'ENCHANTING_TABLE': 'enchanting-table',
  'BREWING_STAND': 'brewing-stand',
  'BEACON': 'beacon',
  'MINECART': 'minecart',
  'BOAT': 'oak-boat',
  'ELYTRA': 'elytra',
  'BARRIER': 'barrier'
};

// Флаг загрузки полного маппинга
let fullMappingLoaded = false;
let fullMapping = {};

// Функция для получения иконки материала
async function getMaterialIcon(materialId) {
  const upperMaterialId = materialId.toUpperCase();
  
  // Сначала ищем в основном маппинге
  if (CORE_MATERIAL_TO_ICON[upperMaterialId]) {
    return CORE_MATERIAL_TO_ICON[upperMaterialId];
  }
  
  // Если не найден, загружаем полный маппинг
  if (!fullMappingLoaded) {
    try {
      const module = await import('./materials-full.js');
      fullMapping = module.MATERIAL_TO_ICON || {};
      fullMappingLoaded = true;
    } catch (error) {
      console.warn('Could not load full material mapping:', error);
      return null;
    }
  }
  
  return fullMapping[upperMaterialId] || null;
}

// Глобальный MATERIAL_TO_ICON для обратной совместимости
const MATERIAL_TO_ICON = new Proxy({}, {
  get(target, prop) {
    // Сначала проверяем основной маппинг
    if (CORE_MATERIAL_TO_ICON[prop]) {
      return CORE_MATERIAL_TO_ICON[prop];
    }
    
    // Если не найден, пытаемся загрузить из полного маппинга
    // Это синхронная операция, поэтому возвращаем null если полный маппинг не загружен
    if (fullMappingLoaded && fullMapping[prop]) {
      return fullMapping[prop];
    }
    
    return null;
  }
});
let fullDatabaseLoaded = false;
let fullDatabase = [];

// Функция для ленивой загрузки полной базы данных
async function loadFullMaterialsDatabase() {
  if (fullDatabaseLoaded) return fullDatabase;
  
  try {
    console.log('Loading full materials database...');
    const module = await import('./materials-full.js');
    fullDatabase = module.FULL_MATERIALS_DATABASE || [];
    fullDatabaseLoaded = true;
    console.log(`Loaded ${fullDatabase.length} materials from full database`);
    return fullDatabase;
  } catch (error) {
    console.warn('Could not load full materials database:', error);
    return CORE_MATERIALS; // Fallback to core materials
  }
}

// Функция поиска материалов
async function searchMaterials(query, limit = 20) {
  const lowerQuery = query.toLowerCase();
  
  // Сначала ищем в основных материалах
  let results = CORE_MATERIALS.filter(material => 
    material.id.toLowerCase().includes(lowerQuery) ||
    material.name.toLowerCase().includes(lowerQuery) ||
    material.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
  
  // Если нужно больше результатов, загружаем полную базу
  if (results.length < limit && query.length > 1) {
    const fullDb = await loadFullMaterialsDatabase();
    const additionalResults = fullDb.filter(material => 
      !CORE_MATERIALS.find(core => core.id === material.id) && (
        material.id.toLowerCase().includes(lowerQuery) ||
        material.name.toLowerCase().includes(lowerQuery) ||
        material.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
    
    results = [...results, ...additionalResults];
  }
  
  return results.slice(0, limit);
}

// Получение материала по ID
async function getMaterialById(id) {
  // Сначала ищем в основных
  let material = CORE_MATERIALS.find(m => m.id === id);
  if (material) return material;
  
  // Если не найден, ищем в полной базе
  const fullDb = await loadFullMaterialsDatabase();
  return fullDb.find(m => m.id === id);
}

// Экспорт функций
if (typeof window !== 'undefined') {
  window.ScreenGenerator = window.ScreenGenerator || {};
  Object.assign(window.ScreenGenerator, {
    CORE_MATERIALS,
    searchMaterials,
    getMaterialById,
    getMaterialIcon,
    loadFullMaterialsDatabase
  });
  
  // Глобальные переменные для обратной совместимости
  window.MATERIAL_TO_ICON = MATERIAL_TO_ICON;
}