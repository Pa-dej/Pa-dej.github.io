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
    
    // Ensure minimum dimensions and handle edge cases
    const width = Math.max(rect.width || 800, 400);
    const height = Math.max(rect.height || 600, 300);
    
    cv.width = width;
    cv.height = height;
    window.ScreenGenerator.CC.x = cv.width / 2;
    window.ScreenGenerator.CC.y = cv.height / 2;
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
    bgVisualRect, wVisualRect,
    MC_TEXT_SCALE, MC_FONT_PX, MC_BG_PAD, MC_LINE_HEIGHT, PPB, mcBgSizeBlocks
  } = window.ScreenGenerator;
  
  const W = cv.width, H = cv.height;
  
  // Clear canvas
  ctx.clearRect(0,0,W,H);
  
  // Pixel-perfect rendering
  ctx.imageSmoothingEnabled = false;
  
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
      const g = wVisualRect(w);
      const sel = w.id === selectedId;

      // ─── Фон ───────────────────────────────────────────────────
      const {r, g: cg, b} = hexRgb(w.color);
      // backgroundAlpha хранится в диапазоне 0-255, canvas хочет 0.0-1.0
      const bgA = (w.backgroundAlpha !== undefined ? w.backgroundAlpha : 150) / 255;
      ctx.fillStyle = `rgba(${r},${cg},${b},${bgA})`;
      ctx.fillRect(g.px, g.py, g.pw, g.ph);

      // ─── Текст (шрифт Minecraftia/Minecraft Rus, масштабированный под zoom) ───
      if (g.pw > 6 && g.ph > 4) {
        const scaleY = w.h * 4;
        // Размер шрифта в canvas-пикселях: 8 font-px * TEXT_SCALE * scaleY * PPB()
        const fontSizePx = MC_FONT_PX * MC_TEXT_SCALE * scaleY * PPB();
        const font = window.ScreenGenerator.getMinecraftFont(w.text || w.label || '');

        ctx.save();
        ctx.font = `${fontSizePx}px ${font}`;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        
        // Устанавливаем выравнивание текста
        const alignment = w.alignment || 'CENTERED';
        if (alignment === 'LEFT') {
          ctx.textAlign = 'left';
        } else if (alignment === 'RIGHT') {
          ctx.textAlign = 'right';
        } else {
          ctx.textAlign = 'center'; // CENTERED
        }
        
        ctx.textBaseline = 'top';
        ctx.imageSmoothingEnabled = false; // пиксельный шрифт — без сглаживания

        const lines = (w.text || '').split('\n');
        const lineHeightPx = MC_LINE_HEIGHT * MC_TEXT_SCALE * scaleY * PPB();
        const padPx = MC_BG_PAD * MC_TEXT_SCALE * scaleY * PPB();

        // Вычисляем X координату в зависимости от выравнивания
        let textX;
        if (alignment === 'LEFT') {
          textX = g.px + padPx;
        } else if (alignment === 'RIGHT') {
          textX = g.px + g.pw - padPx;
        } else {
          textX = g.px + g.pw / 2; // CENTER
        }
        
        const textTopY = g.py + padPx;

        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], textX, textTopY + i * lineHeightPx);
        }
        ctx.restore();
      }

      // ─── Граница выделения ─────────────────────────────────────
      ctx.strokeStyle = sel ? '#6496ff' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = sel ? 1.5 : 0.5;
      ctx.strokeRect(g.px, g.py, g.pw, g.ph);

      // ─── Точка entity (якорь) ──────────────────────────────────
      const epx = b2cx(w.x);
      const epy = b2cy(w.y);
      ctx.fillStyle = sel ? '#6496ff' : 'rgba(100,150,255,0.35)';
      ctx.beginPath();
      ctx.arc(epx, epy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // ─── Метка + handles при выделении ────────────────────────
      if (sel) {
        const scaleX = w.w * 8;
        const scaleY = w.h * 4;
        const bg = mcBgSizeBlocks(w.text || ' ', scaleX, scaleY);

        ctx.fillStyle = 'rgba(100,150,255,0.9)';
        ctx.font = '9px Cascadia Code';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(
          `${w.id}  pos[${w.x.toFixed(2)},${w.y.toFixed(2)}]  ${bg.w.toFixed(3)}×${bg.h.toFixed(3)}b`,
          g.px, g.py - 3
        );
        
        // Resize handles
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

      continue; // переходим к следующему виджету
    }
    
    // ITEM_BUTTON рендеринг
    {
      // Для ITEM_BUTTON показываем только прозрачную границу
      ctx.fillStyle='rgba(0,0,0,0.1)'; // Очень слабый фон для видимости границ
      ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.fill();
      
      // Граница
      ctx.strokeStyle = sel ? '#6496ff' : 'rgba(255,255,255,0.1)';
      ctx.lineWidth = sel ? 1.5 : 0.5;
      ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.stroke();

      // Точка entity (где стоит сущность в мире = position[x,y])
      const epx = b2cx(w.x), epy = b2cy(w.y);
      ctx.fillStyle = sel ? '#6496ff' : 'rgba(255,255,255,0.3)';
      ctx.beginPath();ctx.arc(epx, epy, 2.5, 0, Math.PI*2);ctx.fill();

      // Если есть translation — показываем стрелку entity→visual
      if (sel && (Math.abs(w.transX||0) > 0.01 || Math.abs(w.transY||0) > 0.01)) {
        const vcx = g.px + g.pw/2;
        const vcy = g.py+g.ph/2;
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