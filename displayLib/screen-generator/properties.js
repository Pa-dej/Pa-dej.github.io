// ═══════════════════════════════════════════════════════════════
// PROPERTIES PANEL MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Константы для материалов и действий
const MATS = [
  // Блоки
  'STONE', 'GRANITE', 'POLISHED_GRANITE', 'DIORITE', 'POLISHED_DIORITE', 'ANDESITE', 'POLISHED_ANDESITE',
  'GRASS_BLOCK', 'DIRT', 'COARSE_DIRT', 'PODZOL', 'COBBLESTONE', 'OAK_PLANKS', 'SPRUCE_PLANKS', 'BIRCH_PLANKS',
  'JUNGLE_PLANKS', 'ACACIA_PLANKS', 'DARK_OAK_PLANKS', 'MANGROVE_PLANKS', 'CHERRY_PLANKS', 'BAMBOO_PLANKS',
  'CRIMSON_PLANKS', 'WARPED_PLANKS', 'OAK_LOG', 'SPRUCE_LOG', 'BIRCH_LOG', 'JUNGLE_LOG', 'ACACIA_LOG',
  'DARK_OAK_LOG', 'MANGROVE_LOG', 'CHERRY_LOG', 'CRIMSON_STEM', 'WARPED_STEM', 'STRIPPED_OAK_LOG',
  'STRIPPED_SPRUCE_LOG', 'STRIPPED_BIRCH_LOG', 'STRIPPED_JUNGLE_LOG', 'STRIPPED_ACACIA_LOG',
  'STRIPPED_DARK_OAK_LOG', 'STRIPPED_MANGROVE_LOG', 'STRIPPED_CHERRY_LOG', 'STRIPPED_CRIMSON_STEM',
  'STRIPPED_WARPED_STEM', 'SAND', 'RED_SAND', 'GRAVEL', 'COAL_ORE', 'DEEPSLATE_COAL_ORE', 'IRON_ORE',
  'DEEPSLATE_IRON_ORE', 'COPPER_ORE', 'DEEPSLATE_COPPER_ORE', 'GOLD_ORE', 'DEEPSLATE_GOLD_ORE',
  'REDSTONE_ORE', 'DEEPSLATE_REDSTONE_ORE', 'EMERALD_ORE', 'DEEPSLATE_EMERALD_ORE', 'LAPIS_ORE',
  'DEEPSLATE_LAPIS_ORE', 'DIAMOND_ORE', 'DEEPSLATE_DIAMOND_ORE', 'NETHER_GOLD_ORE', 'NETHER_QUARTZ_ORE',
  'ANCIENT_DEBRIS', 'COAL_BLOCK', 'RAW_IRON_BLOCK', 'RAW_COPPER_BLOCK', 'RAW_GOLD_BLOCK', 'IRON_BLOCK',
  'COPPER_BLOCK', 'GOLD_BLOCK', 'DIAMOND_BLOCK', 'EMERALD_BLOCK', 'LAPIS_BLOCK', 'REDSTONE_BLOCK',
  'NETHERITE_BLOCK', 'OBSIDIAN', 'CRYING_OBSIDIAN', 'BEDROCK', 'SPONGE', 'WET_SPONGE',
  
  // Стекло
  'GLASS', 'TINTED_GLASS', 'WHITE_STAINED_GLASS', 'ORANGE_STAINED_GLASS', 'MAGENTA_STAINED_GLASS',
  'LIGHT_BLUE_STAINED_GLASS', 'YELLOW_STAINED_GLASS', 'LIME_STAINED_GLASS', 'PINK_STAINED_GLASS',
  'GRAY_STAINED_GLASS', 'LIGHT_GRAY_STAINED_GLASS', 'CYAN_STAINED_GLASS', 'PURPLE_STAINED_GLASS',
  'BLUE_STAINED_GLASS', 'BROWN_STAINED_GLASS', 'GREEN_STAINED_GLASS', 'RED_STAINED_GLASS', 'BLACK_STAINED_GLASS',
  
  // Стеклянные панели
  'GLASS_PANE', 'WHITE_STAINED_GLASS_PANE', 'ORANGE_STAINED_GLASS_PANE', 'MAGENTA_STAINED_GLASS_PANE',
  'LIGHT_BLUE_STAINED_GLASS_PANE', 'YELLOW_STAINED_GLASS_PANE', 'LIME_STAINED_GLASS_PANE', 'PINK_STAINED_GLASS_PANE',
  'GRAY_STAINED_GLASS_PANE', 'LIGHT_GRAY_STAINED_GLASS_PANE', 'CYAN_STAINED_GLASS_PANE', 'PURPLE_STAINED_GLASS_PANE',
  'BLUE_STAINED_GLASS_PANE', 'BROWN_STAINED_GLASS_PANE', 'GREEN_STAINED_GLASS_PANE', 'RED_STAINED_GLASS_PANE',
  'BLACK_STAINED_GLASS_PANE',
  
  // Шерсть и терракота
  'WHITE_WOOL', 'ORANGE_WOOL', 'MAGENTA_WOOL', 'LIGHT_BLUE_WOOL', 'YELLOW_WOOL', 'LIME_WOOL', 'PINK_WOOL',
  'GRAY_WOOL', 'LIGHT_GRAY_WOOL', 'CYAN_WOOL', 'PURPLE_WOOL', 'BLUE_WOOL', 'BROWN_WOOL', 'GREEN_WOOL',
  'RED_WOOL', 'BLACK_WOOL', 'TERRACOTTA', 'WHITE_TERRACOTTA', 'ORANGE_TERRACOTTA', 'MAGENTA_TERRACOTTA',
  'LIGHT_BLUE_TERRACOTTA', 'YELLOW_TERRACOTTA', 'LIME_TERRACOTTA', 'PINK_TERRACOTTA', 'GRAY_TERRACOTTA',
  'LIGHT_GRAY_TERRACOTTA', 'CYAN_TERRACOTTA', 'PURPLE_TERRACOTTA', 'BLUE_TERRACOTTA', 'BROWN_TERRACOTTA',
  'GREEN_TERRACOTTA', 'RED_TERRACOTTA', 'BLACK_TERRACOTTA',
  
  // Функциональные блоки
  'CRAFTING_TABLE', 'FURNACE', 'BLAST_FURNACE', 'SMOKER', 'CHEST', 'TRAPPED_CHEST', 'ENDER_CHEST',
  'BARREL', 'SHULKER_BOX', 'BEACON', 'CONDUIT', 'ANVIL', 'CHIPPED_ANVIL', 'DAMAGED_ANVIL',
  'ENCHANTING_TABLE', 'BOOKSHELF', 'LECTERN', 'CAULDRON', 'BREWING_STAND', 'HOPPER', 'DISPENSER',
  'DROPPER', 'OBSERVER', 'PISTON', 'STICKY_PISTON', 'REDSTONE_LAMP', 'TNT', 'SLIME_BLOCK', 'HONEY_BLOCK',
  'COMMAND_BLOCK', 'REPEATING_COMMAND_BLOCK', 'CHAIN_COMMAND_BLOCK', 'STRUCTURE_BLOCK', 'JIGSAW',
  'COMPOSTER', 'CARTOGRAPHY_TABLE', 'FLETCHING_TABLE', 'SMITHING_TABLE', 'STONECUTTER', 'LOOM',
  'GRINDSTONE', 'BELL', 'LANTERN', 'SOUL_LANTERN', 'CAMPFIRE', 'SOUL_CAMPFIRE', 'RESPAWN_ANCHOR',
  'LODESTONE', 'TARGET', 'LIGHTNING_ROD', 'SCULK_SENSOR', 'CALIBRATED_SCULK_SENSOR',
  
  // Предметы
  'DIAMOND', 'EMERALD', 'IRON_INGOT', 'GOLD_INGOT', 'NETHERITE_INGOT', 'COAL', 'CHARCOAL', 'REDSTONE',
  'LAPIS_LAZULI', 'QUARTZ', 'AMETHYST_SHARD', 'PRISMARINE_SHARD', 'PRISMARINE_CRYSTALS', 'BLAZE_ROD',
  'BLAZE_POWDER', 'ENDER_PEARL', 'ENDER_EYE', 'NETHER_STAR', 'TOTEM_OF_UNDYING', 'ELYTRA',
  'GOLDEN_APPLE', 'ENCHANTED_GOLDEN_APPLE', 'APPLE', 'BREAD', 'COOKED_BEEF', 'COOKED_PORKCHOP',
  'COOKED_CHICKEN', 'COOKED_COD', 'COOKED_SALMON', 'CAKE', 'COOKIE', 'PUMPKIN_PIE',
  
  // Инструменты и оружие
  'DIAMOND_SWORD', 'IRON_SWORD', 'GOLDEN_SWORD', 'STONE_SWORD', 'WOODEN_SWORD', 'NETHERITE_SWORD',
  'DIAMOND_PICKAXE', 'IRON_PICKAXE', 'GOLDEN_PICKAXE', 'STONE_PICKAXE', 'WOODEN_PICKAXE', 'NETHERITE_PICKAXE',
  'DIAMOND_AXE', 'IRON_AXE', 'GOLDEN_AXE', 'STONE_AXE', 'WOODEN_AXE', 'NETHERITE_AXE',
  'DIAMOND_SHOVEL', 'IRON_SHOVEL', 'GOLDEN_SHOVEL', 'STONE_SHOVEL', 'WOODEN_SHOVEL', 'NETHERITE_SHOVEL',
  'DIAMOND_HOE', 'IRON_HOE', 'GOLDEN_HOE', 'STONE_HOE', 'WOODEN_HOE', 'NETHERITE_HOE',
  'BOW', 'CROSSBOW', 'ARROW', 'SPECTRAL_ARROW', 'TIPPED_ARROW', 'TRIDENT', 'SHIELD',
  'FISHING_ROD', 'CARROT_ON_A_STICK', 'WARPED_FUNGUS_ON_A_STICK', 'FLINT_AND_STEEL', 'SHEARS',
  'COMPASS', 'CLOCK', 'SPYGLASS', 'MAP', 'FILLED_MAP', 'RECOVERY_COMPASS'
];

const ACTS=['NONE','CLOSE_SCREEN','SWITCH_SCREEN','RUN_SCRIPT'];
const PRESET_OPTIONS=['SCALE','LIFT'];
const HOVER_ANIMATION_TYPES=['NONE','PRESET','SCALE','TRANSLATE','ROTATE','COMBINED','PULSE_CONTINUOUS'];
const COMBINED_EFFECT_TYPES=['SCALE','TRANSLATE','ROTATE','PRESET'];

// Утилиты для работы с цветами
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Утилиты для создания элементов формы
const row=(lbl,inp)=>`<div class="prow"><div class="plabel">${lbl}</div>${inp}</div>`;
const numIn=(id,v,step=0.05,min='')=>`<input class="pinput" type="number" id="${id}" value="${typeof v==='number'?+v.toFixed(4):v}" step="${step}" ${min!==''?`min="${min}"`:''}  >`;
const txtIn=(id,v)=>`<input class="pinput" type="text" id="${id}" value="${v}">`;
const txtAreaIn=(id,v)=>{
  // Экранируем HTML и заменяем \n на \\n для отображения в textarea
  const escaped = (v || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<textarea class="pinput ptextarea" id="${id}" rows="3" placeholder="Введите текст. Используйте \\n для переноса строк">${escaped}</textarea>`;
};
const selIn=(id,v,opts)=>`<select class="pselect" id="${id}">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`;
const colIn=(id,v)=>`<input class="pinput" type="color" id="${id}" value="${v}">`;
const bind=(id,fn)=>{
  const el=document.getElementById(id);
  if(el) {
    // Предотвращаем удаление виджетов при работе с полями ввода
    el.addEventListener('keydown', e => {
      // Останавливаем всплытие событий Delete и Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.stopPropagation();
      }
    });
    
    el.addEventListener('input',e=>{
      const value = e.target.value;
      
      // Для числовых полей разрешаем пустые значения и обрабатываем их как 0
      if (el.type === 'number') {
        if (value === '' || value === null || value === undefined) {
          // Не вызываем fn для пустых значений, позволяем пользователю ввести новое число
          return;
        }
      }
      
      fn(value);
      
      // Сохраняем в историю с debounce
      clearTimeout(window.ScreenGenerator._propertyChangeTimeout);
      window.ScreenGenerator._propertyChangeTimeout = setTimeout(() => {
        if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
          window.ScreenGenerator.saveState(`Change property (${id})`);
        }
      }, 1000); // 1 секунда задержки для группировки изменений
    });
    
    // Обработка потери фокуса для числовых полей
    if (el.type === 'number') {
      el.addEventListener('blur', e => {
        const value = e.target.value;
        if (value === '' || value === null || value === undefined) {
          // При потере фокуса устанавливаем значение по умолчанию
          const defaultValue = el.min !== '' ? parseFloat(el.min) : 0;
          el.value = defaultValue;
          fn(defaultValue);
        }
      });
    }
  }
};

// Функция для создания опции селекта с визуальным рендером
function createMaterialOption(material, selected = false) {
  return `<option value="${material}" ${selected ? 'selected' : ''}>${material}</option>`;
}

// Функция для создания селекта материалов с превью и поиском
function createMaterialSelect(id, currentValue) {
  return `
    <div class="material-search-container">
      <div class="input-group">
        <div class="input-group-addon">
          <i class="fa-fw fas fa-search"></i>
        </div>
        <input type="text" id="${id}_search" class="form-control" placeholder="Search..." autocomplete="off">
        <ul class="dropdown-menu" id="${id}_results" style="display: none;"></ul>
      </div>
      <input type="hidden" id="${id}" value="${currentValue}">
    </div>
    <div style="text-align:center;margin-top:8px;" id="${id}_preview">
      ${window.ScreenGenerator.getMinecraftRender(currentValue, 24)}
    </div>
  `;
}

// Функция для фильтрации материалов по поиску
function filterMaterials(searchTerm) {
  if (!searchTerm) return MATS;
  
  const term = searchTerm.toLowerCase();
  return MATS.filter(mat => 
    mat.toLowerCase().includes(term) ||
    mat.replace(/_/g, ' ').toLowerCase().includes(term)
  );
}

// Основная функция обновления панели свойств
function updateProps(){
  const { selectedId, background, widgets } = window.ScreenGenerator;
  
  const p=document.getElementById('propPanel');
  
  // Сохраняем информацию о текущем фокусе
  const activeElement = document.activeElement;
  const activeId = activeElement ? activeElement.id : null;
  const selectionStart = activeElement && activeElement.setSelectionRange ? activeElement.selectionStart : null;
  const selectionEnd = activeElement && activeElement.setSelectionRange ? activeElement.selectionEnd : null;
  const isInputFocused = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');
  
  // Если поле ввода в фокусе, не обновляем интерфейс
  if (isInputFocused && activeElement.closest('#propPanel')) {
    return;
  }
  
  if(!selectedId){
    p.innerHTML='<div class="nsm">Выберите элемент<br>для редактирования</div>';
    return;
  }
  
  if(selectedId==='__bg__') {
    renderBgProps(p);
  } else {
    const w=widgets.find(x=>x.id===selectedId);
    if(w) renderWProps(p,w);
  }
  
  // Восстанавливаем фокус только если он был в панели свойств
  if (activeId && activeId.startsWith('w_') || activeId.startsWith('bg_')) {
    setTimeout(() => {
      const newActiveElement = document.getElementById(activeId);
      if (newActiveElement) {
        newActiveElement.focus();
        if (newActiveElement.setSelectionRange && selectionStart !== null) {
          newActiveElement.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }, 0);
  }
}

// Функция для обновления только значений фона без пересоздания элементов
function updateBgValues() {
  const { background } = window.ScreenGenerator;
  if (!background) return;
  
  const updateField = (id, value) => {
    const el = document.getElementById(id);
    if (el && el !== document.activeElement) {
      el.value = typeof value === 'number' ? value.toFixed(4) : value;
    }
  };
  
  updateField('bg_w', background.w);
  updateField('bg_h', background.h);
  updateField('bg_col', background.colorHex);
  updateField('bg_alpha', background.alpha);
  updateField('bg_px', background.posX);
  updateField('bg_py', background.posY);
  updateField('bg_tx', background.transX);
  updateField('bg_ty', background.transY);
  updateField('bg_tz', background.transZ || 0);
}

// Функция для обновления только значений виджета без пересоздания элементов
function updateWidgetValues(w) {
  const updateField = (id, value) => {
    const el = document.getElementById(id);
    if (el && el !== document.activeElement) {
      el.value = typeof value === 'number' ? value.toFixed(4) : value;
    }
  };
  
  updateField('w_id', w.id);
  updateField('w_x', w.x);
  updateField('w_y', w.y);
  updateField('w_tx', w.transX || 0);
  updateField('w_ty', w.transY || 0);
  updateField('w_tz', w.transZ || 0);
  updateField('w_w', w.w);
  updateField('w_h', w.h);
  
  if (w.type === 'TEXT_BUTTON') {
    updateField('w_txt', w.text);
    updateField('w_hover', w.hoveredText || '');
    updateField('w_col', w.color);
    updateField('w_align', w.alignment || 'CENTERED');
    
    if (w.backgroundColor) {
      updateField('w_bgColor', rgbToHex(w.backgroundColor[0], w.backgroundColor[1], w.backgroundColor[2]));
    }
    updateField('w_bgAlpha', w.backgroundAlpha !== undefined ? w.backgroundAlpha : 150);
    
    if (w.hoveredBackgroundColor) {
      updateField('w_hbgColor', rgbToHex(w.hoveredBackgroundColor[0], w.hoveredBackgroundColor[1], w.hoveredBackgroundColor[2]));
    }
    updateField('w_hbgAlpha', w.hoveredBackgroundAlpha !== undefined ? w.hoveredBackgroundAlpha : 0);
    
    // Tooltip поля
    updateField('w_tooltip', w.tooltip || '');
    updateField('w_tooltipDelay', w.tooltipDelay !== undefined ? w.tooltipDelay : 10);
  }
  
  updateField('w_act', w.onClick);
  updateField('w_func', w.clickFunction || '');
  updateField('w_target', w.switchTarget || '');
  updateField('w_tolH', w.tolerance[0]);
  updateField('w_tolV', w.tolerance[1]);
}

function renderBgProps(p){
  const { background, hexRgb } = window.ScreenGenerator;
  const bg=background;
  const autoX=-(bg.w*8)/80;
  const finXInEditor=(bg.posX+bg.transX).toFixed(3); // позиция в редакторе (БЕЗ autoX)
  const finXInGame=(bg.posX+bg.transX+autoX).toFixed(3); // финальная позиция в игре (С autoX)
  const finY=(bg.posY+bg.transY).toFixed(3);
  
  p.innerHTML=`
    <div class="pgroup">
      <div class="pgtitle">Background</div>
      <div class="pgbody">
        <div class="phint">
          Anchor: <span class="hl">center-X, bottom-Y</span><br>
          AutoX = -(${bg.w}×8)/80 = <span class="hl">${autoX.toFixed(4)}</span> (только в игре)<br>
          Редактор: X=<span class="hl">${finXInEditor}</span> Y=<span class="hl">${finY}</span><br>
          В игре: X=<span class="hl">${finXInGame}</span> Y=<span class="hl">${finY}</span>
        </div>
        ${row('Ширина', numIn('bg_w',bg.w,0.5,0.5))}
        ${row('Высота', numIn('bg_h',bg.h,0.5,0.5))}
        ${row('Цвет', colIn('bg_col',bg.colorHex))}
        ${row('Alpha', `
          <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
            <input class="pinput" type="range" id="bg_al" min="0" max="255" value="${bg.alpha}" style="flex:1;min-width:0;">
            <input class="pinput" type="number" id="bg_al_num" min="0" max="255" value="${bg.alpha}" style="width:40px;flex-shrink:0;font-size:9px;">
          </div>
        `)}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">position[] — мировая позиция entity</div>
      <div class="pgbody">
        <div class="phint"><span class="wa">position = где стоит Display entity в мире</span><br>Смещение от центра экрана игрока</div>
        <div class="prow">
          <label style="display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text2);cursor:pointer;">
            <input type="checkbox" id="bg_lock" ${bg.locked ? 'checked' : ''} style="accent-color:var(--accent)">
            🔒 Заблокировать перемещение
          </label>
        </div>
        ${row('posX', numIn('bg_px',bg.posX))}
        ${row('posY', numIn('bg_py',bg.posY))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">translation[] — Transformation сдвиг</div>
      <div class="pgbody">
        <div class="phint"><span class="ok">translation = локальный сдвиг модели внутри entity</span><br>
        В игре добавляется autoX: <span class="hl">-${((bg.w*8)/80).toFixed(3)}</span><br>
        Для центрирования Y: transY = <span class="hl">-h/2 = ${(-bg.h/2).toFixed(2)}</span></div>
        ${row('transX', numIn('bg_tx',bg.transX))}
        ${row('transY', numIn('bg_ty',bg.transY))}
        ${row('transZ', numIn('bg_tz',bg.transZ||0))}
        <div class="phint" style="cursor:pointer" onclick="navigator.clipboard.writeText('[${bg.w*8}, ${bg.h*4}, 1]').then(() => showCopyToast())" title="Нажмите чтобы скопировать">YAML scale: <span class="hl">[${bg.w*8}, ${bg.h*4}, 1]</span> 📋</div>
        <div class="phint">
          Размер фона: <span class="hl">${bg.w} × ${bg.h} блока</span><br>
          Простой прямоугольник без текстовых расчетов
        </div>
      </div>
    </div>`;
    
  bind('bg_w',v=>{background.w=Math.max(0.5,parseFloat(v)||1);if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('bg_h',v=>{background.h=Math.max(0.5,parseFloat(v)||1);if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('bg_col',v=>{background.colorHex=v;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  
  // Улучшенные обработчики для alpha слайдера
  const alphaSlider = document.getElementById('bg_al');
  const alphaNumber = document.getElementById('bg_al_num');
  
  if (alphaSlider && alphaNumber) {
    // Обработчик слайдера
    alphaSlider.addEventListener('input', e => {
      const value = parseInt(e.target.value);
      background.alpha = value;
      alphaNumber.value = value;
      if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();
    });
    
    // Обработчик числового поля
    alphaNumber.addEventListener('input', e => {
      const value = Math.max(0, Math.min(255, parseInt(e.target.value) || 0));
      background.alpha = value;
      alphaSlider.value = value;
      alphaNumber.value = value; // Корректируем значение если вышло за границы
      if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();
    });
  }
  
  bind('bg_px',v=>{background.posX=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  bind('bg_py',v=>{background.posY=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  bind('bg_tx',v=>{background.transX=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  bind('bg_ty',v=>{background.transY=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('bg_tz',v=>{background.transZ=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();});
  
  // Обработчик для галочки блокировки
  const lockCheckbox = document.getElementById('bg_lock');
  if (lockCheckbox) {
    lockCheckbox.addEventListener('change', e => {
      background.locked = e.target.checked;
    });
  }
}

function renderWProps(p,w){
  const isText=w.type==='TEXT_BUTTON';
  const screenType = document.getElementById('screenType')?.value || 'PRIVATE';
  const isPrivateScreen = screenType === 'PRIVATE';

  // В текущем плагине TRANSFORM не применяется в hover, поэтому конвертируем старые конфиги в SCALE.
  if (w.hoverAnimation?.type === 'TRANSFORM') {
    const legacyScale = Array.isArray(w.hoverAnimation.scaleVector) && w.hoverAnimation.scaleVector.length === 3
      ? w.hoverAnimation.scaleVector
      : [1.1, 1.1, 1.0];
    w.hoverAnimation.type = 'SCALE';
    w.hoverAnimation.scale = [legacyScale[0], legacyScale[1], legacyScale[2]];
    delete w.hoverAnimation.translation;
    delete w.hoverAnimation.leftRotation;
    delete w.hoverAnimation.scaleVector;
    delete w.hoverAnimation.rightRotation;
  }

  const yamlScaleStr=isText?`[${+(w.w*8).toFixed(2)}, ${+(w.h*4).toFixed(2)}, 1]`:`[${+w.w.toFixed(2)}, ${+w.h.toFixed(2)}, 0.01]`;
  
  // Материал с визуальным селектом
  const materialSelect = !isText ? `
    <div class="prow">
      <div class="plabel">Material</div>
      <div style="flex:1;">
        ${createMaterialSelect('w_mat', w.material)}
      </div>
    </div>
  ` : '';
  
  // Дополнительные поля для TEXT_BUTTON
  const textFields = isText ? `
    ${row('Текст',txtAreaIn('w_txt',w.text))}
    ${row('Выравнивание',selIn('w_align',w.alignment||'CENTERED',['LEFT','CENTERED','RIGHT']))}
    ${isPrivateScreen ? row('Hover текст',txtAreaIn('w_hover',w.hoveredText||'')) : ''}
  ` : '';
  
  // Поля backgroundColor и backgroundAlpha для TEXT_BUTTON
  const backgroundFields = isText ? `
    <div class="pgroup">
      <div class="pgtitle">Фон кнопки</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Цвет и прозрачность фона кнопки</span>
        </div>
        ${row('Цвет фона', colIn('w_bgColor', w.backgroundColor ? rgbToHex(w.backgroundColor[0], w.backgroundColor[1], w.backgroundColor[2]) : '#283c50'))}
        ${row('Прозрачность', numIn('w_bgAlpha', w.backgroundAlpha || 150, 1, 0, 255))}
      </div>
    </div>
    ${isPrivateScreen ? `<div class="pgroup">
      <div class="pgtitle">Фон при наведении</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Цвет и прозрачность фона при hover</span>
        </div>
        ${row('Цвет hover', colIn('w_hbgColor', w.hoveredBackgroundColor ? rgbToHex(w.hoveredBackgroundColor[0], w.hoveredBackgroundColor[1], w.hoveredBackgroundColor[2]) : '#3c3c3c'))}
        ${row('Прозрачность hover', numIn('w_hbgAlpha', w.hoveredBackgroundAlpha || 0, 1, 0, 255))}
      </div>
    </div>` : ''}
  ` : '';
  
  // Заголовок без эмодзи
  const widgetTitle = isText ? 'TEXT_BUTTON' : 'ITEM_BUTTON';
  
  p.innerHTML=`
    <div class="pgroup">
      <div class="pgtitle">${widgetTitle}</div>
      <div class="pgbody">
        ${row('ID', txtIn('w_id',w.id))}
        ${materialSelect}
        ${textFields}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">position[] — мировая позиция entity</div>
      <div class="pgbody">
        <div class="phint">
          <span class="wa">Где стоит Display entity в мире</span><br>
          Anchor: <span class="hl">${isText?'center-X, bottom-Y':'center'}</span><br>
          <span class="ok">⬤</span> голубая точка на холсте = эта позиция
        </div>
        ${row('X', numIn('w_x',w.x))}
        ${row('Y', numIn('w_y',w.y))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">translation[] — Transformation сдвиг</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Локальный сдвиг модели внутри entity</span><br>
          НЕ меняет мировую позицию!${isText?`<br>Для центрирования по Y: <span class="hl">${(-w.h/2).toFixed(3)}</span>`:''}
        </div>
        ${row('transX', numIn('w_tx',w.transX||0))}
        ${row('transY', numIn('w_ty',w.transY||0))}
        ${row('transZ', numIn('w_tz',w.transZ||0))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">Размер (блоки)</div>
      <div class="pgbody">
        ${row('Ширина', numIn('w_w',w.w,0.125,0.125))}
        ${row('Высота', numIn('w_h',w.h,0.125,0.125))}
        <div class="phint" style="cursor:pointer" onclick="navigator.clipboard.writeText('${yamlScaleStr}').then(() => showCopyToast())" title="Нажмите чтобы скопировать">YAML scale: <span class="hl">${yamlScaleStr}</span> 📋</div>
        ${isText ? `<div class="phint">
          Реальный размер фона в игре:<br>
          <span class="hl">${(() => {
            const wSize = window.ScreenGenerator.mcBgSizeBlocks(w.text || ' ', w.w * 8, w.h * 4);
            return wSize.w.toFixed(4) + ' × ' + wSize.h.toFixed(4) + ' блока';
          })()}</span><br>
          Текст "${w.text || ''}" → ${window.ScreenGenerator.mcMeasureWidth(w.text || '')}px широкий
        </div>` : ''}
      </div>
    </div>
    ${backgroundFields}
    <div class="pgroup">
      <div class="pgtitle">Зона толерантности</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Эллипс вокруг кнопки</span><br>
          Показывается <span class="hl">оранжевым пунктиром</span> при выборе
        </div>
        ${row('Гориз.', numIn('w_tolH',w.tolerance[0],0.05,0))}
        ${row('Верт.', numIn('w_tolV',w.tolerance[1],0.05,0))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">onClick</div>
      <div class="pgbody">
        ${row('action', selIn('w_act',w.onClick,ACTS))}
        ${w.onClick === 'RUN_SCRIPT' ? row('function', txtIn('w_func', w.clickFunction || `${w.id}_click`)) : ''}
        ${w.onClick === 'SWITCH_SCREEN' ? row('target', txtIn('w_target', w.switchTarget || 'target_screen_id')) : ''}
        <div class="phint">
          ${w.onClick === 'NONE' ? '<span class="ok">Кнопка не выполняет действий</span>' : ''}
          ${w.onClick === 'CLOSE_SCREEN' ? '<span class="ok">Закрывает текущий экран</span>' : ''}
          ${w.onClick === 'SWITCH_SCREEN' ? '<span class="wa">Переключает на другой экран</span>' : ''}
          ${w.onClick === 'RUN_SCRIPT' ? '<span class="hl">Требует Lua скрипт и секцию scripts: в YAML</span>' : ''}
        </div>
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">Подсказка (Tooltip)</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Всплывающая подсказка при наведении</span>
        </div>
        ${row('Текст подсказки',txtAreaIn('w_tooltip',w.tooltip||''))}
        ${row('Задержка (тики)', numIn('w_tooltipDelay', w.tooltipDelay || 10, 1, 0, 100))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">Hover анимация</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Анимация при наведении курсора</span><br>
          Поддерживает масштабирование, перемещение, поворот и комбинации
        </div>
        ${row('Тип анимации', selIn('w_animType', w.hoverAnimation?.type || 'NONE', HOVER_ANIMATION_TYPES))}
        <div id="hoverAnimationFields"></div>
      </div>
    </div>`;

  bind('w_id',v=>{w.id=v||w.id;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  if(!isText) {
    // Инициализируем поиск материала в панели свойств
    setTimeout(() => {
      if (window.ScreenGenerator && typeof window.ScreenGenerator.initMaterialSearchForWidget === 'function') {
        window.ScreenGenerator.initMaterialSearchForWidget('w_mat', w);
      }
    }, 50);
  }
  if(isText){
    bind('w_txt',v=>{
      // Текст уже приходит правильно из textarea (с реальными \n)
      w.text = v;
      w.label = v.replace(/\n/g, ' '); // Для label убираем переносы
      if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();
    });
    bind('w_align',v=>{
      w.alignment = v;
      if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
    bind('w_hover',v=>{w.hoveredText=v;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();});
    
    // Обработчики для backgroundColor (колорпикер)
    bind('w_bgColor',v=>{
      const rgb = hexToRgb(v);
      if (rgb) {
        w.backgroundColor = [rgb.r, rgb.g, rgb.b];
        w.color = v; // Обновляем и старое поле color для совместимости
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
        if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();
      }
    });
    bind('w_bgAlpha',v=>{
      const alphaValue = parseInt(v);
      w.backgroundAlpha = isNaN(alphaValue) ? 150 : Math.max(0, Math.min(255, alphaValue));
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
    
    // Обработчики для hoveredBackgroundColor (колорпикер)
    bind('w_hbgColor',v=>{
      const rgb = hexToRgb(v);
      if (rgb) {
        w.hoveredBackgroundColor = [rgb.r, rgb.g, rgb.b];
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      }
    });
    bind('w_hbgAlpha',v=>{
      const alphaValue = parseInt(v);
      w.hoveredBackgroundAlpha = isNaN(alphaValue) ? 0 : Math.max(0, Math.min(255, alphaValue));
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
  }
  bind('w_x',v=>{w.x=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('w_y',v=>{w.y=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('w_tx',v=>{w.transX=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('w_ty',v=>{w.transY=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('w_tz',v=>{w.transZ=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();});
  bind('w_w',v=>{w.w=Math.max(0.125,parseFloat(v)||1);if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('w_h',v=>{w.h=Math.max(0.125,parseFloat(v)||1);if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();updateProps();});
  bind('w_act',v=>{
    w.onClick=v;
    // Обновляем интерфейс при смене действия
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateProps==='function')window.ScreenGenerator.updateProps();
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    // Обновляем Lua контент при изменении onClick
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateLuaContent==='function')window.ScreenGenerator.updateLuaContent();
  });
  bind('w_func',v=>{
    w.clickFunction=v;
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    // Обновляем Lua контент при изменении имени функции
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateLuaContent==='function')window.ScreenGenerator.updateLuaContent();
  });
  bind('w_target',v=>{
    w.switchTarget=v;
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
  });
  bind('w_tolH',v=>{w.tolerance[0]=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  bind('w_tolV',v=>{w.tolerance[1]=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  
  // Обработчики для tooltip
  bind('w_tooltip',v=>{
    w.tooltip = v;
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
  });
  bind('w_tooltipDelay',v=>{
    const delayValue = parseInt(v);
    w.tooltipDelay = isNaN(delayValue) ? 10 : Math.max(0, Math.min(100, delayValue));
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
  });
  
  // Обработчик для типа hover анимации
  bind('w_animType',v=>{
    if (v === 'NONE') {
      delete w.hoverAnimation;
    } else {
      if (!w.hoverAnimation) w.hoverAnimation = {};
      w.hoverAnimation.type = v;
      // Устанавливаем значения по умолчанию
      w.hoverAnimation.duration = w.hoverAnimation.duration || 10;
      delete w.hoverAnimation.easing;
      w.hoverAnimation.reverseOnExit = w.hoverAnimation.reverseOnExit !== false;
      
      // Устанавливаем специфичные значения по умолчанию
      switch (v) {
        case 'PRESET':
          w.hoverAnimation.preset = w.hoverAnimation.preset || 'SCALE';
          w.hoverAnimation.intensity = w.hoverAnimation.intensity || 1.2;
          break;
        case 'SCALE':
          w.hoverAnimation.scale = w.hoverAnimation.scale || [1.1, 1.1, 1.0];
          break;
        case 'TRANSLATE':
          w.hoverAnimation.offset = w.hoverAnimation.offset || [0.0, 0.02, 0.0];
          break;
        case 'ROTATE':
          w.hoverAnimation.rotation = w.hoverAnimation.rotation || [0.0, 15.0, 0.0];
          w.hoverAnimation.axis = w.hoverAnimation.axis || [0.0, 1.0, 0.0];
          break;
        case 'PULSE_CONTINUOUS':
          w.hoverAnimation.intensity = w.hoverAnimation.intensity || 1.4;
          break;
        case 'COMBINED':
          w.hoverAnimation.effects = w.hoverAnimation.effects || [
            { type: 'SCALE', scale: [1.05, 1.05, 1.0] },
            { type: 'TRANSLATE', offset: [0.0, 0.01, 0.0] }
          ];
          break;
      }
    }
    
    // Обновляем поля анимации
    updateHoverAnimationFields(w);
    
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
  });
  
  // Инициализируем поля анимации
  updateHoverAnimationFields(w);
}

// Функция для показа уведомления о копировании
function showCopyToast() {
  // Создаем toast элемент
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent);
    color: #000;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 9999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = '✓ Скопировано в буфер';
  
  // Добавляем CSS анимацию если её нет
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Удаляем через 2 секунды с анимацией
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Делаем функцию глобально доступной
window.showCopyToast = showCopyToast;

function createDefaultCombinedEffect(type = 'SCALE') {
  switch (type) {
    case 'TRANSLATE':
      return { type: 'TRANSLATE', offset: [0.0, 0.01, 0.0] };
    case 'ROTATE':
      return { type: 'ROTATE', rotation: [0.0, 15.0, 0.0], axis: [0.0, 1.0, 0.0] };
    case 'PRESET':
      return { type: 'PRESET', preset: 'SCALE', intensity: 1.2 };
    default:
      return { type: 'SCALE', scale: [1.05, 1.05, 1.0] };
  }
}

function normalizeCombinedEffects(anim) {
  if (!Array.isArray(anim.effects)) anim.effects = [];

  anim.effects = anim.effects
    .filter(effect => effect && typeof effect === 'object')
    .map(effect => {
      const effectType = COMBINED_EFFECT_TYPES.includes(effect.type) ? effect.type : 'SCALE';
      const normalized = { ...effect, type: effectType };

      switch (effectType) {
        case 'SCALE':
          if (!Array.isArray(normalized.scale) || normalized.scale.length !== 3) {
            normalized.scale = [1.05, 1.05, 1.0];
          }
          break;
        case 'TRANSLATE':
          if (!Array.isArray(normalized.offset) || normalized.offset.length !== 3) {
            normalized.offset = [0.0, 0.01, 0.0];
          }
          break;
        case 'ROTATE':
          if (!Array.isArray(normalized.rotation) || normalized.rotation.length !== 3) {
            normalized.rotation = [0.0, 15.0, 0.0];
          }
          if (!Array.isArray(normalized.axis) || normalized.axis.length !== 3) {
            normalized.axis = [0.0, 1.0, 0.0];
          }
          break;
        case 'PRESET':
          if (!PRESET_OPTIONS.includes(normalized.preset)) {
            normalized.preset = 'SCALE';
          }
          if (typeof normalized.intensity !== 'number' || Number.isNaN(normalized.intensity)) {
            normalized.intensity = 1.2;
          }
          break;
      }

      return normalized;
    });

  if (anim.effects.length === 0) {
    anim.effects.push(createDefaultCombinedEffect('SCALE'));
  }
}

function renderCombinedEffectsEditor(anim) {
  normalizeCombinedEffects(anim);

  const effectsHtml = anim.effects.map((effect, index) => {
    let specificFields = '';

    switch (effect.type) {
      case 'SCALE':
        specificFields = `
          ${row('Scale X', numIn(`w_combScaleX_${index}`, effect.scale?.[0] ?? 1.05, 0.05, 0.1))}
          ${row('Scale Y', numIn(`w_combScaleY_${index}`, effect.scale?.[1] ?? 1.05, 0.05, 0.1))}
          ${row('Scale Z', numIn(`w_combScaleZ_${index}`, effect.scale?.[2] ?? 1.0, 0.05, 0.1))}
        `;
        break;
      case 'TRANSLATE':
        specificFields = `
          ${row('Offset X', numIn(`w_combOffsetX_${index}`, effect.offset?.[0] ?? 0.0, 0.01))}
          ${row('Offset Y', numIn(`w_combOffsetY_${index}`, effect.offset?.[1] ?? 0.01, 0.01))}
          ${row('Offset Z', numIn(`w_combOffsetZ_${index}`, effect.offset?.[2] ?? 0.0, 0.01))}
        `;
        break;
      case 'ROTATE':
        specificFields = `
          ${row('Rotation X', numIn(`w_combRotX_${index}`, effect.rotation?.[0] ?? 0.0, 1))}
          ${row('Rotation Y', numIn(`w_combRotY_${index}`, effect.rotation?.[1] ?? 15.0, 1))}
          ${row('Rotation Z', numIn(`w_combRotZ_${index}`, effect.rotation?.[2] ?? 0.0, 1))}
          ${row('Axis X', numIn(`w_combAxisX_${index}`, effect.axis?.[0] ?? 0.0, 0.1))}
          ${row('Axis Y', numIn(`w_combAxisY_${index}`, effect.axis?.[1] ?? 1.0, 0.1))}
          ${row('Axis Z', numIn(`w_combAxisZ_${index}`, effect.axis?.[2] ?? 0.0, 0.1))}
        `;
        break;
      case 'PRESET':
        specificFields = `
          ${row('Preset', selIn(`w_combPreset_${index}`, effect.preset || 'SCALE', PRESET_OPTIONS))}
          ${row('Intensity', numIn(`w_combIntensity_${index}`, effect.intensity ?? 1.2, 0.1, 0.1))}
        `;
        break;
    }

    return `
      <div class="pgroup" style="margin-top:8px;">
        <div class="pgtitle">Эффект #${index + 1}</div>
        <div class="pgbody">
          ${row('Тип', selIn(`w_combType_${index}`, effect.type, COMBINED_EFFECT_TYPES))}
          ${specificFields}
          <div style="display:flex;justify-content:flex-end;margin-top:8px;">
            <button type="button" class="btn" id="w_combRemove_${index}" style="font-size:10px;padding:3px 8px;">Удалить</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="phint">
      <span class="ok">Комбинированная анимация: несколько эффектов подряд</span>
    </div>
    ${effectsHtml}
    <div style="display:flex;justify-content:flex-start;margin-top:8px;">
      <button type="button" class="btn primary" id="w_combAdd" style="font-size:10px;padding:3px 8px;">+ Добавить эффект</button>
    </div>
  `;
}

// Функция для обновления полей hover анимации
function updateHoverAnimationFields(w) {
  const fieldsContainer = document.getElementById('hoverAnimationFields');
  if (!fieldsContainer) return;
  
  const anim = w.hoverAnimation;
  if (!anim || !anim.type || anim.type === 'NONE') {
    fieldsContainer.innerHTML = '';
    return;
  }
  
  let fieldsHTML = `
    ${row('Длительность (тики)', numIn('w_animDuration', anim.duration || 10, 1, 1, 100))}
    ${row('Возврат при выходе', `<input type="checkbox" id="w_animReverse" ${anim.reverseOnExit !== false ? 'checked' : ''}>`)}
    ${row('Задержка (тики)', numIn('w_animDelay', anim.delay || 0, 1, 0, 50))}
  `;
  
  // Добавляем специфичные поля в зависимости от типа
  switch (anim.type) {
    case 'PRESET':
      fieldsHTML += `
        ${row('Пресет', selIn('w_animPreset', anim.preset || 'SCALE', PRESET_OPTIONS))}
        ${row('Интенсивность', numIn('w_animIntensity', anim.intensity || 1.2, 0.1, 0.1, 3.0))}
      `;
      break;
      
    case 'SCALE':
      fieldsHTML += `
        ${row('Масштаб X', numIn('w_animScaleX', anim.scale?.[0] || 1.1, 0.05, 0.1, 3.0))}
        ${row('Масштаб Y', numIn('w_animScaleY', anim.scale?.[1] || 1.1, 0.05, 0.1, 3.0))}
        ${row('Масштаб Z', numIn('w_animScaleZ', anim.scale?.[2] || 1.0, 0.05, 0.1, 3.0))}
      `;
      break;
      
    case 'TRANSLATE':
      fieldsHTML += `
        ${row('Смещение X', numIn('w_animOffsetX', anim.offset?.[0] || 0.0, 0.01, -2.0, 2.0))}
        ${row('Смещение Y', numIn('w_animOffsetY', anim.offset?.[1] || 0.02, 0.01, -2.0, 2.0))}
        ${row('Смещение Z', numIn('w_animOffsetZ', anim.offset?.[2] || 0.0, 0.01, -2.0, 2.0))}
      `;
      break;
      
    case 'ROTATE':
      fieldsHTML += `
        ${row('Поворот X (°)', numIn('w_animRotX', anim.rotation?.[0] || 0.0, 1, -180, 180))}
        ${row('Поворот Y (°)', numIn('w_animRotY', anim.rotation?.[1] || 15.0, 1, -180, 180))}
        ${row('Поворот Z (°)', numIn('w_animRotZ', anim.rotation?.[2] || 0.0, 1, -180, 180))}
        ${row('Ось X', numIn('w_animAxisX', anim.axis?.[0] || 0.0, 0.1, -1.0, 1.0))}
        ${row('Ось Y', numIn('w_animAxisY', anim.axis?.[1] || 1.0, 0.1, -1.0, 1.0))}
        ${row('Ось Z', numIn('w_animAxisZ', anim.axis?.[2] || 0.0, 0.1, -1.0, 1.0))}
      `;
      break;
      
    case 'PULSE_CONTINUOUS':
      fieldsHTML += `
        ${row('Интенсивность', numIn('w_animIntensity', anim.intensity || 1.4, 0.1, 0.1, 3.0))}
        <div class="phint"><span class="ok">Непрерывная пульсация во время hover</span></div>
      `;
      break;
      
    case 'COMBINED':
      fieldsHTML += renderCombinedEffectsEditor(anim);
      break;
  }
  
  fieldsContainer.innerHTML = fieldsHTML;
  
  // Привязываем обработчики для новых полей
  bindHoverAnimationHandlers(w);
}

// Функция для привязки обработчиков hover анимации
function bindHoverAnimationHandlers(w) {
  const anim = w.hoverAnimation;
  if (!anim) return;
  
  // Общие поля
  bind('w_animDuration', v => {
    anim.duration = Math.max(1, parseInt(v) || 10);
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
  });
  
  const reverseCheckbox = document.getElementById('w_animReverse');
  if (reverseCheckbox) {
    reverseCheckbox.addEventListener('change', () => {
      anim.reverseOnExit = reverseCheckbox.checked;
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
  }
  
  bind('w_animDelay', v => {
    anim.delay = Math.max(0, parseInt(v) || 0);
    if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
  });
  
  // Специфичные поля
  switch (anim.type) {
    case 'PRESET':
      bind('w_animPreset', v => {
        anim.preset = PRESET_OPTIONS.includes(v) ? v : 'SCALE';
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animIntensity', v => {
        anim.intensity = Math.max(0.1, parseFloat(v) || 1.2);
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      break;
      
    case 'SCALE':
      bind('w_animScaleX', v => {
        if (!anim.scale) anim.scale = [1.1, 1.1, 1.0];
        anim.scale[0] = Math.max(0.1, parseFloat(v) || 1.1);
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animScaleY', v => {
        if (!anim.scale) anim.scale = [1.1, 1.1, 1.0];
        anim.scale[1] = Math.max(0.1, parseFloat(v) || 1.1);
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animScaleZ', v => {
        if (!anim.scale) anim.scale = [1.1, 1.1, 1.0];
        anim.scale[2] = Math.max(0.1, parseFloat(v) || 1.0);
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      break;
      
    case 'TRANSLATE':
      bind('w_animOffsetX', v => {
        if (!anim.offset) anim.offset = [0.0, 0.02, 0.0];
        anim.offset[0] = parseFloat(v) || 0.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animOffsetY', v => {
        if (!anim.offset) anim.offset = [0.0, 0.02, 0.0];
        anim.offset[1] = parseFloat(v) || 0.02;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animOffsetZ', v => {
        if (!anim.offset) anim.offset = [0.0, 0.02, 0.0];
        anim.offset[2] = parseFloat(v) || 0.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      break;
      
    case 'ROTATE':
      bind('w_animRotX', v => {
        if (!anim.rotation) anim.rotation = [0.0, 15.0, 0.0];
        anim.rotation[0] = parseFloat(v) || 0.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animRotY', v => {
        if (!anim.rotation) anim.rotation = [0.0, 15.0, 0.0];
        anim.rotation[1] = parseFloat(v) || 15.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animRotZ', v => {
        if (!anim.rotation) anim.rotation = [0.0, 15.0, 0.0];
        anim.rotation[2] = parseFloat(v) || 0.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animAxisX', v => {
        if (!anim.axis) anim.axis = [0.0, 1.0, 0.0];
        anim.axis[0] = parseFloat(v) || 0.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animAxisY', v => {
        if (!anim.axis) anim.axis = [0.0, 1.0, 0.0];
        anim.axis[1] = parseFloat(v) || 1.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      bind('w_animAxisZ', v => {
        if (!anim.axis) anim.axis = [0.0, 1.0, 0.0];
        anim.axis[2] = parseFloat(v) || 0.0;
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      break;
      
    case 'COMBINED': {
      normalizeCombinedEffects(anim);

      const addEffectBtn = document.getElementById('w_combAdd');
      if (addEffectBtn) {
        addEffectBtn.addEventListener('click', () => {
          anim.effects.push(createDefaultCombinedEffect('SCALE'));
          updateHoverAnimationFields(w);
          if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
        });
      }

      anim.effects.forEach((effect, index) => {
        bind(`w_combType_${index}`, value => {
          anim.effects[index] = createDefaultCombinedEffect(value);
          updateHoverAnimationFields(w);
          if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
        });

        const removeBtn = document.getElementById(`w_combRemove_${index}`);
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            anim.effects.splice(index, 1);
            if (anim.effects.length === 0) {
              anim.effects.push(createDefaultCombinedEffect('SCALE'));
            }
            updateHoverAnimationFields(w);
            if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
          });
        }

        switch (effect.type) {
          case 'SCALE':
            bind(`w_combScaleX_${index}`, v => {
              effect.scale[0] = Math.max(0.1, parseFloat(v) || 1.05);
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combScaleY_${index}`, v => {
              effect.scale[1] = Math.max(0.1, parseFloat(v) || 1.05);
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combScaleZ_${index}`, v => {
              effect.scale[2] = Math.max(0.1, parseFloat(v) || 1.0);
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            break;
          case 'TRANSLATE':
            bind(`w_combOffsetX_${index}`, v => {
              effect.offset[0] = parseFloat(v) || 0.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combOffsetY_${index}`, v => {
              effect.offset[1] = parseFloat(v) || 0.01;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combOffsetZ_${index}`, v => {
              effect.offset[2] = parseFloat(v) || 0.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            break;
          case 'ROTATE':
            bind(`w_combRotX_${index}`, v => {
              effect.rotation[0] = parseFloat(v) || 0.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combRotY_${index}`, v => {
              effect.rotation[1] = parseFloat(v) || 15.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combRotZ_${index}`, v => {
              effect.rotation[2] = parseFloat(v) || 0.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combAxisX_${index}`, v => {
              effect.axis[0] = parseFloat(v) || 0.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combAxisY_${index}`, v => {
              effect.axis[1] = parseFloat(v) || 1.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combAxisZ_${index}`, v => {
              effect.axis[2] = parseFloat(v) || 0.0;
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            break;
          case 'PRESET':
            bind(`w_combPreset_${index}`, v => {
              effect.preset = PRESET_OPTIONS.includes(v) ? v : 'SCALE';
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            bind(`w_combIntensity_${index}`, v => {
              effect.intensity = Math.max(0.1, parseFloat(v) || 1.2);
              if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
            });
            break;
        }
      });
      break;
    }

    case 'PULSE_CONTINUOUS':
      bind('w_animIntensity', v => {
        anim.intensity = Math.max(0.1, parseFloat(v) || 1.4);
        if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
      });
      break;
  }
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  updateProps,
  renderBgProps,
  renderWProps,
  createMaterialOption,
  createMaterialSelect,
  filterMaterials,
  showCopyToast,
  updateHoverAnimationFields,
  bindHoverAnimationHandlers,
  MATS,
  ACTS
});
