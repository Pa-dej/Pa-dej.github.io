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
    // Устанавливаем минимальную высоту
    const minHeight = yamlEditor.clientHeight;
    const contentHeight = Math.max(minHeight, yamlEditor.scrollHeight);
    yamlHighlight.style.height = contentHeight + 'px';
  }
  
  // Обновление подсветки с debounce
  function updateHighlight() {
    clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      const text = yamlEditor.value;
      yamlHighlight.innerHTML = highlightYaml(text);
      syncSize();
    }, 50); // Быстрое обновление подсветки
  }
  
  // Обработчики событий
  yamlEditor.addEventListener('input', () => {
    updateHighlight();
    
    if (!isUpdatingFromCanvas) {
      // Debounce для применения изменений к canvas
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        try {
          const parsedData = window.ScreenGenerator.parseYamlToCanvas(yamlEditor.value);
          if (parsedData) {
            window.ScreenGenerator.applyYamlToCanvas(parsedData);
          }
        } catch (error) {
          console.error('Error applying YAML to canvas:', error);
        }
      }, 500); // 500ms задержка
    }
  });
  
  yamlEditor.addEventListener('scroll', syncScroll);
  yamlEditor.addEventListener('keydown', handleKeyDown);
  
  // Обработчик изменения размера
  const resizeObserver = new ResizeObserver(() => {
    syncSize();
  });
  resizeObserver.observe(yamlEditor);
  
  // Обработка специальных клавиш
  function handleKeyDown(e) {
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

// Подсветка синтаксиса
function highlightYaml(text) {
  // Экранируем HTML символы
  let highlighted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Разбиваем на строки для построчной обработки
  const lines = highlighted.split('\n');
  const processedLines = lines.map(line => {
    // Пропускаем пустые строки
    if (!line.trim()) return line;
    
    // Комментарии
    if (line.trim().startsWith('#')) {
      return line.replace(/^(\s*)(#.*)$/, '$1<span class="yc">$2</span>');
    }
    
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
  });
  
  return processedLines.join('\n');
}

// Обработка ключ-значение пар
function processKeyValue(line) {
  return line.replace(/^(\s*)([\w-]+)(\s*)(:)(.*)$/, (match, indent, key, space, colon, value) => {
    let keyClass = 'yk';
    
    // Специальные ключи
    if (['id', 'type', 'material', 'text', 'action'].includes(key)) {
      keyClass = 'yk-special';
    }
    
    // Обработка значений
    let processedValue = value;
    if (value.trim()) {
      processedValue = processValue(value);
    }
    
    return `${indent}<span class="${keyClass}">${key}</span>${space}${colon}${processedValue}`;
  });
}

// Обработка значений
function processValue(value) {
  return value
    // Строки в кавычках
    .replace(/(".*?")/g, '<span class="yv">$1</span>')
    // Числовые массивы [1.0, 2.0, 3.0]
    .replace(/(\[[\d\s,.-]+\])/g, '<span class="yn">$1</span>')
    // Отдельные числа в конце строки
    .replace(/(\s+)(\d+(?:\.\d+)?)(\s*)$/, '$1<span class="yn">$2</span>$3')
    // Значения типов (заглавные буквы с подчеркиваниями)
    .replace(/(\s+)([A-Z][A-Z_]*[A-Z])(\s*)$/, '$1<span class="yv">$2</span>$3');
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initYamlEditor,
  updateYamlEditor,
  highlightYaml
});