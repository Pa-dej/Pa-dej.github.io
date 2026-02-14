// Управление веером карт
let isFocused = false;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.fan-container');
    const cards = document.querySelectorAll('.card');
    
    // Изначально показываем веер
    container.classList.add('fan-mode');

    // Отслеживание позиции мыши для предотвращения цикла hover
    cards.forEach((card, index) => {
        let isHovering = false;
        
        card.addEventListener('mouseenter', (e) => {
            isHovering = true;
            card.classList.add('hovering');
        });
        
        card.addEventListener('mouseleave', (e) => {
            isHovering = false;
            card.classList.remove('hovering');
        });
        
        card.addEventListener('mousemove', (e) => {
            if (!isFocused && isHovering) {
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
        
        // Клик по карте - фокус
        card.addEventListener('click', (e) => {
            e.stopPropagation(); // Предотвращаем всплытие
            if (!isFocused) {
                focusCard(card, container, index);
            }
        });
    });

    // Клик по контейнеру (мимо карты) - вернуться к вееру
    container.addEventListener('click', (e) => {
        if (isFocused && e.target === container) {
            unfocusCards(container, cards);
        }
    });

    // ESC - вернуться к вееру
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isFocused) {
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
