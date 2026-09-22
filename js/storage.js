/**
 * Storage & Player Progression Management
 * Handles XP, ranks, achievements, stats, and settings persistence.
 */
class PlayerStorage {
    constructor() {
        this.STORAGE_KEY = 'mathemagica_player_data';
        this.data = this.loadData();
    }

    getDefaultData() {
        return {
            xp: 0,
            level: 1,
            stars: 0,
            streak: 0,
            bestStreak: 0,
            totalSolved: 0,
            modeStats: {
                make24: { solved: 0, bestTime: null },
                crossGrid: { solved: 0, bestTime: null },
                visualAlgebra: { solved: 0, bestTime: null },
                sequence: { solved: 0, bestTime: null },
                timeAttack: { highScore: 0, bestCombo: 0 }
            },
            achievements: {},
            settings: {
                sound: true,
                music: false
            }
        };
    }

    loadData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return this.getDefaultData();
            const parsed = JSON.parse(raw);
            return Object.assign(this.getDefaultData(), parsed);
        } catch (e) {
            console.warn("Error reading localStorage:", e);
            return this.getDefaultData();
        }
    }

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
        } catch (e) {
            console.warn("Error saving to localStorage:", e);
        }
    }

    // Rank titles based on Level
    getRankTitle(level) {
        const ranks = [
            { min: 1, title: 'Novis Aritmatika', icon: '🌱', color: '#94a3b8' },
            { min: 3, title: 'Petualang Angka', icon: '⚡', color: '#38bdf8' },
            { min: 6, title: 'Pakar Aljabar', icon: '🔮', color: '#818cf8' },
            { min: 10, title: 'Cendekiawan Matriks', icon: '📐', color: '#34d399' },
            { min: 15, title: 'Master Logika', icon: '💎', color: '#f472b6' },
            { min: 20, title: 'Grandmaster Matematika', icon: '👑', color: '#fbbf24' },
            { min: 30, title: 'Dewa Perhitungan', icon: '🌌', color: '#e879f9' }
        ];

        let current = ranks[0];
        for (let r of ranks) {
            if (level >= r.min) current = r;
        }
        return current;
    }

    getXPForNextLevel(level) {
        return Math.floor(100 * Math.pow(1.25, level - 1));
    }

    addXP(amount) {
        this.data.xp += amount;
        let leveledUp = false;
        let nextReq = this.getXPForNextLevel(this.data.level);

        while (this.data.xp >= nextReq) {
            this.data.xp -= nextReq;
            this.data.level++;
            this.data.stars += 5;
            leveledUp = true;
            nextReq = this.getXPForNextLevel(this.data.level);
        }

        this.save();
        return { leveledUp, newLevel: this.data.level, currentXP: this.data.xp, nextReq };
    }

    incrementStreak() {
        this.data.streak++;
        if (this.data.streak > this.data.bestStreak) {
            this.data.bestStreak = this.data.streak;
        }
        this.save();
        return this.data.streak;
    }

    resetStreak() {
        this.data.streak = 0;
        this.save();
    }

    recordSolved(mode, timeSeconds = null) {
        this.data.totalSolved++;
        if (this.data.modeStats[mode]) {
            this.data.modeStats[mode].solved++;
            if (timeSeconds !== null) {
                const currentBest = this.data.modeStats[mode].bestTime;
                if (!currentBest || timeSeconds < currentBest) {
                    this.data.modeStats[mode].bestTime = timeSeconds;
                }
            }
        }
        this.save();
        this.checkAchievements();
    }

    recordTimeAttackScore(score, combo) {
        const current = this.data.modeStats.timeAttack;
        if (score > current.highScore) {
            current.highScore = score;
        }
        if (combo > current.bestCombo) {
            current.bestCombo = combo;
        }
        this.save();
        this.checkAchievements();
    }

    // Achievements Catalog
    getAchievementDefs() {
        return [
            {
                id: 'first_step',
                title: 'Langkah Awal',
                desc: 'Selesaikan teka-teki pertamamu!',
                icon: '🎯',
                xp: 50,
                check: (d) => d.totalSolved >= 1
            },
            {
                id: 'streak_5',
                title: 'Kombinasi Tajam',
                desc: 'Capai streak berturut-turut 5 kali.',
                icon: '🔥',
                xp: 100,
                check: (d) => d.bestStreak >= 5
            },
            {
                id: 'streak_10',
                title: 'Otak Cepat Tak Terhentikan',
                desc: 'Capai streak berturut-turut 10 kali.',
                icon: '⚡',
                xp: 250,
                check: (d) => d.bestStreak >= 10
            },
            {
                id: 'make24_expert',
                title: 'Pakar Angka 24',
                desc: 'Selesaikan 5 teka-teki Make 24.',
                icon: '🎲',
                xp: 150,
                check: (d) => d.modeStats.make24.solved >= 5
            },
            {
                id: 'grid_master',
                title: 'Arsitek Matriks',
                desc: 'Selesaikan 5 teka-teki Kisi Persamaan.',
                icon: '🧩',
                xp: 150,
                check: (d) => d.modeStats.crossGrid.solved >= 5
            },
            {
                id: 'algebra_detective',
                title: 'Detektif Simbol',
                desc: 'Selesaikan 5 teka-teki Aljabar Ikon.',
                icon: '🕵️‍♂️',
                xp: 150,
                check: (d) => d.modeStats.visualAlgebra.solved >= 5
            },
            {
                id: 'sequence_oracle',
                title: 'Peramal Deret',
                desc: 'Selesaikan 5 teka-teki Pola Bilangan.',
                icon: '🔮',
                xp: 150,
                check: (d) => d.modeStats.sequence.solved >= 5
            },
            {
                id: 'speed_demon',
                title: 'Kilat Aritmatika',
                desc: 'Raih skor minimal 500 di Mode Time Attack.',
                icon: '⏱️',
                xp: 200,
                check: (d) => d.modeStats.timeAttack.highScore >= 500
            },
            {
                id: 'veteran_solver',
                title: 'Penakluk Matematika',
                desc: 'Pecahkan total 25 teka-teki di semua mode.',
                icon: '🏆',
                xp: 500,
                check: (d) => d.totalSolved >= 25
            },
            {
                id: 'level_5',
                title: 'Kenaikan Pangkat',
                desc: 'Capai Level 5.',
                icon: '⭐',
                xp: 200,
                check: (d) => d.level >= 5
            }
        ];
    }

    checkAchievements() {
        const defs = this.getAchievementDefs();
        const unlockedList = [];

        defs.forEach(def => {
            if (!this.data.achievements[def.id] && def.check(this.data)) {
                this.data.achievements[def.id] = {
                    unlockedAt: new Date().toISOString()
                };
                this.addXP(def.xp);
                unlockedList.push(def);
            }
        });

        if (unlockedList.length > 0) {
            this.save();
        }
        return unlockedList;
    }
}

window.playerStorage = new PlayerStorage();
