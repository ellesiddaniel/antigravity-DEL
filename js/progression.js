/* ==========================================================================
   Ghost of Tsushima - RPG Progression & Shrine Upgrade Manager
   Technique Trees, Katana Forging, Armor Sets, and Sacred Charms
   ========================================================================== */

class ProgressionManager {
  constructor() {
    this.supplies = 150;
    this.techniquePoints = 1;
    this.legendExp = 0;
    this.legendLevel = 1;
    this.legendTitles = [
      'SAMURAI OF KOMODA BEACH',
      'THE WANDERING BLADE OF IZUHARA',
      'THE PEOPLE\'S HOPE OF TOYOTAMA',
      'THE SHADOW OF YARIKAWA',
      'THE GHOST OF TSUSHIMA'
    ];

    this.katanaLevel = 1;
    this.katanaMaxLevel = 5;

    this.armorSets = {
      sakai: {
        id: 'sakai',
        name: 'Sakai Clan Armor',
        healthBonus: 35,
        damageBonus: 0.15,
        standoffStreakBonus: 1
      },
      ghost: {
        id: 'ghost',
        name: 'Ghost Armor',
        healthBonus: 15,
        damageBonus: 0.20,
        ghostStanceKillsReq: 4, // 1 less kill required
        terrorChance: 0.35
      },
      ronin: {
        id: 'ronin',
        name: 'Ronin Attire',
        healthBonus: 0,
        damageBonus: 0.30,
        speedBonus: 0.20
      }
    };
    this.equippedArmor = 'sakai';

    this.equippedCharms = {
      amaterasu: true,
      inari: false,
      lightning: false
    };

    this.unlockedTechniques = {
      perfectParry: false,
      waterFlurry: false,
      windTyphoon: false,
      moonCleave: false,
      standoffMastery: false,
      ironWill: false
    };

    this.techCosts = {
      perfectParry: 1,
      waterFlurry: 1,
      windTyphoon: 1,
      moonCleave: 2,
      standoffMastery: 2,
      ironWill: 3
    };

    this.initUI();
  }

  addSupplies(amount) {
    if (this.equippedCharms.inari) {
      amount = Math.round(amount * 1.5);
    }
    this.supplies += amount;
    this.updateHUD();
  }

  addTechniquePoints(amount) {
    this.techniquePoints += amount;
    this.updateHUD();
  }

  addExp(amount) {
    this.legendExp += amount;
    const reqExp = this.legendLevel * 200;
    if (this.legendExp >= reqExp) {
      this.legendExp -= reqExp;
      this.legendLevel++;
      this.addTechniquePoints(1);
      if (window.soundEngine) window.soundEngine.playHeal();
      if (window.game) window.game.showCombatAlert('LEGEND RANK INCREASED!', 'guard-break');
    }
    this.updateHUD();
  }

  // --- Katana Upgrades ---
  upgradeKatana() {
    const cost = this.katanaLevel * 100;
    if (this.supplies >= cost && this.katanaLevel < this.katanaMaxLevel) {
      this.supplies -= cost;
      this.katanaLevel++;
      if (window.soundEngine) window.soundEngine.playKatanaClash();
      this.updateUI();
      return true;
    }
    return false;
  }

  getKatanaDamageMultiplier() {
    // Each katana level adds +15% damage
    let mult = 1.0 + (this.katanaLevel - 1) * 0.15;
    // Armor bonus
    const armor = this.armorSets[this.equippedArmor];
    if (armor && armor.damageBonus) mult += armor.damageBonus;
    return mult;
  }

  // --- Armor Sets ---
  equipArmor(armorId) {
    if (this.armorSets[armorId]) {
      this.equippedArmor = armorId;
      if (window.soundEngine) window.soundEngine.playKatanaSlash();
      this.updateUI();
      if (window.player) window.player.applyProgressionStats();
    }
  }

  // --- Charms ---
  toggleCharm(charmId) {
    if (this.equippedCharms[charmId] !== undefined) {
      this.equippedCharms[charmId] = !this.equippedCharms[charmId];
      if (window.soundEngine) window.soundEngine.playHeal();
      this.updateUI();
    }
  }

  // --- Techniques ---
  unlockTechnique(techId) {
    const cost = this.techCosts[techId];
    if (this.techniquePoints >= cost && !this.unlockedTechniques[techId]) {
      this.techniquePoints -= cost;
      this.unlockedTechniques[techId] = true;
      if (window.soundEngine) window.soundEngine.playPerfectParry();
      this.updateUI();
      if (window.player) window.player.applyProgressionStats();
      return true;
    }
    return false;
  }

  // --- UI Updates ---
  initUI() {
    // Bind Shrine Tab Buttons
    document.querySelectorAll('.shrine-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.shrine-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById(`tab-${tab.dataset.tab}`);
        if (content) content.classList.add('active');
      });
    });

    // Tech unlock buttons
    document.querySelectorAll('.btn-unlock').forEach(btn => {
      btn.addEventListener('click', () => {
        this.unlockTechnique(btn.dataset.tech);
      });
    });

    // Forge katana button
    const forgeBtn = document.getElementById('btn-upgrade-katana');
    if (forgeBtn) {
      forgeBtn.addEventListener('click', () => this.upgradeKatana());
    }

    // Equip armor buttons
    document.querySelectorAll('.btn-equip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.equipArmor(btn.dataset.armor);
      });
    });

    // Charm toggle buttons
    document.querySelectorAll('.charm-item').forEach(item => {
      const toggleBtn = item.querySelector('.btn-charm-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.toggleCharm(item.dataset.charm);
        });
      }
    });

    this.updateHUD();
  }

  updateHUD() {
    const suppliesEl = document.getElementById('supplies-val');
    const modalSuppliesEl = document.getElementById('modal-supplies');
    const tpEl = document.getElementById('technique-val');
    const modalTpEl = document.getElementById('modal-tp');
    const titleEl = document.getElementById('player-title');

    if (suppliesEl) suppliesEl.innerText = this.supplies;
    if (modalSuppliesEl) modalSuppliesEl.innerText = this.supplies;
    if (tpEl) tpEl.innerText = this.techniquePoints;
    if (modalTpEl) modalTpEl.innerText = this.techniquePoints;

    if (titleEl) {
      const idx = Math.min(this.legendLevel - 1, this.legendTitles.length - 1);
      titleEl.innerText = this.legendTitles[idx];
    }
  }

  updateUI() {
    this.updateHUD();

    // Katana Info
    const lvlEl = document.getElementById('katana-level');
    const dmgEl = document.getElementById('katana-dmg');
    const forgeBtn = document.getElementById('btn-upgrade-katana');
    if (lvlEl) lvlEl.innerText = this.katanaLevel;
    if (dmgEl) dmgEl.innerText = `+${(this.katanaLevel - 1) * 15}%`;
    if (forgeBtn) {
      if (this.katanaLevel >= this.katanaMaxLevel) {
        forgeBtn.innerText = 'MAX LEVEL REACHED';
        forgeBtn.disabled = true;
      } else {
        const cost = this.katanaLevel * 100;
        forgeBtn.innerText = `FORGE KATANA (${cost} Supplies)`;
        forgeBtn.disabled = this.supplies < cost;
      }
    }

    // Armor Info
    document.querySelectorAll('.btn-equip').forEach(btn => {
      if (btn.dataset.armor === this.equippedArmor) {
        btn.innerText = 'EQUIPPED';
        btn.disabled = true;
      } else {
        btn.innerText = 'EQUIP ARMOR';
        btn.disabled = false;
      }
    });

    // Charms Info
    document.querySelectorAll('.charm-item').forEach(item => {
      const charmId = item.dataset.charm;
      const isEquipped = !!this.equippedCharms[charmId];
      const toggleBtn = item.querySelector('.btn-charm-toggle');
      if (isEquipped) {
        item.classList.add('active-charm');
        if (toggleBtn) toggleBtn.innerText = 'EQUIPPED';
      } else {
        item.classList.remove('active-charm');
        if (toggleBtn) toggleBtn.innerText = 'EQUIP';
      }
    });

    // Tech Buttons
    document.querySelectorAll('.tech-card').forEach(card => {
      const btn = card.querySelector('.btn-unlock');
      if (!btn) return;
      const techId = btn.dataset.tech;
      const isUnlocked = this.unlockedTechniques[techId];
      const cost = this.techCosts[techId];

      if (isUnlocked) {
        card.classList.add('unlocked');
        btn.innerText = 'LEARNED';
        btn.disabled = true;
      } else {
        card.classList.remove('unlocked');
        btn.innerText = `UPGRADE (${cost} TP)`;
        btn.disabled = this.techniquePoints < cost;
      }
    });
  }
}

// Global Progression Instance
window.progression = new ProgressionManager();
