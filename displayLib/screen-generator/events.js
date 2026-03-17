// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS - Mouse, keyboard, and drag events
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// DRAGGING — двигаем position[], translation остаётся неизменным
// ═══════════════════════════════════════════════════════════════
function initEventHandlers() {
  const { 
    cv, cx2b, cy2b, snap, hitHandle, hitWidget, hitBg, 
    p2b, setZoom, currentZoom, GSTEP
  } = window.ScreenGenerator;

  cv.addEventListener('mousemove', e => {
    const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    document.getElementById('curX').textContent=cx2b(mx).toFixed(2);
    document.getElementById('curY').textContent=cy2b(my).toFixed(2);
    const handle=hitHandle(mx,my);
    const HCUR={tl:'nw-resize',tr:'ne-resize',bl:'sw-resize',br:'se-resize',tm:'n-resize',bm:'s-resize',ml:'w-resize',mr:'e-resize'};
    cv.style.cursor = handle?(HCUR[handle]||'default'):hitWidget(mx,my)||hitBg(mx,my)?'move':'default';

    if (window.ScreenGenerator.dragging) {
      const dragging = window.ScreenGenerator.dragging;
      const dx=p2b(mx-dragging.smx), dy=p2b(-(my-dragging.smy));
      if (dragging.id==='__bg__') { 
        // Проверяем блокировку фона
        if (!window.ScreenGenerator.background.locked) {
          window.ScreenGenerator.background.posX=window.ScreenGenerator.snap(dragging.sx+dx); 
          window.ScreenGenerator.background.posY=window.ScreenGenerator.snap(dragging.sy+dy); 
        }
      }
      else { 
        const w=window.ScreenGenerator.widgets.find(x=>x.id===dragging.id); 
        if(w){w.x=window.ScreenGenerator.snap(dragging.sx+dx);w.y=window.ScreenGenerator.snap(dragging.sy+dy);} 
      }
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render(); 
      if(window.ScreenGenerator.selectedId && window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    }
    
    if (window.ScreenGenerator.resizing) {
      const resizing = window.ScreenGenerator.resizing;
      const dx=p2b(mx-resizing.smx), dy=p2b(my-resizing.smy);
      const w=window.ScreenGenerator.widgets.find(x=>x.id===resizing.id);
      if (w) {
        let nW=resizing.sw,nH=resizing.sh,nX=resizing.sx,nY=resizing.sy;
        const h=resizing.handle;
        if(h.includes('r')) nW=Math.max(0.125,window.ScreenGenerator.snap(resizing.sw+dx));
        if(h.includes('l')){nW=Math.max(0.125,window.ScreenGenerator.snap(resizing.sw-dx));nX=window.ScreenGenerator.snap(resizing.sx+dx);}
        if(h.includes('b')) nH=Math.max(0.125,window.ScreenGenerator.snap(resizing.sh+dy));
        if(h.includes('t')){nH=Math.max(0.125,window.ScreenGenerator.snap(resizing.sh-dy));nY=window.ScreenGenerator.snap(resizing.sy-dy);}
        w.w=nW;w.h=nH;w.x=nX;w.y=nY;
        if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render(); 
        if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      }
    }
  });

  cv.addEventListener('mousedown', e => {
    if(e.button===2) return;
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const handle=hitHandle(mx,my);
    if(handle&&window.ScreenGenerator.selectedId){
      const w=window.ScreenGenerator.widgets.find(x=>x.id===window.ScreenGenerator.selectedId);
      if(w) window.ScreenGenerator.resizing={id:w.id,handle,smx:mx,smy:my,sw:w.w,sh:w.h,sx:w.x,sy:w.y};
      return;
    }
    const hw=hitWidget(mx,my);
    if(hw){
      window.ScreenGenerator.selectedId=hw.id;
      window.ScreenGenerator.dragging={id:hw.id,smx:mx,smy:my,sx:hw.x,sy:hw.y};
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      return;
    }
    if(hitBg(mx,my)){
      window.ScreenGenerator.selectedId='__bg__';
      // Начинаем перетаскивание только если фон не заблокирован
      if (!window.ScreenGenerator.background.locked) {
        window.ScreenGenerator.dragging={id:'__bg__',smx:mx,smy:my,sx:window.ScreenGenerator.background.posX,sy:window.ScreenGenerator.background.posY};
      }
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      return;
    }
    window.ScreenGenerator.selectedId=null;
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
  });
  
  cv.addEventListener('mouseup',()=>{
    window.ScreenGenerator.dragging=null;
    window.ScreenGenerator.resizing=null;
  });
  
  cv.addEventListener('mouseleave',()=>{
    window.ScreenGenerator.dragging=null;
    window.ScreenGenerator.resizing=null;
  });
  
  cv.addEventListener('contextmenu',e=>{
    e.preventDefault();
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const hw=hitWidget(mx,my);
    if(hw){
      window.ScreenGenerator.selectedId=hw.id;
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.showCtx === 'function') window.ScreenGenerator.showCtx(e.clientX,e.clientY);
    }
  });

  // Обработчик колесика мыши для zoom
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -10 : 10; // Инвертируем для естественного направления
    const newZoom = currentZoom + delta;
    
    setZoom(newZoom);
  });

  // Также добавляем обработчик для всего cwrap на случай если курсор не на canvas
  const cwrap = window.ScreenGenerator.cwrap;
  cwrap.addEventListener('wheel', e => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -10 : 10;
    const newZoom = currentZoom + delta;
    
    setZoom(newZoom);
  });
}

// ═══════════════════════════════════════════════════════════════
// DRAG FROM PALETTE
// ═══════════════════════════════════════════════════════════════
function initDragFromPalette() {
  const { cx2b, cy2b, snap, addWidget } = window.ScreenGenerator;
  const ghost = document.getElementById('dghost');
  
  document.querySelectorAll('.witem').forEach(item=>{
    item.addEventListener('dragstart',e=>{
      window.ScreenGenerator.dType=item.dataset.type;
      window.ScreenGenerator.dMat=item.dataset.material;
      window.ScreenGenerator.isDragPal=true;
      ghost.style.display='flex';
      ghost.textContent=window.ScreenGenerator.dType.replace('_BUTTON','');
      e.dataTransfer.effectAllowed='copy';
    });
    item.addEventListener('dragend',()=>{
      window.ScreenGenerator.isDragPal=false;
      ghost.style.display='none';
    });
  });
  
  document.addEventListener('dragover',e=>{
    if(!window.ScreenGenerator.isDragPal)return;
    e.preventDefault();
    ghost.style.left=(e.clientX-26)+'px';
    ghost.style.top=(e.clientY-26)+'px';
  });
  
  const cwrap = window.ScreenGenerator.cwrap;
  cwrap.addEventListener('dragover',e=>e.preventDefault());
  cwrap.addEventListener('drop',e=>{
    e.preventDefault();
    if(!window.ScreenGenerator.isDragPal)return;
    const r=window.ScreenGenerator.cv.getBoundingClientRect();
    // Дропаем в позицию position[], translation=[0,0]
    const x=window.ScreenGenerator.snap(window.ScreenGenerator.cx2b(e.clientX-r.left));
    const y=window.ScreenGenerator.snap(window.ScreenGenerator.cy2b(e.clientY-r.top));
    window.ScreenGenerator.addWidget(window.ScreenGenerator.dType,window.ScreenGenerator.dMat,x,y);
    window.ScreenGenerator.isDragPal=false;
    ghost.style.display='none';
  });
}

// ═══════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════
function initKeyboardHandlers() {
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
    if((e.key==='Delete'||e.key==='Backspace')&&window.ScreenGenerator.selectedId){
      if(window.ScreenGenerator.selectedId==='__bg__') {
        // Фон нельзя удалить, только сбрасываем выбор
        window.ScreenGenerator.selectedId=null;
      } else {
        window.ScreenGenerator.widgets=window.ScreenGenerator.widgets.filter(w=>w.id!==window.ScreenGenerator.selectedId);
        window.ScreenGenerator.selectedId=null;
      }
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    }
    if(e.key==='Escape'){
      window.ScreenGenerator.selectedId=null;
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    }
    const step=e.shiftKey?0.5:window.ScreenGenerator.GSTEP();
    if(window.ScreenGenerator.selectedId&&window.ScreenGenerator.selectedId!=='__bg__'){
      const w=window.ScreenGenerator.widgets.find(x=>x.id===window.ScreenGenerator.selectedId);
      if(w){
        if(e.key==='ArrowLeft'){w.x=window.ScreenGenerator.snap(w.x-step);if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();}
        if(e.key==='ArrowRight'){w.x=window.ScreenGenerator.snap(w.x+step);if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();}
        if(e.key==='ArrowUp'){w.y=window.ScreenGenerator.snap(w.y+step);if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();}
        if(e.key==='ArrowDown'){w.y=window.ScreenGenerator.snap(w.y-step);if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();}
      }
    }
  });
}

// Grid toggle
function initGridToggle() {
  document.getElementById('gridToggle').addEventListener('change', () => {
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
  });
  document.getElementById('gridStepSelect').addEventListener('change', () => {
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
  });
}

// Инициализация всех обработчиков событий
function initAllEventHandlers() {
  initEventHandlers();
  initDragFromPalette();
  initKeyboardHandlers();
  initGridToggle();
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initEventHandlers,
  initDragFromPalette,
  initKeyboardHandlers,
  initGridToggle,
  initAllEventHandlers
});