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
  console.log('updateYaml called');
  const { widgets, background, hexRgb } = window.ScreenGenerator;
  
  // Обновляем редактор YAML
  if (window.ScreenGenerator.updateYamlEditor) {
    console.log('Calling updateYamlEditor');
    window.ScreenGenerator.updateYamlEditor();
  } else {
    console.log('updateYamlEditor not available');
  }
}

function plainYaml(){
  console.log('plainYaml called');
  const { widgets, background, hexRgb } = window.ScreenGenerator;
  
  const sid=document.getElementById('screenId').value||'my_screen';
  const L=[];
  L.push(`id: ${sid}`);
  
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
    L.push(`  text: " "`);
  }
  
  // Проверяем нужна ли секция scripts
  const needsScript = widgets.some(w => w.onClick === 'RUN_SCRIPT');
  if (needsScript) {
    L.push(`scripts:`);
    L.push(`  file: "${sid}.lua"`);
  }
  
  if(widgets.length>0){
    L.push(`widgets:`);
    for(const w of widgets){
      const isText=w.type==='TEXT_BUTTON';
      L.push(`  - id: ${w.id}`);
      L.push(`    type: ${w.type}`);
      if(!isText&&w.material) L.push(`    material: ${w.material}`);
      if(isText){
        // Заменяем реальные переносы строк на \n для YAML
        const escapedText = (w.text || '').replace(/\n/g, '\\n');
        L.push(`    text: "${escapedText}"`);
        if(w.hoveredText) {
          const escapedHover = (w.hoveredText || '').replace(/\n/g, '\\n');
          L.push(`    hoveredText: "${escapedHover}"`);
        }
        L.push(`    scale: [${fn(w.w*8)}, ${fn(w.h*4)}, 1]`);
      } else {
        L.push(`    scale: [${fn(w.w)}, ${fn(w.h)}, ${fn(w.w)}]`);
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

// Инициализация обработчиков YAML
function initYamlHandlers() {
  const btnCopy = document.getElementById('btnCopy');
  const btnCopy2 = document.getElementById('btnCopy2');
  const screenId = document.getElementById('screenId');
  
  if (btnCopy) btnCopy.addEventListener('click', doCopy);
  if (btnCopy2) btnCopy2.addEventListener('click', doCopy);
  if (screenId) screenId.addEventListener('input', updateYaml);
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  fn,
  updateYaml,
  plainYaml,
  doCopy,
  initYamlHandlers
});