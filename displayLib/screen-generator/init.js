// ═══════════════════════════════════════════════════════════════
// MAIN INITIALIZATION - Ties all modules together
// ═══════════════════════════════════════════════════════════════

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing canvas...');
  
  // Загружаем шрифты Minecraft
  const fontPromises = [
    document.fonts.load(`${window.ScreenGenerator?.MC_FONT_PX || 8}px Minecraftia`),
    document.fonts.load(`${window.ScreenGenerator?.MC_FONT_PX || 8}px "Minecraft Rus"`)
  ];
  
  Promise.allSettled(fontPromises).then((results) => {
    console.log('Minecraftia font loaded:', results[0].status === 'fulfilled');
    console.log('Minecraft Rus font loaded:', results[1].status === 'fulfilled');
    if (window.ScreenGenerator) {
      window.ScreenGenerator.MC_FONT_READY = true;
    }
  }).catch(err => {
    console.warn('Failed to load Minecraft fonts:', err);
  });
  
  // Ensure the canvas wrapper has proper dimensions
  const cwrap = document.getElementById('cwrap');
  if (cwrap) {
    // Force a layout recalculation
    cwrap.style.minWidth = '400px';
    cwrap.style.flex = '1';
  }
  
  // Инициализируем zoom
  window.ScreenGenerator.initZoom();
  
  // Инициализируем систему истории
  if (window.ScreenGenerator && typeof window.ScreenGenerator.initHistory === 'function') {
    window.ScreenGenerator.initHistory();
  }
  
  // Wait for CSS to be applied and layout to stabilize
  setTimeout(() => {
    window.ScreenGenerator.resize();
    window.ScreenGenerator.loadDemo();
    
    // Инициализируем все обработчики событий
    window.ScreenGenerator.initAllEventHandlers();
    
    // Инициализируем YAML обработчики
    window.ScreenGenerator.initYamlHandlers();
    
    // Инициализируем YAML редактор
    window.ScreenGenerator.initYamlEditor();
    
    // Инициализируем контекстное меню
    window.ScreenGenerator.initContextMenu();
    
    // Инициализируем визуальные рендеры после всего остального
    setTimeout(() => {
      console.log('Initializing visual renders after demo load...');
      window.ScreenGenerator.initVisualRenders();
      // Обновляем состояние кнопки добавления фона
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateAddBgButton === 'function') {
        window.ScreenGenerator.updateAddBgButton();
      }
      // Принудительно обновляем YAML
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml === 'function') {
        console.log('Force updating YAML from init.js');
        window.ScreenGenerator.updateYaml();
      }
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