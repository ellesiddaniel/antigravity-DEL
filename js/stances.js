/* ==========================================================================
   Ghost of Tsushima - Katana Stances & Combo Matrix
   4 Authentic Combat Stances with distinct archetypes, multipliers, and techniques
   ========================================================================== */

const STANCES = {
  stone: {
    id: 'stone',
    name: 'STONE STANCE',
    kanji: '岩',
    effectiveAgainst: 'swordsman', // Also effective vs Ronin
    effectiveLabel: 'Swordsmen & Ronin',
    desc: 'Deep piercing thrusts and rapid overhead cleaves designed to bypass standard blade guards.',
    lightAttack: {
      damage: 22,
      postureDmg: 18,
      speed: 0.18, // duration in seconds
      range: 2.8,
      comboMax: 3
    },
    heavyAttack: {
      name: 'Piercing Thrust',
      damage: 42,
      postureDmg: 38,
      speed: 0.32,
      range: 3.6,
      forwardDash: 1.8
    },
    // Multipliers when facing specific enemy archetypes
    vsMultipliers: {
      swordsman: { damage: 1.3, posture: 2.0 },
      ronin: { damage: 1.25, posture: 1.8 },
      shieldman: { damage: 0.7, posture: 0.5 }, // Ineffective vs Shields
      spearman: { damage: 0.8, posture: 0.7 },
      brute: { damage: 0.8, posture: 0.6 },
      boss: { damage: 1.1, posture: 1.3 }
    }
  },

  water: {
    id: 'water',
    name: 'WATER STANCE',
    kanji: '水',
    effectiveAgainst: 'shieldman',
    effectiveLabel: 'Shieldmen',
    desc: 'Fluid, relentless strikes and shield-cleaving flurries that batter down defensive shields.',
    lightAttack: {
      damage: 18,
      postureDmg: 20,
      speed: 0.15,
      range: 2.6,
      comboMax: 4
    },
    heavyAttack: {
      name: 'Surging Flurry',
      damage: 32,
      postureDmg: 55, // Massive shield posture break
      speed: 0.24,
      range: 2.7,
      isMultiHit: true,
      flurryHits: 3
    },
    vsMultipliers: {
      shieldman: { damage: 1.4, posture: 2.6 }, // Shatters shields!
      swordsman: { damage: 0.9, posture: 0.9 },
      spearman: { damage: 0.8, posture: 0.7 },
      brute: { damage: 0.9, posture: 0.8 },
      boss: { damage: 1.0, posture: 1.5 }
    }
  },

  wind: {
    id: 'wind',
    name: 'WIND STANCE',
    kanji: '風',
    effectiveAgainst: 'spearman',
    effectiveLabel: 'Spearmen',
    desc: 'Sweeping wide arcs and the Typhoon Kick, ideal for sweeping spears and kicking foes back.',
    lightAttack: {
      damage: 20,
      postureDmg: 22,
      speed: 0.16,
      range: 3.2,
      comboMax: 3
    },
    heavyAttack: {
      name: 'Typhoon Kick & Sweep',
      damage: 38,
      postureDmg: 48,
      speed: 0.28,
      range: 3.5,
      knockback: 4.0, // Launches enemies back
      deflectsSpears: true
    },
    vsMultipliers: {
      spearman: { damage: 1.5, posture: 2.5 }, // Counter spears
      swordsman: { damage: 0.9, posture: 0.8 },
      shieldman: { damage: 0.8, posture: 0.6 },
      brute: { damage: 0.85, posture: 0.7 },
      boss: { damage: 1.0, posture: 1.4 }
    }
  },

  moon: {
    id: 'moon',
    name: 'MOON STANCE',
    kanji: '月',
    effectiveAgainst: 'brute',
    effectiveLabel: 'Mongol Brutes',
    desc: 'Heavy, devastating 360-degree whirlwind spins crafted to stagger massive armored behemoths.',
    lightAttack: {
      damage: 26,
      postureDmg: 24,
      speed: 0.22,
      range: 2.9,
      comboMax: 3
    },
    heavyAttack: {
      name: 'Whirlwind Spin',
      damage: 55,
      postureDmg: 60,
      speed: 0.35,
      range: 3.4,
      isAreaOfEffect: true,
      aoeRadius: 3.8
    },
    vsMultipliers: {
      brute: { damage: 1.6, posture: 2.8 }, // Obliterates Brutes
      swordsman: { damage: 0.85, posture: 0.8 },
      shieldman: { damage: 0.9, posture: 1.0 },
      spearman: { damage: 0.8, posture: 0.7 },
      boss: { damage: 1.15, posture: 1.6 }
    }
  }
};

class StanceManager {
  constructor() {
    this.currentStance = 'stone';
    this.unlockedStances = ['stone', 'water', 'wind', 'moon']; // All 4 stances available
  }

  setStance(stanceKey) {
    if (!STANCES[stanceKey]) return false;
    if (this.currentStance === stanceKey) return false;

    this.currentStance = stanceKey;
    if (window.soundEngine) window.soundEngine.playStanceSwitch();
    this.updateUI();
    return true;
  }

  getCurrent() {
    return STANCES[this.currentStance];
  }

  getMultiplierVs(enemyType) {
    const stance = this.getCurrent();
    if (stance.vsMultipliers && stance.vsMultipliers[enemyType]) {
      return stance.vsMultipliers[enemyType];
    }
    return { damage: 1.0, posture: 1.0 };
  }

  updateUI() {
    document.querySelectorAll('.stance-card').forEach(card => {
      const stance = card.dataset.stance;
      if (stance === this.currentStance) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }
}

// Global Stance Manager instance
window.stanceManager = new StanceManager();
