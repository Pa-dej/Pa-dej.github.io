// ═══════════════════════════════════════════════════════════════
// MAIN INITIALIZATION - Ties all modules together
// ═══════════════════════════════════════════════════════════════

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing canvas...');
  
  // Ensure the canvas wrapper has proper dimensions
  const cwrap = document.getElementById('cwrap');
  if (cwrap) {
    // Force a layout recalculation
    cwrap.style.minWidth = '400px';
    cwrap.style.flex = '1';
  }
  
  // Инициализируем zoom
  window.ScreenGenerator.updateZoomDisplay();
  
  // Wait for CSS to be applied and layout to stabilize
  setTimeout(() => {
    window.ScreenGenerator.resize();
    window.ScreenGenerator.loadDemo();
    
    // Инициализируем все обработчики событий
    window.ScreenGenerator.initAllEventHandlers();
    
    // Инициализируем YAML обработчики
    window.ScreenGenerator.initYamlHandlers();
    
    // Инициализируем контекстное меню
    window.ScreenGenerator.initContextMenu();
    
    // Инициализируем визуальные рендеры после всего остального
    setTimeout(() => {
      console.log('Initializing visual renders after demo load...');
      window.ScreenGenerator.initVisualRenders();
    }, 200);
  }, 300);
});

// Also initialize on window load as backup
window.addEventListener('load', function() {
  console.log('Window loaded, ensuring canvas is initialized...');
  setTimeout(() => {
    window.ScreenGenerator.resize();
    // Еще одна попытка инициализации иконок
    setTimeout(() => {
      window.ScreenGenerator.initVisualRenders();
    }, 100);
  }, 100);
});