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
  MIN_ZOOM, MAX_ZOOM
});