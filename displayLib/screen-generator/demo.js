// ═══════════════════════════════════════════════════════════════
// DEMO DATA AND INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// DEMO — точные параметры из реального YAML конфига
// Используем правильные соотношения и размеры
// ═══════════════════════════════════════════════════════════════
function loadDemo(){
  // Фон из YAML конфига
  window.ScreenGenerator.background={
    w: 4,        // 32.0/8 = 4
    h: 3,        // 12.0/4 = 3  
    colorHex: '#0d1117',  // [13, 17, 23]
    alpha: 180,
    posX: 0.0,
    posY: 0.0,
    transX: 0.0,
    transY: -1.5,
    transZ: 0.0,
    locked: true  // Заблокирован по умолчанию
  };
  
  window.ScreenGenerator.widgets=[
    // widget_0 - BARRIER кнопка (закрыть экран)
    {
      id: 'widget_0',
      type: 'ITEM_BUTTON',
      material: 'BARRIER',
      label: '',
      text: '',
      x: 1.75,
      y: 1.25,
      transX: 0.0,
      transY: 0.0,
      transZ: 0.0,
      w: 0.5,      // 0.5/1 = 0.5
      h: 0.5,      // 0.5/1 = 0.5
      color: '#cc3333',
      onClick: 'CLOSE_SCREEN',
      tolerance: [0.2, 0.2]
    },
    // widget_1 - TEXT_BUTTON с правильными размерами
    {
      id: 'widget_1',
      type: 'TEXT_BUTTON',
      material: '',
      label: 'Example text',
      text: 'Example text',
      alignment: 'LEFT',
      hoveredText: 'Example!',
      x: 0.0,
      y: 1.0,
      transX: 0.0,
      transY: -0.5,
      transZ: 0.001,  // Смещение по Z для текстовых кнопок
      w: 0.125,    // 1.0/8 = 0.125
      h: 0.25,     // 1.0/4 = 0.25
      color: '#2a3c50',
      backgroundColor: [40, 60, 80],
      backgroundAlpha: 0,
      onClick: 'NONE',
      tolerance: [0.15, 0.15]
    },
    // widget_2 - DIAMOND
    {
      id: 'widget_2',
      type: 'ITEM_BUTTON',
      material: 'DIAMOND',
      label: '',
      text: '',
      x: -0.5,
      y: 0.0,
      transX: 0.0,
      transY: 0.0,
      transZ: 0.0,
      w: 0.5,      // 0.5/1 = 0.5
      h: 0.5,      // 0.5/1 = 0.5
      color: '#44ddcc',
      onClick: 'NONE',
      tolerance: [0.2, 0.2]
    },
    // widget_3 - EMERALD
    {
      id: 'widget_3',
      type: 'ITEM_BUTTON',
      material: 'EMERALD',
      label: '',
      text: '',
      x: 0.0,
      y: 0.0,
      transX: 0.0,
      transY: 0.0,
      transZ: 0.0,
      w: 0.5,      // 0.5/1 = 0.5
      h: 0.5,      // 0.5/1 = 0.5
      color: '#00cc55',
      onClick: 'NONE',
      tolerance: [0.2, 0.2]
    },
    // widget_4 - GOLD_INGOT с hover анимацией
    {
      id: 'widget_4',
      type: 'ITEM_BUTTON',
      material: 'GOLD_INGOT',
      label: '',
      text: '',
      x: 0.5,
      y: 0.0,
      transX: 0.0,
      transY: 0.0,
      transZ: 0.0,
      w: 0.5,      // 0.5/1 = 0.5
      h: 0.5,      // 0.5/1 = 0.5
      color: '#ddaa00',
      onClick: 'NONE',
      tolerance: [0.2, 0.2],
      // Пример hover анимации
      hoverAnimation: {
        type: 'COMBINED',
        duration: 8,
        reverseOnExit: true,
        effects: [
          {
            type: 'SCALE',
            scale: [1.2, 1.2, 1.0]
          },
          {
            type: 'TRANSLATE',
            offset: [0.0, 0.03, 0.0]
          }
        ]
      }
    },
    // widget_5 - TEXT_BUTTON с пульсирующей анимацией
    {
      id: 'widget_5',
      type: 'TEXT_BUTTON',
      material: '',
      label: 'Animated!',
      text: 'Animated!',
      alignment: 'CENTERED',
      x: -1.0,
      y: -0.5,
      transX: 0.0,
      transY: -0.25,
      transZ: 0.001,
      w: 0.25,    // 2.0/8 = 0.25
      h: 0.25,    // 1.0/4 = 0.25
      color: '#4a90e2',
      backgroundColor: [74, 144, 226],
      backgroundAlpha: 100,
      onClick: 'NONE',
      tolerance: [0.15, 0.15],
      // Пример непрерывной пульсации
      hoverAnimation: {
        type: 'PULSE_CONTINUOUS',
        duration: 12,
        intensity: 1.3,
      }
    }
  ];
  
  window.ScreenGenerator.selectedId = null;
  
  if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateWidgetList === 'function') window.ScreenGenerator.updateWidgetList();
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateAddBgButton === 'function') window.ScreenGenerator.updateAddBgButton();
  
  // Принудительно обновляем YAML редактор
  setTimeout(() => {
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYamlEditor === 'function') {
      window.ScreenGenerator.updateYamlEditor();
    }
    if (window.ScreenGenerator && typeof window.ScreenGenerator.updateYaml === 'function') {
      window.ScreenGenerator.updateYaml();
    }
  }, 300);
  
  // Принудительно обновляем иконки после загрузки демо
  setTimeout(() => {
    initVisualRenders();
  }, 100);
}

// Инициализация визуальных рендеров в интерфейсе
function initVisualRenders() {
  console.log('Initializing visual renders...');
  
  // Обновляем иконку Item Button в палитре
  const itemButtonIcon = document.getElementById('item-button-icon');
  if (itemButtonIcon) {
    const iconHtml = window.ScreenGenerator.getMinecraftRender('DIAMOND', 20);
    console.log('Generated icon HTML:', iconHtml);
    itemButtonIcon.innerHTML = iconHtml;
    console.log('Item button icon updated');
  } else {
    console.log('Item button icon element not found');
  }
  
  // Обновляем все виджеты в палитре
  document.querySelectorAll('.witem').forEach((item, index) => {
    const material = item.dataset.material;
    const icon = item.querySelector('.wicon');
    console.log(`Processing palette item ${index}:`, {material, icon, hasIcon: !!icon});
    
    if (material && icon) {
      const iconHtml = window.ScreenGenerator.getMinecraftRender(material, 20);
      console.log('Setting palette icon for', material, ':', iconHtml);
      icon.innerHTML = iconHtml;
    } else if (icon && !material) {
      // Для Text Button показываем T
      icon.innerHTML = '<div style="width:20px;height:20px;background:var(--accent);color:#000;border-radius:3px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">T</div>';
    }
  });
  
  console.log('Visual renders initialization complete');
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  loadDemo,
  initVisualRenders
});
