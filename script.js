/* =========================================================
   BIRTHDAY WEBSITE — SCRIPT.JS
   Stage 1: locked gift screen interactions
   Stage 2: Bengali literature crossword
   Stage 3 (crossword success): leads into Stage 4
   Stage 4: open-the-gift sequence + page-turn transition
   Stage 5: our little memories (polaroid scrapbook board)
   Stage 6: a few things I love about you (flower garden)
   Stage 7: our little story (paginated storybook)
   Stage 8: if I could give you... (six little gifts)
   Stage 9: our little soundtrack (music player + cassette)
   Stage 10: a letter I want you to keep (envelope + letter)
   Stage 11: one more thing... (hidden-object hunt + big reveal)
   Stage 12: happy birthday (FINAL STAGE — no Stage 13)

   Sections in this file:
   1. CROSSWORD_DATA  — the answer key / grid layout / clues
   2. Locked gift screen logic
   3. Crossword engine (grid build, navigation, hints, checking)
   4. Stage 4 — open-the-gift sequence
   5. Stage 5 — memory stickers, photo lightbox, next-memory turn
   6. Stage 6 — flower garden notes, hidden bonus flower, progress
   7. Stage 7 — book opening, paginated chapters, hidden heart
   8. Stage 8 — mini gift boxes, card overlay, progress counter
   9. Stage 9 — audio player, cassette flip, hidden doodle, ending
   10. Stage 10 — envelope opening, letter, P.S. note, ending
   11. Stage 11 — object hunt, key/lock, big reveal, final joke
   12. Stage 12 — final scrapbook opening, cake, collage, closing,
       "one last thing" note, THE END, subtle replay-to-Stage-1
   13. Page-turn transition + direct-test URL hash shortcuts
   ========================================================= */

/* =========================================================
   1. CROSSWORD DATA
   ---------------------------------------------------------
   This grid was generated programmatically so every answer
   genuinely interlocks (shared letters at every intersection).
   row/col are 0-indexed grid coordinates. dir: "A" = across,
   "D" = down. "number" is the clue number shown in its
   starting cell.

   TO CUSTOMIZE: edit the "clue" or "hints" text for any word
   freely — just don't change "word", "row", "col", or "dir",
   since those define the grid geometry.
   ========================================================= */

const CROSSWORD_DATA = {"rows":28,"cols":24,"entries":[{"word":"RABINDRANATH","row":13,"col":7,"dir":"A","number":15,"clue":"The Nobel-winning poet whose 'Song Offerings' first carried his verses to the world stage.","hints":["He also wrote the national anthems of both India and Bangladesh.","His short stories include a homesick fruit-seller and a lonely rural postmaster.","First name only — no surname needed here."]},{"word":"KABULIWALA","row":12,"col":8,"dir":"D","number":14,"clue":"A dry-fruit seller from Kabul finds an unlikely friendship in Calcutta with a little girl who reminds him of his own daughter back home.","hints":["A Tagore short story.","The little girl in the story is named Mini.","The title names the seller's homeland, not his profession."]},{"word":"POSTMASTER","row":4,"col":13,"dir":"D","number":4,"clue":"A lonely government employee posted to a remote village grows fond of the orphan girl who looks after him — then leaves her behind.","hints":["Another Tagore short story, often published alongside Kabuliwala.","The girl left behind is named Ratan.","His job title is, literally, the answer."]},{"word":"MUSKETEERS","row":8,"col":17,"dir":"D","number":8,"clue":"D'Artagnan joins three legendary swordsmen sworn to serve the king of France.","hints":["Alexandre Dumas wrote their story.","Their motto: all for one, one for all.","The answer is plural — count them."]},{"word":"SHARADINDU","row":7,"col":10,"dir":"D","number":6,"clue":"The Bengali author who preferred to call his sleuth a 'truth-seeker' rather than a detective.","hints":["His detective's first case is titled Satyanweshi.","His surname is Bandyopadhyay.","Only his first name is needed here."]},{"word":"DURGAPUJA","row":13,"col":12,"dir":"D","number":16,"clue":"Five autumn days when the goddess visits her father's home before returning to Kailash.","hints":["Bengal's biggest festival.","Dhak drums and pandal-hopping define it.","Two Bengali words, joined as one answer."]},{"word":"GITANJALI","row":9,"col":15,"dir":"D","number":9,"clue":"The collection whose English rendering, 'Song Offerings,' won its poet a Nobel Prize in 1913.","hints":["Tagore's own translation impressed W. B. Yeats.","The title literally means 'song offering.'","Not Sonar Tori — this is the Nobel-winning one."]},{"word":"PARINEETA","row":19,"col":0,"dir":"A","number":20,"clue":"A childhood bond between neighbours Lalita and Shekhar is complicated by a secret marriage no one is supposed to know about.","hints":["A Sarat Chandra novel, later a well-loved film.","The title means roughly 'the married one.'","Not Devdas — a different heroine entirely."]},{"word":"SRIKANTA","row":21,"col":1,"dir":"A","number":22,"clue":"A restless wanderer narrates his own life across four volumes, forever drawn back to the woman he cannot marry.","hints":["Sarat Chandra's most autobiographical novel.","The woman he loves is Rajlakshmi.","The title is simply the narrator's own name."]},{"word":"KAKABABU","row":15,"col":1,"dir":"A","number":17,"clue":"A one-legged adventurer travels the world with his nephew, solving mysteries wherever history has buried a secret.","hints":["Created by Sunil Gangopadhyay.","His nephew and assistant is Santu.","His real name is Raja Roy Chowdhury — this is his nickname."]},{"word":"BYOMKESH","row":5,"col":11,"dir":"A","number":5,"clue":"A Calcutta sleuth solves his very first case while living among the suspects as a lodger, undercover.","hints":["Created by Sharadindu Bandyopadhyay.","His companion and biographer is named Ajit.","He'd rather be called a satyanweshi than a detective — but this is his name."]},{"word":"TARANATH","row":8,"col":3,"dir":"A","number":7,"clue":"A wandering tantrik recounts his brushes with black magic and the occult to anyone willing to listen over tea.","hints":["Created by Bibhutibhushan Bandyopadhyay.","Each tale is a confession of a supernatural encounter from his younger days.","'Tantrik' is his epithet — only his first name is the answer."]},{"word":"NIBARAN","row":21,"col":6,"dir":"D","number":23,"clue":"A man who gains the power to read every mind around him discovers that knowing everyone's secrets is its own curse.","hints":["The central character of Avik Sarkar's 'Kaakchokkhu.'","His strange gift shares its name with a mythical crow's-eye vision.","The answer is the protagonist's first name."]},{"word":"SANDESH","row":10,"col":17,"dir":"A","number":11,"clue":"A chhena-based sweet, moulded into a hundred shapes, that no Bengali celebration table is complete without.","hints":["Not rosogolla — this one is drier and often shaped like fruit or flowers.","K.C. Das and Balaram Mullick are famous makers of it.","It's also, coincidentally, the name of a beloved Bengali children's magazine."]},{"word":"DEVDAS","row":11,"col":2,"dir":"D","number":13,"clue":"A wealthy man's self-destructive love for his childhood sweetheart drives him toward ruin, while another woman waits for him faithfully.","hints":["Sarat Chandra's most-filmed novel.","Paro and Chandramukhi are the two women in his life.","The title is the doomed hero's own name."]},{"word":"MAHESH","row":8,"col":17,"dir":"A","number":8,"clue":"A poor farmer's devotion to his starving bull ends in a tragedy that exposes the cruelty of a drought-stricken village.","hints":["A Sarat Chandra short story, not a novel.","The farmer is named Gafur; the title character is his bull.","The answer is the bull's name."]},{"word":"FELUDA","row":10,"col":4,"dir":"D","number":10,"clue":"A Calcutta private investigator's quiet Darjeeling holiday turns considerably less peaceful after he crosses paths with the smuggler Maganlal Meghraj.","hints":["Created by Satyajit Ray.","His real name is Prodosh Chandra Mitter.","His younger cousin narrates most of his cases."]},{"word":"TOPSHE","row":0,"col":16,"dir":"D","number":1,"clue":"The teenage cousin whose notebooks preserve the adventures of Calcutta's sharpest private eye.","hints":["His formal name is Tapesh Ranjan Mitter.","He's Feluda's younger cousin, not his brother.","He narrates most of the stories."]},{"word":"JATAYU","row":20,"col":12,"dir":"A","number":21,"clue":"A wildly imaginative crime novelist becomes an unlikely but beloved travel companion on a detective's cases, despite mangling his facts.","hints":["His real name is Lalmohan Ganguly.","He writes pulpy adventure novels under this pen name.","Named after a mythological vulture from the Ramayana."]},{"word":"SONADA","row":17,"col":17,"dir":"A","number":19,"clue":"A treasure-hunting 'dada' — part scholar, part adventurer — leads two teenage cousins across India chasing centuries-old riddles, on the big screen.","hints":["Not from a novel — created directly for Bengali cinema.","First appeared in 'Guptodhoner Sandhane' (2018).","Played by Abir Chatterjee, who's also played Byomkesh and Feluda."]},{"word":"HOLMES","row":10,"col":23,"dir":"D","number":12,"clue":"A pipe-smoking Baker Street detective solves cases through deduction, aided by a loyal doctor friend.","hints":["Created by Arthur Conan Doyle.","His arch-nemesis is Professor Moriarty.","Surname only needed."]},{"word":"VERITY","row":4,"col":3,"dir":"D","number":2,"clue":"A struggling author is hired to finish a bestselling series and discovers her predecessor's disturbingly honest unfinished memoir.","hints":["A psychological thriller by Colleen Hoover.","The manuscript reveals dark truths about a marriage.","The title is also the missing novelist's name."]},{"word":"MOULI","row":17,"col":4,"dir":"A","number":18,"clue":"In a fog-wrapped village, a young man's fascination with a woman rumoured to carry a witch's bloodline draws him into danger.","hints":["The female lead of Sayak Aman's 'Kuashar Phool.'","Her name means 'crown' or 'wreath' in Bengali.","The young man who falls for her is named Sayan."]},{"word":"NIREN","row":4,"col":7,"dir":"D","number":3,"clue":"A relentless investigator crosses centuries chasing a goddess's lost staff to save a girl trapped in the underworld.","hints":["The protagonist of Souvik Chakraborty's 'Mahasindhur Opar Theke.'","His surname is Bhaduri.","Only his first name is needed here."]}]};

const MAX_HINTS = 3;

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     2. LOCKED GIFT SCREEN
     ========================================================= */

  const giftWrap = document.getElementById('giftBox');
  const giftBox = giftWrap.querySelector('.gift-box');
  const nudgeMsg = document.getElementById('nudgeMsg');
  const playBtn = document.getElementById('playBtn');

  const nudgeMessages = [
    "Nice try 😌 You have to earn this one first!",
    "Uh-uh 😏 Not so fast.",
    "Patience... the game comes first 🧩",
    "Hehe, nope. Go play first! 🎀"
  ];

  let nudgeTimeout = null;

  function shakeGift() {
    giftBox.classList.remove('shake');
    void giftBox.offsetWidth;
    giftBox.classList.add('shake');
  }

  function showNudge() {
    const message = nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)];
    nudgeMsg.textContent = message;
    nudgeMsg.classList.add('show');
    clearTimeout(nudgeTimeout);
    nudgeTimeout = setTimeout(() => nudgeMsg.classList.remove('show'), 2400);
  }

  function handleLockedGiftInteraction() {
    shakeGift();
    showNudge();
  }

  giftWrap.addEventListener('click', handleLockedGiftInteraction);
  giftWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLockedGiftInteraction();
    }
  });

  playBtn.addEventListener('click', () => {
    goToPage('page-crossword');
    if (!crosswordBuilt) {
      buildCrossword();
      crosswordBuilt = true;
    }
  });

  /* =========================================================
     PAGE TRANSITIONS
     ========================================================= */

  function goToPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageId);
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =========================================================
     3. CROSSWORD ENGINE
     ========================================================= */

  let crosswordBuilt = false;

  // cellModel["r,c"] = { letter, number|null, across: entryRef|null, down: entryRef|null }
  const cellModel = new Map();
  let hintsUsed = 0;
  let selected = null;       // { r, c }
  let currentDir = 'A';      // 'A' | 'D'
  let currentEntry = null;   // the entry object currently active

  const gridEl = document.getElementById('cwGrid');
  const activeNumberEl = document.getElementById('cwActiveNumber');
  const activeDirEl = document.getElementById('cwActiveDir');
  const activeTextEl = document.getElementById('cwActiveText');
  const acrossListEl = document.getElementById('cwAcrossList');
  const downListEl = document.getElementById('cwDownList');
  const hintBtn = document.getElementById('cwHintBtn');
  const hintCountEl = document.getElementById('cwHintCount');
  const checkBtn = document.getElementById('cwCheckBtn');
  const feedbackEl = document.getElementById('cwFeedback');
  const progressBar = document.getElementById('cwProgressBar');
  const filledCountEl = document.getElementById('cwFilledCount');
  const totalCountEl = document.getElementById('cwTotalCount');

  function cellKey(r, c) { return r + ',' + c; }

  function buildCrossword() {
    const { rows, cols, entries } = CROSSWORD_DATA;

    entries.forEach(entry => {
      for (let i = 0; i < entry.word.length; i++) {
        const r = entry.dir === 'A' ? entry.row : entry.row + i;
        const c = entry.dir === 'A' ? entry.col + i : entry.col;
        const key = cellKey(r, c);
        if (!cellModel.has(key)) {
          cellModel.set(key, { letter: entry.word[i], number: null, across: null, down: null });
        }
        const cell = cellModel.get(key);
        if (entry.dir === 'A') cell.across = entry;
        else cell.down = entry;
        if (i === 0) cell.number = entry.number;
      }
    });

    gridEl.style.setProperty('--cw-cols', cols);
    const fragment = document.createDocumentFragment();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = cellKey(r, c);
        const model = cellModel.get(key);
        const cellDiv = document.createElement('div');

        if (!model) {
          cellDiv.className = 'cw-cell cw-block';
          fragment.appendChild(cellDiv);
          continue;
        }

        cellDiv.className = 'cw-cell';
        cellDiv.dataset.row = r;
        cellDiv.dataset.col = c;

        if (model.number) {
          const numSpan = document.createElement('span');
          numSpan.className = 'cw-cell-number';
          numSpan.textContent = model.number;
          cellDiv.appendChild(numSpan);
        }

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.autocomplete = 'off';
        input.autocapitalize = 'characters';
        input.spellcheck = false;
        input.inputMode = 'text';
        input.dataset.row = r;
        input.dataset.col = c;

        input.addEventListener('focus', () => selectCell(r, c, null));
        input.addEventListener('click', () => selectCell(r, c, null));
        input.addEventListener('keydown', onCellKeydown);
        input.addEventListener('input', onCellInput);

        cellDiv.appendChild(input);
        fragment.appendChild(cellDiv);
      }
    }

    gridEl.appendChild(fragment);

    const acrossEntries = entries.filter(e => e.dir === 'A').sort((a, b) => a.number - b.number);
    const downEntries = entries.filter(e => e.dir === 'D').sort((a, b) => a.number - b.number);

    acrossEntries.forEach(entry => acrossListEl.appendChild(buildClueItem(entry)));
    downEntries.forEach(entry => downListEl.appendChild(buildClueItem(entry)));

    totalCountEl.textContent = countLetterCells();

    const firstEntry = entries.slice().sort((a, b) => a.number - b.number)[0];
    selectCell(firstEntry.row, firstEntry.col, firstEntry.dir);

    updateProgress();
  }

  function buildClueItem(entry) {
    const li = document.createElement('li');
    li.className = 'cw-clue-item';
    li.dataset.entryKey = entry.dir + entry.number;
    li.innerHTML = `<span class="cw-clue-num">${entry.number}.</span>${escapeHtml(entry.clue)}`;
    li.addEventListener('click', () => {
      selectCell(entry.row, entry.col, entry.dir);
      focusCell(entry.row, entry.col);
    });
    return li;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function countLetterCells() {
    return cellModel.size;
  }

  function getCellDiv(r, c) {
    return gridEl.querySelector(`.cw-cell[data-row="${r}"][data-col="${c}"]`);
  }

  function getInput(r, c) {
    const div = getCellDiv(r, c);
    return div ? div.querySelector('input') : null;
  }

  function focusCell(r, c) {
    const input = getInput(r, c);
    if (input) input.focus();
  }

  /* ---------- selection / active word highlighting ---------- */

  function selectCell(r, c, forceDir) {
    const model = cellModel.get(cellKey(r, c));
    if (!model) return;

    let dir = forceDir;

    if (!dir) {
      if (selected && selected.r === r && selected.c === c) {
        if (currentDir === 'A' && model.down) dir = 'D';
        else if (currentDir === 'D' && model.across) dir = 'A';
        else dir = currentDir;
      } else {
        if (currentDir === 'A' && model.across) dir = 'A';
        else if (currentDir === 'D' && model.down) dir = 'D';
        else dir = model.across ? 'A' : 'D';
      }
    }

    if (dir === 'A' && !model.across) dir = 'D';
    if (dir === 'D' && !model.down) dir = 'A';

    selected = { r, c };
    currentDir = dir;
    currentEntry = dir === 'A' ? model.across : model.down;

    renderHighlight();
    renderActiveClue();
  }

  function renderHighlight() {
    gridEl.querySelectorAll('.cw-cell').forEach(div => {
      div.classList.remove('active-cell', 'active-word');
    });

    if (!currentEntry) return;

    for (let i = 0; i < currentEntry.word.length; i++) {
      const r = currentEntry.dir === 'A' ? currentEntry.row : currentEntry.row + i;
      const c = currentEntry.dir === 'A' ? currentEntry.col + i : currentEntry.col;
      const div = getCellDiv(r, c);
      if (div) div.classList.add('active-word');
    }

    const activeDiv = getCellDiv(selected.r, selected.c);
    if (activeDiv) activeDiv.classList.add('active-cell');

    document.querySelectorAll('.cw-clue-item').forEach(li => li.classList.remove('selected'));
    const key = currentEntry.dir + currentEntry.number;
    const activeLi = document.querySelector(`.cw-clue-item[data-entry-key="${key}"]`);
    if (activeLi) {
      activeLi.classList.add('selected');
      activeLi.scrollIntoView({ block: 'nearest' });
    }
  }

  function renderActiveClue() {
    if (!currentEntry) return;
    activeNumberEl.textContent = currentEntry.number;
    activeDirEl.textContent = currentEntry.dir === 'A' ? 'Across' : 'Down';
    activeTextEl.textContent = currentEntry.clue;
  }

  /* ---------- typing / navigation ---------- */

  function onCellInput(e) {
    const input = e.target;
    let val = input.value.toUpperCase().replace(/[^A-Z]/g, '');
    val = val.slice(-1);
    input.value = val;

    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);
    clearCellStatus(r, c);

    if (val) {
      moveToNextCell(r, c);
    }

    updateProgress();
  }

  function clearCellStatus(r, c) {
    const div = getCellDiv(r, c);
    if (div) div.classList.remove('incorrect-cell', 'correct-cell');
  }

  function moveToNextCell(r, c) {
    if (!currentEntry) return;
    const idx = currentEntry.dir === 'A' ? c - currentEntry.col : r - currentEntry.row;
    const nextIdx = idx + 1;
    if (nextIdx < currentEntry.word.length) {
      const nr = currentEntry.dir === 'A' ? currentEntry.row : currentEntry.row + nextIdx;
      const nc = currentEntry.dir === 'A' ? currentEntry.col + nextIdx : currentEntry.col;
      selectCell(nr, nc, currentEntry.dir);
      focusCell(nr, nc);
    }
  }

  function moveToPrevCell(r, c) {
    if (!currentEntry) return;
    const idx = currentEntry.dir === 'A' ? c - currentEntry.col : r - currentEntry.row;
    const prevIdx = idx - 1;
    if (prevIdx >= 0) {
      const pr = currentEntry.dir === 'A' ? currentEntry.row : currentEntry.row + prevIdx;
      const pc = currentEntry.dir === 'A' ? currentEntry.col + prevIdx : currentEntry.col;
      selectCell(pr, pc, currentEntry.dir);
      focusCell(pr, pc);
    }
  }

  function onCellKeydown(e) {
    const input = e.target;
    const r = parseInt(input.dataset.row, 10);
    const c = parseInt(input.dataset.col, 10);

    switch (e.key) {
      case 'Backspace':
        if (input.value) {
          input.value = '';
          clearCellStatus(r, c);
          updateProgress();
        } else {
          moveToPrevCell(r, c);
          const prevInput = document.activeElement;
          if (prevInput && prevInput.tagName === 'INPUT') {
            prevInput.value = '';
            updateProgress();
          }
        }
        e.preventDefault();
        break;
      case 'ArrowRight':
        stepGrid(r, c, 0, 1);
        e.preventDefault();
        break;
      case 'ArrowLeft':
        stepGrid(r, c, 0, -1);
        e.preventDefault();
        break;
      case 'ArrowDown':
        stepGrid(r, c, 1, 0);
        e.preventDefault();
        break;
      case 'ArrowUp':
        stepGrid(r, c, -1, 0);
        e.preventDefault();
        break;
      case 'Enter':
        selectCell(r, c, null);
        e.preventDefault();
        break;
      default:
        break;
    }
  }

  function stepGrid(r, c, dr, dc) {
    let nr = r + dr;
    let nc = c + dc;
    while (nr >= 0 && nr < CROSSWORD_DATA.rows && nc >= 0 && nc < CROSSWORD_DATA.cols) {
      if (cellModel.has(cellKey(nr, nc))) {
        const forcedDir = dr !== 0 ? 'D' : 'A';
        const model = cellModel.get(cellKey(nr, nc));
        const dir = forcedDir === 'D' && model.down ? 'D' : (forcedDir === 'A' && model.across ? 'A' : currentDir);
        selectCell(nr, nc, dir);
        focusCell(nr, nc);
        return;
      }
      nr += dr;
      nc += dc;
    }
  }

  /* ---------- progress ---------- */

  function updateProgress() {
    let filled = 0;
    cellModel.forEach((model, key) => {
      const [r, c] = key.split(',').map(Number);
      const input = getInput(r, c);
      if (input && input.value) filled++;
    });
    const total = countLetterCells();
    filledCountEl.textContent = filled;
    progressBar.style.width = Math.round((filled / total) * 100) + '%';
  }

  /* ---------- hints ---------- */

  hintBtn.addEventListener('click', () => {
    if (hintsUsed >= MAX_HINTS) return;
    if (!currentEntry) return;

    hintsUsed++;
    hintCountEl.textContent = MAX_HINTS - hintsUsed;

    const hintIndex = Math.min(hintsUsed - 1, currentEntry.hints.length - 1);
    feedbackEl.classList.remove('success');
    feedbackEl.textContent = `💡 ${currentEntry.hints[hintIndex]}`;

    if (hintsUsed >= MAX_HINTS) {
      hintBtn.disabled = true;
    }
  });

  /* ---------- check answers ---------- */

  checkBtn.addEventListener('click', () => {
    let allCorrect = true;

    cellModel.forEach((model, key) => {
      const [r, c] = key.split(',').map(Number);
      const input = getInput(r, c);
      const div = getCellDiv(r, c);
      if (!input || !div) return;

      div.classList.remove('correct-cell', 'incorrect-cell');

      if (!input.value) {
        allCorrect = false;
        return;
      }

      if (input.value === model.letter) {
        div.classList.add('correct-cell');
      } else {
        div.classList.add('incorrect-cell');
        allCorrect = false;
      }
    });

    if (allCorrect) {
      onCrosswordSolved();
    } else {
      feedbackEl.classList.remove('success');
      feedbackEl.textContent = 'Not quite... 😭 Your birthday present is still locked.';
      setTimeout(() => {
        if (!feedbackEl.classList.contains('success')) {
          feedbackEl.textContent = 'Think about the stories again.';
        }
      }, 2200);
    }
  });

  function onCrosswordSolved() {
    feedbackEl.classList.add('success');
    feedbackEl.textContent = "You got every single one! 🎉";
    launchConfetti();
    setTimeout(() => {
      goToPage('page-success');
    }, 1400);
  }

  /* ---------- confetti ---------- */

  function launchConfetti() {
    const colors = ['#f0b7c4', '#a9cde6', '#e3c273', '#fdf7ea', '#8fb9d6'];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (2.2 + Math.random() * 1.6) + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 4200);
    }
  }

  /* =========================================================
     4. STAGE 4: OPEN THE GIFT
     ---------------------------------------------------------
     Self-contained: doesn't depend on any crossword state, so
     this stage works correctly even if someone jumps straight
     to it (e.g. via the #stage4 testing shortcut below).
     ========================================================= */

  const toGiftOpenBtn = document.getElementById('toGiftOpenBtn');
  const openGiftBtn = document.getElementById('openGiftBtn');
  const bigGift = document.getElementById('bigGift');
  const bigGiftBox = document.getElementById('bigGiftBox');
  const bigGiftLid = document.getElementById('bigGiftLid');
  const bigGiftBow = document.getElementById('bigGiftBow');
  const giftSparkles = document.getElementById('giftSparkles');
  const insideReveal = document.getElementById('insideReveal');
  const postOpenContent = document.getElementById('postOpenContent');
  const letsGoBtn = document.getElementById('letsGoBtn');

  let giftOpened = false;

  toGiftOpenBtn.addEventListener('click', () => {
    goToPage('page-gift-open');
  });

  openGiftBtn.addEventListener('click', () => {
    if (giftOpened) return;
    giftOpened = true;
    openGiftSequence();
  });

  function openGiftSequence() {
    // stop the idle float so the deliberate open animation reads clearly
    bigGift.classList.add('opening');

    // 1. a little shake, like the box knows it's about to be opened
    bigGiftBox.classList.add('big-gift-box-shake');

    setTimeout(() => {
      // 2. ribbon/bow comes undone
      bigGiftBow.classList.add('bow-untie');

      // 3. lid lifts open
      bigGift.classList.add('lid-open');

      // 4. sparkle burst around the box
      giftSparkles.classList.remove('sparkle-burst');
      void giftSparkles.offsetWidth; // restart animation
      giftSparkles.classList.add('sparkle-burst');
      launchLocalConfetti(bigGift);

      // 5. reveal what's inside
      setTimeout(() => {
        insideReveal.classList.add('show');
      }, 260);

      // 6. fade the Open It button away, then reveal the next message + button
      setTimeout(() => {
        openGiftBtn.disabled = true;
        postOpenContent.classList.remove('hidden');
        requestAnimationFrame(() => postOpenContent.classList.add('reveal'));
      }, 700);

    }, 550);
  }

  letsGoBtn.addEventListener('click', () => {
    pageTurnTransition('page-gift-open', '#giftOpenCard', 'page-stage5', '#stage5Card');
  });

  /* ---------- localized confetti burst around a given element ---------- */

  function launchLocalConfetti(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const colors = ['#f0b7c4', '#a9cde6', '#e3c273', '#fdf7ea', '#8fb9d6'];
    const count = 34;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const left = rect.left + rect.width * Math.random();
      piece.style.left = left + 'px';
      piece.style.top = (rect.top + rect.height * 0.3) + 'px';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.6 + Math.random() * 1.3) + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3400);
    }
  }

  /* =========================================================
     5. STAGE 5: OUR LITTLE MEMORIES
     ---------------------------------------------------------
     Self-contained: sticker notes + photo lightbox + the
     "Next Memory" page-turn all work independent of earlier
     stages, so this page functions correctly even when opened
     directly (see the #stage5 hash shortcut below).
     ========================================================= */

  const memStickers = document.querySelectorAll('.mem-sticker');
  const memNotes = {
    heart: document.getElementById('noteHeart'),
    star: document.getElementById('noteStar'),
    flower: document.getElementById('noteFlower')
  };

  memStickers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.note;
      const note = memNotes[key];
      const isOpen = !note.classList.contains('hidden');

      // only one note open at a time
      Object.values(memNotes).forEach(n => n.classList.add('hidden'));

      if (!isOpen) {
        note.classList.remove('hidden');
      }
    });
  });

  // clicking anywhere else closes any open sticky note
  document.addEventListener('click', (e) => {
    if (e.target.closest('.mem-sticker') || e.target.closest('.sticky-note')) return;
    Object.values(memNotes).forEach(n => n.classList.add('hidden'));
  });

  // ---------- photo lightbox: enlarge + center + dim the rest ----------

  const memoryCards = document.querySelectorAll('.memory-card');
  const memLightbox = document.getElementById('memLightbox');
  const memLightboxBackdrop = document.getElementById('memLightboxBackdrop');
  const memLightboxClose = document.getElementById('memLightboxClose');
  const memLightboxImg = document.getElementById('memLightboxImg');
  const memLightboxCaption = document.getElementById('memLightboxCaption');

  memoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      memLightboxImg.src = img.src;
      memLightboxImg.alt = img.alt;
      memLightboxCaption.textContent = card.dataset.caption || '';
      memLightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeMemLightbox() {
    memLightbox.classList.add('hidden');
    document.body.style.overflow = '';
  }

  memLightboxBackdrop.addEventListener('click', closeMemLightbox);
  memLightboxClose.addEventListener('click', closeMemLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !memLightbox.classList.contains('hidden')) {
      closeMemLightbox();
    }
  });

  // ---------- "Next Memory" → page turn into Stage 6 ----------

  const nextMemoryBtn = document.getElementById('nextMemoryBtn');
  nextMemoryBtn.addEventListener('click', () => {
    pageTurnTransition('page-stage5', '#stage5Card', 'page-stage6', '#gardenCard');
  });

  /* =========================================================
     6. STAGE 6: A FEW THINGS I LOVE ABOUT YOU
     ---------------------------------------------------------
     Self-contained flower garden: 8 counted flowers + 1 hidden
     bonus flower. Works independently of earlier stages.
     ========================================================= */

  const TOTAL_FLOWERS = 8;
  const openedFlowers = new Set();

  const flowerCountEl = document.getElementById('flowerCount');
  const gardenProgress = document.getElementById('gardenProgress');
  const stage6NextBtn = document.getElementById('stage6NextBtn');

  document.querySelectorAll('.flower-item[data-flower]').forEach(item => {
    const flowerId = item.dataset.flower;
    if (flowerId === 'secret') return; // handled separately below

    const visual = item.querySelector('.flower-visual');
    const note = document.getElementById(`note-flower-${flowerId}`);

    visual.addEventListener('click', () => {
      const isOpen = !note.classList.contains('hidden');

      note.classList.toggle('hidden');

      if (!isOpen) {
        visual.classList.remove('opened');
        void visual.offsetWidth; // restart pop animation
        visual.classList.add('opened');

        if (!openedFlowers.has(flowerId)) {
          openedFlowers.add(flowerId);
          updateGardenProgress();
        }
      }
    });
  });

  function updateGardenProgress() {
    const count = openedFlowers.size;

    if (count >= TOTAL_FLOWERS) {
      gardenProgress.innerHTML = 'You found them all! <span aria-hidden="true">🌸</span>';
      revealStage6NextButton();
    } else {
      flowerCountEl.textContent = count;
    }
  }

  function revealStage6NextButton() {
    stage6NextBtn.classList.remove('hidden');
    requestAnimationFrame(() => stage6NextBtn.classList.add('reveal'));
  }

  stage6NextBtn.addEventListener('click', () => {
    pageTurnTransition('page-stage6', '#gardenCard', 'page-stage7', '#storyCard');
  });

  // ---------- the hidden bonus flower ----------

  const secretFlowerBtn = document.getElementById('secretFlowerBtn');
  const secretOverlay = document.getElementById('secretOverlay');
  const secretBackdrop = document.getElementById('secretBackdrop');
  const secretClose = document.getElementById('secretClose');
  const secretLine2 = document.getElementById('secretLine2');
  const secretHearts = document.getElementById('secretHearts');

  let secretHeartInterval = null;

  secretFlowerBtn.addEventListener('click', () => {
    secretOverlay.classList.remove('hidden');
    secretLine2.classList.add('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      secretLine2.classList.remove('hidden');
      startSecretHearts();
    }, 900);
  });

  function closeSecretOverlay() {
    secretOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    stopSecretHearts();
  }

  secretBackdrop.addEventListener('click', closeSecretOverlay);
  secretClose.addEventListener('click', closeSecretOverlay);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !secretOverlay.classList.contains('hidden')) {
      closeSecretOverlay();
    }
  });

  function startSecretHearts() {
    spawnSecretHeart();
    secretHeartInterval = setInterval(spawnSecretHeart, 500);
  }

  function stopSecretHearts() {
    clearInterval(secretHeartInterval);
    secretHeartInterval = null;
    secretHearts.innerHTML = '';
  }

  function spawnSecretHeart() {
    const heart = document.createElement('span');
    heart.className = 'secret-heart';
    heart.textContent = '♡';
    heart.style.left = (10 + Math.random() * 80) + '%';
    heart.style.animationDuration = (2 + Math.random() * 0.8) + 's';
    secretHearts.appendChild(heart);
    setTimeout(() => heart.remove(), 2900);
  }

  /* =========================================================
     7. STAGE 7: OUR LITTLE STORY
     ---------------------------------------------------------
     TO EDIT CHAPTERS: just change the text/img fields below —
     nothing else in this file needs to change. secretOn:true
     marks the one chapter that carries the hidden heart doodle.
     ========================================================= */

  const STORY_DATA = [
    {
      label: 'Chapter 1',
      title: 'The beginning of us.',
      text: "It was the start of an era, our troupe got made, and oath to be eachother's partner in crime was sworn.",
      img: 'story1.jpg',
      doodle: '✦'
    },
    {
      label: 'Chapter 2',
      title: 'And then there was us.',
      text: "Somehow our whole childhood became just two of us,but it never made us lonely or bored but the more we grew together the more we wanted to secure this bond forever.",
      img: 'story2.jpg',
      doodle: '✧'
    },
    {
      label: 'Chapter 3',
      title: 'The silly moments',
      text: "we had lots of our silly moments, probably they are too ordinary but to us they are the most precious ones.",
      img: 'story3.jpg',
      doodle: '❀',
      secretOn: true
    },
    {
      label: 'Chapter 4',
      title: 'The moments I kept',
      text: "you have always been the person I can be myself with. we get mad at each other, we get sad at each other, we get happy at each other but we always come back to each other.",
      img: 'story4.jpg',
      doodle: '✿'
    },
    {
      label: 'Chapter 5',
      title: 'Everything in between',
      text: "we had our ups and downs, but through it all, we remained inseparable.",
      img: 'story5.png',
      doodle: '✧'
    },
    {
      label: 'Chapter 6',
      title: "And we're not finished yet…",
      text: "This isn't the end of our story. It's just another page. As you turn the page, I hope you know that I will always be by your side, and I will always love you. There will be lots of waves , tornados but dont you worry I will fly with you!!!",
      img: 'story6.jpg',
      doodle: '✦'
    }
  ];

  const storyIntro = document.getElementById('storyIntro');
  const storyBookGraphic = document.getElementById('storyBookGraphic');
  const openStoryBtn = document.getElementById('openStoryBtn');
  const storyOpenSparkles = document.getElementById('storyOpenSparkles');
  const storyPages = document.getElementById('storyPages');
  const storyFinal = document.getElementById('storyFinal');

  const chapterCard = document.getElementById('chapterCard');
  const chapterTape = document.getElementById('chapterTape');
  const chapterDoodle = document.getElementById('chapterDoodle');
  const chapterLabel = document.getElementById('chapterLabel');
  const chapterTitle = document.getElementById('chapterTitle');
  const chapterImg = document.getElementById('chapterImg');
  const chapterText = document.getElementById('chapterText');
  const chapterSecretHeart = document.getElementById('chapterSecretHeart');
  const chapterSecretNote = document.getElementById('chapterSecretNote');

  const storyPrevBtn = document.getElementById('storyPrevBtn');
  const storyNextBtn = document.getElementById('storyNextBtn');
  const storyPageIndicator = document.getElementById('storyPageIndicator');
  const storyBackBtn = document.getElementById('storyBackBtn');
  const turnPageBtn = document.getElementById('turnPageBtn');

  let currentChapter = 0; // 0-indexed into STORY_DATA
  let onFinalPage = false;

  // ---------- opening the book ----------

  openStoryBtn.addEventListener('click', () => {
    openStoryBtn.disabled = true;
    storyBookGraphic.classList.add('opening');
    spawnStorySparkles();

    setTimeout(() => {
      storyIntro.classList.add('hidden');
      storyPages.classList.remove('hidden');
      renderChapter(0, null);
    }, 1100); // deliberately unhurried, like a real book opening
  });

  function spawnStorySparkles() {
    const glyphs = ['✦', '✧', '♡', '✿'];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.position = 'absolute';
      el.style.left = (10 + Math.random() * 80) + '%';
      el.style.top = (20 + Math.random() * 60) + '%';
      el.style.fontSize = (12 + Math.random() * 10) + 'px';
      el.style.color = Math.random() > 0.5 ? '#e3c273' : '#f0b7c4';
      el.style.opacity = '0';
      el.style.animation = `sparkleBurstPop ${0.9 + Math.random() * 0.6}s ease forwards`;
      el.style.animationDelay = (Math.random() * 0.5) + 's';
      storyOpenSparkles.appendChild(el);
      setTimeout(() => el.remove(), 2000);
    }
  }

  // ---------- rendering a chapter ----------

  function renderChapter(index, direction) {
    const data = STORY_DATA[index];

    chapterLabel.textContent = data.label;
    chapterTitle.textContent = data.title;
    chapterText.textContent = data.text;
    chapterImg.src = data.img;
    chapterImg.alt = data.title + ' — replace with your own photo';
    chapterDoodle.textContent = data.doodle;

    chapterTape.style.background = index % 2 === 0 ? 'var(--ribbon-pink)' : 'var(--box-blue)';

    // the hidden secret heart only appears on the chapter marked secretOn
    chapterSecretNote.classList.add('hidden');
    if (data.secretOn) {
      chapterSecretHeart.classList.remove('hidden');
    } else {
      chapterSecretHeart.classList.add('hidden');
    }

    storyPageIndicator.textContent = `Page ${index + 1} / ${STORY_DATA.length}`;
    storyPrevBtn.disabled = index === 0;
    storyNextBtn.textContent = '';
    storyNextBtn.innerHTML = index === STORY_DATA.length - 1
      ? 'Next Page <span aria-hidden="true">→</span>'
      : 'Next Page <span aria-hidden="true">→</span>';
  }

  function turnToChapter(newIndex, direction) {
    chapterCard.style.setProperty('--turn-dir', direction === 'next' ? '-18px' : '18px');
    chapterCard.style.setProperty('--turn-rot', direction === 'next' ? '-2deg' : '2deg');

    chapterCard.classList.add('turning-out');

    setTimeout(() => {
      renderChapter(newIndex, direction);
      chapterCard.classList.remove('turning-out');
      chapterCard.classList.add('turning-in');
      setTimeout(() => chapterCard.classList.remove('turning-in'), 420);
    }, 260);
  }

  storyNextBtn.addEventListener('click', () => {
    if (currentChapter < STORY_DATA.length - 1) {
      currentChapter++;
      turnToChapter(currentChapter, 'next');
    } else {
      goToFinalPage();
    }
  });

  storyPrevBtn.addEventListener('click', () => {
    if (currentChapter > 0) {
      currentChapter--;
      turnToChapter(currentChapter, 'prev');
    }
  });

  function goToFinalPage() {
    onFinalPage = true;
    storyPages.classList.add('hidden');
    storyFinal.classList.remove('hidden');
  }

  storyBackBtn.addEventListener('click', () => {
    onFinalPage = false;
    storyFinal.classList.add('hidden');
    storyPages.classList.remove('hidden');
    renderChapter(currentChapter, 'prev');
  });

  // ---------- the hidden heart on Chapter 3 ----------

  chapterSecretHeart.addEventListener('click', (e) => {
    e.stopPropagation();
    chapterSecretNote.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('.chapter-secret-heart') || e.target.closest('.chapter-secret-note')) return;
    chapterSecretNote.classList.add('hidden');
  });

  // ---------- turn the page → Stage 8 ----------

  turnPageBtn.addEventListener('click', () => {
    pageTurnTransition('page-stage7', '#storyCard', 'page-stage8', '#giftsCard');
  });

  /* =========================================================
     8. STAGE 8: IF I COULD GIVE YOU...
     ---------------------------------------------------------
     TO EDIT MESSAGES: everything lives in GIFT_DATA below —
     title, message paragraphs, optional footer/signature/heart
     illustration/animated hearts, and the "important" flag for
     gift 6. Nothing else in this file needs to change.
     ========================================================= */

  const GIFT_DATA = {
    1: {
      title: 'For the days you doubt yourself',
      message: ["Please remember that you are so much more capable, lovable and wonderful than you sometimes give yourself credit for."],
      footer: 'Keep this one. ♡'
    },
    2: {
      title: 'A little reminder',
      message: ["You are loved.", "Not because of what you do for me,", "but simply because you are you."]
    },
    3: {
      title: 'For the bad days',
      message: ["On the days when everything feels too much, I hope you remember that you don't always have to handle everything alone."],
      footer: "I'll be here. ♡"
    },
    4: {
      title: 'For your pocket',
      message: ["A tiny emergency dose of me."],
      heart: true,
      footer: 'Use whenever you miss me.'
    },
    5: {
      title: 'Just because',
      message: ["I don't really need a reason to give you something.", "Sometimes I just want to make you smile."],
      animatedHearts: true
    },
    6: {
      title: 'This one is actually important.',
      message: [
        "If I could give you one thing in this entire world, I'd give you the ability to see yourself the way I see you, even just for a moment.",
        "Maybe then you'd understand why you mean so much to me.",
        "And maybe you'd finally understand why I'm so lucky to call you my sister. ♡",
        "I have said too much good things about you , don't expect muchh now go shoo shoo!!"
      ],
      signature: '— me',
      important: true,
      animatedHearts: true
    }
  };

  const TOTAL_GIFTS = 6;
  const openedGifts = new Set();

  const giftsOpenedCountEl = document.getElementById('giftsOpenedCount');
  const giftsProgress = document.getElementById('giftsProgress');
  const giftsFollowup = document.getElementById('giftsFollowup');
  const giftsContinueBtn = document.getElementById('giftsContinueBtn');

  const giftCardOverlay = document.getElementById('giftCardOverlay');
  const giftCardBackdrop = document.getElementById('giftCardBackdrop');
  const giftCardEl = document.getElementById('giftCardEl');
  const giftCardTitle = document.getElementById('giftCardTitle');
  const giftCardMessage = document.getElementById('giftCardMessage');
  const giftCardHeart = document.getElementById('giftCardHeart');
  const giftCardFooter = document.getElementById('giftCardFooter');
  const giftCardSignature = document.getElementById('giftCardSignature');
  const giftCardHearts = document.getElementById('giftCardHearts');
  const putBackBtn = document.getElementById('putBackBtn');

  let activeGiftId = null;
  let giftHeartInterval = null;

  document.querySelectorAll('.gift-item[data-gift]').forEach(item => {
    const id = item.dataset.gift;
    const trigger = item.querySelector('.gift-trigger');
    trigger.addEventListener('click', () => openMiniGift(id));
  });

  function openMiniGift(id) {
    const wrap = document.getElementById(`mg-wrap-${id}`);
    const box = document.getElementById(`mg-box-${id}`);
    const bow = document.getElementById(`mg-bow-${id}`);
    const sparkles = document.getElementById(`mg-sparkles-${id}`);
    const data = GIFT_DATA[id];
    const isImportant = !!data.important;

    wrap.classList.add('opening');
    box.classList.add('big-gift-box-shake');

    const openDelay = isImportant ? 850 : 500; // gift 6 opens slower, more deliberately

    setTimeout(() => {
      bow.classList.add('bow-untie');
      wrap.classList.add('lid-open');

      sparkles.classList.remove('sparkle-burst');
      void sparkles.offsetWidth;
      sparkles.classList.add('sparkle-burst');
      launchLocalConfetti(wrap);

      setTimeout(() => {
        showGiftCard(id);
      }, isImportant ? 500 : 320);

    }, openDelay);
  }

  function showGiftCard(id) {
    const data = GIFT_DATA[id];
    activeGiftId = id;

    giftCardTitle.textContent = data.title;

    giftCardMessage.innerHTML = '';
    data.message.forEach(line => {
      const p = document.createElement('p');
      p.textContent = line;
      giftCardMessage.appendChild(p);
    });

    giftCardHeart.classList.toggle('hidden', !data.heart);

    if (data.footer) {
      giftCardFooter.textContent = data.footer;
      giftCardFooter.classList.remove('hidden');
    } else {
      giftCardFooter.classList.add('hidden');
    }

    if (data.signature) {
      giftCardSignature.textContent = data.signature;
      giftCardSignature.classList.remove('hidden');
    } else {
      giftCardSignature.classList.add('hidden');
    }

    giftCardEl.classList.toggle('important-card', !!data.important);

    giftCardOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (data.animatedHearts) {
      startGiftHearts();
    }

    if (!openedGifts.has(id)) {
      openedGifts.add(id);
      updateGiftsProgress();
    }
  }

  function closeGiftCard() {
    giftCardOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    stopGiftHearts();

    if (activeGiftId) {
      resetMiniGift(activeGiftId);
      activeGiftId = null;
    }
  }

  function resetMiniGift(id) {
    const wrap = document.getElementById(`mg-wrap-${id}`);
    const box = document.getElementById(`mg-box-${id}`);
    const bow = document.getElementById(`mg-bow-${id}`);
    const sparkles = document.getElementById(`mg-sparkles-${id}`);

    wrap.classList.remove('opening', 'lid-open');
    box.classList.remove('big-gift-box-shake');
    bow.classList.remove('bow-untie');
    sparkles.classList.remove('sparkle-burst');
  }

  putBackBtn.addEventListener('click', closeGiftCard);
  giftCardBackdrop.addEventListener('click', closeGiftCard);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !giftCardOverlay.classList.contains('hidden')) {
      closeGiftCard();
    }
  });

  function updateGiftsProgress() {
    const count = openedGifts.size;
    giftsOpenedCountEl.textContent = count;

    if (count >= TOTAL_GIFTS) {
      giftsProgress.innerHTML = 'Okay&hellip; you found everything. <span aria-hidden="true">♡</span>';

      setTimeout(() => {
        giftsFollowup.classList.remove('hidden');
      }, 500);

      setTimeout(() => {
        giftsContinueBtn.classList.remove('hidden');
        requestAnimationFrame(() => giftsContinueBtn.classList.add('reveal'));
      }, 1500);
    }
  }

  function startGiftHearts() {
    spawnGiftHeart();
    giftHeartInterval = setInterval(spawnGiftHeart, 550);
  }

  function stopGiftHearts() {
    clearInterval(giftHeartInterval);
    giftHeartInterval = null;
    giftCardHearts.innerHTML = '';
  }

  function spawnGiftHeart() {
    const heart = document.createElement('span');
    heart.className = 'secret-heart'; // reuse the existing floating-heart animation
    heart.textContent = '♡';
    heart.style.left = (10 + Math.random() * 80) + '%';
    heart.style.animationDuration = (2 + Math.random() * 0.8) + 's';
    giftCardHearts.appendChild(heart);
    setTimeout(() => heart.remove(), 2900);
  }

  giftsContinueBtn.addEventListener('click', () => {
    pageTurnTransition('page-stage8', '#giftsCard', 'page-stage9', '#songCard');
  });

  /* =========================================================
     9. STAGE 9: OUR LITTLE SOUNDTRACK
     ---------------------------------------------------------
     TO REPLACE: swap assets/our-song.mp3 and images/song-cover.jpg
     for your own files, and edit #songTitleText / #songArtistText
     in index.html. Everything else keeps working unchanged.
     ========================================================= */

  const songIntro = document.getElementById('songIntro');
  const playOurSongBtn = document.getElementById('playOurSongBtn');
  const songPlayer = document.getElementById('songPlayer');
  const songCards = document.getElementById('songCards');
  const flipCassetteWrap = document.getElementById('flipCassetteWrap');
  const nowPlayingLabel = document.getElementById('nowPlayingLabel');

  const ourSongAudio = document.getElementById('ourSongAudio');
  const playerPlayBtn = document.getElementById('playerPlayBtn');
  const playerPlayIcon = document.getElementById('playerPlayIcon');
  const playerProgress = document.getElementById('playerProgress');
  const currentTimeText = document.getElementById('currentTimeText');
  const durationText = document.getElementById('durationText');
  const playerVolume = document.getElementById('playerVolume');
  const reelLeft = document.getElementById('reelLeft');
  const reelRight = document.getElementById('reelRight');
  const songNotesFloat = document.getElementById('songNotesFloat');
  const equalizer = document.getElementById('equalizer');

  let hasInteractedWithPlayer = false;
  let noteFloatInterval = null;

  // ---------- revealing the player (first "Play Our Song" press) ----------

  playOurSongBtn.addEventListener('click', () => {
    songIntro.classList.add('hidden');
    songPlayer.classList.remove('hidden');
    songCards.classList.remove('hidden');
    flipCassetteWrap.classList.remove('hidden');
    attemptPlay();
  });

  function formatTime(seconds) {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function attemptPlay() {
    const playPromise = ourSongAudio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {
        // no audio file available yet — the UI still works fully once one is added
        console.warn('Could not play audio — add assets/our-song.mp3 to enable playback.');
      });
    }
  }

  playerPlayBtn.addEventListener('click', () => {
    if (ourSongAudio.paused) {
      attemptPlay();
    } else {
      ourSongAudio.pause();
    }
  });

  ourSongAudio.addEventListener('play', () => {
    playerPlayIcon.textContent = '⏸';
    reelLeft.classList.add('spinning');
    reelRight.classList.add('spinning');
    equalizer.classList.remove('hidden');
    nowPlayingLabel.classList.remove('hidden');
    startFloatingNotes();
    markPlayerInteracted();
  });

  ourSongAudio.addEventListener('pause', () => {
    playerPlayIcon.textContent = '▶';
    reelLeft.classList.remove('spinning');
    reelRight.classList.remove('spinning');
    equalizer.classList.add('hidden');
    stopFloatingNotes();
  });

  ourSongAudio.addEventListener('ended', () => {
    playerPlayIcon.textContent = '▶';
    reelLeft.classList.remove('spinning');
    reelRight.classList.remove('spinning');
    equalizer.classList.add('hidden');
    stopFloatingNotes();
  });

  ourSongAudio.addEventListener('loadedmetadata', () => {
    durationText.textContent = formatTime(ourSongAudio.duration);
  });

  ourSongAudio.addEventListener('timeupdate', () => {
    currentTimeText.textContent = formatTime(ourSongAudio.currentTime);
    if (ourSongAudio.duration) {
      playerProgress.value = (ourSongAudio.currentTime / ourSongAudio.duration) * 100;
    }
  });

  playerProgress.addEventListener('input', () => {
    if (ourSongAudio.duration) {
      ourSongAudio.currentTime = (playerProgress.value / 100) * ourSongAudio.duration;
    }
  });

  playerVolume.addEventListener('input', () => {
    ourSongAudio.volume = playerVolume.value / 100;
  });
  ourSongAudio.volume = playerVolume.value / 100;

  function startFloatingNotes() {
    spawnFloatingNote();
    noteFloatInterval = setInterval(spawnFloatingNote, 700);
  }

  function stopFloatingNotes() {
    clearInterval(noteFloatInterval);
    noteFloatInterval = null;
  }

  function spawnFloatingNote() {
    const glyphs = ['♪', '♫', '♩'];
    const note = document.createElement('span');
    note.className = 'floating-note';
    note.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    note.style.left = (10 + Math.random() * 80) + '%';
    note.style.animationDuration = (2.2 + Math.random() * 0.8) + 's';
    songNotesFloat.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }

  // ---------- the hidden music-note doodle ----------

  const songHiddenDoodle = document.getElementById('songHiddenDoodle');
  const songHiddenNote = document.getElementById('songHiddenNote');

  songHiddenDoodle.addEventListener('click', (e) => {
    e.stopPropagation();
    songHiddenNote.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (e.target.closest('#songHiddenDoodle') || e.target.closest('#songHiddenNote')) return;
    songHiddenNote.classList.add('hidden');
  });


  // ---------- the flip cassette easter egg ----------

  const flipCassette = document.getElementById('flipCassette');
  flipCassette.addEventListener('click', () => {
    flipCassette.classList.toggle('flipped');
  });

  // ---------- ending sequence, revealed after first interaction ----------

  const songEnding = document.getElementById('songEnding');
  const endingLine2 = document.getElementById('endingLine2');
  const endingHeart = document.getElementById('endingHeart');
  const oneLastPageBtn = document.getElementById('oneLastPageBtn');

  function markPlayerInteracted() {
    if (hasInteractedWithPlayer) return;
    hasInteractedWithPlayer = true;

    songEnding.classList.remove('hidden');

    setTimeout(() => endingLine2.classList.remove('hidden'), 900);
    setTimeout(() => endingHeart.classList.remove('hidden'), 1900);
    setTimeout(() => {
      oneLastPageBtn.classList.remove('hidden');
      requestAnimationFrame(() => oneLastPageBtn.classList.add('reveal'));
    }, 2600);
  }

  oneLastPageBtn.addEventListener('click', () => {
    pageTurnTransition('page-stage9', '#songCard', 'page-stage10', '#letterCard');
  });

  /* =========================================================
     10. STAGE 10: A LETTER I WANT YOU TO KEEP
     ---------------------------------------------------------
     TO EDIT THE LETTER: just rewrite the text inside #letterBody
     in index.html — every <p class="letter-line"> is plain text.
     Wrap any word in <span class="underline-word"> to underline it.
     Nothing in this file needs to change.
     ========================================================= */

  const envelopeIntro = document.getElementById('envelopeIntro');
  const envelope = document.getElementById('envelope');
  const openLetterBtn = document.getElementById('openLetterBtn');
  const envelopeHearts = document.getElementById('envelopeHearts');
  const letterSection = document.getElementById('letterSection');

  openLetterBtn.addEventListener('click', () => {
    openLetterBtn.disabled = true;
    envelope.classList.add('opening');
    spawnFloatingPaperHearts();

    setTimeout(() => {
      envelopeIntro.classList.add('hidden');
      letterSection.classList.remove('hidden');
      revealLetterEnding();
    }, 1300); // slow and deliberate — this moment shouldn't feel rushed
  });

  function spawnFloatingPaperHearts() {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-paper-heart';
      heart.textContent = '♡';
      heart.style.left = (15 + Math.random() * 70) + '%';
      heart.style.animationDelay = (Math.random() * 0.6) + 's';
      heart.style.animationDuration = (2 + Math.random() * 0.8) + 's';
      envelopeHearts.appendChild(heart);
      setTimeout(() => heart.remove(), 3200);
    }
  }

  // ---------- P.S. hidden note ----------

  const psTrigger = document.getElementById('psTrigger');
  const psNote = document.getElementById('psNote');

  psTrigger.addEventListener('click', () => {
    psNote.classList.toggle('hidden');
  });

  // ---------- ending, revealed once the letter is opened ----------

  const oneMoreSurpriseBtn = document.getElementById('oneMoreSurpriseBtn');

  function revealLetterEnding() {
    setTimeout(() => {
      oneMoreSurpriseBtn.classList.remove('hidden');
      requestAnimationFrame(() => oneMoreSurpriseBtn.classList.add('reveal'));
    }, 1200);
  }

  oneMoreSurpriseBtn.addEventListener('click', () => {
    pageTurnTransition('page-stage10', '#letterCard', 'page-stage11', '#huntCard');
  });

  /* =========================================================
     11. STAGE 11: ONE MORE THING...
     ---------------------------------------------------------
     TO EDIT: the final surprise message lives in #surpriseMessage
     in index.html — replace those paragraphs freely. Swap
     images/surprise-photo.jpg for your own photo. Nothing else
     in this file needs to change.
     ========================================================= */

  const huntIntro = document.getElementById('huntIntro');
  const findItBtn = document.getElementById('findItBtn');
  const huntScene = document.getElementById('huntScene');
  const huntProgress = document.getElementById('huntProgress');
  const huntFeedback = document.getElementById('huntFeedback');
  const huntKey = document.getElementById('huntKey');
  const huntLockedBox = document.getElementById('huntLockedBox');
  const boxHint = document.getElementById('boxHint');
  const lbLock = document.getElementById('lbLock');
  const keyNote = document.getElementById('keyNote');
  const huntReveal = document.getElementById('huntReveal');
  const revealBurst = document.getElementById('revealBurst');
  const lockClickSound = document.getElementById('lockClickSound');

  let keyFound = false;
  let boxOpened = false;
  let feedbackTimeout = null;

  findItBtn.addEventListener('click', () => {
    findItBtn.disabled = true;
    huntIntro.classList.add('hidden');
    huntScene.classList.remove('hidden');
  });

  // ---------- decoy objects ----------

  document.querySelectorAll('.hunt-obj[data-response]').forEach(obj => {
    obj.addEventListener('click', () => {
      obj.classList.remove('shake-wrong');
      void obj.offsetWidth;
      obj.classList.add('shake-wrong');
      showHuntFeedback(obj.dataset.response);
    });
  });

  function showHuntFeedback(text) {
    huntFeedback.textContent = text;
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
      huntFeedback.textContent = '\u00a0';
    }, 2000);
  }

  // ---------- the key ----------

  huntKey.addEventListener('click', () => {
    if (keyFound) return;
    keyFound = true;
    huntKey.classList.add('key-found');

    const keyRect = huntKey.getBoundingClientRect();
    const boxRect = huntLockedBox.getBoundingClientRect();
    const flyX = (boxRect.left + boxRect.width / 2) - (keyRect.left + keyRect.width / 2);
    const flyY = (boxRect.top + boxRect.height / 2) - (keyRect.top + keyRect.height / 2);
    huntKey.style.setProperty('--fly-x', flyX + 'px');
    huntKey.style.setProperty('--fly-y', flyY + 'px');

    huntProgress.textContent = '1/1 secret found ♡';
    keyNote.classList.remove('hidden');

    requestAnimationFrame(() => {
      huntKey.classList.add('key-fly');
    });

    setTimeout(() => {
      huntKey.style.visibility = 'hidden';
      huntLockedBox.classList.add('highlighted');
      boxHint.classList.remove('hidden');
      keyNote.classList.add('hidden');
    }, 900);
  });

  // ---------- the locked box ----------

  huntLockedBox.addEventListener('click', () => {
    if (boxOpened) return;

    if (!keyFound) {
      showHuntFeedback("It's locked&hellip; you'll need to find the key first. 🔒".replace('&hellip;', '…'));
      huntLockedBox.classList.remove('box-shaking');
      void huntLockedBox.offsetWidth;
      huntLockedBox.classList.add('box-shaking');
      return;
    }

    boxOpened = true;
    boxHint.classList.add('hidden');
    huntLockedBox.classList.remove('highlighted');
    huntLockedBox.classList.add('box-shaking');

    try {
      lockClickSound.currentTime = 0;
      const p = lockClickSound.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* optional sound — safe to ignore if unavailable */ }

    setTimeout(() => {
      huntLockedBox.classList.add('box-opened');
      huntProgress.textContent = 'SECRET UNLOCKED ✨';
    }, 300);

    // dramatic pause before the big reveal
    setTimeout(() => {
      launchLocalConfetti(huntLockedBox);
      spawnHuntBurst();
    }, 900);

    setTimeout(() => {
      huntScene.classList.add('hidden');
      huntReveal.classList.remove('hidden');
      runRevealSequence();
    }, 1500);
  });

  function spawnHuntBurst() {
    const glyphs = ['♡', '✦', '✧', '✿', '❀', '★'];
    const rect = huntLockedBox.getBoundingClientRect();
    const count = 16;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.position = 'fixed';
      el.style.left = (rect.left + rect.width / 2) + 'px';
      el.style.top = (rect.top + rect.height / 2) + 'px';
      el.style.fontSize = (14 + Math.random() * 12) + 'px';
      el.style.color = Math.random() > 0.5 ? '#e3c273' : '#f0b7c4';
      el.style.zIndex = '999';
      el.style.pointerEvents = 'none';
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 90;
      el.style.setProperty('--fly-x', Math.cos(angle) * dist + 'px');
      el.style.setProperty('--fly-y', Math.sin(angle) * dist + 'px');
      el.style.animation = `sparkleBurstPop ${0.9 + Math.random() * 0.5}s ease forwards`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  }

  // ---------- the big reveal sequence ----------

  const surprisePhotoWrap = document.getElementById('surprisePhotoWrap');
  const jokeLine2 = document.getElementById('jokeLine2');
  const jokeLine3 = document.getElementById('jokeLine3');
  const okayNowGoBtn = document.getElementById('okayNowGoBtn');

  function runRevealSequence() {
    setTimeout(() => surprisePhotoWrap.classList.add('show'), 500);
    setTimeout(() => jokeLine2.classList.remove('hidden'), 1600);
    setTimeout(() => jokeLine3.classList.remove('hidden'), 2600);
    setTimeout(() => {
      okayNowGoBtn.classList.remove('hidden');
      requestAnimationFrame(() => okayNowGoBtn.classList.add('reveal'));
    }, 3400);
  }

  okayNowGoBtn.addEventListener('click', () => {
    launchConfetti();
    setTimeout(() => {
      pageTurnTransition('page-stage11', '#huntCard', 'page-stage12', '#finaleCard');
    }, 500);
  });

  /* =========================================================
     12. STAGE 12: HAPPY BIRTHDAY (FINAL STAGE)
     ---------------------------------------------------------
     TO EDIT: the birthday message lives in #finaleMessage, the
     closing note in #finaleClosingSection, and the "one last
     thing" lines are #ltLine1..#ltLine4 — all plain text in
     index.html. Swap images/final-photo.jpg for your own photo.
     This is the last stage; there is no Stage 13 to wire up.
     ========================================================= */

  const finaleIntro = document.getElementById('finaleIntro');
  const filLine2 = document.getElementById('filLine2');
  const filLine3 = document.getElementById('filLine3');
  const openFinaleBtn = document.getElementById('openFinaleBtn');
  const finaleBookGraphic = document.getElementById('finaleBookGraphic');
  const finaleGlimpse = document.getElementById('finaleGlimpse');
  const finalePage = document.getElementById('finalePage');

  // ---------- intro: staggered lines, then the book appears ----------

  setTimeout(() => {
    filLine2.classList.remove('hidden');
  }, 700);

  setTimeout(() => {
    filLine3.classList.remove('hidden');
    openFinaleBtn.classList.remove('hidden');
  }, 1500);

  openFinaleBtn.addEventListener('click', () => {
    openFinaleBtn.disabled = true;
    finaleBookGraphic.classList.add('opening');

    // quick glimpses of the journey while the book opens
    const glimpses = ['🖼️', '🌸', '🎁', '📼', '💌', '🔑', '♡'];
    finaleGlimpse.classList.remove('hidden');
    let gi = 0;
    const glimpseInterval = setInterval(() => {
      finaleGlimpse.textContent = glimpses[gi % glimpses.length];
      finaleGlimpse.style.animation = 'none';
      void finaleGlimpse.offsetWidth;
      finaleGlimpse.style.animation = 'glimpseFlash 0.18s ease';
      gi++;
    }, 170);

    setTimeout(() => {
      clearInterval(glimpseInterval);
      finaleIntro.classList.add('hidden');
      finalePage.classList.remove('hidden');
      runFinaleRevealSequence();
    }, 1300);
  });

  // ---------- staggered reveal of the whole final page ----------

  const finaleHB2 = document.getElementById('finaleHB2');
  const finaleSub1 = document.getElementById('finaleSub1');
  const finaleSub2 = document.getElementById('finaleSub2');
  const finaleSub3 = document.getElementById('finaleSub3');
  const finalePhotoWrap = document.getElementById('finalePhotoWrap');
  const finaleMessage = document.getElementById('finaleMessage');
  const finaleCakeSection = document.getElementById('finaleCakeSection');
  const finaleCollageSection = document.getElementById('finaleCollageSection');
  const finaleClosingSection = document.getElementById('finaleClosingSection');
  const finaleLastthingSection = document.getElementById('finaleLastthingSection');
  const finaleEnd = document.getElementById('finaleEnd');
  const miniPlaySong = document.getElementById('miniPlaySong');

  function runFinaleRevealSequence() {
    setTimeout(() => finaleHB2.classList.remove('hidden'), 400);
    setTimeout(() => finaleSub1.classList.remove('hidden'), 1100);
    setTimeout(() => finaleSub2.classList.remove('hidden'), 1700);
    setTimeout(() => finaleSub3.classList.remove('hidden'), 2300);
    setTimeout(() => finalePhotoWrap.classList.remove('hidden'), 3000);
    setTimeout(() => finaleMessage.classList.remove('hidden'), 3600);
    setTimeout(() => finaleCakeSection.classList.remove('hidden'), 4400);

    // everything below the cake waits for the candles to be blown out
    // (see the cake click handler), except the "one last thing" trigger
    // and mini play-song control, which can appear once the page settles.
    setTimeout(() => {
      checkMiniPlaySong();
    }, 4600);
  }

  function checkMiniPlaySong() {
    // the Stage 9 <audio> element keeps playing in the background across
    // stages even while hidden, so we only need a manual control if the
    // user never pressed play (or paused it) earlier in the journey.
    if (typeof ourSongAudio !== 'undefined' && ourSongAudio && ourSongAudio.paused) {
      miniPlaySong.classList.remove('hidden');
    }
  }

  if (miniPlaySong) {
    miniPlaySong.addEventListener('click', () => {
      if (typeof ourSongAudio === 'undefined' || !ourSongAudio) return;
      const p = ourSongAudio.play();
      if (p && p.catch) p.catch(() => {});
      miniPlaySong.classList.add('hidden');
    });
  }

  // ---------- the cake ----------

  const cakeWrap = document.getElementById('cakeWrap');
  const cakeSparkles = document.getElementById('cakeSparkles');
  const cakePrompt = document.getElementById('cakePrompt');
  const cakeFollowup1 = document.getElementById('cakeFollowup1');
  const cakeFollowup2 = document.getElementById('cakeFollowup2');
  const cakeFollowup3 = document.getElementById('cakeFollowup3');

  let candlesBlown = false;

  cakeWrap.addEventListener('click', () => {
    if (candlesBlown) return;
    candlesBlown = true;

    ['flame1', 'flame2', 'flame3'].forEach((id, i) => {
      const flame = document.getElementById(id);
      setTimeout(() => {
        flame.classList.add('out');
        spawnSmokeWisp(flame);
      }, i * 120);
    });

    cakePrompt.style.opacity = '0.5';

    spawnCakeSparkles();
    launchConfetti();

    setTimeout(() => cakeFollowup1.classList.remove('hidden'), 700);
    setTimeout(() => cakeFollowup2.classList.remove('hidden'), 1600);
    setTimeout(() => cakeFollowup3.classList.remove('hidden'), 2400);

    // reveal the rest of the page once the celebration has begun
    setTimeout(() => {
      finaleCollageSection.classList.remove('hidden');
    }, 1400);
    setTimeout(() => {
      finaleClosingSection.classList.remove('hidden');
    }, 2200);
    setTimeout(() => {
      finaleLastthingSection.classList.remove('hidden');
    }, 3000);
  });

  function spawnSmokeWisp(flameEl) {
    const wisp = document.createElement('span');
    wisp.className = 'smoke-wisp';
    flameEl.parentElement.appendChild(wisp);
    setTimeout(() => wisp.remove(), 1100);
  }

  function spawnCakeSparkles() {
    const glyphs = ['✦', '✧', '✿', '♡', '★'];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.position = 'absolute';
      el.style.left = (10 + Math.random() * 80) + '%';
      el.style.top = (10 + Math.random() * 70) + '%';
      el.style.fontSize = (12 + Math.random() * 10) + 'px';
      el.style.color = Math.random() > 0.5 ? '#e3c273' : '#f0b7c4';
      el.style.opacity = '0';
      el.style.animation = `sparkleBurstPop ${0.9 + Math.random() * 0.6}s ease forwards`;
      el.style.animationDelay = (Math.random() * 0.4) + 's';
      cakeSparkles.appendChild(el);
      setTimeout(() => el.remove(), 1800);
    }
  }

  // ---------- one last thing ----------

  const oneLastThingBtn = document.getElementById('oneLastThingBtn');
  const lastthingOverlay = document.getElementById('lastthingOverlay');
  const lastthingBackdrop = document.getElementById('lastthingBackdrop');
  const lastthingClose = document.getElementById('lastthingClose');
  const ltLine2 = document.getElementById('ltLine2');
  const ltLine3 = document.getElementById('ltLine3');
  const ltLine4 = document.getElementById('ltLine4');
  const ltSignature = document.getElementById('ltSignature');

  oneLastThingBtn.addEventListener('click', () => {
    lastthingOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    setTimeout(() => ltLine2.classList.remove('hidden'), 1100);
    setTimeout(() => ltLine3.classList.remove('hidden'), 2200);
    setTimeout(() => ltLine4.classList.remove('hidden'), 3300);
    setTimeout(() => {
      ltSignature.classList.remove('hidden');
      lastthingClose.classList.remove('hidden');
    }, 4000);
  });

  function closeLastThing() {
    lastthingOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    finaleEnd.classList.remove('hidden');
    finaleEnd.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  lastthingClose.addEventListener('click', closeLastThing);
  lastthingBackdrop.addEventListener('click', () => {
    // only allow backdrop-close once the note has finished revealing,
    // so the emotional pacing isn't accidentally skipped
    if (!lastthingClose.classList.contains('hidden')) closeLastThing();
  });

  // ---------- subtle replay link, back to Stage 1 ----------

  const replayLink = document.getElementById('replayLink');
  replayLink.addEventListener('click', () => {
    goToPage('page-gift');
  });

  /* =========================================================
     PAGE-TURN TRANSITION
     ---------------------------------------------------------
     Used for stage-to-stage jumps that should feel like turning
     a physical scrapbook page, rather than an instant cut.
     ========================================================= */

  function pageTurnTransition(fromPageId, fromCardSelector, toPageId, toCardSelector) {
    const fromPage = document.getElementById(fromPageId);
    const fromCard = fromPage.querySelector(fromCardSelector);
    const toPage = document.getElementById(toPageId);
    const toCard = toPage.querySelector(toCardSelector);

    spawnTransitionDoodles();
    fromCard.classList.add('page-turn-out');

    setTimeout(() => {
      fromPage.classList.add('hidden');
      fromCard.classList.remove('page-turn-out');

      toPage.classList.remove('hidden');
      toCard.classList.add('page-turn-in');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => toCard.classList.remove('page-turn-in'), 600);
    }, 480);
  }

  function spawnTransitionDoodles() {
    const glyphs = ['✦', '✧', '♡', '✿', '❀', '☁'];
    const count = 7;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'transition-doodle';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = (10 + Math.random() * 80) + 'vw';
      el.style.top = (30 + Math.random() * 40) + 'vh';
      el.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1600);
    }
  }

  /* =========================================================
     DIRECT-TEST SHORTCUTS
     ---------------------------------------------------------
     So any stage can be opened and tested on its own without
     replaying everything before it. Not part of the normal
     player-facing flow.
     Try: index.html#stage2  index.html#stage4  index.html#stage5
     ========================================================= */

  const hash = window.location.hash.replace('#', '').toLowerCase();
  if (hash === 'stage2' || hash === 'crossword') {
    goToPage('page-crossword');
    if (!crosswordBuilt) { buildCrossword(); crosswordBuilt = true; }
  } else if (hash === 'stage4' || hash === 'gift' || hash === 'giftopen') {
    goToPage('page-gift-open');
  } else if (hash === 'stage5' || hash === 'memories') {
    goToPage('page-stage5');
  } else if (hash === 'stage6' || hash === 'garden' || hash === 'flowers') {
    goToPage('page-stage6');
  } else if (hash === 'stage7' || hash === 'story') {
    goToPage('page-stage7');
  } else if (hash === 'stage8' || hash === 'gifts') {
    goToPage('page-stage8');
  } else if (hash === 'stage9' || hash === 'song' || hash === 'music') {
    goToPage('page-stage9');
  } else if (hash === 'stage10' || hash === 'letter') {
    goToPage('page-stage10');
  } else if (hash === 'stage11' || hash === 'hunt' || hash === 'onemorething') {
    goToPage('page-stage11');
  } else if (hash === 'stage12' || hash === 'finale' || hash === 'happybirthday') {
    goToPage('page-stage12');
  }

});
