// === DBA Glossary Flip Cards ===

// Data: terms & definitions
const TERMS = [
  { term: "Ontology", def: "Assumptions about the nature of reality (objective vs. constructed)." },
  { term: "Epistemology", def: "Assumptions about how knowledge is created and validated." },
  { term: "Positivism", def: "Philosophy assuming objective truths can be measured and tested." },
  { term: "Interpretivism", def: "Philosophy assuming knowledge is constructed through human experience." },
  { term: "Pragmatism", def: "A practical philosophy often combining qualitative and quantitative methods." },
  { term: "Deductive Approach", def: "Testing existing theory with data." },
  { term: "Inductive Approach", def: "Building theory from observations and data." },
  { term: "Abductive Approach", def: "Iteratively moving between theory and data to develop explanations." },
  { term: "Case Study", def: "In-depth study of an organization, group, or event." },
  { term: "Survey", def: "Collecting data from a sample using questionnaires." },
  { term: "Action Research", def: "Solving a practical problem while simultaneously studying the process." },
  { term: "Cross-sectional Study", def: "Data collected at a single point in time." },
  { term: "Longitudinal Study", def: "Data collected from the same participants over time." },
  { term: "Mixed-Methods", def: "Combining qualitative and quantitative approaches." },
  { term: "Primary Data", def: "Data collected directly for the study." },
  { term: "Secondary Data", def: "Existing data (e.g., reports, archives) used for analysis." },
  { term: "Thematic Analysis", def: "Identifying patterns and themes in qualitative data." },
  { term: "Grounded Theory", def: "Developing theories from data through iterative coding." },
  { term: "Content Analysis", def: "Systematic coding and interpretation of text, media, or documents." },
  { term: "Triangulation", def: "Using multiple methods or data sources to strengthen findings." },
  { term: "Validity", def: "The extent to which you measure what you intend to measure." },
  { term: "Reliability", def: "Consistency of a measure or research results across time/conditions." },
  { term: "Generalizability", def: "Extent to which findings apply beyond the study sample." },
  { term: "Bias", def: "Systematic error that may distort findings." },
  { term: "Abstract", def: "Concise summary of the study, methods, findings, and implications." },
  { term: "Problem Statement", def: "Clear articulation of the issue being studied." },
  { term: "Research Question (RQ)", def: "Specific question(s) guiding the research." },
  { term: "Hypothesis", def: "Testable prediction about relationships between variables." },
  { term: "Variables", def: "Elements studied (independent, dependent, control)." },
  { term: "Conceptual Framework", def: "Theoretical model showing relationships among key concepts." },
  { term: "Contribution to Knowledge", def: "How the study advances academic understanding." },
  { term: "Contribution to Practice", def: "How findings help solve real-world problems." },
  { term: "Limitations", def: "Boundaries and weaknesses of the study." },
  { term: "Delimitations", def: "Scope choices defined by the researcher." },
  { term: "Ethics", def: "Standards ensuring responsible research conduct (e.g., consent, privacy)." },
  { term: "Reflexivity", def: "Researcher’s reflection on their own influence in the study." }
];

// Utility: shuffle array (Fisher-Yates)
function shuffle(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// State
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let totalPairs = 12;
let timerInterval = null;
let startTime = null;

// Elements
const board = document.getElementById('board');
const newGameBtn = document.getElementById('newGameBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const pairCountSel = document.getElementById('pairCount');
const timeEl = document.getElementById('time');
const movesEl = document.getElementById('moves');
const matchesEl = document.getElementById('matches');
const totalPairsEl = document.getElementById('totalPairs');
const winDialog = document.getElementById('winDialog');
const sumTimeEl = document.getElementById('sumTime');
const sumMovesEl = document.getElementById('sumMoves');
const playAgainBtn = document.getElementById('playAgainBtn');
const studyToggle = document.getElementById('studyModeToggle');

// Study mode elements
const studySection = document.getElementById('studySection');
const gameSection = document.getElementById('gameSection');
const flashcard = document.getElementById('flashcard');
const flashTerm = document.getElementById('flashTerm');
const flashDef = document.getElementById('flashDef');
const flipBtn = document.getElementById('flipBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const shuffleStudyBtn = document.getElementById('shuffleStudyBtn');
const showDefFirst = document.getElementById('showDefFirst');

let studyIndex = 0;
let studyDeck = shuffle(TERMS);

// Timer
function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(updateTimer, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}
function updateTimer() {
  const diff = Math.floor((new Date() - startTime) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  timeEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
}

// Build deck for game
function buildDeck(nPairs) {
  const terms = shuffle(TERMS).slice(0, nPairs);
  const deck = [];
  terms.forEach((t, idx) => {
    const id = `${t.term}-${idx}`;
    deck.push({ id, kind: 'term', text: t.term, full: t });
    deck.push({ id, kind: 'def', text: t.def, full: t });
  });
  return shuffle(deck);
}

// Render board
function renderBoard(nPairs) {
  board.innerHTML = '';
  const deck = buildDeck(nPairs);
  deck.forEach((cardData, idx) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.setAttribute('role', 'gridcell');
    card.setAttribute('aria-label', cardData.kind === 'term' ? `Term: ${cardData.text}` : `Definition`);
    card.setAttribute('data-id', cardData.id);
    card.setAttribute('data-kind', cardData.kind);
    card.setAttribute('data-index', String(idx));
    card.tabIndex = 0;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    front.innerHTML = `
      <div class="face-label">${cardData.kind === 'term' ? 'TERM' : 'DEFINITION'}</div>
      <div class="face-content ${cardData.kind === 'term' ? 'term' : ''}">${cardData.text}</div>
    `;

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    back.innerHTML = `
      <div class="face-label">DBA</div>
      <div class="face-content">Tap to reveal</div>
    `;

    inner.appendChild(back);
    inner.appendChild(front);
    card.appendChild(inner);

    card.addEventListener('click', () => handleFlip(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip(card);
      }
    });

    board.appendChild(card);
  });
}

// Flip logic
function handleFlip(cardEl) {
  if (lockBoard || cardEl.classList.contains('matched')) return;
  // Start timer on first move
  if (!startTime) startTimer();

  cardEl.classList.add('flipped');

  if (!firstCard) {
    firstCard = cardEl;
    return;
  }
  if (cardEl === firstCard) return; // Prevent double-clicking the same card

  secondCard = cardEl;
  moves += 1;
  movesEl.textContent = moves.toString();

  checkMatch();
}

function checkMatch() {
  const id1 = firstCard.getAttribute('data-id');
  const id2 = secondCard.getAttribute('data-id');
  const kind1 = firstCard.getAttribute('data-kind');
  const kind2 = secondCard.getAttribute('data-kind');

  const isMatch = id1 === id2 && kind1 !== kind2;
  if (isMatch) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.setAttribute('aria-label', 'Matched');
    secondCard.setAttribute('aria-label', 'Matched');
    resetTurn(true);
    matches += 1;
    matchesEl.textContent = matches.toString();
    if (matches === totalPairs) {
      stopTimer();
      sumTimeEl.textContent = timeEl.textContent;
      sumMovesEl.textContent = moves.toString();
      if (typeof winDialog.showModal === 'function') {
        winDialog.showModal();
      } else {
        alert(`Nice work! Time: ${timeEl.textContent}, Moves: ${moves}`);
      }
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn(false);
    }, 850);
  }
}

function resetTurn(matched) {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// New game
function newGame() {
  stopTimer();
  timeEl.textContent = '0:00';
  moves = 0;
  matches = 0;
  movesEl.textContent = '0';
  matchesEl.textContent = '0';
  startTime = null;
  totalPairs = parseInt(pairCountSel.value, 10);
  totalPairsEl.textContent = totalPairs.toString();
  renderBoard(totalPairs);
}

newGameBtn.addEventListener('click', newGame);
playAgainBtn.addEventListener('click', (e) => {
  e.preventDefault();
  winDialog.close();
  newGame();
});
shuffleBtn.addEventListener('click', () => {
  // Shuffle the current selection of pairs
  newGame();
});
resetStatsBtn.addEventListener('click', () => {
  timeEl.textContent = '0:00';
  movesEl.textContent = '0';
  matchesEl.textContent = '0';
});
pairCountSel.addEventListener('change', () => newGame());

// Study Mode
function renderStudyCard() {
  const item = studyDeck[studyIndex];
  flashTerm.textContent = item.term;
  flashDef.textContent = item.def;
  // orientation
  const wantDefFirst = showDefFirst.checked;
  flashcard.classList.toggle('flipped', wantDefFirst);
}

function nextStudy() {
  studyIndex = (studyIndex + 1) % studyDeck.length;
  renderStudyCard();
  flashcard.classList.remove('flipped');
}
function prevStudy() {
  studyIndex = (studyIndex - 1 + studyDeck.length) % studyDeck.length;
  renderStudyCard();
  flashcard.classList.remove('flipped');
}

flipBtn.addEventListener('click', () => {
  flashcard.classList.toggle('flipped');
});
nextBtn.addEventListener('click', nextStudy);
prevBtn.addEventListener('click', prevStudy);
shuffleStudyBtn.addEventListener('click', () => {
  studyDeck = shuffle(TERMS);
  studyIndex = 0;
  renderStudyCard();
});
showDefFirst.addEventListener('change', renderStudyCard);

flashcard.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key.toLowerCase() === 'f') {
    e.preventDefault();
    flashcard.classList.toggle('flipped');
  } else if (e.key === 'ArrowRight') {
    nextStudy();
  } else if (e.key === 'ArrowLeft') {
    prevStudy();
  }
});

studyToggle.addEventListener('change', (e) => {
  const on = studyToggle.checked;
  if (on) {
    gameSection.classList.add('hidden');
    studySection.classList.remove('hidden');
    renderStudyCard();
    flashcard.focus();
  } else {
    studySection.classList.add('hidden');
    gameSection.classList.remove('hidden');
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  newGame();
  renderStudyCard();
});
