// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS - Mouse, keyboard, and drag events
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// DRAGGING — двигаем position[], translation остаётся неизменным
// ═══════════════════════════════════════════════════════════════
function initEventHandlers() {
  const { 
    cv, cx2b, cy2b, snap, hitHandle, hitWidget, hitBg, 
    p2b, GSTEP
  } = window.ScreenGenerator;

  cv.addEventListener('mousemove', e => {
    const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    document.getElementById('curX').textContent=cx2b(mx).toFixed(2);
    document.getElementById('curY').textContent=cy2b(my).toFixed(2);
    const handle=hitHandle(mx,my);
    const HCUR={tl:'nw-resize',tr:'ne-resize',bl:'sw-resize',br:'se-resize',tm:'n-resize',bm:'s-resize',ml:'w-resize',mr:'e-resize'};
    
    // Устанавливаем курсор в зависимости от состояния
    if (window.ScreenGenerator.panning) {
      cv.style.cursor = 'grabbing';
    } else {
      cv.style.cursor = handle?(HCUR[handle]||'default'):hitWidget(mx,my)||hitBg(mx,my)?'move':'default';
    }

    // Обработка перемещения камеры
    if (window.ScreenGenerator.panning) {
      const panning = window.ScreenGenerator.panning;
      const dx = mx - panning.startX;
      const dy = my - panning.startY;
      
      window.ScreenGenerator.CC.x = panning.startCCX + dx;
      window.ScreenGenerator.CC.y = panning.startCCY + dy;
      
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      return;
    }

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
    
    // Tooltip при наведении на виджет
    const hovtip = document.getElementById('hovtip');
    if (hovtip && !window.ScreenGenerator.dragging && !window.ScreenGenerator.resizing && !window.ScreenGenerator.panning) {
      const hoveredWidget = hitWidget(mx, my);
      const hoveredBg = hitBg(mx, my);
      
      if (hoveredWidget) {
        const w = hoveredWidget;
        hovtip.innerHTML = `
          <div>id: ${w.id}</div>
          <div>pos: [${w.x.toFixed(2)}, ${w.y.toFixed(2)}]</div>
          <div>size: ${w.w.toFixed(2)} × ${w.h.toFixed(2)}</div>
        `;
        hovtip.style.left = (mx + 10) + 'px';
        hovtip.style.top = (my - 10) + 'px';
        hovtip.style.visibility = 'visible';
      } else if (hoveredBg && window.ScreenGenerator.background) {
        const bg = window.ScreenGenerator.background;
        hovtip.innerHTML = `
          <div>background</div>
          <div>pos: [${bg.posX.toFixed(2)}, ${bg.posY.toFixed(2)}]</div>
          <div>size: ${bg.w.toFixed(2)} × ${bg.h.toFixed(2)}</div>
        `;
        hovtip.style.left = (mx + 10) + 'px';
        hovtip.style.top = (my - 10) + 'px';
        hovtip.style.visibility = 'visible';
      } else {
        hovtip.style.visibility = 'hidden';
      }
    }
  });

  cv.addEventListener('mousedown', e => {
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    
    // Средняя кнопка мыши (колесико) - начинаем перемещение камеры
    if(e.button === 1) {
      e.preventDefault();
      window.ScreenGenerator.panning = {
        startX: mx,
        startY: my,
        startCCX: window.ScreenGenerator.CC.x,
        startCCY: window.ScreenGenerator.CC.y
      };
      return;
    }
    
    if(e.button===2) return;
    
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
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
      return;
    }
    if(hitBg(mx,my)){
      window.ScreenGenerator.selectedId='__bg__';
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
      // Начинаем перетаскивание только если фон не заблокирован
      if (!window.ScreenGenerator.background.locked) {
        window.ScreenGenerator.dragging={id:'__bg__',smx:mx,smy:my,sx:window.ScreenGenerator.background.posX,sy:window.ScreenGenerator.background.posY};
      }
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
      return;
    }
    window.ScreenGenerator.selectedId=null;
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
  });
  
  cv.addEventListener('mouseup',(e)=>{
    // Сохраняем в историю если было перетаскивание или изменение размера
    if (window.ScreenGenerator.dragging) {
      if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
        const id = window.ScreenGenerator.dragging.id;
        window.ScreenGenerator.saveState(`Move ${id === '__bg__' ? 'background' : id}`);
      }
    }
    if (window.ScreenGenerator.resizing) {
      if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
        window.ScreenGenerator.saveState(`Resize ${window.ScreenGenerator.resizing.id}`);
      }
    }
    
    // Завершаем все операции
    window.ScreenGenerator.dragging=null;
    window.ScreenGenerator.resizing=null;
    window.ScreenGenerator.panning=null;
  });
  
  cv.addEventListener('mouseleave',()=>{
    window.ScreenGenerator.dragging=null;
    window.ScreenGenerator.resizing=null;
    window.ScreenGenerator.panning=null;
    // Скрываем tooltip при выходе мыши с canvas
    const hovtip = document.getElementById('hovtip');
    if (hovtip) {
      hovtip.style.visibility = 'hidden';
    }
  });
  
  cv.addEventListener('contextmenu',e=>{
    e.preventDefault();
    const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
    const hw=hitWidget(mx,my);
    if(hw){
      window.ScreenGenerator.selectedId=hw.id;
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.showCtx === 'function') window.ScreenGenerator.showCtx(e.clientX,e.clientY);
    }
  });

  // Глобальные обработчики для средней кнопки мыши
  document.addEventListener('mouseup', (e) => {
    if (e.button === 1) { // Средняя кнопка
      window.ScreenGenerator.panning = null;
    }
  });

  // Предотвращаем стандартное поведение средней кнопки мыши
  cv.addEventListener('auxclick', (e) => {
    if (e.button === 1) {
      e.preventDefault();
    }
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
    // Более надежная проверка на поля ввода
    const isInputField = e.target.tagName === 'INPUT' || 
                        e.target.tagName === 'SELECT' || 
                        e.target.tagName === 'TEXTAREA' ||
                        e.target.contentEditable === 'true' ||
                        e.target.classList.contains('pinput') ||
                        e.target.closest('.pinput') ||
                        e.target.closest('.yaml-container');
    
    // Игнорируем события клавиатуры если фокус в полях ввода или YAML редакторе
    if(isInputField) return;
    
    // Zoom shortcuts
    if(e.key === '=' || e.key === '+') {
      e.preventDefault();
      const step = e.ctrlKey ? 5 : 10;
      window.ScreenGenerator.setZoom(window.ScreenGenerator.currentZoom + step);
      return;
    }
    if(e.key === '-' || e.key === '_') {
      e.preventDefault();
      const step = e.ctrlKey ? 5 : 10;
      window.ScreenGenerator.setZoom(window.ScreenGenerator.currentZoom - step);
      return;
    }
    if(e.key === '0' && e.ctrlKey) {
      e.preventDefault();
      window.ScreenGenerator.setZoom(120); // Reset to default
      return;
    }
    
    if((e.key==='Delete'||e.key==='Backspace')&&window.ScreenGenerator.selectedId){
      let deletedItem = null;
      
      if(window.ScreenGenerator.selectedId==='__bg__') {
        // Удаляем фон
        deletedItem = 'background';
        window.ScreenGenerator.background = null;
        window.ScreenGenerator.selectedId=null;
      } else {
        // Удаляем виджет
        const widget = window.ScreenGenerator.widgets.find(w => w.id === window.ScreenGenerator.selectedId);
        if (widget) {
          deletedItem = `${widget.type} (${widget.id})`;
          window.ScreenGenerator.widgets=window.ScreenGenerator.widgets.filter(w=>w.id!==window.ScreenGenerator.selectedId);
          window.ScreenGenerator.selectedId=null;
          
          // Пересчитываем оптимизацию после удаления виджета
          if (window.ScreenGenerator && typeof window.ScreenGenerator.calculateOptimization === 'function') {
            window.ScreenGenerator.calculateOptimization();
          }
        }
      }
      
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateAddBgButton === 'function') window.ScreenGenerator.updateAddBgButton();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
      
      // Сохраняем в историю
      if (deletedItem && window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
        window.ScreenGenerator.saveState(`Delete ${deletedItem} (Del key)`);
      }
    }
    if(e.key==='Escape'){
      window.ScreenGenerator.selectedId=null;
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlSelection === 'function') window.ScreenGenerator.updateYamlSelection();
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
    
    // Новые горячие клавиши
    if(e.ctrlKey && e.key === 'd' && window.ScreenGenerator.selectedId && window.ScreenGenerator.selectedId !== '__bg__') {
      e.preventDefault();
      // Дублировать выбранный виджет (как ctxDup)
      const w = window.ScreenGenerator.widgets.find(x => x.id === window.ScreenGenerator.selectedId);
      if (w) {
        const newWidget = JSON.parse(JSON.stringify(w));
        newWidget.id = `widget_${window.ScreenGenerator.nextId++}`;
        newWidget.x += 0.5; // Смещаем немного
        newWidget.y += 0.5;
        window.ScreenGenerator.widgets.push(newWidget);
        window.ScreenGenerator.selectedId = newWidget.id;
        if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
        if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
        if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
      }
    }
    
    if(e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      // Копировать YAML в буфер
      const yamlText = window.ScreenGenerator.plainYaml ? window.ScreenGenerator.plainYaml() : '';
      navigator.clipboard.writeText(yamlText).then(() => {
        if (window.showCopyToast) window.showCopyToast();
      });
    }
    
    if(e.key === 'g' || e.key === 'G') {
      // Переключить сетку
      const gridToggle = document.getElementById('gridToggle');
      if (gridToggle) {
        gridToggle.checked = !gridToggle.checked;
        if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      }
    }
    
    if(e.key === 'f' || e.key === 'F') {
      // Сфокусировать камеру на выбранном виджете
      if (window.ScreenGenerator.selectedId && window.ScreenGenerator.selectedId !== '__bg__') {
        const w = window.ScreenGenerator.widgets.find(x => x.id === window.ScreenGenerator.selectedId);
        if (w) {
          // Центрируем камеру на виджете
          const cv = document.getElementById('cv');
          if (cv) {
            window.ScreenGenerator.CC.x = cv.width / 2 - window.ScreenGenerator.b2p(w.x);
            window.ScreenGenerator.CC.y = cv.height / 2 + window.ScreenGenerator.b2p(w.y);
            if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
          }
        }
      } else if (window.ScreenGenerator.selectedId === '__bg__' && window.ScreenGenerator.background) {
        // Центрируем на фоне
        const cv = document.getElementById('cv');
        if (cv) {
          window.ScreenGenerator.CC.x = cv.width / 2 - window.ScreenGenerator.b2p(window.ScreenGenerator.background.posX);
          window.ScreenGenerator.CC.y = cv.height / 2 + window.ScreenGenerator.b2p(window.ScreenGenerator.background.posY);
          if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
        }
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