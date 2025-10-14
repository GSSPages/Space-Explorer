document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const MAX_CREW = 100, MAX_ENERGY = 100, HS_KEY = 'engage_highscores_v1', STATE_KEY = 'engage_state_v1';

  // Screens
  const menuScreen = document.getElementById('menu-screen');
  const highscoresScreen = document.getElementById('highscores-screen');
  const nameScreen = document.getElementById('name-screen');
  const gameScreen = document.getElementById('game-screen');

  // Elements
  const startBtn = document.getElementById('start-game-btn');
  const highscoresBtn = document.getElementById('highscores-btn');
  const hsBackBtn = document.getElementById('hs-back-btn');
  const shipInput = document.getElementById('ship-name-input');
  const beginBtn = document.getElementById('begin-mission-btn');
  const nameBackBtn = document.getElementById('name-back-btn');
  const shipTitle = document.getElementById('ship-title');
  const crewBar = document.getElementById('crewBar');
  const energyBar = document.getElementById('energyBar');
  const crewText = document.getElementById('crewText');
  const energyText = document.getElementById('energyText');
  const turnText = document.getElementById('turn');
  const distanceText = document.getElementById('distance');
  const encounterTitle = document.getElementById('encounter-title');
  const missionLog = document.getElementById('mission-log');
  const engageBtn = document.getElementById('engageBtn');
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const newGameBtn = document.getElementById('new-game-btn');
  const toMenuBtn = document.getElementById('to-menu-btn');
  const gameoverModal = document.getElementById('gameover-modal');
  const gameoverMsg = document.getElementById('gameover-msg');
  const modalStartMenu = document.getElementById('modal-startmenu');
  const modalNewGame = document.getElementById('modal-newgame');
  const modalHighscores = document.getElementById('modal-highscores');

  // Highscores screen
  const highscoresList = document.getElementById('highscores-list');

  // State
  let state = {
    shipName: '',
    turn: 0,
    crew: 50,
    energy: 50,
    distance: 0,
    log: []
  };

  // Encounters
  const encounters = [
    { key: 'empty', name: 'Empty Space', crewRange: [0,0], energyRange: [0,0] },
    { key: 'gas', name: 'Gas Cloud', crewRange: [0,0], energyRange: [-2,32] },
    { key: 'lifeless', name: 'Lifeless Planet', crewRange: [-2,0], energyRange: [-19,59] },
    { key: 'hostile', name: 'Hostile Planet', crewRange: [-20,0], energyRange: [-29,1] },
    { key: 'advanced', name: 'Advanced Planet', crewRange: [0,10], energyRange: [-2,40] }
  ];

  // Utility
  function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

  // Persistence - highscores
  function loadHighscores(){
    try{const raw=localStorage.getItem(HS_KEY); if(!raw) return []; return JSON.parse(raw);}catch(e){return [];}
  }
  function saveHighscores(list){ localStorage.setItem(HS_KEY, JSON.stringify(list)); }
  function addHighscore(name,score){
    const list = loadHighscores();
    list.push({name,score});
    list.sort((a,b)=>b.score - a.score);
    const top = list.slice(0,10);
    saveHighscores(top);
  }

  // Persistence - state
  function saveState(){localStorage.setItem(STATE_KEY, JSON.stringify(state));}
  function loadState(){try{const raw=localStorage.getItem(STATE_KEY); if(!raw) return; const p=JSON.parse(raw); state = Object.assign(state,p);}catch(e){}}

  // Render static starfield (no animation)
  function drawStaticStars(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<150;i++){
      ctx.fillStyle = 'white';
      ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 2, 2);
    }
  }

  // UI helpers
  function showScreen(screen){
    [menuScreen, highscoresScreen, nameScreen, gameScreen].forEach(s => s.style.display = 'none');
    screen.style.display = 'block';
  }

  function updateStats(){
    crewBar.value = state.crew;
    energyBar.value = state.energy;
    crewText.textContent = `${state.crew} / ${MAX_CREW}`;
    energyText.textContent = `${state.energy} / ${MAX_ENERGY}`;
    turnText.textContent = state.turn;
    distanceText.textContent = state.distance;
    shipTitle.textContent = state.shipName ? `${state.shipName}` : 'Ship';
  }

  // Log helpers with colored deltas
  function formatDelta(n){
    if(n > 0) return `<span class="delta-pos">+${n}</span>`;
    if(n < 0) return `<span class="delta-neg">${n}</span>`;
    return `<span class="delta-zero">0</span>`;
  }
  function addLogEntry(title, details){
    const entry = { turn: state.turn, title, description: details };
    state.log.push(entry);
    if(state.log.length > 1000) state.log.shift();
    saveState();
    renderLog();
  }
  function renderLog(){
    missionLog.innerHTML = '';
    state.log.forEach(e => {
      const div = document.createElement('div');
      div.className = 'log-entry';
      div.innerHTML = `<div>[Turn ${e.turn}] <strong>${e.title}</strong></div><div class="log-deltas">${e.description}</div>`;
      missionLog.appendChild(div);
    });
    // Auto-scroll to bottom if user near bottom
    missionLog.scrollTop = missionLog.scrollHeight;
  }

  // Highscores rendering
  function renderHighscores(){
    const list = loadHighscores();
    highscoresList.innerHTML = '';
    if(list.length === 0){
      highscoresList.innerHTML = '<li>No scores yet</li>';
      return;
    }
    list.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name} — ${item.score}`;
      highscoresList.appendChild(li);
    });
  }

  // Game over modal and handling
  function showGameOver(reason){
    gameoverMsg.textContent = `${reason}. Final — Crew: ${state.crew}, Energy: ${state.energy}, Distance: ${state.distance}`;
    gameoverModal.style.display = 'flex';
    // save high score (use distance)
    if(state.shipName){
      addHighscore(state.shipName, state.distance);
    }
  }

  function resetToNewGame(){
    state = { shipName: '', turn: 0, crew: 50, energy: 50, distance: 0, log: [] };
    saveState();
    showScreen(nameScreen);
    shipInput.value = '';
    drawStaticStars();
    renderLog();
    updateStats();
    gameoverModal.style.display = 'none';
  }

  // Event wiring
  startBtn.addEventListener('click', ()=>{ showScreen(nameScreen); });
  highscoresBtn.addEventListener('click', ()=>{ renderHighscores(); showScreen(highscoresScreen); });
  hsBackBtn.addEventListener('click', ()=>{ showScreen(menuScreen); });

  nameBackBtn.addEventListener('click', ()=>{ showScreen(menuScreen); });

  beginBtn.addEventListener('click', ()=>{
    const name = shipInput.value.trim();
    if(!name) return alert('Enter a ship name');
    state.shipName = name;
    state.turn = 0; state.crew = 50; state.energy = 50; state.distance = 0; state.log = [];
    // Automatic first mission log entry using ship name
    addLogEntry('Launch', `God's speed, ${state.shipName}. May your adventure among the stars be fruitful!`);
    saveState();
    showScreen(gameScreen);
    drawStaticStars();
    updateStats();
    renderLog();
  });

  // Engage logic
  engageBtn.addEventListener('click', ()=>{
    // Basic checks
    if(!state.shipName){ alert('No ship name set.'); return; }

    state.turn += 1;

    // Travel energy cost (1-10)
    const travelCost = randomInt(1,10);
    state.energy -= travelCost;
    // Distance increases by absolute energy spent this turn
    state.distance += Math.abs(travelCost);

    // Check for space port every 10 turns
    if(state.turn % 10 === 0){
      const crewGain = randomInt(0,30);
      const energyGain = randomInt(1,53);
      state.crew = clamp(state.crew + crewGain, 0, MAX_CREW);
      state.energy = clamp(state.energy + energyGain, 0, MAX_ENERGY);
      const desc = `Travel cost ${formatDelta(-travelCost)} energy. Docked at Space Port: Crew ${formatDelta(crewGain)}, Energy ${formatDelta(energyGain)}. Totals — Crew: ${state.crew}, Energy: ${state.energy}`;
      addLogEntry('Space Port', desc);
      encounterTitle.textContent = 'Space Port';
      drawStaticStars();
    } else {
      // Normal encounter
      const encounter = encounters[randomInt(0, encounters.length-1)];
      const crewDelta = randomInt(encounter.crewRange[0], encounter.crewRange[1]);
      const energyDelta = randomInt(encounter.energyRange[0], encounter.energyRange[1]);
      state.crew = clamp(state.crew + crewDelta, 0, MAX_CREW);
      state.energy = clamp(state.energy + energyDelta, 0, MAX_ENERGY);
      const desc = `Travel cost ${formatDelta(-travelCost)} energy. Encounter: ${encounter.name}. Crew ${formatDelta(crewDelta)}, Energy ${formatDelta(energyDelta)}. Totals — Crew: ${state.crew}, Energy: ${state.energy}`;
      addLogEntry(encounter.name, desc);
      encounterTitle.textContent = encounter.name;
      drawStaticStars();
    }

    updateStats();
    saveState();

    // Check for end condition
    if(state.energy <= 0 || state.crew <= 0){
      const reason = state.energy <= 0 ? 'Energy depleted' : 'Crew lost';
      showGameOver(reason);
    }
  });

  // Modal buttons
  modalStartMenu.addEventListener('click', ()=>{
    gameoverModal.style.display = 'none';
    showScreen(menuScreen);
  });
  modalNewGame.addEventListener('click', ()=>{
    resetToNewGame();
  });
  modalHighscores.addEventListener('click', ()=>{
    gameoverModal.style.display = 'none';
    renderHighscores();
    showScreen(highscoresScreen);
  });

  // In-game buttons
  newGameBtn.addEventListener('click', ()=>{
    if(confirm('Start a new game?')) resetToNewGame();
  });
  toMenuBtn.addEventListener('click', ()=>{
    if(confirm('Return to Start Menu? Current progress will be saved.')) showScreen(menuScreen);
  });

  // Load persisted state if present and start at menu
  loadState();
  drawStaticStars();
  renderLog();
  updateStats();
  showScreen(menuScreen);

}); // DOMContentLoaded end
