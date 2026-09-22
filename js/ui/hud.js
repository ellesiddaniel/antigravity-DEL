/**
 * Heads-Up Display (HUD) Controller for Brain Runner 3D
 */
class GameHUD {
    constructor() {
        this.scoreEl = document.getElementById('hud-score');
        this.distanceEl = document.getElementById('hud-distance');
        this.speedEl = document.getElementById('hud-speed');
        this.streakEl = document.getElementById('hud-streak');
        this.multiplierEl = document.getElementById('hud-multiplier');
        this.livesContainer = document.getElementById('hud-lives');
        this.slowMoBar = document.getElementById('slowmo-fill');
        this.feedbackPopup = document.getElementById('hud-feedback');
        this.questionCard = document.getElementById('hud-question-card');
        this.questionText = document.getElementById('hud-q-text');
        this.questionCategory = document.getElementById('hud-q-cat');
        this.questionTimer = document.getElementById('hud-q-timer');
        this.questionProgressFill = document.getElementById('hud-q-progress-fill');
        this.optionA = document.getElementById('hud-opt-a');
        this.optionB = document.getElementById('hud-opt-b');
        this.optionC = document.getElementById('hud-opt-c');

        this.displayedScore = 0;
        this.lastPlayedQuestionSound = null;
    }

    update(player) {
        if (!player) return;

        // Smooth score increment
        if (this.displayedScore < player.score) {
            this.displayedScore += Math.ceil((player.score - this.displayedScore) * 0.15);
        } else {
            this.displayedScore = player.score;
        }
        if (this.scoreEl) this.scoreEl.innerText = this.displayedScore.toLocaleString();

        // Distance & Speed
        if (this.distanceEl) this.distanceEl.innerText = `${player.distance}m`;
        const kmh = Math.floor(player.speed * 2.8 * player.speedMultiplier);
        if (this.speedEl) this.speedEl.innerText = `${kmh} km/h`;

        // Multiplier & Streak
        if (this.streakEl) {
            this.streakEl.innerText = `Streak: ${player.streak}🔥`;
            this.streakEl.className = player.streak >= 5 ? 'streak-fire' : '';
        }
        if (this.multiplierEl) {
            this.multiplierEl.innerText = `x${player.multiplier}`;
            this.multiplierEl.style.color = player.multiplier > 1 ? '#00ff88' : '#ffffff';
        }

        // Lives / Hearts
        if (this.livesContainer) {
            let heartsHtml = '';
            for (let i = 0; i < player.maxLives; i++) {
                if (i < player.lives) {
                    heartsHtml += '<span class="heart active">❤️</span>';
                } else {
                    heartsHtml += '<span class="heart lost">🖤</span>';
                }
            }
            this.livesContainer.innerHTML = heartsHtml;
        }

        // Slow-Mo Energy Bar
        if (this.slowMoBar) {
            this.slowMoBar.style.width = `${player.slowMoEnergy}%`;
            this.slowMoBar.style.backgroundColor = player.isSlowMo ? '#ff0077' : '#00f3ff';
        }

        // Active Question Card preview with Live Countdown
        const currentQ = window.quizEngine.activeQuestion;
        if (currentQ && currentQ.gateZ !== undefined && this.questionCard) {
            const playerZ = player.mesh.position.z;
            const remainingDist = Math.max(0, (playerZ - currentQ.gateZ));

            // If player has reached the gate or is past it
            if (remainingDist <= 0 || playerZ < currentQ.gateZ - 5) {
                this.questionCard.style.display = 'none';
            } else {
                this.questionCard.style.display = 'block';

                if (this.questionText) this.questionText.innerText = currentQ.question;
                if (this.questionCategory) this.questionCategory.innerText = `⚡ SOAL KUIS: ${currentQ.category.toUpperCase()}`;

                const currentSpeed = player.speed * player.speedMultiplier;
                const remainingSeconds = currentSpeed > 0 ? (remainingDist / currentSpeed).toFixed(1) : "0.0";
                
                if (this.questionTimer) {
                    this.questionTimer.innerText = `⏳ ${remainingSeconds}s (${Math.round(remainingDist)}m)`;
                    if (parseFloat(remainingSeconds) < 2.0) {
                        this.questionTimer.style.color = '#ff0077';
                        this.questionTimer.style.borderColor = '#ff0077';
                    } else {
                        this.questionTimer.style.color = '#00f3ff';
                        this.questionTimer.style.borderColor = 'rgba(0, 243, 255, 0.4)';
                    }
                }

                // Progress fill bar (0% at gate, 100% at spawn)
                const totalSpan = 110;
                const progressPct = Math.min(100, Math.max(0, (remainingDist / totalSpan) * 100));
                if (this.questionProgressFill) {
                    this.questionProgressFill.style.width = `${progressPct}%`;
                }

                if (this.optionA) this.optionA.innerHTML = `<span class="opt-tag">Jalur A</span> <span class="opt-text">${currentQ.options[0]}</span>`;
                if (this.optionB) this.optionB.innerHTML = `<span class="opt-tag">Jalur B</span> <span class="opt-text">${currentQ.options[1]}</span>`;
                if (this.optionC) this.optionC.innerHTML = `<span class="opt-tag">Jalur C</span> <span class="opt-text">${currentQ.options[2]}</span>`;
            }
        }
    }

    showFeedback(text, isPositive = true) {
        if (!this.feedbackPopup) return;
        this.feedbackPopup.innerText = text;
        this.feedbackPopup.className = `feedback-popup ${isPositive ? 'positive' : 'negative'} show`;

        setTimeout(() => {
            if (this.feedbackPopup) {
                this.feedbackPopup.className = 'feedback-popup';
            }
        }, 1500);
    }

    hideQuestionCard() {
        if (this.questionCard) this.questionCard.style.display = 'none';
    }
}

window.GameHUD = GameHUD;
