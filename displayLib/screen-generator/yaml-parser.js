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
    let inHoverAnimation = false;
    let inHoverAnimationEffects = false;
    let currentHoverEffect = null;
    
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
        inHoverAnimation = false;
        inHoverAnimationEffects = false;
        currentHoverEffect = null;
      }
      
      // Парсим основные секции
      if (trimmedLine.startsWith('id:')) {
        result.id = trimmedLine.split(':')[1].trim();
        currentSection = null;
      } else if (trimmedLine.startsWith('background:')) {
        currentSection = 'background';
        result.background = { w: 4, h: 3, colorHex: '#0d1117', alpha: 180, posX: 0, posY: 0, transX: 0, transY: 0, locked: true };
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
          onClick: 'CLOSE',
          alignment: 'CENTERED' // дефолтное выравнивание для TEXT_BUTTON
        };
        result.widgets.push(currentWidget);
        inOnClick = false;
        inHoverAnimation = false;
        inHoverAnimationEffects = false;
        currentHoverEffect = null;
      } else if (currentSection === 'background' && indent > 0) {
        parseBackgroundProperty(trimmedLine, result.background);
      } else if (currentWidget && indent > 0) {
        if (trimmedLine.startsWith('onClick:')) {
          inOnClick = true;
          inHoverAnimation = false;
        } else if (trimmedLine.startsWith('hoverAnimation:')) {
          inHoverAnimation = true;
          inOnClick = false;
          currentWidget.hoverAnimation = {};
        } else if (inOnClick && trimmedLine.startsWith('action:')) {
          currentWidget.onClick = trimmedLine.split(':')[1].trim();
          inOnClick = false;
        } else if (inHoverAnimation) {
          parseHoverAnimationProperty(trimmedLine, currentWidget.hoverAnimation, indent, lines, i);
        } else if (!inOnClick) {
          parseWidgetProperty(trimmedLine, currentWidget);
        }
      }
    }
    
    result.widgets.forEach(widget => {
      if (widget.hoverAnimation) {
        delete widget.hoverAnimation._inEffects;
        delete widget.hoverAnimation._currentEffect;
        delete widget.hoverAnimation._legacyTransform;
      }
    });

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
  } else if (line.startsWith('locked:')) {
    background.locked = line.split(':')[1].trim() === 'true';
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
    const transMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (transMatch) {
      background.transX = parseFloat(transMatch[1]) || 0;
      background.transY = parseFloat(transMatch[2]) || 0;
      background.transZ = parseFloat(transMatch[3]) || 0;
    }
  }
}

function parseWidgetProperty(line, widget) {
  if (line.startsWith('type:')) {
    widget.type = line.split(':')[1].trim();
  } else if (line.startsWith('material:')) {
    widget.material = line.split(':')[1].trim();
  } else if (line.startsWith('text:')) {
    // Извлекаем текст - может быть обычный текст или JSON массив
    const textPart = line.substring(5).trim(); // Убираем 'text:'
    
    // Если начинается с [, это JSON массив - не убираем кавычки
    if (textPart.startsWith('[')) {
      widget.text = textPart;
    } else {
      // Обычный текст - убираем кавычки и заменяем \n
      const textValue = textPart.replace(/^["']|["']$/g, ''); // Убираем внешние кавычки
      widget.text = textValue.replace(/\\n/g, '\n');
    }
  } else if (line.startsWith('alignment:')) {
    widget.alignment = line.split(':')[1].trim();
  } else if (line.startsWith('hoveredText:')) {
    // Аналогично для hoveredText
    const hoverPart = line.substring(12).trim(); // Убираем 'hoveredText:'
    
    if (hoverPart.startsWith('[')) {
      widget.hoveredText = hoverPart;
    } else {
      const hoverValue = hoverPart.replace(/^["']|["']$/g, '');
      widget.hoveredText = hoverValue.replace(/\\n/g, '\n');
    }
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
    const alphaValue = parseInt(line.split(':')[1].trim());
    widget.backgroundAlpha = isNaN(alphaValue) ? 255 : alphaValue;
  } else if (line.startsWith('hoveredBackgroundColor:')) {
    const colorMatch = line.match(/\[(\d+),\s*(\d+),\s*(\d+)\]/);
    if (colorMatch) {
      const r = parseInt(colorMatch[1]);
      const g = parseInt(colorMatch[2]);
      const b = parseInt(colorMatch[3]);
      widget.hoveredBackgroundColor = [r, g, b];
    }
  } else if (line.startsWith('hoveredBackgroundAlpha:')) {
    const alphaValue = parseInt(line.split(':')[1].trim());
    widget.hoveredBackgroundAlpha = isNaN(alphaValue) ? 0 : alphaValue;
  } else if (line.startsWith('tooltip:')) {
    // Аналогично для tooltip
    const tooltipPart = line.substring(8).trim(); // Убираем 'tooltip:'
    
    if (tooltipPart.startsWith('[')) {
      widget.tooltip = tooltipPart;
    } else {
      const tooltipValue = tooltipPart.replace(/^["']|["']$/g, '');
      widget.tooltip = tooltipValue.replace(/\\n/g, '\n');
    }
  } else if (line.startsWith('tooltipDelay:')) {
    const delayValue = parseInt(line.split(':')[1].trim());
    widget.tooltipDelay = isNaN(delayValue) ? 10 : delayValue;
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
    const transMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (transMatch) {
      widget.transX = parseFloat(transMatch[1]) || 0;
      widget.transY = parseFloat(transMatch[2]) || 0;
      widget.transZ = parseFloat(transMatch[3]) || 0;
    }
  } else if (line.startsWith('tolerance:')) {
    const tolMatch = line.match(/\[([^,]+),\s*([^,]+)\]/);
    if (tolMatch) {
      widget.tolerance = [parseFloat(tolMatch[1]) || 0, parseFloat(tolMatch[2]) || 0];
    }
  }
}

// Функция для парсинга hoverAnimation
function parseHoverAnimationProperty(line, hoverAnimation, indent = 0) {
  if (line.startsWith('effects:')) {
    hoverAnimation.effects = [];
    hoverAnimation._inEffects = true;
    hoverAnimation._currentEffect = null;
    return;
  }

  if (hoverAnimation._inEffects && indent >= 8) {
    if (line.startsWith('- type:')) {
      const rawType = line.split(':')[1].trim();
      const allowedEffectTypes = ['SCALE', 'TRANSLATE', 'ROTATE', 'PRESET'];
      const effectType = allowedEffectTypes.includes(rawType) ? rawType : 'SCALE';
      const effect = { type: effectType };
      hoverAnimation.effects.push(effect);
      hoverAnimation._currentEffect = effect;
      parseHoverEffectProperty('', effect);
      return;
    }

    if (hoverAnimation._currentEffect) {
      parseHoverEffectProperty(line, hoverAnimation._currentEffect);
      return;
    }
  }

  if (indent <= 6) {
    hoverAnimation._inEffects = false;
    hoverAnimation._currentEffect = null;
  }

  if (line.startsWith('type:')) {
    const parsedType = line.split(':')[1].trim();
    if (parsedType === 'TRANSFORM') {
      hoverAnimation.type = 'SCALE';
      hoverAnimation._legacyTransform = true;
    } else {
      hoverAnimation.type = parsedType;
    }
  } else if (line.startsWith('duration:')) {
    hoverAnimation.duration = parseInt(line.split(':')[1].trim()) || 10;
  } else if (line.startsWith('reverseOnExit:')) {
    hoverAnimation.reverseOnExit = line.split(':')[1].trim() === 'true';
  } else if (line.startsWith('delay:')) {
    hoverAnimation.delay = parseInt(line.split(':')[1].trim()) || 0;
  } else if (line.startsWith('loop:')) {
    hoverAnimation.loop = line.split(':')[1].trim() === 'true';
  } else if (line.startsWith('loopCount:')) {
    hoverAnimation.loopCount = parseInt(line.split(':')[1].trim()) || -1;
  } else if (line.startsWith('preset:')) {
    const preset = line.split(':')[1].trim();
    hoverAnimation.preset = ['SCALE', 'LIFT'].includes(preset) ? preset : 'SCALE';
  } else if (line.startsWith('intensity:')) {
    hoverAnimation.intensity = parseFloat(line.split(':')[1].trim()) || 1.2;
  } else if (line.startsWith('scale:')) {
    const scaleMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (scaleMatch) {
      hoverAnimation.scale = [
        parseFloat(scaleMatch[1]) || 1.0,
        parseFloat(scaleMatch[2]) || 1.0,
        parseFloat(scaleMatch[3]) || 1.0
      ];
    }
  } else if (line.startsWith('offset:')) {
    const offsetMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (offsetMatch) {
      hoverAnimation.offset = [
        parseFloat(offsetMatch[1]) || 0.0,
        parseFloat(offsetMatch[2]) || 0.0,
        parseFloat(offsetMatch[3]) || 0.0
      ];
    }
  } else if (line.startsWith('rotation:')) {
    const rotMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (rotMatch) {
      hoverAnimation.rotation = [
        parseFloat(rotMatch[1]) || 0.0,
        parseFloat(rotMatch[2]) || 0.0,
        parseFloat(rotMatch[3]) || 0.0
      ];
    }
  } else if (line.startsWith('axis:')) {
    const axisMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (axisMatch) {
      hoverAnimation.axis = [
        parseFloat(axisMatch[1]) || 0.0,
        parseFloat(axisMatch[2]) || 1.0,
        parseFloat(axisMatch[3]) || 0.0
      ];
    }
  } else if (line.startsWith('translation:')) {
    const transMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (transMatch) {
      hoverAnimation.translation = [
        parseFloat(transMatch[1]) || 0.0,
        parseFloat(transMatch[2]) || 0.0,
        parseFloat(transMatch[3]) || 0.0
      ];
    }
  } else if (line.startsWith('leftRotation:')) {
    const leftRotMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (leftRotMatch) {
      hoverAnimation.leftRotation = [
        parseFloat(leftRotMatch[1]) || 0.0,
        parseFloat(leftRotMatch[2]) || 0.0,
        parseFloat(leftRotMatch[3]) || 0.0,
        parseFloat(leftRotMatch[4]) || 1.0
      ];
    }
  } else if (line.startsWith('scaleVector:')) {
    const scaleVecMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (scaleVecMatch) {
      const scaleVector = [
        parseFloat(scaleVecMatch[1]) || 1.0,
        parseFloat(scaleVecMatch[2]) || 1.0,
        parseFloat(scaleVecMatch[3]) || 1.0
      ];
      if (hoverAnimation._legacyTransform) {
        hoverAnimation.scale = scaleVector;
      } else {
        hoverAnimation.scaleVector = scaleVector;
      }
    }
  } else if (line.startsWith('rightRotation:')) {
    const rightRotMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (rightRotMatch) {
      hoverAnimation.rightRotation = [
        parseFloat(rightRotMatch[1]) || 0.0,
        parseFloat(rightRotMatch[2]) || 0.0,
        parseFloat(rightRotMatch[3]) || 0.0,
        parseFloat(rightRotMatch[4]) || 1.0
      ];
    }
  }
}

function parseHoverEffectProperty(line, effect) {
  if (!line) {
    if (effect.type === 'SCALE' && !effect.scale) effect.scale = [1.05, 1.05, 1.0];
    if (effect.type === 'TRANSLATE' && !effect.offset) effect.offset = [0.0, 0.01, 0.0];
    if (effect.type === 'ROTATE' && !effect.rotation) effect.rotation = [0.0, 15.0, 0.0];
    if (effect.type === 'ROTATE' && !effect.axis) effect.axis = [0.0, 1.0, 0.0];
    if (effect.type === 'PRESET' && !effect.preset) effect.preset = 'SCALE';
    if (effect.type === 'PRESET' && effect.intensity === undefined) effect.intensity = 1.2;
    return;
  }

  if (line.startsWith('preset:')) {
    const preset = line.split(':')[1].trim();
    effect.preset = ['SCALE', 'LIFT'].includes(preset) ? preset : 'SCALE';
  } else if (line.startsWith('intensity:')) {
    effect.intensity = parseFloat(line.split(':')[1].trim()) || 1.2;
  } else if (line.startsWith('scale:')) {
    const scaleMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (scaleMatch) {
      effect.scale = [
        parseFloat(scaleMatch[1]) || 1.0,
        parseFloat(scaleMatch[2]) || 1.0,
        parseFloat(scaleMatch[3]) || 1.0
      ];
    }
  } else if (line.startsWith('offset:')) {
    const offsetMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (offsetMatch) {
      effect.offset = [
        parseFloat(offsetMatch[1]) || 0.0,
        parseFloat(offsetMatch[2]) || 0.0,
        parseFloat(offsetMatch[3]) || 0.0
      ];
    }
  } else if (line.startsWith('rotation:')) {
    const rotMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (rotMatch) {
      effect.rotation = [
        parseFloat(rotMatch[1]) || 0.0,
        parseFloat(rotMatch[2]) || 0.0,
        parseFloat(rotMatch[3]) || 0.0
      ];
    }
  } else if (line.startsWith('axis:')) {
    const axisMatch = line.match(/\[([^,]+),\s*([^,]+),\s*([^,\]]+)/);
    if (axisMatch) {
      effect.axis = [
        parseFloat(axisMatch[1]) || 0.0,
        parseFloat(axisMatch[2]) || 1.0,
        parseFloat(axisMatch[3]) || 0.0
      ];
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
    
    // Сохраняем существующее состояние locked если оно есть
    const existingLocked = ScreenGenerator.background?.locked;
    ScreenGenerator.background = parsedData.background;
    
    // Если в YAML нет locked, но у нас есть существующий фон с locked состоянием, сохраняем его
    if (parsedData.background.locked === undefined && existingLocked !== undefined) {
      ScreenGenerator.background.locked = existingLocked;
    }
    
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
