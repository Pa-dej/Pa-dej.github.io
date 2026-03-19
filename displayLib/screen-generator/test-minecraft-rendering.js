// ═══════════════════════════════════════════════════════════════
// ТЕСТ КАЛИБРОВКИ MINECRAFT РЕНДЕРИНГА
// ═══════════════════════════════════════════════════════════════

// Тест 1: Пустой фон text=" ", scale=[8, 4, 1]
console.log('=== ТЕСТ 1: Пустой фон ===');
const test1 = window.ScreenGenerator.mcBgSize(' ', 8, 4);
console.log('text=" ", scale=[8, 4, 1]');
console.log('mcTextWidth(" ") =', window.ScreenGenerator.mcTextWidth(' '));
console.log('Ожидаемый результат: 1.2 × 1.1 блока');
console.log('Фактический результат:', test1.w.toFixed(3), '×', test1.h.toFixed(3), 'блока');
console.log('Соответствие:', Math.abs(test1.w - 1.2) < 0.01 && Math.abs(test1.h - 1.1) < 0.01 ? '✅' : '❌');

// Тест 2: text="Button", scale=[4, 2, 1]
console.log('\n=== ТЕСТ 2: Текст "Button" ===');
const test2 = window.ScreenGenerator.mcBgSize('Button', 4, 2);
console.log('text="Button", scale=[4, 2, 1]');
console.log('mcTextWidth("Button") =', window.ScreenGenerator.mcTextWidth('Button'));
console.log('Ожидаемый результат: 3.9 × 0.55 блока');
console.log('Фактический результат:', test2.w.toFixed(3), '×', test2.h.toFixed(3), 'блока');
console.log('Соответствие:', Math.abs(test2.w - 3.9) < 0.1 && Math.abs(test2.h - 0.55) < 0.01 ? '✅' : '❌');

// Тест 3: Проверка отдельных символов
console.log('\n=== ТЕСТ 3: Ширины символов ===');
const testChars = ['B', 'u', 't', 'o', 'n'];
testChars.forEach(ch => {
  console.log(`"${ch}": ${window.ScreenGenerator.mcTextWidth(ch)}px`);
});

// Тест 4: Многострочный текст
console.log('\n=== ТЕСТ 4: Многострочный текст ===');
const test4 = window.ScreenGenerator.mcBgSize('Line1\nLine2', 8, 4);
console.log('text="Line1\\nLine2", scale=[8, 4, 1]');
console.log('Результат:', test4.w.toFixed(3), '×', test4.h.toFixed(3), 'блока');

console.log('\n=== ТЕСТЫ ЗАВЕРШЕНЫ ===');