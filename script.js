// Sistema de Login e Cadastro
const users = JSON.parse(localStorage.getItem('users')) || [
    { username: 'Admin', password: '123456', role: 'admin' }
];

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = 'gamificacao.html';
    } else {
        document.getElementById('login-message').textContent = 'Usuário ou senha incorretos.';
    }
}

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const user = { username, password, role: 'guest' };

    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('register-message').textContent = 'Usuário cadastrado com sucesso.';
}

// Gamificações
function setupScratchCard() {
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    const message = Math.random() > 0.5 ? 'Ganhou!' : 'Não ganhou!';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.font = '30px Arial';
    ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2 + 10);

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ccc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    resetResult();
}

function startDrawing(e) {
    this.isDrawing = true;
    this.lastX = e.offsetX;
    this.lastY = e.offsetY;
}

function draw(e) {
    if (!this.isDrawing) return;

    const ctx = e.target.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [this.lastX, this.lastY] = [e.offsetX, e.offsetY];

    checkScratchCompletion();
}

function stopDrawing(e) {
    this.isDrawing = false;
}

function checkScratchCompletion() {
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let scratched = 0;
    for (let i = 3; i < imageData.length; i += 4) {
        if (imageData[i] === 0) scratched++;
    }
    const scratchedPercentage = (scratched / (canvas.width * canvas.height)) * 100;
    if (scratchedPercentage > 50) revealResult();
}

function revealResult() {
    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    document.getElementById('result').classList.remove('hidden');
    const message = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data[3] === 0 ? 'Ganhou!' : 'Não ganhou!';
    document.getElementById('resultMessage').textContent = message;

    // Salvar resultado no Local Storage
    const user = JSON.parse(localStorage.getItem('user'));
    let results = JSON.parse(localStorage.getItem('results')) || [];
    results.push({ username: user.username, game: 'raspadinha', result: message });
    localStorage.setItem('results', JSON.stringify(results));
}

function resetScratchCard() {
    setupScratchCard();
}

let currentQuizQuestion = 0;
const questions = [
    {
        question: 'Qual é o principal ingrediente da Caipirinha?',
        options: ['Vodka', 'Rum', 'Cachaça', 'Tequila'],
        answer: 'Cachaça'
    },
    {
        question: 'Qual fruta é tradicionalmente usada na Caipirinha?',
        options: ['Laranja', 'Limão', 'Morango', 'Abacaxi'],
        answer: 'Limão'
    },
    {
        question: 'Qual é o principal ingrediente do drink Rabo de Galo?',
        options: ['Vodka', 'Cachaça', 'Rum', 'Gin'],
        answer: 'Cachaça'
    },
    {
        question: 'Qual é o ingrediente principal do drink Batida de Coco?',
        options: ['Leite', 'Cachaça', 'Rum', 'Tequila'],
        answer: 'Cachaça'
    },
    {
        question: 'Qual fruta é usada no drink Batida de Maracujá?',
        options: ['Maracujá', 'Limão', 'Laranja', 'Morango'],
        answer: 'Maracujá'
    },
    {
        question: 'Qual é o principal ingrediente do drink Quentão?',
        options: ['Cachaça', 'Vinho', 'Rum', 'Tequila'],
        answer: 'Cachaça'
    }
];

function startQuiz() {
    currentQuizQuestion = 0;
    showNextQuestion();
}

function showNextQuestion() {
    const question = questions[currentQuizQuestion];
    document.getElementById('quiz-question').textContent = question.question;
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option);
        optionsContainer.appendChild(button);
    });
    optionsContainer.classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
}

function checkAnswer(selected) {
    const question = questions[currentQuizQuestion];
    const result = document.getElementById('quiz-result');
    if (selected === question.answer) {
        result.textContent = 'Correto!';
    } else {
        result.textContent = 'Errado!';
    }
    result.classList.remove('hidden');

    // Salvar resultado no Local Storage
    const user = JSON.parse(localStorage.getItem('user'));
    let results = JSON.parse(localStorage.getItem('results')) || [];
    results.push({ username: user.username, game: 'quiz', question: question.question, selected, correct: question.answer });
    localStorage.setItem('results', JSON.stringify(results));

    currentQuizQuestion++;
    if (currentQuizQuestion < questions.length) {
        setTimeout(showNextQuestion, 1000);
    } else {
        result.textContent += ' Quiz concluído!';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('gamificacao.html')) {
        setupScratchCard();
    }
});
