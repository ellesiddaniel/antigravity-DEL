/**
 * Brain Runner 3D: Cyber Quiz Parkour
 * Master Game Loop & Input Controller
 */
class BrainRunnerGame {
    constructor() {
        this.gameScene = null;
        this.player = null;
        this.gateManager = null;
        this.trackManager = null;
        this.hud = null;
        this.menuManager = null;

        this.isPlaying = false;
        this.isPaused = false;
        this.lastTime = 0;

        this.gameMode = 'endless'; // 'endless', 'stages', 'time_attack'
        this.currentStage = 1;
        this.stageQuestionsTarget = 10;
        this.stageQuestionsAnswered = 0;

        // Statistics
        this.stats = {
            totalQuestions: 0,
            correctCount: 0,
            score: 0,
            distance: 0,
            maxStreak: 0
        };

        this.init();
    }

    init() {
        // 1. Initialize Subsystems
        this.gameScene = new GameScene('game-canvas-container');
        this.player = new CyberPlayer(this.gameScene.scene);
        this.gateManager = new QuizGateManager(this.gameScene.scene);
        this.trackManager = new TrackManager(this.gameScene.scene, this.gateManager);
        this.hud = new GameHUD();
        this.menuManager = new MenuManager(this);
        window.menuManager = this.menuManager;

        // 2. Setup Input Handlers
        this.setupKeyboardControls();
        this.setupTouchAndMobileControls();

        // 3. Start Animation Loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));

        // 4. Initial Track Spawn
        this.trackManager.createInitialTrack();
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

            if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
                if (this.isPlaying) this.togglePause();
                return;
            }

            if (!this.isPlaying || this.isPaused || this.player.isDead) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.player.moveLane(-1);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.player.moveLane(1);
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                case ' ':
                    e.preventDefault();
                    this.player.jump();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                case 'Shift':
                    e.preventDefault();
                    this.player.slide();
                    break;
                case 'e':
                case 'E':
                    this.player.toggleSlowMo();
                    break;
            }
        });
    }

    setupTouchAndMobileControls() {
        // Virtual Buttons
        document.getElementById('btn-mobile-left')?.addEventListener('click', () => {
            if (this.isPlaying && !this.isPaused) this.player.moveLane(-1);
        });
        document.getElementById('btn-mobile-right')?.addEventListener('click', () => {
            if (this.isPlaying && !this.isPaused) this.player.moveLane(1);
        });
        document.getElementById('btn-mobile-jump')?.addEventListener('click', () => {
            if (this.isPlaying && !this.isPaused) this.player.jump();
        });
        document.getElementById('btn-mobile-slide')?.addEventListener('click', () => {
            if (this.isPlaying && !this.isPaused) this.player.slide();
        });
        document.getElementById('btn-mobile-slowmo')?.addEventListener('click', () => {
            if (this.isPlaying && !this.isPaused) this.player.toggleSlowMo();
        });

        // Swipe Gestures on Screen
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;

        window.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            if (!this.isPlaying || this.isPaused || this.player.isDead) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            const elapsed = Date.now() - touchStartTime;

            if (elapsed > 500) return; // ignore long hold

            const minSwipe = 35;
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipe) {
                // Horizontal Swipe
                if (diffX < 0) this.player.moveLane(-1);
                else this.player.moveLane(1);
            } else if (Math.abs(diffY) > minSwipe) {
                // Vertical Swipe
                if (diffY < 0) this.player.jump();
                else this.player.slide();
            }
        }, { passive: true });
    }

    startNewGame(options = {}) {
        const category = options.category || 'mixed_id';
        const difficulty = options.difficulty || 'medium';
        this.gameMode = options.mode || 'endless';
        this.selectedDifficulty = difficulty;

        window.quizEngine.setCategory(category);
        window.quizEngine.setDifficulty(difficulty);

        this.currentStage = 1;
        this.stageQuestionsAnswered = 0;
        this.stats = {
            totalQuestions: 0,
            correctCount: 0,
            score: 0,
            distance: 0,
            maxStreak: 0
        };

        this.restart();
    }

    restart() {
        this.player.reset();
        if (this.selectedDifficulty) {
            this.player.setDifficulty(this.selectedDifficulty);
        }
        this.trackManager.clear();
        this.gateManager.clear();
        this.trackManager.createInitialTrack();

        this.isPlaying = true;
        this.isPaused = false;
        this.menuManager.showHUD();

        // Start Synthwave Music
        window.soundEngine.startMusic(126);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.menuManager.showPauseMenu();
        } else {
            this.menuManager.hidePauseMenu();
        }
    }

    handleQuizAnswer(isCorrect, quizData) {
        this.stats.totalQuestions++;
        if (isCorrect) {
            this.stats.correctCount++;
            this.hud.showFeedback(`⚡ BENAR! +${1000 * this.player.multiplier} PTS ⚡`, true);
            this.gameScene.triggerScreenShake(0.2);

            // Check stage progression
            if (this.gameMode === 'stages') {
                this.stageQuestionsAnswered++;
                if (this.stageQuestionsAnswered >= this.stageQuestionsTarget) {
                    this.onStageVictory();
                }
            }
        } else {
            this.hud.showFeedback(`❌ SALAH! Jawaban: ${quizData.correctText}`, false);
            this.gameScene.triggerScreenShake(0.6);
        }

        if (this.player.streak > this.stats.maxStreak) {
            this.stats.maxStreak = this.player.streak;
        }
    }

    onStageVictory() {
        this.isPlaying = false;
        window.soundEngine.stopMusic();
        window.soundEngine.playCorrect();

        this.stats.score = this.player.score;
        this.stats.distance = this.player.distance;
        this.menuManager.showVictory(this.stats);
    }

    onGameOver() {
        this.isPlaying = false;
        window.soundEngine.stopMusic();

        this.stats.score = this.player.score;
        this.stats.distance = this.player.distance;
        this.menuManager.showGameOver(this.stats);
    }

    loop(currentTime) {
        requestAnimationFrame((t) => this.loop(t));

        const delta = Math.min(0.08, (currentTime - this.lastTime) / 1000);
        this.lastTime = currentTime;

        if (this.isPlaying && !this.isPaused) {
            // Update player
            this.player.update(delta);

            // Update procedural tracks & items
            this.trackManager.update(this.player, delta);

            // Check quiz gate collisions
            this.gateManager.checkCollisions(
                this.player,
                (qData) => this.handleQuizAnswer(true, qData),
                (qData) => this.handleQuizAnswer(false, qData)
            );

            this.gateManager.update(delta);

            // Update Dynamic Camera & FOV
            this.gameScene.setSpeedFOV(this.player.speedMultiplier * (this.player.speed / this.player.baseSpeed));
            this.gameScene.updateCamera(this.player, delta);

            // Update HUD
            this.hud.update(this.player);

            // Check Game Over
            if (this.player.isDead && this.isPlaying) {
                setTimeout(() => {
                    this.onGameOver();
                }, 1200);
                this.isPlaying = false;
            }
        }

        // Always render 3D Scene
        this.gameScene.render();
    }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
    window.game = new BrainRunnerGame();
});
