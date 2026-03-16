// ═══════════════════════════════════════════════════════════════
// КАК РАБОТАЕТ ПОЗИЦИОНИРОВАНИЕ В DISPLAYLIB (из исходного кода):
//
// ScreenInstance.resolveLocation(float[] pos):
//   base = screenLocation
//   right = dir.crossProduct(up).normalize()   // горизонталь
//   up = right.crossProduct(dir).normalize()   // вертикаль  
//   base.add(right * pos[0])   // X YAML → горизонталь
//   base.add(up * pos[1])      // Y YAML → вертикаль  
//   base.add(dir * pos[2])     // Z YAML → глубина
//
// Итог: position[] задаёт МИРОВУЮ позицию Display entity.
// Это то, куда телепортируется сама сущность.
//
// translation[] задаёт параметр Transformation.translation внутри Display.
// Это ЛОКАЛЬНЫЙ сдвиг модели внутри сущности, НЕ мировая позиция.
//
// TextDisplayButtonWidget.spawn():
//   display.setTransformation(new Transformation(
//     translation,  ← float[] из YAML, напрямую
//     ...scale...
//   ))
//
// Для фона TransformationUtil.createAlignedTranslation(scaleX, tr):
//   finalX = (-scaleX/80) + tr[0]    ← авто выравнивание по X
//   finalY = tr[1]
//   finalZ = tr[2]
//
// ANCHOR POINTS (из анализа TextDisplay рендера):
//   TextDisplay (фон, TEXT_BUTTON):
//     - Anchor = ЛЕВЫЙ НИЖНИЙ угол для текстового дисплея с текстом " "
//     - Но после scale(scaleX, scaleY) → визуальный центр по X, низ по Y
//     - Поэтому translation: [0, -transY, 0] нужен для вертикального центрирования
//
//   ItemDisplay (ITEM_BUTTON, BLOCK_BUTTON):
//     - Anchor = CENTER (из DefaultItem: getOffset(CENTER, scale*2))
//     - position[0,0,0] = центр сущности в центре экрана
//
// В конструкторе:
//   [0,0] на холсте = место где стоит Display entity
//   position[x,y] = смещение entity от центра экрана
//   translation[x,y] = внутренний сдвиг модели (НЕ влияет на мировую позицию entity)
//
// Для превью translation нужно добавлять ВИЗУАЛЬНО к позиции entity,
// потому что в игре translation сдвигает то как модель выглядит.
// Для TextDisplay с scale=[8,4,1] и translation=[0,-0.5,0]:
//   - Entity стоит в position[0,0,0]
//   - Модель внутри сдвинута на -0.5 блока вниз
//   - Визуально фон центрирован по Y
// ═══════════════════════════════════════════════════════════════

const PPB = () => parseInt(document.getElementById('zoomSel').value);
const GSTEP = () => parseFloat(document.getElementById('gridStep').value) || 0.25;

// Хранение виджетов:
// x,y        = position[0], position[1] из YAML (мировое смещение от центра)
// transX,transY = translation[0], translation[1] из YAML (локальный сдвиг Transformation)
// w,h        = размер в блоках
// Для ITEM: scale=[w,h,w] в YAML
// Для TEXT/BG: YAML scale = [w*8, h*4, 1]; отображаемый размер = w×h блоков
let widgets = [];
let background = null;
let selectedId = null;
let nextId = 1;
let CC = {x:0, y:0};

let dType=null, dMat=null, isDragPal=false;
const ghost = document.getElementById('dghost');
let dragging=null, resizing=null;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const cwrap = document.getElementById('cwrap');

console.log('Canvas element:', cv);
console.log('Canvas context:', ctx);
console.log('Canvas wrapper:', cwrap);
function resize() {
  // Wait for layout to be ready
  requestAnimationFrame(() => {
    const rect = cwrap.getBoundingClientRect();
    console.log('cwrap dimensions:', rect.width, 'x', rect.height);
    
    cv.width = Math.max(rect.width, 100); // Minimum width of 100px
    cv.height = Math.max(rect.height, 100); // Minimum height of 100px
    CC.x = cv.width / 2;
    CC.y = cv.height / 2;
    console.log('Canvas resized:', cv.width, 'x', cv.height);
    render();
  });
}
window.addEventListener('resize', resize);
setTimeout(resize, 50);

const b2p = b => b * PPB();
const p2b = p => p / PPB();
const snap = v => {
  if (!document.getElementById('gridToggle').checked) return v;
  const s = GSTEP();
  return Math.round(v / s) * s;
};

// block→canvas: center=[0,0] → CC pixels, Y inverted
const b2cx = bx => CC.x + b2p(bx);
const b2cy = by => CC.y - b2p(by);
const cx2b = px => p2b(px - CC.x);
const cy2b = py => p2b(CC.y - py);

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
  // В игре: TextDisplay с scale=[8,4,1] имеет autoX = -scaleX/80 = -w/10
  // Это ВНУТРЕННЯЯ коррекция рендера TextDisplay, она компенсирует то что
  // текстовый дисплей с пробелом " " не идеально центрирован.
  // Эффект autoX в пикселях: -w/10 блока = очень маленький сдвиг (~3px при zoom=80).
  // Для превью его учитывать не нужно — визуально он незаметен.
  // Фон рендерится центрированным по posX + transX.
  const autoX = -(bg.w * 8) / 80; // сохраняем только для YAML hint
  const vx = bg.posX + bg.transX;  // визуальный CENTER X (без autoX в превью)
  const vy = bg.posY + bg.transY;  // визуальный BOTTOM Y
  const pw = b2p(bg.w), ph = b2p(bg.h);
  const cx = b2cx(vx);
  const bot = b2cy(vy);
  return { px: cx - pw/2, py: bot - ph, pw, ph,
           entityX: bg.posX, entityY: bg.posY,
           autoX };
}

function wVisualRect(w) {
  const pw = b2p(w.w), ph = b2p(w.h);
  const isText = w.type === 'TEXT_BUTTON';
  const vx = w.x + (w.transX || 0);
  const vy = w.y + (w.transY || 0);
  let px, py;
  if (isText) {
    // TextDisplay: anchor = CENTER по X, НИЗ по Y
    px = b2cx(vx) - pw/2;
    py = b2cy(vy) - ph;
  } else {
    // ItemDisplay / BlockDisplay: anchor = CENTER
    px = b2cx(vx) - pw/2;
    py = b2cy(vy) - ph/2;
  }
  return { px, py, pw, ph };
}
// ═══════════════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════════════
function hexRgb(h) {
  return { r:parseInt(h.slice(1,3),16), g:parseInt(h.slice(3,5),16), b:parseInt(h.slice(5,7),16) };
}

function render() {
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
    ctx.strokeStyle = sel ? '#1cee72' : 'rgba(28,238,114,0.3)';
    ctx.lineWidth = sel ? 1.5 : 1;
    if (!sel) ctx.setLineDash([3,3]);
    ctx.strokeRect(g.px, g.py, g.pw, g.ph);
    ctx.setLineDash([]);

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
  // Widgets sorted by zIndex
  const sorted = [...widgets].sort((a,b)=>a.zIndex-b.zIndex);
  for (const w of sorted) {
    const g = wVisualRect(w);
    const sel = w.id===selectedId;

    // Тело виджета
    const {r:rr,g:rg,b:rb} = hexRgb(w.color);
    ctx.fillStyle=`rgba(${rr},${rg},${rb},0.88)`;
    ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.fill();

    // Граница
    ctx.strokeStyle = sel ? '#6496ff' : 'rgba(255,255,255,0.1)';
    ctx.lineWidth = sel ? 1.5 : 0.5;
    ctx.beginPath();ctx.roundRect(g.px,g.py,g.pw,g.ph,3);ctx.stroke();

    // Текст
    if (g.pw > 16) {
      ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.85)';
      ctx.font=`bold ${Math.min(g.pw/5,11)}px Cascadia Code`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      const lbl = w.type==='TEXT_BUTTON'?(w.label||w.text||'TEXT'):(w.material||'ITEM').replace(/_/g,' ').slice(0,9);
      ctx.fillText(lbl, g.px+g.pw/2, g.py+g.ph/2);
    }

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

  updateLayers();
  updateYaml();
  updateEmpty();
}
// ═══════════════════════════════════════════════════════════════
// HIT TEST — по визуальному прямоугольнику
// ═══════════════════════════════════════════════════════════════
function hitHandle(mx,my) {
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
  const sorted=[...widgets].sort((a,b)=>b.zIndex-a.zIndex);
  for (const w of sorted) { const g=wVisualRect(w); if(mx>=g.px&&mx<=g.px+g.pw&&my>=g.py&&my<=g.py+g.ph) return w; }
  return null;
}
function hitBg(mx,my) {
  if (!background) return false;
  const g=bgVisualRect(background);
  return mx>=g.px&&mx<=g.px+g.pw&&my>=g.py&&my<=g.py+g.ph;
}

// ═══════════════════════════════════════════════════════════════
// DRAGGING — двигаем position[], translation остаётся неизменным
// ═══════════════════════════════════════════════════════════════
cv.addEventListener('mousemove', e => {
  const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
  document.getElementById('curX').textContent=cx2b(mx).toFixed(2);
  document.getElementById('curY').textContent=cy2b(my).toFixed(2);
  const handle=hitHandle(mx,my);
  const HCUR={tl:'nw-resize',tr:'ne-resize',bl:'sw-resize',br:'se-resize',tm:'n-resize',bm:'s-resize',ml:'w-resize',mr:'e-resize'};
  cv.style.cursor = handle?(HCUR[handle]||'default'):hitWidget(mx,my)||hitBg(mx,my)?'move':'default';

  if (dragging) {
    const dx=p2b(mx-dragging.smx), dy=p2b(-(my-dragging.smy));
    if (dragging.id==='__bg__') { background.posX=snap(dragging.sx+dx); background.posY=snap(dragging.sy+dy); }
    else { const w=widgets.find(x=>x.id===dragging.id); if(w){w.x=snap(dragging.sx+dx);w.y=snap(dragging.sy+dy);} }
    render(); if(selectedId) updateProps();
  }
  if (resizing) {
    const dx=p2b(mx-resizing.smx), dy=p2b(my-resizing.smy);
    const w=widgets.find(x=>x.id===resizing.id);
    if (w) {
      let nW=resizing.sw,nH=resizing.sh,nX=resizing.sx,nY=resizing.sy;
      const h=resizing.handle;
      if(h.includes('r')) nW=Math.max(0.125,snap(resizing.sw+dx));
      if(h.includes('l')){nW=Math.max(0.125,snap(resizing.sw-dx));nX=snap(resizing.sx+dx);}
      if(h.includes('b')) nH=Math.max(0.125,snap(resizing.sh+dy));
      if(h.includes('t')){nH=Math.max(0.125,snap(resizing.sh-dy));nY=snap(resizing.sy-dy);}
      w.w=nW;w.h=nH;w.x=nX;w.y=nY;
      render(); updateProps();
    }
  }
});

cv.addEventListener('mousedown', e => {
  if(e.button===2) return;
  const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const handle=hitHandle(mx,my);
  if(handle&&selectedId){
    const w=widgets.find(x=>x.id===selectedId);
    if(w) resizing={id:w.id,handle,smx:mx,smy:my,sw:w.w,sh:w.h,sx:w.x,sy:w.y};
    return;
  }
  const hw=hitWidget(mx,my);
  if(hw){selectedId=hw.id;dragging={id:hw.id,smx:mx,smy:my,sx:hw.x,sy:hw.y};render();updateProps();return;}
  if(hitBg(mx,my)){selectedId='__bg__';dragging={id:'__bg__',smx:mx,smy:my,sx:background.posX,sy:background.posY};render();updateProps();return;}
  selectedId=null;render();updateProps();
});
cv.addEventListener('mouseup',()=>{dragging=null;resizing=null;});
cv.addEventListener('mouseleave',()=>{dragging=null;resizing=null;});
cv.addEventListener('contextmenu',e=>{
  e.preventDefault();
  const r=cv.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;
  const hw=hitWidget(mx,my);
  if(hw){selectedId=hw.id;render();updateProps();showCtx(e.clientX,e.clientY);}
});
// ═══════════════════════════════════════════════════════════════
// DRAG FROM PALETTE
// ═══════════════════════════════════════════════════════════════
document.querySelectorAll('.witem').forEach(item=>{
  item.addEventListener('dragstart',e=>{
    dType=item.dataset.type;dMat=item.dataset.material;isDragPal=true;
    ghost.style.display='flex';ghost.textContent=dType.replace('_BUTTON','');
    e.dataTransfer.effectAllowed='copy';
  });
  item.addEventListener('dragend',()=>{isDragPal=false;ghost.style.display='none';});
});
document.addEventListener('dragover',e=>{if(!isDragPal)return;e.preventDefault();ghost.style.left=(e.clientX-26)+'px';ghost.style.top=(e.clientY-26)+'px';});
cwrap.addEventListener('dragover',e=>e.preventDefault());
cwrap.addEventListener('drop',e=>{
  e.preventDefault();if(!isDragPal)return;
  const r=cv.getBoundingClientRect();
  // Дропаем в позицию position[], translation=[0,0]
  const x=snap(cx2b(e.clientX-r.left));
  const y=snap(cy2b(e.clientY-r.top));
  addWidget(dType,dMat,x,y);
  isDragPal=false;ghost.style.display='none';
});

// ═══════════════════════════════════════════════════════════════
// ADD WIDGET
// ═══════════════════════════════════════════════════════════════
const MATCOL={
  RED_STAINED_GLASS_PANE:'#cc3333',BLUE_STAINED_GLASS_PANE:'#3366cc',
  GREEN_STAINED_GLASS_PANE:'#33aa44',YELLOW_STAINED_GLASS_PANE:'#ddcc33',
  PURPLE_STAINED_GLASS_PANE:'#883399',WHITE_STAINED_GLASS_PANE:'#cccccc',
  BLACK_STAINED_GLASS_PANE:'#111111',STONE:'#888888',DIAMOND:'#44ddcc',
  GOLD_BLOCK:'#ddaa00',IRON_BLOCK:'#aaaaaa',EMERALD_BLOCK:'#00cc55',
  GRASS_BLOCK:'#558833',OAK_LOG:'#8a6a3c',BEACON:'#55ddcc',NETHERITE_BLOCK:'#3a2a3a'
};
function matCol(m){return MATCOL[m]||'#7c3aed';}

function addWidget(type,mat,x=0,y=0){
  const id=`widget_${nextId++}`;
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
    onClick:'CLOSE_SCREEN',tolerance:[0.15,0.15],zIndex:widgets.length
  });
  selectedId=id;render();updateProps();
}

document.getElementById('btnAddBg').addEventListener('click',()=>{
  if(!background) background={w:4,h:3,colorHex:'#111827',alpha:160,posX:0,posY:0,transX:0,transY:-1.5};
  selectedId='__bg__';render();updateProps();
});
document.getElementById('btnClear').addEventListener('click',()=>{
  if(confirm('Очистить?')){widgets=[];background=null;selectedId=null;nextId=1;render();updateProps();}
});
// ═══════════════════════════════════════════════════════════════
// KEYBOARD
// ═══════════════════════════════════════════════════════════════
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT') return;
  if((e.key==='Delete'||e.key==='Backspace')&&selectedId){
    if(selectedId==='__bg__') background=null; else widgets=widgets.filter(w=>w.id!==selectedId);
    selectedId=null;render();updateProps();
  }
  if(e.key==='Escape'){selectedId=null;render();updateProps();}
  const step=e.shiftKey?0.5:GSTEP();
  if(selectedId&&selectedId!=='__bg__'){
    const w=widgets.find(x=>x.id===selectedId);
    if(w){
      if(e.key==='ArrowLeft'){w.x=snap(w.x-step);render();updateProps();}
      if(e.key==='ArrowRight'){w.x=snap(w.x+step);render();updateProps();}
      if(e.key==='ArrowUp'){w.y=snap(w.y+step);render();updateProps();}
      if(e.key==='ArrowDown'){w.y=snap(w.y-step);render();updateProps();}
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// PROPERTIES PANEL
// ═══════════════════════════════════════════════════════════════
function updateProps(){
  const p=document.getElementById('propPanel');
  if(!selectedId){p.innerHTML='<div class="nsm">Выберите элемент<br>для редактирования</div>';return;}
  if(selectedId==='__bg__') renderBgProps(p);
  else{const w=widgets.find(x=>x.id===selectedId);if(w)renderWProps(p,w);}
}
const row=(lbl,inp)=>`<div class="prow"><div class="plabel">${lbl}</div>${inp}</div>`;
const numIn=(id,v,step=0.05,min='')=>`<input class="pinput" type="number" id="${id}" value="${typeof v==='number'?+v.toFixed(4):v}" step="${step}" ${min!==''?`min="${min}"`:''}  >`;
const txtIn=(id,v)=>`<input class="pinput" type="text" id="${id}" value="${v}">`;
const selIn=(id,v,opts)=>`<select class="pselect" id="${id}">${opts.map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`;
const colIn=(id,v)=>`<input class="pinput" type="color" id="${id}" value="${v}">`;
const bind=(id,fn)=>{const el=document.getElementById(id);if(el)el.addEventListener('input',e=>fn(e.target.value));};

function renderBgProps(p){
  const bg=background;
  const autoX=-(bg.w*8)/80;
  const finX=(bg.posX+bg.transX+autoX).toFixed(3);
  const finY=(bg.posY+bg.transY).toFixed(3);
  p.innerHTML=`
    <div class="pgroup">
      <div class="pgtitle">🟩 Background</div>
      <div class="pgbody">
        <div class="phint">
          Anchor: <span class="hl">center-X, bottom-Y</span><br>
          AutoX = -(${bg.w}×8)/80 = <span class="hl">${autoX.toFixed(4)}</span><br>
          Визуал: X=<span class="hl">${finX}</span> (center) Y=<span class="hl">${finY}</span> (bottom)
        </div>
        ${row('Ширина', numIn('bg_w',bg.w,0.5,0.5))}
        ${row('Высота', numIn('bg_h',bg.h,0.5,0.5))}
        ${row('Цвет', colIn('bg_col',bg.colorHex))}
        ${row('Alpha', `<input class="pinput" type="range" id="bg_al" min="0" max="255" value="${bg.alpha}" style="flex:1">`)}
        <div style="font-size:9px;color:var(--text3);text-align:right">alpha: ${bg.alpha}</div>
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">📍 position[] — мировая позиция entity</div>
      <div class="pgbody">
        <div class="phint"><span class="wa">position = где стоит Display entity в мире</span><br>Смещение от центра экрана игрока</div>
        ${row('posX', numIn('bg_px',bg.posX))}
        ${row('posY', numIn('bg_py',bg.posY))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">↔ translation[] — Transformation сдвиг</div>
      <div class="pgbody">
        <div class="phint"><span class="ok">translation = локальный сдвиг модели внутри entity</span><br>
        transX: <span class="hl">авто -${((bg.w*8)/80).toFixed(3)}</span> + ${bg.transX}<br>
        Для центрирования Y: transY = <span class="hl">-h/2 = ${(-bg.h/2).toFixed(2)}</span></div>
        ${row('transX', numIn('bg_tx',bg.transX))}
        ${row('transY', numIn('bg_ty',bg.transY))}
        <div class="phint">YAML scale: <span class="hl">[${bg.w*8}, ${bg.h*4}, 1]</span></div>
      </div>
    </div>`;
  bind('bg_w',v=>{background.w=Math.max(0.5,parseFloat(v)||1);render();updateProps();});
  bind('bg_h',v=>{background.h=Math.max(0.5,parseFloat(v)||1);render();updateProps();});
  bind('bg_col',v=>{background.colorHex=v;render();});
  bind('bg_al',v=>{background.alpha=parseInt(v);render();updateProps();});
  bind('bg_px',v=>{background.posX=parseFloat(v)||0;render();});
  bind('bg_py',v=>{background.posY=parseFloat(v)||0;render();});
  bind('bg_tx',v=>{background.transX=parseFloat(v)||0;render();});
  bind('bg_ty',v=>{background.transY=parseFloat(v)||0;render();updateProps();});
}
const MATS=['RED_STAINED_GLASS_PANE','BLUE_STAINED_GLASS_PANE','GREEN_STAINED_GLASS_PANE',
  'YELLOW_STAINED_GLASS_PANE','PURPLE_STAINED_GLASS_PANE','WHITE_STAINED_GLASS_PANE',
  'BLACK_STAINED_GLASS_PANE','STONE','DIAMOND','GOLD_BLOCK','IRON_BLOCK','EMERALD_BLOCK',
  'GRASS_BLOCK','OAK_LOG','BEACON','END_PORTAL_FRAME','NETHERITE_BLOCK','COMMAND_BLOCK','EMERALD','GOLDEN_APPLE'];
const ACTS=['CLOSE_SCREEN','OPEN_MENU','RUN_COMMAND','SEND_CHAT','PLAY_SOUND','RUN_SCRIPT','SWITCH_SCREEN','NONE'];

function renderWProps(p,w){
  const isText=w.type==='TEXT_BUTTON';
  const yamlScaleStr=isText?`[${+(w.w*8).toFixed(2)}, ${+(w.h*4).toFixed(2)}, 1]`:`[${+w.w.toFixed(2)}, ${+w.h.toFixed(2)}, ${+w.w.toFixed(2)}]`;
  // Вычисляем визуальный anchor — куда смотрит голубая точка на холсте
  const anchorDesc = isText
    ? `Entity pos: [${w.x.toFixed(2)}, ${w.y.toFixed(2)}] = bottom-center\nВизуал = pos + trans = [${(w.x+(w.transX||0)).toFixed(2)}, ${(w.y+(w.transY||0)).toFixed(2)}]`
    : `Entity pos: [${w.x.toFixed(2)}, ${w.y.toFixed(2)}] = center\nВизуал = pos + trans = [${(w.x+(w.transX||0)).toFixed(2)}, ${(w.y+(w.transY||0)).toFixed(2)}]`;
  p.innerHTML=`
    <div class="pgroup">
      <div class="pgtitle">${isText?'🔤':'🎯'} ${w.type}</div>
      <div class="pgbody">
        ${row('ID', txtIn('w_id',w.id))}
        ${!isText?row('Material',selIn('w_mat',w.material,MATS)):''}
        ${isText?row('Текст',txtIn('w_txt',w.text)):''}
        ${isText?row('Цвет BG',colIn('w_col',w.color)):''}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">📍 position[] — мировая позиция entity</div>
      <div class="pgbody">
        <div class="phint">
          <span class="wa">Где стоит Display entity в мире</span><br>
          Anchor: <span class="hl">${isText?'center-X, bottom-Y':'center'}</span><br>
          <span class="ok">⬤</span> голубая точка на холсте = эта позиция
        </div>
        ${row('X', numIn('w_x',w.x))}
        ${row('Y', numIn('w_y',w.y))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">↔ translation[] — Transformation сдвиг</div>
      <div class="pgbody">
        <div class="phint">
          <span class="ok">Локальный сдвиг модели внутри entity</span><br>
          НЕ меняет мировую позицию!${isText?`<br>Для центрирования по Y: <span class="hl">${(-w.h/2).toFixed(3)}</span>`:''}
        </div>
        ${row('transX', numIn('w_tx',w.transX||0))}
        ${row('transY', numIn('w_ty',w.transY||0))}
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">📏 Размер (блоки)</div>
      <div class="pgbody">
        ${row('Ширина', numIn('w_w',w.w,0.125,0.125))}
        ${row('Высота', numIn('w_h',w.h,0.125,0.125))}
        <div class="phint">YAML scale: <span class="hl">${yamlScaleStr}</span></div>
      </div>
    </div>
    <div class="pgroup">
      <div class="pgtitle">⚡ onClick</div>
      <div class="pgbody">
        ${row('action', selIn('w_act',w.onClick,ACTS))}
        <div class="prow">
          <div class="plabel">tolH</div>${numIn('w_tolH',w.tolerance[0],0.05,0)}
          <div class="plabel" style="margin-left:4px">tolV</div>${numIn('w_tolV',w.tolerance[1],0.05,0)}
        </div>
      </div>
    </div>`;

  bind('w_id',v=>{w.id=v||w.id;render();});
  if(!isText) bind('w_mat',v=>{w.material=v;w.color=matCol(v);render();});
  if(isText){bind('w_txt',v=>{w.text=v;w.label=v;render();});bind('w_col',v=>{w.color=v;render();});}
  bind('w_x',v=>{w.x=parseFloat(v)||0;render();updateProps();});
  bind('w_y',v=>{w.y=parseFloat(v)||0;render();updateProps();});
  bind('w_tx',v=>{w.transX=parseFloat(v)||0;render();updateProps();});
  bind('w_ty',v=>{w.transY=parseFloat(v)||0;render();updateProps();});
  bind('w_w',v=>{w.w=Math.max(0.125,parseFloat(v)||1);render();updateProps();});
  bind('w_h',v=>{w.h=Math.max(0.125,parseFloat(v)||1);render();updateProps();});
  bind('w_act',v=>{w.onClick=v;updateYaml();});
  bind('w_tolH',v=>{w.tolerance[0]=parseFloat(v)||0;updateYaml();});
  bind('w_tolV',v=>{w.tolerance[1]=parseFloat(v)||0;updateYaml();});
}
// ═══════════════════════════════════════════════════════════════
// LAYERS
// ═══════════════════════════════════════════════════════════════
function updateLayers(){
  const list=document.getElementById('layerList');
  const sorted=[...widgets].sort((a,b)=>b.zIndex-a.zIndex);
  const html=sorted.map(w=>{
    const s=w.id===selectedId;
    return `<div class="litem" data-id="${w.id}" style="border:1px solid ${s?'var(--accent)':'var(--border)'};background:${s?'rgba(100,150,255,0.08)':'var(--bg3)'};color:${s?'var(--accent)':'var(--text2)'};">
      ${w.type==='TEXT_BUTTON'?'🔤':w.type==='BLOCK_BUTTON'?'🧱':'🎯'}
      <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:10px">${w.id}</span>
    </div>`;
  });
  if(background){
    const s=selectedId==='__bg__';
    html.push(`<div class="litem" data-id="__bg__" style="border:1px solid ${s?'var(--accent3)':'var(--border)'};background:${s?'rgba(28,238,114,0.08)':'var(--bg3)'};color:${s?'var(--accent3)':'var(--text3)'};font-size:10px;">🟩 background</div>`);
  }
  list.innerHTML=html.join('')||'<div style="font-size:9px;color:var(--text3);padding:4px">Пусто</div>';
  list.querySelectorAll('.litem').forEach(el=>el.addEventListener('click',()=>{selectedId=el.dataset.id;render();updateProps();}));
}

// ═══════════════════════════════════════════════════════════════
// YAML — точное соответствие формату плагина
// ═══════════════════════════════════════════════════════════════
function fn(n){
  if(n===undefined||n===null) return '0.0';
  const r=parseFloat(n.toFixed(4));
  return r%1===0?r.toFixed(1):r.toString();
}

function updateYaml(){
  const sid=document.getElementById('screenId').value||'my_screen';
  const L=[];
  const k=(s,i=0)=>'  '.repeat(i)+s;
  L.push(k(`<span class="yk">id</span>: <span class="yv">${sid}</span>`));
  if(background){
    const autoX=-(background.w*8)/80;
    const {r,g,b}=hexRgb(background.colorHex);
    L.push(k(`<span class="yk">background</span>:`));
    L.push(k(`<span class="yk">color</span>: [<span class="yn">${r}, ${g}, ${b}</span>]`,1));
    L.push(k(`<span class="yk">alpha</span>: <span class="yn">${background.alpha}</span>`,1));
    L.push(k(`<span class="yk">scale</span>: [<span class="yn">${fn(background.w*8)}, ${fn(background.h*4)}, 1</span>]`,1));
    if(background.posX!==0||background.posY!==0)
      L.push(k(`<span class="yk">position</span>: [<span class="yn">${fn(background.posX)}, ${fn(background.posY)}, 0</span>]`,1));
    L.push(k(`<span class="yk">translation</span>: [<span class="yn">${fn(background.transX)}, ${fn(background.transY)}, 0</span>]`,1));
    L.push(k(`<span class="yc">  <span class="yc"># autoX=${fn(autoX)} → final=[${fn(background.transX+autoX)}, ${fn(background.transY)}, 0]</span></span>`));
    L.push(k(`<span class="yk">text</span>: <span class="yv">" "</span>`,1));
  }
  if(widgets.length>0){
    L.push(k(`<span class="yk">widgets</span>:`));
    for(const w of widgets){
      const isText=w.type==='TEXT_BUTTON';
      L.push(k(`- <span class="yk">id</span>: <span class="yv">${w.id}</span>`,1));
      L.push(k(`<span class="yk">type</span>: <span class="yv">${w.type}</span>`,2));
      if(!isText&&w.material) L.push(k(`<span class="yk">material</span>: <span class="yv">${w.material}</span>`,2));
      if(isText){
        L.push(k(`<span class="yk">text</span>: <span class="yv">"${w.text}"</span>`,2));
        L.push(k(`<span class="yk">scale</span>: [<span class="yn">${fn(w.w*8)}, ${fn(w.h*4)}, 1</span>]`,2));
      } else {
        L.push(k(`<span class="yk">scale</span>: [<span class="yn">${fn(w.w)}, ${fn(w.h)}, ${fn(w.w)}</span>]`,2));
      }
      // position — только если не [0,0,0]
      if(w.x!==0||w.y!==0)
        L.push(k(`<span class="yk">position</span>: [<span class="yn">${fn(w.x)}, ${fn(w.y)}, 0</span>]`,2));
      else
        L.push(k(`<span class="yk">position</span>: [<span class="yn">0.0, 0.0, 0</span>]`,2));
      // translation — только если не [0,0,0]
      if((w.transX||0)!==0||(w.transY||0)!==0)
        L.push(k(`<span class="yk">translation</span>: [<span class="yn">${fn(w.transX||0)}, ${fn(w.transY||0)}, 0</span>]`,2));
      L.push(k(`<span class="yk">tolerance</span>: [<span class="yn">${w.tolerance[0]}, ${w.tolerance[1]}</span>]`,2));
      L.push(k(`<span class="yk">onClick</span>:`,2));
      L.push(k(`<span class="yk">action</span>: <span class="yv">${w.onClick}</span>`,3));
    }
  }
  document.getElementById('yamlOut').innerHTML=L.join('\n');
}
function plainYaml(){
  const sid=document.getElementById('screenId').value||'my_screen';
  const L=[];
  L.push(`id: ${sid}`);
  if(background){
    const {r,g,b}=hexRgb(background.colorHex);
    L.push(`background:`);
    L.push(`  color: [${r}, ${g}, ${b}]`);
    L.push(`  alpha: ${background.alpha}`);
    L.push(`  scale: [${fn(background.w*8)}, ${fn(background.h*4)}, 1]`);
    if(background.posX!==0||background.posY!==0) L.push(`  position: [${fn(background.posX)}, ${fn(background.posY)}, 0]`);
    L.push(`  translation: [${fn(background.transX)}, ${fn(background.transY)}, 0]`);
    L.push(`  text: " "`);
  }
  if(widgets.length>0){
    L.push(`widgets:`);
    for(const w of widgets){
      const isText=w.type==='TEXT_BUTTON';
      L.push(`  - id: ${w.id}`);
      L.push(`    type: ${w.type}`);
      if(!isText&&w.material) L.push(`    material: ${w.material}`);
      if(isText){L.push(`    text: "${w.text}"`);L.push(`    scale: [${fn(w.w*8)}, ${fn(w.h*4)}, 1]`);}
      else L.push(`    scale: [${fn(w.w)}, ${fn(w.h)}, ${fn(w.w)}]`);
      L.push(`    position: [${fn(w.x)}, ${fn(w.y)}, 0]`);
      if((w.transX||0)!==0||(w.transY||0)!==0) L.push(`    translation: [${fn(w.transX||0)}, ${fn(w.transY||0)}, 0]`);
      L.push(`    tolerance: [${w.tolerance[0]}, ${w.tolerance[1]}]`);
      L.push(`    onClick:`);
      L.push(`      action: ${w.onClick}`);
    }
  }
  return L.join('\n');
}

function doCopy(){
  navigator.clipboard.writeText(plainYaml()).then(()=>{
    ['btnCopy','btnCopy2'].forEach(id=>{
      const b=document.getElementById(id);const o=b.textContent;
      b.textContent='✓ Скопировано!';setTimeout(()=>b.textContent=o,1600);
    });
  });
}
document.getElementById('btnCopy').addEventListener('click',doCopy);
document.getElementById('btnCopy2').addEventListener('click',doCopy);
document.getElementById('screenId').addEventListener('input',updateYaml);

// Context menu
const ctxM=document.getElementById('ctxMenu');
function showCtx(x,y){ctxM.style.left=x+'px';ctxM.style.top=y+'px';ctxM.classList.add('show');}
document.addEventListener('click',()=>ctxM.classList.remove('show'));
document.getElementById('ctxDup').addEventListener('click',()=>{
  if(!selectedId||selectedId==='__bg__') return;
  const w=widgets.find(x=>x.id===selectedId);
  if(w){const c={...w,id:`widget_${nextId++}`,x:w.x+0.5,y:w.y-0.5,zIndex:widgets.length,tolerance:[...w.tolerance]};widgets.push(c);selectedId=c.id;render();updateProps();}
});
document.getElementById('ctxUp').addEventListener('click',()=>{const w=widgets.find(x=>x.id===selectedId);if(w){w.zIndex=Math.min(w.zIndex+1,widgets.length);render();}});
document.getElementById('ctxDown').addEventListener('click',()=>{const w=widgets.find(x=>x.id===selectedId);if(w){w.zIndex=Math.max(w.zIndex-1,0);render();}});
document.getElementById('ctxDel').addEventListener('click',()=>{
  if(selectedId==='__bg__') background=null; else widgets=widgets.filter(w=>w.id!==selectedId);
  selectedId=null;render();updateProps();
});

document.getElementById('gridToggle').addEventListener('change',render);
document.getElementById('zoomSel').addEventListener('change',render);
document.getElementById('gridStep').addEventListener('input',render);

function updateEmpty(){
  document.getElementById('estate').style.display=(widgets.length===0&&!background)?'block':'none';
  const bx=Math.floor(cv.width/PPB()),by=Math.floor(cv.height/PPB());
  document.getElementById('screenInfo').textContent=`${bx}×${by} блоков`;
}

// ═══════════════════════════════════════════════════════════════
// DEMO — точные параметры из примеров плагина
// Берём simple_center_test.yml как эталон:
//   background: scale=[32,12,1] → w=4,h=3; translation=[0,-1.5,0]; position=[0,0,0]
//   Widget: position=[0,0,0], scale=[0.5,0.5,0.5], translation=[0,0,0]
// ═══════════════════════════════════════════════════════════════
function loadDemo(){
  background={w:4,h:3,colorHex:'#0d1117',alpha:180,posX:0,posY:0,transX:0,transY:-1.5};
  widgets=[
    // ITEM_BUTTON: anchor=CENTER, position=[0,0] → стоит в центре экрана
    {id:'btn_center',type:'ITEM_BUTTON',material:'DIAMOND',label:'',text:'',
      x:0,y:0,transX:0,transY:0,w:0.5,h:0.5,color:'#44ddcc',
      onClick:'OPEN_MENU',tolerance:[0.15,0.15],zIndex:1},
    // Правый верхний
    {id:'btn_close',type:'ITEM_BUTTON',material:'RED_STAINED_GLASS_PANE',label:'',text:'',
      x:1.5,y:1.2,transX:0,transY:0,w:0.5,h:0.5,color:'#cc3333',
      onClick:'CLOSE_SCREEN',tolerance:[0.15,0.15],zIndex:2},
    // TEXT_BUTTON: anchor=center-X,bottom-Y
    // position=[0,0.8] → entity стоит на Y=0.8
    // translation=[0,-0.25] → модель сдвинута вниз на 0.25 (чтобы центрировать h=0.5)
    {id:'btn_title',type:'TEXT_BUTTON',material:'',label:'Меню',text:'Меню',
      x:0,y:0.8,transX:0,transY:-0.25,w:2,h:0.5,color:'#1e3a5f',
      onClick:'CLOSE_SCREEN',tolerance:[0,0],zIndex:0},
    {id:'btn_back',type:'TEXT_BUTTON',material:'',label:'← Закрыть',text:'← Закрыть',
      x:0,y:-1.0,transX:0,transY:-0.2,w:1.5,h:0.4,color:'#2a4040',
      onClick:'CLOSE_SCREEN',tolerance:[0.1,0.1],zIndex:3},
  ];
  nextId=10;selectedId=null;render();updateProps();
}
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing canvas...');
  // Wait a bit longer for CSS to be applied
  setTimeout(() => {
    resize();
    loadDemo();
  }, 200);
});

// Also initialize on window load as backup
window.addEventListener('load', function() {
  console.log('Window loaded, ensuring canvas is initialized...');
  setTimeout(() => {
    resize();
  }, 100);
});