// ═══════════════════════════════════════════════════════════════
// WIDGET MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// ADD WIDGET
// ═══════════════════════════════════════════════════════════════
function addWidget(type,mat,x=0,y=0){
  const { widgets, nextId, matCol } = window.ScreenGenerator;
  
  const id=`widget_${nextId}`;
  window.ScreenGenerator.nextId++;
  
  const isText=type==='TEXT_BUTTON';
  // По умолчанию translation=[0,0]:
  // для TEXT чтобы центрировать по Y нужно transY=-h/2, но оставим 0 — пользователь настроит
  widgets.push({
    id,type,material:mat||(isText?'':'RED_STAINED_GLASS_PANE'),
    label:isText?'Button':'',text:isText?'Button':'',
    x, y,
    transX:0,
    transY: isText ? -0.5 : 0, // разумный дефолт для TEXT: -h/2 = -0.5 при h=1
    w:1, h:1,
    color:isText?'#2a4d6e':matCol(mat),
    onClick:'CLOSE_SCREEN',tolerance:[0.15,0.15]
  });
  
  window.ScreenGenerator.selectedId = id;
  
  if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
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
    window.ScreenGenerator.selectedId = null;
    window.ScreenGenerator.nextId = 1;
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
  }
});

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  addWidget,
  updateWidgetList,
  updateEmpty
});