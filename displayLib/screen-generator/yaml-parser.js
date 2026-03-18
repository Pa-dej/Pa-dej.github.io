// ═══════════════════════════════════════════════════════════════
// YAML PARSER AND BIDIRECTIONAL SYNC
// ═══════════════════════════════════════════════════════════════

// Простой YAML парсер для нашего специфичного формата
function parseYamlToCanvas(yamlText) {
  try {
    const lines = yamlText.split('\n');
    const result = { widgets: [], background: null, id: 'my_screen' };
    
    let currentSection = null;
    let currentWidget = null;
    let inOnClick = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Пропускаем пустые строки и комментарии
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;
      
      const indent = line.length - line.trimLeft().length;
      
      // Определяем уровень вложенности
      if (indent === 0) {
        currentSection = null;
        currentWidget = null;
        inOnClick = false;
      }
      
      // Парсим основные секции
      if (trimmedLine.startsWith('id:')) {
        result.id = trimmedLine.split(':')[1].trim();
        currentSection = null;
      } else if (trimmedLine.startsWith('background:')) {
        currentSection = 'background';
        result.background = { w: 4, h: 3, colorHex: '#0d1117', alpha: 180, posX: 0, posY: 0, transX: 0, transY: 0, locked: false };
      } else if (trimmedLine.startsWith('widgets:')) {
        currentSection = 'widgets';
      } else if (trimmedLine.startsWith('- id:')) {
        // Новый виджет в списке
        const widgetId = trimmedLine.split(':')[1].trim();
        currentWidget = {
          id: widgetId,
          type: 'ITEM_BUTTON',
          material: 'RED_STAINED_GLASS_PANE',
          x: 0, y: 0, w: 1, h: 1,
          transX: 0, transY: 0,
          tolerance: [0, 0],
          onClick: 'CLOSE'
        };
        result.widgets.push(currentWidget);
        inOnClick = false;
      } else if (currentSection === 'background' && indent > 0) {
        parseBackgroundProperty(trimmedLine, result.background);
      } else if (currentWidget && indent > 0) {
        if (trimmedLine.startsWith('onClick:')) {
          inOnClick = true;
        } else if (inOnClick && trimmedLine.startsWith('action:')) {
          currentWidget.onClick = trimmedLine.split(':')[1].trim();
          inOnClick = false;
        } else if (!inOnClick) {
          parseWidgetProperty(trimmedLine, currentWidget);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('YAML parsing error:', error);
    return null;
  }
}

function parseBackgroundProperty(line, background) {
  if (line.startsWith('color:')) {
    const colorMatch = line.match(/\[(\d+),\s*(\d+),\s*(\d+)\]/);
    if (colorMatch) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      background.colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      console.log('Parsed background color:', background.colorHex);
    }
  } else if (line.startsWith('alpha:')) {
    background.alpha = parseInt(line.split(':')[1].trim()) || 180;
  } else if (line.startsWith('scale:')) {
    const scaleMatch = line.match(/\[([^,]+),\s*([^,]+),/);
    if (scaleMatch) {
      background.w = parseFloat(scaleMatch[1]) / 8 || 4;
      background.h = parseFloat(scaleMatch[2]) / 4 || 3;
    }
  } else if (line.startsWith('position:')) {
    const posMatch = line.match(/\[([^,]+),\s*([^,]+),/);
    if (posMatch) {
      background.posX = parseFloat(posMatch[1]) || 0;
      background.posY = parseFloat(posMatch[2]) || 0;
    }
  } else if (line.startsWith('translation:')) {
    const transMatch = line.match(/\[([^,]+),\s*([^,]+),/);
    if (transMatch) {
      background.transX = parseFloat(transMatch[1]) || 0;
      background.transY = parseFloat(transMatch[2]) || 0;
    }
  }
}

function parseWidgetProperty(line, widget) {
  if (line.startsWith('type:')) {
    widget.type = line.split(':')[1].trim();
  } else if (line.startsWith('material:')) {
    widget.material = line.split(':')[1].trim();
  } else if (line.startsWith('text:')) {
    widget.text = line.split(':')[1].trim().replace(/"/g, '');
  } else if (line.startsWith('hoveredText:')) {
    widget.hoveredText = line.split(':')[1].trim().replace(/"/g, '');
  } else if (line.startsWith('backgroundColor:')) {
    const colorMatch = line.match(/\[(\d+),\s*(\d+),\s*(\d+)\]/);
    if (colorMatch) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      widget.backgroundColor = [r, g, b];
      widget.color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  } else if (line.startsWith('backgroundAlpha:')) {
    widget.backgroundAlpha = parseInt(line.split(':')[1].trim()) || 255;
  } else if (line.startsWith('scale:')) {
    const scaleMatch = line.match(/\[([^,]+),\s*([^,]+),/);
    if (scaleMatch) {
      if (widget.type === 'TEXT_BUTTON') {
        widget.w = parseFloat(scaleMatch[1]) / 8 || 1;
        widget.h = parseFloat(scaleMatch[2]) / 4 || 1;
      } else {
        widget.w = parseFloat(scaleMatch[1]) || 1;
        widget.h = parseFloat(scaleMatch[2]) || 1;
      }
    }
  } else if (line.startsWith('position:')) {
    const posMatch = line.match(/\[([^,]+),\s*([^,]+),/);
    if (posMatch) {
      widget.x = parseFloat(posMatch[1]) || 0;
      widget.y = parseFloat(posMatch[2]) || 0;
    }
  } else if (line.startsWith('translation:')) {
    const transMatch = line.match(/\[([^,]+),\s*([^,]+),/);
    if (transMatch) {
      widget.transX = parseFloat(transMatch[1]) || 0;
      widget.transY = parseFloat(transMatch[2]) || 0;
    }
  } else if (line.startsWith('tolerance:')) {
    const tolMatch = line.match(/\[([^,]+),\s*([^,]+)\]/);
    if (tolMatch) {
      widget.tolerance = [parseFloat(tolMatch[1]) || 0, parseFloat(tolMatch[2]) || 0];
    }
  }
}

// Применение распарсенных данных к canvas
function applyYamlToCanvas(parsedData) {
  if (!parsedData) return false;
  
  const { ScreenGenerator } = window;
  
  console.log('Applying YAML to canvas:', parsedData);
  
  // Очищаем текущее состояние
  ScreenGenerator.widgets.length = 0;
  ScreenGenerator.background = null;
  
  // Применяем ID экрана
  document.getElementById('screenId').value = parsedData.id;
  
  // Применяем фон
  if (parsedData.background) {
    // Проверяем, что у фона есть colorHex
    if (!parsedData.background.colorHex) {
      parsedData.background.colorHex = '#0d1117'; // Дефолтный цвет
    }
    ScreenGenerator.background = parsedData.background;
    console.log('Applied background:', ScreenGenerator.background);
  }
  
  // Применяем виджеты
  parsedData.widgets.forEach(widgetData => {
    ScreenGenerator.widgets.push(widgetData);
  });
  
  console.log('Applied widgets:', ScreenGenerator.widgets);
  
  // Обновляем отображение
  if (ScreenGenerator.render) ScreenGenerator.render();
  if (ScreenGenerator.updateWidgetList) ScreenGenerator.updateWidgetList();
  if (ScreenGenerator.updateProps) ScreenGenerator.updateProps();
  
  return true;
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  parseYamlToCanvas,
  applyYamlToCanvas
});