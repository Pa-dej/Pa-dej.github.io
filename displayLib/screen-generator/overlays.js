// ═══════════════════════════════════════════════════════════════
// OVERLAY MANAGEMENT - Widget overlays and tolerance zones
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// TOLERANCE OVERLAY - Display tolerance zones on top of icons
// ═══════════════════════════════════════════════════════════════
function updateToleranceOverlay() {
  const { selectedId, widgets, wVisualRect, b2p } = window.ScreenGenerator;
  
  // Найдем или создадим overlay для зон толерантности
  let toleranceOverlay = document.getElementById('tolerance-overlay');
  if (!toleranceOverlay) {
    toleranceOverlay = document.createElement('div');
    toleranceOverlay.id = 'tolerance-overlay';
    toleranceOverlay.style.position = 'absolute';
    toleranceOverlay.style.top = '0';
    toleranceOverlay.style.left = '0';
    toleranceOverlay.style.width = '100%';
    toleranceOverlay.style.height = '100%';
    toleranceOverlay.style.pointerEvents = 'none';
    toleranceOverlay.style.zIndex = '15'; // Выше чем иконки (z-index: 10)
    document.getElementById('cwrap').appendChild(toleranceOverlay);
  }
  
  // Очищаем предыдущие зоны толерантности
  toleranceOverlay.innerHTML = '';
  
  // Добавляем зону толерантности для выбранного виджета
  if (selectedId && selectedId !== '__bg__') {
    const w = widgets.find(x => x.id === selectedId);
    if (w && (w.tolerance[0] > 0 || w.tolerance[1] > 0)) {
      const g = wVisualRect(w);
      
      const tolW = b2p(w.tolerance[0] * 2); // tolerance в обе стороны
      const tolH = b2p(w.tolerance[1] * 2);
      const centerX = g.px + g.pw/2;
      const centerY = g.py + g.ph/2;
      
      // Создаем SVG для эллипса
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.position = 'absolute';
      svg.style.left = '0';
      svg.style.top = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      ellipse.setAttribute('cx', centerX);
      ellipse.setAttribute('cy', centerY);
      ellipse.setAttribute('rx', tolW/2);
      ellipse.setAttribute('ry', tolH/2);
      ellipse.setAttribute('fill', 'none');
      ellipse.setAttribute('stroke', 'rgba(255,165,0,0.8)');
      ellipse.setAttribute('stroke-width', '2');
      ellipse.setAttribute('stroke-dasharray', '6,4');
      
      svg.appendChild(ellipse);
      toleranceOverlay.appendChild(svg);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// WIDGET OVERLAYS - Display Minecraft renders on top of canvas
// ═══════════════════════════════════════════════════════════════
function updateWidgetOverlays() {
  const { widgets, wVisualRect, getMinecraftRender, createColoredIcon } = window.ScreenGenerator;
  
  const overlay = document.getElementById('widget-overlay');
  if (!overlay) return;
  
  // Clear existing overlays
  overlay.innerHTML = '';
  
  // Add overlays for each ITEM_BUTTON widget в порядке создания
  for (const w of widgets) {
    if (w.type !== 'ITEM_BUTTON' || !w.material) continue;
    
    const g = wVisualRect(w);
    
    // Create overlay element that covers the entire widget
    const overlayEl = document.createElement('div');
    overlayEl.style.position = 'absolute';
    overlayEl.style.left = g.px + 'px';
    overlayEl.style.top = g.py + 'px';
    overlayEl.style.width = g.pw + 'px';
    overlayEl.style.height = g.ph + 'px';
    overlayEl.style.pointerEvents = 'none';
    overlayEl.style.zIndex = '10';
    overlayEl.style.display = 'flex';
    overlayEl.style.alignItems = 'center';
    overlayEl.style.justifyContent = 'center';
    
    // Масштабируем иконку под размер виджета
    const iconClass = MATERIAL_TO_ICON[w.material.toUpperCase()];
    if (iconClass) {
      // Вычисляем масштаб для заполнения виджета на 100%
      const targetSize = Math.min(g.pw, g.ph); // 100% от размера виджета
      const baseSize = 32; // Базовый размер CSS иконки
      const scale = targetSize / baseSize;
      
      overlayEl.innerHTML = `<i class="icon-minecraft icon-minecraft-${iconClass}" style="transform:scale(${scale});transform-origin:center;" title="${w.material}"></i>`;
    } else {
      // Для fallback иконок используем полный размер виджета
      const renderSize = Math.min(g.pw, g.ph);
      overlayEl.innerHTML = createColoredIcon(w.material, renderSize);
    }
    
    overlay.appendChild(overlayEl);
  }
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  updateToleranceOverlay,
  updateWidgetOverlays
});