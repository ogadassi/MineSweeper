"use strict";
const MINE = "💣";
const SHOWN = ".";
const MARKED = "🚩";
let gCount;
let gLives = 1;
let gBoard;
let gIsGameOn = true;
let gShownCells = 0;
let gIsFirstClick = true;
let gMarkedBombs = 0;
let gClickedBombs = 0;
let gLevel = {
  SIZE: 4,
  MINES: 2,
};

function onInit() {
  gBoard = createBoard(gLevel.SIZE);
  renderBoard(gBoard);
}
function getDifficulty(elBtn) {
  let clearColor = document.querySelectorAll(".diff");
  for (let i = 0; i < clearColor.length; i++) {
    clearColor[i].style.backgroundColor = "";
  }
  let diff = elBtn.classList;
  if (diff.contains("diff1")) {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    gBoard = createBoard(gLevel.SIZE);
    onRestart();
  } else if (diff.contains("diff2")) {
    gLevel.SIZE = 8;
    gLevel.MINES = 14;
    gBoard = createBoard(gLevel.SIZE);
    onRestart();
  } else if (diff.contains("diff3")) {
    gLevel.SIZE = 12;
    gLevel.MINES = 32;
    gBoard = createBoard(gLevel.SIZE);
    onRestart();
  }
  elBtn.style.backgroundColor = "rgb(184, 236, 219)";
  gCount = 1;
  renderBoard(gBoard);
  onInit();
}

function createBoard() {
  const board = [];
  for (let i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < gLevel.SIZE; j++) {
      let cell = {
        isMine: 0,
        isMarked: false,
        minesAroundCount: 0,
      };
      board[i][j] = cell;
    }
  }
  return board;
}

function renderBoard(board) {
  let strHTML = "";
  for (let i = 0; i < board.length; i++) {
    strHTML += "<tr>";
    for (let j = 0; j < board[0].length; j++) {
      let cellContent = "";
      strHTML += `<td class='row${i}-col${j}' oncontextmenu="onMarkCell(event, this, ${i}, ${j})" onclick="onCellClicked(this, ${i}, ${j})">${cellContent}</td>`;
    }
    strHTML += "</tr>";
  }
  const elContainer = document.querySelector(".board");
  elContainer.innerHTML = strHTML;
}

function setMinesNegsCount(gBoard, rowIdx, colIdx) {
  gCount = 0;
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue;
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (i === rowIdx && j === colIdx) continue;
      if (j < 0 || j >= gLevel.SIZE) continue;
      let currCell = gBoard[i][j];
      if (currCell.isMine) gCount++;
    }
  }
  return gCount;
}

function onCellClicked(elCell, i, j) {
  if (gIsGameOn) {
    const cell = gBoard[i][j];
    if (gIsFirstClick) {
      setMines(gBoard, i, j);
      for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
          gBoard[i][j].minesAroundCount = setMinesNegsCount(gBoard, i, j);
        }
      }
      gIsFirstClick = false;
    }

    if (cell.isShown) return;
    if (cell.isMarked) return;

    if (!cell.isMine) {
      elCell.style.backgroundColor = "white";
    }
    if (!cell.isMine && cell.minesAroundCount > 0)
      elCell.innerText = cell.minesAroundCount;
    if (!cell.isMine && !cell.isShown) {
      cell.isShown = true;
      gShownCells++;
      // If the clicked cell has no mines around it, reveal its neighbors recursively
      if (cell.minesAroundCount === 0) {
        revealEmptyNeighbors(gBoard, i, j);
      }
    }
    if (cell.isMine && cell.isShown) return;
    if (cell.isMine) {
      cell.isShown = true;
      elCell.innerText = "💣";
      gLives--;
      gClickedBombs++;
      if (gLives === 0) gameOver();
    }

    detectWin();
  }
}

function onMarkCell(event, elCell, i, j) {
  if (!gIsGameOn) return;
  event.preventDefault();
  const cell = gBoard[i][j];
  if (cell.isShown) return;
  if (cell.isMarked) {
    elCell.innerText = "";
    cell.isMarked = false;
    if (cell.isMine) gMarkedBombs--;
  } else {
    elCell.innerText = MARKED;
    cell.isMarked = true;
    if (cell.isMine) gMarkedBombs++;
  }
  detectWin();
}

function revealBombs(lost) {
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[i].length; j++) {
      if (gBoard[i][j].isMine) {
        let elCell = document.querySelector(".row" + i + "-col" + j);
        elCell.innerText = "💣";
        if (lost) elCell.style.backgroundColor = "rgb(157, 62, 62)";
      }
    }
  }
}

function detectWin() {
  if (
    gShownCells === gLevel.SIZE ** 2 - gLevel.MINES &&
    gMarkedBombs === gLevel.MINES - gClickedBombs
  ) {
    let elEmoji = document.querySelector(".emoji");
    elEmoji.innerText = "😎";
    gIsGameOn = false;
    revealBombs(false);
  }
}

function gameOver() {
  gIsGameOn = false;
  let elEmoji = document.querySelector(".emoji");
  elEmoji.innerText = "🤯";
  revealBombs(true);
}

function onRestart() {
  gIsGameOn = true;
  let elEmoji = document.querySelector(".emoji");
  elEmoji.innerText = "😀";
  gMarkedBombs = 0;
  gShownCells = 0;
  gClickedBombs = 0;
  gLives = 1;
  gIsFirstClick = true;
  onInit();
}

function setMines(board, firstClickI, firstClickJ) {
  var minesCount = 0;
  while (minesCount < gLevel.MINES) {
    var i = getRandomInt(0, board.length);
    var j = getRandomInt(0, board[0].length);
    // Ensure that the cell and its neighbors are safe
    if (
      !(Math.abs(i - firstClickI) <= 1 && Math.abs(j - firstClickJ) <= 1) &&
      !board[i][j].isMine
    ) {
      board[i][j].isMine = true;
      minesCount++;
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function revealEmptyNeighbors(board, rowIdx, colIdx) {
  for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i >= gLevel.SIZE) continue;
    for (let j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j >= gLevel.SIZE) continue;
      if (i === rowIdx && j === colIdx) continue;

      let cell = board[i][j];

      // If the cell is already shown or marked, continue to the next neighbor
      if (cell.isShown || cell.isMarked) continue;

      // If the cell has no mines around it, reveal it and recursively reveal its neighbors
      if (cell.minesAroundCount === 0) {
        let elCell = document.querySelector(`.row${i}-col${j}`);
        elCell.style.backgroundColor = "white";
        cell.isShown = true;
        gShownCells++;
        revealEmptyNeighbors(board, i, j); // Recursively reveal neighbors
      } else {
        // If the cell has mines around it, reveal it but don't explore its neighbors
        let elCell = document.querySelector(`.row${i}-col${j}`);
        elCell.style.backgroundColor = "white";
        elCell.innerText = cell.minesAroundCount;
        cell.isShown = true;
        gShownCells++;
      }
    }
  }
}
