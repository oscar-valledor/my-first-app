(() => {
  const displayEl = document.getElementById('display');
  const degRadBtn = document.querySelector('[data-action="deg-rad"]');

  let firstOperand = null;
  let operator = null; // 'add' | 'subtract' | 'multiply' | 'divide'
  let shouldReset = false;
  let memoryValue = 0;
  let isDegreesMode = true; // DEG by default

  function updateDisplay(text) {
    displayEl.textContent = text;
  }

  function getDisplayValue() {
    return displayEl.textContent || '0';
  }

  function inputDigit(d) {
    const current = getDisplayValue();
    if (shouldReset || current === '0') {
      updateDisplay(d);
      shouldReset = false;
    } else {
      updateDisplay(current + d);
    }
  }

  function inputDot() {
    const current = getDisplayValue();
    if (shouldReset) {
      updateDisplay('0.');
      shouldReset = false;
      return;
    }
    if (!current.includes('.')) updateDisplay(current + '.');
  }

  function clearAll() {
    firstOperand = null;
    operator = null;
    shouldReset = false;
    updateDisplay('0');
  }

  function setOperator(nextOperator) {
    const currentVal = parseFloat(getDisplayValue());
    if (operator && !shouldReset) {
      // chain operations
      const result = compute(firstOperand, operator, currentVal);
      updateDisplay(formatNumber(result));
      firstOperand = result;
    } else {
      firstOperand = currentVal;
    }
    operator = nextOperator;
    shouldReset = true;
  }

  function compute(a, op, b) {
    if (op === 'add') return a + b;
    if (op === 'subtract') return a - b;
    if (op === 'multiply') return a * b;
    if (op === 'divide') return b === 0 ? NaN : a / b;
    return b;
  }

  function equals() {
    if (operator == null || firstOperand == null) return;
    const secondOperand = parseFloat(getDisplayValue());
    const result = compute(firstOperand, operator, secondOperand);
    updateDisplay(formatNumber(result));
    firstOperand = null;
    operator = null;
    shouldReset = true;
  }

  function toggleSign() {
    const current = getDisplayValue();
    if (current === '0') return;
    if (current.startsWith('-')) updateDisplay(current.slice(1));
    else updateDisplay('-' + current);
  }

  function percent() {
    const current = parseFloat(getDisplayValue());
    updateDisplay(formatNumber(current / 100));
  }

  function formatNumber(n) {
    if (!isFinite(n)) return 'Error';
    // Avoid long floating precision issues
    const num = Number.parseFloat(n.toFixed(10));
    return String(num).replace(/\.0+$/, '');
  }

  // Memory operations
  function memoryClear() {
    memoryValue = 0;
  }

  function memoryRecall() {
    updateDisplay(formatNumber(memoryValue));
    shouldReset = true;
  }

  function memoryAdd() {
    const current = parseFloat(getDisplayValue());
    memoryValue += isFinite(current) ? current : 0;
  }

  function memorySubtract() {
    const current = parseFloat(getDisplayValue());
    memoryValue -= isFinite(current) ? current : 0;
  }

  // Scientific helpers
  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  function applyUnaryOperation(operation) {
    const current = parseFloat(getDisplayValue());
    const result = operation(current);
    updateDisplay(formatNumber(result));
    shouldReset = true;
  }

  function sqrt() {
    applyUnaryOperation((x) => (x < 0 ? NaN : Math.sqrt(x)));
  }

  function square() {
    applyUnaryOperation((x) => x * x);
  }

  function inverse() {
    applyUnaryOperation((x) => (x === 0 ? NaN : 1 / x));
  }

  function sine() {
    applyUnaryOperation((x) => Math.sin(isDegreesMode ? toRadians(x) : x));
  }

  function cosine() {
    applyUnaryOperation((x) => Math.cos(isDegreesMode ? toRadians(x) : x));
  }

  function tangent() {
    applyUnaryOperation((x) => Math.tan(isDegreesMode ? toRadians(x) : x));
  }

  function ln() {
    applyUnaryOperation((x) => (x <= 0 ? NaN : Math.log(x)));
  }

  function log10() {
    applyUnaryOperation((x) => (x <= 0 ? NaN : (Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10)));
  }

  function insertPi() {
    updateDisplay(formatNumber(Math.PI));
    shouldReset = true;
  }

  function insertE() {
    updateDisplay(formatNumber(Math.E));
    shouldReset = true;
  }

  function toggleDegRad() {
    isDegreesMode = !isDegreesMode;
    if (degRadBtn) degRadBtn.textContent = isDegreesMode ? 'DEG' : 'RAD';
  }

  document.querySelectorAll('.key').forEach(btn => {
    btn.addEventListener('click', () => {
      const digit = btn.getAttribute('data-digit');
      const action = btn.getAttribute('data-action');
      if (digit != null) {
        inputDigit(digit);
        return;
      }
      switch (action) {
        case 'dot':
          inputDot();
          break;
        case 'clear':
          clearAll();
          break;
        case 'mc':
          memoryClear();
          break;
        case 'mr':
          memoryRecall();
          break;
        case 'mplus':
          memoryAdd();
          break;
        case 'mminus':
          memorySubtract();
          break;
        case 'sqrt':
          sqrt();
          break;
        case 'square':
          square();
          break;
        case 'inv':
          inverse();
          break;
        case 'sin':
          sine();
          break;
        case 'cos':
          cosine();
          break;
        case 'tan':
          tangent();
          break;
        case 'ln':
          ln();
          break;
        case 'log10':
          log10();
          break;
        case 'pi':
          insertPi();
          break;
        case 'exp':
          insertE();
          break;
        case 'deg-rad':
          toggleDegRad();
          break;
        case 'sign':
          toggleSign();
          break;
        case 'percent':
          percent();
          break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          setOperator(action);
          break;
        case 'equals':
          equals();
          break;
        default:
          break;
      }
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
    else if (e.key === '.') inputDot();
    else if (e.key === '+') setOperator('add');
    else if (e.key === '-') setOperator('subtract');
    else if (e.key === '*') setOperator('multiply');
    else if (e.key === '/') setOperator('divide');
    else if (e.key === 'Enter' || e.key === '=') equals();
    else if (e.key === 'Escape') clearAll();
  });
})();


