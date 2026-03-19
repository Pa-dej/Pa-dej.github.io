// ═══════════════════════════════════════════════════════════════
// CORE UTILITIES AND CONSTANTS
// ═══════════════════════════════════════════════════════════════

// Zoom управление
let currentZoom = 120; // Дефолтный zoom 120
const MIN_ZOOM = 20;
const MAX_ZOOM = 200;

// Основные функции масштабирования
const PPB = () => currentZoom;
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

// Координатные преобразования
const b2p = b => b * PPB(); // blocks to pixels
const p2b = p => p / PPB(); // pixels to blocks

// ═══════════════════════════════════════════════════════════════
// MINECRAFT TEXT DISPLAY RENDERING CONSTANTS
// Из исходников: TextFeatureRenderer.TEXT_SCALE = 0.025f
// 1 font-px = 0.025 блока = 1/40 блока
// ═══════════════════════════════════════════════════════════════
const MC_TEXT_SCALE = 0.025; // блоков на font-pixel

// Minecraft default font metrics (Mojangles/default font)
const MC_FONT_HEIGHT = 8;    // высота глифа в font-px
const MC_LINE_GAP    = 1;    // межстрочный интервал в font-px
const MC_LINE_HEIGHT = MC_FONT_HEIGHT + MC_LINE_GAP; // = 9 font-px на строку
const MC_BG_PADDING  = 1;    // padding фона в font-px (с каждой стороны)

// Приблизительные ширины символов Minecraft default font (в font-px, без gap)
// Источник: анализ font atlas / minecraft wiki character widths
const MC_CHAR_WIDTHS = {
  ' ':  4,  '!': 2,  '"': 4,  '#': 6,  '$': 6,  '%': 6,  '&': 6,  "'": 2,
  '(':  4,  ')': 4,  '*': 6,  '+': 6,  ',': 2,  '-': 6,  '.': 2,  '/': 6,
  '0':  6,  '1': 6,  '2': 6,  '3': 6,  '4': 6,  '5': 6,  '6': 6,  '7': 6,
  '8':  6,  '9': 6,  ':': 2,  ';': 2,  '<': 5,  '=': 6,  '>': 5,  '?': 6,
  '@':  7,  'A': 6,  'B': 6,  'C': 6,  'D': 6,  'E': 6,  'F': 6,  'G': 6,
  'H':  6,  'I': 4,  'J': 6,  'K': 6,  'L': 6,  'M': 6,  'N': 6,  'O': 6,
  'P':  6,  'Q': 6,  'R': 6,  'S': 6,  'T': 6,  'U': 6,  'V': 6,  'W': 6,
  'X':  6,  'Y': 6,  'Z': 6,  '[': 4,  '\\':6, ']': 4,  '^': 6,  '_': 6,
  '`':  3,  'a': 6,  'b': 6,  'c': 6,  'd': 6,  'e': 6,  'f': 5,  'g': 6,
  'h':  6,  'i': 2,  'j': 6,  'k': 5,  'l': 3,  'm': 6,  'n': 6,  'o': 6,
  'p':  6,  'q': 6,  'r': 6,  's': 6,  't': 4,  'u': 6,  'v': 6,  'w': 6,
  'x':  6,  'y': 6,  'z': 6,  '{': 4,  '|': 2,  '}': 4,  '~': 6
};
const MC_CHAR_GAP = 1; // 1 px gap после каждого символа
const MC_DEFAULT_CHAR_WIDTH = 6; // для символов не в таблице

/**
 * Возвращает ширину строки текста в font-px (Minecraft default font).
 * Учитывает межсимвольный интервал.
 * Пустая строка возвращает 0.
 */
function mcTextWidth(str) {
  if (!str || str.length === 0) return 0;
  let w = 0;
  for (const ch of str) {
    const charW = MC_CHAR_WIDTHS[ch] ?? MC_DEFAULT_CHAR_WIDTH;
    w += charW + MC_CHAR_GAP;
  }
  return w - MC_CHAR_GAP; // убираем trailing gap у последнего символа
}

/**
 * Вычисляет размер фона TextDisplay в блоках для заданного текста и scale.
 * 
 * @param {string} text    - текст виджета
 * @param {number} scaleX  - YAML scale[0]
 * @param {number} scaleY  - YAML scale[1]
 * @returns {{ w: number, h: number }}  размер фона в блоках
 */
function mcBgSize(text, scaleX, scaleY) {
  const lines = (text || ' ').split('\n');
  
  // Ширина: максимальная строка
  let maxLineWidthPx = 0;
  for (const line of lines) {
    const lw = mcTextWidth(line === '' ? ' ' : line);
    if (lw > maxLineWidthPx) maxLineWidthPx = lw;
  }
  
  // Высота: кол-во строк × line_height (9 font-px на строку)
  const lineCount = lines.length;
  const textHeightPx = MC_LINE_HEIGHT * lineCount; // 9 * lineCount
  
  // Добавляем padding фона
  const bgWidthPx  = maxLineWidthPx + MC_BG_PADDING * 2;
  const bgHeightPx = textHeightPx   + MC_BG_PADDING * 2;
  
  // Переводим в блоки и умножаем на scale
  const bgWidthBlocks  = bgWidthPx  * MC_TEXT_SCALE;
  const bgHeightBlocks = bgHeightPx * MC_TEXT_SCALE;
  
  return {
    w: bgWidthBlocks * scaleX,
    h: bgHeightBlocks * scaleY
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
  document.getElementById('zoomDisplay').textContent = `×${currentZoom}`;
}

function setZoom(newZoom) {
  currentZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
  updateZoomDisplay();
  // Use setTimeout to ensure render function is available
  setTimeout(() => {
    if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') {
      window.ScreenGenerator.render();
    }
  }, 0);
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
  get currentZoom() { return currentZoom; },
  set currentZoom(value) { currentZoom = value; },
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
  get dType() { return dType; },
  set dType(value) { dType = value; },
  get dMat() { return dMat; },
  set dMat(value) { dMat = value; },
  get isDragPal() { return isDragPal; },
  set isDragPal(value) { isDragPal = value; },
  
  // Функции
  PPB, GSTEP, updateZoomDisplay, setZoom,
  b2p, p2b, snap, b2cx, b2cy, cx2b, cy2b,
  hexRgb, matCol, MATCOL,
  MIN_ZOOM, MAX_ZOOM,
  
  // Minecraft text rendering
  MC_TEXT_SCALE, MC_FONT_HEIGHT, MC_LINE_GAP, MC_LINE_HEIGHT, MC_BG_PADDING,
  MC_CHAR_WIDTHS, MC_CHAR_GAP, MC_DEFAULT_CHAR_WIDTH,
  mcTextWidth, mcBgSize
});