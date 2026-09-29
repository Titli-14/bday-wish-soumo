// =====================================================
// CONFIGURATION
// =====================================================
const STORAGE_KEY = "guitarBattleCompleted";
const NEXT_STAGE_URL = null; // Change this when the stage AFTER the gift is ready.

const ROUND_DATA = [
  {title:"🎸 ROUND 1: WARM UP", icon:"🎸", description:"Let's see if those fingers can keep up...", count:18, speed:.30, interval:900},
  {title:"😼 ROUND 2: THE CATS GET SERIOUS", icon:"😼", description:"The cats are getting nervous... and faster.", count:25, speed:.38, interval:720},
  {title:"👑🔥 THE BOSS CAT: FINAL SOLO", icon:"👑😼", description:"If you want your birthday surprise... PLAY THE FINAL SOLO.", count:34, speed:.48, interval:560}
];
const GOOD=["😨 WAIT... HE ACTUALLY KNOWS HOW TO PLAY?!","🔥 THIS HUMAN IS COOKING!","😭 STOP THE MUSIC!!!","😱 WHO TAUGHT HIM THAT SOLO?!"];
const BAD=["😂 BRO THAT'S NOT THE SONG!","💀 ARE YOU PLAYING GUITAR OR FIGHTING THE KEYBOARD?","😈 THE CATS ARE WINNING!","🎸 THE GUITAR DESERVES BETTER!"];
const FAIL=["Maybe the keyboard was the real enemy.","Somewhere, a guitar just cried.","The cats would like to thank you for the easy victory.","That performance will be discussed by the cats for generations."];

// =====================================================
// DOM / SCREEN MANAGEMENT
// =====================================================
const screens=[...document.querySelectorAll("#guitarStage .screen")];
const guitarStage=document.getElementById("guitarStage");
const giftStage=document.getElementById("giftStage");
const lanes=[...document.querySelectorAll(".lane")];
const scoreEl=document.getElementById("scoreValue"), comboEl=document.getElementById("comboValue");
const battleFill=document.getElementById("battleFill"), statusLine=document.getElementById("statusLine");
const reaction=document.getElementById("catReaction"), failMessage=document.getElementById("failMessage");
const toast=document.getElementById("toast");

function showScreen(id){ stopGame(); screens.forEach(s=>s.classList.remove("active")); document.getElementById(id).classList.add("active"); }
function completed(){ return localStorage.getItem(STORAGE_KEY)==="true"; }
function boot(){ completed()?showScreen("returningScreen"):showScreen("introScreen"); }
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function shake(){guitarStage.classList.add("shake");setTimeout(()=>guitarStage.classList.remove("shake"),350)}
function setReaction(t){reaction.textContent=t}
function updateHUD(){scoreEl.textContent=String(score).padStart(6,"0");comboEl.textContent=`🔥 x${combo}`;battleFill.style.width=`${Math.max(0,Math.min(100,battle))}%`}
function toastMsg(t){toast.textContent=t;toast.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove("show"),2200)}


// =====================================================
// GUITAR BATTLE SOUND ENGINE (Web Audio — no audio files needed)
// =====================================================
let audioCtx=null;
function getAudio(){
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}
function tone(freq, duration=.16, type='triangle', volume=.09, when=0){
  const ctx=getAudio(), t=ctx.currentTime+when;
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type; osc.frequency.setValueAtTime(freq,t);
  gain.gain.setValueAtTime(.0001,t);
  gain.gain.exponentialRampToValueAtTime(volume,t+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t); osc.stop(t+duration+.03);
}
const GUITAR_NOTES=[196,220,247,294];
function playGuitar(lane, perfect=false){
  const f=GUITAR_NOTES[lane]||220;
  tone(f,.18,'triangle',perfect?.13:.09);
  tone(f*2,.11,'sine',perfect?.055:.035,.015);
  if(perfect) tone(f*1.5,.09,'sine',.025,.035);
}
function playWrong(){ tone(110,.14,'sawtooth',.05); }
function playMiss(){ tone(82,.2,'square',.035); }
function playRoundWin(){ [392,494,587].forEach((f,i)=>tone(f,.16,'triangle',.07,i*.09)); }
function playVictory(){ [262,330,392,523,659].forEach((f,i)=>tone(f,.24,'triangle',.09,i*.09)); }

// =====================================================
// GUITAR GAME STATE
// =====================================================
let round=0, score=0, combo=0, battle=50, activeNotes=[], spawned=0, running=false, spawnTimer=null, raf=null,lastTime=0;

function resetGame(){
  stopGame();round=0;score=0;combo=0;battle=50;activeNotes=[];spawned=0;
  lanes.forEach(l=>l.querySelectorAll(".note").forEach(n=>n.remove()));updateHUD();
}
function stopGame(){running=false;clearInterval(spawnTimer);spawnTimer=null;if(raf)cancelAnimationFrame(raf);raf=null}

document.getElementById("acceptBtn").onclick=()=>showScreen("instructionsScreen");
document.getElementById("playAgainBtn").onclick=()=>{resetGame();showScreen("instructionsScreen")};
document.getElementById("skipBtn").onclick=()=>enterGiftStage(true);
document.getElementById("startBtn").onclick=()=>{resetGame();showRound()};
document.getElementById("rematchBtn").onclick=()=>{resetGame();showScreen("instructionsScreen")};
function quitReplay(){
  // Never erase completed progress. A replay can be abandoned at any moment.
  stopGame();
  resetGame();
  showScreen("returningScreen");
}

document.getElementById("quitBtn").onclick=()=>{
  if(confirm("Quit this replay and go back? Your completed progress is safe.")) quitReplay();
};
document.getElementById("quitReplayInstructions").onclick=()=>quitReplay();
document.getElementById("quitReplayRound").onclick=()=>{
  if(confirm("Quit this replay and go back? Your completed progress is safe.")) quitReplay();
};
document.getElementById("unlockBtn").onclick=()=>enterGiftStage(false);

function showRound(){
  const r=ROUND_DATA[round];
  document.getElementById("roundTitle").textContent=r.title;
  document.getElementById("roundIcon").textContent=r.icon;
  document.getElementById("roundDescription").textContent=r.description;
  document.getElementById("roundStartBtn").textContent=round===2?"PLAY THE FINAL SOLO 🔥":"START ROUND 🔥";
  showScreen("roundScreen");
}
document.getElementById("roundStartBtn").onclick=startRound;

function startRound(){
  spawned=0;activeNotes=[];lastTime=performance.now();showScreen("gameScreen");
  statusLine.textContent=round===2?"🔥 BOSS CAT BATTLE!":"Get ready...";
  setReaction(round===2?"👑😼 PLAY THE FINAL SOLO!":"😼 Don't embarrass yourself, human.");
  setTimeout(()=>{
    running=true;spawnNote();
    spawnTimer=setInterval(()=>{if(spawned<ROUND_DATA[round].count)spawnNote();else clearInterval(spawnTimer)},ROUND_DATA[round].interval);
    raf=requestAnimationFrame(loop);
  },450);
}
function spawnNote(){
  const r=ROUND_DATA[round];if(spawned>=r.count)return;
  let lane=Math.floor(Math.random()*4);
  if(activeNotes.length&&Math.random()<.55){let last=activeNotes.at(-1).lane;while(lane===last)lane=Math.floor(Math.random()*4)}
  const el=document.createElement("div");el.className="note";el.style.top="0px";lanes[lane].appendChild(el);
  activeNotes.push({lane,el,y:-20,speed:r.speed*(round===2?1.08:1)});spawned++;
}
function loop(now){
  if(!running)return;
  const delta=Math.min(now-lastTime,40);lastTime=now;
  const h=lanes[0].clientHeight, hit=h-65-37, miss=hit+95;
  for(let i=activeNotes.length-1;i>=0;i--){
    const n=activeNotes[i];n.y+=n.speed*delta;n.el.style.top=n.y+"px";
    if(n.y>miss){n.el.remove();activeNotes.splice(i,1);missNote();if(!running)return}
  }
  if(spawned>=ROUND_DATA[round].count&&activeNotes.length===0){finishRound();return}
  raf=requestAnimationFrame(loop);
}
const map={a:0,s:1,d:2,f:3};
window.addEventListener("keydown",e=>{if(!running||e.repeat)return;let l=map[e.key.toLowerCase()];if(l===undefined)return;e.preventDefault();hitLane(l)});
document.querySelectorAll(".touch").forEach(b=>b.addEventListener("pointerdown",e=>{e.preventDefault();if(running)hitLane(+b.dataset.lane)}));

function hitLane(li){
  const lane=lanes[li];lane.classList.add("active");setTimeout(()=>lane.classList.remove("active"),100);
  const btn=document.querySelector(`.touch[data-lane="${li}"]`);btn.classList.add("pressed");setTimeout(()=>btn.classList.remove("pressed"),100);
  const hit=lane.clientHeight-65-37, win=62;let best=-1,dist=Infinity;
  activeNotes.forEach((n,i)=>{if(n.lane===li&&Math.abs(n.y-hit)<dist){dist=Math.abs(n.y-hit);best=i}});
  if(best>=0&&dist<=win){
    const n=activeNotes[best];n.el.remove();activeNotes.splice(best,1);
    const points=dist<22?150:dist<42?100:70;score+=points+Math.min(combo*5,100);combo++;battle=Math.min(100,battle+4);
    statusLine.textContent=dist<22?"PERFECT!":dist<42?"GOOD!":"NICE!";
    particles(lane,hit);playGuitar(li,dist<22);if(combo%6===0)setReaction(pick(GOOD));updateHUD();
  }else badHit();
}
function particles(container,y){
  for(let i=0;i<8;i++){const p=document.createElement("i");p.style.cssText=`position:absolute;left:50%;top:${y}px;width:8px;height:8px;border-radius:50%;background:var(--n);z-index:7;transition:.5s;`;container.appendChild(p);requestAnimationFrame(()=>{p.style.transform=`translate(${(Math.random()-.5)*120}px,${(Math.random()-.5)*100}px) scale(.2)`;p.style.opacity=0});setTimeout(()=>p.remove(),550)}
}
function badHit(){playWrong();combo=0;battle-=5;statusLine.textContent="TOO EARLY / WRONG!";setReaction(pick(BAD));updateHUD();shake();checkFail()}
function missNote(){playMiss();combo=0;battle-=9;statusLine.textContent="MISS! 💀";setReaction(pick(BAD));updateHUD();shake();checkFail()}
function checkFail(){if(battle<=0){running=false;setTimeout(()=>{stopGame();failMessage.textContent=pick(FAIL);showScreen("failScreen")},300)}}
function finishRound(){
  stopGame();
  if(round<ROUND_DATA.length-1){playRoundWin();statusLine.textContent="ROUND COMPLETE! 🔥";setReaction("😨 NO WAY... HE SURVIVED THAT ROUND!");round++;setTimeout(showRound,850)}
  else setTimeout(victory,650);
}
function victory(){
  stopGame();playVictory();localStorage.setItem(STORAGE_KEY,"true");confetti();shake();showScreen("victoryScreen");
}
function confetti(){
  const c=document.getElementById("confetti");c.innerHTML="";const colors=["#ff4fa3","#9b5cff","#38bdf8","#ffd54a","#52e38b","#fff"];
  for(let i=0;i<90;i++){let x=document.createElement("i");x.style.left=Math.random()*100+"%";x.style.setProperty("--c",colors[i%colors.length]);x.style.animationDelay=Math.random()*2+"s";c.appendChild(x)}
}

// =====================================================
// STAGE 1 → STAGE 2 CONNECTOR
// =====================================================
function enterGiftStage(skip){
  stopGame();
  guitarStage.style.transition="opacity .55s";
  guitarStage.style.opacity="0";
  setTimeout(()=>{
    guitarStage.classList.add("hidden");
    giftStage.classList.remove("hidden");
    giftStage.setAttribute("aria-hidden","false");
    giftStage.style.opacity="0";
    requestAnimationFrame(()=>giftStage.style.opacity="1");
    startGiftStage(skip);
  },520);
}

// =====================================================
// STAGE 2 — ACTUAL CAT + GIFT SEQUENCE
// =====================================================
const giftScreens={
  arrival:document.getElementById("giftArrival"),
  open:document.getElementById("giftOpenScreen"),
  cake:document.getElementById("cakeWishScreen"),
  card:document.getElementById("birthdayCardScreen")
};
function showGiftScreen(which){
  Object.values(giftScreens).forEach(s=>s.classList.remove("active"));
  giftScreens[which].classList.add("active");
}
const speeches=[
  "mrrp. 🐱",
  "Yes, yes... I know. I am adorable.",
  "The Meme Cats gave up the guitar.",
  "So I was sent to deliver your REAL reward.",
  "Don't just stand there. There is a gift. 🎁"
];
let speechIndex=0;
function startWingFlapSound(){
  const audio=document.getElementById("wingFlapAudio");
  if(!audio || localStorage.getItem("birthdayWebsiteSoundEnabled")==="false") return;
  audio.volume=0.48;
  audio.currentTime=0;
  audio.play().catch(()=>{});
}
function stopWingFlapSound(){
  const audio=document.getElementById("wingFlapAudio");
  if(!audio) return;
  audio.pause();
  audio.currentTime=0;
}

function startGiftStage(skip){
  showGiftScreen("arrival");speechIndex=skip?2:0;
  document.getElementById("speechText").textContent=skip?"You skipped the battle... but the reward is still waiting. 😼":"mrrp. 🐱";
  document.getElementById("landGiftBtn").classList.add("hidden");
  document.getElementById("catFlight").style.animation="none";
  void document.getElementById("catFlight").offsetWidth;
  document.getElementById("catFlight").style.animation="";
  startWingFlapSound();
  document.getElementById("arrivalLine1").textContent=skip?"WELCOME TO THE REWARD 🐱🎁":"Wait...";
  document.getElementById("arrivalLine2").textContent=skip?"Someone very important has your birthday gift.":"Someone has arrived with your reward. 👀";
}
document.getElementById("nextSpeechBtn").onclick=()=>{
  speechIndex++;
  const text=document.getElementById("speechText");
  if(speechIndex<speeches.length){text.textContent=speeches[speechIndex]}
  else{
    text.textContent="Fine. Go take your gift already. 🙄🎁";
    document.getElementById("landGiftBtn").classList.remove("hidden");
    document.getElementById("nextSpeechBtn").classList.add("hidden");
  }
};
document.getElementById("landGiftBtn").onclick=()=>{
  stopWingFlapSound();
  showGiftScreen("open");
  document.getElementById("nextSpeechBtn").classList.remove("hidden");
};
document.getElementById("openGiftBtn").onclick=()=>{
  stopWingFlapSound();
  showGiftScreen("cake");
  resetCakeWish();
  if(typeof playSfx === "function") playSfx("sparkle",.7);
};

function resetCakeWish(){
  const cake=document.getElementById("birthdayCake");
  const progress=document.getElementById("blowProgress");
  const blow=document.getElementById("blowCandlesBtn");
  const skip=document.getElementById("skipBlowBtn");
  if(cake) cake.classList.remove("candles-out","celebrate");
  if(progress) progress.style.width="0%";
  if(blow){blow.disabled=false;blow.textContent="💨 BLOW THE CANDLES";}
  if(skip) skip.disabled=false;
}

function blowCandles(){
  const cake=document.getElementById("birthdayCake");
  const progress=document.getElementById("blowProgress");
  const blow=document.getElementById("blowCandlesBtn");
  const skip=document.getElementById("skipBlowBtn");
  if(!cake || cake.classList.contains("candles-out")) return;
  if(progress) progress.style.width="100%";
  if(blow){blow.disabled=true;blow.textContent="✨ Wish made!";}
  if(skip) skip.disabled=true;
  cake.classList.add("candles-out");
  if(typeof playSfx === "function") playSfx("whoosh",.7);
  setTimeout(()=>{
    cake.classList.add("celebrate");
    if(typeof playSfx === "function") playSfx("success",.8);
    setTimeout(()=>{
      showGiftScreen("card");
      setTimeout(()=>document.querySelectorAll("#birthdayCardScreen .reveal").forEach((x,i)=>setTimeout(()=>x.style.opacity="1",i*250)),120);
    },850);
  },650);
}

document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("blowCandlesBtn")?.addEventListener("click",blowCandles);
  document.getElementById("skipBlowBtn")?.addEventListener("click",blowCandles);
});

// =====================================================
// BIRTHDAY CARD / OPTIONAL SONG PLAYER
// =====================================================
const audio=document.getElementById("bdaySong"),playBtn=document.getElementById("playBtn"),seekFill=document.getElementById("seekFill");
let playing=false;
playBtn.onclick=async()=>{
  try{
    if(playing){audio.pause();playing=false;playBtn.textContent="▶"}
    else{await audio.play();playing=true;playBtn.textContent="❚❚"}
  }catch{toastMsg("Add birthday-song.mp3 beside the website when you're ready 🎧")}
};
audio.addEventListener("timeupdate",()=>{if(audio.duration)seekFill.style.width=(audio.currentTime/audio.duration*100)+"%"});
audio.addEventListener("ended",()=>{playing=false;playBtn.textContent="▶";seekFill.style.width="100%"});

document.getElementById("revealLetterBtn").onclick=()=>{
  document.getElementById("letterLines").classList.remove("hidden");
  document.getElementById("continueBtn").classList.remove("hidden");
  document.getElementById("revealLetterBtn").classList.add("hidden");
};
document.getElementById("continueBtn").addEventListener("click",(event)=>{
  event.preventDefault();
  openStage3();
});

// Start everything.
boot();


/* ================= STAGE 2 → STAGE 3 BRIDGE ================= */
function openStage3(){
  // Stage 1 + Stage 2 live inside #app.
  // Hide the ENTIRE previous journey before revealing Stage 3,
  // otherwise the Stage 2 birthday card stays on screen.
  const app = document.getElementById("app");
  const stage3Root = document.getElementById("stage3App");
  const continueBtn = document.getElementById("continueBtn");

  if(continueBtn) continueBtn.disabled = true;

  // Small fade-out so the transition feels intentional.
  if(app){
    app.classList.add("journey-exit");

    setTimeout(()=>{
      app.style.display = "none";

      if(stage3Root){
        stage3Root.classList.add("is-active");
        stage3Root.setAttribute("aria-hidden","false");

        // Reset Stage 3 so its intro is always the first thing shown.
        document.querySelectorAll("#stage3App .s3-screen").forEach(screen=>{
          screen.classList.remove("active");
        });

        const intro = document.getElementById("s3-introScreen");
        if(intro) intro.classList.add("active");

        // IMPORTANT: Stage 3 is lower in the HTML, so scroll to IT,
        // not simply to the top of the old page.
        requestAnimationFrame(()=>{
          stage3Root.scrollIntoView({behavior:"smooth", block:"start"});
        });
      }
    }, 450);
  }
}

/* ================= STAGE 3: MEMORY ASSEMBLY LOGIC ================= */
(function(){
// ============================
// STAGE 3 CONFIGURATION
// ============================
const NEXT_STAGE_URL = null;

// IMPORTANT:
// Replace assets/his-photo.jpg with the final beautiful photo you want assembled.
// Keep the filename or change PHOTO_URL below.
const PHOTO_URL = "assets/his-photo.jpeg";

// Edit this birthday message anytime you want:
const BIRTHDAY_MESSAGE = `Happy Birthday, my love. ❤️

After all the games, chaos, cats and missions... this part is just from me.

I hope you know how special you are to me and how grateful I am that you exist in my life. Every memory with you has become a little piece of something beautiful — and somehow, together, all those little pieces became us.

So today, on your birthday, I just want you to smile, feel loved, and remember that you have someone cheering for you through every ridiculous mission life throws at us. 😭❤️

Thank you for being you.

Happy Birthday, birthday boy. ✨
With all my love. 💌`;

const cats = [
  {src:"assets/cat1.png", role:"The shocked project manager"},
  {src:"assets/cat2.png", role:"The loading specialist"},
  {src:"assets/cat3.png", role:"The suspicious supervisor"},
  {src:"assets/cat4.png", role:"The fluffy emotional support"},
  {src:"assets/cat5.png", role:"The confused intern"},
  {src:"assets/cat6.png", role:"The dramatic cinematographer"},
  {src:"assets/cat7.png", role:"The final messenger"}
];

const introLines = [
  "WAIT. 🐱",
  "Before you leave...",
  "We have one final mission.",
  "The Cat Department has been collecting memories. 👀",
  "And honestly... it got a little chaotic.",
];

const introText = document.getElementById("s3-introText");
const startMission = document.getElementById("s3-startMission");
const introScreen = document.getElementById("s3-introScreen");
const missionScreen = document.getElementById("s3-missionScreen");
const revealScreen = document.getElementById("s3-revealScreen");
const letterScreen = document.getElementById("s3-letterScreen");

let introIndex = 0;
let started = false;

startMission.addEventListener("click", () => {
  if (!started) {
    started = true;
    const interval = setInterval(() => {
      introIndex++;
      if (introIndex < introLines.length) {
        introText.textContent = introLines[introIndex];
      } else {
        clearInterval(interval);
        startMission.textContent = "LET'S SEE IT 🧩";
        startMission.onclick = showMission;
      }
    }, 1300);
  } else {
    showMission();
  }
});

function showMission(){
  switchScreen(introScreen, missionScreen);
  buildBoard();
  buildCats();
}

function switchScreen(from,to){
  from.classList.remove("active");
  to.classList.add("active");
}

const board = document.getElementById("s3-assemblyBoard");
const catStage = document.getElementById("s3-catStage");
const progressFill = document.getElementById("s3-progressFill");
const progressText = document.getElementById("s3-progressText");
const assembleBtn = document.getElementById("s3-assembleBtn");
const missionText = document.getElementById("s3-missionText");

function buildBoard(){
  [...board.querySelectorAll(".puzzle-tile")].forEach(x=>x.remove());
  let n = 0;
  for(let row=0; row<3; row++){
    for(let col=0; col<3; col++){
      n++;
      const tile = document.createElement("div");
      tile.className = "puzzle-tile";
      tile.dataset.index = n;
      tile.style.left = `${col*33.333}%`;
      tile.style.top = `${row*33.333}%`;
      tile.style.backgroundImage = `url("${PHOTO_URL}")`;
      tile.style.backgroundPosition = `${col*50}% ${row*50}%`;
      tile.style.setProperty("--rot", `${(Math.random()*30-15).toFixed(1)}deg`);
      board.insertBefore(tile, document.getElementById("s3-flash"));
    }
  }
}

function buildCats(){
  // The lane starts empty. Cats arrive one at a time with each puzzle piece.
  catStage.innerHTML = "";
}

function createDeliveryPiece(index){
  const parcel = document.createElement("div");
  parcel.className = "delivery-piece";
  const col = index % 3;
  const row = Math.floor(index / 3);
  parcel.style.backgroundImage = `url("${PHOTO_URL}")`;
  parcel.style.backgroundSize = "300% 300%";
  parcel.style.backgroundPosition = `${col*50}% ${row*50}%`;
  catStage.appendChild(parcel);
  return parcel;
}

async function deliverPiece(index, tile){
  const catData = cats[index % 6];
  const fromLeft = index % 2 === 0;

  const cat = document.createElement("img");
  cat.src = catData.src;
  cat.alt = catData.role;
  cat.className = `delivery-cat ${fromLeft ? "enter-left" : "enter-right"}`;
  catStage.appendChild(cat);

  missionText.textContent = `🐾 ${catData.role} is bringing memory piece ${index+1}/9...`;
  await wait(1050);

  const parcel = createDeliveryPiece(index);
  const catRect = cat.getBoundingClientRect();
  const laneRect = catStage.getBoundingClientRect();
  parcel.style.left = `${catRect.left - laneRect.left + catRect.width*.62}px`;
  parcel.style.top = `${catRect.top - laneRect.top + catRect.height*.38}px`;
  parcel.classList.add("show");
  cat.classList.add("waiting");

  missionText.textContent = `${catData.role}: special delivery! 📦`;
  await wait(800);

  const targetRect = tile.getBoundingClientRect();
  const parcelRect = parcel.getBoundingClientRect();
  parcel.classList.remove("show");
  parcel.classList.add("flying");
  parcel.style.opacity = "1";
  parcel.style.left = `${parcelRect.left}px`;
  parcel.style.top = `${parcelRect.top}px`;

  requestAnimationFrame(()=>{
    parcel.style.left = `${targetRect.left + targetRect.width/2 - parcelRect.width/2}px`;
    parcel.style.top = `${targetRect.top + targetRect.height/2 - parcelRect.height/2}px`;
    parcel.style.transform = "rotate(0deg) scale(1.08)";
  });

  await wait(740);
  tile.classList.add("placed");
  parcel.style.opacity = "0";
  setTimeout(()=>parcel.remove(),300);

  const spark = document.createElement("div");
  spark.className = "delivery-spark";
  spark.textContent = "✦ delivered!";
  catStage.appendChild(spark);
  setTimeout(()=>spark.remove(),750);

  const percent = Math.round((index+1)/9*100);
  progressFill.style.width = `${percent}%`;
  progressText.textContent = `${percent}%`;

  cat.classList.remove("waiting");
  cat.classList.add(fromLeft ? "exit-left" : "exit-right");
  await wait(860);
  cat.remove();
}

assembleBtn.addEventListener("click", async ()=>{
  if(assembleBtn.disabled) return;
  assembleBtn.disabled = true;
  assembleBtn.textContent = "CAT DELIVERY SERVICE IN PROGRESS... 🐾";
  missionText.textContent = "Stand back. The first employee is on the way...";

  const tiles = [...board.querySelectorAll(".puzzle-tile")];
  for(let i=0;i<tiles.length;i++){
    await deliverPiece(i, tiles[i]);
    await wait(260);
  }

  missionText.textContent = "WAIT... THE CATS ACTUALLY DID IT?! 😭❤️";
  document.getElementById("s3-flash").classList.add("show");
  await wait(1000);
  showReveal();
});

function wait(ms){return new Promise(r=>setTimeout(r,ms))}

function showReveal(){
  document.getElementById("s3-finalPhoto").src = PHOTO_URL;
  switchScreen(missionScreen,revealScreen);
  makeConfetti();
}

function makeConfetti(){
  const holder = document.getElementById("s3-confetti");
  holder.innerHTML = "";
  for(let i=0;i<42;i++){
    const p=document.createElement("i");
    p.style.left = Math.random()*100+"%";
    p.style.animationDelay = Math.random()*2+"s";
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    holder.appendChild(p);
  }
}

document.getElementById("s3-continueLetter").addEventListener("click",()=>{
  switchScreen(revealScreen,letterScreen);
});

const envelope = document.getElementById("s3-envelope");
const openLetter = document.getElementById("s3-openLetter");
const letterCard = document.getElementById("s3-letterCard");
const messageText = document.getElementById("s3-messageText");
const letterPrompt = document.getElementById("s3-letterPrompt");

function revealLetter(){
  envelope.style.display="none";
  openLetter.style.display="none";
  letterPrompt.style.display="none";
  letterCard.classList.add("open");
  messageText.textContent = BIRTHDAY_MESSAGE;
  document.getElementById("s3-readAloud").disabled = !("speechSynthesis" in window);
}
envelope.addEventListener("click",revealLetter);
openLetter.addEventListener("click",revealLetter);

// ============================
// READ ALOUD
// ============================
const readBtn = document.getElementById("s3-readAloud");
const pauseBtn = document.getElementById("s3-pauseResume");
const restartBtn = document.getElementById("s3-restartVoice");
let utterance = null;
let speaking = false;
let paused = false;

function speakMessage(){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(BIRTHDAY_MESSAGE);
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.onend = () => resetVoiceButtons();
  utterance.onerror = () => resetVoiceButtons();

  speechSynthesis.speak(utterance);
  speaking = true;
  paused = false;
  pauseBtn.disabled = false;
  restartBtn.disabled = false;
  readBtn.textContent = "🔊 READING...";
  pauseBtn.textContent = "⏸ PAUSE";
}

function resetVoiceButtons(){
  speaking=false; paused=false;
  readBtn.textContent="🔊 READ IT TO ME";
  pauseBtn.textContent="⏸ PAUSE";
}

readBtn.addEventListener("click",speakMessage);

pauseBtn.addEventListener("click",()=>{
  if(!speaking) return;
  if(!paused){
    speechSynthesis.pause();
    paused=true;
    pauseBtn.textContent="▶ RESUME";
  }else{
    speechSynthesis.resume();
    paused=false;
    pauseBtn.textContent="⏸ PAUSE";
  }
});

restartBtn.addEventListener("click",speakMessage);

document.getElementById("s3-nextStageBtn").addEventListener("click",()=>{
  speechSynthesis.cancel();
  openStage4();
});

window.addEventListener("beforeunload",()=>speechSynthesis.cancel());

})();



/* ================= STAGE 4 INTEGRATION ================= */

function openStage4() {
  const s3 = document.getElementById("stage3App");
  const s4 = document.getElementById("stage4App");
  const s5 = document.getElementById("stage5");

  if (!s4) return;

  if (s5) {
    s5.classList.add("hidden");
    s5.setAttribute("aria-hidden", "true");
  }

  s4.classList.remove("is-hidden");
  s4.classList.add("is-active");
  s4.setAttribute("aria-hidden", "false");

  s4.querySelectorAll(".s4-screen").forEach(x =>
    x.classList.remove("active")
  );

  document.getElementById("s4-opening").classList.add("active");

  if (s3) {
    s3.classList.add("s4-exit");
    setTimeout(() => {
      s3.style.display = "none";
    }, 450);
  }

  s4.scrollIntoView({ behavior: "smooth", block: "start" });
}


document.addEventListener("DOMContentLoaded", () => {

  /* ========== STAGE 3 TO STAGE 4 ========== */

  ["nextStageBtn", "s3NextStageBtn", "stage3ContinueBtn"]
    .forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener("click", openStage4);
    });


  /* ========== OPENING AND MAP ========== */

  document.getElementById("s4OpenBtn")
    ?.addEventListener("click", () => s4Show("s4-map"));

  document.querySelectorAll("#stage4App .s4-node")
    .forEach(b => {
      b.addEventListener("click", () => {
        if (!b.classList.contains("locked")) {
          s4Show("s4-ch" + b.dataset.s4);
        }
      });
    });


  /* ========== CHAPTER 01: HOW IT ALL BEGAN ========== */

  const clueText = [
    "💬 Maybe it was just a conversation at first. Neither of us knew how much would come after it.",
    "✨ Then somewhere between ordinary moments, something started feeling a little less ordinary.",
    "📸 And before we knew it... there were memories worth keeping."
  ];

  let c = 0;

  document.querySelectorAll("#stage4App [data-clue]")
    .forEach(b => {
      b.onclick = () => {
        if (b.classList.contains("done")) return;

        b.classList.add("done");

        document.getElementById("s4-ch1msg").textContent =
          clueText[Number(b.dataset.clue)];

        if (++c === 3) {
          document.getElementById("s4-finish1")
            .classList.remove("hidden");
        }
      };
    });

  document.getElementById("s4-finish1").onclick = () => {
    s4Unlock(1);
    s4Show("s4-map");
  };


  /* ========== CHAPTER 02: THE CHAOS WE CREATED ========== */

  const chaos = [
    "EXHIBIT A: The bloody memorable incident yet most embarassing thing -(you know what I mean).",
    "EXHIBIT B: Somehow we survived this level of nonsense and became closer because of it.",
    "EXHIBIT C: The fact that this is now a core memory is honestly concerning."
  ];

  let spins = 0;
  let busy = false;

  document.getElementById("s4-spin").onclick = async () => {
    if (busy || spins >= 3) return;

    busy = true;
    const box = document.getElementById("s4-roulette");

    for (let i = 0; i < 10; i++) {
      box.textContent =
        chaos[Math.floor(Math.random() * chaos.length)];

      await new Promise(resolve =>
        setTimeout(resolve, 70 + i * 10)
      );
    }

    box.textContent = chaos[spins++];
    document.getElementById("s4-spinCount").textContent = spins;

    busy = false;

    if (spins === 3) {
      document.getElementById("s4-finish2")
        .classList.remove("hidden");
    }
  };

  document.getElementById("s4-finish2").onclick = () => {
    s4Unlock(2);
    s4Show("s4-map");
  };


  /* ========== CHAPTER 03: THE MOMENTS I KEPT ========== */


  const memories = [
    {
      image: "assets\\photos\\us1.jpg",
      message:
        "You probably don't remember this moment... but I remember how it made me feel."
    },
    {
      image: "assets\\photos\\us2.jpg",
      message:
        "This wasn't a huge moment. That's probably why it became one of my favourites."
    },
    {
      image: "assets\\photos\\us 3.jpg",
      message:
        "Some days pass quietly. Somehow, I still kept this one."
    },
    {
      image: "assets\\photos\\us 4.jpg",
      message:
        "And maybe that's what love does. It turns ordinary moments into things you never want to lose."
    }
  ];

  let mem = 0;

  document.querySelectorAll("#stage4App [data-mem]")
    .forEach(b => {
      b.onclick = () => {
        if (b.classList.contains("revealed")) return;

        const i = Number(b.dataset.mem);
        const memory = memories[i];

        if (!memory) return;

        b.classList.add("revealed");

        const placeholder = b.querySelector("div");
        const label = b.querySelector("span");

        if (!placeholder) return;

        // Create and reveal the selected photo.
        const photo = document.createElement("img");
        photo.src = memory.image;
        photo.alt = `Our memory ${i + 1}`;
        photo.className = "s4-revealed-photo";

        photo.onerror = () => {
          photo.alt = "Photo could not be loaded";
          photo.classList.add("s4-photo-error");
          photo.removeAttribute("src");
          photo.alt = "Photo not found";
        };

        placeholder.replaceChildren(photo);

        if (label) {
          label.textContent = "♡";
        }

        // Show the matching romantic message.
        document.getElementById("s4-ch3msg").textContent =
          memory.message;

        mem++;

        // Unlock the next chapter after all four reveals.
        if (mem === memories.length) {
          document.getElementById("s4-finish3")
            .classList.remove("hidden");
        }
      };
    });

  document.getElementById("s4-finish3").onclick = () => {
    s4Unlock(3);
    s4Show("s4-map");
  };


  /* ========== CHAPTER 04: AND HERE WE ARE ========== */

  const dots = [
    "🌱 The beginning. One tiny point that started everything.",
    "😂 Then came the chaos. Apparently, that was part of the plan.",
    "📸 Then came all the moments worth keeping.",
    "❤️ And somehow... every little thing led us here."
  ];

  let d = 0;

  document.querySelectorAll("#stage4App [data-dot]")
    .forEach(b => {
      b.onclick = () => {
        const n = Number(b.dataset.dot);

        if (n !== d + 1) return;

        b.classList.remove("locked-dot");
        d++;

        document.getElementById("s4-connection").textContent =
          dots[d - 1];

        if (d > 1) {
          document.getElementById("s4-l" + (d - 1))
            .classList.add("draw");
        }

        if (d === 4) {
          document.getElementById("s4-heart")
            .classList.add("show");

          document.getElementById("s4-finish4")
            .classList.remove("hidden");
        }
      };
    });

  document.getElementById("s4-finish4").onclick = () => {
    s4Unlock(4);
    s4Show("s4-final");
  };


  /* ========== STAGE 4 TO STAGE 5 ========== */

  document.getElementById("s4-stage5").onclick = () => {
    if (typeof showStage5 === "function") {
      if (typeof playSfx === "function") {
        playSfx("pageFlip", 0.9);
      }

      setTimeout(showStage5, 380);
    }
  };

});


/* ========== SCREEN NAVIGATION ========== */

function s4Show(id) {
  document.querySelectorAll("#stage4App .s4-screen")
    .forEach(x => x.classList.remove("active"));

  const target = document.getElementById(id);

  if (!target) return;

  target.classList.add("active");

  document.getElementById("stage4App")
    .scrollIntoView({ behavior: "smooth", block: "start" });
}


/* ========== CHAPTER UNLOCKING ========== */

function s4Unlock(n) {
  const cur = document.querySelector(
    `#stage4App .s4-node[data-s4="${n}"]`
  );

  if (cur) {
    cur.classList.remove("unlocked");
    cur.querySelector("small").textContent = "COMPLETED ✓";
  }

  const next = document.querySelector(
    `#stage4App .s4-node[data-s4="${n + 1}"]`
  );

  if (next) {
    next.classList.remove("locked");
    next.classList.add("unlocked");
    next.querySelector("small").textContent = "UNLOCKED";
  }
}


const STAGE5_CONFIG={storageKey:"birthdayStage5Progress",photos:[{image:"assets/photos/photo1.jpeg",caption:"Evidence #01: unnecessarily adorable."},{image:"assets/photos/photo2.jpeg",caption:"Evidence #02: caught being suspiciously handsome."},{image:"assets/photos/photo3.jpeg",caption:"Evidence #03: submitted by the cats."},{image:"assets/photos/photo4.jpeg",caption:"Evidence #04: clearly causing problems again."},{image:"assets/photos/photo5.jpeg",caption:"Evidence #05: a very serious investigation subject."},{image:"assets/photos/photo6.jpeg",caption:"Evidence #06: final proof that you're pretty special. ♡"}],onComplete:null};let s5Found=new Set();let s5Ready=false;
function initStage5(){if(s5Ready)return;s5Ready=true;const root=document.getElementById("stage5");if(!root)return;document.getElementById("totalEvidence").textContent=STAGE5_CONFIG.photos.length;loadStage5();document.getElementById("openEvidenceBtn").onclick=()=>{document.getElementById("stage5Intro").classList.add("hidden");document.getElementById("stage5Game").classList.remove("hidden");renderStage5()};document.querySelectorAll("#stage5 .s5-cat").forEach(cat=>cat.onclick=()=>revealStage5(Number(cat.dataset.photo),cat));document.getElementById("stage5ContinueBtn").onclick=()=>{if(typeof STAGE5_CONFIG.onComplete==="function")STAGE5_CONFIG.onComplete();else console.log("Stage 5 complete — connect your final letter here.")};}
function showStage5(){
  initStage5();
  const root=document.getElementById("stage5"), s4=document.getElementById("stage4App");
  if(s4){ s4.classList.remove("is-active"); s4.classList.add("is-hidden"); s4.setAttribute("aria-hidden","true"); }
  document.querySelectorAll(".stage").forEach(x=>{if(x.id!=="stage5")x.classList.add("hidden")});
  root.classList.remove("hidden");
  root.setAttribute("aria-hidden","false");
  document.getElementById("stage5Intro").classList.remove("hidden");
  document.getElementById("stage5Game").classList.add("hidden");
  document.getElementById("stage5Final").classList.add("hidden");
  loadStage5();
  renderStage5();
  window.scrollTo({top:0,behavior:"smooth"});
}
function loadStage5(){try{s5Found=new Set(JSON.parse(localStorage.getItem(STAGE5_CONFIG.storageKey)||"null")?.found||[])}catch{s5Found=new Set()}}
function saveStage5(){localStorage.setItem(STAGE5_CONFIG.storageKey,JSON.stringify({found:[...s5Found],completed:s5Found.size===STAGE5_CONFIG.photos.length}))}
function renderStage5(){const box=document.getElementById("polaroidContainer");if(!box)return;box.innerHTML="";document.querySelectorAll("#stage5 .s5-cat").forEach(c=>c.classList.toggle("used",s5Found.has(Number(c.dataset.photo))));[...s5Found].sort((a,b)=>a-b).forEach(i=>createPolaroid(i,true));document.getElementById("evidenceCount").textContent=s5Found.size}
function revealStage5(i,cat){if(s5Found.has(i)||!STAGE5_CONFIG.photos[i])return;s5Found.add(i);cat.classList.add("used");createPolaroid(i,false);document.getElementById("evidenceCount").textContent=s5Found.size;saveStage5();if(s5Found.size===STAGE5_CONFIG.photos.length)setTimeout(completeStage5,1200)}
function createPolaroid(i,restore){
  const p=STAGE5_CONFIG.photos[i];
  const rotations=[-3,2,-2,3,-1,2];
  const el=document.createElement("article");
  el.className="s5-polaroid";
  el.style.setProperty("--r",rotations[i%rotations.length]+"deg");
  if(restore){
    el.style.animation="none";
    el.style.opacity="1";
    el.style.transform=`rotate(${rotations[i%rotations.length]}deg)`;
  }
  const img=document.createElement("img");
  img.src=p.image;
  img.alt="Birthday memory";
  img.loading="lazy";
  img.onerror=()=>{
    img.alt="Memory photo could not be loaded";
    img.classList.add("s5-image-missing");
  };
  const cap=document.createElement("div");
  cap.textContent=p.caption;
  el.append(img,cap);
  document.getElementById("polaroidContainer").appendChild(el);
}
function completeStage5(){saveStage5();const game=document.getElementById("stage5Game");game.style.transition="opacity .6s ease,transform .6s ease";game.style.opacity="0";setTimeout(()=>{game.classList.add("hidden");game.style.opacity="";document.getElementById("stage5Final").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})},600)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initStage5);else initStage5();



/* =====================================================
   GLOBAL SOUND DESIGN — ALL STAGES
   Uses Web Audio only: no extra audio files required.
===================================================== */

(function(){
  const SOUND_PREF_KEY = "birthdayWebsiteSoundEnabled";
  let soundEnabled = localStorage.getItem(SOUND_PREF_KEY) !== "false";
  let ambientNodes = [];
  let ambientTimer = null;
  let activeStageMusic = null;

  function ensureAudio(){
    if(typeof getAudio === "function"){
      try { return getAudio(); } catch(e){}
    }
    if(!window.audioCtx){
      window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(window.audioCtx.state === "suspended") window.audioCtx.resume();
    return window.audioCtx;
  }

  function safeTone(freq, duration=.12, type="triangle", volume=.05, when=0){
    if(!soundEnabled) return;
    try{
      if(typeof tone === "function"){
        tone(freq, duration, type, volume, when);
      }else{
        const ctx=ensureAudio(), t=ctx.currentTime+when;
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.type=type;
        osc.frequency.setValueAtTime(freq,t);
        gain.gain.setValueAtTime(.0001,t);
        gain.gain.exponentialRampToValueAtTime(volume,t+.008);
        gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t); osc.stop(t+duration+.03);
      }
    }catch(e){}
  }

  window.playSfx = function(name, volume=1){
    if(!soundEnabled) return;

    const patterns = {
      tap: [[520,.055,"sine",.035,0]],
      click: [[420,.07,"triangle",.04,0],[650,.06,"sine",.025,.045]],
      hover: [[760,.045,"sine",.018,0]],
      pageFlip: [
        [190,.055,"triangle",.025,0],
        [330,.07,"triangle",.035,.06],
        [520,.08,"sine",.022,.13]
      ],
      paper: [
        [280,.07,"triangle",.018,0],
        [390,.09,"triangle",.024,.08]
      ],
      whoosh: [
        [180,.12,"sine",.018,0],
        [360,.14,"sine",.024,.07],
        [620,.11,"sine",.014,.15]
      ],
      sparkle: [
        [784,.09,"sine",.028,0],
        [988,.1,"sine",.025,.07],
        [1319,.13,"sine",.02,.15]
      ],
      success: [
        [392,.12,"triangle",.045,0],
        [494,.12,"triangle",.05,.09],
        [659,.18,"sine",.045,.18]
      ],
      camera: [
        [1200,.035,"square",.025,0],
        [700,.07,"triangle",.018,.045]
      ],
      stamp: [
        [95,.055,"square",.035,0],
        [70,.08,"square",.025,.055]
      ],
      giftOpen: [
        [262,.12,"triangle",.03,0],
        [330,.12,"triangle",.035,.1],
        [523,.2,"sine",.04,.2]
      ],
      catPop: [
        [330,.07,"triangle",.03,0],
        [494,.08,"sine",.035,.055],
        [660,.1,"sine",.02,.11]
      ],
      meow: [
        [480,.13,"triangle",.025,0],
        [390,.14,"triangle",.02,.09]
      ],
      reveal: [
        [294,.1,"triangle",.025,0],
        [440,.12,"triangle",.03,.1],
        [660,.18,"sine",.035,.2]
      ]
    };

    (patterns[name] || patterns.click).forEach(p=>{
      safeTone(p[0],p[1],p[2],p[3]*volume,p[4]);
    });
  };

  function stopAmbient(){
    if(ambientTimer) clearInterval(ambientTimer);
    ambientTimer=null;
    ambientNodes.forEach(node=>{
      try{ node.stop?.(); node.disconnect?.(); }catch(e){}
    });
    ambientNodes=[];
    activeStageMusic=null;
  }

  /*
    Very soft procedural "music beds". They are deliberately sparse
    so the existing birthday-song player in Stage 2 remains special.
  */
  function startAmbient(stage){
    if(!soundEnabled) return;
    if(activeStageMusic===stage) return;

    stopAmbient();

    const patterns = {
      stage1: [196,247,294,330],
      stage2: [220,277,330,440],
      stage3: [174,220,262,330],
      stage4: [196,247,294,392],
      stage5: [147,185,220,277]
    };

    const notes = patterns[stage] || patterns.stage3;
    let i=0;

    const playChord = ()=>{
      if(!soundEnabled) return;
      notes.forEach((f,j)=>{
        safeTone(f,.55,"sine",.008, j*.035);
      });
      i=(i+1)%notes.length;
    };

    activeStageMusic=stage;
    playChord();
    ambientTimer=setInterval(playChord, 2400);
  }

  window.startStageAmbient = startAmbient;
  window.stopStageAmbient = stopAmbient;

  function updateSoundButton(){
    const btn=document.getElementById("birthdaySoundToggle");
    if(!btn) return;
    btn.textContent=soundEnabled ? "🔊" : "🔇";
    btn.classList.toggle("is-muted", !soundEnabled);
    btn.setAttribute("aria-pressed", String(soundEnabled));
  }

  function enableSound(){
    soundEnabled=true;
    localStorage.setItem(SOUND_PREF_KEY,"true");
    try{ ensureAudio(); }catch(e){}
    updateSoundButton();
  }

  function disableSound(){
    soundEnabled=false;
    localStorage.setItem(SOUND_PREF_KEY,"false");
    stopAmbient();
    updateSoundButton();
  }

  function toggleSound(){
    if(soundEnabled) disableSound();
    else enableSound();
  }

  document.addEventListener("DOMContentLoaded",()=>{
    updateSoundButton();

    const btn=document.getElementById("birthdaySoundToggle");
    if(btn) btn.addEventListener("click",()=>{
      toggleSound();
      if(soundEnabled){
        try{ ensureAudio(); startAmbient(window.__birthdayActiveStage || "stage1"); playSfx("success",.45); }catch(e){}
      }
    });

    /*
      Every intentional button/touch tap gets a quiet UI click.
      Exclude the sound toggle and guitar gameplay keys because
      the guitar already has its own note sounds.
    */
    document.addEventListener("click",(event)=>{
      const target=event.target.closest("button");
      if(!target || target.id==="birthdaySoundToggle") return;
      if(target.closest("#gameScreen")) return;
      playSfx("tap",.65);
    }, true);

    /*
      Unlock WebAudio after the first real user interaction.
    */
    document.addEventListener("pointerdown",()=>{
      if(soundEnabled){
        try{
          ensureAudio();
          setTimeout(()=>startAmbient(window.__birthdayActiveStage || "stage1"),80);
        }catch(e){}
      }
    },{once:true,passive:true});
  });

  /*
    Start the opening bed. Stage-specific transitions below
    switch it as the player moves through the story.
  */
  startStageAmbient("stage1");

  /* ---------- STAGE 1 ---------- */
  const originalPlayGuitar = window.playGuitar;
  if(typeof originalPlayGuitar === "function"){
    window.playGuitar = function(lane, perfect=false){
      const result=originalPlayGuitar(lane,perfect);
      playSfx("tap", perfect ? .9 : .65);
      return result;
    };
  }

  /*
    Observe the active guitar screen so music changes naturally.
  */
  const guitarStage=document.getElementById("guitarStage");
  if(guitarStage){
    const obs=new MutationObserver(()=>{
      const active=guitarStage.querySelector(".screen.active");
      if(!active) return;

      if(active.id==="gameScreen"){
        startStageAmbient("stage1");
      }
    });
    obs.observe(guitarStage,{subtree:true,attributes:true,attributeFilter:["class"]});
  }

  /* ---------- STAGE 1 → 2 ---------- */
  const unlock=document.getElementById("unlockBtn");
  if(unlock){
    unlock.addEventListener("click",()=>{
      playSfx("success",.9);
      setTimeout(()=>startStageAmbient("stage2"),350);
    });
  }

  const skip=document.getElementById("skipBtn");
  if(skip){
    skip.addEventListener("click",()=>{
      playSfx("whoosh",.8);
      setTimeout(()=>startStageAmbient("stage2"),350);
    });
  }

  /* ---------- STAGE 2 ---------- */
  const nextSpeech=document.getElementById("nextSpeechBtn");
  if(nextSpeech) nextSpeech.addEventListener("click",()=>playSfx("click",.7));

  const landGift=document.getElementById("landGiftBtn");
  if(landGift) landGift.addEventListener("click",()=>{
    playSfx("giftOpen",.8);
    setTimeout(()=>playSfx("whoosh",.45),120);
  });

  const openGift=document.getElementById("openGiftBtn");
  if(openGift) openGift.addEventListener("click",()=>{
    playSfx("giftOpen",1);
    setTimeout(()=>playSfx("sparkle",.7),240);
  });

  const revealLetter=document.getElementById("revealLetterBtn");
  if(revealLetter) revealLetter.addEventListener("click",()=>{
    playSfx("paper",.8);
    setTimeout(()=>playSfx("sparkle",.45),260);
  });

  const continueBtn=document.getElementById("continueBtn");
  if(continueBtn) continueBtn.addEventListener("click",()=>{
    playSfx("pageFlip",.9);
    setTimeout(()=>startStageAmbient("stage3"),350);
  });

  /* ---------- STAGE 3 ---------- */
  const s3Start=document.getElementById("s3-startMission");
  if(s3Start) s3Start.addEventListener("click",()=>{
    playSfx("paper",.65);
    startStageAmbient("stage3");
  });

  const s3Assemble=document.getElementById("s3-assembleBtn");
  if(s3Assemble) s3Assemble.addEventListener("click",()=>{
    playSfx("whoosh",.6);
  });

  document.querySelectorAll("#stage3App .worker").forEach(worker=>{
    worker.addEventListener("click",()=>playSfx("catPop",.65));
  });

  const s3Reveal=document.getElementById("s3-continueLetter");
  if(s3Reveal) s3Reveal.addEventListener("click",()=>{
    playSfx("reveal",.8);
  });

  const envelope=document.getElementById("s3-envelope");
  if(envelope) envelope.addEventListener("click",()=>{
    playSfx("paper",.9);
    setTimeout(()=>playSfx("sparkle",.45),220);
  });

  const openLetter=document.getElementById("s3-openLetter");
  if(openLetter) openLetter.addEventListener("click",()=>{
    playSfx("paper",.9);
  });

  const s3Next=document.getElementById("s3-nextStageBtn");
  if(s3Next) s3Next.addEventListener("click",()=>{
    playSfx("pageFlip",.95);
    setTimeout(()=>startStageAmbient("stage4"),350);
  });

  /* ---------- STAGE 4 ---------- */
  const s4=document.getElementById("stage4App");
  if(s4){
    /*
      Any chapter/map change gets a page-turn sound.
      The existing Stage 4 animation is preserved.
    */
    s4.addEventListener("click",(event)=>{
      const btn=event.target.closest(".s4-node, .s4-btn, .s4-dot");
      if(!btn) return;

      if(btn.id==="s4-spin"){
        playSfx("click",.75);
        return;
      }

      playSfx("pageFlip",.75);
    },true);

    const s4Open=document.getElementById("s4OpenBtn");
    if(s4Open) s4Open.addEventListener("click",()=>{
      playSfx("pageFlip",1);
      setTimeout(()=>startStageAmbient("stage4"),350);
    });

    const s4Stage5=document.getElementById("s4-stage5");
    if(s4Stage5) s4Stage5.addEventListener("click",()=>{
      playSfx("pageFlip",1);
      setTimeout(()=>startStageAmbient("stage5"),350);
    });
  }



/* ---------- STAGE 5: CAT INVESTIGATION ---------- */

const s5 = document.getElementById("stage5");

if (s5) {
  const openEvidence = document.getElementById("openEvidenceBtn");
  const intro = document.getElementById("stage5Intro");
  const game = document.getElementById("stage5Game");
  const finalReport = document.getElementById("stage5Final");
  const continueBtn = document.getElementById("stage5ContinueBtn");
  const polaroidContainer = document.getElementById("polaroidContainer");
  const evidenceCount = document.getElementById("evidenceCount");

  const photos = [
    "assets/photos/photo 4.jpeg",
    "assets/photos/photo 2.jpeg",
    "assets/photos/photo 3.jpeg",
    "assets/photos/photo 1.jpeg",
    "assets/photos/photo 5.jpeg",
    "assets/photos/photo 6.jpeg"
  ];

  const foundPhotos = new Set();
  let reportShown = false;

  if (!game || !polaroidContainer) {
    console.error("Stage 5: game or photo container is missing.");
  } else {
    if (evidenceCount) {
      evidenceCount.textContent = "0";
    }

    // Open the evidence board.
    if (openEvidence) {
      openEvidence.addEventListener("click", () => {
        if (typeof playSfx === "function") {
          playSfx("stamp", 0.75);
        }

        if (typeof startStageAmbient === "function") {
          startStageAmbient("stage5");
        }

        intro?.classList.add("hidden");
        game.classList.remove("hidden");
      });
    }

    // Reveal a photo when its cat is clicked.
    s5.addEventListener("click", (event) => {
      const cat = event.target.closest(".s5-cat");

      if (!cat || !s5.contains(cat)) return;
      if (game.classList.contains("hidden")) return;
      if (cat.disabled) return;

      const index = Number(cat.dataset.photo);

      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= photos.length ||
        foundPhotos.has(index)
      ) {
        return;
      }

      if (typeof playSfx === "function") {
        playSfx("catPop", 0.9);
        setTimeout(() => playSfx("camera", 0.65), 160);
      }

      foundPhotos.add(index);
      cat.classList.add("used");
      cat.disabled = true;
      cat.setAttribute("aria-pressed", "true");

      const polaroid = document.createElement("div");
      polaroid.className = "s5-polaroid";

      const rotations = [-4, 3, -2, 4, -3, 2];
      polaroid.style.setProperty(
        "--r",
        `${rotations[index]}deg`
      );

      const img = document.createElement("img");
      img.src = photos[index];
      img.alt = `Birthday boy photo ${index + 1}`;
      img.loading = "lazy";

      const caption = document.createElement("p");
      caption.textContent =
        `EVIDENCE #${String(index + 1).padStart(2, "0")} ♡`;

      img.addEventListener("error", () => {
        img.alt = "Photo could not be loaded";
        caption.textContent = "PHOTO NOT FOUND";
        console.error("Stage 5 photo not found:", photos[index]);
      });

      polaroid.append(img, caption);
      polaroidContainer.appendChild(polaroid);

      if (evidenceCount) {
        evidenceCount.textContent = String(foundPhotos.size);
      }

      // Show the final report after all six photos are revealed.
      if (foundPhotos.size === photos.length && !reportShown) {
        reportShown = true;

        setTimeout(() => {
          game.classList.add("hidden");
          finalReport?.classList.remove("hidden");

          if (typeof playSfx === "function") {
            playSfx("success", 1);
            setTimeout(() => playSfx("sparkle", 0.7), 260);
          }
        }, 1000);
      }
    });

    // Continue to the final video stage.
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        if (typeof playSfx === "function") {
          playSfx("pageFlip", 0.95);
        }

        if (typeof window.openStage6 === "function") {
          window.openStage6();
        } else {
          console.error(
            "Stage 6 has not initialized. Check its script."
          );
        }
      });
    }
  }
}

})();



/* =====================================================
   STAGE 6 — FINAL PERSONAL VIDEO MESSAGE
   Stage 5 -> soft transition -> video -> closing message
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const stage = document.getElementById("finalVideoStage");
  const stage5Continue = document.getElementById("stage5ContinueBtn");
  const card = document.getElementById("birthdayVideoCard");
  const poster = document.getElementById("birthdayVideoPoster");
  const playBtn = document.getElementById("playBirthdayVideo");
  const video = document.getElementById("birthdayMessageVideo");
  const finished = document.getElementById("videoFinishedMessage");

  if (!stage || !stage5Continue || !card || !poster ||
      !playBtn || !video) return;

  // Ensure the video is not muted.
  video.muted = false;
  video.defaultMuted = false;
  video.volume = 1;

  function resetVideoStage() {
    card.classList.remove("playing");
    poster.style.display = "flex";
    finished?.classList.add("hidden");

    video.pause();
    video.muted = false;
    video.volume = 1;

    try {
      video.currentTime = 0;
    } catch (error) {
      console.warn("Could not reset video time:", error);
    }
  }

  window.openStage6 = function () {
    const app = document.getElementById("app");
    const s3 = document.getElementById("stage3App");
    const s4 = document.getElementById("stage4App");
    const s5 = document.getElementById("stage5");

    [app, s3, s4, s5].forEach(root => {
      if (!root) return;

      root.classList.add("hidden");
      root.classList.remove("is-active");
      root.setAttribute("aria-hidden", "true");
      root.style.removeProperty("display");
    });

    stage.classList.remove("hidden");
    stage.setAttribute("aria-hidden", "false");

    resetVideoStage();

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });

    if (typeof playSfx === "function") {
      playSfx("pageFlip", 0.9);
      setTimeout(() => playSfx("whoosh", 0.55), 240);
      setTimeout(() => playSfx("sparkle", 0.45), 620);
    }
  };

  // Connect Stage 5's completion to Stage 6.
  if (typeof STAGE5_CONFIG !== "undefined") {
    STAGE5_CONFIG.onComplete = window.openStage6;
  }

  // Play the video with audio after the user's click.
  playBtn.addEventListener("click", async () => {
    card.classList.add("playing");
    playBtn.disabled = true;

    video.muted = false;
    video.defaultMuted = false;
    video.volume = 1;

    if (typeof playSfx === "function") {
      playSfx("success", 0.45);
    }

    try {
      await video.play();
      poster.style.display = "none";
    } catch (error) {
      console.error("Video playback failed:", error);
      card.classList.remove("playing");
      poster.style.display = "flex";
      playBtn.disabled = false;
    }
  });

  video.addEventListener("play", () => {
    if (typeof startStageAmbient === "function") {
      startStageAmbient("final");
    }
  });

  video.addEventListener("ended", () => {
    finished?.classList.remove("hidden");

    if (typeof playSfx === "function") {
      playSfx("success", 0.7);
      setTimeout(() => playSfx("sparkle", 0.55), 260);
    }

    finished?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  // If the video is replayed using the native controls,
  // hide the closing message until it finishes again.
  video.addEventListener("play", () => {
    finished?.classList.add("hidden");
  });

  video.addEventListener("error", () => {
    console.error(
      "Video error:",
      video.error?.message || "Unable to load video."
    );
    poster.style.display = "flex";
    card.classList.remove("playing");
    playBtn.disabled = false;
  });
});
