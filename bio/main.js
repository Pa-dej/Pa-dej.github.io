// Bio page JavaScript - Fan card animations
console.log('Bio page loaded');

document.addEventListener('DOMContentLoaded', function() {
    const fanContainer = document.querySelector('.fan-container');
    const cards = document.querySelectorAll('.card');
    
    let currentMode = 'fan'; // 'fan' или 'focus'
    let focusedCard = null;
    
    // Инициализация веера
    function initFanMode() {
        fanContainer.className = 'fan-container fan-mode';
        cards.forEach(card => {
            card.classList.remove('focused', 'hovering');
        });
        focusedCard = null;
    }
    
    // Режим фокуса
    function initFocusMode(targetCard) {
        fanContainer.className = 'fan-container focus-mode';
        cards.forEach(card => {
            card.classList.remove('focused', 'hovering');
        });
        targetCard.classList.add('focused');
        focusedCard = targetCard;
    }
    
    // Обработчики событий для карт
    cards.forEach(card => {
        // Hover эффекты в режиме веера
        card.addEventListener('mouseenter', function() {
            if (currentMode === 'fan') {
                this.classList.add('hovering');
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (currentMode === 'fan') {
                this.classList.remove('hovering');
            }
        });
        
        // Клик для переключения режимов
        card.addEventListener('click', function() {
            if (currentMode === 'fan') {
                currentMode = 'focus';
                initFocusMode(this);
            } else if (currentMode === 'focus' && focusedCard === this) {
                currentMode = 'fan';
                initFanMode();
            } else if (currentMode === 'focus') {
                initFocusMode(this);
            }
        });
    });
    
    // Клик вне карт для возврата к вееру
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.card') && currentMode === 'focus') {
            currentMode = 'fan';
            initFanMode();
        }
    });
    
    // Клавиша Escape для возврата к вееру
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentMode === 'focus') {
            currentMode = 'fan';
            initFanMode();
        }
    });
    
    // Инициализация
    initFanMode();
});