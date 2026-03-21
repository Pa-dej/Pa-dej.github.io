// ═══════════════════════════════════════════════════════════════
// CORE UTILITIES AND CONSTANTS
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// НОВАЯ СИСТЕМА ЗУМА
// ═══════════════════════════════════════════════════════════════

// Zoom управление
const ZOOM_CONFIG = {
  current: 120,
  min: 25,
  max: 200,
  step: 10,
  stepFine: 5
};

// Основные функции масштабирования
const PPB = () => ZOOM_CONFIG.current;
const GSTEP = () => parseFloat(document.getElementById('gridStepSelect').value) || 0.25;

// Хранение виджетов и состояния
let widgets = [];
let background = null;
let selectedId = null;
let nextId = 1;
let CC = {x:0, y:0}; // Canvas center

// Состояние перетаскивания
let dType=null, dMat=null, isDragPal=false;
let dragging=null, resizing=null;
let panning=null; // Состояние перемещения камеры

// Координатные преобразования
const b2p = b => b * PPB(); // blocks to pixels
const p2b = p => p / PPB(); // pixels to blocks

// ═══════════════════════════════════════════════════════════════
// MINECRAFT TEXT DISPLAY — точные константы рендера
// TextFeatureRenderer.TEXT_SCALE = 0.025f
// ═══════════════════════════════════════════════════════════════
const MC_TEXT_SCALE = 0.025; // блоков на font-pixel
const MC_LINE_HEIGHT = 9;    // font-pixels на строку (8 глиф + 1 gap)
const MC_LINE_GAP = 1;       // межстрочный gap
const MC_BG_PAD = 1;         // padding фона в font-pixels
const MC_FONT_PX = 8;        // базовый font-size для canvas measureText
let MC_FONT_READY = false;   // флаг готовности шрифта

// Один offscreen canvas для всех измерений ширины
const _measureCanvas = document.createElement('canvas');
const _measureCtx = _measureCanvas.getContext('2d');

/**
 * Ширина строки текста в font-pixels через реальный шрифт Minecraftia.
 * Если шрифт ещё не загружен — возвращает приблизительное значение.
 */
function mcMeasureWidth(text) {
  if (!text) return 0;
  _measureCtx.font = `${MC_FONT_PX}px Minecraftia`;
  return _measureCtx.measureText(text).width;
}

/**
 * Размер ФОНА TextDisplay в БЛОКАХ для данного текста и scale.
 * 
 * @param {string} text   — отображаемый текст (может содержать \n)
 * @param {number} scaleX — YAML scale[0]
 * @param {number} scaleY — YAML scale[1]
 * @returns {{ w: number, h: number }}
 */
function mcBgSizeBlocks(text, scaleX, scaleY) {
  const lines = (text || '').split('\n');
  
  // Максимальная ширина строки в font-px
  let maxW = 0;
  for (const line of lines) {
    // Для пустой строки ширина = 0, для пробела используем реальную ширину
    const w = line === '' ? 0 : mcMeasureWidth(line);
    if (w > maxW) maxW = w;
  }
  
  // Высота текстового содержимого в font-px
  const lc = lines.length;
  const textH = MC_LINE_HEIGHT * lc - MC_LINE_GAP;
  
  // Добавляем padding фона
  const bgW = maxW + MC_BG_PAD * 2;
  const bgH = textH + MC_BG_PAD * 2;
  
  // Переводим в блоки с учётом scale
  return {
    w: bgW * MC_TEXT_SCALE * scaleX,
    h: bgH * MC_TEXT_SCALE * scaleY
  };
}

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

// Zoom функции
function updateZoomDisplay() {
  const display = document.getElementById('zoomDisplay');
  if (display) {
    display.textContent = `×${ZOOM_CONFIG.current}`;
  }
}

function setZoom(newZoom) {
  const clampedZoom = Math.max(ZOOM_CONFIG.min, Math.min(ZOOM_CONFIG.max, Math.round(newZoom)));
  
  if (clampedZoom !== ZOOM_CONFIG.current) {
    ZOOM_CONFIG.current = clampedZoom;
    updateZoomDisplay();
    
    // Рендерим с небольшой задержкой
    requestAnimationFrame(() => {
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') {
        window.ScreenGenerator.render();
      }
    });
  }
}

// Инициализация зума
function initZoom() {
  updateZoomDisplay();
  
  // Добавляем обработчики колесика мыши
  const canvas = document.getElementById('cv');
  const cwrap = document.getElementById('cwrap');
  
  const handleZoom = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const step = e.ctrlKey ? ZOOM_CONFIG.stepFine : ZOOM_CONFIG.step;
    const delta = e.deltaY > 0 ? -step : step;
    
    setZoom(ZOOM_CONFIG.current + delta);
  };
  
  if (canvas) {
    canvas.addEventListener('wheel', handleZoom, { passive: false });
  }
  
  if (cwrap) {
    cwrap.addEventListener('wheel', handleZoom, { passive: false });
  }
  
  // Добавляем кнопки для тестирования
  const zoomDisplay = document.getElementById('zoomDisplay');
  if (zoomDisplay && !zoomDisplay.dataset.zoomInitialized) {
    zoomDisplay.dataset.zoomInitialized = 'true';
    zoomDisplay.style.cursor = 'pointer';
    zoomDisplay.title = 'Клик для сброса зума, колесико мыши для изменения';
    
    zoomDisplay.addEventListener('click', () => {
      setZoom(120); // Сброс к дефолтному значению
    });
  }
}

// Утилиты для цвета
function hexRgb(h) {
  if (!h || typeof h !== 'string') {
    console.warn('hexRgb received invalid color:', h);
    return { r: 13, g: 17, b: 23 }; // Дефолтный цвет
  }
  return { r:parseInt(h.slice(1,3),16), g:parseInt(h.slice(3,5),16), b:parseInt(h.slice(5,7),16) };
}

// Константы материалов
const MATCOL={
  RED_STAINED_GLASS_PANE:'#cc3333',BLUE_STAINED_GLASS_PANE:'#3366cc',
  GREEN_STAINED_GLASS_PANE:'#33aa44',YELLOW_STAINED_GLASS_PANE:'#ddcc33',
  PURPLE_STAINED_GLASS_PANE:'#883399',WHITE_STAINED_GLASS_PANE:'#cccccc',
  BLACK_STAINED_GLASS_PANE:'#111111',STONE:'#888888',DIAMOND:'#44ddcc',
  GOLD_BLOCK:'#ddaa00',IRON_BLOCK:'#aaaaaa',EMERALD_BLOCK:'#00cc55',
  GRASS_BLOCK:'#558833',OAK_LOG:'#8a6a3c',BEACON:'#55ddcc',NETHERITE_BLOCK:'#3a2a3a'
};

function matCol(m){return MATCOL[m]||'#7c3aed';}

// Экспорт для использования в других модулях
window.ScreenGenerator = window.ScreenGenerator || {};
Object.assign(window.ScreenGenerator, {
  // Переменные состояния
  get currentZoom() { return ZOOM_CONFIG.current; },
  set currentZoom(value) { setZoom(value); },
  get widgets() { return widgets; },
  set widgets(value) { widgets = value; },
  get background() { return background; },
  set background(value) { background = value; },
  get selectedId() { return selectedId; },
  set selectedId(value) { selectedId = value; },
  get nextId() { return nextId; },
  set nextId(value) { nextId = value; },
  get CC() { return CC; },
  get dragging() { return dragging; },
  set dragging(value) { dragging = value; },
  get resizing() { return resizing; },
  set resizing(value) { resizing = value; },
  get panning() { return panning; },
  set panning(value) { panning = value; },
  get dType() { return dType; },
  set dType(value) { dType = value; },
  get dMat() { return dMat; },
  set dMat(value) { dMat = value; },
  get isDragPal() { return isDragPal; },
  set isDragPal(value) { isDragPal = value; },
  
  // Функции
  PPB, GSTEP, updateZoomDisplay, setZoom, initZoom,
  b2p, p2b, snap, b2cx, b2cy, cx2b, cy2b,
  hexRgb, matCol, MATCOL,
  MIN_ZOOM: ZOOM_CONFIG.min, MAX_ZOOM: ZOOM_CONFIG.max,
  
  // Minecraft text rendering
  MC_TEXT_SCALE, MC_LINE_HEIGHT, MC_LINE_GAP, MC_BG_PAD, MC_FONT_PX,
  get MC_FONT_READY() { return MC_FONT_READY; },
  set MC_FONT_READY(value) { MC_FONT_READY = value; },
  mcMeasureWidth, mcBgSizeBlocks
});