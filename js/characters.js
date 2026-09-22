/**
 * Character Definitions, Movesets, and Vector Renderers for Brawl Legends
 */

class CharacterData {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.title = data.title;
    this.element = data.element;
    this.themeColor = data.themeColor;
    this.desc = data.desc;
    this.stats = data.stats; // speed, attack, defense, dex, weight
    this.moves = data.moves;
    this.render = data.render;
  }
}

// Helper to define an attack hitbox
function makeMove(opts) {
  return {
    name: opts.name || 'attack',
    type: opts.type || 'light', // light, heavy, special, recovery
    startup: opts.startup || 4,   // frames before hitbox active
    active: opts.active || 6,     // active hitbox frames
    recovery: opts.recovery || 10,// cooldown frames
    damage: opts.damage || 8,     // % damage dealt
    baseKnockback: opts.baseKnockback || 6,
    knockbackGrowth: opts.knockbackGrowth || 1.1,
    knockbackAngle: opts.knockbackAngle !== undefined ? opts.knockbackAngle : -Math.PI / 4, // Default 45 deg up-away
    hitbox: opts.hitbox || { x: 20, y: -25, w: 45, h: 40 }, // relative to character center
    sound: opts.sound || 'light', // light, heavy, whoosh
    animType: opts.animType || 'slash',
    chargeable: opts.chargeable || false,
    effects: opts.effects || {}
  };
}

// 1. VALRAVN - The Shadow Rogue
const VALRAVN_MOVES = {
  nLight: makeMove({ name: 'Shadow Dagger Flurry', damage: 6, startup: 3, active: 6, recovery: 8, baseKnockback: 4, knockbackGrowth: 0.8, hitbox: { x: 18, y: -20, w: 40, h: 32 } }),
  sLight: makeMove({ name: 'Shadow Dash Poke', damage: 9, startup: 4, active: 5, recovery: 10, baseKnockback: 6, knockbackGrowth: 0.95, hitbox: { x: 24, y: -20, w: 50, h: 28 } }),
  dLight: makeMove({ name: 'Sweep Trip', damage: 7, startup: 4, active: 5, recovery: 9, baseKnockback: 5, knockbackAngle: -Math.PI / 2.3, hitbox: { x: 15, y: -6, w: 42, h: 20 } }),
  uLight: makeMove({ name: 'Crescent Flip', damage: 8, startup: 4, active: 6, recovery: 9, baseKnockback: 6, knockbackAngle: -Math.PI / 2, hitbox: { x: 6, y: -45, w: 36, h: 40 } }),

  nAir: makeMove({ name: 'Blade Spin', damage: 7, startup: 3, active: 7, recovery: 8, baseKnockback: 5, hitbox: { x: -20, y: -30, w: 56, h: 50 } }),
  fAir: makeMove({ name: 'Aerial Cross Cut', damage: 9, startup: 4, active: 5, recovery: 10, baseKnockback: 7, knockbackGrowth: 1.1, hitbox: { x: 22, y: -24, w: 44, h: 34 } }),
  bAir: makeMove({ name: 'Reverse Shadow Kick', damage: 8, startup: 4, active: 5, recovery: 9, baseKnockback: 7, hitbox: { x: -36, y: -20, w: 38, h: 30 } }),
  uAir: makeMove({ name: 'Twin Sky Thrust', damage: 8, startup: 3, active: 6, recovery: 9, baseKnockback: 6, knockbackAngle: -Math.PI / 2, hitbox: { x: 0, y: -48, w: 34, h: 42 } }),
  dAir: makeMove({ name: 'Shadow Dive Stomp', damage: 10, startup: 5, active: 8, recovery: 12, baseKnockback: 8, knockbackAngle: Math.PI / 2.2, hitbox: { x: 0, y: 15, w: 36, h: 38 } }),

  nHeavy: makeMove({ name: 'Shadow Burst Sig', type: 'heavy', damage: 16, startup: 8, active: 8, recovery: 16, baseKnockback: 10, knockbackGrowth: 1.35, sound: 'heavy', hitbox: { x: -25, y: -35, w: 70, h: 65 } }),
  sHeavy: makeMove({ name: 'Shadow Dash Strike', type: 'heavy', damage: 17, startup: 9, active: 7, recovery: 18, baseKnockback: 11, knockbackGrowth: 1.45, sound: 'heavy', hitbox: { x: 30, y: -25, w: 65, h: 40 } }),
  dHeavy: makeMove({ name: 'Shadow Spikes', type: 'heavy', damage: 15, startup: 7, active: 8, recovery: 15, baseKnockback: 10, knockbackGrowth: 1.3, sound: 'heavy', hitbox: { x: -35, y: -10, w: 85, h: 30 } }),
  uRecovery: makeMove({ name: 'Shadow Ascension', type: 'recovery', damage: 12, startup: 4, active: 10, recovery: 14, baseKnockback: 8, knockbackAngle: -Math.PI / 2, sound: 'whoosh', hitbox: { x: -10, y: -45, w: 40, h: 50 } })
};

// 2. IGNIS - The Flame Knight
const IGNIS_MOVES = {
  nLight: makeMove({ name: 'Greatsword Slash', damage: 10, startup: 6, active: 6, recovery: 12, baseKnockback: 6, knockbackGrowth: 1.0, hitbox: { x: 22, y: -26, w: 52, h: 42 } }),
  sLight: makeMove({ name: 'Inferno Cleave', damage: 12, startup: 7, active: 6, recovery: 13, baseKnockback: 8, knockbackGrowth: 1.1, hitbox: { x: 28, y: -24, w: 58, h: 36 } }),
  dLight: makeMove({ name: 'Flame Scrape', damage: 9, startup: 6, active: 5, recovery: 11, baseKnockback: 6, knockbackAngle: -Math.PI / 2.5, hitbox: { x: 18, y: -6, w: 48, h: 22 } }),
  uLight: makeMove({ name: 'Rising Blade', damage: 11, startup: 5, active: 6, recovery: 12, baseKnockback: 7, knockbackAngle: -Math.PI / 2, hitbox: { x: 8, y: -50, w: 42, h: 46 } }),

  nAir: makeMove({ name: 'Fire Spin', damage: 9, startup: 5, active: 8, recovery: 10, baseKnockback: 6, hitbox: { x: -25, y: -32, w: 64, h: 56 } }),
  fAir: makeMove({ name: 'Meteor Cleave', damage: 13, startup: 7, active: 6, recovery: 14, baseKnockback: 9, knockbackGrowth: 1.25, hitbox: { x: 25, y: -25, w: 52, h: 44 } }),
  bAir: makeMove({ name: 'Elbow Flame Strike', damage: 10, startup: 5, active: 5, recovery: 10, baseKnockback: 7, hitbox: { x: -38, y: -20, w: 40, h: 32 } }),
  uAir: makeMove({ name: 'Skyward Flame Thrust', damage: 11, startup: 5, active: 6, recovery: 11, baseKnockback: 8, knockbackAngle: -Math.PI / 2, hitbox: { x: 0, y: -52, w: 40, h: 48 } }),
  dAir: makeMove({ name: 'Magma Plunge', damage: 14, startup: 7, active: 9, recovery: 16, baseKnockback: 10, knockbackAngle: Math.PI / 2.3, hitbox: { x: 0, y: 18, w: 42, h: 42 } }),

  nHeavy: makeMove({ name: 'Magma Pillar Sig', type: 'heavy', damage: 20, startup: 11, active: 9, recovery: 22, baseKnockback: 12, knockbackGrowth: 1.5, sound: 'heavy', hitbox: { x: 10, y: -65, w: 55, h: 80 } }),
  sHeavy: makeMove({ name: 'Solar Cleave Sig', type: 'heavy', damage: 22, startup: 12, active: 8, recovery: 24, baseKnockback: 13, knockbackGrowth: 1.6, sound: 'heavy', hitbox: { x: 35, y: -30, w: 75, h: 50 } }),
  dHeavy: makeMove({ name: 'Ground Eruption Sig', type: 'heavy', damage: 19, startup: 10, active: 9, recovery: 20, baseKnockback: 11, knockbackGrowth: 1.4, sound: 'heavy', hitbox: { x: -45, y: -12, w: 105, h: 36 } }),
  uRecovery: makeMove({ name: 'Blazing Cyclone', type: 'recovery', damage: 14, startup: 5, active: 11, recovery: 16, baseKnockback: 9, knockbackAngle: -Math.PI / 2, sound: 'whoosh', hitbox: { x: -12, y: -48, w: 48, h: 55 } })
};

// 3. ASTRID - The Valkyrie Champion
const ASTRID_MOVES = {
  nLight: makeMove({ name: 'Spear Triple Thrust', damage: 8, startup: 4, active: 6, recovery: 9, baseKnockback: 5, knockbackGrowth: 0.9, hitbox: { x: 26, y: -22, w: 55, h: 30 } }),
  sLight: makeMove({ name: 'Shield Bash & Lunge', damage: 10, startup: 5, active: 6, recovery: 11, baseKnockback: 7, knockbackGrowth: 1.05, hitbox: { x: 28, y: -22, w: 52, h: 34 } }),
  dLight: makeMove({ name: 'Valkyrie Sweep', damage: 8, startup: 4, active: 5, recovery: 9, baseKnockback: 5, knockbackAngle: -Math.PI / 2.4, hitbox: { x: 16, y: -6, w: 46, h: 22 } }),
  uLight: makeMove({ name: 'Lightning High Thrust', damage: 9, startup: 4, active: 5, recovery: 10, baseKnockback: 7, knockbackAngle: -Math.PI / 2, hitbox: { x: 6, y: -48, w: 38, h: 44 } }),

  nAir: makeMove({ name: 'Shield Arc Spin', damage: 8, startup: 4, active: 7, recovery: 9, baseKnockback: 6, hitbox: { x: -22, y: -28, w: 58, h: 50 } }),
  fAir: makeMove({ name: 'Spear Vault Poke', damage: 10, startup: 5, active: 6, recovery: 11, baseKnockback: 8, knockbackGrowth: 1.15, hitbox: { x: 30, y: -24, w: 56, h: 32 } }),
  bAir: makeMove({ name: 'Shield Back Slam', damage: 9, startup: 4, active: 5, recovery: 9, baseKnockback: 7, hitbox: { x: -36, y: -22, w: 40, h: 32 } }),
  uAir: makeMove({ name: 'Valkyrie Sky Pierce', damage: 10, startup: 4, active: 6, recovery: 10, baseKnockback: 7, knockbackAngle: -Math.PI / 2, hitbox: { x: 2, y: -50, w: 36, h: 46 } }),
  dAir: makeMove({ name: 'Spear Lightning Dive', damage: 11, startup: 6, active: 8, recovery: 13, baseKnockback: 9, knockbackAngle: Math.PI / 2.3, hitbox: { x: 0, y: 16, w: 38, h: 40 } }),

  nHeavy: makeMove({ name: 'Thunder Call Sig', type: 'heavy', damage: 18, startup: 9, active: 8, recovery: 18, baseKnockback: 11, knockbackGrowth: 1.4, sound: 'heavy', hitbox: { x: 15, y: -75, w: 50, h: 90 } }),
  sHeavy: makeMove({ name: 'Valkyrie Lance Charge', type: 'heavy', damage: 19, startup: 10, active: 8, recovery: 20, baseKnockback: 12, knockbackGrowth: 1.5, sound: 'heavy', hitbox: { x: 34, y: -26, w: 72, h: 44 } }),
  dHeavy: makeMove({ name: 'Shield Thunder Burst', type: 'heavy', damage: 16, startup: 8, active: 8, recovery: 17, baseKnockback: 10, knockbackGrowth: 1.35, sound: 'heavy', hitbox: { x: -35, y: -12, w: 85, h: 35 } }),
  uRecovery: makeMove({ name: 'Winged Ascension', type: 'recovery', damage: 13, startup: 4, active: 10, recovery: 14, baseKnockback: 8, knockbackAngle: -Math.PI / 2, sound: 'whoosh', hitbox: { x: -10, y: -48, w: 44, h: 52 } })
};

// 4. TITANUS - The Earth Colossus
const TITANUS_MOVES = {
  nLight: makeMove({ name: 'Heavy Rock Jab', damage: 11, startup: 7, active: 6, recovery: 13, baseKnockback: 7, knockbackGrowth: 1.0, hitbox: { x: 22, y: -24, w: 48, h: 38 } }),
  sLight: makeMove({ name: 'Colossus Straight', damage: 13, startup: 8, active: 6, recovery: 15, baseKnockback: 9, knockbackGrowth: 1.15, hitbox: { x: 28, y: -24, w: 55, h: 40 } }),
  dLight: makeMove({ name: 'Seismic Low Stomp', damage: 10, startup: 7, active: 5, recovery: 13, baseKnockback: 7, knockbackAngle: -Math.PI / 2.3, hitbox: { x: 18, y: -4, w: 46, h: 24 } }),
  uLight: makeMove({ name: 'Stone Uppercut', damage: 12, startup: 6, active: 6, recovery: 14, baseKnockback: 8, knockbackAngle: -Math.PI / 2, hitbox: { x: 8, y: -48, w: 44, h: 48 } }),

  nAir: makeMove({ name: 'Boulder Clap', damage: 11, startup: 6, active: 7, recovery: 12, baseKnockback: 7, hitbox: { x: -22, y: -30, w: 60, h: 52 } }),
  fAir: makeMove({ name: 'Hammer Fist', damage: 14, startup: 8, active: 6, recovery: 16, baseKnockback: 10, knockbackGrowth: 1.3, hitbox: { x: 26, y: -26, w: 52, h: 46 } }),
  bAir: makeMove({ name: 'Colossus Back Knuckle', damage: 12, startup: 6, active: 5, recovery: 12, baseKnockback: 8, hitbox: { x: -38, y: -24, w: 42, h: 36 } }),
  uAir: makeMove({ name: 'Double Overhead Fist', damage: 12, startup: 6, active: 6, recovery: 13, baseKnockback: 8, knockbackAngle: -Math.PI / 2, hitbox: { x: 2, y: -52, w: 42, h: 48 } }),
  dAir: makeMove({ name: 'Earth Anvil Drop', damage: 16, startup: 9, active: 10, recovery: 18, baseKnockback: 11, knockbackAngle: Math.PI / 2.2, hitbox: { x: 0, y: 18, w: 44, h: 44 } }),

  nHeavy: makeMove({ name: 'Stone Eruption Sig', type: 'heavy', damage: 22, startup: 13, active: 9, recovery: 25, baseKnockback: 13, knockbackGrowth: 1.6, sound: 'heavy', hitbox: { x: 10, y: -65, w: 65, h: 80 } }),
  sHeavy: makeMove({ name: 'Titan Armor Charge', type: 'heavy', damage: 24, startup: 14, active: 8, recovery: 26, baseKnockback: 14, knockbackGrowth: 1.7, sound: 'heavy', hitbox: { x: 36, y: -28, w: 78, h: 52 } }),
  dHeavy: makeMove({ name: 'Earthquake Slam', type: 'heavy', damage: 21, startup: 12, active: 9, recovery: 23, baseKnockback: 12, knockbackGrowth: 1.5, sound: 'heavy', hitbox: { x: -50, y: -10, w: 115, h: 38 } }),
  uRecovery: makeMove({ name: 'Colossus Super Leap', type: 'recovery', damage: 15, startup: 6, active: 11, recovery: 17, baseKnockback: 9, knockbackAngle: -Math.PI / 2, sound: 'whoosh', hitbox: { x: -10, y: -48, w: 48, h: 54 } })
};

// Character Vector Rendering Implementations
const CHARACTERS_LIST = [
  new CharacterData({
    id: 'valravn',
    name: 'VALRAVN',
    title: 'The Shadow Assassin',
    element: 'shadow',
    themeColor: '#a855f7',
    desc: 'Pembunuh bayangan lincah bersenjatakan belati ganda. Bergerak secepat kilat dengan kombo bertubi-tubi.',
    stats: { speed: 9, attack: 6, defense: 5, dex: 8, weight: 80 },
    moves: VALRAVN_MOVES,
    render: function(ctx, fighter) {
      const facing = fighter.facing || 1;
      const t = fighter.animTimer || 0;
      const isAttacking = fighter.isAttacking;
      const isMoving = Math.abs(fighter.vx) > 0.5 && fighter.onGround;

      ctx.save();
      ctx.scale(facing, 1);

      // Shadow aura glow
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;

      // Scarf / Cloak Trail
      const capeWave = Math.sin(t * 8) * 8;
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(-10, -22);
      ctx.quadraticCurveTo(-26 - (isMoving ? 12 : 0), -18 + capeWave, -32 - (isMoving ? 18 : 0), -8 + capeWave * 1.5);
      ctx.lineTo(-24, -26);
      ctx.closePath();
      ctx.fill();

      // Legs
      const legOffset = isMoving ? Math.sin(t * 12) * 8 : 0;
      ctx.fillStyle = '#1e1b4b';
      // Left leg
      ctx.fillRect(-10 + legOffset, -10, 7, 18);
      // Right leg
      ctx.fillRect(2 - legOffset, -10, 7, 18);

      // Torso / Ninja Tunic
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.roundRect(-12, -32, 22, 24, 4);
      ctx.fill();

      // Belt & Buckle
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(-12, -14, 22, 3);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-3, -15, 5, 5);

      // Head & Cowl
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, -40, 12, 0, Math.PI * 2);
      ctx.fill();

      // Cowl Point
      ctx.beginPath();
      ctx.moveTo(-10, -42);
      ctx.lineTo(-18, -48);
      ctx.lineTo(-6, -50);
      ctx.closePath();
      ctx.fill();

      // Glowing Eyes
      ctx.fillStyle = '#c084fc';
      ctx.shadowColor = '#e9d5ff';
      ctx.shadowBlur = 8;
      ctx.fillRect(2, -42, 6, 2.5);

      // Arms & Dual Daggers
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4c1d95';
      if (isAttacking) {
        // Attack pose with thrust dagger
        ctx.fillRect(4, -28, 16, 5);
        // Dagger blade
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(20, -31);
        ctx.lineTo(36, -26);
        ctx.lineTo(20, -21);
        ctx.closePath();
        ctx.fill();
      } else {
        // Idle ready stance with twin daggers
        ctx.fillRect(4, -26, 8, 10);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(8, -16, 12, 3); // Dagger 1
        ctx.fillRect(4, -20, 10, 3); // Dagger 2
      }

      ctx.restore();
    }
  }),

  new CharacterData({
    id: 'ignis',
    name: 'IGNIS',
    title: 'The Flame Knight',
    element: 'fire',
    themeColor: '#ef4444',
    desc: 'Ksatria berzirah berat bersenjatakan pedang api raksasa. Menghasilkan ledakan magma dan daya pukul luar biasa.',
    stats: { speed: 5, attack: 9, defense: 8, dex: 5, weight: 110 },
    moves: IGNIS_MOVES,
    render: function(ctx, fighter) {
      const facing = fighter.facing || 1;
      const t = fighter.animTimer || 0;
      const isAttacking = fighter.isAttacking;
      const isMoving = Math.abs(fighter.vx) > 0.5 && fighter.onGround;

      ctx.save();
      ctx.scale(facing, 1);

      // Flame Plume
      const flameWiggle = Math.sin(t * 10) * 4;
      ctx.fillStyle = '#f97316';
      ctx.shadowColor = '#ea580c';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-6, -52);
      ctx.quadraticCurveTo(-14 + flameWiggle, -66, -4, -72);
      ctx.quadraticCurveTo(4, -64, 2, -52);
      ctx.closePath();
      ctx.fill();

      // Crimson Armor Legs
      const legOffset = isMoving ? Math.sin(t * 10) * 7 : 0;
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(-12 + legOffset, -12, 9, 20);
      ctx.fillRect(3 - legOffset, -12, 9, 20);

      // Steel Sabatons (Boots)
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(-14 + legOffset, 4, 13, 6);
      ctx.fillRect(1 - legOffset, 4, 13, 6);

      // Heavy Plate Chestplate
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.roundRect(-15, -36, 28, 26, 4);
      ctx.fill();

      // Gold Trim
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-15, -28, 28, 3);
      ctx.fillRect(-3, -36, 5, 26);

      // Pauldrons (Shoulder Guards)
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(-14, -34, 7, 0, Math.PI * 2);
      ctx.arc(14, -34, 7, 0, Math.PI * 2);
      ctx.fill();

      // Knight Helm
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.roundRect(-10, -50, 20, 16, 4);
      ctx.fill();

      // Glowing Visor Slit
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      ctx.fillRect(-2, -45, 10, 3);

      // Giant Greatsword
      ctx.shadowBlur = 0;
      if (isAttacking) {
        // Swinging Greatsword
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 16;
        ctx.save();
        ctx.translate(14, -28);
        ctx.rotate(-0.3 + Math.sin(t * 15) * 0.4);
        ctx.fillRect(0, -6, 44, 12); // Big blade
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(8, -3, 30, 6);  // Blazing core
        ctx.restore();
      } else {
        // Greatsword on Back / Rest
        ctx.fillStyle = '#7f1d1d';
        ctx.save();
        ctx.translate(-16, -20);
        ctx.rotate(-0.5);
        ctx.fillRect(0, -32, 10, 42); // Blade
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4, 6, 18, 5);  // Hilt cross
        ctx.restore();
      }

      ctx.restore();
    }
  }),

  new CharacterData({
    id: 'astrid',
    name: 'ASTRID',
    title: 'The Valkyrie Champion',
    element: 'thunder',
    themeColor: '#06b6d4',
    desc: 'Prajurit Valkyrie pelindung langit. Menggunakan tombak petir dan perisai suci untuk serangan berjangkauan luas.',
    stats: { speed: 7, attack: 7, defense: 7, dex: 7, weight: 90 },
    moves: ASTRID_MOVES,
    render: function(ctx, fighter) {
      const facing = fighter.facing || 1;
      const t = fighter.animTimer || 0;
      const isAttacking = fighter.isAttacking;
      const isMoving = Math.abs(fighter.vx) > 0.5 && fighter.onGround;

      ctx.save();
      ctx.scale(facing, 1);

      // Golden Valkyrie Wings (Subtle flap)
      const wingFlap = Math.sin(t * 8) * 0.15;
      ctx.save();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      // Wing Left
      ctx.beginPath();
      ctx.moveTo(-10, -30);
      ctx.quadraticCurveTo(-28, -50 + wingFlap * 20, -36, -34);
      ctx.quadraticCurveTo(-26, -22, -10, -26);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Flowing Hair
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-8, -44);
      ctx.quadraticCurveTo(-22, -38, -26, -20);
      ctx.lineTo(-12, -28);
      ctx.closePath();
      ctx.fill();

      // Legs
      const legOffset = isMoving ? Math.sin(t * 11) * 7 : 0;
      ctx.fillStyle = '#0e7490';
      ctx.fillRect(-10 + legOffset, -10, 7, 18);
      ctx.fillRect(2 - legOffset, -10, 7, 18);

      // Torso / Valkyrie Tunic & Cuirass
      ctx.fillStyle = '#0891b2';
      ctx.beginPath();
      ctx.roundRect(-12, -34, 23, 25, 4);
      ctx.fill();

      // Gold Chest Eagle Plate
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(-1, -26, 6, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -42, 10, 0, Math.PI * 2);
      ctx.fill();

      // Winged Golden Circlet / Helm
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.roundRect(-10, -48, 20, 7, 3);
      ctx.fill();
      // Wing ornament on helmet
      ctx.beginPath();
      ctx.moveTo(-6, -48);
      ctx.lineTo(-16, -58);
      ctx.lineTo(-8, -52);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(3, -43, 3, 3);

      // Weapons: Shield (Left) and Spear (Right)
      // Radiant Shield
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-10, -22, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Spear
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#94a3b8';
      if (isAttacking) {
        // Forward Thrusting Spear
        ctx.fillRect(0, -24, 46, 4);
        // Spear head
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#e0f2fe';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(46, -29);
        ctx.lineTo(60, -22);
        ctx.lineTo(46, -15);
        ctx.closePath();
        ctx.fill();
      } else {
        // Upright Spear
        ctx.fillRect(10, -48, 4, 48);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(7, -48);
        ctx.lineTo(12, -62);
        ctx.lineTo(17, -48);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }
  }),

  new CharacterData({
    id: 'titanus',
    name: 'TITANUS',
    title: 'The Earth Colossus',
    element: 'earth',
    themeColor: '#f59e0b',
    desc: 'Raksasa bertubuh batu dengan sarung tinju seismik. Berdaya tahan sangat tinggi dan memiliki serangan mematikan.',
    stats: { speed: 4, attack: 9.5, defense: 9.5, dex: 4, weight: 140 },
    moves: TITANUS_MOVES,
    render: function(ctx, fighter) {
      const facing = fighter.facing || 1;
      const t = fighter.animTimer || 0;
      const isAttacking = fighter.isAttacking;
      const isMoving = Math.abs(fighter.vx) > 0.5 && fighter.onGround;

      ctx.save();
      ctx.scale(facing, 1);

      // Heavy Boulder Legs
      const legOffset = isMoving ? Math.sin(t * 8) * 6 : 0;
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-16 + legOffset, -14, 14, 22, 4);
      ctx.roundRect(4 - legOffset, -14, 14, 22, 4);
      ctx.fill();

      // Heavy Stone Torso
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-20, -42, 40, 30, 6);
      ctx.fill();

      // Glowing Magma Fissures on Chest
      ctx.strokeStyle = '#f59e0b';
      ctx.shadowColor = '#d97706';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-12, -36);
      ctx.lineTo(-4, -28);
      ctx.lineTo(8, -34);
      ctx.stroke();

      // Giant Stone Shoulders
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-22, -38, 11, 0, Math.PI * 2);
      ctx.arc(22, -38, 11, 0, Math.PI * 2);
      ctx.fill();

      // Stone Head / Horned Mask
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-12, -56, 24, 18, 5);
      ctx.fill();

      // Amber Monolith Eye Glow
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 14;
      ctx.fillRect(0, -50, 9, 4);

      // Colossal Stone Gauntlets (Fists)
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      if (isAttacking) {
        // Extended massive punch
        ctx.beginPath();
        ctx.roundRect(16, -34, 28, 24, 6);
        ctx.fill();
        ctx.stroke();
      } else {
        // Rest fist stance
        ctx.beginPath();
        ctx.roundRect(10, -28, 18, 20, 5);
        ctx.roundRect(-24, -28, 18, 20, 5);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }
  })
];

window.CHARACTERS = {};
CHARACTERS_LIST.forEach(char => {
  window.CHARACTERS[char.id] = char;
});
