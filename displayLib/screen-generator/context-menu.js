// ═══════════════════════════════════════════════════════════════
// CONTEXT MENU MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// Context menu
const ctxM=document.getElementById('ctxMenu');

function showCtx(x,y){
  ctxM.style.left=x+'px';
  ctxM.style.top=y+'px';
  ctxM.classList.add('show');
}

function initContextMenu() {
  document.addEventListener('click',()=>ctxM.classList.remove('show'));
  
  document.getElementById('ctxDup').addEventListener('click',()=>{
    if(!window.ScreenGenerator.selectedId||window.ScreenGenerator.selectedId==='__bg__') return;
    const w=window.ScreenGenerator.widgets.find(x=>x.id===window.ScreenGenerator.selectedId);
    if(w){
      const c={...w,id:`widget_${window.ScreenGenerator.nextId++}`,x:w.x+0.5,y:w.y-0.5,tolerance:[...w.tolerance]};
      // Копируем массивы правильно
      if (w.backgroundColor) c.backgroundColor = [...w.backgroundColor];
      
      window.ScreenGenerator.widgets.push(c);
      window.ScreenGenerator.selectedId=c.id;
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      
      // Сохраняем в историю
      if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
        window.ScreenGenerator.saveState(`Duplicate ${w.type} (${c.id})`);
      }
    }
  });
  
  document.getElementById('ctxDel').addEventListener('click',()=>{
    const selectedId = window.ScreenGenerator.selectedId;
    let deletedItem = null;
    
    if(selectedId==='__bg__') {
      // Удаляем фон
      deletedItem = 'background';
      window.ScreenGenerator.background = null;
    } else {
      // Удаляем виджет
      const widget = window.ScreenGenerator.widgets.find(w => w.id === selectedId);
      if (widget) {
        deletedItem = `${widget.type} (${widget.id})`;
        window.ScreenGenerator.widgets=window.ScreenGenerator.widgets.filter(w=>w.id!==selectedId);
      }
    }
    
    window.ScreenGenerator.selectedId=null;
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateAddBgButton === 'function') window.ScreenGenerator.updateAddBgButton();
    
    // Сохраняем в историю
    if (deletedItem && window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
      window.ScreenGenerator.saveState(`Delete ${deletedItem}`);
    }
  });
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  showCtx,
  initContextMenu
});