/**
 * UI State Controller, Screen Flow, and Event Handlers for Brawl Legends
 */

document.addEventListener('DOMContentLoaded', () => {
  // Screens
  const titleScreen = document.getElementById('title-screen');
  const selectScreen = document.getElementById('select-screen');
  const resultsScreen = document.getElementById('results-screen');
  const battleHud = document.getElementById('battle-hud');

  // Modals
  const controlsModal = document.getElementById('controls-modal');
  const settingsModal = document.getElementById('settings-modal');
  const pauseModal = document.getElementById('pause-modal');

  // Preview Canvas
  const previewCanvas = document.getElementById('char-preview-canvas');
  const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
  const winnerCanvas = document.getElementById('winner-canvas');
  const winnerCtx = winnerCanvas ? winnerCanvas.getContext('2d') : null;

  // Selected Stage & Slots State
  let currentStageIdx = 0;
  let previewCharId = 'valravn';

  // 4 Player Slots Default Configuration
  const slotsState = [
    { id: 'P1', type: 'HUMAN', charId: 'valravn', active: true, isBot: false, botDifficulty: 'medium' },
    { id: 'P2', type: 'BOT', charId: 'ignis', active: true, isBot: true, botDifficulty: 'medium' },
    { id: 'P3', type: 'BOT', charId: 'astrid', active: true, isBot: true, botDifficulty: 'easy' },
    { id: 'P4', type: 'CLOSED', charId: 'titanus', active: false, isBot: true, botDifficulty: 'medium' }
  ];

  // Helper to switch active screen
  function showScreen(screen) {
    [titleScreen, selectScreen, resultsScreen].forEach(s => s.classList.add('hidden'));
    if (screen) {
      screen.classList.remove('hidden');
      screen.classList.add('active');
    }
  }

  // =========================================================================
  // 1. TITLE SCREEN BUTTONS
  // =========================================================================
  document.getElementById('btn-play-brawl').addEventListener('click', () => {
    window.soundEngine.init();
    window.soundEngine.playSwing(1.2);
    document.getElementById('select-game-mode').value = 'stock';
    showScreen(selectScreen);
    renderSlotsUI();
    updateStageUI();
    updateCharPreview(previewCharId);
  });

  document.getElementById('btn-play-training').addEventListener('click', () => {
    window.soundEngine.init();
    window.soundEngine.playSwing(1.2);
    document.getElementById('select-game-mode').value = 'training';
    // Set P1 human, P2 bot, P3/P4 closed
    slotsState[0].active = true; slotsState[0].type = 'HUMAN'; slotsState[0].isBot = false;
    slotsState[1].active = true; slotsState[1].type = 'BOT'; slotsState[1].isBot = true; slotsState[1].botDifficulty = 'easy';
    slotsState[2].active = false; slotsState[2].type = 'CLOSED';
    slotsState[3].active = false; slotsState[3].type = 'CLOSED';
    showScreen(selectScreen);
    renderSlotsUI();
    updateStageUI();
    updateCharPreview(previewCharId);
  });

  document.getElementById('btn-controls-guide').addEventListener('click', () => {
    controlsModal.classList.remove('hidden');
  });

  document.getElementById('btn-close-controls').addEventListener('click', () => {
    controlsModal.classList.add('hidden');
  });

  document.getElementById('btn-open-settings').addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
  });

  document.getElementById('btn-close-settings').addEventListener('click', () => {
    settingsModal.classList.add('hidden');
  });

  document.getElementById('btn-select-back').addEventListener('click', () => {
    showScreen(titleScreen);
  });

  // =========================================================================
  // 2. CHARACTER & STAGE SELECT
  // =========================================================================
  function renderSlotsUI() {
    const container = document.getElementById('slots-container');
    container.innerHTML = '';

    slotsState.forEach((slot, idx) => {
      const card = document.createElement('div');
      card.className = `player-slot-card ${slot.active ? 'active-slot' : 'closed'}`;
      const charInfo = window.CHARACTERS[slot.charId] || window.CHARACTERS['valravn'];
      card.style.setProperty('--slot-color', charInfo.themeColor);

      // Top Row (P-tag & Type Buttons)
      const topRow = document.createElement('div');
      topRow.className = 'slot-top-row';
      topRow.innerHTML = `<span class="slot-p-tag">${slot.id}</span>`;

      const typeGroup = document.createElement('div');
      typeGroup.className = 'slot-type-selector';

      const types = idx === 0 ? ['HUMAN', 'BOT'] : ['HUMAN', 'BOT', 'CLOSED'];
      types.forEach(t => {
        const btn = document.createElement('button');
        btn.className = `type-btn ${slot.type === t ? 'active' : ''}`;
        btn.textContent = t;
        btn.addEventListener('click', () => {
          slot.type = t;
          slot.active = (t !== 'CLOSED');
          slot.isBot = (t === 'BOT');
          renderSlotsUI();
        });
        typeGroup.appendChild(btn);
      });
      topRow.appendChild(typeGroup);
      card.appendChild(topRow);

      // Character Selection Row
      if (slot.active) {
        const charRow = document.createElement('div');
        charRow.className = 'slot-character-row';

        Object.values(window.CHARACTERS).forEach(char => {
          const charBtn = document.createElement('button');
          charBtn.className = `char-select-btn ${slot.charId === char.id ? 'selected' : ''}`;
          charBtn.style.setProperty('--char-btn-color', char.themeColor);
          charBtn.innerHTML = `
            <div class="char-icon-mini" style="border: 2px solid ${char.themeColor}; color:${char.themeColor}">
              ${char.name[0]}
            </div>
            <span class="char-mini-label">${char.name}</span>
          `;
          charBtn.addEventListener('click', () => {
            slot.charId = char.id;
            previewCharId = char.id;
            updateCharPreview(char.id);
            renderSlotsUI();
            window.soundEngine.playSwing(1.4);
          });
          charRow.appendChild(charBtn);
        });
        card.appendChild(charRow);

        // Bottom Bot Difficulty or Status
        const statusRow = document.createElement('div');
        statusRow.className = 'slot-status-label';
        if (slot.isBot) {
          statusRow.innerHTML = `
            <span>AI Bot Level:</span>
            <select class="select-dropdown" style="padding:2px 6px; font-size:11px;">
              <option value="easy" ${slot.botDifficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="medium" ${slot.botDifficulty === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="hard" ${slot.botDifficulty === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
          `;
          statusRow.querySelector('select').addEventListener('change', (e) => {
            slot.botDifficulty = e.target.value;
          });
        } else {
          statusRow.innerHTML = `<span>🎮 Human Player (${idx === 0 ? 'WASD + JKL' : 'Panah + Numpad'})</span>`;
        }
        card.appendChild(statusRow);
      } else {
        const closedLabel = document.createElement('div');
        closedLabel.className = 'slot-status-label';
        closedLabel.style.justifyContent = 'center';
        closedLabel.style.marginTop = '30px';
        closedLabel.innerHTML = `<span>[ SLOT NONAKTIF ]</span>`;
        card.appendChild(closedLabel);
      }

      container.appendChild(card);
    });
  }

  function updateCharPreview(charId) {
    const char = window.CHARACTERS[charId];
    if (!char) return;

    document.getElementById('char-element').textContent = char.element.toUpperCase();
    document.getElementById('char-name').textContent = char.name;
    document.getElementById('char-title').textContent = char.title;
    document.getElementById('char-desc').textContent = char.desc;

    document.getElementById('stat-speed').style.width = `${char.stats.speed * 10}%`;
    document.getElementById('stat-attack').style.width = `${char.stats.attack * 10}%`;
    document.getElementById('stat-defense').style.width = `${char.stats.defense * 10}%`;
    document.getElementById('stat-dex').style.width = `${char.stats.dex * 10}%`;
  }

  function updateStageUI() {
    const stage = window.STAGES[currentStageIdx];
    if (!stage) return;
    document.getElementById('current-stage-name').textContent = stage.name;
    document.getElementById('current-stage-desc').textContent = stage.desc;
  }

  document.getElementById('btn-prev-stage').addEventListener('click', () => {
    currentStageIdx = (currentStageIdx - 1 + window.STAGES.length) % window.STAGES.length;
    updateStageUI();
    window.soundEngine.playSwing(0.9);
  });

  document.getElementById('btn-next-stage').addEventListener('click', () => {
    currentStageIdx = (currentStageIdx + 1) % window.STAGES.length;
    updateStageUI();
    window.soundEngine.playSwing(1.1);
  });

  // Start Battle Button
  document.getElementById('btn-start-fight').addEventListener('click', () => {
    const activeCount = slotsState.filter(s => s.active).length;
    if (activeCount < 2) {
      alert('Aktifkan minimal 2 karakter (Player / Bot) untuk bertarung!');
      return;
    }

    const mode = document.getElementById('select-game-mode').value;
    showScreen(null); // Hide select screen
    window.gameEngine.startMatch(currentStageIdx, slotsState, mode);
  });

  // =========================================================================
  // 3. IN-GAME PAUSE & CONTROLS
  // =========================================================================
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      if (window.gameEngine.gameState === 'BRAWL' || window.gameEngine.gameState === 'COUNTDOWN') {
        window.gameEngine.prevGameState = window.gameEngine.gameState;
        window.gameEngine.gameState = 'PAUSED';
        pauseModal.classList.remove('hidden');
      } else if (window.gameEngine.gameState === 'PAUSED') {
        window.gameEngine.gameState = window.gameEngine.prevGameState;
        pauseModal.classList.add('hidden');
      }
    } else if (e.code === 'KeyH') {
      window.gameEngine.toggleHitboxDebug();
    }
  });

  document.getElementById('btn-resume-game').addEventListener('click', () => {
    window.gameEngine.gameState = window.gameEngine.prevGameState;
    pauseModal.classList.add('hidden');
  });

  document.getElementById('btn-pause-restart').addEventListener('click', () => {
    pauseModal.classList.add('hidden');
    const mode = document.getElementById('select-game-mode').value;
    window.gameEngine.startMatch(currentStageIdx, slotsState, mode);
  });

  document.getElementById('btn-pause-select').addEventListener('click', () => {
    pauseModal.classList.add('hidden');
    battleHud.classList.add('hidden');
    window.soundEngine.stopBattleBGM();
    window.gameEngine.gameState = 'SELECT';
    showScreen(selectScreen);
  });

  document.getElementById('btn-pause-menu').addEventListener('click', () => {
    pauseModal.classList.add('hidden');
    battleHud.classList.add('hidden');
    window.soundEngine.stopBattleBGM();
    window.gameEngine.gameState = 'TITLE';
    showScreen(titleScreen);
  });

  // =========================================================================
  // 4. MATCH RESULTS & VICTORY
  // =========================================================================
  window.onMatchFinished = (winner, fighters) => {
    battleHud.classList.add('hidden');
    showScreen(resultsScreen);

    const winnerNameEl = document.getElementById('winner-name');
    if (winner) {
      winnerNameEl.textContent = `${winner.slotId} (${winner.characterData.name})`;
      winnerNameEl.style.color = winner.characterData.themeColor;
    } else {
      winnerNameEl.textContent = 'DRAW MATCH!';
    }

    // Populate Stats Table
    const tbody = document.getElementById('match-stats-body');
    tbody.innerHTML = '';
    fighters.forEach(f => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="color:${f.characterData.themeColor}">
          ${f.slotId} - ${f.characterData.name} ${f.isBot ? '[BOT]' : ''}
        </td>
        <td style="color:#fbbf24">${f.matchStats.kos}</td>
        <td style="color:#ef4444">${f.matchStats.falls}</td>
        <td>${Math.floor(f.matchStats.damageDealt)}%</td>
        <td>${Math.floor(f.matchStats.damageTaken)}%</td>
      `;
      tbody.appendChild(row);
    });
  };

  document.getElementById('btn-rematch').addEventListener('click', () => {
    const mode = document.getElementById('select-game-mode').value;
    showScreen(null);
    window.gameEngine.startMatch(currentStageIdx, slotsState, mode);
  });

  document.getElementById('btn-results-select').addEventListener('click', () => {
    showScreen(selectScreen);
  });

  document.getElementById('btn-results-menu').addEventListener('click', () => {
    showScreen(titleScreen);
  });

  // =========================================================================
  // 5. SETTINGS BINDINGS
  // =========================================================================
  document.getElementById('slider-sfx-volume').addEventListener('input', (e) => {
    window.soundEngine.setSfxVolume(parseFloat(e.target.value));
  });

  document.getElementById('slider-bgm-volume').addEventListener('input', (e) => {
    window.soundEngine.setBgmVolume(parseFloat(e.target.value));
  });

  document.getElementById('check-screen-shake').addEventListener('change', (e) => {
    // If unchecked, particleSystem won't shake
    if (!e.target.checked) window.particleSystem.screenShake = 0;
  });

  document.getElementById('check-particles').addEventListener('change', (e) => {
    window.particleSystem.particlesEnabled = e.target.checked;
  });

  document.getElementById('check-hitbox-debug').addEventListener('change', (e) => {
    window.gameEngine.debugHitbox = e.target.checked;
  });

  // =========================================================================
  // 6. ANIMATED PREVIEW LOOP ON CANVAS
  // =========================================================================
  let previewTime = 0;
  function renderPreviewLoop() {
    if (previewCtx && !selectScreen.classList.contains('hidden')) {
      previewTime += 0.05;
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      const char = window.CHARACTERS[previewCharId];
      if (char) {
        previewCtx.save();
        previewCtx.translate(previewCanvas.width / 2, previewCanvas.height / 2 + 50);
        previewCtx.scale(1.8, 1.8);
        const dummyFighter = {
          facing: 1,
          animTimer: previewTime,
          isAttacking: false,
          onGround: true,
          vx: 0,
          vy: 0
        };
        char.render(previewCtx, dummyFighter);
        previewCtx.restore();
      }
    }
    requestAnimationFrame(renderPreviewLoop);
  }
  requestAnimationFrame(renderPreviewLoop);
});
