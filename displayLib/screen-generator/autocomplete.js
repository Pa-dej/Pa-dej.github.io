// ═══════════════════════════════════════════════════════════════
// AUTOCOMPLETE FOR DISPLAYLIB LUA API
// ═══════════════════════════════════════════════════════════════

let autocompletePopup = null;
let selectedIndex = 0;
let currentItems = [];
let cursorPos = 0;

// База знаний DisplayLib API
const DL_COMPLETIONS = {
  // Глобальный уровень — что доступно всегда
  globals: [
    { label: 'player',  type: 'object',    detail: 'Текущий игрок' },
    { label: 'screen',  type: 'object',    detail: 'Текущий экран' },
    { label: 'widget',  type: 'object',    detail: 'Виджет (только в onClick)' },
    { label: 'storage', type: 'object',    detail: 'Хранилище данных' },
    { label: 'timer',   type: 'object',    detail: 'Система таймеров' },
    { label: 'log',     type: 'object',    detail: 'Логирование' },
    { label: 'on_open', type: 'lifecycle', detail: 'function on_open() ... end',
      snippet: 'function on_open()\n    $0\nend' },
    { label: 'on_close',type: 'lifecycle', detail: 'function on_close() ... end',
      snippet: 'function on_close()\n    $0\nend' },
    // Стандартные Lua ключевые слова
    { label: 'local',    type: 'keyword', detail: 'Локальная переменная', snippet: 'local $0' },
    { label: 'function', type: 'keyword', detail: 'Объявление функции', snippet: 'function $1()\n    $0\nend' },
    { label: 'if',       type: 'keyword', detail: 'Условие', snippet: 'if $1 then\n    $0\nend' },
    { label: 'for',      type: 'keyword', detail: 'Цикл', snippet: 'for $1 = $2, $3 do\n    $0\nend' },
    { label: 'while',    type: 'keyword', detail: 'Цикл while', snippet: 'while $1 do\n    $0\nend' },
  ],
  
  // Методы каждого объекта
  player: [
    { label: 'name',     type: 'method', detail: '() → string',          snippet: 'name()' },
    { label: 'op',       type: 'method', detail: '() → boolean',         snippet: 'op()' },
    { label: 'gamemode', type: 'method', detail: '(mode?) → string',     snippet: 'gamemode($0)' },
    { label: 'health',   type: 'method', detail: '(value?) → number',    snippet: 'health($0)' },
    { label: 'message',  type: 'method', detail: '(text, color?)',        snippet: 'message("$0")' },
    { label: 'sound',    type: 'method', detail: '(name, vol?, pitch?)', snippet: 'sound("$0")' },
    { label: 'command',  type: 'method', detail: '(cmd)',                snippet: 'command("$0")' },
  ],
  
  screen: [
    { label: 'id',     type: 'method', detail: '() → string',    snippet: 'id()' },
    { label: 'close',  type: 'method', detail: '()',              snippet: 'close()' },
    { label: 'switch', type: 'method', detail: '(screenId)',      snippet: 'switch("$0")' },
    { label: 'widget', type: 'method', detail: '(id) → widget',  snippet: 'widget("$0")' },
    { label: 'data',   type: 'method', detail: '(key, value?)',   snippet: 'data("$0")' },
  ],
  
  widget: [
    { label: 'text',        type: 'method', detail: '(value?) → string',  snippet: 'text($0)' },
    { label: 'hoveredText', type: 'method', detail: '(value)',            snippet: 'hoveredText("$0")' },
    { label: 'visible',     type: 'method', detail: '(value?) → boolean', snippet: 'visible($0)' },
    { label: 'enabled',     type: 'method', detail: '(value?) → boolean', snippet: 'enabled($0)' },
    { label: 'tooltip',     type: 'method', detail: '(value?)',           snippet: 'tooltip("$0")' },
    { label: 'bgColor',     type: 'method', detail: '(r, g, b)',          snippet: 'bgColor($1, $2, $3)' },
    { label: 'bgAlpha',     type: 'method', detail: '(0–255)',            snippet: 'bgAlpha($0)' },
  ],
  
  storage: [
    { label: 'get',    type: 'method', detail: '(key, default?)', snippet: 'get("$0")' },
    { label: 'set',    type: 'method', detail: '(key, value)',    snippet: 'set("$1", $2)' },
    { label: 'has',    type: 'method', detail: '(key) → boolean', snippet: 'has("$0")' },
    { label: 'remove', type: 'method', detail: '(key)',           snippet: 'remove("$0")' },
    { label: 'clear',  type: 'method', detail: '()',              snippet: 'clear()' },
  ],
  
  timer: [
    { label: 'after',  type: 'method', detail: '(ticks, fn) → id',       snippet: 'after($1, function()\n    $0\nend)' },
    { label: 'repeat', type: 'method', detail: '(ticks, fn) → id',       snippet: '["repeat"]($1, function()\n    $0\nend)' },
    { label: 'times',  type: 'method', detail: '(interval, count, fn)',   snippet: 'times($1, $2, function(i)\n    $0\nend)' },
    { label: 'cancel', type: 'method', detail: '(timerId)',               snippet: 'cancel($0)' },
  ],
  
  log: [
    { label: 'info',  type: 'method', detail: '(message)', snippet: 'info("$0")' },
    { label: 'warn',  type: 'method', detail: '(message)', snippet: 'warn("$0")' },
    { label: 'error', type: 'method', detail: '(message)', snippet: 'error("$0")' },
  ],
};
// Определение контекста для автодополнения
function getContext(text, cursorPos) {
  const before = text.slice(0, cursorPos);
  
  // Случай 1: "player." или "screen." — показать методы объекта
  const memberMatch = before.match(/(\w+)\.(\w*)$/);
  if (memberMatch) {
    const obj = memberMatch[1];   // "player"
    const partial = memberMatch[2]; // "hea" — уже набранная часть
    if (DL_COMPLETIONS[obj]) {
      return { type: 'member', object: obj, partial };
    }
  }
  
  // Случай 2: просто слово — показать глобалы + ключевые слова
  const wordMatch = before.match(/(\w+)$/);
  if (wordMatch) {
    const partial = wordMatch[1];
    // Требуем минимум 1 символ
    if (partial.length >= 1) {
      return { type: 'global', partial };
    }
  }
  
  return null;
}

// Фильтрация элементов по частичному совпадению
function filterItems(items, partial) {
  // Требуем минимум 1 символ для показа подсказок
  if (!partial || partial.length === 0) return [];
  
  const lowerPartial = partial.toLowerCase();
  const filtered = items.filter(item => 
    item.label.toLowerCase().startsWith(lowerPartial) ||
    item.label.toLowerCase().includes(lowerPartial)
  ).sort((a, b) => {
    // Точные совпадения в начале
    const aExact = a.label.toLowerCase() === lowerPartial;
    const bExact = b.label.toLowerCase() === lowerPartial;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    // Совпадения с начала строки
    const aStarts = a.label.toLowerCase().startsWith(lowerPartial);
    const bStarts = b.label.toLowerCase().startsWith(lowerPartial);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    // Затем по алфавиту
    return a.label.localeCompare(b.label);
  });
  
  return filtered.slice(0, 15); // Максимум 15 результатов
}

// Получение координат курсора в textarea (упрощенная версия)
function getCaretCoordinates(element, position) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  
  // Копируем стили
  ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight',
   'padding', 'border', 'boxSizing', 'whiteSpace', 'wordWrap'].forEach(prop => {
    div.style[prop] = style[prop];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.height = 'auto';
  div.style.width = element.clientWidth + 'px';
  div.style.top = '0px';
  div.style.left = '0px';
  
  const text = element.value.substring(0, position);
  div.textContent = text;
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  document.body.appendChild(div);
  
  const rect = element.getBoundingClientRect();
  const coordinates = {
    top: rect.top + span.offsetTop - element.scrollTop,
    left: rect.left + span.offsetLeft - element.scrollLeft
  };
  
  document.body.removeChild(div);
  return coordinates;
}

// Показ попапа автодополнения
function showAutocomplete(items, anchorPos) {
  if (!autocompletePopup) {
    autocompletePopup = document.createElement('div');
    autocompletePopup.id = 'autocomplete-popup';
    autocompletePopup.className = 'autocomplete-popup';
    document.body.appendChild(autocompletePopup);
  }
  
  currentItems = items;
  selectedIndex = 0;
  
  // Функция для получения иконки по типу
  function getIconForType(type) {
    switch (type) {
      case 'object': return '<img src="../../icons/open.svg" class="ac-icon-svg" alt="obj">';
      case 'method': return '<img src="../../icons/function.svg" class="ac-icon-svg" alt="fn">';
      case 'lifecycle': return '<img src="../../icons/function.svg" class="ac-icon-svg" alt="lc">';
      case 'keyword': return '<img src="../../icons/var.svg" class="ac-icon-svg" alt="kw">';
      default: return '<img src="../../icons/close.svg" class="ac-icon-svg" alt="?">';
    }
  }
  
  autocompletePopup.innerHTML = items.map((item, i) => `
    <div class="ac-item ${i === 0 ? 'ac-selected' : ''}" data-index="${i}" data-type="${item.type}">
      <span class="ac-icon-container">${getIconForType(item.type)}</span>
      <span class="ac-label">${item.label}</span>
      <span class="ac-detail">${item.detail}</span>
    </div>
  `).join('');
  
  // Позиция — под курсором в textarea
  autocompletePopup.style.top = (anchorPos.top + 20) + 'px';
  autocompletePopup.style.left = anchorPos.left + 'px';
  autocompletePopup.style.display = 'block';
  
  // Обработчики кликов
  autocompletePopup.querySelectorAll('.ac-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      selectedIndex = index;
      applyCompletion(currentItems[selectedIndex]);
    });
  });
}

// Скрытие попапа
function hideAutocomplete() {
  if (autocompletePopup) {
    autocompletePopup.style.display = 'none';
    currentItems = [];
    selectedIndex = 0;
  }
}

// Перемещение выделения в попапе
function moveSelection(delta) {
  if (!currentItems.length) return;
  
  // Убираем старое выделение
  const oldSelected = autocompletePopup.querySelector('.ac-selected');
  if (oldSelected) {
    oldSelected.classList.remove('ac-selected');
  }
  
  // Вычисляем новый индекс
  selectedIndex = Math.max(0, Math.min(currentItems.length - 1, selectedIndex + delta));
  
  // Добавляем новое выделение
  const newSelected = autocompletePopup.querySelector(`[data-index="${selectedIndex}"]`);
  if (newSelected) {
    newSelected.classList.add('ac-selected');
    
    // Прокручиваем к выбранному элементу
    newSelected.scrollIntoView({ 
      block: 'nearest',
      behavior: 'smooth'
    });
  }
}

// Получение выбранного элемента
function getSelectedItem() {
  return currentItems[selectedIndex];
}

// Применение выбранного автодополнения
function applyCompletion(item) {
  const codeEditor = document.getElementById('yamlEditor');
  if (!item || !codeEditor) return;
  
  const snippet = item.snippet || item.label;
  const before = codeEditor.value.slice(0, cursorPos);
  const after = codeEditor.value.slice(cursorPos);
  
  // Убираем уже набранную часть
  const cleaned = before.replace(/[\w.]*$/, '');
  
  // Вставляем snippet, позиционируем курсор на $0
  let finalText = snippet;
  let newCursorPos = cleaned.length + finalText.length;
  
  // Обрабатываем плейсхолдеры $0, $1, $2...
  if (finalText.includes('$0')) {
    newCursorPos = cleaned.length + finalText.indexOf('$0');
    finalText = finalText.replace(/\$\d+/g, '');
  } else {
    finalText = finalText.replace(/\$\d+/g, '');
  }
  
  codeEditor.value = cleaned + finalText + after;
  codeEditor.setSelectionRange(newCursorPos, newCursorPos);
  
  hideAutocomplete();
  
  // Обновляем подсветку
  if (window.updateHighlightNow) {
    window.updateHighlightNow();
  }
  
  // Фокус обратно на редактор
  codeEditor.focus();
}
// Инициализация автодополнения
function initAutocomplete() {
  // Ждем инициализации редактора
  const codeEditor = document.getElementById('yamlEditor');
  if (!codeEditor) {
    console.warn('Code editor not found, autocomplete disabled');
    return;
  }
  
  // Проверяем, не инициализировано ли уже
  if (codeEditor._autocompleteInitialized) {
    console.log('Autocomplete already initialized');
    return;
  }
  
  console.log('Initializing autocomplete for code editor:', codeEditor);
  
  // Функция для обработки автодополнения
  function handleAutocomplete() {
    // Проверяем активную вкладку через DOM
    const activeTab = document.querySelector('.editor-tab.active');
    const isLuaTab = activeTab && activeTab.dataset.tab === 'lua';
    
    // Только для Lua вкладки
    if (!isLuaTab) {
      hideAutocomplete();
      return;
    }
    
    cursorPos = codeEditor.selectionStart;
    const context = getContext(codeEditor.value, cursorPos);
    
    if (!context) {
      hideAutocomplete();
      return;
    }
    
    let items = [];
    
    if (context.type === 'member' && DL_COMPLETIONS[context.object]) {
      items = filterItems(DL_COMPLETIONS[context.object], context.partial);
    } else if (context.type === 'global') {
      items = filterItems(DL_COMPLETIONS.globals, context.partial);
    }
    
    if (items.length > 0) {
      const coords = getCaretCoordinates(codeEditor, cursorPos);
      showAutocomplete(items, coords);
    } else {
      hideAutocomplete();
    }
  }
  
  // Обработчик ввода для показа автодополнения
  codeEditor.addEventListener('input', handleAutocomplete);
  
  // Также обрабатываем keyup для случаев когда курсор перемещается
  codeEditor.addEventListener('keyup', (e) => {
    // Проверяем активную вкладку через DOM
    const activeTab = document.querySelector('.editor-tab.active');
    const isLuaTab = activeTab && activeTab.dataset.tab === 'lua';
    
    // Показываем автодополнение при нажатии Ctrl+Space
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      handleAutocomplete();
      return;
    }
    
    // Только для Lua вкладки
    if (!isLuaTab) return;
    
    // Проверяем, открыт ли попап автодополнения
    const popup = document.getElementById('autocomplete-popup');
    const isPopupOpen = popup && popup.style.display !== 'none';
    
    // Если попап открыт, НЕ обрабатываем навигационные клавиши
    if (isPopupOpen && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      return;
    }
    
    // Показываем автодополнение при вводе точки
    if (e.key === '.') {
      setTimeout(handleAutocomplete, 10);
      return;
    }
    
    // Показываем глобальные подсказки при начале ввода
    if (e.key.length === 1 && /[a-zA-Z_]/.test(e.key)) {
      setTimeout(handleAutocomplete, 10);
      return;
    }
    
    // Скрываем при навигационных клавишах только если попап закрыт
    if (!isPopupOpen && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      hideAutocomplete();
    }
  });
  
  // Обработчик клавиш для навигации в попапе
  codeEditor.addEventListener('keydown', (e) => {
    const popup = document.getElementById('autocomplete-popup');
    if (!popup || popup.style.display === 'none') return;
    
    // Предотвращаем обработку стрелок редактором когда попап открыт
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        moveSelection(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        moveSelection(-1);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        applyCompletion(getSelectedItem());
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        hideAutocomplete();
        break;
    }
  });
  
  // Скрываем попап при клике вне его
  document.addEventListener('click', (e) => {
    if (autocompletePopup && !autocompletePopup.contains(e.target) && e.target !== codeEditor) {
      hideAutocomplete();
    }
  });
  
  // Скрываем попап при потере фокуса редактором
  codeEditor.addEventListener('blur', () => {
    // Небольшая задержка, чтобы клик по попапу успел сработать
    setTimeout(hideAutocomplete, 150);
  });
  
  // Отмечаем что автодополнение инициализировано
  codeEditor._autocompleteInitialized = true;
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initAutocomplete,
  showAutocomplete,
  hideAutocomplete,
  // Тестовая функция для отладки
  testAutocomplete: function() {
    console.log('=== AUTOCOMPLETE DEBUG ===');
    const codeEditor = document.getElementById('yamlEditor');
    console.log('Code editor found:', !!codeEditor);
    console.log('Current tab:', window.ScreenGenerator?.currentTab);
    console.log('Autocomplete initialized:', codeEditor?._autocompleteInitialized);
    
    if (codeEditor) {
      const cursorPos = codeEditor.selectionStart;
      const context = getContext(codeEditor.value, cursorPos);
      console.log('Current context:', context);
      console.log('Cursor position:', cursorPos);
      console.log('Text before cursor:', codeEditor.value.slice(0, cursorPos));
      
      // Принудительно показываем автодополнение
      if (context) {
        let items = [];
        if (context.type === 'member' && DL_COMPLETIONS[context.object]) {
          items = filterItems(DL_COMPLETIONS[context.object], context.partial);
        } else if (context.type === 'global') {
          items = filterItems(DL_COMPLETIONS.globals, context.partial);
        }
        console.log('Available items:', items);
        
        if (items.length > 0) {
          const coords = getCaretCoordinates(codeEditor, cursorPos);
          console.log('Showing autocomplete at:', coords);
          showAutocomplete(items, coords);
        }
      }
    }
    console.log('=== END DEBUG ===');
  },
  onTabSwitch: function(tabType) {
    if (tabType === 'lua') {
      // Принудительно переинициализируем автодополнение
      setTimeout(() => {
        const codeEditor = document.getElementById('yamlEditor');
        if (codeEditor && !codeEditor._autocompleteInitialized) {
          initAutocomplete();
        }
      }, 100);
    } else {
      hideAutocomplete();
    }
  }
});

// Автоинициализация при загрузке
function tryInitAutocomplete() {
  const codeEditor = document.getElementById('yamlEditor');
  if (codeEditor) {
    initAutocomplete();
  } else {
    setTimeout(tryInitAutocomplete, 500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(tryInitAutocomplete, 1000);
  });
} else {
  setTimeout(tryInitAutocomplete, 1000);
}