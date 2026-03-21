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

// Функция поиска материалов (использует систему из materials-core.js)
async function searchMaterials(query) {
  if (!query || query.length < 1) return [];
  
  console.log('Searching for:', query);
  
  // Проверяем доступность функции из materials-core.js
  if (window.ScreenGenerator && window.ScreenGenerator.searchMaterials && window.ScreenGenerator.searchMaterials !== searchMaterials) {
    console.log('Using materials-core.js search');
    try {
      const results = await window.ScreenGenerator.searchMaterials(query, 15);
      console.log('Search results from materials-core:', results);
      return results;
    } catch (error) {
      console.warn('Error in materials-core search:', error);
    }
  }
  
  // Fallback если materials-core.js не загружен - используем CORE_MATERIALS
  console.log('Using fallback search with CORE_MATERIALS');
  const lowerQuery = query.toLowerCase();
  const coreResults = window.ScreenGenerator?.CORE_MATERIALS?.filter(material => 
    material.id.toLowerCase().includes(lowerQuery) ||
    material.name.toLowerCase().includes(lowerQuery) ||
    material.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  ) || [];
  
  console.log('Fallback search results:', coreResults);
  return coreResults.slice(0, 15);
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

// Основная функция для получения визуального рендера с поддержкой lazy loading
async function getMinecraftRender(material, size = 32) {
  if (!material) {
    return `<div style="width:${size}px;height:${size}px;background:#666;border-radius:2px;"></div>`;
  }
  
  // Получаем иконку через систему materials-core.js
  let iconClass = null;
  
  if (window.ScreenGenerator && window.ScreenGenerator.getMaterialIcon) {
    try {
      iconClass = await window.ScreenGenerator.getMaterialIcon(material);
    } catch (error) {
      console.warn('Error getting material icon:', error);
    }
  }
  
  // Если иконка найдена, используем её
  if (iconClass) {
    if (size <= 16) {
      return `<i class="icon-minecraft-sm icon-minecraft-${iconClass}" title="${material}"></i>`;
    } else {
      return `<i class="icon-minecraft icon-minecraft-${iconClass}" title="${material}"></i>`;
    }
  }
  
  // Fallback к цветной иконке
  return createColoredIcon(material, size);
}

// Синхронная версия для обратной совместимости
function getMinecraftRenderSync(material, size = 32) {
  if (!material) {
    return `<div style="width:${size}px;height:${size}px;background:#666;border-radius:2px;"></div>`;
  }
  
  // Проверяем глобальный MATERIAL_TO_ICON
  const iconClass = window.MATERIAL_TO_ICON && window.MATERIAL_TO_ICON[material.toUpperCase()];
  
  if (iconClass) {
    if (size <= 16) {
      return `<i class="icon-minecraft-sm icon-minecraft-${iconClass}" title="${material}"></i>`;
    } else {
      return `<i class="icon-minecraft icon-minecraft-${iconClass}" title="${material}"></i>`;
    }
  }
  
  // Попробуем получить иконку из materials-core.js синхронно
  if (window.ScreenGenerator && window.ScreenGenerator.getMaterialIcon) {
    // Для синхронной версии попробуем получить иконку, но не ждем
    window.ScreenGenerator.getMaterialIcon(material).then(iconClass => {
      if (iconClass) {
        // Обновляем все элементы с этим материалом после загрузки
        updateMaterialIconsInDOM(material, iconClass, size);
      }
    }).catch(() => {
      // Игнорируем ошибки в синхронной версии
    });
  }
  
  // Fallback к цветной иконке
  return createColoredIcon(material, size);
}

// Функция для обновления иконок в DOM после асинхронной загрузки
function updateMaterialIconsInDOM(material, iconClass, size) {
  // Обновляем все элементы с этим материалом
  const elements = document.querySelectorAll(`[title="${material}"]`);
  elements.forEach(element => {
    if (element.tagName === 'I' && element.className.includes('icon-minecraft')) {
      // Это наша цветная иконка-заглушка, заменяем на настоящую
      const newIcon = size <= 16 
        ? `<i class="icon-minecraft-sm icon-minecraft-${iconClass}" title="${material}"></i>`
        : `<i class="icon-minecraft icon-minecraft-${iconClass}" title="${material}"></i>`;
      element.outerHTML = newIcon;
    } else if (element.style && element.style.background) {
      // Это цветная div-заглушка, заменяем на иконку
      const newIcon = size <= 16 
        ? `<i class="icon-minecraft-sm icon-minecraft-${iconClass}" title="${material}"></i>`
        : `<i class="icon-minecraft icon-minecraft-${iconClass}" title="${material}"></i>`;
      element.outerHTML = newIcon;
    }
  });
  
  // Принудительно обновляем canvas если материал используется
  if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') {
    const { widgets } = window.ScreenGenerator;
    const materialUsed = widgets.some(w => w.material === material);
    if (materialUsed) {
      window.ScreenGenerator.render();
    }
  }
}

// Функция для получения блока (для совместимости)
function getMinecraftBlock(material) {
  return getMinecraftRenderSync(material, 32);
}

// Экспорт функций
const existingSearchMaterials = window.ScreenGenerator?.searchMaterials;

Object.assign(window.ScreenGenerator, {
  getMaterialColor,
  getShortName,
  isLightColor,
  createColoredIcon,
  getMinecraftRender: getMinecraftRenderSync, // Используем синхронную версию по умолчанию
  getMinecraftRenderAsync: getMinecraftRender, // Асинхронная версия доступна отдельно
  getMinecraftBlock,
  updateMaterialIconsInDOM,
  MATERIAL_COLORS
});

// Добавляем searchMaterials только если его еще нет
if (!existingSearchMaterials) {
  window.ScreenGenerator.searchMaterials = searchMaterials;
  console.log('Added fallback searchMaterials function');
} else {
  console.log('Using existing searchMaterials from materials-core.js');
}

// Тестируем доступность материалов
console.log('CORE_MATERIALS available:', !!window.ScreenGenerator?.CORE_MATERIALS);
console.log('searchMaterials function:', typeof window.ScreenGenerator?.searchMaterials);
if (window.ScreenGenerator?.CORE_MATERIALS) {
  console.log('First few core materials:', window.ScreenGenerator.CORE_MATERIALS.slice(0, 3));
}