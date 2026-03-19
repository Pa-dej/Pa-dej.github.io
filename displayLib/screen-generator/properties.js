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

const ACTS=['CLOSE_SCREEN','OPEN_MENU','RUN_COMMAND','SEND_CHAT','PLAY_SOUND','RUN_SCRIPT','SWITCH_SCREEN','NONE'];

// Утилиты для создания элементов формы
const row=(lbl,inp)=>`<div class="prow"><div class="plabel">${lbl}</div>${inp}</div>`;
const numIn=(id,v,step=0.05,min='')=>`<input class="pinput" type="number" id="${id}" value="${typeof v==='number'?+v.toFixed(4):v}" step="${step}" ${min!==''?`min="${min}"`:''}  >`;
const txtIn=(id,v)=>`<input class="pinput" type="text" id="${id}" value="${v}">`;
const selIn=(id,v,opts)=>`<select class="pselect" id="${id}">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`;
const colIn=(id,v)=>`<input class="pinput" type="color" id="${id}" value="${v}">`;
const bind=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('input',e=>fn(e.target.value));};

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
  if(!selectedId){p.innerHTML='<div class="nsm">Выберите элемент<br>для редактирования</div>';return;}
  if(selectedId==='__bg__') renderBgProps(p);
  else{const w=widgets.find(x=>x.id===selectedId);if(w)renderWProps(p,w);}
}

function renderBgProps(p){
  const { background, hexRgb } = window.ScreenGenerator;
  const bg=background;
  const autoX=-(bg.w*8)/80;
  const finXInGame=(bg.posX+bg.transX+autoX).toFixed(3); // финальная позиция в игре
  const finXInEditor=(bg.posX+bg.transX).toFixed(3); // позиция в редакторе
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
        transX: <span class="hl">авто -${((bg.w*8)/80).toFixed(3)}</span> + ${bg.transX}<br>
        Для центрирования Y: transY = <span class="hl">-h/2 = ${(-bg.h/2).toFixed(2)}</span></div>
        ${row('transX', numIn('bg_tx',bg.transX))}
        ${row('transY', numIn('bg_ty',bg.transY))}
        ${row('transZ', numIn('bg_tz',bg.transZ||0))}
        <div class="phint" style="cursor:pointer" onclick="navigator.clipboard.writeText('[${bg.w*8}, ${bg.h*4}, 1]').then(() => showCopyToast())" title="Нажмите чтобы скопировать">YAML scale: <span class="hl">[${bg.w*8}, ${bg.h*4}, 1]</span> 📋</div>
        <div class="phint">
          Реальный размер в игре:<br>
          <span class="hl">${(() => {
            const bgSize = window.ScreenGenerator.mcBgSize(' ', bg.w * 8, bg.h * 4);
            return bgSize.w.toFixed(4) + ' × ' + bgSize.h.toFixed(4) + ' блока';
          })()}</span><br>
          (space=" " → ${window.ScreenGenerator.mcTextWidth(' ')+2}px ширины, 11px высоты в font-px)
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
  const yamlScaleStr=isText?`[${+(w.w*8).toFixed(2)}, ${+(w.h*4).toFixed(2)}, 1]`:`[${+w.w.toFixed(2)}, ${+w.h.toFixed(2)}, ${+w.w.toFixed(2)}]`;
  
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
    ${row('Текст',txtIn('w_txt',w.text))}
    ${row('Hover текст',txtIn('w_hover',w.hoveredText||''))}
    ${row('Цвет BG',colIn('w_col',w.color))}
  ` : '';
  
  // Поля backgroundColor и backgroundAlpha для TEXT_BUTTON
  const backgroundFields = isText ? `
    <div class="pgroup">
      <div class="pgtitle">Фон кнопки</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Цвет и прозрачность фона кнопки</span>
        </div>
        ${row('BG R', numIn('w_bgR', w.backgroundColor ? w.backgroundColor[0] : 40, 1, 0, 255))}
        ${row('BG G', numIn('w_bgG', w.backgroundColor ? w.backgroundColor[1] : 60, 1, 0, 255))}
        ${row('BG B', numIn('w_bgB', w.backgroundColor ? w.backgroundColor[2] : 80, 1, 0, 255))}
        ${row('BG Alpha', numIn('w_bgAlpha', w.backgroundAlpha || 150, 1, 0, 255))}
      </div>
    </div>
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
            const wSize = window.ScreenGenerator.mcBgSize(w.text || ' ', w.w * 8, w.h * 4);
            return wSize.w.toFixed(4) + ' × ' + wSize.h.toFixed(4) + ' блока';
          })()}</span><br>
          Текст "${w.text || ''}" → ${window.ScreenGenerator.mcTextWidth(w.text || '')}px широкий
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
    bind('w_txt',v=>{w.text=v;w.label=v;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
    bind('w_hover',v=>{w.hoveredText=v;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();});
    bind('w_col',v=>{w.color=v;if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
    
    // Обработчики для backgroundColor
    bind('w_bgR',v=>{
      if(!w.backgroundColor) w.backgroundColor = [40, 60, 80];
      w.backgroundColor[0] = Math.max(0, Math.min(255, parseInt(v) || 0));
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
    bind('w_bgG',v=>{
      if(!w.backgroundColor) w.backgroundColor = [40, 60, 80];
      w.backgroundColor[1] = Math.max(0, Math.min(255, parseInt(v) || 0));
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
    bind('w_bgB',v=>{
      if(!w.backgroundColor) w.backgroundColor = [40, 60, 80];
      w.backgroundColor[2] = Math.max(0, Math.min(255, parseInt(v) || 0));
      if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();
    });
    bind('w_bgAlpha',v=>{
      const alphaValue = parseInt(v);
      w.backgroundAlpha = isNaN(alphaValue) ? 150 : Math.max(0, Math.min(255, alphaValue));
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
  bind('w_act',v=>{w.onClick=v;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();});
  bind('w_tolH',v=>{w.tolerance[0]=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
  bind('w_tolV',v=>{w.tolerance[1]=parseFloat(v)||0;if(window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml==='function')window.ScreenGenerator.updateYaml();if(window.ScreenGenerator && typeof window.ScreenGenerator.render==='function')window.ScreenGenerator.render();});
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

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  updateProps,
  renderBgProps,
  renderWProps,
  createMaterialOption,
  createMaterialSelect,
  filterMaterials,
  showCopyToast,
  MATS,
  ACTS
});