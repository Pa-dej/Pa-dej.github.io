// ═══════════════════════════════════════════════════════════════
// HISTORY MANAGEMENT - Undo/Redo System
// ═══════════════════════════════════════════════════════════════

// История изменений
let history = [];
let historyIndex = -1;
let maxHistorySize = 50; // Максимальное количество шагов в истории
let isApplyingHistory = false; // Флаг для предотвращения записи истории при undo/redo

// Сохранение текущего состояния в историю
function saveState(description = 'Change') {
  if (isApplyingHistory) return; // Не сохраняем состояние при undo/redo
  
  const { widgets, background } = window.ScreenGenerator;
  
  // Создаем снимок текущего состояния
  const state = {
    widgets: JSON.parse(JSON.stringify(widgets)),
    background: background ? JSON.parse(JSON.stringify(background)) : null,
    selectedId: window.ScreenGenerator.selectedId,
    nextId: window.ScreenGenerator.nextId,
    description,
    timestamp: Date.now()
  };
  
  // Удаляем все состояния после текущего индекса (если мы не в конце истории)
  if (historyIndex < history.length - 1) {
    history = history.slice(0, historyIndex + 1);
  }
  
  // Добавляем новое состояние
  history.push(state);
  historyIndex = history.length - 1;
  
  // Ограничиваем размер истории
  if (history.length > maxHistorySize) {
    history = history.slice(-maxHistorySize);
    historyIndex = history.length - 1;
  }
  
  console.log(`History saved: ${description} (${historyIndex + 1}/${history.length})`);
  updateHistoryUI();
}

// Отмена последнего действия (Undo)
function undo() {
  if (!canUndo()) return false;
  
  historyIndex--;
  applyHistoryState(history[historyIndex]);
  console.log(`Undo: ${history[historyIndex].description} (${historyIndex + 1}/${history.length})`);
  updateHistoryUI();
  return true;
}

// Повтор отмененного действия (Redo)
function redo() {
  if (!canRedo()) return false;
  
  historyIndex++;
  applyHistoryState(history[historyIndex]);
  console.log(`Redo: ${history[historyIndex].description} (${historyIndex + 1}/${history.length})`);
  updateHistoryUI();
  return true;
}

// Проверка возможности отмены
function canUndo() {
  return historyIndex > 0;
}

// Проверка возможности повтора
function canRedo() {
  return historyIndex < history.length - 1;
}

// Применение состояния из истории
function applyHistoryState(state) {
  isApplyingHistory = true;
  
  try {
    // Восстанавливаем состояние
    window.ScreenGenerator.widgets = JSON.parse(JSON.stringify(state.widgets));
    window.ScreenGenerator.background = state.background ? JSON.parse(JSON.stringify(state.background)) : null;
    window.ScreenGenerator.selectedId = state.selectedId;
    window.ScreenGenerator.nextId = state.nextId;
    
    // Сбрасываем состояние редактирования YAML
    if (window.ScreenGenerator.resetEditingState) {
      window.ScreenGenerator.resetEditingState();
    }
    
    // Обновляем интерфейс
    if (window.ScreenGenerator.render) window.ScreenGenerator.render();
    if (window.ScreenGenerator.updateProps) window.ScreenGenerator.updateProps();
    if (window.ScreenGenerator.updateWidgetList) window.ScreenGenerator.updateWidgetList();
    if (window.ScreenGenerator.updateAddBgButton) window.ScreenGenerator.updateAddBgButton();
    if (window.ScreenGenerator.updateYamlEditor) window.ScreenGenerator.updateYamlEditor();
    
  } finally {
    isApplyingHistory = false;
  }
}

// Обновление UI индикаторов истории
function updateHistoryUI() {
  // Обновляем заголовок с информацией о возможности undo/redo
  const title = document.title;
  const baseTitle = title.replace(/ \(.*\)$/, ''); // Убираем предыдущий индикатор
  
  if (canUndo() || canRedo()) {
    const undoText = canUndo() ? 'Ctrl+Z' : '';
    const redoText = canRedo() ? 'Ctrl+Y' : '';
    const actions = [undoText, redoText].filter(Boolean).join(', ');
    document.title = `${baseTitle} (${actions})`;
  } else {
    document.title = baseTitle;
  }
}

// Инициализация системы истории
function initHistory() {
  // Сохраняем начальное состояние
  setTimeout(() => {
    saveState('Initial state');
  }, 500);
  
  // Глобальные обработчики клавиш
  document.addEventListener('keydown', (e) => {
    // Проверяем, что фокус не в текстовом поле (кроме случаев когда нужно)
    const isInTextInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    
    if (e.ctrlKey && e.code === 'KeyZ' && !e.shiftKey) {
      e.preventDefault();
      undo();
      return;
    }
    
    if (e.ctrlKey && (e.code === 'KeyY' || (e.code === 'KeyZ' && e.shiftKey))) {
      e.preventDefault();
      redo();
      return;
    }
  });
  
  console.log('History system initialized');
}

// Обертки для основных действий с автоматическим сохранением в историю
function withHistory(action, description) {
  return function(...args) {
    const result = action.apply(this, args);
    saveState(description);
    return result;
  };
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  // История
  saveState,
  undo,
  redo,
  canUndo,
  canRedo,
  initHistory,
  withHistory,
  
  // Геттеры для отладки
  get history() { return history; },
  get historyIndex() { return historyIndex; },
  get isApplyingHistory() { return isApplyingHistory; }
});