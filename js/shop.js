/**
 * Subway Surfers 3D - Shop, Inventory & Persistence
 * Manages character skins, hoverboard skins, power-up upgrades, and local persistence.
 */

class ShopManager {
  constructor() {
    this.STORAGE_KEY = 'subway_surfers_save_v1';
    this.data = this.loadData();

    this.characters = [
      { id: 'jake', name: 'Jake', price: 0, desc: 'The iconic energetic street runner.', icon: '🧢' },
      { id: 'tricky', name: 'Tricky', price: 500, desc: 'Fast, stylish, and full of attitude.', icon: '🎀' },
      { id: 'cyber', name: 'Cyber Surfer', price: 1200, desc: 'High-tech neon runner from 2077.', icon: '⚡' },
      { id: 'ninja', name: 'Shadow Ninja', price: 2500, desc: 'Master of stealth and agile sprints.', icon: '🥷' }
    ];

    this.boards = [
      { id: 'classic', name: 'Classic Glider', price: 0, desc: 'Reliable blue hoverboard.', icon: '🛹' },
      { id: 'starburst', name: 'Starburst Neon', price: 400, desc: 'Magenta glow with trail sparks.', icon: '✨' },
      { id: 'lava', name: 'Lava Flame', price: 1000, desc: 'Blazing hot speed on rails.', icon: '🔥' },
      { id: 'cyber', name: 'Cyber Blade', price: 2000, desc: 'Futuristic magnetic anti-gravity deck.', icon: '🚀' }
    ];

    this.upgrades = [
      { id: 'magnet', name: 'Coin Magnet', baseCost: 300, maxLevel: 5, icon: '🧲', desc: 'Increases magnet duration (+3s per level).' },
      { id: 'jetpack', name: 'Jetpack', baseCost: 500, maxLevel: 5, icon: '🚀', desc: 'Fly longer in the sky (+2.5s per level).' },
      { id: 'sneakers', name: 'Super Sneakers', baseCost: 300, maxLevel: 5, icon: '👟', desc: 'Longer super jump time (+3s per level).' },
      { id: 'multiplier', name: '2X Multiplier', baseCost: 400, maxLevel: 5, icon: '⭐', desc: 'Doubles score for longer (+3s per level).' }
    ];

    this.initUI();
    this.updateHUD();
  }

  loadData() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not load save from localStorage', e);
    }

    return {
      coins: 100, // Starting bonus
      keys: 5,
      highscore: 0,
      characters: ['jake'],
      selectedCharacter: 'jake',
      boards: ['classic'],
      selectedBoard: 'classic',
      upgradeLevels: {
        magnet: 1,
        jetpack: 1,
        sneakers: 1,
        multiplier: 1
      }
    };
  }

  saveData() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    this.updateHUD();
  }

  updateHUD() {
    const coinEls = document.querySelectorAll('.hud-coin-count');
    const keyEls = document.querySelectorAll('.hud-key-count');
    const highscoreEls = document.querySelectorAll('.hud-highscore-count');

    coinEls.forEach(el => el.textContent = this.data.coins.toLocaleString());
    keyEls.forEach(el => el.textContent = this.data.keys.toLocaleString());
    highscoreEls.forEach(el => el.textContent = this.data.highscore.toLocaleString());
  }

  addCoins(amount) {
    this.data.coins += amount;
    this.saveData();
  }

  addKeys(amount) {
    this.data.keys += amount;
    this.saveData();
  }

  setHighscore(score) {
    if (score > this.data.highscore) {
      this.data.highscore = score;
      this.saveData();
      return true; // New record!
    }
    return false;
  }

  getPowerupDuration(type) {
    const level = this.data.upgradeLevels[type] || 1;
    const baseDurations = {
      magnet: 10,
      jetpack: 8,
      sneakers: 12,
      multiplier: 12,
      hoverboard: 25
    };
    const addPerLevel = {
      magnet: 3,
      jetpack: 2.5,
      sneakers: 3,
      multiplier: 3,
      hoverboard: 0
    };
    return baseDurations[type] + (level - 1) * (addPerLevel[type] || 0);
  }

  // ==========================================
  // SHOP UI INTEGRATION
  // ==========================================
  initUI() {
    const tabChars = document.getElementById('tab-characters');
    const tabBoards = document.getElementById('tab-boards');
    const tabUpgrades = document.getElementById('tab-upgrades');

    if (tabChars) tabChars.addEventListener('click', () => this.switchTab('characters'));
    if (tabBoards) tabBoards.addEventListener('click', () => this.switchTab('boards'));
    if (tabUpgrades) tabUpgrades.addEventListener('click', () => this.switchTab('upgrades'));

    this.renderCharacters();
  }

  switchTab(tab) {
    document.querySelectorAll('.shop-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`tab-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (window.audioManager) window.audioManager.playButton();

    if (tab === 'characters') this.renderCharacters();
    else if (tab === 'boards') this.renderBoards();
    else if (tab === 'upgrades') this.renderUpgrades();
  }

  renderCharacters() {
    const container = document.getElementById('shop-items-list');
    if (!container) return;
    container.innerHTML = '';

    this.characters.forEach(char => {
      const isOwned = this.data.characters.includes(char.id);
      const isSelected = this.data.selectedCharacter === char.id;

      const card = document.createElement('div');
      card.className = `shop-card ${isSelected ? 'equipped' : ''}`;

      let btnHtml = '';
      if (isSelected) {
        btnHtml = `<button class="shop-card-btn selected">✓ SELECTED</button>`;
      } else if (isOwned) {
        btnHtml = `<button class="shop-card-btn select" onclick="shopManager.selectCharacter('${char.id}')">SELECT</button>`;
      } else {
        const canAfford = this.data.coins >= char.price;
        btnHtml = `<button class="shop-card-btn buy" ${canAfford ? '' : 'disabled style="opacity:0.5;"'} onclick="shopManager.buyCharacter('${char.id}', ${char.price})">🪙 ${char.price}</button>`;
      }

      card.innerHTML = `
        <div class="shop-card-icon">${char.icon}</div>
        <div class="shop-card-name">${char.name}</div>
        <div class="shop-card-desc">${char.desc}</div>
        ${btnHtml}
      `;
      container.appendChild(card);
    });
  }

  renderBoards() {
    const container = document.getElementById('shop-items-list');
    if (!container) return;
    container.innerHTML = '';

    this.boards.forEach(board => {
      const isOwned = this.data.boards.includes(board.id);
      const isSelected = this.data.selectedBoard === board.id;

      const card = document.createElement('div');
      card.className = `shop-card ${isSelected ? 'equipped' : ''}`;

      let btnHtml = '';
      if (isSelected) {
        btnHtml = `<button class="shop-card-btn selected">✓ ACTIVE</button>`;
      } else if (isOwned) {
        btnHtml = `<button class="shop-card-btn select" onclick="shopManager.selectBoard('${board.id}')">SELECT</button>`;
      } else {
        const canAfford = this.data.coins >= board.price;
        btnHtml = `<button class="shop-card-btn buy" ${canAfford ? '' : 'disabled style="opacity:0.5;"'} onclick="shopManager.buyBoard('${board.id}', ${board.price})">🪙 ${board.price}</button>`;
      }

      card.innerHTML = `
        <div class="shop-card-icon">${board.icon}</div>
        <div class="shop-card-name">${board.name}</div>
        <div class="shop-card-desc">${board.desc}</div>
        ${btnHtml}
      `;
      container.appendChild(card);
    });
  }

  renderUpgrades() {
    const container = document.getElementById('shop-items-list');
    if (!container) return;
    container.innerHTML = '';

    this.upgrades.forEach(upg => {
      const level = this.data.upgradeLevels[upg.id] || 1;
      const isMax = level >= upg.maxLevel;
      const cost = upg.baseCost * level;

      const card = document.createElement('div');
      card.className = 'shop-card';

      let btnHtml = '';
      if (isMax) {
        btnHtml = `<button class="shop-card-btn selected">MAX LEVEL</button>`;
      } else {
        const canAfford = this.data.coins >= cost;
        btnHtml = `<button class="shop-card-btn buy" ${canAfford ? '' : 'disabled style="opacity:0.5;"'} onclick="shopManager.upgradePowerup('${upg.id}', ${cost})">UPGRADE (🪙 ${cost})</button>`;
      }

      card.innerHTML = `
        <div class="shop-card-icon">${upg.icon}</div>
        <div class="shop-card-name">${upg.name} (Lv. ${level}/${upg.maxLevel})</div>
        <div class="shop-card-desc">${upg.desc}</div>
        ${btnHtml}
      `;
      container.appendChild(card);
    });
  }

  buyCharacter(id, price) {
    if (this.data.coins < price) return;
    this.data.coins -= price;
    this.data.characters.push(id);
    this.data.selectedCharacter = id;
    if (window.audioManager) window.audioManager.playPowerup();
    this.saveData();
    this.renderCharacters();
    if (window.game) window.game.reloadCharacter();
  }

  selectCharacter(id) {
    this.data.selectedCharacter = id;
    if (window.audioManager) window.audioManager.playButton();
    this.saveData();
    this.renderCharacters();
    if (window.game) window.game.reloadCharacter();
  }

  buyBoard(id, price) {
    if (this.data.coins < price) return;
    this.data.coins -= price;
    this.data.boards.push(id);
    this.data.selectedBoard = id;
    if (window.audioManager) window.audioManager.playPowerup();
    this.saveData();
    this.renderBoards();
    if (window.game) window.game.reloadCharacter();
  }

  selectBoard(id) {
    this.data.selectedBoard = id;
    if (window.audioManager) window.audioManager.playButton();
    this.saveData();
    this.renderBoards();
    if (window.game) window.game.reloadCharacter();
  }

  upgradePowerup(id, cost) {
    if (this.data.coins < cost) return;
    this.data.coins -= cost;
    this.data.upgradeLevels[id] = (this.data.upgradeLevels[id] || 1) + 1;
    if (window.audioManager) window.audioManager.playPowerup();
    this.saveData();
    this.renderUpgrades();
  }
}

window.shopManager = new ShopManager();
