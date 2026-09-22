/**
 * Mathemagica - Main Application Controller
 * Handles UI interactions, game state loops, validation, hints, and event listeners.
 */

class MathGameApp {
    constructor() {
        this.currentMode = 'make24'; // 'make24', 'crossGrid', 'visualAlgebra', 'sequence', 'timeAttack'
        
        // Mode Specific States
        this.state24 = {
            currentPuzzle: null,
            formulaTokens: [], // e.g. [{type: 'num', val: 8, cardIdx: 0}, {type: 'op', val: '*'}]
            usedCardIndices: new Set(),
            hintStep: 0
        };

        this.stateGrid = {
            puzzle: null,
            activeCellId: null,
            userValues: { A: '', B: '', C: '', D: '' }
        };

        this.stateAlgebra = {
            puzzle: null
        };

        this.stateSequence = {
            puzzle: null
        };

        this.stateTimeAttack = {
            active: false,
            score: 0,
            combo: 0,
            timeLeft: 45,
            timerInterval: null,
            currentQuestion: null,
            totalAnswered: 0,
            correctCount: 0
        };

        this.initDOM();
        this.bindEvents();
        this.updatePlayerHUD();
        this.switchMode('make24');
    }

    initDOM() {
        // Nav Tabs
        this.navTabs = document.querySelectorAll('.mode-tab');
        this.modeViews = document.querySelectorAll('.mode-view');

        // Player HUD
        this.rankBadge = document.getElementById('rank-badge');
        this.xpBarFill = document.getElementById('xp-bar-fill');
        this.xpLabel = document.getElementById('xp-label');
        this.levelLabel = document.getElementById('level-label');
        this.streakValue = document.getElementById('streak-value');
        this.starsValue = document.getElementById('stars-value');

        // Mode 24 Elements
        this.cardsContainer24 = document.getElementById('make24-cards');
        this.formulaText24 = document.getElementById('formula-text');
        this.formulaEval24 = document.getElementById('formula-eval');

        // Grid Elements
        this.crossGridContainer = document.getElementById('cross-grid-container');

        // Visual Algebra Elements
        this.algebraEquations = document.getElementById('algebra-equations');
        this.algebraQuestion = document.getElementById('algebra-question');
        this.algebraOptions = document.getElementById('algebra-options');

        // Sequence Elements
        this.sequenceBubbles = document.getElementById('sequence-bubbles');
        this.sequenceOptions = document.getElementById('sequence-options');

        // Time Attack Elements
        this.taTimer = document.getElementById('ta-timer');
        this.taScore = document.getElementById('ta-score');
        this.taCombo = document.getElementById('ta-combo');
        this.taQuestion = document.getElementById('ta-question');
        this.taOptions = document.getElementById('ta-options');
        this.taStartOverlay = document.getElementById('ta-start-overlay');

        // Modals
        this.achievementsModal = document.getElementById('achievements-modal');
        this.hintModal = document.getElementById('hint-modal');
        this.hintTitle = document.getElementById('hint-title');
        this.hintContent = document.getElementById('hint-content');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.toastContainer = document.getElementById('toast-container');
    }

    bindEvents() {
        // Navigation Tabs
        this.navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                window.soundCtrl.playClick(500);
                this.switchMode(mode);
            });
        });

        // Sound & Ambient Music Toggles
        const soundBtn = document.getElementById('sound-toggle-btn');
        const musicBtn = document.getElementById('music-toggle-btn');

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                window.soundCtrl.soundEnabled = !window.soundCtrl.soundEnabled;
                soundBtn.textContent = window.soundCtrl.soundEnabled ? '🔊' : '🔇';
                soundBtn.classList.toggle('active', window.soundCtrl.soundEnabled);
                window.soundCtrl.playClick();
            });
        }

        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                const newState = !window.soundCtrl.musicEnabled;
                window.soundCtrl.toggleAmbientMusic(newState);
                musicBtn.textContent = newState ? '🎵' : '🎼';
                musicBtn.classList.toggle('active', newState);
                window.soundCtrl.playClick();
            });
        }

        // Achievements Modal Open / Close
        const achievementsBtn = document.getElementById('achievements-btn');
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                window.soundCtrl.playClick();
                this.openAchievementsModal();
            });
        }

        // Universal Close Modal Handlers
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundCtrl.playClick(380);
                this.closeAllModals();
            });
        });

        // Mode 24 Operator Buttons
        document.querySelectorAll('.make24-op').forEach(btn => {
            btn.addEventListener('click', () => {
                const op = btn.dataset.op;
                this.addOperator24(op);
            });
        });

        // Mode 24 Controls (Clear, Backspace, Submit, Hint, New)
        document.getElementById('make24-clear')?.addEventListener('click', () => this.clearFormula24());
        document.getElementById('make24-backspace')?.addEventListener('click', () => this.backspaceFormula24());
        document.getElementById('make24-submit')?.addEventListener('click', (e) => this.submitFormula24(e));
        document.getElementById('make24-hint-btn')?.addEventListener('click', () => this.showHint24());
        document.getElementById('make24-new-btn')?.addEventListener('click', () => {
            window.soundCtrl.playClick();
            this.startMake24();
        });

        // Cross-Grid Controls
        document.getElementById('grid-new-btn')?.addEventListener('click', () => {
            window.soundCtrl.playClick();
            this.startCrossGrid();
        });
        document.getElementById('grid-hint-btn')?.addEventListener('click', () => this.showHintGrid());
        document.getElementById('grid-check-btn')?.addEventListener('click', (e) => this.checkCrossGrid(e));

        // Visual Algebra Controls
        document.getElementById('algebra-new-btn')?.addEventListener('click', () => {
            window.soundCtrl.playClick();
            this.startVisualAlgebra();
        });
        document.getElementById('algebra-hint-btn')?.addEventListener('click', () => this.showHintAlgebra());

        // Sequence Controls
        document.getElementById('seq-new-btn')?.addEventListener('click', () => {
            window.soundCtrl.playClick();
            this.startSequence();
        });
        document.getElementById('seq-hint-btn')?.addEventListener('click', () => this.showHintSequence());

        // Time Attack Start Button
        document.getElementById('ta-start-btn')?.addEventListener('click', () => {
            window.soundCtrl.playClick(600);
            this.startTimeAttack();
        });
        document.getElementById('ta-restart-btn')?.addEventListener('click', () => {
            window.soundCtrl.playClick(600);
            this.closeAllModals();
            this.startTimeAttack();
        });

        // Physical Keyboard Support
        window.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    switchMode(mode) {
        this.currentMode = mode;

        // Update nav tabs active style
        this.navTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });

        // Update views
        this.modeViews.forEach(view => {
            view.classList.toggle('active', view.id === `view-${mode}`);
        });

        // Start or reset specific mode
        if (mode === 'make24') {
            if (!this.state24.currentPuzzle) this.startMake24();
        } else if (mode === 'crossGrid') {
            if (!this.stateGrid.puzzle) this.startCrossGrid();
        } else if (mode === 'visualAlgebra') {
            if (!this.stateAlgebra.puzzle) this.startVisualAlgebra();
        } else if (mode === 'sequence') {
            if (!this.stateSequence.puzzle) this.startSequence();
        } else if (mode === 'timeAttack') {
            if (this.stateTimeAttack.active) {
                this.stopTimeAttack();
            }
            if (this.taStartOverlay) {
                this.taStartOverlay.style.display = 'flex';
            }
        }
    }

    updatePlayerHUD() {
        const data = window.playerStorage.data;
        const rank = window.playerStorage.getRankTitle(data.level);
        const nextXP = window.playerStorage.getXPForNextLevel(data.level);
        const pct = Math.min(100, Math.round((data.xp / nextXP) * 100));

        if (this.rankBadge) {
            this.rankBadge.innerHTML = `<span>${rank.icon}</span> <span>${rank.title}</span>`;
            this.rankBadge.style.borderColor = rank.color;
        }

        if (this.levelLabel) this.levelLabel.textContent = `Lv. ${data.level}`;
        if (this.xpLabel) this.xpLabel.textContent = `${data.xp} / ${nextXP} XP`;
        if (this.xpBarFill) this.xpBarFill.style.width = `${pct}%`;

        if (this.streakValue) {
            this.streakValue.textContent = data.streak;
            const streakPill = this.streakValue.parentElement;
            if (data.streak >= 3) {
                streakPill.classList.add('streak-fire');
            } else {
                streakPill.classList.remove('streak-fire');
            }
        }

        if (this.starsValue) this.starsValue.textContent = data.stars;
    }

    showToast(message, icon = '🎉') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span style="font-size: 20px;">${icon}</span> <span>${message}</span>`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    onPuzzleSuccess(mode, xpReward = 50, clientPos = null) {
        window.soundCtrl.playCorrect(window.playerStorage.data.streak + 1);
        
        const newStreak = window.playerStorage.incrementStreak();
        if (newStreak % 3 === 0) {
            window.soundCtrl.playStreak();
        }

        const xpResult = window.playerStorage.addXP(xpReward);
        window.playerStorage.recordSolved(mode);

        if (clientPos && window.particleEngine) {
            window.particleEngine.burstSparks(clientPos.x, clientPos.y, 25, '#38bdf8');
        }

        this.showToast(`Benar! +${xpReward} XP (Streak ${newStreak}🔥)`);

        if (xpResult.leveledUp) {
            window.soundCtrl.playVictory();
            if (window.particleEngine) window.particleEngine.launchConfetti();
            this.showToast(`Level Up! Kamu sekarang Level ${xpResult.newLevel}! ⭐ +5 Bintang`, '👑');
        }

        this.updatePlayerHUD();
    }

    onPuzzleFail(elem = null) {
        window.soundCtrl.playWrong();
        window.playerStorage.resetStreak();
        this.updatePlayerHUD();

        if (elem) {
            elem.classList.remove('shake-animation');
            void elem.offsetWidth; // trigger reflow
            elem.classList.add('shake-animation');
        }
        this.showToast('Jawaban belum tepat, coba periksa kembali!', '❌');
    }

    // ==========================================
    // 1. MAKE 24 CONTROLLER
    // ==========================================
    startMake24() {
        const puzzle = window.puzzleEngine.generate24Puzzle('normal');
        this.state24.currentPuzzle = puzzle;
        this.state24.formulaTokens = [];
        this.state24.usedCardIndices.clear();
        this.state24.hintStep = 0;

        this.renderCards24();
        this.updateFormulaDisplay24();
    }

    renderCards24() {
        this.cardsContainer24.innerHTML = '';
        this.state24.currentPuzzle.numbers.forEach((num, index) => {
            const card = document.createElement('div');
            card.className = 'number-card';
            card.textContent = num;
            card.dataset.index = index;

            if (this.state24.usedCardIndices.has(index)) {
                card.classList.add('used');
            }

            card.addEventListener('click', (e) => {
                if (!this.state24.usedCardIndices.has(index)) {
                    window.soundCtrl.playSelect(this.state24.formulaTokens.length);
                    if (window.particleEngine) {
                        const rect = card.getBoundingClientRect();
                        window.particleEngine.burstSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
                    }
                    this.addNumber24(num, index);
                }
            });

            this.cardsContainer24.appendChild(card);
        });
    }

    addNumber24(num, cardIndex) {
        // Can add number if formula is empty or after an operator or opening bracket
        const lastToken = this.state24.formulaTokens[this.state24.formulaTokens.length - 1];
        if (lastToken && (lastToken.type === 'num' || lastToken.val === ')')) {
            // Cannot place two numbers consecutively without operator
            return;
        }

        this.state24.formulaTokens.push({ type: 'num', val: num, cardIdx: cardIndex });
        this.state24.usedCardIndices.add(cardIndex);
        this.renderCards24();
        this.updateFormulaDisplay24();
    }

    addOperator24(op) {
        window.soundCtrl.playSelect(this.state24.formulaTokens.length);
        const lastToken = this.state24.formulaTokens[this.state24.formulaTokens.length - 1];

        if (op === '(') {
            if (!lastToken || lastToken.type === 'op' && lastToken.val !== ')') {
                this.state24.formulaTokens.push({ type: 'op', val: '(' });
            }
        } else if (op === ')') {
            // Check matching parens count
            const openCount = this.state24.formulaTokens.filter(t => t.val === '(').length;
            const closeCount = this.state24.formulaTokens.filter(t => t.val === ')').length;
            if (openCount > closeCount && lastToken && (lastToken.type === 'num' || lastToken.val === ')')) {
                this.state24.formulaTokens.push({ type: 'op', val: ')' });
            }
        } else {
            // Basic operator +, -, *, /
            if (lastToken && (lastToken.type === 'num' || lastToken.val === ')')) {
                this.state24.formulaTokens.push({ type: 'op', val: op });
            }
        }

        this.updateFormulaDisplay24();
    }

    clearFormula24() {
        window.soundCtrl.playClick(320);
        this.state24.formulaTokens = [];
        this.state24.usedCardIndices.clear();
        this.renderCards24();
        this.updateFormulaDisplay24();
    }

    backspaceFormula24() {
        if (this.state24.formulaTokens.length === 0) return;
        window.soundCtrl.playClick(350);
        const removed = this.state24.formulaTokens.pop();
        if (removed.type === 'num') {
            this.state24.usedCardIndices.delete(removed.cardIdx);
            this.renderCards24();
        }
        this.updateFormulaDisplay24();
    }

    formatFormulaString24() {
        return this.state24.formulaTokens.map(t => {
            if (t.val === '*') return '×';
            if (t.val === '/') return '÷';
            return t.val;
        }).join(' ');
    }

    evaluateFormula24() {
        if (this.state24.formulaTokens.length === 0) return null;
        try {
            const rawExpr = this.state24.formulaTokens.map(t => t.val).join('');
            // Simple safe evaluation
            if (/[^0-9+\-*/()]/.test(rawExpr)) return null;
            // Prevent trailing operator eval errors
            const lastToken = this.state24.formulaTokens[this.state24.formulaTokens.length - 1];
            if (lastToken.type === 'op' && lastToken.val !== ')') return null;

            const res = Function(`'use strict'; return (${rawExpr})`)();
            if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
                return Math.round(res * 100) / 100;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    updateFormulaDisplay24() {
        const str = this.formatFormulaString24();
        if (!str) {
            this.formulaText24.textContent = 'Pilih angka & operator...';
            this.formulaText24.classList.add('placeholder');
            this.formulaEval24.textContent = '= ?';
        } else {
            this.formulaText24.textContent = str;
            this.formulaText24.classList.remove('placeholder');

            const val = this.evaluateFormula24();
            this.formulaEval24.textContent = val !== null ? `= ${val}` : '= ...';
        }
    }

    submitFormula24(e) {
        const totalUsed = this.state24.usedCardIndices.size;
        if (totalUsed < 4) {
            this.showToast('Gunakan semua 4 angka yang ada di kartu!', '⚠️');
            this.onPuzzleFail(this.formulaDisplay24 || document.querySelector('.formula-display'));
            return;
        }

        const val = this.evaluateFormula24();
        if (val !== null && Math.abs(val - 24) < 1e-6) {
            const rect = e.target.getBoundingClientRect();
            this.onPuzzleSuccess('make24', 60, { x: rect.left + rect.width / 2, y: rect.top });
            setTimeout(() => this.startMake24(), 1200);
        } else {
            this.onPuzzleFail(document.querySelector('.formula-display'));
        }
    }

    showHint24() {
        const solutions = this.state24.currentPuzzle.solutions;
        if (!solutions || solutions.length === 0) {
            this.openHintModal('Petunjuk Make 24', '<p>Kombinasikan operasi kali dan bagi terlebih dahulu untuk mencari angka 24.</p>');
            return;
        }

        this.state24.hintStep++;
        const sampleSol = solutions[0];

        let content = '';
        if (this.state24.hintStep === 1) {
            content = `
                <p>💡 <strong>Petunjuk Langkah 1:</strong></p>
                <p>Terdapat ${solutions.length} cara berbeda untuk menyelesaikan puzzle ini.</p>
                <p>Cobalah perhatikan angka <strong>${this.state24.currentPuzzle.numbers[0]}</strong> dan <strong>${this.state24.currentPuzzle.numbers[1]}</strong>.</p>
            `;
        } else if (this.state24.hintStep === 2) {
            content = `
                <p>💡 <strong>Petunjuk Langkah 2 (Struktur Rumus):</strong></p>
                <p>Pola rumus yang dapat digunakan menyerupai:</p>
                <div style="font-family: monospace; font-size: 20px; color: var(--cyan); margin: 12px 0; text-align: center;">
                    ${sampleSol.replace(/\d+/g, '?')} = 24
                </div>
            `;
        } else {
            content = `
                <p>💡 <strong>Solusi Lengkap:</strong></p>
                <div style="font-family: monospace; font-size: 22px; color: var(--emerald); margin: 12px 0; text-align: center; font-weight: 700;">
                    ${sampleSol} = 24
                </div>
                <p style="font-size: 13px; color: var(--text-muted);">Kamu bisa mencoba menyusunnya sekarang!</p>
            `;
        }

        this.openHintModal('Petunjuk Make 24', content);
    }

    // ==========================================
    // 2. CROSS-MATH GRID CONTROLLER
    // ==========================================
    startCrossGrid() {
        const puzzle = window.puzzleEngine.generateCrossGrid();
        this.stateGrid.puzzle = puzzle;
        this.stateGrid.userValues = {
            A: puzzle.masked.A ? '' : puzzle.cells.A,
            B: puzzle.masked.B ? '' : puzzle.cells.B,
            C: puzzle.masked.C ? '' : puzzle.cells.C,
            D: puzzle.masked.D ? '' : puzzle.cells.D
        };

        this.stateGrid.activeCellId = puzzle.masked.A ? 'A' : (puzzle.masked.B ? 'B' : 'C');
        this.renderCrossGrid();
    }

    renderCrossGrid() {
        const p = this.stateGrid.puzzle;
        this.crossGridContainer.innerHTML = '';

        // Helper to format operator
        const opSym = (op) => op === '*' ? '×' : (op === '/' ? '÷' : op);

        // 5x5 Layout Matrix:
        // [ Cell A ] [ Op1 ] [ Cell B ] [ = ] [ Target R1 ]
        // [ Op3    ] [     ] [ Op4    ] [   ] [           ]
        // [ Cell C ] [ Op2 ] [ Cell D ] [ = ] [ Target R2 ]
        // [ =      ] [     ] [ =      ] [   ] [           ]
        // [ Target C1] [  ] [ Target C2] [ ] [           ]

        const createCell = (type, content, id = null) => {
            const div = document.createElement('div');
            div.className = `grid-cell ${type}`;
            div.textContent = content;

            if (type === 'num-input' && id) {
                div.dataset.cellId = id;
                if (this.stateGrid.activeCellId === id) div.classList.add('active');
                div.addEventListener('click', () => {
                    window.soundCtrl.playClick(520);
                    this.stateGrid.activeCellId = id;
                    this.renderCrossGrid();
                });
            }

            return div;
        };

        // Row 1
        this.crossGridContainer.appendChild(
            p.masked.A 
                ? createCell('num-input', this.stateGrid.userValues.A || '?', 'A')
                : createCell('num-static', p.cells.A)
        );
        this.crossGridContainer.appendChild(createCell('op', opSym(p.operators.op1)));
        this.crossGridContainer.appendChild(
            p.masked.B 
                ? createCell('num-input', this.stateGrid.userValues.B || '?', 'B')
                : createCell('num-static', p.cells.B)
        );
        this.crossGridContainer.appendChild(createCell('equals', '='));
        this.crossGridContainer.appendChild(createCell('target-res', p.targets.R1));

        // Row 2 (Vertical Operators)
        this.crossGridContainer.appendChild(createCell('op', opSym(p.operators.op3)));
        this.crossGridContainer.appendChild(createCell('empty', ''));
        this.crossGridContainer.appendChild(createCell('op', opSym(p.operators.op4)));
        this.crossGridContainer.appendChild(createCell('empty', ''));
        this.crossGridContainer.appendChild(createCell('empty', ''));

        // Row 3
        this.crossGridContainer.appendChild(
            p.masked.C 
                ? createCell('num-input', this.stateGrid.userValues.C || '?', 'C')
                : createCell('num-static', p.cells.C)
        );
        this.crossGridContainer.appendChild(createCell('op', opSym(p.operators.op2)));
        this.crossGridContainer.appendChild(
            p.masked.D 
                ? createCell('num-input', this.stateGrid.userValues.D || '?', 'D')
                : createCell('num-static', p.cells.D)
        );
        this.crossGridContainer.appendChild(createCell('equals', '='));
        this.crossGridContainer.appendChild(createCell('target-res', p.targets.R2));

        // Row 4 (Vertical Equals)
        this.crossGridContainer.appendChild(createCell('equals', '='));
        this.crossGridContainer.appendChild(createCell('empty', ''));
        this.crossGridContainer.appendChild(createCell('equals', '='));
        this.crossGridContainer.appendChild(createCell('empty', ''));
        this.crossGridContainer.appendChild(createCell('empty', ''));

        // Row 5 (Column Targets)
        this.crossGridContainer.appendChild(createCell('target-res', p.targets.C1));
        this.crossGridContainer.appendChild(createCell('empty', ''));
        this.crossGridContainer.appendChild(createCell('target-res', p.targets.C2));
        this.crossGridContainer.appendChild(createCell('empty', ''));
        this.crossGridContainer.appendChild(createCell('empty', ''));

        this.renderGridNumpad();
    }

    renderGridNumpad() {
        const container = document.getElementById('grid-numpad-wrap');
        if (!container) return;
        container.innerHTML = '';

        const numpad = document.createElement('div');
        numpad.className = 'numpad-grid';

        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('button');
            btn.className = 'numpad-btn';
            btn.textContent = i;
            btn.addEventListener('click', () => this.handleGridNumInput(i.toString()));
            numpad.appendChild(btn);
        }

        const delBtn = document.createElement('button');
        delBtn.className = 'numpad-btn';
        delBtn.textContent = '⌫';
        delBtn.addEventListener('click', () => this.handleGridNumInput('DEL'));
        numpad.appendChild(delBtn);

        const zeroBtn = document.createElement('button');
        zeroBtn.className = 'numpad-btn';
        zeroBtn.textContent = '0';
        zeroBtn.addEventListener('click', () => this.handleGridNumInput('0'));
        numpad.appendChild(zeroBtn);

        const checkBtn = document.createElement('button');
        checkBtn.className = 'numpad-btn enter-btn';
        checkBtn.textContent = '✓ Cek';
        checkBtn.addEventListener('click', (e) => this.checkCrossGrid(e));
        numpad.appendChild(checkBtn);

        container.appendChild(numpad);
    }

    handleGridNumInput(key) {
        if (!this.stateGrid.activeCellId) return;
        window.soundCtrl.playClick();
        const active = this.stateGrid.activeCellId;

        if (key === 'DEL') {
            this.stateGrid.userValues[active] = '';
        } else {
            let current = this.stateGrid.userValues[active].toString();
            if (current.length < 2) {
                this.stateGrid.userValues[active] = current === '' ? key : current + key;
            }
        }
        this.renderCrossGrid();
    }

    checkCrossGrid(e) {
        const p = this.stateGrid.puzzle;
        const vals = {
            A: parseInt(this.stateGrid.userValues.A, 10),
            B: parseInt(this.stateGrid.userValues.B, 10),
            C: parseInt(this.stateGrid.userValues.C, 10),
            D: parseInt(this.stateGrid.userValues.D, 10)
        };

        if (isNaN(vals.A) || isNaN(vals.B) || isNaN(vals.C) || isNaN(vals.D)) {
            this.showToast('Isi semua kotak yang bertanda (?)!', '⚠️');
            return;
        }

        const calc = (x, op, y) => {
            if (op === '+') return x + y;
            if (op === '-') return x - y;
            if (op === '*') return x * y;
            return 0;
        };

        const r1Match = calc(vals.A, p.operators.op1, vals.B) === p.targets.R1;
        const r2Match = calc(vals.C, p.operators.op2, vals.D) === p.targets.R2;
        const c1Match = calc(vals.A, p.operators.op3, vals.C) === p.targets.C1;
        const c2Match = calc(vals.B, p.operators.op4, vals.D) === p.targets.C2;

        if (r1Match && r2Match && c1Match && c2Match) {
            const rect = e?.target?.getBoundingClientRect() || { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
            this.onPuzzleSuccess('crossGrid', 70, { x: rect.left + rect.width / 2, y: rect.top });
            setTimeout(() => this.startCrossGrid(), 1200);
        } else {
            this.onPuzzleFail(this.crossGridContainer);
        }
    }

    showHintGrid() {
        const p = this.stateGrid.puzzle;
        const active = this.stateGrid.activeCellId;
        const targetVal = p.cells[active];

        this.openHintModal(
            'Petunjuk Kisi Persamaan',
            `
                <p>💡 Kotak aktif <strong>[${active}]</strong> memiliki nilai: <strong style="color: var(--cyan); font-size: 20px;">${targetVal}</strong>.</p>
                <p style="font-size: 13px; color: var(--text-muted); margin-top: 8px;">Gunakan angka ini untuk menghitung kotak yang tersisa.</p>
            `
        );
    }

    // ==========================================
    // 3. VISUAL ALGEBRA CONTROLLER
    // ==========================================
    startVisualAlgebra() {
        const puzzle = window.puzzleEngine.generateVisualAlgebra();
        this.stateAlgebra.puzzle = puzzle;
        this.renderVisualAlgebra();
    }

    renderVisualAlgebra() {
        const p = this.stateAlgebra.puzzle;
        this.algebraEquations.innerHTML = '';
        this.algebraOptions.innerHTML = '';

        p.equations.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'equation-card';
            card.textContent = eq;
            this.algebraEquations.appendChild(card);
        });

        this.algebraQuestion.textContent = p.question;

        p.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', (e) => this.checkVisualAlgebra(opt, e));
            this.algebraOptions.appendChild(btn);
        });
    }

    checkVisualAlgebra(selected, e) {
        const p = this.stateAlgebra.puzzle;
        if (selected === p.answer) {
            const rect = e.target.getBoundingClientRect();
            this.onPuzzleSuccess('visualAlgebra', 50, { x: rect.left + rect.width / 2, y: rect.top });
            setTimeout(() => this.startVisualAlgebra(), 1200);
        } else {
            this.onPuzzleFail(this.algebraOptions);
        }
    }

    showHintAlgebra() {
        const p = this.stateAlgebra.puzzle;
        const steps = p.explanation.map(s => `<p style="margin: 6px 0;">${s}</p>`).join('');
        this.openHintModal('Pembahasan Aljabar Ikon', steps);
    }

    // ==========================================
    // 4. NUMBER SEQUENCE PATTERNS CONTROLLER
    // ==========================================
    startSequence() {
        const puzzle = window.puzzleEngine.generateSequencePattern();
        this.stateSequence.puzzle = puzzle;
        this.renderSequence();
    }

    renderSequence() {
        const p = this.stateSequence.puzzle;
        this.sequenceBubbles.innerHTML = '';
        this.sequenceOptions.innerHTML = '';

        p.sequence.forEach((val, idx) => {
            const bubble = document.createElement('div');
            bubble.className = 'seq-bubble';
            if (idx === p.missingIndex) {
                bubble.classList.add('missing');
                bubble.textContent = '?';
            } else {
                bubble.textContent = val;
            }
            this.sequenceBubbles.appendChild(bubble);
        });

        p.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', (e) => this.checkSequence(opt, e));
            this.sequenceOptions.appendChild(btn);
        });
    }

    checkSequence(selected, e) {
        const p = this.stateSequence.puzzle;
        if (selected === p.answer) {
            const rect = e.target.getBoundingClientRect();
            this.onPuzzleSuccess('sequence', 50, { x: rect.left + rect.width / 2, y: rect.top });
            setTimeout(() => this.startSequence(), 1200);
        } else {
            this.onPuzzleFail(this.sequenceOptions);
        }
    }

    showHintSequence() {
        const p = this.stateSequence.puzzle;
        this.openHintModal(
            'Petunjuk Pola Deret',
            `
                <p>💡 <strong>Aturan Pola:</strong></p>
                <p style="color: var(--cyan); font-size: 16px; margin: 10px 0;">${p.rule}</p>
            `
        );
    }

    // ==========================================
    // 5. TIME ATTACK CONTROLLER
    // ==========================================
    startTimeAttack() {
        if (this.taStartOverlay) this.taStartOverlay.style.display = 'none';

        this.stateTimeAttack.active = true;
        this.stateTimeAttack.score = 0;
        this.stateTimeAttack.combo = 0;
        this.stateTimeAttack.timeLeft = 45;
        this.stateTimeAttack.totalAnswered = 0;
        this.stateTimeAttack.correctCount = 0;

        this.updateTimeAttackHUD();
        this.nextTimeAttackQuestion();

        if (this.stateTimeAttack.timerInterval) clearInterval(this.stateTimeAttack.timerInterval);
        this.stateTimeAttack.timerInterval = setInterval(() => this.tickTimeAttack(), 1000);
    }

    tickTimeAttack() {
        if (!this.stateTimeAttack.active) return;
        this.stateTimeAttack.timeLeft--;
        this.updateTimeAttackHUD();

        const isUrgent = this.stateTimeAttack.timeLeft <= 10;
        window.soundCtrl.playTick(isUrgent);

        if (this.stateTimeAttack.timeLeft <= 0) {
            this.stopTimeAttack();
        }
    }

    updateTimeAttackHUD() {
        if (this.taTimer) {
            this.taTimer.textContent = `${this.stateTimeAttack.timeLeft}s`;
            this.taTimer.classList.toggle('urgent', this.stateTimeAttack.timeLeft <= 10);
        }
        if (this.taScore) this.taScore.textContent = this.stateTimeAttack.score;
        if (this.taCombo) this.taCombo.textContent = `x${Math.max(1, this.stateTimeAttack.combo)}`;
    }

    nextTimeAttackQuestion() {
        const tier = Math.min(3, Math.floor(this.stateTimeAttack.score / 200) + 1);
        const q = window.puzzleEngine.generateTimeAttack(tier);
        this.stateTimeAttack.currentQuestion = q;

        if (this.taQuestion) this.taQuestion.textContent = q.question;
        if (this.taOptions) {
            this.taOptions.innerHTML = '';
            q.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.textContent = opt;
                btn.addEventListener('click', (e) => this.answerTimeAttack(opt, e));
                this.taOptions.appendChild(btn);
            });
        }
    }

    answerTimeAttack(selected, e) {
        if (!this.stateTimeAttack.active) return;
        this.stateTimeAttack.totalAnswered++;

        const q = this.stateTimeAttack.currentQuestion;
        if (selected === q.answer) {
            this.stateTimeAttack.correctCount++;
            this.stateTimeAttack.combo++;

            // Multiplier score
            const multiplier = Math.min(5, 1 + Math.floor(this.stateTimeAttack.combo / 3));
            const points = 20 * multiplier;
            this.stateTimeAttack.score += points;

            // Bonus time +2s
            this.stateTimeAttack.timeLeft = Math.min(60, this.stateTimeAttack.timeLeft + 2);

            window.soundCtrl.playCorrect(this.stateTimeAttack.combo);
            if (window.particleEngine && e) {
                const rect = e.target.getBoundingClientRect();
                window.particleEngine.burstSparks(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
            }
        } else {
            this.stateTimeAttack.combo = 0;
            this.stateTimeAttack.timeLeft = Math.max(0, this.stateTimeAttack.timeLeft - 3); // -3s penalty
            window.soundCtrl.playWrong();
        }

        this.updateTimeAttackHUD();
        this.nextTimeAttackQuestion();
    }

    stopTimeAttack() {
        this.stateTimeAttack.active = false;
        if (this.stateTimeAttack.timerInterval) {
            clearInterval(this.stateTimeAttack.timerInterval);
            this.stateTimeAttack.timerInterval = null;
        }

        window.soundCtrl.playVictory();
        if (window.particleEngine) window.particleEngine.launchConfetti();

        const earnedXP = Math.floor(this.stateTimeAttack.score / 2);
        window.playerStorage.addXP(earnedXP);
        window.playerStorage.recordTimeAttackScore(this.stateTimeAttack.score, this.stateTimeAttack.combo);
        this.updatePlayerHUD();

        // Show Game Over / Score modal
        const finalScoreEl = document.getElementById('final-score');
        const finalAccuracyEl = document.getElementById('final-accuracy');
        const finalXpEl = document.getElementById('final-xp');

        const acc = this.stateTimeAttack.totalAnswered > 0
            ? Math.round((this.stateTimeAttack.correctCount / this.stateTimeAttack.totalAnswered) * 100)
            : 0;

        if (finalScoreEl) finalScoreEl.textContent = this.stateTimeAttack.score;
        if (finalAccuracyEl) finalAccuracyEl.textContent = `${acc}% (${this.stateTimeAttack.correctCount}/${this.stateTimeAttack.totalAnswered})`;
        if (finalXpEl) finalXpEl.textContent = `+${earnedXP} XP`;

        if (this.gameOverModal) this.gameOverModal.classList.add('active');
    }

    // ==========================================
    // MODALS & KEYBOARD HANDLERS
    // ==========================================
    openAchievementsModal() {
        const list = document.getElementById('achievements-list');
        if (!list) return;
        list.innerHTML = '';

        const defs = window.playerStorage.getAchievementDefs();
        const unlocked = window.playerStorage.data.achievements;

        defs.forEach(def => {
            const isUnlocked = !!unlocked[def.id];
            const item = document.createElement('div');
            item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
            item.innerHTML = `
                <div class="achievement-icon">${def.icon}</div>
                <div class="achievement-details">
                    <div class="achievement-title">${def.title} ${isUnlocked ? '✓' : ''}</div>
                    <div class="achievement-desc">${def.desc}</div>
                </div>
                <div class="achievement-xp">+${def.xp} XP</div>
            `;
            list.appendChild(item);
        });

        if (this.achievementsModal) this.achievementsModal.classList.add('active');
    }

    openHintModal(title, htmlContent) {
        window.soundCtrl.playClick();
        if (this.hintTitle) this.hintTitle.textContent = title;
        if (this.hintContent) this.hintContent.innerHTML = htmlContent;
        if (this.hintModal) this.hintModal.classList.add('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    handleKeyboardInput(e) {
        const key = e.key;

        if (key === 'Escape') {
            this.closeAllModals();
            return;
        }

        if (this.currentMode === 'make24') {
            if (['+', '-', '*', '/'].includes(key)) {
                this.addOperator24(key);
            } else if (key === '(' || key === ')') {
                this.addOperator24(key);
            } else if (key === 'Backspace') {
                this.backspaceFormula24();
            } else if (key === 'Enter') {
                this.submitFormula24(e);
            } else if (/[1-9]/.test(key)) {
                const targetNum = parseInt(key, 10);
                const foundIdx = this.state24.currentPuzzle.numbers.findIndex((n, idx) => n === targetNum && !this.state24.usedCardIndices.has(idx));
                if (foundIdx !== -1) {
                    this.addNumber24(targetNum, foundIdx);
                }
            }
        } else if (this.currentMode === 'crossGrid') {
            if (/[0-9]/.test(key)) {
                this.handleGridNumInput(key);
            } else if (key === 'Backspace') {
                this.handleGridNumInput('DEL');
            } else if (key === 'Enter') {
                this.checkCrossGrid(e);
            }
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new MathGameApp();
});
