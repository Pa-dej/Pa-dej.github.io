// ═══════════════════════════════════════════════════════════════
// YAML GENERATION AND EXPORT
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// YAML — точное соответствие формату плагина
// ═══════════════════════════════════════════════════════════════
function fn(n){
  if(n===undefined||n===null) return '0.0';
  const r=parseFloat(n.toFixed(4));
  return r%1===0?r.toFixed(1):r.toString();
}

function updateYaml(){
  // Обновляем редактор YAML
  if (window.ScreenGenerator.updateYamlEditor) {
    window.ScreenGenerator.updateYamlEditor();
  }
}

function plainYaml(){
  const { widgets, background, hexRgb } = window.ScreenGenerator;
  
  const sid=document.getElementById('screenId').value||'my_screen';
  const screenType = document.getElementById('screenType')?.value || 'PRIVATE';
  const interactionRadius = parseFloat(document.getElementById('interactionRadius')?.value || '3.0');
  const rangeCheckInterval = parseInt(document.getElementById('rangeCheckInterval')?.value || '10');
  const closeDistance = parseFloat(document.getElementById('closeDistance')?.value || '20.0');
  const tickRate = parseInt(document.getElementById('tickRate')?.value || '4');
  
  const L=[];
  L.push(`id: ${sid}`);
  L.push(`screen_type: ${screenType}`);
  L.push(`interaction_radius: ${interactionRadius.toFixed(1)}`);
  L.push(`range_check_interval: ${rangeCheckInterval}`);
  
  // close_distance только для PRIVATE экранов
  if (screenType === 'PRIVATE') {
    L.push(`close_distance: ${closeDistance.toFixed(1)}`);
  }
  
  L.push(`tick_rate: ${tickRate}`);
  
  // Проверяем нужна ли секция scripts
  const needsScript = widgets.some(w => w.onClick === 'RUN_SCRIPT');
  if (needsScript) {
    L.push(`scripts:`);
    L.push(`  file: "${sid}.lua"`);
  }
  
  if(background){
    const {r,g,b}=hexRgb(background.colorHex);
    L.push(`background:`);
    L.push(`  color: [${r}, ${g}, ${b}]`);
    L.push(`  alpha: ${background.alpha}`);
    L.push(`  scale: [${fn(background.w*8)}, ${fn(background.h*4)}, 1]`);
    // Всегда показываем position, даже если 0
    L.push(`  position: [${fn(background.posX)}, ${fn(background.posY)}, 0]`);
    // Всегда показываем translation, даже если 0
    L.push(`  translation: [${fn(background.transX)}, ${fn(background.transY)}, ${fn(background.transZ||0)}]`);
    L.push(`  locked: ${background.locked ? 'true' : 'false'}`);
    L.push(`  text: " "`);
  }
  
  if(widgets.length>0){
    L.push(`widgets:`);
    for(const w of widgets){
      const isText=w.type==='TEXT_BUTTON';
      L.push(`  - id: ${w.id}`);
      L.push(`    type: ${w.type}`);
      if(!isText&&w.material) L.push(`    material: ${w.material}`);
      if(isText){
        // Обрабатываем текст - может быть обычный или JSON массив
        const textContent = w.text || '';
        
        if (textContent.trim().startsWith('[')) {
          // Это JSON массив цветного текста - экспортируем как есть
          L.push(`    text: ${textContent}`);
        } else {
          // Обычный текст - заменяем реальные переносы строк на \n для YAML
          const escapedText = textContent.replace(/\n/g, '\\n');
          L.push(`    text: "${escapedText}"`);
        }
        
        // Добавляем alignment если он не CENTERED (дефолтный)
        if(w.alignment && w.alignment !== 'CENTERED') {
          L.push(`    alignment: ${w.alignment}`);
        }
        
        // hoveredText только для PRIVATE экранов
        if(screenType === 'PRIVATE' && w.hoveredText) {
          const hoverContent = w.hoveredText;
          if (hoverContent.trim().startsWith('[')) {
            // JSON массив для hoveredText
            L.push(`    hoveredText: ${hoverContent}`);
          } else {
            // Обычный текст
            const escapedHover = hoverContent.replace(/\n/g, '\\n');
            L.push(`    hoveredText: "${escapedHover}"`);
          }
        }
        
        L.push(`    scale: [${fn(w.w*8)}, ${fn(w.h*4)}, 1]`);
      } else {
        L.push(`    scale: [${fn(w.w)}, ${fn(w.h)}, 0.01]`);
      }
      L.push(`    position: [${fn(w.x)}, ${fn(w.y)}, 0]`);
      // Всегда показываем translation, даже если все компоненты равны 0
      L.push(`    translation: [${fn(w.transX||0)}, ${fn(w.transY||0)}, ${fn(w.transZ||0)}]`);
      
      // Добавляем backgroundColor и backgroundAlpha если они есть
      if(w.backgroundColor) {
        L.push(`    backgroundColor: [${w.backgroundColor[0]}, ${w.backgroundColor[1]}, ${w.backgroundColor[2]}]`);
      }
      // Всегда показываем backgroundAlpha если он определен, даже если 0
      if(w.backgroundAlpha !== undefined) {
        L.push(`    backgroundAlpha: ${w.backgroundAlpha}`);
      }
      
      // Добавляем hoveredBackgroundColor и hoveredBackgroundAlpha только для PRIVATE экранов
      if(screenType === 'PRIVATE') {
        if(w.hoveredBackgroundColor) {
          L.push(`    hoveredBackgroundColor: [${w.hoveredBackgroundColor[0]}, ${w.hoveredBackgroundColor[1]}, ${w.hoveredBackgroundColor[2]}]`);
        }
        if(w.hoveredBackgroundAlpha !== undefined) {
          L.push(`    hoveredBackgroundAlpha: ${w.hoveredBackgroundAlpha}`);
        }
      }
      
      // Добавляем tooltip поля если они есть
      if(w.tooltip) {
        const tooltipContent = w.tooltip;
        if (tooltipContent.trim().startsWith('[')) {
          // JSON массив для tooltip
          L.push(`    tooltip: ${tooltipContent}`);
        } else {
          // Обычный текст
          const escapedTooltip = tooltipContent.replace(/\n/g, '\\n');
          L.push(`    tooltip: "${escapedTooltip}"`);
        }
      }
      if(w.tooltipColor) {
        L.push(`    tooltipColor: [${w.tooltipColor[0]}, ${w.tooltipColor[1]}, ${w.tooltipColor[2]}]`);
      }
      if(w.tooltipDelay !== undefined) {
        L.push(`    tooltipDelay: ${w.tooltipDelay}`);
      }
      
      L.push(`    tolerance: [${w.tolerance[0]}, ${w.tolerance[1]}]`);
      L.push(`    onClick:`);
      L.push(`      action: ${w.onClick}`);
      
      // Добавляем дополнительные поля в зависимости от типа действия
      if (w.onClick === 'RUN_SCRIPT') {
        const funcName = w.clickFunction || `${w.id}_click`;
        L.push(`      function: "${funcName}"`);
      } else if (w.onClick === 'SWITCH_SCREEN') {
        const target = w.switchTarget || 'target_screen_id';
        L.push(`      target: ${target}`);
      }
    }
  }
  return L.join('\n');
}

function doCopy(){
  // Копируем содержимое активной вкладки
  let textToCopy;
  if (window.ScreenGenerator.getCurrentTabContent) {
    textToCopy = window.ScreenGenerator.getCurrentTabContent();
  } else {
    // Fallback для совместимости
    if (window.ScreenGenerator.currentTab === 'lua') {
      textToCopy = window.ScreenGenerator.generateLua();
    } else {
      textToCopy = plainYaml();
    }
  }
  
  navigator.clipboard.writeText(textToCopy).then(()=>{
    ['btnCopy','btnCopy2'].forEach(id=>{
      const b=document.getElementById(id);const o=b.textContent;
      b.textContent='✓ Скопировано!';setTimeout(()=>b.textContent=o,1600);
    });
  });
}

// Функция для обновления видимости кнопки сброса Lua
function updateResetLuaButton() {
  const btnResetLua = document.getElementById('btnResetLua');
  if (btnResetLua) {
    btnResetLua.style.display = (currentTab === 'lua' && luaManuallyEdited) ? 'block' : 'none';
  }
}

// Инициализация обработчиков YAML
function initYamlHandlers() {
  const btnCopy = document.getElementById('btnCopy');
  const btnCopy2 = document.getElementById('btnCopy2');
  const btnResetLua = document.getElementById('btnResetLua');
  const screenId = document.getElementById('screenId');
  
  if (btnCopy) btnCopy.addEventListener('click', doCopy);
  if (btnCopy2) btnCopy2.addEventListener('click', doCopy);
  if (screenId) screenId.addEventListener('input', updateYaml);
  
  // Обработчик кнопки сброса Lua
  if (btnResetLua) {
    btnResetLua.addEventListener('click', () => {
      if (confirm('Сбросить Lua код к автоматически сгенерированному шаблону? Все ваши изменения будут потеряны.')) {
        // Сбрасываем флаги
        luaManuallyEdited = false;
        lastGeneratedLua = '';
        
        // Принудительно регенерируем код
        if (window.ScreenGenerator.generateLua) {
          const newLuaCode = window.ScreenGenerator.generateLua();
          tabContents.lua = newLuaCode;
          lastGeneratedLua = newLuaCode;
          
          // Если сейчас активна Lua вкладка, обновляем редактор
          if (currentTab === 'lua' && codeEditor) {
            codeEditor.value = newLuaCode;
            
            // Обновляем подсветку
            const yamlHighlight = document.getElementById('yamlHighlight');
            if (yamlHighlight) {
              yamlHighlight.innerHTML = highlightLua(newLuaCode);
            }
          }
          
          // Скрываем кнопку сброса
          btnResetLua.style.display = 'none';
          
          console.log('Lua code reset to template');
        }
      }
    });
  }
}
}

// Инициализация обработчиков настроек экрана
function initScreenSettingsHandlers() {
  const screenType = document.getElementById('screenType');
  const interactionRadius = document.getElementById('interactionRadius');
  const rangeCheckInterval = document.getElementById('rangeCheckInterval');
  const rangeCheckIntervalValue = document.getElementById('rangeCheckIntervalValue');
  const closeDistance = document.getElementById('closeDistance');
  const tickRate = document.getElementById('tickRate');
  const tickRateValue = document.getElementById('tickRateValue');
  const closeDistanceGroup = document.getElementById('closeDistanceGroup');
  
  // Функция расчета оптимизации
  function calculateOptimization() {
    const isPrivate = screenType?.value === 'PRIVATE';
    const radius = parseFloat(interactionRadius?.value || '3.0');
    const checkInterval = parseInt(rangeCheckInterval?.value || '10');
    const rate = parseInt(tickRate?.value || '4');
    const widgetCount = window.ScreenGenerator?.widgets?.length || 0;
    
    let score = 100;
    
    // Тип экрана (PUBLIC хуже чем PRIVATE, но не критично)
    if (!isPrivate) {
      score -= 15; // Уменьшили с 20 до 15
    }
    
    // Радиус взаимодействия (более мягкий штраф)
    score -= Math.max(0, (radius - 3.0) * 3); // Уменьшили с 5 до 3
    
    // Частота проверки (более мягкий штраф)
    score -= Math.max(0, (20 - checkInterval) * 1); // Уменьшили с 2 до 1
    
    // Tick rate (более мягкий штраф)
    score -= Math.max(0, (20 - rate) * 1.5); // Уменьшили с 3 до 1.5
    
    // Количество виджетов (более мягкий штраф)
    score -= widgetCount * 1; // Уменьшили с 2 до 1
    
    // Ограничиваем от 0 до 100
    score = Math.max(0, Math.min(100, score));
    
    // Обновляем UI
    const scoreElement = document.getElementById('optimizationScore');
    const barElement = document.getElementById('optimizationBar');
    const hintElement = document.getElementById('optimizationHint');
    
    if (scoreElement) scoreElement.textContent = `${Math.round(score)}%`;
    
    // Обновляем полосу - теперь она показывает сколько скрыть справа
    if (barElement) barElement.style.width = `${100 - score}%`;
    
    if (hintElement) {
      if (score >= 85) {
        hintElement.textContent = 'Отличная оптимизация';
        hintElement.style.color = 'oklch(0.8 0.15 142)'; // Более насыщенный зеленый
      } else if (score >= 70) {
        hintElement.textContent = 'Хорошая оптимизация';
        hintElement.style.color = 'oklch(0.8 0.12 64)'; // Желтый
      } else if (score >= 50) {
        hintElement.textContent = 'Средняя оптимизация';
        hintElement.style.color = 'var(--accent)';
      } else {
        hintElement.textContent = 'Низкая оптимизация';
        hintElement.style.color = 'oklch(0.7 0.15 29)'; // Красный
      }
    }
  }
  
  // Обработчик изменения типа экрана
  if (screenType) {
    screenType.addEventListener('change', (e) => {
      const isPrivate = e.target.value === 'PRIVATE';
      
      // Показываем/скрываем поле close_distance для PUBLIC экранов
      if (closeDistanceGroup) {
        closeDistanceGroup.style.display = isPrivate ? 'block' : 'none';
      }
      
      // Устанавливаем дефолтные значения в зависимости от типа
      if (interactionRadius) {
        interactionRadius.value = isPrivate ? '3.0' : '6.0';
      }
      
      // Пересчитываем оптимизацию
      calculateOptimization();
      
      // Обновляем YAML
      updateYaml();
      
      // Обновляем свойства виджетов (скрываем hover поля для PUBLIC)
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') {
        window.ScreenGenerator.updateProps();
      }
    });
  }
  
  // Обработчики для слайдеров с обновлением значений
  if (rangeCheckInterval && rangeCheckIntervalValue) {
    rangeCheckInterval.addEventListener('input', (e) => {
      rangeCheckIntervalValue.textContent = e.target.value;
      calculateOptimization();
      updateYaml();
    });
  }
  
  if (tickRate && tickRateValue) {
    tickRate.addEventListener('input', (e) => {
      tickRateValue.textContent = e.target.value;
      calculateOptimization();
      updateYaml();
    });
  }
  
  // Обработчики для остальных полей
  [interactionRadius, closeDistance].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        calculateOptimization();
        updateYaml();
      });
    }
  });
  
  // Инициализируем начальное состояние
  if (screenType && closeDistanceGroup) {
    const isPrivate = screenType.value === 'PRIVATE';
    closeDistanceGroup.style.display = isPrivate ? 'block' : 'none';
  }
  
  // Инициализируем значения слайдеров
  if (rangeCheckInterval && rangeCheckIntervalValue) {
    rangeCheckIntervalValue.textContent = rangeCheckInterval.value;
  }
  if (tickRate && tickRateValue) {
    tickRateValue.textContent = tickRate.value;
  }
  
  // Первоначальный расчет оптимизации
  calculateOptimization();
  
  // Экспортируем функцию для использования в других местах
  window.ScreenGenerator.calculateOptimization = calculateOptimization;
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  fn,
  updateYaml,
  plainYaml,
  doCopy,
  initYamlHandlers,
  initScreenSettingsHandlers,
  updateResetLuaButton
});