let soloMode = false;
let multiplayerMode = false;
let teams = [];
let teamScores = {};
let currentCategory = '';
let correctCount = 0;
let totalCount = 0;

let availableQuestions = [];
let usedQuestions = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch('https://opentdb.com/api_category.php')
    .then(res => res.json())
    .then(data => {
      const categoriesDiv = document.getElementById('categories');
      data.trivia_categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat.name;
        btn.onclick = () => selectCategory(cat.id, cat.name);
        categoriesDiv.appendChild(btn);
      });
    });
});

function startSolo() {
  soloMode = true;
  multiplayerMode = false;
  correctCount = 0;
  totalCount = 0;
  hideHomeScreen();
  showElement('categorySelection');
  updateScoreBoard();
}

function showMultiplayerSetup() {
  multiplayerMode = true;
  soloMode = false;
  teams = [];
  teamScores = {};
  hideHomeScreen();
  showElement('multiplayerSetup');
  document.getElementById('teamInputs').innerHTML = '';
  addTeamInput(); // Start with one input
}

function addTeamInput() {
  const container = document.getElementById('teamInputs');
  if (container.children.length < 5) {
    const input = document.createElement('input');
    input.placeholder = `Team ${container.children.length + 1} Name`;
    container.appendChild(input);
  }
}

function startMultiplayer() {
  const inputs = document.querySelectorAll('#teamInputs input');
  teams = Array.from(inputs).map(input => input.value.trim()).filter(name => name !== '');
  if (teams.length === 0) {
    alert("Enter at least one team name.");
    return;
  }
  teamScores = {};
  teams.forEach(name => teamScores[name] = 0);
  showElement('categorySelection');
  hideElement('multiplayerSetup');
  updateScoreBoard();
}

function selectCategory(id, name) {
  currentCategory = id;
  document.getElementById('categoryTitle').textContent = `Category: ${name}`;
  hideElement('categorySelection');
  showElement('questionSection');
  // Fetch a batch of questions for this category
  fetch(`https://opentdb.com/api.php?amount=20&category=${currentCategory}&type=multiple`)
    .then(res => res.json())
    .then(data => {
      availableQuestions = data.results.slice(); // Copy questions
      usedQuestions = [];
      loadNextQuestion();
    });
}

function loadNextQuestion() {
  document.getElementById('feedback').textContent = '';
  hideElement('nextButton');
  hideElement('teamSelector');
  if (availableQuestions.length === 0) {
    document.getElementById('questionText').textContent = "No more questions in this category!";
    document.getElementById('answerButtons').innerHTML = '';
    return;
  }
  // Pick a random question from availableQuestions
  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  const q = availableQuestions.splice(questionIndex, 1)[0];
  usedQuestions.push(q);

  document.getElementById('questionText').innerHTML = q.question;
  const answers = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
  const answerButtons = document.getElementById('answerButtons');
  answerButtons.innerHTML = '';
  answers.forEach(answer => {
    const btn = document.createElement('button');
    btn.innerHTML = answer;
    btn.onclick = () => handleAnswer(answer, q.correct_answer);
    answerButtons.appendChild(btn);
  });
}

function handleAnswer(selected, correct) {
  totalCount++;
  const feedback = document.getElementById('feedback');
  if (selected === correct) {
    correctCount++;
    feedback.textContent = '✅ Correct!';
    if (multiplayerMode) {
      showElement('teamSelector');
      const dropdown = document.getElementById('teamDropdown');
      dropdown.innerHTML = '';
      teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        dropdown.appendChild(option);
      });
    }
  } else {
    feedback.textContent = `❌ Wrong! Correct answer was: ${correct}`;
  }
  updateScoreBoard();
  showElement('nextButton');
}

function assignPoints() {
  const team = document.getElementById('teamDropdown').value;
  teamScores[team] += 1;
  updateScoreBoard();
  hideElement('teamSelector');
}

function updateScoreBoard() {
  const board = document.getElementById('scoreBoard');
  if (soloMode) {
    board.textContent = `Score: ${correctCount}/${totalCount}`;
  } else if (multiplayerMode) {
    board.innerHTML = '<h3>Team Scores:</h3>';
    teams.forEach(team => {
      board.innerHTML += `${team}: ${teamScores[team]}<br>`;
    });
  }
}

function showElement(id) {
  document.getElementById(id).classList.remove('hidden');
}
function hideElement(id) {
  document.getElementById(id).classList.add('hidden');
}

// Hide both the title and homeScreen buttons
function hideHomeScreen() {
  document.querySelector('h1').classList.add('hidden');
  document.getElementById('homeScreen').classList.add('hidden');
}

// Show both the title and homeScreen buttons
function showHomeScreen() {
  document.querySelector('h1').classList.remove('hidden');
  document.getElementById('homeScreen').classList.remove('hidden');
}

// HOME BUTTON FUNCTIONALITY
function goHome() {
  // Reset all state
  soloMode = false;
  multiplayerMode = false;
  teams = [];
  teamScores = {};
  currentCategory = '';
  correctCount = 0;
  totalCount = 0;
  availableQuestions = [];
  usedQuestions = [];
  // Hide all sections except home
  hideElement('categorySelection');
  hideElement('questionSection');
  hideElement('multiplayerSetup');
  showHomeScreen();
  updateScoreBoard();
  document.getElementById('feedback').textContent = '';
  document.getElementById('questionText').textContent = '';
  document.getElementById('answerButtons').innerHTML = '';
}