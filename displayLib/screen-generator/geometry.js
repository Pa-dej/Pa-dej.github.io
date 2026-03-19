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
  const { b2p, b2cx, b2cy, mcBgSize, MC_BG_PADDING, MC_TEXT_SCALE } = window.ScreenGenerator;
  
  const scaleX = bg.w * 8;
  const scaleY = bg.h * 4;
  
  // Вычисляем реальный размер фона " " как в Minecraft
  const size = mcBgSize(' ', scaleX, scaleY);
  const pw = b2p(size.w);
  const ph = b2p(size.h);
  
  // autoX для справки (показываем в панели свойств, но НЕ применяем в редакторе)
  const autoX = -(scaleX) / 80;
  
  // В редакторе показываем фон БЕЗ autoX - пользователь сам управляет позицией
  const vx = bg.posX + bg.transX; // визуальный центр X без autoX
  const vy = bg.posY + bg.transY;
  
  // Anchor TextDisplay: entity X = центр, entity Y = низ+1px
  const anchorOffsetY = MC_BG_PADDING * MC_TEXT_SCALE;
  const cx = b2cx(vx);
  const bot = b2cy(vy + anchorOffsetY);
  
  return {
    px: cx - pw / 2,
    py: bot - ph,
    pw,
    ph,
    entityX: bg.posX,
    entityY: bg.posY,
    autoX // сохраняем для отображения в свойствах
  };
}

function wVisualRect(w) {
  const { b2p, b2cx, b2cy, mcBgSize, MC_BG_PADDING, MC_TEXT_SCALE } = window.ScreenGenerator;
  
  if (w.type === 'TEXT_BUTTON') {
    // YAML scale для TEXT_BUTTON = [w*8, h*4, 1]
    const scaleX = w.w * 8;
    const scaleY = w.h * 4;
    
    // Вычисляем реальный размер фона как в Minecraft
    const bg = mcBgSize(w.text || ' ', scaleX, scaleY);
    const pw = b2p(bg.w);
    const ph = b2p(bg.h);
    
    // TextDisplay anchor: entity X = центр по горизонтали, entity Y = низ фона + 1px padding
    // В блоках: bottom = entityY + MC_BG_PADDING * MC_TEXT_SCALE
    const anchorOffsetY = MC_BG_PADDING * MC_TEXT_SCALE; // ≈ 0.025 блока
    
    const vx = w.x + (w.transX || 0);
    const vy = w.y + (w.transY || 0);
    
    // px/py — верхний левый угол прямоугольника фона на canvas
    const px = b2cx(vx) - pw / 2;
    const py = b2cy(vy + anchorOffsetY) - ph; // фон выше точки entity
    
    return { px, py, pw, ph };
  } else {
    // ITEM_BUTTON: anchor = CENTER, размер = w×h блоков напрямую
    const pw = b2p(w.w);
    const ph = b2p(w.h);
    const vx = w.x + (w.transX || 0);
    const vy = w.y + (w.transY || 0);
    const px = b2cx(vx) - pw / 2;
    const py = b2cy(vy) - ph / 2;
    return { px, py, pw, ph };
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