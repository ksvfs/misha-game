'use strict';

const GAME_DURATION = 20;

let currentPoints = 0;
let gameOver = false;
let timeLeft;

let countdownInterval;
let gameInterval;
let gameTimeout;

const MISHA_SRC = 'images/misha.webp';
const KIRILL_SRC = 'images/kirill.webp';

const SRC_TO_DAMAGE_CLASS = {
  [MISHA_SRC]: 'field__face--white-damage',
  [KIRILL_SRC]: 'field__face--red-damage',
};

const WHITE_GLOW_CLASS = 'stats__counter--glow-white';
const RED_GLOW_CLASS = 'stats__counter--glow-red';
const FACE_SHOWN_CLASS = 'field__face--shown';

const faces = [...document.querySelectorAll('.field__face')];
const timer = document.querySelector('#timer');
const points = document.querySelector('#points');
const restartButton = document.querySelector('.restart__btn');
const record = document.querySelector('.record__points');

const isShown = Array(9).fill(false);
const lastHiddenFaces = [];

window.addEventListener('load', startGame);
faces.forEach((face) => face.addEventListener('click', () => getHit(face)));
restartButton.addEventListener('click', restartGame);
document.addEventListener('keyup', (event) => {
  if (event.code === 'Space') restartGame();
});
window.addEventListener('DOMContentLoaded', updateRecord);

function getRandomNumber(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function startGame() {
  setupGame();
  startIntervals();
  gameTimeout = setTimeout(() => endGame(), GAME_DURATION * 1000);
}

function setupGame() {
  gameOver = false;
  timeLeft = GAME_DURATION;
  currentPoints = 0;
  timer.innerText = timeLeft;
  points.innerText = currentPoints;
}

function startIntervals() {
  countdownInterval = setInterval(() => {
    timeLeft--;
    timer.innerText = timeLeft;
  }, 1000);

  gameInterval = setInterval(() => {
    showAndHideFace();
  }, getRandomNumber(400, 800));
}

function endGame() {
  gameOver = true;

  clearInterval(countdownInterval);
  clearInterval(gameInterval);
  clearTimeout(gameTimeout);

  hideAllFaces();

  saveRecord();
  updateRecord();
}

function restartGame() {
  if (!gameOver) endGame();
  startGame();
}

function saveRecord() {
  localStorage.setItem(
    'record',
    Math.max(currentPoints, Number(localStorage.getItem('record') || 0))
  );
}

function updateRecord() {
  record.innerText = localStorage.getItem('record') || 0;
}

function updatePoints(face) {
  const currentSrc = face.getAttribute('src');

  if (currentSrc === MISHA_SRC) {
    currentPoints++;
    points.classList.add(WHITE_GLOW_CLASS);
  } else if (currentSrc === KIRILL_SRC) {
    currentPoints = Math.max(currentPoints - 5, 0);
    points.classList.add(RED_GLOW_CLASS);
  }

  points.innerText = currentPoints;
  setTimeout(() => points.classList.remove(WHITE_GLOW_CLASS), 300);
  setTimeout(() => points.classList.remove(RED_GLOW_CLASS), 300);
}

function getHit(face) {
  const currentSrc = face.getAttribute('src');
  const damageClass = SRC_TO_DAMAGE_CLASS[currentSrc];
  face.classList.add(damageClass);
  updatePoints(face);
  hideFace(face);
  setTimeout(() => face.classList.remove(damageClass), 100);
}

function showAndHideFace() {
  const face = getRandomFace();
  switchSrc(face);
  showFace(face);
  setTimeout(() => {
    if (isShown[faces.indexOf(face)]) hideFace(face);
  }, getRandomNumber(300, 2000));
}

function getRandomFace() {
  const threeLastHiddenFaces = lastHiddenFaces.slice(-3);
  const availableFaces = faces.filter(
    (_, index) => !threeLastHiddenFaces.includes(index) && !isShown[index]
  );
  const randomIndex = getRandomNumber(0, availableFaces.length - 1);
  lastHiddenFaces.push(randomIndex);
  return availableFaces[randomIndex];
}

function hideAllFaces() {
  faces.forEach((face) => {
    if (face.classList.contains(FACE_SHOWN_CLASS)) {
      face.classList.remove(FACE_SHOWN_CLASS);
    }
  });
}

function showFace(face) {
  face.classList.add(FACE_SHOWN_CLASS);
  isShown[faces.indexOf(face)] = true;
}

function hideFace(face) {
  face.classList.remove(FACE_SHOWN_CLASS);
  isShown[faces.indexOf(face)] = false;
  lastHiddenFaces.push(faces.indexOf(face));
}

function switchSrc(face) {
  if (face.getAttribute('src') === KIRILL_SRC)
    face.setAttribute('src', MISHA_SRC);
  if (getRandomNumber(1, 10) === 1) face.setAttribute('src', KIRILL_SRC);
}
