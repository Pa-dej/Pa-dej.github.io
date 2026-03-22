// ═══════════════════════════════════════════════════════════════
// WIDGET MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ADD WIDGET
// ═══════════════════════════════════════════════════════════════

// Функция для поиска минимального свободного ID
function getNextAvailableId() {
  const { widgets } = window.ScreenGenerator;
  
  // Извлекаем все существующие номера ID
  const usedIds = new Set();
  for (const widget of widgets) {
    const match = widget.id.match(/^widget_(\d+)$/);
    if (match) {
      usedIds.add(parseInt(match[1]));
    }
  }
  
  // Если нет виджетов, начинаем с 0
  if (usedIds.size === 0) {
    return 0;
  }
  
  // Находим максимальный используемый ID
  const maxId = Math.max(...usedIds);
  
  // Ищем минимальный свободный ID от 0 до maxId
  for (let i = 0; i <= maxId; i++) {
    if (!usedIds.has(i)) {
      return i;
    }
  }
  
  // Если все ID от 0 до maxId заняты, возвращаем maxId + 1
  return maxId + 1;
}

function addWidget(type,mat,x=0,y=0){
  const { widgets, matCol } = window.ScreenGenerator;
  
  const nextId = getNextAvailableId();
  const id = `widget_${nextId}`;
  
  const isText=type==='TEXT_BUTTON';
  // По умолчанию translation=[0,0]:
  // для TEXT чтобы центрировать по Y нужно transY=-h/2, но оставим 0 — пользователь настроит
  const widget = {
    id,type,material:mat||(isText?'':'RED_STAINED_GLASS_PANE'),
    label:isText?'Button':'',text:isText?'Button':'',
    x, y,
    transX:0,
    transY: isText ? -0.125 : 0, // TEXT_BUTTON: -0.125 (как в примере)
    transZ: isText ? 0.001 : 0, // смещение по Z для текстовых кнопок
    w: isText ? 0.125 : 1, // TEXT_BUTTON: 0.125 (scale=[1,1,1]), ITEM_BUTTON: 1
    h: isText ? 0.25 : 1,  // TEXT_BUTTON: 0.25 (scale=[1,1,1]), ITEM_BUTTON: 1
    color:isText?'#2a4d6e':matCol(mat),
    onClick: isText ? 'NONE' : 'CLOSE_SCREEN', // TEXT_BUTTON: NONE, ITEM_BUTTON: CLOSE_SCREEN
    clickFunction: '', // Имя функции для RUN_SCRIPT
    switchTarget: '', // Целевой экран для SWITCH_SCREEN
    tolerance:[0.15,0.15]
  };
  
  // Добавляем новые поля для TEXT_BUTTON
  if (isText) {
    widget.hoveredText = '[Button]'; // дефолтный hover текст
    widget.backgroundColor = [40, 60, 80]; // Дефолтный цвет фона
    widget.backgroundAlpha = 150;
    widget.alignment = 'CENTERED'; // дефолтное выравнивание
  }
  
  widgets.push(widget);
  
  window.ScreenGenerator.selectedId = id;
  
  // Пересчитываем оптимизацию при добавлении виджета
  if (window.ScreenGenerator && typeof window.ScreenGenerator.calculateOptimization === 'function') {
    window.ScreenGenerator.calculateOptimization();
  }
  
  // Сбрасываем состояние редактирования YAML при программном изменении
  if (window.ScreenGenerator && typeof window.ScreenGenerator.resetEditingState === 'function') {
    window.ScreenGenerator.resetEditingState();
  }
  
  if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
  
  // Обновляем редактор (YAML и Lua)
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml === 'function') window.ScreenGenerator.updateYaml();
  
  // Сохраняем в историю
  if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
    window.ScreenGenerator.saveState(`Add ${type} (${id})`);
  }
}

// Widget list management (без концепции слоев)
function updateWidgetList(){
  const { widgets, background, selectedId, getMinecraftRender } = window.ScreenGenerator;
  
  const list=document.getElementById('widgetList');
  const html=[];
  
  // Показываем виджеты в порядке создания
  for(const w of widgets) {
    const s=w.id===selectedId;
    let icon;
    
    if (w.type==='TEXT_BUTTON') {
      icon = '<div style="width:16px;height:16px;background:var(--accent);color:#000;border-radius:2px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;">T</div>';
    } else {
      // Для ITEM_BUTTON показываем рендер материала
      const iconHtml = getMinecraftRender(w.material || 'STONE', 16);
      icon = `<div style="width:16px;height:16px;display:flex;align-items:center;justify-content:center;">${iconHtml}</div>`;
    }
    
    html.push(`<div class="litem" data-id="${w.id}" style="border:1px solid ${s?'var(--accent)':'var(--border)'};background:${s?'rgba(100,150,255,0.08)':'var(--bg3)'};color:${s?'var(--accent)':'var(--text2)'};">
      ${icon}
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px;margin-left:4px;">${w.id}</span>
    </div>`);
  }
  
  // Фон всегда показываем последним
  if(background){
    const s=selectedId==='__bg__';
    html.push(`<div class="litem" data-id="__bg__" style="border:1px solid ${s?'var(--accent3)':'var(--border)'};background:${s?'rgba(28,238,114,0.08)':'var(--bg3)'};color:${s?'var(--accent3)':'var(--text3)'};font-size:10px;">
      <div style="width:16px;height:16px;background:${background.colorHex};border:1px solid var(--border);border-radius:2px;flex-shrink:0;"></div>
      <span style="margin-left:4px;">background</span>
    </div>`);
  }
  
  list.innerHTML=html.join('')||'<div style="font-size:9px;color:var(--text3);padding:4px">Нет виджетов</div>';
  list.querySelectorAll('.litem').forEach(el=>el.addEventListener('click',()=>{
    window.ScreenGenerator.selectedId = el.dataset.id;
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
  }));
}

function updateEmpty(){
  const { widgets, cv, PPB } = window.ScreenGenerator;
  
  document.getElementById('estate').style.display=(widgets.length===0)?'block':'none';
  const bx=Math.floor(cv.width/PPB()),by=Math.floor(cv.height/PPB());
  document.getElementById('screenInfo').textContent=`${bx}×${by} блоков`;
}

// Clear widgets
document.getElementById('btnClear').addEventListener('click',()=>{
  if(confirm('Очистить виджеты?')){
    window.ScreenGenerator.widgets = [];
    window.ScreenGenerator.background = null;
    window.ScreenGenerator.selectedId = null;
    
    // Пересчитываем оптимизацию после очистки
    if (window.ScreenGenerator && typeof window.ScreenGenerator.calculateOptimization === 'function') {
      window.ScreenGenerator.calculateOptimization();
    }
    
    // Сбрасываем состояние редактирования YAML
    if (window.ScreenGenerator && typeof window.ScreenGenerator.resetEditingState === 'function') {
      window.ScreenGenerator.resetEditingState();
    }
    
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
    updateAddBgButton();
    
    // Обновляем редактор (YAML и Lua)
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml === 'function') window.ScreenGenerator.updateYaml();
    
    // Сохраняем в историю
    if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
      window.ScreenGenerator.saveState('Clear all');
    }
  }
});

// Add background
document.getElementById('btnAddBg').addEventListener('click', () => {
  if (!window.ScreenGenerator.background) {
    // Создаем фон с дефолтными параметрами
    window.ScreenGenerator.background = {
      w: 8,
      h: 5,
      colorHex: '#0d1117',
      alpha: 160,
      posX: 0,
      posY: 0,
      transX: 0,
      transY: -2.5,
      transZ: 0,
      locked: false
    };
    
    // Выделяем фон
    window.ScreenGenerator.selectedId = '__bg__';
    
    // Сбрасываем состояние редактирования YAML
    if (window.ScreenGenerator && typeof window.ScreenGenerator.resetEditingState === 'function') {
      window.ScreenGenerator.resetEditingState();
    }
    
    // Обновляем интерфейс
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
    
    updateAddBgButton();
    
    // Сохраняем в историю
    if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
      window.ScreenGenerator.saveState('Add background');
    }
  }
});

// Функция для обновления состояния кнопки "Добавить фон"
function updateAddBgButton() {
  const btn = document.getElementById('btnAddBg');
  if (btn) {
    btn.disabled = !!window.ScreenGenerator.background;
    btn.textContent = window.ScreenGenerator.background ? '✓ Фон добавлен' : '+ Добавить фон';
    btn.style.opacity = window.ScreenGenerator.background ? '0.6' : '1';
  }
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  getNextAvailableId,
  addWidget,
  updateWidgetList,
  updateEmpty,
  updateAddBgButton
});