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
      window.ScreenGenerator.widgets.push(c);
      window.ScreenGenerator.selectedId=c.id;
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    }
  });
  
  document.getElementById('ctxDel').addEventListener('click',()=>{
    if(window.ScreenGenerator.selectedId==='__bg__') {
      // Фон нельзя удалить
      return;
    } else {
      window.ScreenGenerator.widgets=window.ScreenGenerator.widgets.filter(w=>w.id!==window.ScreenGenerator.selectedId);
    }
    window.ScreenGenerator.selectedId=null;
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
  });
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  showCtx,
  initContextMenu
});