/* ==========================================================================
   Ghost of Tsushima - Tactical AI & Smooth Non-Abrupt Difficulty Scaling
   Smooth difficulty curve, squad coordination, stance counters, attack tokens
   ========================================================================== */

class DifficultyDirector {
  constructor() {
    this.currentLevel = 1;
  }

  // --- Smooth Scaling Parameters ---
  getLevelConfig(level) {
    this.currentLevel = level;

    // 1. Smooth Multipliers (No sudden spikes)
    const hpMultiplier = 1.0 + (level - 1) * 0.08;       // +8% HP per level
    const dmgMultiplier = 1.0 + (level - 1) * 0.06;      // +6% Dmg per level
    const postureMultiplier = 1.0 + (level - 1) * 0.07;  // +7% Posture per level

    // 2. Reaction & Telegraph Pacing (in seconds)
    // Smoothly reduces from 0.48s (generous) to 0.24s (mastery)
    const telegraphTime = Math.max(0.24, 0.48 - (level - 1) * 0.015);
    const attackCooldown = Math.max(0.8, 2.2 - (level - 1) * 0.09);

    // 3. Tactical Aggression Tokens (How many enemies attack simultaneously)
    // Level 1-4: 1 attacker at a time (generous dueling)
    // Level 5-8: 2 flankers
    // Level 9+: 3 coordinated squad attackers
    const maxAttackTokens = Math.min(3, 1 + Math.floor((level - 1) / 4));

    // 4. Enemy Compositions per Level
    const composition = this.getCompositionForLevel(level);

    return {
      level: level,
      hpMult: hpMultiplier,
      dmgMult: dmgMultiplier,
      postureMult: postureMultiplier,
      telegraphTime: telegraphTime,
      attackCooldown: attackCooldown,
      maxAttackTokens: maxAttackTokens,
      title: composition.title,
      sub: composition.sub,
      kanji: composition.kanji,
      theme: composition.theme,
      isBoss: composition.isBoss,
      enemies: composition.enemies
    };
  }

  getCompositionForLevel(level) {
    switch(level) {
      case 1:
        return {
          title: 'LEVEL 1: KOMODA BEACH RECON',
          sub: 'Master the Stone Stance and Perfect Parry against Mongol Swordsmen.',
          kanji: '小茂田の戦い',
          theme: 'autumn',
          isBoss: false,
          enemies: [
            { type: 'swordsman', x: 0, z: -8 }
          ]
        };
      case 2:
        return {
          title: 'LEVEL 2: GOLDEN FOREST AMBUSH',
          sub: 'Mongol Shields have arrived. Switch to Water Stance [2] to break guards.',
          kanji: '黄金の森',
          theme: 'autumn',
          isBoss: false,
          enemies: [
            { type: 'swordsman', x: -4, z: -8 },
            { type: 'shieldman', x: 3, z: -9 }
          ]
        };
      case 3:
        return {
          title: 'LEVEL 3: IZUHARA BAMBOO GROVE',
          sub: 'Mongol Spearmen join the fray. Switch to Wind Stance [3] to deflect spears.',
          kanji: '厳原の竹林',
          theme: 'sakura',
          isBoss: false,
          enemies: [
            { type: 'swordsman', x: -5, z: -7 },
            { type: 'shieldman', x: 0, z: -10 },
            { type: 'spearman', x: 5, z: -8 }
          ]
        };
      case 4:
        return {
          title: 'LEVEL 4: GOLDEN TEMPLE OUTSKIRTS',
          sub: 'Coordinated patrol of shield and spear units. Adapt your stances swiftly.',
          kanji: '金田城の道',
          theme: 'autumn',
          isBoss: false,
          enemies: [
            { type: 'shieldman', x: -5, z: -9 },
            { type: 'spearman', x: -1, z: -11 },
            { type: 'shieldman', x: 4, z: -9 },
            { type: 'swordsman', x: 7, z: -7 }
          ]
        };
      case 5:
        return {
          title: 'LEVEL 5: YARIKAWA STRONGHOLD GATE',
          sub: 'A Mongol Brute appears! Switch to Moon Stance [4] to stagger heavy armor.',
          kanji: '槍川の戦い',
          theme: 'crimson',
          isBoss: false,
          enemies: [
            { type: 'brute', x: 0, z: -11 },
            { type: 'spearman', x: -6, z: -8 },
            { type: 'shieldman', x: 6, z: -8 }
          ]
        };
      case 6:
        return {
          title: 'LEVEL 6: OMI RIVER CROSSING',
          sub: 'Mixed vanguard squad. Use Ghost Weapons (Kunai [F] & Smoke [G]) to control the battlefield.',
          kanji: '近江の渡守',
          theme: 'sakura',
          isBoss: false,
          enemies: [
            { type: 'brute', x: -4, z: -10 },
            { type: 'shieldman', x: 0, z: -8 },
            { type: 'spearman', x: 4, z: -9 },
            { type: 'swordsman', x: 7, z: -7 }
          ]
        };
      case 7:
        return {
          title: 'LEVEL 7: CASTLE KANEDA DEFENSES',
          sub: 'Armored Mongol elites. Watch out for unblockable Red Glint attacks!',
          kanji: '金田城の攻防',
          theme: 'autumn',
          isBoss: false,
          enemies: [
            { type: 'brute', x: -5, z: -10 },
            { type: 'brute', x: 5, z: -10 },
            { type: 'spearman', x: -2, z: -8 },
            { type: 'shieldman', x: 2, z: -8 }
          ]
        };
      case 8:
        return {
          title: 'LEVEL 8: UMUGI COVE SMUGGLERS',
          sub: 'Straw Hat Ronin have turned traitor. Master swordsmen with lethal parries.',
          kanji: '卯麦の波止場',
          theme: 'night',
          isBoss: false,
          enemies: [
            { type: 'ronin', x: -3, z: -8 },
            { type: 'ronin', x: 3, z: -8 },
            { type: 'shieldman', x: 0, z: -11 }
          ]
        };
      case 9:
        return {
          title: 'LEVEL 9: CRIMSON AUTUMN GROVE',
          sub: 'Elite Ronin assassins coordinated with heavy Brutes. Use Heavenly Strike [R]!',
          kanji: '紅葉の暗殺者',
          theme: 'crimson',
          isBoss: false,
          enemies: [
            { type: 'ronin', x: -5, z: -9 },
            { type: 'ronin', x: 5, z: -9 },
            { type: 'brute', x: 0, z: -12 },
            { type: 'spearman', x: 0, z: -7 }
          ]
        };
      case 10:
        return {
          title: 'LEVEL 10: DUEL OF THE AUTUMN LEAVES',
          sub: 'BOSS DUEL: General Khotun Khan. Clash blades and liberate Tsushima!',
          kanji: '対馬の総督対決',
          theme: 'crimson',
          isBoss: true,
          enemies: [
            { type: 'boss', x: 0, z: -9 }
          ]
        };
      default:
        // Endless Master Waves (Level 11+)
        return {
          title: `MASTER TSUSHIMA - WAVE ${level}`,
          sub: 'Endless Mongol Reinforcements. Test your samurai mastery!',
          kanji: '名誉の戦い',
          theme: level % 3 === 0 ? 'crimson' : (level % 2 === 0 ? 'night' : 'autumn'),
          isBoss: level % 5 === 0,
          enemies: this.generateEndlessWave(level)
        };
    }
  }

  generateEndlessWave(level) {
    if (level % 5 === 0) {
      return [{ type: 'boss', x: 0, z: -9 }, { type: 'ronin', x: -5, z: -8 }, { type: 'ronin', x: 5, z: -8 }];
    }
    const pool = ['swordsman', 'shieldman', 'spearman', 'brute', 'ronin'];
    const count = Math.min(6, 3 + Math.floor((level - 10) / 2));
    const result = [];
    for (let i = 0; i < count; i++) {
      const type = pool[Math.floor(Math.random() * pool.length)];
      const angle = (i / count) * Math.PI * 1.5 + Math.PI * 0.75;
      result.push({
        type: type,
        x: Math.cos(angle) * 10,
        z: Math.sin(angle) * 10
      });
    }
    return result;
  }
}

// Global Difficulty Director
window.difficultyDirector = new DifficultyDirector();
