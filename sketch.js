let questionTable;
let allQuestions = [];
let quizQuestions = []; // 儲存本次測驗的題目（會從最多10題中抽取5題）
let currentQuestionIndex = 0;
let score = 0;
let gameState = 'START'; // 遊戲狀態: START, QUESTION, FEEDBACK, RESULT

// 按鈕物件
let answerButtons = [];
let startButton, restartButton;

// 互動效果
let particles = [];
let feedbackMessage = '';
let feedbackColor;
let feedbackTimer = 0;
let fireworks = []; // 新增：煙火陣列

function preload() {
  // 載入 CSV 檔案，指定 'csv' 格式且沒有標頭
  questionTable = loadTable('questions.csv', 'csv');
}

function setup() {
  createCanvas(800, 600);
  processData();
  setupButtons();
  setupParticles();
  startGame();
}

function draw() {
  // 深色背景（主畫面會在 START 時被覆蓋成海灘）
  background(10, 20, 40);
  drawParticles();

  // 根據不同的遊戲狀態繪製不同畫面
  switch (gameState) {
    case 'START':
      drawStartScreen();
      break;
    case 'QUESTION':
      drawQuestionScreen();
      break;
    case 'FEEDBACK':
      drawFeedbackScreen();
      break;
    case 'RESULT':
      drawResultScreen();
      break;
  }
}

// ---------------------------------
// 遊戲流程函數
// ---------------------------------

// 1. 處理CSV資料
function processData() {
  // 遍歷 CSV 的每一行
  for (let row of questionTable.getRows()) {
    allQuestions.push({
      question: row.getString(0),
      opA: row.getString(1),
      opB: row.getString(2),
      opC: row.getString(3),
      opD: row.getString(4),
      correct: row.getString(5) // 儲存 'A', 'B', 'C', or 'D'
    });
  }
}

// 2. 設定按鈕位置
function setupButtons() {
  // 開始按鈕
  startButton = { x: width / 2 - 100, y: height / 2 + 120, w: 200, h: 60, text: '開始測驗' };
  // 重新開始按鈕
  restartButton = { x: width / 2 - 100, y: height / 2 + 150, w: 200, h: 60, text: '重新開始' };

  // 四個答案按鈕
  let btnW = 350;
  let btnH = 80;
  let gap = 20;
  answerButtons.push({ x: 40, y: 250, w: btnW, h: btnH, option: 'A' });
  answerButtons.push({ x: 40 + btnW + gap, y: 250, w: btnW, h: btnH, option: 'B' });
  answerButtons.push({ x: 40, y: 250 + btnH + gap, w: btnW, h: btnH, option: 'C' });
  answerButtons.push({ x: 40 + btnW + gap, y: 250 + btnH + gap, w: btnW, h: btnH, option: 'D' });
}

// 3. 開始或重新開始遊戲
function startGame() {
  score = 0;
  currentQuestionIndex = 0;
  // 先從題庫隨機抽取最多10題，再從這個 pool 中隨機選 5 題作為本次測驗
  let poolSize = min(10, allQuestions.length);
  let pool = shuffle(allQuestions).slice(0, poolSize);
  let take = min(5, pool.length);
  quizQuestions = shuffle(pool).slice(0, take);
  gameState = 'START';
  fireworks = []; // 清除煙火
}

// 4. 檢查答案
function checkAnswer(selectedOption) {
  let correctOption = quizQuestions[currentQuestionIndex].correct;

  if (selectedOption === correctOption) {
    score++;
    feedbackMessage = '答對了！';
    feedbackColor = color(0, 200, 100, 220); // 綠色
  } else {
    feedbackMessage = `答錯了... 正確答案是 ${correctOption}`;
    feedbackColor = color(200, 50, 50, 220); // 紅色
  }
  
  gameState = 'FEEDBACK';
  feedbackTimer = 90; // 顯示回饋 1.5 秒 (60fps * 1.5)
}

// 5. 進入下一題
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex >= quizQuestions.length) {
    gameState = 'RESULT';
  } else {
    gameState = 'QUESTION';
  }
}

// 6. 取得回饋用語
function getFeedbackText() {
  // 根據答對題數回傳指定文案（針對 0~5 題皆有對應）
  switch (score) {
    case 0:
      return '菜，就多練';
    case 1:
      return '路邊的野狗會拿筆考得都比你好';
    case 2:
      return '用臉在鍵盤上滾一圈才會考這麼爛';
    case 3:
      return '一坨答辯';
    case 4:
      return 'just so so';
    case 5:
      return '你牛逼';
    default:
      if (score > 5) return '你牛逼';
      return '別灰心，再試一次吧！';
  }
}

// ---------------------------------
// 畫面繪製函數
// ---------------------------------

function drawStartScreen() {
  // 海灘背景：天空漸層、太陽、海浪、沙灘、遮陽傘與椰子樹
  // 天空漸層
  for (let y = 0; y < height * 0.6; y++) {
    let t = map(y, 0, height * 0.6, 0, 1);
    let c = lerpColor(color(135, 206, 250), color(70, 160, 240), t);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
  // 太陽
  fill(255, 220, 0);
  ellipse(width - 120, 100, 120, 120);
  // 海面
  fill(25, 130, 200);
  rect(0, height * 0.45, width, height * 0.25);
  // 波浪（簡單的白色弧）
  fill(255, 255, 255, 80);
  for (let i = -50; i < width + 50; i += 60) {
    arc(i, height * 0.45 + 20, 120, 40, PI, TWO_PI);
  }
  // 沙灘
  fill(240, 200, 120);
  rect(0, height * 0.7, width, height * 0.3);

  // 簡單的椰子樹（右下）
  push();
  translate(width - 180, height * 0.7 + 20);
  fill(120, 70, 20);
  rect(-10, 0, 20, 120, 10);
  fill(30, 120, 40);
  for (let i = 0; i < 5; i++) {
    push();
    rotate((-PI / 6) + i * (PI / 12));
    ellipse(0, -30, 140, 40);
    pop();
  }
  pop();

  // 遮陽傘（左下）
  push();
  translate(120, height * 0.7 + 10);
  fill(200, 50, 50);
  arc(0, 0, 220, 120, PI, TWO_PI);
  fill(255, 200, 200, 120);
  for (let i = -2; i <= 2; i++) {
    triangle(i * 22, 0, i * 44 + 22, -20, i * 44 - 22, -20);
  }
  stroke(150);
  line(0, 0, 0, 100);
  noStroke();
  pop();

  // 標題與說明文字
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(48);
  text('海灘版 p5.js 題庫測驗', width / 2, 70);
  textSize(20);
  fill(255, 240);
  text(`從題庫中隨機抽取最多 10 題，再從中隨機選 5 題作為本次測驗\n題庫共 ${allQuestions.length} 題`, width / 2, 140);

  // 繪製開始按鈕
  drawButton(startButton);
}

function drawQuestionScreen() {
  if (quizQuestions.length === 0) return; // 防止資料還沒載入
  
  let q = quizQuestions[currentQuestionIndex];
  
  // 繪製問題
  textAlign(LEFT, TOP);
  fill(255);
  textSize(28);
  text(`第 ${currentQuestionIndex + 1} 題 / ${quizQuestions.length} 題`, 40, 40);
  text(q.question, 40, 100, width - 80, 150); // 自動換行
  
  // 更新並繪製答案按鈕
  answerButtons[0].text = 'A. ' + q.opA;
  answerButtons[1].text = 'B. ' + q.opB;
  answerButtons[2].text = 'C. ' + q.opC;
  answerButtons[3].text = 'D. ' + q.opD;
  
  for (let btn of answerButtons) {
    drawButton(btn);
  }
}

function drawFeedbackScreen() {
  // 顯示回饋文字 (綠色或紅色)
  fill(feedbackColor);
  rect(0, 0, width, height); // 蓋住全螢幕
  
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(60);
  text(feedbackMessage, width / 2, height / 2);
  
  // 計時
  feedbackTimer--;
  if (feedbackTimer <= 0) {
    nextQuestion();
  }
}

function drawResultScreen() {
  textAlign(CENTER, CENTER);
  fill(255);
  
  textSize(50);
  text('測驗結束！', width / 2, 150);
  
  textSize(36);
  text(`你的成績: ${score} / ${quizQuestions.length}`, width / 2, 250);
  
  textSize(24);
  fill(200, 200, 0); // 黃色
  text(getFeedbackText(), width / 2, 350);
  
  // 若全對，顯示煙火特效
  if (score === quizQuestions.length && quizQuestions.length > 0) {
    // 定期發射煙火
    if (frameCount % 30 === 0) spawnFirework();
    updateAndDrawFireworks();
  }
  
  // 繪製重新開始按鈕
  drawButton(restartButton);
}

// ---------------------------------
// 互動與輔助函數
// ---------------------------------

// 繪製按鈕 (含 hover 效果)
function drawButton(btn) {
  let isHover = isMouseOver(btn);
  
  push(); // 保存繪圖狀態
  if (isHover) {
    fill(100, 180, 255); // hover 亮藍色
    stroke(255);
    strokeWeight(2);
    cursor(HAND); // 改變滑鼠游標
  } else {
    fill(50, 100, 200, 200); // 預設藍色
    noStroke();
  }
  rect(btn.x, btn.y, btn.w, btn.h, 10); // 圓角矩形
  
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text(btn.text, btn.x, btn.y, btn.w, btn.h); // 按鈕文字
  pop(); // 恢復繪圖狀態
}

// 檢查滑鼠是否在按鈕上
function isMouseOver(btn) {
  return (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h);
}

// 滑鼠點擊事件
function mousePressed() {
  // 重設游標
  cursor(ARROW);

  if (gameState === 'START') {
    if (isMouseOver(startButton)) {
      gameState = 'QUESTION';
    }
  } else if (gameState === 'QUESTION') {
    for (let btn of answerButtons) {
      if (isMouseOver(btn)) {
        checkAnswer(btn.option);
        break; // 點擊後就停止檢查
      }
    }
  } else if (gameState === 'RESULT') {
    if (isMouseOver(restartButton)) {
      startGame();
    }
  }
}

// ---------------------------------
// 互動視覺效果 (背景粒子)
// ---------------------------------

function setupParticles() {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-0.5, 0.5),
      vy: random(-0.5, 0.5),
      r: random(2, 5),
      alpha: random(50, 150)
    });
  }
}

function drawParticles() {
  for (let p of particles) {
    // 更新位置
    p.x += p.vx;
    p.y += p.vy;
    
    // 邊界環繞
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    // 繪製
    noStroke();
    fill(255, p.alpha);
    ellipse(p.x, p.y, p.r);
  }
}

// 新增煙火相關函數
function spawnFirework() {
  let fx = {
    particles: [],
    color: [random(50,255), random(50,255), random(50,255)],
    originX: random(width * 0.2, width * 0.8),
    originY: random(height * 0.15, height * 0.45)
  };
  let count = int(random(40, 80));
  let speed = random(2,6);
  for (let i = 0; i < count; i++) {
    let angle = random(TWO_PI);
    let sp = {
      x: fx.originX,
      y: fx.originY,
      vx: cos(angle) * random(0.5, speed),
      vy: sin(angle) * random(0.5, speed),
      r: random(2,4),
      life: 255,
      color: fx.color
    };
    fx.particles.push(sp);
  }
  fireworks.push(fx);
}

function updateAndDrawFireworks() {
  noStroke();
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let fx = fireworks[i];
    for (let j = fx.particles.length - 1; j >= 0; j--) {
      let p = fx.particles[j];
      // 重力與阻力
      p.vy += 0.06;
      p.vx *= 0.998;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 3;
      fill(p.color[0], p.color[1], p.color[2], p.life);
      ellipse(p.x, p.y, p.r);
      if (p.life <= 0 || p.y > height) {
        fx.particles.splice(j, 1);
      }
    }
    if (fx.particles.length === 0) {
      fireworks.splice(i,1);
    }
  }
}

