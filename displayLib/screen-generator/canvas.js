// ═══════════════════════════════════════════════════════════════
// CANVAS MANAGEMENT AND RENDERING
// ═══════════════════════════════════════════════════════════════

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const cwrap = document.getElementById('cwrap');

console.log('Canvas element:', cv);
console.log('Canvas context:', ctx);
console.log('Canvas wrapper:', cwrap);

function resize() {
  // Wait for layout to be ready
  requestAnimationFrame(() => {
    // Force layout recalculation
    cwrap.style.display = 'block';
    
    const rect = cwrap.getBoundingClientRect();
    console.log('cwrap dimensions:', rect.width, 'x', rect.height);
    
    // Ensure minimum dimensions and handle edge cases
    const width = Math.max(rect.width || 800, 400);
    const height = Math.max(rect.height || 600, 300);
    
    cv.width = width;
    cv.height = height;
    window.ScreenGenerator.CC.x = cv.width / 2;
    window.ScreenGenerator.CC.y = cv.height / 2;
    console.log('Canvas resized:', cv.width, 'x', cv.height);
    // Use setTimeout to ensure render function is available
    setTimeout(() => {
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') {
        window.ScreenGenerator.render();
      }
    }, 0);
  });
}

window.addEventListener('resize', resize);
// Add additional resize triggers
window.addEventListener('orientationchange', () => setTimeout(resize, 100));
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(resize, 50);
  }
});
setTimeout(resize, 50);

function render() {
  const { 
    widgets, background, selectedId, 
    b2p, GSTEP, b2cx, b2cy, CC, hexRgb,
    bgVisualRect, wVisualRect 
  } = window.ScreenGenerator;
  
  const W = cv.width, H = cv.height;
  console.log('Rendering canvas:', W, 'x', H);
  
  // Clear canvas
  ctx.clearRect(0,0,W,H);
  
  // Fill with background color
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);

  // Grid
  if (document.getElementById('gridToggle').checked) {
    const step = b2p(GSTEP());
    ctx.strokeStyle='rgba(42,51,68,0.65)'; ctx.lineWidth=0.5;
    for (let x=CC.x%step; x<W; x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=CC.y%step; y<H; y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    const big=b2p(1);
    ctx.strokeStyle='rgba(58,74,94,0.7)';
    for (let x=CC.x%big; x<W; x+=big){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for (let y=CC.y%big; y<H; y+=big){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }

  // Center axes
  ctx.strokeStyle='rgba(100,150,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(CC.x,0);ctx.lineTo(CC.x,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,CC.y);ctx.lineTo(W,CC.y);ctx.stroke();
  ctx.strokeStyle='rgba(100,150,255,0.65)'; ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(CC.x-8,CC.y);ctx.lineTo(CC.x+8,CC.y);ctx.stroke();
  ctx.beginPath();ctx.moveTo(CC.x,CC.y-8);ctx.lineTo(CC.x,CC.y+8);ctx.stroke();
  ctx.fillStyle='rgba(100,150,255,0.4)'; ctx.font='8px Cascadia Code';
  ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText('[0,0]', CC.x+4, CC.y+3);

  // Background
  if (background) {
    const g = bgVisualRect(background);
    const {r,g:gr,b} = hexRgb(background.colorHex);
    ctx.fillStyle=`rgba(${r},${gr},${b},${background.alpha/255})`;
    ctx.fillRect(g.px, g.py, g.pw, g.ph);

    const sel = selectedId==='__bg__';
    // Цвет границы: красный если заблокирован, зеленый если выбран, серый если нет
    let borderColor, borderWidth;
    if (background.locked) {
      borderColor = sel ? '#ef4444' : 'rgba(239,68,68,0.6)'; // Красный для заблокированного
      borderWidth = sel ? 2 : 1.5;
    } else {
      borderColor = sel ? '#1cee72' : 'rgba(28,238,114,0.3)'; // Зеленый как обычно
      borderWidth = sel ? 1.5 : 1;
    }
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    if (!sel) ctx.setLineDash([3,3]);
    ctx.strokeRect(g.px, g.py, g.pw, g.ph);
    ctx.setLineDash([]);
    
    // Иконка замка для заблокированного фона
    if (background.locked && sel) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px Cascadia Code';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('🔒', g.px + g.pw - 20, g.py + 15);
    }

    // Центр фона (визуальный)
    const bgCX = g.px + g.pw/2, bgCY = g.py + g.ph/2;
    ctx.strokeStyle='rgba(28,238,114,0.4)'; ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(bgCX-4,bgCY);ctx.lineTo(bgCX+4,bgCY);ctx.stroke();
    ctx.beginPath();ctx.moveTo(bgCX,bgCY-4);ctx.lineTo(bgCX,bgCY+4);ctx.stroke();

    // Точка entity (где стоит сама сущность в мире = position)
    const epx = b2cx(background.posX), epy = b2cy(background.posY);
    ctx.fillStyle='rgba(28,238,114,0.6)';
    ctx.beginPath();ctx.arc(epx, epy, 3, 0, Math.PI*2);ctx.fill();
    if (sel) {
      ctx.fillStyle='rgba(28,238,114,0.85)'; ctx.font='9px Cascadia Code';
      ctx.textAlign='left'; ctx.textBaseline='bottom';
      ctx.fillText(`BG ${background.w}×${background.h} blocks`, g.px, g.py-3);
      // Показываем стрелку от entity до visual если есть смещение
      const tx = background.transX + g.autoX;
      if (Math.abs(tx) > 0.01 || Math.abs(background.transY) > 0.01) {
        ctx.strokeStyle='rgba(28,238,114,0.4)'; ctx.lineWidth=1;
        ctx.setLineDash([2,2]);
        ctx.beginPath();ctx.moveTo(epx,epy);ctx.lineTo(bgCX,bgCY);ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
  
  // Widgets в порядке создания (без сортировки по zIndex)
  for (const w of widgets) {
    const g = wVisualRect(w);
    const sel = w.id===selectedId;

    // Тело виджета
    if (w.type === 'TEXT_BUTTON') {
      // Для TEXT_BUTTON показываем цветной фон
      const {r:rr,g:rg,b:rb} = hexRgb(w.color);
      ctx.fillStyle=`rgba(${rr},${rg},${rb},0.88)`;
      ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.fill();
    } else {
      // Для ITEM_BUTTON показываем только прозрачную границу
      ctx.fillStyle='rgba(0,0,0,0.1)'; // Очень слабый фон для видимости границ
      ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.fill();
    }

    // Граница
    ctx.strokeStyle = sel ? '#6496ff' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = sel ? 1.5 : 0.5;
    ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.stroke();

    // Текст/Рендер в виджете
    if (g.pw > 16 && w.type === 'TEXT_BUTTON') {
      // Только для текстовых кнопок показываем текст
      ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.85)';
      ctx.font=`bold ${Math.min(g.pw/5,11)}px Cascadia Code`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const lbl = w.label||w.text||'TEXT';
      ctx.fillText(lbl, g.px+g.pw/2, g.py+g.ph/2);
    }
    // Для ITEM_BUTTON текст не показываем - будет иконка в overlay

    // Точка entity (где стоит сущность в мире = position[x,y])
    // Для ITEM: это центр объекта
    // Для TEXT: это низ объекта по Y, центр по X
    const isText = w.type==='TEXT_BUTTON';
    const epx = b2cx(w.x), epy = b2cy(w.y);
    ctx.fillStyle = sel ? '#6496ff' : 'rgba(255,255,255,0.3)';
    ctx.beginPath();ctx.arc(epx, epy, 2.5, 0, Math.PI*2);ctx.fill();

    // Если есть translation — показываем стрелку entity→visual
    if (sel && (Math.abs(w.transX||0) > 0.01 || Math.abs(w.transY||0) > 0.01)) {
      const vcx = g.px + g.pw/2;
      const vcy = isText ? g.py+g.ph : g.py+g.ph/2;
      ctx.strokeStyle='rgba(100,150,255,0.35)'; ctx.lineWidth=1;
      ctx.setLineDash([2,2]);
      ctx.beginPath();ctx.moveTo(epx,epy);ctx.lineTo(vcx,vcy);ctx.stroke();
      ctx.setLineDash([]);
    }

    // Метка + handles когда выбран
    if (sel) {
      ctx.fillStyle='rgba(100,150,255,0.9)'; ctx.font='9px Cascadia Code';
      ctx.textAlign='left'; ctx.textBaseline='bottom';
      ctx.fillText(`${w.id}  pos[${w.x.toFixed(2)},${w.y.toFixed(2)}]`, g.px, g.py-3);

      const hpts=[
        {n:'tl',x:g.px,y:g.py},{n:'tm',x:g.px+g.pw/2,y:g.py},{n:'tr',x:g.px+g.pw,y:g.py},
        {n:'ml',x:g.px,y:g.py+g.ph/2},{n:'mr',x:g.px+g.pw,y:g.py+g.ph/2},
        {n:'bl',x:g.px,y:g.py+g.ph},{n:'bm',x:g.px+g.pw/2,y:g.py+g.ph},{n:'br',x:g.px+g.pw,y:g.py+g.ph}
      ];
      for (const h of hpts) {
        ctx.fillStyle='#6496ff';ctx.strokeStyle='#000';ctx.lineWidth=1;
        ctx.fillRect(h.x-4,h.y-4,8,8);ctx.strokeRect(h.x-4,h.y-4,8,8);
      }
    }
  }

  // Update widget overlays to show Minecraft renders
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetOverlays === 'function') {
    window.ScreenGenerator.updateWidgetOverlays();
  }
  // Update tolerance zones overlay (поверх иконок)
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateToleranceOverlay === 'function') {
    window.ScreenGenerator.updateToleranceOverlay();
  }
  
  // Update other UI components
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') {
    window.ScreenGenerator.updateWidgetList();
  }
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml === 'function') {
    window.ScreenGenerator.updateYaml();
  }
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateEmpty === 'function') {
    window.ScreenGenerator.updateEmpty();
  }
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  cv, ctx, cwrap, resize, render
});