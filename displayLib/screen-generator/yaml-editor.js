// ═══════════════════════════════════════════════════════════════
// YAML EDITOR WITH SYNTAX HIGHLIGHTING AND REAL-TIME VALIDATION
// ═══════════════════════════════════════════════════════════════

let yamlEditor = null;
let isUpdatingFromCanvas = false;
let updateTimeout = null;
let highlightTimeout = null;

// Система мгновенного применения изменений
let lastValidYaml = ''; // Последний валидный YAML
let lastValidState = null; // Последнее валидное состояние canvas
let isUserEditing = false; // Флаг редактирования пользователем

// Инициализация редактора YAML
function initYamlEditor() {
  console.log('Initializing YAML editor...');
  const yamlContainer = document.querySelector('.yaml-container .ybody');
  if (!yamlContainer) {
    console.error('YAML container not found!');
    return;
  }
  
  // Создаем контейнер для редактора
  yamlContainer.innerHTML = `
    <div class="yaml-editor-container">
      <div class="yaml-editor-header">
        <span class="yaml-hint">⚡ Изменения применяются мгновенно при корректном синтаксисе</span>
      </div>
      <textarea id="yamlEditor" class="yaml-textarea" spellcheck="false"></textarea>
      <div id="yamlHighlight" class="yaml-highlight"></div>
    </div>
  `;
  
  setupEditor();
  console.log('YAML editor initialized successfully');
}

function setupEditor() {
  yamlEditor = document.getElementById('yamlEditor');
  const yamlHighlight = document.getElementById('yamlHighlight');
  
  if (!yamlEditor || !yamlHighlight) return;
  
  // Синхронизация скролла и размеров
  function syncScroll() {
    const yamlHighlight = document.getElementById('yamlHighlight');
    if (yamlHighlight && yamlEditor) {
      yamlHighlight.scrollTop = yamlEditor.scrollTop;
      yamlHighlight.scrollLeft = yamlEditor.scrollLeft;
    }
  }
  
  function syncSize() {
    const yamlHighlight = document.getElementById('yamlHighlight');
    if (!yamlHighlight || !yamlEditor) return;
    
    // Принудительно синхронизируем размеры
    yamlHighlight.style.width = yamlEditor.clientWidth + 'px';
    yamlHighlight.style.height = yamlEditor.clientHeight + 'px';
    yamlHighlight.style.padding = getComputedStyle(yamlEditor).padding;
    yamlHighlight.style.border = getComputedStyle(yamlEditor).border;
    yamlHighlight.style.fontSize = getComputedStyle(yamlEditor).fontSize;
    yamlHighlight.style.fontFamily = getComputedStyle(yamlEditor).fontFamily;
    yamlHighlight.style.lineHeight = getComputedStyle(yamlEditor).lineHeight;
    
    // Синхронизируем скролл после изменения размеров
    syncScroll();
  }
  
  // Обновление подсветки с debounce
  function updateHighlight() {
    clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (!yamlHighlight || !yamlEditor) return;
      
      const text = yamlEditor.value;
      yamlHighlight.innerHTML = highlightYaml(text);
      
      // Принудительная синхронизация после обновления контента
      requestAnimationFrame(() => {
        syncSize();
        // Дополнительная синхронизация через небольшую задержку
        setTimeout(syncScroll, 10);
      });
    }, 50); // Быстрое обновление подсветки
  }
  
  // Функция валидации и применения YAML
  function validateAndApplyYaml() {
    if (isUpdatingFromCanvas) return;
    
    const currentYaml = yamlEditor.value;
    
    try {
      // Пытаемся парсить YAML
      const parsedData = window.ScreenGenerator.parseYamlToCanvas(currentYaml);
      if (parsedData) {
        // YAML валидный - применяем изменения
        console.log('YAML valid, applying changes');
        lastValidYaml = currentYaml;
        lastValidState = {
          widgets: JSON.parse(JSON.stringify(window.ScreenGenerator.widgets)),
          background: window.ScreenGenerator.background ? JSON.parse(JSON.stringify(window.ScreenGenerator.background)) : null
        };
        
        window.ScreenGenerator.applyYamlToCanvas(parsedData);
        
        // Сохраняем в историю (с debounce)
        clearTimeout(window.ScreenGenerator._yamlChangeTimeout);
        window.ScreenGenerator._yamlChangeTimeout = setTimeout(() => {
          if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
            window.ScreenGenerator.saveState('YAML edit');
          }
        }, 2000); // 2 секунды задержки для группировки YAML изменений
        
        // Обновляем подсветку с зеленым индикатором
        updateHighlight(true);
        return true;
      }
    } catch (error) {
      console.log('YAML invalid, keeping last valid state:', error.message);
      // YAML невалидный - используем последнее валидное состояние
      if (lastValidState) {
        isUpdatingFromCanvas = true;
        window.ScreenGenerator.widgets = JSON.parse(JSON.stringify(lastValidState.widgets));
        window.ScreenGenerator.background = lastValidState.background ? JSON.parse(JSON.stringify(lastValidState.background)) : null;
        
        // Обновляем canvas без изменения YAML редактора
        if (window.ScreenGenerator.render) window.ScreenGenerator.render();
        if (window.ScreenGenerator.updateProps) window.ScreenGenerator.updateProps();
        if (window.ScreenGenerator.updateWidgetList) window.ScreenGenerator.updateWidgetList();
        
        isUpdatingFromCanvas = false;
      }
      
      // Обновляем подсветку с красным индикатором
      updateHighlight(false);
      return false;
    }
  }
  
  // Обновленная функция подсветки с индикатором валидности
  function updateHighlight(isValid = null) {
    clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      const text = yamlEditor.value;
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight && yamlEditor) {
        yamlHighlight.innerHTML = highlightYaml(text);
        
        // Добавляем индикатор валидности
        if (isValid !== null) {
          const indicator = document.querySelector('.yaml-hint');
          if (indicator) {
            if (isValid) {
              indicator.innerHTML = '✅ Синтаксис корректен - изменения применены';
              indicator.style.color = 'var(--accent3, #4ade80)';
            } else {
              indicator.innerHTML = '❌ Ошибка синтаксиса - используется последняя валидная версия';
              indicator.style.color = '#ef4444';
            }
            
            // Сбрасываем индикатор через 2 секунды
            setTimeout(() => {
              indicator.innerHTML = '⚡ Изменения применяются мгновенно при корректном синтаксисе';
              indicator.style.color = '';
            }, 2000);
          }
        }
      }
      
      // Принудительная синхронизация после обновления контента
      requestAnimationFrame(() => {
        syncSize();
        // Дополнительная синхронизация через небольшую задержку
        setTimeout(syncScroll, 10);
      });
    }, 50);
  }
  
  // Обработчики событий с мгновенным применением
  yamlEditor.addEventListener('input', () => {
    isUserEditing = true;
    
    // Debounce для производительности
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      validateAndApplyYaml();
    }, 150); // 150ms задержка для избежания слишком частых обновлений
    
    // Подсветка обновляется сразу
    updateHighlight();
  });
  
  yamlEditor.addEventListener('focus', () => {
    isUserEditing = true;
    // Сохраняем текущее валидное состояние при начале редактирования
    if (!lastValidYaml) {
      lastValidYaml = yamlEditor.value;
      lastValidState = {
        widgets: JSON.parse(JSON.stringify(window.ScreenGenerator.widgets)),
        background: window.ScreenGenerator.background ? JSON.parse(JSON.stringify(window.ScreenGenerator.background)) : null
      };
    }
    setTimeout(syncSize, 10);
  });
  
  yamlEditor.addEventListener('blur', () => {
    isUserEditing = false;
    // Финальная валидация при потере фокуса
    validateAndApplyYaml();
  });
  
  yamlEditor.addEventListener('scroll', () => {
    syncScroll();
    // Дополнительная синхронизация через RAF для плавности
    requestAnimationFrame(syncScroll);
  });
  yamlEditor.addEventListener('keydown', handleKeyDown);
  
  // Обработчик изменения размера с дополнительной синхронизацией
  const resizeObserver = new ResizeObserver(() => {
    syncSize();
    // Дополнительная синхронизация через небольшую задержку
    setTimeout(() => {
      syncSize();
      syncScroll();
    }, 50);
  });
  resizeObserver.observe(yamlEditor);
  
  // Дополнительные обработчики для лучшей синхронизации
  yamlEditor.addEventListener('mousewheel', syncScroll);
  yamlEditor.addEventListener('wheel', syncScroll);
  yamlEditor.addEventListener('touchmove', syncScroll);
  
  // Периодическая проверка синхронизации (каждые 500ms)
  setInterval(() => {
    if (yamlEditor && document.getElementById('yamlHighlight')) {
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (Math.abs(yamlHighlight.scrollTop - yamlEditor.scrollTop) > 1 ||
          Math.abs(yamlHighlight.scrollLeft - yamlEditor.scrollLeft) > 1) {
        syncScroll();
      }
    }
  }, 500);
  
  // Обработка специальных клавиш
  function handleKeyDown(e) {
    // Предотвращаем обработку Delete/Backspace на canvas когда фокус в редакторе
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Останавливаем всплытие события, чтобы canvas не получил его
      e.stopPropagation();
      // Позволяем стандартное поведение в текстовом поле
      return;
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = yamlEditor.selectionStart;
      const end = yamlEditor.selectionEnd;
      const value = yamlEditor.value;
      
      if (e.shiftKey) {
        // Shift+Tab - убрать отступ
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
        const lineText = value.substring(lineStart, actualLineEnd);
        
        if (lineText.startsWith('  ')) {
          const newLineText = lineText.substring(2);
          yamlEditor.value = value.substring(0, lineStart) + newLineText + value.substring(actualLineEnd);
          yamlEditor.selectionStart = yamlEditor.selectionEnd = Math.max(lineStart, start - 2);
        }
      } else {
        // Tab - добавить отступ
        yamlEditor.value = value.substring(0, start) + '  ' + value.substring(end);
        yamlEditor.selectionStart = yamlEditor.selectionEnd = start + 2;
      }
      updateHighlight();
    }
  }
  
  // Инициализация с текущим YAML (отложенная)
  setTimeout(() => {
    updateYamlEditor();
  }, 100);
  
  // Устанавливаем фокус на редактор
  setTimeout(() => {
    if (yamlEditor) yamlEditor.focus();
  }, 200);
}

// Обновление редактора из canvas
function updateYamlEditor() {
  if (!yamlEditor || isUpdatingFromCanvas) return;
  
  // НЕ обновляем если пользователь активно редактирует
  if (isUserEditing || document.activeElement === yamlEditor) {
    console.log('User is editing YAML, skipping canvas->editor update');
    return;
  }
  
  // Проверяем, доступна ли функция plainYaml
  if (!window.ScreenGenerator.plainYaml) {
    console.log('plainYaml function not available yet, skipping update');
    return;
  }
  
  isUpdatingFromCanvas = true;
  
  // Сохраняем позицию курсора
  const cursorPos = yamlEditor.selectionStart;
  const scrollTop = yamlEditor.scrollTop;
  
  const plainYamlText = window.ScreenGenerator.plainYaml();
  yamlEditor.value = plainYamlText;
  
  // Обновляем сохраненное валидное состояние
  lastValidYaml = plainYamlText;
  lastValidState = {
    widgets: JSON.parse(JSON.stringify(window.ScreenGenerator.widgets)),
    background: window.ScreenGenerator.background ? JSON.parse(JSON.stringify(window.ScreenGenerator.background)) : null
  };
  
  // Обновляем подсветку
  const yamlHighlight = document.getElementById('yamlHighlight');
  if (yamlHighlight) {
    yamlHighlight.innerHTML = highlightYaml(plainYamlText);
  }
  
  // Восстанавливаем позицию курсора и скролл
  setTimeout(() => {
    if (yamlEditor) {
      yamlEditor.selectionStart = yamlEditor.selectionEnd = Math.min(cursorPos, yamlEditor.value.length);
      yamlEditor.scrollTop = scrollTop;
      
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight) {
        yamlHighlight.scrollTop = scrollTop;
        yamlHighlight.scrollLeft = yamlEditor.scrollLeft;
        
        // Дополнительная синхронизация через RAF
        requestAnimationFrame(() => {
          syncScroll();
        });
      }
      
      isUpdatingFromCanvas = false;
      isUserEditing = false; // Сбрасываем флаг редактирования при программном обновлении
    }
  }, 10);
}

// Подсветка синтаксиса с выделением блоков виджетов
function highlightYaml(text) {
  const { selectedId } = window.ScreenGenerator || {};
  
  // Экранируем HTML символы
  let highlighted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Разбиваем на строки для построчной обработки
  const lines = highlighted.split('\n');
  let currentSection = null;
  let currentWidgetId = null;
  let currentBlockLines = [];
  let isInSelectedBlock = false;
  const result = [];
  
  // Функция для завершения текущего блока
  function finishCurrentBlock() {
    if (currentBlockLines.length > 0) {
      if (isInSelectedBlock) {
        result.push(`<div class="yaml-block-selected">${currentBlockLines.join('\n')}</div>`);
      } else {
        result.push(currentBlockLines.join('\n'));
      }
      currentBlockLines = [];
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.length - line.trimLeft().length;
    
    // Определяем начало нового блока
    let isNewBlock = false;
    let newBlockSelected = false;
    
    if (line.trim().startsWith('background:')) {
      finishCurrentBlock();
      currentSection = 'background';
      currentWidgetId = null;
      newBlockSelected = selectedId === '__bg__';
      isNewBlock = true;
    } else if (line.trim().startsWith('widgets:')) {
      finishCurrentBlock();
      currentSection = 'widgets';
      currentWidgetId = null;
      newBlockSelected = false;
      isNewBlock = true;
    } else if (line.trim().startsWith('- id:')) {
      finishCurrentBlock();
      const widgetIdMatch = line.match(/- id:\s*(\w+)/);
      if (widgetIdMatch) {
        currentWidgetId = widgetIdMatch[1];
        newBlockSelected = selectedId === currentWidgetId;
        isNewBlock = true;
      }
    } else if (indent === 0 && line.trim()) {
      // Любая другая строка на нулевом уровне начинает новый блок
      finishCurrentBlock();
      currentSection = null;
      currentWidgetId = null;
      newBlockSelected = false;
      isNewBlock = true;
    }
    
    if (isNewBlock) {
      isInSelectedBlock = newBlockSelected;
    }
    
    // Обрабатываем строку
    let processedLine = line;
    if (line.trim()) {
      // Inline комментарии
      if (line.includes('#')) {
        const parts = line.split('#');
        if (parts.length > 1) {
          const beforeComment = parts[0];
          const comment = '#' + parts.slice(1).join('#');
          processedLine = processLine(beforeComment) + '<span class="yc">' + comment + '</span>';
        } else {
          processedLine = processLine(line);
        }
      } else {
        processedLine = processLine(line);
      }
    }
    
    currentBlockLines.push(processedLine);
  }
  
  // Завершаем последний блок
  finishCurrentBlock();
  
  return result.join('\n');
}

// Обработка отдельной строки
function processLine(line) {
  // Элементы списка
  if (line.match(/^\s*-\s/)) {
    return line.replace(/^(\s*)(-\s*)(.*)$/, (match, indent, dash, rest) => {
      return indent + '<span class="yl">' + dash + '</span>' + processKeyValue(rest);
    });
  }
  
  // Обычные ключи
  if (line.includes(':')) {
    return processKeyValue(line);
  }
  
  return line;
}

// Обработка ключ-значение пар в стиле VS Code
function processKeyValue(line) {
  return line.replace(/^(\s*)([\w-]+)(\s*)(:)(.*)$/, (match, indent, key, space, colon, value) => {
    let keyClass = 'yk';
    
    // Специальные ключи (розовые) - как в VS Code
    if (['type', 'text', 'material', 'action', 'hoveredText', 'backgroundColor', 'backgroundAlpha'].includes(key)) {
      keyClass = 'yk-special';
    }
    
    // Обработка значений
    let processedValue = value;
    if (value.trim()) {
      processedValue = processValue(value);
    }
    
    return `${indent}<span class="${keyClass}">${key}</span>${space}<span class="yk">${colon}</span>${processedValue}`;
  });
}

// Обработка значений в стиле VS Code
function processValue(value) {
  return value
    // Строки в кавычках (светло-синие)
    .replace(/(".*?")/g, '<span class="ys">$1</span>')
    // Булевые значения (фиолетовые)
    .replace(/(\s+)(true|false|null)(\s*$)/g, '$1<span class="yb">$2</span>$3')
    // Числовые массивы [1.0, 2.0, 3.0] (синие)
    .replace(/(\[[\d\s,.-]+\])/g, '<span class="yn">$1</span>')
    // Отдельные числа (синие)
    .replace(/(\s+)(\d+(?:\.\d+)?)(\s*)$/g, '$1<span class="yn">$2</span>$3')
    // Значения типов и действий (синие)
    .replace(/(\s+)([A-Z][A-Z_]*[A-Z]|NONE|CLOSE_SCREEN|SWITCH_SCREEN)(\s*)$/g, '$1<span class="yv">$2</span>$3')
    // Эмодзи и специальные символы (зеленые)
    .replace(/(\s*)([🎮⏺🔒])/g, '$1<span class="ye">$2</span>');
}

// Обновление выделения в YAML редакторе
function updateYamlSelection() {
  if (!yamlEditor) return;
  
  // Обновляем подсветку с учетом нового выбранного элемента
  const yamlHighlight = document.getElementById('yamlHighlight');
  if (yamlHighlight && yamlEditor) {
    const text = yamlEditor.value;
    yamlHighlight.innerHTML = highlightYaml(text);
    
    // Принудительная синхронизация после обновления
    requestAnimationFrame(() => {
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight && yamlEditor) {
        yamlHighlight.scrollTop = yamlEditor.scrollTop;
        yamlHighlight.scrollLeft = yamlEditor.scrollLeft;
      }
    });
  }
}

// Функция для сброса состояния редактирования (вызывается при программных изменениях canvas)
function resetEditingState() {
  isUserEditing = false;
  lastValidYaml = '';
  lastValidState = null;
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initYamlEditor,
  updateYamlEditor,
  updateYamlSelection,
  highlightYaml,
  resetEditingState
});