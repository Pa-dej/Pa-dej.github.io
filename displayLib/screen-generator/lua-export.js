// ═══════════════════════════════════════════════════════════════
// LUA EXPORT - Generate Lua script templates for YAML screens
// ═══════════════════════════════════════════════════════════════

// Генерация Lua скрипта-шаблона для YAML экрана
function generateLua() {
  const { widgets, background } = window.ScreenGenerator;
  const screenId = document.getElementById('screenId').value || 'my_screen';
  
  const lines = [];
  
  // Заголовок
  lines.push(`-- Lua script for screen: ${screenId}`);
  lines.push(`-- Place this file at: plugins/DisplayLib/scripts/${screenId}.lua`);
  lines.push('');
  
  // Собираем виджеты с RUN_SCRIPT
  const scriptWidgets = widgets.filter(w => w.onClick === 'RUN_SCRIPT' && (w.clickFunction || w.id));
  
  // Определяем нужен ли вообще скрипт
  const needsScript = scriptWidgets.length > 0;
  
  // on_open — всегда
  lines.push('function on_open()');
  lines.push(`    log.info("${screenId} opened for " .. player.name())`);
  if (!needsScript) {
    lines.push('    -- Нет виджетов с RUN_SCRIPT — скрипт не обязателен');
  }
  lines.push('end');
  lines.push('');
  
  // on_close — всегда
  lines.push('function on_close()');
  lines.push(`    log.info("${screenId} closed")`);
  lines.push('end');
  lines.push('');
  
  // Функции для каждого RUN_SCRIPT виджета
  if (scriptWidgets.length > 0) {
    lines.push('-- ═══════════════════════════════════════');
    lines.push('-- Widget click handlers');
    lines.push('-- ═══════════════════════════════════════');
    lines.push('');
    
    for (const w of scriptWidgets) {
      const funcName = w.clickFunction || `${w.id}_click`; // дефолтное имя функции
      const widgetId = w.id;
      const widgetType = w.type;
      
      lines.push(`-- Widget: ${widgetId} (${widgetType})`);
      lines.push(`function ${funcName}()`);
      
      // Минимальное тело в зависимости от типа виджета
      if (widgetType === 'TEXT_BUTTON') {
        lines.push(`    local btn = screen.widget("${widgetId}")`);
        lines.push(`    if btn then`);
        lines.push(`        -- btn.text("новый текст")`);
        lines.push(`        -- btn.bgColor(r, g, b)`);
        lines.push(`        -- btn.bgAlpha(alpha)`);
        lines.push(`    end`);
      } else if (widgetType === 'ITEM_BUTTON') {
        lines.push(`    -- player.sound("ui.button.click")`);
        lines.push(`    -- player.message("clicked ${widgetId}")`);
      }
      
      lines.push('end');
      lines.push('');
    }
  }
  
  // Предупреждение если скрипт не нужен
  if (!needsScript) {
    lines.push('-- ═══════════════════════════════════════');
    lines.push('-- Нет виджетов с action: RUN_SCRIPT');
    lines.push('-- Этот скрипт не будет подключен к YAML');
    lines.push('-- Добавьте секцию scripts: в YAML если нужно:');
    lines.push('--');
    lines.push('-- scripts:');
    lines.push(`--   file: "${screenId}.lua"`);
    lines.push('-- ═══════════════════════════════════════');
  }
  
  return lines.join('\n');
}

// Подсветка Lua перенесена в code-editor.js

// Экспорт функций (только generateLua, подсветка перенесена в code-editor.js)
Object.assign(window.ScreenGenerator, {
  generateLua
});