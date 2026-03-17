// ═══════════════════════════════════════════════════════════════
// DEMO DATA AND INITIALIZATION
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// DEMO — точные параметры из примеров плагина
// Берём simple_center_test.yml как эталон:
//   background: scale=[32,12,1] → w=4,h=3; translation=[0,-1.5,0]; position=[0,0,0]
//   Widget: position=[0,0,0], scale=[0.5,0.5,0.5], translation=[0,0,0]
// ═══════════════════════════════════════════════════════════════
function loadDemo(){
  // Фон всегда присутствует
  window.ScreenGenerator.background={w:4,h:3,colorHex:'#0d1117',alpha:180,posX:0,posY:0,transX:0,transY:-1.5,locked:false};
  
  window.ScreenGenerator.widgets=[
    // ITEM_BUTTON: anchor=CENTER, position=[0,0] → стоит в центре экрана
    {id:'btn_center',type:'ITEM_BUTTON',material:'DIAMOND',label:'',text:'',
      x:0,y:0,transX:0,transY:0,w:0.5,h:0.5,color:'#44ddcc',
      onClick:'OPEN_MENU',tolerance:[0.15,0.15]},
    // Правый верхний
    {id:'btn_close',type:'ITEM_BUTTON',material:'RED_STAINED_GLASS_PANE',label:'',text:'',
      x:1.5,y:1.2,transX:0,transY:0,w:0.5,h:0.5,color:'#cc3333',
      onClick:'CLOSE_SCREEN',tolerance:[0.1,0.1]},
    // TEXT_BUTTON: anchor=center-X,bottom-Y
    // position=[0,0.8] → entity стоит на Y=0.8
    // translation=[0,-0.25] → модель сдвинута вниз на 0.25 (чтобы центрировать h=0.5)
    {id:'btn_title',type:'TEXT_BUTTON',material:'',label:'Меню',text:'Меню',
      x:0,y:0.8,transX:0,transY:-0.25,w:2,h:0.5,color:'#1e3a5f',
      onClick:'CLOSE_SCREEN',tolerance:[0,0]},
    {id:'btn_back',type:'TEXT_BUTTON',material:'',label:'← Закрыть',text:'← Закрыть',
      x:0,y:-1.0,transX:0,transY:-0.2,w:1.5,h:0.4,color:'#2a4040',
      onClick:'CLOSE_SCREEN',tolerance:[0.1,0.1]},
  ];
  
  window.ScreenGenerator.nextId=10;
  window.ScreenGenerator.selectedId=null;
  
  if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
  if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
  
  // Принудительно обновляем иконки после загрузки демо
  setTimeout(() => {
    initVisualRenders();
  }, 100);
}

// Инициализация визуальных рендеров в интерфейсе
function initVisualRenders() {
  console.log('Initializing visual renders...');
  
  // Обновляем иконку Item Button в палитре
  const itemButtonIcon = document.getElementById('item-button-icon');
  if (itemButtonIcon) {
    const iconHtml = window.ScreenGenerator.getMinecraftRender('RED_STAINED_GLASS_PANE', 20);
    console.log('Generated icon HTML:', iconHtml);
    itemButtonIcon.innerHTML = iconHtml;
    console.log('Item button icon updated');
  } else {
    console.log('Item button icon element not found');
  }
  
  // Обновляем все виджеты в палитре
  document.querySelectorAll('.witem').forEach((item, index) => {
    const material = item.dataset.material;
    const icon = item.querySelector('.wicon');
    console.log(`Processing palette item ${index}:`, {material, icon, hasIcon: !!icon});
    
    if (material && icon) {
      const iconHtml = window.ScreenGenerator.getMinecraftRender(material, 20);
      console.log('Setting palette icon for', material, ':', iconHtml);
      icon.innerHTML = iconHtml;
    } else if (icon && !material) {
      // Для Text Button показываем T
      icon.innerHTML = '<div style="width:20px;height:20px;background:var(--accent);color:#000;border-radius:3px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;">T</div>';
    }
  });
  
  console.log('Visual renders initialization complete');
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  loadDemo,
  initVisualRenders
});