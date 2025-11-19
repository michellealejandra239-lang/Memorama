let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let timerInterval = null;
let seconds = 0;
let canFlip = true;
let currentDifficulty = 'easy';

const symbols = ['🎯', '🎮', '🎨', '🎭', '🎪', '🎬', '🎸', '🎹', '⚽', '🏀', '🎾', '🏐', '📚', '📖', '✏️', '🎓'];

const difficulties = {
    easy: { pairs: 4, columns: 4 },
    medium: { pairs: 6, columns: 4 },
    hard: { pairs: 8, columns: 4 }
};

const gameBoard = document.getElementById('gameBoard');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const totalPairsDisplay = document.getElementById('totalPairs');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const winModal = document.getElementById('winModal');
const playAgainBtn = document.getElementById('playAgainBtn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

function initGame() {
    const difficulty = difficulties[currentDifficulty];
    const numPairs = difficulty.pairs;
    
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    canFlip = true;
    
    totalPairsDisplay.textContent = numPairs;
    updateStats();
    
    const selectedSymbols = symbols.slice(0, numPairs);
    const gameCards = [...selectedSymbols, ...selectedSymbols];
    cards = shuffleArray(gameCards);
    
    gameBoard.style.gridTemplateColumns = `repeat(${difficulty.columns}, 1fr)`;
    renderBoard();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        
        card.innerHTML = `
            <div class="card-front">?</div>
            <div class="card-back">${symbol}</div>
        `;
        
        card.addEventListener('click', () => flipCard(card, index));
        gameBoard.appendChild(card);
    });
}

function flipCard(cardElement, index) {
    if (!gameStarted || !canFlip) return;
    if (cardElement.classList.contains('flipped') || cardElement.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;
    
    cardElement.classList.add('flipped');
    flippedCards.push({ element: cardElement, index: index, symbol: cards[index] });
    
    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        canFlip = false;
        
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.symbol === card2.symbol) {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        matchedPairs++;
        updateStats();
        
        if (matchedPairs === difficulties[currentDifficulty].pairs) {
            setTimeout(endGame, 500);
        }
    } else {
        setTimeout(() => {
            card1.element.classList.remove('flipped');
            card2.element.classList.remove('flipped');
        }, 500);
    }
    
    flippedCards = [];
    canFlip = true;
}

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateStats() {
    movesDisplay.textContent = moves;
    pairsDisplay.textContent = matchedPairs;
}

function startGame() {
    if (gameStarted) return;
    
    gameStarted = true;
    startBtn.textContent = '🎮 En Juego...';
    startBtn.disabled = true;
    initGame();
    startTimer();
}

function restartGame() {
    stopTimer();
    gameStarted = false;
    startBtn.textContent = '🎮 Iniciar Juego';
    startBtn.disabled = false;
    winModal.classList.remove('show');
    initGame();
}

function endGame() {
    stopTimer();
    gameStarted = false;
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${minutes}:${secs.toString().padStart(2, '0')}`;
    
    document.getElementById('finalTime').textContent = timeString;
    document.getElementById('finalMoves').textContent = moves;
    
    winModal.classList.add('show');
    
    startBtn.textContent = '🎮 Iniciar Juego';
    startBtn.disabled = false;
}

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (gameStarted) {
            if (!confirm('¿Estás seguro? Se perderá el progreso actual.')) {
                return;
            }
        }
        
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.level;
        restartGame();
    });
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', restartGame);

initGame();