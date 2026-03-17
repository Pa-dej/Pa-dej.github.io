// ═══════════════════════════════════════════════════════════════
// MATERIAL SEARCH AND RENDERING
// ═══════════════════════════════════════════════════════════════

// Цветовая схема для материалов (как fallback)
const MATERIAL_COLORS = {
  'RED_STAINED_GLASS_PANE': '#cc3333',
  'BLUE_STAINED_GLASS_PANE': '#3366cc',
  'GREEN_STAINED_GLASS_PANE': '#33aa44',
  'YELLOW_STAINED_GLASS_PANE': '#ddcc33',
  'PURPLE_STAINED_GLASS_PANE': '#883399',
  'WHITE_STAINED_GLASS_PANE': '#cccccc',
  'BLACK_STAINED_GLASS_PANE': '#111111',
  'STONE': '#888888',
  'DIAMOND': '#44ddcc',
  'GOLD_BLOCK': '#ddaa00',
  'IRON_BLOCK': '#aaaaaa',
  'EMERALD_BLOCK': '#00cc55',
  'GRASS_BLOCK': '#558833',
  'OAK_LOG': '#8a6a3c',
  'BEACON': '#55ddcc',
  'NETHERITE_BLOCK': '#3a2a3a',
  'COMMAND_BLOCK': '#7c3aed',
  'EMERALD': '#00cc55',
  'GOLDEN_APPLE': '#ddaa00',
  'DIAMOND_SWORD': '#44ddcc',
  'IRON_SWORD': '#aaaaaa',
  'BOW': '#8a6a3c',
  'ARROW': '#cccccc',
  'ENDER_PEARL': '#2a4d3a',
  'CRAFTING_TABLE': '#8a6a3c',
  'FURNACE': '#666666',
  'TNT': '#cc3333'
};

// Функция поиска материалов
function searchMaterials(query) {
  if (!query || query.length < 1) return [];
  
  const searchTerm = query.toLowerCase();
  const results = [];
  
  for (const material of MATERIALS_DATABASE) {
    let score = 0;
    
    // Поиск в названии (высокий приоритет)
    if (material.name.toLowerCase().includes(searchTerm)) {
      score += 10;
      if (material.name.toLowerCase().startsWith(searchTerm)) {
        score += 5; // Бонус за начало названия
      }
    }
    
    // Поиск в ID (средний приоритет)
    if (material.id.toLowerCase().includes(searchTerm)) {
      score += 5;
    }
    
    // Поиск в тегах (низкий приоритет)
    for (const tag of material.tags) {
      if (tag.includes(searchTerm)) {
        score += 2;
      }
    }
    
    if (score > 0) {
      results.push({ ...material, score });
    }
  }
  
  // Сортируем по релевантности
  results.sort((a, b) => b.score - a.score);
  
  // Возвращаем максимум 15 результатов
  return results.slice(0, 15);
}

// Функция для получения цвета материала
function getMaterialColor(material) {
  return MATERIAL_COLORS[material.toUpperCase()] || '#7c3aed';
}

// Функция для получения короткого названия материала
function getShortName(material) {
  const name = material.replace(/_/g, ' ').toLowerCase();
  const words = name.split(' ');
  if (words.length === 1) {
    return words[0].slice(0, 4).toUpperCase();
  }
  return words.map(w => w.charAt(0)).join('').toUpperCase().slice(0, 4);
}

// Функция для определения светлый ли цвет
function isLightColor(color) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155;
}

// Функция для создания цветной иконки с текстом (fallback)
function createColoredIcon(material, size = 32) {
  const color = getMaterialColor(material);
  const shortName = getShortName(material);
  const textColor = isLightColor(color) ? '#000' : '#fff';
  
  return `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cascadia Code', monospace;
      font-size: ${Math.max(6, size/5)}px;
      font-weight: bold;
      color: ${textColor};
      text-align: center;
      line-height: 1;
      image-rendering: pixelated;
    " title="${material}">${shortName}</div>
  `;
}

// Основная функция для получения визуального рендера
function getMinecraftRender(material, size = 32) {
  if (!material) {
    return `<div style="width:${size}px;height:${size}px;background:#666;border-radius:2px;"></div>`;
  }
  
  // Проверяем, есть ли CSS иконка для этого материала
  const iconClass = MATERIAL_TO_ICON[material.toUpperCase()];
  
  if (iconClass) {
    // Используем CSS иконку GamerGeeks в естественном размере
    if (size <= 16) {
      // Для маленьких размеров используем icon-minecraft-sm (16px)
      return `<i class="icon-minecraft-sm icon-minecraft-${iconClass}" title="${material}"></i>`;
    } else {
      // Для всех остальных размеров используем стандартную иконку (32px)
      return `<i class="icon-minecraft icon-minecraft-${iconClass}" title="${material}"></i>`;
    }
  } else {
    // Fallback к цветной иконке
    return createColoredIcon(material, size);
  }
}

// Функция для получения блока (для совместимости)
function getMinecraftBlock(material) {
  return getMinecraftRender(material, 32);
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  searchMaterials,
  getMaterialColor,
  getShortName,
  isLightColor,
  createColoredIcon,
  getMinecraftRender,
  getMinecraftBlock,
  MATERIAL_COLORS
});