document.addEventListener('DOMContentLoaded', () => {
  // ==================== STARFIELD ====================
  const starCanvas = document.getElementById('starfield');
  const starCtx = starCanvas.getContext('2d');
  let stars = [];
  const numStars = 120;

  function resizeStarfield() {
    starCanvas.width = window.innerWidth;
    starCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeStarfield);
  resizeStarfield();

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * starCanvas.width,
      y: Math.random() * starCanvas.height,
      speed: 0.2 + Math.random() * 1.5
    });
  }

  function drawStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    starCtx.fillStyle = 'white';
    stars.forEach(star => {
      star.y += star.speed;
      if (star.y > starCanvas.height) {
        star.y = 0;
        star.x = Math.random() * starCanvas.width;
      }
      starCtx.fillRect(star.x, star.y, 2, 2);
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  // ==================== DOM ELEMENTS ====================
  const menuScreen = document.getElementById('menu-screen');
  const nameScreen = document.getElementById('name-screen');
  const highScoresScreen = document.getElementById('high-scores-screen');
  const gameScreen = document.getElementById('game-screen');

  const startBtn = document.getElementById('start-game-btn');
  const highScoresBtn = document.getElementById('high-scores-btn');
  const backBtn = document.getElementById('back-btn');
  const backToMenuBtn = document.getElementById('back-to-menu-btn');
  const startMissionBtn = document.getElementById('start-mission-btn');

  const highScoresList = document.getElementById('high-scores-list');
  const shipNameInput = document.getElementById('ship-name-input');

  // ==================== BUTTON LOGIC ====================
  startBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    nameScreen.style.display = 'flex';
  });

  highScoresBtn.addEventListener('click', () => {
    menuScreen.style.display = 'none';
    highScoresScreen.style.display = 'flex';
    loadHighScores();
  });

  backBtn.addEventListener('click', () => {
    highScoresScreen.style.display = 'none';
    menuScreen.style.display = 'flex';
  });

  backToMenuBtn.addEventListener('click', () => {
    nameScreen.style.display = 'none';
    menuScreen.style.display = 'flex';
  });

  startMissionBtn.addEventListener('click', () => {
    const shipName = shipNameInput.value.trim() || "Unnamed Ship";
    startGame(shipName);
  });

  // ==================== GAME LOGIC ====================
  let energy = 100;
  let distance = 0;
  let turns = 0;
  let missionLog = [];

  const encounters = [
    { key: 'empty', name: 'Empty Space', crewRange: [0,0], energyRange: [0,0] },
    { key: 'gas', name: 'Gas Cloud', crewRange: [0,0], energyRange: [-2,32] },
    { key: 'lifeless', name: 'Lifeless Planet', crewRange: [-2,0], energyRange: [-19,59] },
    { key: 'hostile', name: 'Hostile Planet', crewRange: [-20,0], energyRange: [-29,1] },
    { key: 'advanced', name: 'Advanced Planet', crewRange: [0,10], energyRange: [-2,40] }
  ];

  function startGame(shipName) {
    nameScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    energy = 100;
    distance = 0;
    turns = 0;
    missionLog = [];
    addMissionLog(`God's speed, ${shipName}. May your adventure among the stars be fruitful!`);
    updateGameInfo();
  }

  function addMissionLog(message) {
    missionLog.unshift(message);
    const logDiv = document.getElementById('mission-log');
    logDiv.innerHTML = missionLog.map(line => `<div>${line}</div>`).join('');
  }

  function updateGameInfo() {
    const info = document.getElementById('game-info');
    info.innerHTML = `Energy: ${energy} | Distance: ${distance} | Turns: ${turns}`;
  }

  function loadHighScores() {
    highScoresList.innerHTML = "<li>No scores yet</li>";
  }
});
