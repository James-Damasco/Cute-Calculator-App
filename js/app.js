class CuteCalculator {
    constructor() {
        this.prevOperandEl = document.getElementById('previous-operand');
        this.currOperandEl = document.getElementById('current-operand');
        this.clear();
        this.setupAudio();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') this.clear();
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '−': computation = prev - current; break;
            case '×': computation = prev * current; break;
            case '÷':
                if (current === 0) {
                    this.currentOperand = "Error";
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default: return;
        }

        // Handle floating point precision issues (e.g., 0.1 + 0.2)
        computation = Math.round(computation * 100000000) / 100000000;

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    updateDisplay() {
        this.currOperandEl.innerText = this.currentOperand;
        if (this.operation != null) {
            this.prevOperandEl.innerText = `${this.previousOperand} ${this.operation}`;
        } else {
            this.prevOperandEl.innerText = '';
        }
    }

    // Cute Audio Synthesis using Web Audio API
    setupAudio() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playClickSound() {
        if (!appSettings.sound) return;
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, this.audioCtx.currentTime); // High pitched cute pop
        oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        oscillator.start();
        oscillator.stop(this.audioCtx.currentTime + 0.1);
    }
}

// --- APP STATE & SETTINGS ---
const defaultSettings = {
    theme: 'pastel',
    shape: 'rounded',
    spacing: 'compact',
    flowerMode: true,
    intensity: 'medium',
    sound: true
};

let appSettings = JSON.parse(localStorage.getItem('cuteCalcSettings')) || defaultSettings;
const calculator = new CuteCalculator();

// --- DOM ELEMENTS ---
const buttons = document.querySelectorAll('.btn');
const root = document.documentElement;
let petalInterval;

// --- EVENT LISTENERS FOR CALCULATOR ---
buttons.forEach(button => {
    button.addEventListener('click', function (e) {
        calculator.playClickSound();
        createRipple(e, this);

        // Flower bloom effect if enabled
        if (appSettings.flowerMode) createBloom(e.clientX, e.clientY);

        const val = this.dataset.val;
        const action = this.dataset.action;

        if (this.classList.contains('number')) calculator.appendNumber(val);
        if (this.classList.contains('operator')) calculator.chooseOperation(val);
        if (action === 'clear') calculator.clear();
        if (action === 'delete') calculator.delete();
        if (action === 'calculate') calculator.compute();

        calculator.updateDisplay();
    });
});

// Keyboard support
document.addEventListener('keydown', e => {
    if ((e.key >= 0 && e.key <= 9) || e.key === '.') {
        calculator.playClickSound();
        calculator.appendNumber(e.key);
    }
    if (e.key === '=' || e.key === 'Enter') {
        calculator.playClickSound();
        calculator.compute();
    }
    if (e.key === 'Backspace') {
        calculator.playClickSound();
        calculator.delete();
    }
    if (e.key === 'Escape') {
        calculator.playClickSound();
        calculator.clear();
    }
    if (e.key === '+' || e.key === '-') {
        calculator.playClickSound();
        calculator.chooseOperation(e.key === '-' ? '−' : '+');
    }
    if (e.key === '*' || e.key === '/') {
        calculator.playClickSound();
        calculator.chooseOperation(e.key === '*' ? '×' : '÷');
    }
    calculator.updateDisplay();
});

// --- EFFECTS CONTROLLERS ---
function createRipple(event, button) {
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
}

function createBloom(x, y) {
    const emojis = ['🌸', '✨', '💖', '🌼'];
    const bloom = document.createElement('div');
    bloom.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    bloom.style.position = 'fixed';
    bloom.style.left = `${x - 10}px`;
    bloom.style.top = `${y - 10}px`;
    bloom.style.fontSize = '24px';
    bloom.style.pointerEvents = 'none';
    bloom.style.zIndex = '100';
    bloom.style.transition = 'all 0.6s ease-out';
    document.body.appendChild(bloom);

    requestAnimationFrame(() => {
        bloom.style.transform = `translateY(-30px) scale(1.5)`;
        bloom.style.opacity = '0';
    });

    setTimeout(() => bloom.remove(), 600);
}

function spawnPetal() {
    if (!appSettings.flowerMode) return;
    const container = document.getElementById('petal-container');
    const petal = document.createElement('div');
    petal.classList.add('petal');
    const petals = ['🌸', '💮', '🌺', '🌼', '🍃'];
    petal.innerText = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.animationDuration = `${Math.random() * 3 + 4}s`; // 4 to 7 seconds fall
    container.appendChild(petal);

    // Cleanup
    setTimeout(() => petal.remove(), 7000);
}

function updatePetalInterval() {
    clearInterval(petalInterval);
    if (!appSettings.flowerMode) {
        document.getElementById('petal-container').innerHTML = '';
        return;
    }
    let speed = 1000; // Medium
    if (appSettings.intensity === 'low') speed = 2500;
    if (appSettings.intensity === 'high') speed = 300;
    petalInterval = setInterval(spawnPetal, speed);
}

// --- SETTINGS CONTROLLER ---
function applySettings() {
    // 1. Theme
    root.setAttribute('data-theme', appSettings.theme);

    // 2. Shape
    const radiuses = { 'rounded': '20px', 'pill': '50px', 'square': '8px' };
    root.style.setProperty('--btn-radius', radiuses[appSettings.shape]);

    // 3. Spacing
    root.style.setProperty('--grid-gap', appSettings.spacing === 'compact' ? '8px' : '16px');
    root.style.setProperty('--calc-padding', appSettings.spacing === 'compact' ? '20px' : '30px');

    // 4. Flowers
    updatePetalInterval();

    // Update UI elements to match state
    document.getElementById('theme-select').value = appSettings.theme;
    document.getElementById('shape-select').value = appSettings.shape;
    document.getElementById('spacing-select').value = appSettings.spacing;
    document.getElementById('flower-toggle').checked = appSettings.flowerMode;
    document.getElementById('intensity-select').value = appSettings.intensity;
    document.getElementById('intensity-select').disabled = !appSettings.flowerMode;
    document.getElementById('sound-toggle').checked = appSettings.sound;

    // Save to local storage
    localStorage.setItem('cuteCalcSettings', JSON.stringify(appSettings));
}

// --- MODAL & SETTINGS LISTENERS ---
const modal = document.getElementById('settings-modal');
document.getElementById('settings-btn').addEventListener('click', () => modal.classList.add('active'));
document.getElementById('close-settings').addEventListener('click', () => modal.classList.remove('active'));

document.getElementById('theme-select').addEventListener('change', (e) => { appSettings.theme = e.target.value; applySettings(); });
document.getElementById('shape-select').addEventListener('change', (e) => { appSettings.shape = e.target.value; applySettings(); });
document.getElementById('spacing-select').addEventListener('change', (e) => { appSettings.spacing = e.target.value; applySettings(); });
document.getElementById('flower-toggle').addEventListener('change', (e) => { appSettings.flowerMode = e.target.checked; applySettings(); });
document.getElementById('intensity-select').addEventListener('change', (e) => { appSettings.intensity = e.target.value; applySettings(); });
document.getElementById('sound-toggle').addEventListener('change', (e) => { appSettings.sound = e.target.checked; applySettings(); });

// Init
applySettings();
