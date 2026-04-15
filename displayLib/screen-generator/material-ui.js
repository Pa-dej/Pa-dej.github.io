// ═══════════════════════════════════════════════════════════════
// MATERIAL SEARCH UI - только для панели свойств
// ═══════════════════════════════════════════════════════════════

function isSelectableWidgetMaterial(materialId) {
  const validator = window.ScreenGenerator?.isValidMinecraftMaterialId;
  if (typeof validator === 'function') {
    return validator(materialId);
  }
  return /^[A-Z0-9_]+$/.test(String(materialId || '').trim().toUpperCase());
}

function filterWidgetMaterialResults(results) {
  return (Array.isArray(results) ? results : []).filter(result => isSelectableWidgetMaterial(result?.id));
}

function getSafeWidgetMaterial(materialId) {
  const normalized = String(materialId || '').trim().toUpperCase();
  return isSelectableWidgetMaterial(normalized) ? normalized : 'RED_STAINED_GLASS_PANE';
}

// Функция для инициализации поиска материала в панели свойств
function initMaterialSearchForWidget(id, widget) {
  const { searchMaterials, getMinecraftRender } = window.ScreenGenerator;
  
  const searchInput = document.getElementById(`${id}_search`);
  const searchResults = document.getElementById(`${id}_results`);
  const hiddenInput = document.getElementById(id);
  const inputGroup = searchInput?.closest('.input-group');
  
  if (!searchInput || !searchResults || !hiddenInput) return;

  if (widget?.type === 'ITEM_BUTTON') {
    const safeMaterial = getSafeWidgetMaterial(widget.material);
    if (widget.material !== safeMaterial) {
      widget.material = safeMaterial;
      if (window.ScreenGenerator?.matCol) {
        widget.color = window.ScreenGenerator.matCol(safeMaterial);
      }
    }
    hiddenInput.value = safeMaterial;

    const preview = document.getElementById(`${id}_preview`);
    if (preview && typeof getMinecraftRender === 'function') {
      preview.innerHTML = getMinecraftRender(safeMaterial, 24);
    }
  }
  
  let searchTimeout;
  
  // Управление классом focused для правильной обводки
  searchInput.addEventListener('focus', async (e) => {
    if (inputGroup) inputGroup.classList.add('focused');
    
    if (e.target.value.trim().length > 0) {
      console.log('Focus search for:', e.target.value.trim());
      try {
        const searchFunction = window.ScreenGenerator?.searchMaterials;
        const results = await searchFunction(e.target.value.trim());
        displaySearchResultsForWidget(results, e.target.value.trim(), id, widget);
      } catch (error) {
        console.warn('Search error on focus:', error);
        displaySearchResultsForWidget([], e.target.value.trim(), id, widget);
      }
    }
  });
  
  searchInput.addEventListener('blur', (e) => {
    if (inputGroup) inputGroup.classList.remove('focused');
  });
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    console.log('Input event fired, query:', query);
    
    if (query.length === 0) {
      searchResults.style.display = 'none';
      return;
    }
    
    // Debounce поиска
    searchTimeout = setTimeout(async () => {
      console.log('Starting search for:', query);
      try {
        const searchFunction = window.ScreenGenerator?.searchMaterials;
        console.log('Search function available:', !!searchFunction);
        
        const results = await searchFunction(query);
        console.log('Search completed, results:', results);
        displaySearchResultsForWidget(results, query, id, widget);
      } catch (error) {
        console.warn('Search error:', error);
        displaySearchResultsForWidget([], query, id, widget);
      }
    }, 150);
  });
  
  // Скрываем результаты при клике вне поиска
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.material-search-container')) {
      searchResults.style.display = 'none';
    }
  });
  
  // Перепозиционируем dropdown при скролле или изменении размера окна
  const repositionHandler = () => {
    if (searchResults.style.display === 'block') {
      positionDropdown(searchInput, searchResults);
    }
  };
  
  window.addEventListener('scroll', repositionHandler);
  window.addEventListener('resize', repositionHandler);
  
  // Скрываем dropdown при скролле панели свойств
  const propPanel = document.getElementById('propPanel');
  if (propPanel) {
    propPanel.addEventListener('scroll', () => {
      searchResults.style.display = 'none';
    });
  }
}

function displaySearchResultsForWidget(results, query, id, widget) {
  const { getMinecraftRenderAsync, getMinecraftRender, matCol } = window.ScreenGenerator;
  
  const searchResults = document.getElementById(`${id}_results`);
  const searchInput = document.getElementById(`${id}_search`);
  
  results = filterWidgetMaterialResults(results);
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-more">Ничего не найдено</div>';
    searchResults.style.display = 'block';
    positionDropdown(searchInput, searchResults);
    return;
  }
  
  // Используем асинхронную версию для получения иконок
  if (getMinecraftRenderAsync) {
    const renderPromises = results.map(async (result) => {
      const iconHtml = await getMinecraftRenderAsync(result.id, 16);
      return `
        <li>
          <a href="#" data-v="${result.id}">
            ${iconHtml} ${result.name}
          </a>
        </li>
      `;
    });
    
    // Ждем все иконки и отображаем результаты
    Promise.all(renderPromises).then(htmlParts => {
      let html = htmlParts.join('');
      
      if (results.length === 15) {
        html += '<div class="search-more"><em>there are more results<br>refine search</em></div>';
      }
      
      searchResults.innerHTML = `<ul>${html}</ul>`;
      searchResults.style.display = 'block';
      positionDropdown(searchInput, searchResults);
      
      // Добавляем обработчики кликов
      searchResults.querySelectorAll('a[data-v]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const material = String(item.dataset.v || '').trim().toUpperCase();
          if (!isSelectableWidgetMaterial(material)) {
            console.warn('Blocked non-material selection:', material);
            searchResults.style.display = 'none';
            return;
          }
          
          // Обновляем виджет
          widget.material = material;
          widget.color = matCol(material);
          
          // Обновляем скрытое поле
          document.getElementById(id).value = material;
          
          // Обновляем превью асинхронно
          const preview = document.getElementById(`${id}_preview`);
          if (preview) {
            getMinecraftRenderAsync(material, 24).then(iconHtml => {
              preview.innerHTML = iconHtml;
            });
          }
          
          // Очищаем поиск и скрываем результаты
          searchInput.value = '';
          searchResults.style.display = 'none';
          
          // Обновляем отображение
          if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
          if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
        });
      });
    }).catch(error => {
      console.warn('Error rendering search results:', error);
      // Fallback к синхронной версии
      displaySearchResultsWidgetSync(results, query, id, widget);
    });
  } else {
    // Fallback к синхронной версии
    displaySearchResultsWidgetSync(results, query, id, widget);
  }
}

// Синхронная версия как fallback
function displaySearchResultsWidgetSync(results, query, id, widget) {
  const { getMinecraftRender, matCol } = window.ScreenGenerator;
  
  const searchResults = document.getElementById(`${id}_results`);
  const searchInput = document.getElementById(`${id}_search`);
  
  results = filterWidgetMaterialResults(results);
  let html = '';
  
  for (const result of results) {
    const iconHtml = getMinecraftRender(result.id, 16);
    html += `
      <li>
        <a href="#" data-v="${result.id}">
          ${iconHtml} ${result.name}
        </a>
      </li>
    `;
  }
  
  if (results.length === 15) {
    html += '<div class="search-more"><em>there are more results<br>refine search</em></div>';
  }
  
  searchResults.innerHTML = `<ul>${html}</ul>`;
  searchResults.style.display = 'block';
  
  // Позиционируем dropdown
  positionDropdown(searchInput, searchResults);
  
  // Добавляем обработчики клика
  searchResults.querySelectorAll('a[data-v]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const material = String(item.dataset.v || '').trim().toUpperCase();
      if (!isSelectableWidgetMaterial(material)) {
        console.warn('Blocked non-material selection:', material);
        searchResults.style.display = 'none';
        return;
      }
      
      // Обновляем виджет
      widget.material = material;
      widget.color = matCol(material);
      
      // Обновляем скрытое поле
      document.getElementById(id).value = material;
      
      // Обновляем превью
      const preview = document.getElementById(`${id}_preview`);
      if (preview) {
        preview.innerHTML = getMinecraftRender(material, 24);
      }
      
      // Очищаем поиск и скрываем результаты
      searchInput.value = '';
      searchResults.style.display = 'none';
      
      // Обновляем отображение
      if (window.ScreenGenerator && typeof window.ScreenGenerator.render === 'function') window.ScreenGenerator.render();
      if (window.ScreenGenerator && typeof window.ScreenGenerator.updateProps === 'function') window.ScreenGenerator.updateProps();
    });
  });
}

// Функция для правильного позиционирования dropdown
function positionDropdown(inputElement, dropdownElement) {
  const inputRect = inputElement.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  
  // Позиционируем dropdown
  dropdownElement.style.position = 'fixed';
  dropdownElement.style.left = inputRect.left + 'px';
  
  // Ограничиваем ширину dropdown размером input или минимальной шириной
  const dropdownWidth = Math.max(inputRect.width, 200);
  dropdownElement.style.width = dropdownWidth + 'px';
  
  // Проверяем, не выходит ли dropdown за правый край экрана
  if (inputRect.left + dropdownWidth > viewportWidth) {
    const adjustedLeft = viewportWidth - dropdownWidth - 10; // 10px отступ от края
    dropdownElement.style.left = Math.max(10, adjustedLeft) + 'px';
  }
  
  // Проверяем, помещается ли dropdown снизу
  const spaceBelow = viewportHeight - inputRect.bottom;
  const dropdownHeight = 200; // max-height из CSS
  
  if (spaceBelow >= dropdownHeight) {
    // Показываем снизу
    dropdownElement.style.top = inputRect.bottom + 'px';
    dropdownElement.style.bottom = 'auto';
  } else {
    // Показываем сверху
    dropdownElement.style.top = 'auto';
    dropdownElement.style.bottom = (viewportHeight - inputRect.top) + 'px';
  }
}

// Экспорт функций
Object.assign(window.ScreenGenerator, {
  initMaterialSearchForWidget,
  displaySearchResultsForWidget,
  positionDropdown
});
