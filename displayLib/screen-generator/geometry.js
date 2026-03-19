// ═══════════════════════════════════════════════════════════════
// GEOMETRY AND WIDGET POSITIONING
// ═══════════════════════════════════════════════════════════════

// Функции будут доступны через window.ScreenGenerator после загрузки core.js

// ═══════════════════════════════════════════════════════════════
// ГЕОМЕТРИЯ ВИДЖЕТОВ
// 
// Позиция entity в мире = position[x,y] (это то что рисуем как точку)
// Визуальная позиция = позиция entity + translation (локальный сдвиг)
//
// ITEM_BUTTON:
//   Entity anchor = CENTER
//   Отображаем rect: center = entity_pos + translation
//   (translation обычно [0,0] для item)
//
// TEXT_BUTTON (и фон):
//   Entity anchor = CENTER по X, НИЗ по Y (TextDisplay специфика)
//   translation для фона: autoX = -scaleX/80; transY сдвигает вниз
//   Реально: entity стоит в pos, текстура рисуется от bottom вверх
//   translation[0] смещает по X, translation[1] смещает по Y
//   (для центрирования по Y → transY = -h/2)
//
// Визуальный left-top прямоугольника:
//   ITEM: left = b2cx(pos.x + trans.x) - pw/2
//         top  = b2cy(pos.y + trans.y) - ph/2
//   TEXT: left = b2cx(pos.x + trans.x) - pw/2  [anchor X = center]
//         bottom_px = b2cy(pos.y + trans.y)     [anchor Y = bottom]
//         top = bottom_px - ph
//
//   Для фона autoX = -(w*8)/80 = -w/10 добавляется к transX
// ═══════════════════════════════════════════════════════════════

function bgVisualRect(bg) {
  const { b2p, b2cx, b2cy } = window.ScreenGenerator;
  
  // Как было в коммите f86e8c1: фон использует anchor BOTTOM по Y
  const autoX = -(bg.w * 8) / 80; // сохраняем только для YAML hint
  const vx = bg.posX + bg.transX;  // визуальный CENTER X (без autoX в превью)
  const vy = bg.posY + bg.transY;  // визуальный BOTTOM Y
  const pw = b2p(bg.w), ph = b2p(bg.h);
  const cx = b2cx(vx);
  const bot = b2cy(vy);
  
  return { 
    px: cx - pw/2, 
    py: bot - ph, 
    pw, ph,
    entityX: bg.posX, 
    entityY: bg.posY,
    autoX 
  };
}

function wVisualRect(w) {
  const { b2p, b2cx, b2cy, mcBgSizeBlocks, MC_BG_PAD, MC_TEXT_SCALE } = window.ScreenGenerator;
  
  if (w.type === 'TEXT_BUTTON') {
    const scaleX = w.w * 8;
    const scaleY = w.h * 4;
    const bg = mcBgSizeBlocks(w.text || ' ', scaleX, scaleY);
    
    const pw = b2p(bg.w);
    const ph = b2p(bg.h);
    
    // Визуальная позиция с учётом translation
    const vx = w.x + (w.transX || 0);
    const vy = w.y + (w.transY || 0);
    
    // Anchor: X = центр, Y = низ фона + 1px padding (= low edge of bg box)
    // entity Y совпадает с нижней внутренней границей фона (до нижнего padding)
    const anchorOffsetY = MC_BG_PAD * MC_TEXT_SCALE; // ≈ 0.025 блока
    
    const px = b2cx(vx) - pw / 2;
    const py = b2cy(vy + anchorOffsetY) - ph;
    
    return { px, py, pw, ph };
  } else {
    // ITEM_BUTTON: anchor = CENTER
    const pw = b2p(w.w);
    const ph = b2p(w.h);
    const vx = w.x + (w.transX || 0);
    const vy = w.y + (w.transY || 0);
    return {
      px: b2cx(vx) - pw / 2,
      py: b2cy(vy) - ph / 2,
      pw, ph
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// HIT TEST — по визуальному прямоугольнику
// ═══════════════════════════════════════════════════════════════
function hitHandle(mx,my) {
  const { selectedId, widgets } = window.ScreenGenerator;
  if (!selectedId || selectedId==='__bg__') return null;
  const w = widgets.find(x=>x.id===selectedId); if (!w) return null;
  const g = wVisualRect(w);
  const hpts=[
    {n:'tl',x:g.px,y:g.py},{n:'tm',x:g.px+g.pw/2,y:g.py},{n:'tr',x:g.px+g.pw,y:g.py},
    {n:'ml',x:g.px,y:g.py+g.ph/2},{n:'mr',x:g.px+g.pw,y:g.py+g.ph/2},
    {n:'bl',x:g.px,y:g.py+g.ph},{n:'bm',x:g.px+g.pw/2,y:g.py+g.ph},{n:'br',x:g.px+g.pw,y:g.py+g.ph}
  ];
  for (const h of hpts) if (Math.abs(mx-h.x)<7&&Math.abs(my-h.y)<7) return h.n;
  return null;
}

function hitWidget(mx,my) {
  const { widgets } = window.ScreenGenerator;
  const sorted=[...widgets].sort((a,b)=>b.zIndex-a.zIndex);
  for (const w of sorted) { const g=wVisualRect(w); if(mx>=g.px&&mx<=g.px+g.pw&&my>=g.py&&my<=g.py+g.ph) return w; }
  return null;
}

function hitBg(mx,my) {
  const { background } = window.ScreenGenerator;
  if (!background) return false;
  const g=bgVisualRect(background);
  return mx>=g.px&&mx<=g.px+g.pw&&my>=g.py&&my<=g.py+g.ph;
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  bgVisualRect,
  wVisualRect,
  hitHandle,
  hitWidget,
  hitBg
});

console.log('Geometry functions exported:', {
  bgVisualRect: typeof bgVisualRect,
  wVisualRect: typeof wVisualRect
});