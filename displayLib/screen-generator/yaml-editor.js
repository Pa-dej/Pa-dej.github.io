// ═══════════════════════════════════════════════════════════════
// YAML EDITOR WITH SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════

let yamlEditor = null;
let isUpdatingFromCanvas = false;
let updateTimeout = null;
let highlightTimeout = null;

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
        <span class="yaml-hint">💡 Изменения применяются при потере фокуса</span>
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
    yamlHighlight.scrollTop = yamlEditor.scrollTop;
    yamlHighlight.scrollLeft = yamlEditor.scrollLeft;
  }
  
  function syncSize() {
    // Устанавливаем одинаковые размеры для обоих элементов
    const editorRect = yamlEditor.getBoundingClientRect();
    const containerRect = yamlEditor.parentElement.getBoundingClientRect();
    
    // Синхронизируем размеры
    yamlHighlight.style.width = yamlEditor.offsetWidth + 'px';
    yamlHighlight.style.height = yamlEditor.offsetHeight + 'px';
    
    // Убеждаемся, что scrollHeight одинаковый
    const contentHeight = Math.max(yamlEditor.scrollHeight, yamlHighlight.scrollHeight);
    if (yamlEditor.scrollHeight !== yamlHighlight.scrollHeight) {
      // Принудительно синхронизируем высоту контента
      yamlHighlight.style.minHeight = yamlEditor.scrollHeight + 'px';
    }
  }
  
  // Обновление подсветки с debounce
  function updateHighlight() {
    clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      const text = yamlEditor.value;
      yamlHighlight.innerHTML = highlightYaml(text);
      
      // Принудительная синхронизация после обновления контента
      requestAnimationFrame(() => {
        syncSize();
        syncScroll();
      });
    }, 50); // Быстрое обновление подсветки
  }
  
  // Функция применения YAML к canvas
  function applyYamlChanges() {
    if (isUpdatingFromCanvas) return;
    
    try {
      const parsedData = window.ScreenGenerator.parseYamlToCanvas(yamlEditor.value);
      if (parsedData) {
        window.ScreenGenerator.applyYamlToCanvas(parsedData);
      }
    } catch (error) {
      console.error('Error applying YAML to canvas:', error);
    }
  }

  // Применение изменений при потере фокуса
  yamlEditor.addEventListener('blur', () => {
    applyYamlChanges();
  });
  
  yamlEditor.addEventListener('scroll', syncScroll);
  yamlEditor.addEventListener('keydown', handleKeyDown);
  
  // Дополнительные обработчики для лучшей синхронизации
  yamlEditor.addEventListener('input', () => {
    updateHighlight();
    // Убрано автоматическое применение изменений при вводе
    // Теперь изменения применяются только при потере фокуса
  });
  
  yamlEditor.addEventListener('focus', () => {
    // При получении фокуса синхронизируем размеры
    setTimeout(syncSize, 10);
  });
  
  // Обработчик изменения размера
  const resizeObserver = new ResizeObserver(() => {
    syncSize();
  });
  resizeObserver.observe(yamlEditor);
  
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
  
  // Инициализация с текущим YAML
  updateYamlEditor();
  
  // Устанавливаем фокус на редактор
  setTimeout(() => {
    yamlEditor.focus();
  }, 100);
}

// Обновление редактора из canvas
function updateYamlEditor() {
  if (!yamlEditor || isUpdatingFromCanvas) return;
  
  // Проверяем, есть ли фокус на редакторе (пользователь редактирует)
  if (document.activeElement === yamlEditor) {
    console.log('YAML editor has focus, skipping update to avoid interrupting user input');
    return;
  }
  
  isUpdatingFromCanvas = true;
  
  // Сохраняем позицию курсора
  const cursorPos = yamlEditor.selectionStart;
  const scrollTop = yamlEditor.scrollTop;
  
  const plainYamlText = window.ScreenGenerator.plainYaml();
  yamlEditor.value = plainYamlText;
  
  // Обновляем подсветку
  const yamlHighlight = document.getElementById('yamlHighlight');
  if (yamlHighlight) {
    yamlHighlight.innerHTML = highlightYaml(plainYamlText);
  }
  
  // Восстанавливаем позицию курсора и скролл
  setTimeout(() => {
    yamlEditor.selectionStart = yamlEditor.selectionEnd = Math.min(cursorPos, yamlEditor.value.length);
    yamlEditor.scrollTop = scrollTop;
    if (yamlHighlight) {
      yamlHighlight.scrollTop = scrollTop;
    }
    isUpdatingFromCanvas = false;
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
  if (yamlHighlight) {
    const text = yamlEditor.value;
    yamlHighlight.innerHTML = highlightYaml(text);
  }
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initYamlEditor,
  updateYamlEditor,
  updateYamlSelection,
  highlightYaml
});