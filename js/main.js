// Управление веером карт
let isFocused = false;
let isMobile = false;

// Проверка мобильного устройства
function checkMobile() {
    isMobile = window.innerWidth <= 900;
    return isMobile;
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.fan-container');
    const cards = document.querySelectorAll('.card');
    
    // Изначально показываем веер
    container.classList.add('fan-mode');
    
    // Проверяем размер экрана
    checkMobile();

    // Отслеживание позиции мыши для предотвращения цикла hover (только для десктопа)
    cards.forEach((card, index) => {
        let isHovering = false;
        
        card.addEventListener('mouseenter', (e) => {
            if (!isMobile) {
                isHovering = true;
                card.classList.add('hovering');
            }
        });
        
        card.addEventListener('mouseleave', (e) => {
            if (!isMobile) {
                isHovering = false;
                card.classList.remove('hovering');
            }
        });
        
        card.addEventListener('mousemove', (e) => {
            if (!isFocused && isHovering && !isMobile) {
                const rect = card.getBoundingClientRect();
                const mouseY = e.clientY;
                const cardBottom = rect.bottom;
                
                // Если курсор слишком близко к нижней границе, убираем hover
                if (mouseY > cardBottom - 100) {
                    card.classList.remove('hovering');
                    isHovering = false;
                }
            }
        });
        
        // Клик по карте - фокус (только для десктопа)
        card.addEventListener('click', (e) => {
            if (!isMobile) {
                e.stopPropagation();
                if (!isFocused) {
                    focusCard(card, container, index);
                }
            }
        });
    });

    // Клик по контейнеру (мимо карты) - вернуться к вееру (только для десктопа)
    container.addEventListener('click', (e) => {
        if (!isMobile && isFocused && e.target === container) {
            unfocusCards(container, cards);
        }
    });

    // ESC - вернуться к вееру (только для десктопа)
    document.addEventListener('keydown', (e) => {
        if (!isMobile && e.key === 'Escape' && isFocused) {
            unfocusCards(container, cards);
        }
    });
    
    // Отслеживание изменения размера окна
    window.addEventListener('resize', () => {
        const wasMobile = isMobile;
        checkMobile();
        
        // Если переключились с десктопа на мобильный, сбрасываем фокус
        if (!wasMobile && isMobile && isFocused) {
            unfocusCards(container, cards);
        }
    });
});

function focusCard(card, container, index) {
    isFocused = true;
    container.classList.remove('fan-mode');
    container.classList.add('focus-mode');
    card.classList.add('focused');
    
    // Сохраняем z-index карты
    card.style.zIndex = 5 - index;
}

function unfocusCards(container, cards) {
    isFocused = false;
    container.classList.remove('focus-mode');
    container.classList.add('fan-mode');
    
    cards.forEach(card => {
        card.classList.remove('focused');
        card.style.zIndex = '';
    });
}

console.log('Веер карт загружен! 🎴');
