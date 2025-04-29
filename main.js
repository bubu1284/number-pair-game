const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const scoreValue = document.getElementById("score-value");


const cols = 10, rows = 16, cellSize = 40;
canvas.width = cols * cellSize;
canvas.height = rows * cellSize;

let grid = [], removedCells = [], score = 0, timeLeft = 120;
let gameOver = false, selecting = false;
let selectStart = null, selectEnd = null;
let startTime = null;
let lastDrawTime = 0;

const bgm = document.getElementById("bgm");
const clickSound = document.getElementById("click-sound");

function playClickSound() {
  const sound = clickSound.cloneNode(true);
  sound.play().catch(() => {});
}

function generateGrid() {
  for (let r = 0; r < rows; r++) {
    grid[r] = grid[r] || [];
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] == null && !removedCells.some(([rr, cc]) => rr === r && cc === c)) {
        grid[r][c] = Math.floor(Math.random() * 9) + 1;
      }
    }
  }
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      ctx.fillStyle = "#189A30";
      ctx.fillRect(x, y, cellSize, cellSize);

      if (grid[r][c] != null) {
        ctx.fillStyle = "#fff";
		ctx.strokeStyle = "#000"; // 黑色描边
		ctx.lineWidth = 2; // 描边宽度
        ctx.font = "bold 20px arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(grid[r][c], x + cellSize / 2, y + cellSize / 2);
      }

      ctx.strokeStyle = "#024f09";
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  if (selecting && selectStart && selectEnd) {
    const x1 = Math.min(selectStart.x, selectEnd.x);
    const y1 = Math.min(selectStart.y, selectEnd.y);
    const w = Math.abs(selectEnd.x - selectStart.x);
    const h = Math.abs(selectEnd.y - selectStart.y);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, w, h);
  }
}

function handleSelection() {
  if (!selectStart || !selectEnd) return;

  const col1 = Math.floor(selectStart.x / cellSize);
  const row1 = Math.floor(selectStart.y / cellSize);
  const col2 = Math.floor(selectEnd.x / cellSize);
  const row2 = Math.floor(selectEnd.y / cellSize);

  const rowMin = Math.min(row1, row2);
  const rowMax = Math.max(row1, row2);
  const colMin = Math.min(col1, col2);
  const colMax = Math.max(col1, col2);

  let selected = [], total = 0;
  for (let r = rowMin; r <= rowMax; r++) {
    for (let c = colMin; c <= colMax; c++) {
      if (grid[r][c] != null) {
        selected.push([r, c]);
        total += grid[r][c];
      }
    }
  }

  if (selected.length >= 2 && total === 10) {
    selected.forEach(([r, c]) => {
      grid[r][c] = null;
      removedCells.push([r, c]);
    });
    score += 10;
    playClickSound();
    generateGrid();
    updateUI();
  }

  selectStart = selectEnd = null;
}

function updateUI() {
  scoreValue.textContent = score;
  timerDisplay.textContent = `${timeLeft}s`;
}

function updateTime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  timeLeft = Math.max(0, 120 - elapsed);
  updateUI();

  if (timeLeft <= 0 && !gameOver) {
    gameOver = true;
    bgm.pause();
    alert(`游戏结束！得分：${score}`);
    // setTimeout(resetGame, 1000); // 1秒后自动重启
  }
}


function resetGame() {
  score = 0;
  timeLeft = 120;
  grid = [];
  removedCells = [];
  gameOver = false;
  selecting = false;
  selectStart = null;
  selectEnd = null;
  startTime = Date.now();
  generateGrid();
  drawGrid();
  updateUI();
  bgm.play();
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (timestamp - lastDrawTime > 33) { // ~30 FPS
    updateTime();
    drawGrid();
    lastDrawTime = timestamp;
  }
  if (!gameOver) requestAnimationFrame(gameLoop);
}

// 事件绑定
canvas.addEventListener("mousedown", e => {
  if (!startTime) {
    startTime = Date.now();
    bgm.play();
    requestAnimationFrame(gameLoop);
  }
  const rect = canvas.getBoundingClientRect();
  selectStart = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  selecting = true;
});

canvas.addEventListener("mousemove", e => {
  if (!selecting) return;
  const rect = canvas.getBoundingClientRect();
  selectEnd = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});

canvas.addEventListener("mouseup", () => {
  selecting = false;
  handleSelection();
});

generateGrid();
drawGrid();
updateUI();
