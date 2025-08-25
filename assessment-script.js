// Smart Start Assessment - JavaScript Logic

// Assessment data and state
let assessmentData = {
    game1: { // Focus Game (Slow Learning)
        currentRound: 0,
        totalRounds: 5,
        correctAnswers: 0,
        totalTime: 0,
        responseTimes: [],
        attempts: []
    },
    game2: { // Letter Game (Dyslexia)
        currentRound: 0,
        totalRounds: 8,
        correctAnswers: 0,
        totalTime: 0,
        responseTimes: [],
        needsRepetition: 0
    },
    game3: { // Memory Game (Cognitive)
        flippedCards: [],
        matchedPairs: 0,
        totalTime: 0,
        attempts: 0,
        mistakes: 0
    }
};

let currentGame = null;
let gameTimers = {};

// Game 1: Focus Game Data
const focusGameData = [
    { target: '🍎', options: ['🍎', '🐱', '🚗', '🎈', '⭐', '🏠'], audio: 'Find the red apple!' },
    { target: '🐶', options: ['🐶', '🌸', '⚽', '🎯', '🔥', '🎪'], audio: 'Click on the dog!' },
    { target: '⭐', options: ['⭐', '🍌', '🎵', '🌙', '🎨', '🎭'], audio: 'Where is the star?' },
    { target: '🚗', options: ['🚗', '🦋', '🎁', '🌈', '🎸', '🏆'], audio: 'Find the car!' },
    { target: '🏠', options: ['🏠', '🎲', '🎪', '🌺', '🎯', '🎊'], audio: 'Click the house!' }
];

// Game 2: Letter Game Data
const letterGameData = [
    { letter: 'A', sound: 'A', options: ['A', 'B', 'C'] },
    { letter: 'B', sound: 'B', options: ['A', 'B', 'D'] },
    { letter: 'C', sound: 'C', options: ['C', 'G', 'O'] },
    { letter: 'D', sound: 'D', options: ['D', 'B', 'P'] },
    { letter: 'E', sound: 'E', options: ['E', 'F', 'L'] },
    { letter: 'F', sound: 'F', options: ['F', 'E', 'T'] },
    { letter: 'G', sound: 'G', options: ['G', 'C', 'Q'] },
    { letter: 'H', sound: 'H', options: ['H', 'N', 'M'] }
];

// Game 3: Memory Game Data
const memoryGameData = ['🐶', '🐱', '🐸', '🦋', '🐶', '🐱', '🐸', '🦋'];

// Utility Functions
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startTimer(gameNumber) {
    const timerId = `timer${gameNumber}`;
    let seconds = 0;
    
    gameTimers[gameNumber] = setInterval(() => {
        seconds++;
        document.getElementById(timerId).textContent = `Time: ${seconds}s`;
    }, 1000);
}

function stopTimer(gameNumber) {
    if (gameTimers[gameNumber]) {
        clearInterval(gameTimers[gameNumber]);
        const timerElement = document.getElementById(`timer${gameNumber}`);
        const timeText = timerElement.textContent;
        const seconds = parseInt(timeText.match(/\d+/)[0]);
        return seconds;
    }
    return 0;
}

function playAudio(gameType) {
    if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        synth.cancel();
        
        let text = '';
        if (gameType === 'game1') {
            const currentRound = assessmentData.game1.currentRound;
            if (currentRound < focusGameData.length) {
                text = focusGameData[currentRound].audio;
            }
        } else if (gameType === 'game2') {
            const currentRound = assessmentData.game2.currentRound;
            if (currentRound < letterGameData.length) {
                text = `Letter ${letterGameData[currentRound].sound}`;
                assessmentData.game2.needsRepetition++;
            }
        }
        
        if (text) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.7;
            utterance.pitch = 1.1;
            synth.speak(utterance);
        }
    }
}

function updateProgress(gameNumber, percentage) {
    const progressElement = document.getElementById(`progress${gameNumber}`);
    progressElement.style.width = `${percentage}%`;
}

function showFeedback(gameNumber, message, type) {
    const feedbackElement = document.getElementById(`feedback${gameNumber}`);
    feedbackElement.textContent = message;
    feedbackElement.className = `feedback ${type}`;
    
    setTimeout(() => {
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback';
    }, 2000);
}

// Assessment Flow Functions
function startAssessment() {
    showScreen('instructions-screen');
}

function restartAssessment() {
    // Reset all data
    assessmentData = {
        game1: { currentRound: 0, totalRounds: 5, correctAnswers: 0, totalTime: 0, responseTimes: [], attempts: [] },
        game2: { currentRound: 0, totalRounds: 8, correctAnswers: 0, totalTime: 0, responseTimes: [], needsRepetition: 0 },
        game3: { flippedCards: [], matchedPairs: 0, totalTime: 0, attempts: 0, mistakes: 0 }
    };
    
    // Clear timers
    Object.values(gameTimers).forEach(timer => clearInterval(timer));
    gameTimers = {};
    
    showScreen('welcome-screen');
}

// Game 1: Focus & Match Implementation
function startGame1() {
    showScreen('game1-screen');
    currentGame = 'game1';
    assessmentData.game1.currentRound = 0;
    startTimer(1);
    loadFocusRound();
}

function loadFocusRound() {
    const game = assessmentData.game1;
    if (game.currentRound >= game.totalRounds) {
        finishGame1();
        return;
    }

    const roundData = focusGameData[game.currentRound];
    const shuffledOptions = shuffleArray(roundData.options);
    
    const grid = document.getElementById('image-grid');
    grid.innerHTML = '';
    
    shuffledOptions.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.textContent = item;
        div.onclick = () => selectFocusItem(item, roundData.target);
        grid.appendChild(div);
    });

    updateProgress(1, (game.currentRound / game.totalRounds) * 100);
    
    // Auto-play audio after 1 second
    setTimeout(() => playAudio('game1'), 1000);
}

function selectFocusItem(selected, target) {
    const startTime = Date.now();
    const game = assessmentData.game1;
    
    game.attempts.push({
        round: game.currentRound,
        selected: selected,
        target: target,
        correct: selected === target,
        time: Date.now() - startTime
    });

    const items = document.querySelectorAll('.image-item');
    items.forEach(item => {
        item.onclick = null; // Disable further clicks
        if (item.textContent === selected) {
            item.classList.add(selected === target ? 'correct' : 'wrong');
        } else if (item.textContent === target && selected !== target) {
            item.classList.add('correct');
        }
    });

    if (selected === target) {
        game.correctAnswers++;
        showFeedback(1, '🎉 Great job! Well done! 🎉', 'success');
        speak('Excellent! Well done!');
    } else {
        showFeedback(1, `❌ Not quite! It was the ${target}`, 'error');
        speak('Try to focus more carefully next time!');
    }

    game.currentRound++;
    
    setTimeout(() => {
        if (game.currentRound < game.totalRounds) {
            loadFocusRound();
        } else {
            finishGame1();
        }
    }, 2500);
}

function finishGame1() {
    assessmentData.game1.totalTime = stopTimer(1);
    document.getElementById('next-btn1').style.display = 'block';
    updateProgress(1, 100);
}

// Game 2: Letter & Sound Implementation
function startGame2() {
    showScreen('game2-screen');
    currentGame = 'game2';
    assessmentData.game2.currentRound = 0;
    startTimer(2);
    loadLetterRound();
}

function loadLetterRound() {
    const game = assessmentData.game2;
    if (game.currentRound >= game.totalRounds) {
        finishGame2();
        return;
    }

    const roundData = letterGameData[game.currentRound];
    const shuffledOptions = shuffleArray(roundData.options);
    
    document.getElementById('letter-display').textContent = '?';
    
    const optionsContainer = document.getElementById('letter-options');
    optionsContainer.innerHTML = '';
    
    shuffledOptions.forEach(letter => {
        const button = document.createElement('button');
        button.className = 'letter-btn';
        button.textContent = letter;
        button.onclick = () => selectLetter(letter, roundData.letter);
        optionsContainer.appendChild(button);
    });

    updateProgress(2, (game.currentRound / game.totalRounds) * 100);
    
    // Auto-play audio after 1 second
    setTimeout(() => playAudio('game2'), 1000);
}

function selectLetter(selected, target) {
    const game = assessmentData.game2;
    
    const buttons = document.querySelectorAll('.letter-btn');
    buttons.forEach(btn => btn.onclick = null); // Disable further clicks

    if (selected === target) {
        game.correctAnswers++;
        document.getElementById('letter-display').textContent = target;
        showFeedback(2, '🎉 Perfect! That\'s correct! 🎉', 'success');
        speak('Perfect! That\'s the right letter!');
        
        // Highlight correct button
        buttons.forEach(btn => {
            if (btn.textContent === selected) {
                btn.style.background = '#4CAF50';
            }
        });
    } else {
        showFeedback(2, `❌ Not quite! It was "${target}"`, 'error');
        speak(`Not quite! It was ${target}`);
        
        // Highlight correct and wrong buttons
        buttons.forEach(btn => {
            if (btn.textContent === selected) {
                btn.style.background = '#f44336';
            } else if (btn.textContent === target) {
                btn.style.background = '#4CAF50';
            }
        });
    }

    game.currentRound++;
    
    setTimeout(() => {
        if (game.currentRound < game.totalRounds) {
            loadLetterRound();
        } else {
            finishGame2();
        }
    }, 2500);
}

function finishGame2() {
    assessmentData.game2.totalTime = stopTimer(2);
    document.getElementById('next-btn2').style.display = 'block';
    updateProgress(2, 100);
}

// Game 3: Memory Game Implementation
function startGame3() {
    showScreen('game3-screen');
    currentGame = 'game3';
    assessmentData.game3 = { flippedCards: [], matchedPairs: 0, totalTime: 0, attempts: 0, mistakes: 0 };
    startTimer(3);
    setupMemoryGame();
}

function setupMemoryGame() {
    const shuffledCards = shuffleArray(memoryGameData);
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    shuffledCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.textContent = '❓';
        card.onclick = () => flipCard(card);
        grid.appendChild(card);
    });

    updateProgress(3, 0);
}

function flipCard(card) {
    if (card.classList.contains('flipped') || card.classList.contains('matched') || 
        assessmentData.game3.flippedCards.length >= 2) {
        return;
    }

    card.classList.add('flipped');
    card.textContent = card.dataset.emoji;
    assessmentData.game3.flippedCards.push(card);
    assessmentData.game3.attempts++;

    if (assessmentData.game3.flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const game = assessmentData.game3;
    const [card1, card2] = game.flippedCards;

    if (card1.dataset.emoji === card2.dataset.emoji) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            
            game.matchedPairs++;
            document.getElementById('pairs-found').textContent = game.matchedPairs;
            
            showFeedback(3, '🎉 Great match! 🎉', 'success');
            speak('Great match!');
            
            if (game.matchedPairs === 4) {
                finishGame3();
            }
            
            game.flippedCards = [];
            updateProgress(3, (game.matchedPairs / 4) * 100);
        }, 1000);
    } else {
        // No match
        game.mistakes++;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.textContent = '❓';
            card2.textContent = '❓';
            game.flippedCards = [];
            
            showFeedback(3, '❌ Try again! Keep looking! ❌', 'error');
            speak('Try again! Remember where the pictures are!');
        }, 1500);
    }
}

function finishGame3() {
    assessmentData.game3.totalTime = stopTimer(3);
    document.getElementById('results-btn').style.display = 'block';
    updateProgress(3, 100);
}

// Results and Analysis
function showResults() {
    showScreen('results-screen');
    analyzeResults();
}

function analyzeResults() {
    const results = calculateAssessmentResults();
    displayResults(results);
}

function calculateAssessmentResults() {
    const game1 = assessmentData.game1;
    const game2 = assessmentData.game2;
    const game3 = assessmentData.game3;

    // Slow Learning Disability Assessment
    const focusScore = (game1.correctAnswers / game1.totalRounds) * 100;
    const avgResponseTime = game1.responseTimes.length > 0 ? 
        game1.responseTimes.reduce((a, b) => a + b, 0) / game1.responseTimes.length : 0;
    const attentionLevel = focusScore >= 80 ? 'good' : focusScore >= 60 ? 'fair' : 'needs-attention';

    // Dyslexia Assessment
    const letterScore = (game2.correctAnswers / game2.totalRounds) * 100;
    const repetitionRate = game2.needsRepetition / game2.totalRounds;
    const readingLevel = letterScore >= 75 ? 'good' : letterScore >= 50 ? 'fair' : 'needs-attention';

    // Cognitive Disability Assessment
    const memoryScore = (game3.matchedPairs / 4) * 100;
    const efficiencyScore = game3.attempts > 0 ? (game3.matchedPairs * 2) / game3.attempts * 100 : 0;
    const cognitiveLevel = memoryScore === 100 && efficiencyScore >= 60 ? 'good' : 
                         memoryScore >= 75 ? 'fair' : 'needs-attention';

    return {
        slowLearning: {
            score: Math.round(focusScore),
            level: attentionLevel,
            avgTime: Math.round(avgResponseTime / 1000) || 0,
            details: `Attention and processing speed assessment`
        },
        dyslexia: {
            score: Math.round(letterScore),
            level: readingLevel,
            repetitions: Math.round(repetitionRate * 100),
            details: `Letter recognition and sound matching`
        },
        cognitive: {
            score: Math.round(memoryScore),
            level: cognitiveLevel,
            attempts: game3.attempts,
            mistakes: game3.mistakes,
            details: `Memory and problem-solving skills`
        }
    };
}

function displayResults(results) {
    const resultsGrid = document.getElementById('results-grid');
    resultsGrid.innerHTML = `
        <div class="result-card">
            <h3 style="color: #4CAF50;">🎯 Focus & Attention</h3>
            <div class="result-score ${results.slowLearning.level}">${results.slowLearning.score}%</div>
            <p>${results.slowLearning.details}</p>
            <small>Average response: ${results.slowLearning.avgTime}s</small>
        </div>
        
        <div class="result-card">
            <h3 style="color: #2196F3;">📝 Reading Skills</h3>
            <div class="result-score ${results.dyslexia.level}">${results.dyslexia.score}%</div>
            <p>${results.dyslexia.details}</p>
            <small>Audio repetitions: ${results.dyslexia.repetitions}%</small>
        </div>
        
        <div class="result-card">
            <h3 style="color: #FF9800;">🧠 Memory & Logic</h3>
            <div class="result-score ${results.cognitive.level}">${results.cognitive.score}%</div>
            <p>${results.cognitive.details}</p>
            <small>Total attempts: ${results.cognitive.attempts}</small>
        </div>
    `;

    generateRecommendations(results);
}

function generateRecommendations(results) {
    const recommendations = document.getElementById('recommendations');
    let recs = [];

    // Focus/Attention recommendations
    if (results.slowLearning.level === 'needs-attention') {
        recs.push('🎯 Practice short, focused activities daily');
        recs.push('⏰ Use timers to build attention span gradually');
        recs.push('🎮 Try attention-building games and exercises');
    } else if (results.slowLearning.level === 'fair') {
        recs.push('🎯 Continue building focus with engaging activities');
        recs.push('📅 Maintain consistent learning routines');
    }

    // Reading/Dyslexia recommendations
    if (results.dyslexia.level === 'needs-attention') {
        recs.push('📚 Use dyslexia-friendly fonts and materials');
        recs.push('🔊 Incorporate audio learning and text-to-speech');
        recs.push('✏️ Practice letter sounds with multisensory methods');
    } else if (results.dyslexia.level === 'fair') {
        recs.push('📖 Continue phonics practice with visual supports');
        recs.push('🎵 Use songs and rhymes for letter learning');
    }

    // Cognitive recommendations
    if (results.cognitive.level === 'needs-attention') {
        recs.push('🧩 Start with simpler memory games and puzzles');
        recs.push('🔄 Practice patterns and sequence recognition');
        recs.push('🎨 Use visual aids and hands-on learning');
    } else if (results.cognitive.level === 'fair') {
        recs.push('🧠 Challenge with gradually complex problems');
        recs.push('🏆 Celebrate small wins to build confidence');
    }

    // General recommendations
    recs.push('👨‍👩‍👧‍👦 Involve family in learning activities');
    recs.push('🏫 Share results with teachers for personalized support');
    recs.push('📈 Regular practice with our learning games');

    recommendations.innerHTML = `
        <h3>📋 Personalized Recommendations</h3>
        <ul>
            ${recs.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    `;
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const synth = window.speechSynthesis;
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        synth.speak(utterance);
    }
}

function downloadResults() {
    const results = calculateAssessmentResults();
    const reportData = {
        date: new Date().toLocaleDateString(),
        assessment: 'Smart Start Assessment - Return 0',
        results: results,
        recommendations: document.getElementById('recommendations').innerText
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    speak('Assessment report downloaded successfully!');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Smart Start Assessment initialized');
});
