// ═══════════════════════════════════════════════════════════════
// UNIVERSAL CODE EDITOR WITH TABS AND SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════

let codeEditor = null;
let isUpdatingFromCanvas = false;
let updateTimeout = null;
let highlightTimeout = null;
let currentTab = 'yaml'; // 'yaml' или 'lua'

// Система мгновенного применения изменений (только для YAML)
let lastValidYaml = ''; // Последний валидный YAML
let lastValidState = null; // Последнее валидное состояние canvas
let isUserEditing = false; // Флаг редактирования пользователем

// Хранение содержимого вкладок
let tabContents = {
  yaml: '',
  lua: ''
};

// ═══════════════════════════════════════════════════════════════
// 1. YAML SYNTAX HIGHLIGHTING
// ═══════════════════════════════════════════════════════════════

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
          processedLine = processYamlLine(beforeComment) + '<span class="yc">' + comment + '</span>';
        } else {
          processedLine = processYamlLine(line);
        }
      } else {
        processedLine = processYamlLine(line);
      }
    }
    
    currentBlockLines.push(processedLine);
  }
  
  // Завершаем последний блок
  finishCurrentBlock();
  
  return result.join('\n');
}
// Обработка отдельной строки YAML
function processYamlLine(line) {
  // Элементы списка
  if (line.match(/^\s*-\s/)) {
    return line.replace(/^(\s*)(-\s*)(.*)$/, (match, indent, dash, rest) => {
      return indent + '<span class="yl">' + dash + '</span>' + processYamlKeyValue(rest);
    });
  }
  
  // Обычные ключи
  if (line.includes(':')) {
    return processYamlKeyValue(line);
  }
  
  return line;
}

// Обработка ключ-значение пар в стиле VS Code
function processYamlKeyValue(line) {
  return line.replace(/^(\s*)([\w-]+)(\s*)(:)(.*)$/, (match, indent, key, space, colon, value) => {
    let keyClass = 'yk';
    
    // Специальные ключи (розовые) - как в VS Code
    if (['type', 'text', 'material', 'action', 'hoveredText', 'backgroundColor', 'backgroundAlpha'].includes(key)) {
      keyClass = 'yk-special';
    }
    
    // Обработка значений
    let processedValue = value;
    if (value.trim()) {
      processedValue = processYamlValue(value);
    }
    
    return `${indent}<span class="${keyClass}">${key}</span>${space}<span class="yk">${colon}</span>${processedValue}`;
  });
}

// Обработка значений в стиле VS Code
function processYamlValue(value) {
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

// ═══════════════════════════════════════════════════════════════
// 2. LUA SYNTAX HIGHLIGHTING (PROPER TOKENIZER)
// ═══════════════════════════════════════════════════════════════

// Подсветка синтаксиса Lua с правильным токенизатором
function highlightLua(text) {
  const { selectedId } = window.ScreenGenerator || {};
  
  // Экранируем HTML символы
  let highlighted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Разбиваем на строки для построчной обработки
  const lines = highlighted.split('\n');
  let currentWidgetId = null;
  let currentBlockLines = [];
  let isInSelectedBlock = false;
  const result = [];
  
  // Функция для завершения текущего блока
  function finishCurrentBlock() {
    if (currentBlockLines.length > 0) {
      if (isInSelectedBlock) {
        result.push(`<div class="lua-block-selected">${currentBlockLines.join('\n')}</div>`);
      } else {
        result.push(currentBlockLines.join('\n'));
      }
      currentBlockLines = [];
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Определяем начало нового блока виджета
    let isNewBlock = false;
    let newBlockSelected = false;
    
    // Ищем комментарии с ID виджетов
    const widgetIdMatch = line.match(/^-- (widget_\d+|background)/);
    if (widgetIdMatch) {
      finishCurrentBlock();
      currentWidgetId = widgetIdMatch[1];
      newBlockSelected = selectedId === (currentWidgetId === 'background' ? '__bg__' : currentWidgetId);
      isNewBlock = true;
    } else if (line.trim().startsWith('-- ') && !line.includes('DisplayLib') && !line.includes('Generated') && !line.includes('Register')) {
      // Другие секции (Background, Widgets, Register screen)
      finishCurrentBlock();
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
      processedLine = highlightLuaLine(line);
    }
    
    currentBlockLines.push(processedLine);
  }
  
  // Завершаем последний блок
  finishCurrentBlock();
  
  return result.join('\n');
}

// Обработка отдельной строки Lua
function highlightLuaLine(line) {
  // Комментарии - обрабатываем в первую очередь
  if (line.trim().startsWith('--')) {
    return '<span class="lc">' + line + '</span>';
  }
  
  if (line.includes('--')) {
    const commentIndex = line.indexOf('--');
    const beforeComment = line.substring(0, commentIndex);
    const comment = line.substring(commentIndex);
    return tokenizeLua(beforeComment) + '<span class="lc">' + comment + '</span>';
  }
  
  return tokenizeLua(line);
}

// Правильный токенизатор Lua
function tokenizeLua(code) {
  // Стандартные ключевые слова Lua — класс lk
  const LUA_KEYWORDS = new Set(['local', 'function', 'end', 'if', 'then', 'else', 
    'elseif', 'for', 'while', 'do', 'repeat', 'until', 'break', 'return',
    'and', 'or', 'not', 'true', 'false', 'nil']);
  
  // Стандартные встроенные Lua — класс lf
  const LUA_BUILTINS = new Set(['math', 'string', 'table', 'type', 'tostring', 'tonumber',
    'ipairs', 'pairs', 'pcall', 'error', 'print',
    'require', 'dofile', 'loadfile', 'load',
    // Функции генерации DisplayLib (для обратной совместимости)
    'newScreen', 'setBackground', 'addTextButton', 'addItemButton', 'registerScreen']);
  
  // Глобальные объекты DisplayLib — класс la (api objects)
  const DL_GLOBALS = new Set([
    'player', 'screen', 'widget', 'storage', 'timer', 'log'
  ]);
  
  // Методы объектов DisplayLib — класс lm (api methods)
  const DL_METHODS = new Set([
    // player.*
    'name', 'op', 'gamemode', 'health', 'message', 'sound', 'command',
    // screen.*
    'id', 'close', 'switch', 'data',
    // widget.*
    'text', 'hoveredText', 'visible', 'enabled', 'tooltip', 'bgColor', 'bgAlpha',
    // storage.*
    'get', 'set', 'has', 'remove', 'clear',
    // timer.*
    'after', 'times', 'cancel',
    // log.*
    'info', 'warn', 'error'
  ]);
  
  // Lifecycle функции — класс ll (lifecycle)
  const DL_LIFECYCLE = new Set([
    'on_open', 'on_close'
  ]);
  
  // Вспомогательная функция — последний видимый символ в результате
  function lastRealChar(html) {
    // Убираем span-теги и смотрим на последний символ
    const stripped = html.replace(/<[^>]+>/g, '');
    return stripped[stripped.length - 1] || '';
  }
  
  let result = '';
  let i = 0;
  
  while (i < code.length) {
    // Пропускаем пробелы
    if (/\s/.test(code[i])) {
      result += code[i];
      i++;
      continue;
    }
    
    // Строки в кавычках
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      let str = quote;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < code.length) { 
          str += code[i]; 
          i++; 
          str += code[i]; 
          i++; 
        } else {
          str += code[i]; 
          i++;
        }
      }
      if (i < code.length) {
        str += quote; 
        i++;
      }
      result += `<span class="ls">${str}</span>`;
      continue;
    }
    
    // Числа
    if (/\d/.test(code[i]) && (i === 0 || !/\w/.test(code[i-1]))) {
      let num = '';
      while (i < code.length && /[\d.]/.test(code[i])) { 
        num += code[i]; 
        i++; 
      }
      result += `<span class="ln">${num}</span>`;
      continue;
    }
    
    // Идентификаторы и ключевые слова
    if (/[a-zA-Z_]/.test(code[i])) {
      let word = '';
      while (i < code.length && /\w/.test(code[i])) { 
        word += code[i]; 
        i++; 
      }
      
      // Определяем класс — порядок проверки важен
      if (LUA_KEYWORDS.has(word)) {
        result += `<span class="lk">${word}</span>`;
      } else if (DL_LIFECYCLE.has(word)) {
        // on_open, on_close — выделяем особо, это точки входа движка
        result += `<span class="ll">${word}</span>`;
      } else if (DL_GLOBALS.has(word)) {
        // player, screen, widget, storage, timer, log
        result += `<span class="la">${word}</span>`;
      } else if (DL_METHODS.has(word)) {
        // Проверяем контекст: метод должен идти после точки
        const prev = lastRealChar(result);
        if (prev === '.') {
          result += `<span class="lm">${word}</span>`;
        } else {
          result += word; // не после точки — обычный идентификатор
        }
      } else if (LUA_BUILTINS.has(word)) {
        result += `<span class="lf">${word}</span>`;
      } else {
        result += word; // обычный идентификатор
      }
      continue;
    }
    
    // Точка (методы объектов) и другие операторы
    if (code[i] === '.') {
      result += `<span class="lp">.</span>`;
      i++;
      continue;
    }
    
    // Двоеточие (методы объектов)
    if (code[i] === ':') {
      result += `<span class="lp">:</span>`;
      i++;
      continue;
    }
    
    // Операторы и пунктуация
    if ('{}()[],:'.includes(code[i])) {
      result += `<span class="lp">${code[i]}</span>`;
      i++;
      continue;
    }
    
    // Операторы сравнения и арифметические (==, ~=, <=, >=, +, -, *, /, %)
    if (code[i] === '=' && i + 1 < code.length && code[i + 1] === '=') {
      result += `<span class="lp">==</span>`;
      i += 2;
      continue;
    }
    
    if (code[i] === '~' && i + 1 < code.length && code[i + 1] === '=') {
      result += `<span class="lp">~=</span>`;
      i += 2;
      continue;
    }
    
    if (code[i] === '<' && i + 1 < code.length && code[i + 1] === '=') {
      result += `<span class="lp"><=</span>`;
      i += 2;
      continue;
    }
    
    if (code[i] === '>' && i + 1 < code.length && code[i + 1] === '=') {
      result += `<span class="lp">>=</span>`;
      i += 2;
      continue;
    }
    
    if ('<>+-*/%'.includes(code[i])) {
      result += `<span class="lp">${code[i]}</span>`;
      i++;
      continue;
    }
    
    // Присваивание = (но не ==)
    if (code[i] === '=' && (i + 1 >= code.length || code[i + 1] !== '=')) {
      result += `<span class="lp">=</span>`;
      i++;
      continue;
    }
    
    // Всё остальное
    result += code[i];
    i++;
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// 3. EDITOR MANAGEMENT (TABS, SCROLL, EVENTS)
// ═══════════════════════════════════════════════════════════════

// Инициализация универсального редактора с вкладками
function initYamlEditor() {
  console.log('Initializing Universal Code Editor...');
  const yamlContainer = document.querySelector('.yaml-container .ybody');
  if (!yamlContainer) {
    console.error('Code editor container not found!');
    return;
  }
  
  // Создаем контейнер для редактора с вкладками
  yamlContainer.innerHTML = `
    <div class="editor-tabs">
      <button class="editor-tab active" data-tab="yaml">YAML</button>
      <button class="editor-tab" data-tab="lua">Lua</button>
    </div>
    <div class="yaml-editor-container">
      <textarea id="yamlEditor" class="yaml-textarea" spellcheck="false"></textarea>
      <div id="yamlHighlight" class="yaml-highlight"></div>
    </div>
  `;
  
  setupEditor();
  setupTabs();
  console.log('Universal Code Editor initialized successfully');
}

// Настройка вкладок
function setupTabs() {
  const tabs = document.querySelectorAll('.editor-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.dataset.tab;
      switchTab(tabType);
    });
  });
}

// Переключение вкладок
function switchTab(tabType) {
  if (currentTab === tabType) return;
  
  // Сохраняем содержимое текущей вкладки
  if (codeEditor) {
    tabContents[currentTab] = codeEditor.value;
  }
  
  currentTab = tabType;
  
  // Обновляем активную вкладку
  document.querySelectorAll('.editor-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabType);
  });
  
  // Обновляем заголовок
  const editorTitle = document.getElementById('editorTitle');
  if (editorTitle) {
    editorTitle.textContent = tabType === 'yaml' ? 'YAML Editor' : 'Lua Editor';
  }
  
  // Обновляем содержимое редактора
  if (tabType === 'yaml') {
    if (codeEditor) codeEditor.readOnly = false; // YAML можно редактировать
    updateYamlContent();
  } else if (tabType === 'lua') {
    if (codeEditor) codeEditor.readOnly = false; // Lua тоже можно редактировать
    updateLuaContent();
  }
  
  // Обновляем подсветку
  if (window.updateHighlight) window.updateHighlight();
  
  // Уведомляем автодополнение о смене вкладки
  if (window.ScreenGenerator && window.ScreenGenerator.onTabSwitch) {
    window.ScreenGenerator.onTabSwitch(tabType);
  }
}
function setupEditor() {
  codeEditor = document.getElementById('yamlEditor');
  const yamlHighlight = document.getElementById('yamlHighlight');
  
  if (!codeEditor || !yamlHighlight) return;
  
  // Синхронизация скролла и размеров
  function syncScroll() {
    const yamlHighlight = document.getElementById('yamlHighlight');
    if (yamlHighlight && codeEditor) {
      yamlHighlight.scrollTop = codeEditor.scrollTop;
      yamlHighlight.scrollLeft = codeEditor.scrollLeft;
    }
  }
  
  function syncSize() {
    const yamlHighlight = document.getElementById('yamlHighlight');
    if (!yamlHighlight || !codeEditor) return;
    
    // Принудительно синхронизируем размеры
    yamlHighlight.style.width = codeEditor.clientWidth + 'px';
    yamlHighlight.style.height = codeEditor.clientHeight + 'px';
    yamlHighlight.style.padding = getComputedStyle(codeEditor).padding;
    yamlHighlight.style.border = getComputedStyle(codeEditor).border;
    yamlHighlight.style.fontSize = getComputedStyle(codeEditor).fontSize;
    yamlHighlight.style.fontFamily = getComputedStyle(codeEditor).fontFamily;
    yamlHighlight.style.lineHeight = getComputedStyle(codeEditor).lineHeight;
    
    // Синхронизируем скролл после изменения размеров
    if (window.syncScroll) window.syncScroll();
  }
  
  // Мгновенная подсветка без debounce
  function updateHighlightNow() {
    const yamlHighlight = document.getElementById('yamlHighlight');
    if (!yamlHighlight || !codeEditor) return;
    
    const text = codeEditor.value;
    if (currentTab === 'yaml') {
      yamlHighlight.innerHTML = highlightYaml(text);
    } else if (currentTab === 'lua') {
      yamlHighlight.innerHTML = highlightLua(text);
    }
    
    // Мгновенная синхронизация скролла
    if (window.syncScroll) window.syncScroll();
  }
  
  // Обновление подсветки с debounce (для обратной совместимости)
  function updateHighlight() {
    updateHighlightNow();
  }
  
  // Функция валидации и применения YAML (только для YAML вкладки)
  function validateAndApplyYaml() {
    if (isUpdatingFromCanvas || currentTab !== 'yaml') return;
    
    const currentYaml = codeEditor.value;
    
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
        updateHighlightWithStatus(true);
        return true;
      }
    } catch (error) {
      console.log('YAML invalid, keeping last valid state:', error.message);
      // YAML невалидный - используем последнее валидное состояние
      if (lastValidState) {
        isUpdatingFromCanvas = true;
        window.ScreenGenerator.widgets = JSON.parse(JSON.stringify(lastValidState.widgets));
        window.ScreenGenerator.background = lastValidState.background ? JSON.parse(JSON.stringify(lastValidState.background)) : null;
        
        // Обновляем canvas без изменения редактора
        if (window.ScreenGenerator.render) window.ScreenGenerator.render();
        if (window.ScreenGenerator.updateProps) window.ScreenGenerator.updateProps();
        if (window.ScreenGenerator.updateWidgetList) window.ScreenGenerator.updateWidgetList();
        
        isUpdatingFromCanvas = false;
      }
      
      // Обновляем подсветку с красным индикатором
      updateHighlightWithStatus(false);
      return false;
    }
  }
  
  // Обновленная функция подсветки с индикатором валидности
  function updateHighlightWithStatus(isValid = null) {
    const text = codeEditor.value;
    const yamlHighlight = document.getElementById('yamlHighlight');
    if (yamlHighlight && codeEditor) {
      // Выбираем функцию подсветки в зависимости от текущей вкладки
      if (currentTab === 'yaml') {
        yamlHighlight.innerHTML = highlightYaml(text);
      } else if (currentTab === 'lua') {
        yamlHighlight.innerHTML = highlightLua(text);
      }
    }
    
    // Мгновенная синхронизация
    if (window.syncScroll) window.syncScroll();
  }
  
  // Делаем функции доступными глобально
  window.syncScroll = syncScroll;
  window.syncSize = syncSize;
  window.updateHighlight = updateHighlight;
  window.updateHighlightNow = updateHighlightNow; // Для автодополнения
  window.ScreenGenerator._editorSyncScroll = syncScroll;
  window.ScreenGenerator._editorUpdateHighlight = updateHighlight;
  
  // Обработчики событий
  codeEditor.addEventListener('input', () => {
    // Сохраняем содержимое текущей вкладки
    tabContents[currentTab] = codeEditor.value;
    
    // Подсветка — МГНОВЕННО, без setTimeout
    updateHighlightNow();
    
    if (currentTab === 'yaml') {
      isUserEditing = true;
      
      // Применение к canvas — с увеличенным debounce для стабильности
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        validateAndApplyYaml();
      }, 300); // Увеличено до 300ms для лучшей производительности
    } else if (currentTab === 'lua') {
      // Для Lua сохраняем в историю изменения
      clearTimeout(window.ScreenGenerator._luaChangeTimeout);
      window.ScreenGenerator._luaChangeTimeout = setTimeout(() => {
        if (window.ScreenGenerator && typeof window.ScreenGenerator.saveState === 'function') {
          window.ScreenGenerator.saveState('Lua edit');
        }
      }, 2000);
    }
  });
  
  codeEditor.addEventListener('focus', () => {
    if (currentTab === 'yaml') {
      isUserEditing = true;
      // Сохраняем текущее валидное состояние при начале редактирования
      if (!lastValidYaml) {
        lastValidYaml = codeEditor.value;
        lastValidState = {
          widgets: JSON.parse(JSON.stringify(window.ScreenGenerator.widgets)),
          background: window.ScreenGenerator.background ? JSON.parse(JSON.stringify(window.ScreenGenerator.background)) : null
        };
      }
    }
    setTimeout(() => {
      if (window.syncSize) window.syncSize();
    }, 10);
  });
  
  codeEditor.addEventListener('blur', () => {
    if (currentTab === 'yaml') {
      isUserEditing = false;
      // Финальная валидация при потере фокуса
      validateAndApplyYaml();
    }
  });
  
  codeEditor.addEventListener('scroll', () => {
    if (window.syncScroll) window.syncScroll();
  }, { passive: true }); // Passive для лучшей производительности
  
  codeEditor.addEventListener('keydown', handleKeyDown);
  
  // Обработчик изменения размера с дополнительной синхронизацией
  const resizeObserver = new ResizeObserver(() => {
    if (window.syncSize) window.syncSize();
    // Дополнительная синхронизация через небольшую задержку
    setTimeout(() => {
      if (window.syncSize) window.syncSize();
      if (window.syncScroll) window.syncScroll();
    }, 50);
  });
  resizeObserver.observe(codeEditor);
  
  // Дополнительные обработчики для лучшей синхронизации
  codeEditor.addEventListener('mousewheel', () => {
    if (window.syncScroll) window.syncScroll();
  }, { passive: true });
  codeEditor.addEventListener('wheel', () => {
    if (window.syncScroll) window.syncScroll();
  }, { passive: true });
  codeEditor.addEventListener('touchmove', () => {
    if (window.syncScroll) window.syncScroll();
  }, { passive: true });
  
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
      const start = codeEditor.selectionStart;
      const end = codeEditor.selectionEnd;
      const value = codeEditor.value;
      
      if (e.shiftKey) {
        // Shift+Tab - убрать отступ
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = value.indexOf('\n', start);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
        const lineText = value.substring(lineStart, actualLineEnd);
        
        if (lineText.startsWith('  ')) {
          const newLineText = lineText.substring(2);
          codeEditor.value = value.substring(0, lineStart) + newLineText + value.substring(actualLineEnd);
          codeEditor.selectionStart = codeEditor.selectionEnd = Math.max(lineStart, start - 2);
        }
      } else {
        // Tab - добавить отступ
        codeEditor.value = value.substring(0, start) + '  ' + value.substring(end);
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 2;
      }
      if (window.updateHighlight) window.updateHighlight();
    }
  }
  
  // Инициализация с текущим содержимым (отложенная)
  setTimeout(() => {
    updateYamlContent();
  }, 100);
  
  // Устанавливаем фокус на редактор
  setTimeout(() => {
    if (codeEditor) codeEditor.focus();
  }, 200);
}

// Обновление YAML содержимого из canvas
function updateYamlContent() {
  if (!codeEditor || isUpdatingFromCanvas) return;
  
  // НЕ обновляем если пользователь активно редактирует
  if (isUserEditing || document.activeElement === codeEditor) {
    return;
  }
  
  // Проверяем, доступна ли функция plainYaml
  if (!window.ScreenGenerator.plainYaml) {
    console.log('plainYaml function not available yet, skipping update');
    return;
  }
  
  isUpdatingFromCanvas = true;
  
  // Сохраняем позицию курсора
  const cursorPos = codeEditor.selectionStart;
  const scrollTop = codeEditor.scrollTop;
  
  const plainYamlText = window.ScreenGenerator.plainYaml();
  codeEditor.value = plainYamlText;
  tabContents.yaml = plainYamlText;
  
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
    if (codeEditor) {
      codeEditor.selectionStart = codeEditor.selectionEnd = Math.min(cursorPos, codeEditor.value.length);
      codeEditor.scrollTop = scrollTop;
      
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight) {
        yamlHighlight.scrollTop = scrollTop;
        yamlHighlight.scrollLeft = codeEditor.scrollLeft;
        
        // Дополнительная синхронизация через RAF
        requestAnimationFrame(() => {
          if (window.syncScroll) window.syncScroll();
        });
      }
      
      isUpdatingFromCanvas = false;
      isUserEditing = false; // Сбрасываем флаг редактирования при программном обновлении
    }
  }, 10);
}

// Обновление Lua содержимого из canvas
function updateLuaContent() {
  if (!codeEditor || isUpdatingFromCanvas) return;
  
  // Проверяем, доступна ли функция generateLua
  if (!window.ScreenGenerator.generateLua) {
    console.log('generateLua function not available yet, skipping update');
    return;
  }
  
  isUpdatingFromCanvas = true;
  
  // Сохраняем позицию скролла
  const scrollTop = codeEditor.scrollTop;
  
  // ВСЕГДА регенерируем Lua код из текущего состояния canvas
  const luaCode = window.ScreenGenerator.generateLua();
  tabContents.lua = luaCode; // Обновляем кэш
  
  codeEditor.value = luaCode;
  
  // Обновляем подсветку
  const yamlHighlight = document.getElementById('yamlHighlight');
  if (yamlHighlight) {
    yamlHighlight.innerHTML = highlightLua(luaCode);
  }
  
  // Восстанавливаем скролл
  setTimeout(() => {
    if (codeEditor) {
      codeEditor.scrollTop = scrollTop;
      
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight) {
        yamlHighlight.scrollTop = scrollTop;
        yamlHighlight.scrollLeft = codeEditor.scrollLeft;
        
        // Дополнительная синхронизация через RAF
        requestAnimationFrame(() => {
          if (window.syncScroll) window.syncScroll();
        });
      }
      
      isUpdatingFromCanvas = false;
    }
  }, 10);
}

// Универсальная функция обновления редактора
function updateEditor() {
  if (currentTab === 'yaml') {
    updateYamlContent();
  } else if (currentTab === 'lua') {
    updateLuaContent();
  }
}

// Функция для синхронизации Lua кода с canvas (генерация нового кода)
function syncLuaWithCanvas() {
  if (currentTab === 'lua' && window.ScreenGenerator.generateLua) {
    const newLuaCode = window.ScreenGenerator.generateLua();
    tabContents.lua = newLuaCode;
    
    if (codeEditor && !isUpdatingFromCanvas) {
      isUpdatingFromCanvas = true;
      const scrollTop = codeEditor.scrollTop;
      
      codeEditor.value = newLuaCode;
      
      // Обновляем подсветку
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight) {
        yamlHighlight.innerHTML = highlightLua(newLuaCode);
      }
      
      setTimeout(() => {
        if (codeEditor) {
          codeEditor.scrollTop = scrollTop;
          const yamlHighlight = document.getElementById('yamlHighlight');
          if (yamlHighlight) {
            yamlHighlight.scrollTop = scrollTop;
          }
        }
        isUpdatingFromCanvas = false;
      }, 10);
    }
  }
}

// Обновление выделения в редакторе
function updateYamlSelection() {
  if (!codeEditor) return;
  
  // Обновляем подсветку с учетом нового выбранного элемента
  const yamlHighlight = document.getElementById('yamlHighlight');
  if (yamlHighlight && codeEditor) {
    const text = codeEditor.value;
    if (currentTab === 'yaml') {
      yamlHighlight.innerHTML = highlightYaml(text);
    } else if (currentTab === 'lua') {
      yamlHighlight.innerHTML = highlightLua(text);
    }
    
    // Принудительная синхронизация после обновления
    requestAnimationFrame(() => {
      const yamlHighlight = document.getElementById('yamlHighlight');
      if (yamlHighlight && codeEditor) {
        yamlHighlight.scrollTop = codeEditor.scrollTop;
        yamlHighlight.scrollLeft = codeEditor.scrollLeft;
      }
    });
  }
}

// Функция для сброса состояния редактирования (вызывается при программных изменениях canvas)
function resetEditingState() {
  isUserEditing = false;
  lastValidYaml = '';
  lastValidState = null;
  
  // Синхронизируем Lua код с canvas при изменениях
  syncLuaWithCanvas();
}

// Получение текущего содержимого активной вкладки
function getCurrentTabContent() {
  if (currentTab === 'yaml') {
    return tabContents.yaml || (window.ScreenGenerator.plainYaml ? window.ScreenGenerator.plainYaml() : '');
  } else if (currentTab === 'lua') {
    return tabContents.lua || (window.ScreenGenerator.generateLua ? window.ScreenGenerator.generateLua() : '');
  }
  return '';
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initYamlEditor,
  updateYamlEditor: updateEditor, // Используем универсальную функцию
  updateYamlSelection,
  highlightYaml,
  highlightLua, // Экспортируем новую функцию подсветки Lua
  resetEditingState,
  switchTab,
  syncLuaWithCanvas,
  getCurrentTabContent,
  get currentTab() { return currentTab; },
  get tabContents() { return tabContents; }
});
/*
ТЕСТ ПОДСВЕТКИ LUA:

-- комментарий зелёный
function on_close()          -- on_close фиолетовый курсив, function синий
    local visits = 42        -- local синий, visits без цвета, 42 светло-зелёный
    player.health(20)        -- player бирюзовый, health золотистый
    screen.widget("btn")     -- screen бирюзовый, widget золотистый, "btn" оранжевый
    storage.set("k", 42)     -- storage бирюзовый, set золотистый, 42 светло-зелёный
    timer.after(20, function()  -- timer бирюзовый, after золотистый
        log.info("done")     -- log бирюзовый, info золотистый
    end)
end

local DisplayLib = require("DisplayLib")  -- require зелёный
local screen = DisplayLib.newScreen("test")  -- newScreen зелёный
*/