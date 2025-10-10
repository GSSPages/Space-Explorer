// --- GAME STATE ---
const MAX_CREW=100, MAX_ENERGY=100;
let state={shipName:'',turn:0,crew:50,energy:50,distance:0,log:[]};

// --- SCREENS ---
const menuScreen=document.getElementById('menu-screen');
const nameScreen=document.getElementById('name-screen');
const gameScreen=document.getElementById('game-screen');

// --- DOM ELEMENTS ---
const shipInput=document.getElementById('ship-name-input');
const startBtn=document.getElementById('start-game-btn');
const beginBtn=document.getElementById('begin-mission-btn');
const crewBar=document.getElementById('crewBar');
const energyBar=document.getElementById('energyBar');
const crewText=document.getElementById('crewText');
const energyText=document.getElementById('energyText');
const turnText=document.getElementById('turn');
const distanceText=document.getElementById('distance');
const encounterTitle=document.getElementById('encounter-title');
const missionLog=document.getElementById('mission-log');
const engageBtn=document.getElementById('engageBtn');
const canvas=document.getElementById('scene');
const ctx=canvas.getContext('2d');

// --- ENCOUNTERS ---
const encounters=[
  {key:'empty',name:'Empty Space',crew:[0,0],energy:[0,0]},
  {key:'gas',name:'Gas Cloud',crew:[0,0],energy:[-2,15]},
  {key:'lifeless',name:'Lifeless Planet',crew:[-2,0],energy:[-10,20]},
  {key:'hostile',name:'Hostile Planet',crew:[-20,0],energy:[-15,1]},
  {key:'advanced',name:'Advanced Planet',crew:[-5,10],energy:[-2,20]}
];
function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function pickEncounter(){return encounters[randomInt(0,encounters.length-1)];}

// --- SCREEN FLOW ---
startBtn.onclick=()=>{menuScreen.style.display='none';nameScreen.style.display='block';}
beginBtn.onclick=()=>{let name=shipInput.value.trim();if(!name)return alert('Enter a name');state.shipName=name;nameScreen.style.display='none';gameScreen.style.display='block';drawStaticStars();updateStats();}

// --- GAME LOGIC ---
function updateStats(){
  crewBar.value=state.crew; energyBar.value=state.energy;
  crewText.textContent=state.crew+' / '+MAX_CREW;
  energyText.textContent=state.energy+' / '+MAX_ENERGY;
  turnText.textContent=state.turn;
  distanceText.textContent=state.distance;
}
function addLog(title,desc,type){state.log.push({turn:state.turn,title,description:desc,type});if(state.log.length>1000)state.log.shift();renderLog();}
function renderLog(){missionLog.innerHTML='';state.log.forEach(e=>{let div=document.createElement('div');div.className='log-entry';div.innerHTML='<div>[Turn '+e.turn+'] <strong>'+e.title+'</strong></div><div>'+e.description+'</div>';missionLog.appendChild(div);});missionLog.scrollTop=missionLog.scrollHeight;}
function drawStaticStars(){ctx.fillStyle='black';ctx.fillRect(0,0,canvas.width,canvas.height);for(let i=0;i<150;i++){ctx.fillStyle='white';ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,2,2);}}

// --- ENGAGE ---
engageBtn.onclick=()=>{
  state.turn++; state.distance++;
  const travelCost=randomInt(1,10); state.energy-=travelCost;
  let title='',desc='';
  if(state.turn%10===0){
    const crewGain=randomInt(0,10), energyGain=randomInt(1,20);
    state.crew=Math.min(MAX_CREW,state.crew+crewGain); state.energy=Math.min(MAX_ENERGY,state.energy+energyGain);
    title='Space Port'; desc=`Travel cost -${travelCost} energy. Docked: Crew +${crewGain}, Energy +${energyGain}`;
  }else{
    const e=pickEncounter();
    const crewDelta=randomInt(e.crew[0],e.crew[1]);
    const energyDelta=randomInt(e.energy[0],e.energy[1]);
    state.crew=Math.max(0,Math.min(MAX_CREW,state.crew+crewDelta));
    state.energy=Math.max(0,Math.min(MAX_ENERGY,state.energy+energyDelta));
    title=e.name; desc=`Travel cost -${travelCost} energy. Crew ${crewDelta>=0?'+':''}${crewDelta}, Energy ${energyDelta>=0?'+':''}${energyDelta}`;
  }
  encounterTitle.textContent=title;
  drawStaticStars(); addLog(title,desc,'encounter'); updateStats();
  if(state.energy<=0||state.crew<=0){encounterTitle.textContent='--- MISSION FAILED ---';engageBtn.disabled=true; addLog('Mission Failed','Your ship has been lost.','gameover');}
}
