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
  const { widgets, background, hexRgb } = window.ScreenGenerator;
  
  const sid=document.getElementById('screenId').value||'my_screen';
  const L=[];
  const k=(s,i=0)=>'  '.repeat(i)+s;
  L.push(k(`<span class="yk">id</span>: <span class="yv">${sid}</span>`));
  if(background){
    const autoX=-(background.w*8)/80;
    const {r,g,b}=hexRgb(background.colorHex);
    L.push(k(`<span class="yk">background</span>:`));
    L.push(k(`<span class="yk">color</span>: [<span class="yn">${r}, ${g}, ${b}</span>]`,1));
    L.push(k(`<span class="yk">alpha</span>: <span class="yn">${background.alpha}</span>`,1));
    L.push(k(`<span class="yk">scale</span>: [<span class="yn">${fn(background.w*8)}, ${fn(background.h*4)}, 1</span>]`,1));
    if(background.posX!==0||background.posY!==0)
      L.push(k(`<span class="yk">position</span>: [<span class="yn">${fn(background.posX)}, ${fn(background.posY)}, 0</span>]`,1));
    L.push(k(`<span class="yk">translation</span>: [<span class="yn">${fn(background.transX)}, ${fn(background.transY)}, 0</span>]`,1));
    L.push(k(`<span class="yc">  <span class="yc"># autoX=${fn(autoX)} → final=[${fn(background.transX+autoX)}, ${fn(background.transY)}, 0]</span></span>`));
    L.push(k(`<span class="yk">text</span>: <span class="yv">" "</span>`,1));
  }
  if(widgets.length>0){
    L.push(k(`<span class="yk">widgets</span>:`));
    for(const w of widgets){
      const isText=w.type==='TEXT_BUTTON';
      L.push(k(`- <span class="yk">id</span>: <span class="yv">${w.id}</span>`,1));
      L.push(k(`<span class="yk">type</span>: <span class="yv">${w.type}</span>`,2));
      if(!isText&&w.material) L.push(k(`<span class="yk">material</span>: <span class="yv">${w.material}</span>`,2));
      if(isText){
        L.push(k(`<span class="yk">text</span>: <span class="yv">"${w.text}"</span>`,2));
        L.push(k(`<span class="yk">scale</span>: [<span class="yn">${fn(w.w*8)}, ${fn(w.h*4)}, 1</span>]`,2));
      } else {
        L.push(k(`<span class="yk">scale</span>: [<span class="yn">${fn(w.w)}, ${fn(w.h)}, ${fn(w.w)}</span>]`,2));
      }
      // position — только если не [0,0,0]
      if(w.x!==0||w.y!==0)
        L.push(k(`<span class="yk">position</span>: [<span class="yn">${fn(w.x)}, ${fn(w.y)}, 0</span>]`,2));
      else
        L.push(k(`<span class="yk">position</span>: [<span class="yn">0.0, 0.0, 0</span>]`,2));
      // translation — только если не [0,0,0]
      if((w.transX||0)!==0||(w.transY||0)!==0)
        L.push(k(`<span class="yk">translation</span>: [<span class="yn">${fn(w.transX||0)}, ${fn(w.transY||0)}, 0</span>]`,2));
      L.push(k(`<span class="yk">tolerance</span>: [<span class="yn">${w.tolerance[0]}, ${w.tolerance[1]}</span>]`,2));
      L.push(k(`<span class="yk">onClick</span>:`,2));
      L.push(k(`<span class="yk">action</span>: <span class="yv">${w.onClick}</span>`,3));
    }
  }
  document.getElementById('yamlOut').innerHTML=L.join('\n');
}

function plainYaml(){
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
    if(background.posX!==0||background.posY!==0) L.push(`  position: [${fn(background.posX)}, ${fn(background.posY)}, 0]`);
    L.push(`  translation: [${fn(background.transX)}, ${fn(background.transY)}, 0]`);
    L.push(`  text: " "`);
  }
  if(widgets.length>0){
    L.push(`widgets:`);
    for(const w of widgets){
      const isText=w.type==='TEXT_BUTTON';
      L.push(`  - id: ${w.id}`);
      L.push(`    type: ${w.type}`);
      if(!isText&&w.material) L.push(`    material: ${w.material}`);
      if(isText){L.push(`    text: "${w.text}"`);L.push(`    scale: [${fn(w.w*8)}, ${fn(w.h*4)}, 1]`);}
      else L.push(`    scale: [${fn(w.w)}, ${fn(w.h)}, ${fn(w.w)}]`);
      L.push(`    position: [${fn(w.x)}, ${fn(w.y)}, 0]`);
      if((w.transX||0)!==0||(w.transY||0)!==0) L.push(`    translation: [${fn(w.transX||0)}, ${fn(w.transY||0)}, 0]`);
      L.push(`    tolerance: [${w.tolerance[0]}, ${w.tolerance[1]}]`);
      L.push(`    onClick:`);
      L.push(`      action: ${w.onClick}`);
    }
  }
  return L.join('\n');
}

function doCopy(){
  navigator.clipboard.writeText(plainYaml()).then(()=>{
    ['btnCopy','btnCopy2'].forEach(id=>{
      const b=document.getElementById(id);const o=b.textContent;
      b.textContent='✓ Скопировано!';setTimeout(()=>b.textContent=o,1600);
    });
  });
}

// Инициализация обработчиков YAML
function initYamlHandlers() {
  document.getElementById('btnCopy').addEventListener('click',doCopy);
  document.getElementById('btnCopy2').addEventListener('click',doCopy);
  document.getElementById('screenId').addEventListener('input',updateYaml);
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  fn,
  updateYaml,
  plainYaml,
  doCopy,
  initYamlHandlers
});