document.addEventListener('DOMContentLoaded', () => {
    const startMenu = document.getElementById('start-menu');
    const highScoresScreen = document.getElementById('high-scores');
    const nameInputScreen = document.getElementById('name-input-screen');
    const gameScreen = document.getElementById('game-screen');
    const popup = document.getElementById('game-over-popup');

    const startGameBtn = document.getElementById('start-game-btn');
    const highScoresBtn = document.getElementById('high-scores-btn');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const confirmNameBtn = document.getElementById('confirm-name-btn');
    const engageBtn = document.getElementById('engage-btn');
    const endMissionBtn = document.getElementById('end-mission-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const backToStartBtn = document.getElementById('back-to-start-btn');
    const viewScoresBtn = document.getElementById('view-scores-btn');

    const shipDisplay = document.getElementById('ship-display');
    const shipNameInput = document.getElementById('ship-name');
    const turnCount = document.getElementById('turn-count');
    const distanceCount = document.getElementById('distance-count');
    const energyCount = document.getElementById('energy-count');
    const crewCount = document.getElementById('crew-count');
    const missionLog = document.getElementById('mission-log');

    let turn = 0;
    let distance = 0;
    let energy = 100;
    let crew = 10;
    let shipName = '';

    // Encounter data
    const encounters = [
        { key: 'empty', name: 'Empty Space', crewRange: [0,0], energyRange: [0,0] },
        { key: 'gas', name: 'Gas Cloud', crewRange: [0,0], energyRange: [-2,32] },
        { key: 'lifeless', name: 'Lifeless Planet', crewRange: [-2,0], energyRange: [-19,59] },
        { key: 'hostile', name: 'Hostile Planet', crewRange: [-20,0], energyRange: [-29,1] },
        { key: 'advanced', name: 'Advanced Planet', crewRange: [0,10], energyRange: [-2,40] }
    ];

    function showScreen(screen) {
        [startMenu, highScoresScreen, nameInputScreen, gameScreen, popup].forEach(s => s.classList.add('hidden'));
        screen.classList.remove('hidden');
    }

    startGameBtn.addEventListener('click', () => showScreen(nameInputScreen));
    highScoresBtn.addEventListener('click', () => showScreen(highScoresScreen));
    backToMenuBtn.addEventListener('click', () => showScreen(startMenu));
    newGameBtn.addEventListener('click', () => location.reload());
    backToStartBtn.addEventListener('click', () => showScreen(startMenu));
    viewScoresBtn.addEventListener('click', () => showScreen(highScoresScreen));

    confirmNameBtn.addEventListener('click', () => {
        shipName = shipNameInput.value.trim() || "Unnamed Ship";
        shipDisplay.textContent = `Ship: ${shipName}`;
        resetGame();
        showScreen(gameScreen);
        logMission(`God's speed, ${shipName}. May your adventure among the stars be fruitful!`, 'neutral');
    });

    engageBtn.addEventListener('click', () => {
        takeTurn();
    });

    endMissionBtn.addEventListener('click', () => {
        showScreen(popup);
    });

    function resetGame() {
        turn = 0;
        distance = 0;
        energy = 100;
        crew = 10;
        updateStats();
        missionLog.innerHTML = '';
    }

    function updateStats() {
        turnCount.textContent = turn;
        distanceCount.textContent = distance;
        energyCount.textContent = energy;
        crewCount.textContent = crew;
    }

    function logMission(text, type) {
        const entry = document.createElement('div');
        entry.textContent = text;
        if (type === 'positive') entry.style.color = 'green';
        if (type === 'negative') entry.style.color = 'red';
        if (type === 'neutral') entry.style.color = 'yellow';
        missionLog.prepend(entry);
    }

    function randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function takeTurn() {
        turn++;
        const encounter = encounters[Math.floor(Math.random() * encounters.length)];
        const crewChange = randomInRange(encounter.crewRange[0], encounter.crewRange[1]);
        const energyChange = randomInRange(encounter.energyRange[0], encounter.energyRange[1]);

        crew += crewChange;
        energy += energyChange;
        distance += Math.abs(energyChange);

        let type = 'neutral';
        if (energyChange > 0) type = 'positive';
        if (energyChange < 0) type = 'negative';

        logMission(`${encounter.name}: Crew ${crewChange}, Energy ${energyChange}`, type);
        updateStats();

        if (crew <= 0 || energy <= 0) {
            logMission("Mission failed. Out of resources.", 'negative');
            showScreen(popup);
        }
    }

    // STARFIELD ANIMATION
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        stars = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 0.2 + Math.random() * 1.5
            });
        }
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
            ctx.fillRect(star.x, star.y, 2, 2);
        });
        requestAnimationFrame(animateStars);
    }
    animateStars();
});
