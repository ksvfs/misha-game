'use strict';

const GAME_DURATION = 20;
let currentPoints = 0;
let timeLeft = GAME_DURATION;
let gameOver = false;

let countdownInterval;
let gameInterval;
let gameTimeout;

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

  if (currentSrc === 'images/misha.webp') {
    currentPoints++;
    points.classList.add('stats__counter--glow-white');
  } else if (currentSrc === 'images/kirill.webp') {
    currentPoints = Math.max(currentPoints - 5, 0);
    points.classList.add('stats__counter--glow-red');
  }

  points.innerText = currentPoints;
  setTimeout(() => points.classList.remove('stats__counter--glow-white'), 300);
  setTimeout(() => points.classList.remove('stats__counter--glow-red'), 300);
}

function getHit(face) {
  const damageClass = getDamageClass(face);
  face.classList.add(damageClass);
  updatePoints(face);
  hideFace(face);
  setTimeout(() => face.classList.remove(damageClass), 100);
}

function getDamageClass(face) {
  const srcToDamageClassMap = {
    'images/misha.webp': 'field__face--white-damage',
    'images/kirill.webp': 'field__face--red-damage',
  };

  const currentSrc = face.getAttribute('src');
  return srcToDamageClassMap[currentSrc];
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
    if (face.classList.contains('field__face--shown')) {
      face.classList.remove('field__face--shown');
    }
  });
}

function showFace(face) {
  face.classList.add('field__face--shown');
  isShown[faces.indexOf(face)] = true;
}

function hideFace(face) {
  face.classList.remove('field__face--shown');
  isShown[faces.indexOf(face)] = false;
  lastHiddenFaces.push(faces.indexOf(face));
}

function switchSrc(face) {
  if (face.getAttribute('src') === 'images/kirill.webp')
    face.setAttribute('src', 'images/misha.webp');
  if (getRandomNumber(1, 10) === 1)
    face.setAttribute('src', 'images/kirill.webp');
}
