/**
 * Menu Manager & Modal Controllers
 * Handles Start Screen, Pause, Game Over, Custom Quiz Editor & Character Customizer
 */
class MenuManager {
    constructor(game) {
        this.game = game;

        // Menu Containers
        this.startMenu = document.getElementById('menu-start');
        this.pauseMenu = document.getElementById('menu-pause');
        this.gameOverMenu = document.getElementById('menu-gameover');
        this.victoryMenu = document.getElementById('menu-victory');
        this.customQuizModal = document.getElementById('modal-custom-quiz');
        this.settingsModal = document.getElementById('modal-settings');
        this.hudContainer = document.getElementById('hud-container');

        // Form & Select elements
        this.categorySelect = document.getElementById('select-category');
        this.difficultySelect = document.getElementById('select-difficulty');
        this.modeSelect = document.getElementById('select-mode');

        this.initListeners();
        this.populateCustomQuizzesInDropdown();
    }

    initListeners() {
        // Start Game button
        document.getElementById('btn-start-game')?.addEventListener('click', () => {
            const cat = this.categorySelect ? this.categorySelect.value : 'mixed_id';
            const diff = this.difficultySelect ? this.difficultySelect.value : 'medium';
            const mode = this.modeSelect ? this.modeSelect.value : 'endless';

            this.game.startNewGame({
                category: cat,
                difficulty: diff,
                mode: mode
            });
        });

        // Restart buttons
        document.getElementById('btn-restart')?.addEventListener('click', () => {
            this.game.restart();
        });
        document.getElementById('btn-victory-restart')?.addEventListener('click', () => {
            this.game.restart();
        });

        // Resume button
        document.getElementById('btn-resume')?.addEventListener('click', () => {
            this.game.togglePause();
        });

        // Main Menu buttons
        document.querySelectorAll('.btn-to-main-menu').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showStartMenu();
            });
        });

        // Custom Quiz Editor Buttons
        document.getElementById('btn-open-custom-quiz')?.addEventListener('click', () => {
            this.openCustomQuizModal();
        });
        document.getElementById('btn-close-custom-quiz')?.addEventListener('click', () => {
            this.closeCustomQuizModal();
        });

        // Visor Color Picker
        document.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
                dot.classList.add('selected');
                const hex = parseInt(dot.dataset.color, 16);
                if (this.game.player) {
                    this.game.player.setThemeColor(hex);
                }
            });
        });

        // Custom Quiz Add Question logic
        document.getElementById('btn-add-custom-question')?.addEventListener('click', () => {
            this.addQuestionField();
        });

        document.getElementById('btn-save-custom-quiz')?.addEventListener('click', () => {
            this.saveCustomQuizFromForm();
        });

        document.getElementById('btn-import-quiz-json')?.addEventListener('click', () => {
            const jsonText = prompt("Paste format JSON Kuis di sini:");
            if (jsonText) {
                const res = window.customQuizManager.importJSON(jsonText);
                if (res.success) {
                    alert(`Kuis "${res.quiz.name}" berhasil diimpor!`);
                    this.populateCustomQuizzesInDropdown();
                    this.renderCustomQuizList();
                } else {
                    alert(res.error);
                }
            }
        });

        // Audio Sliders
        document.getElementById('slider-music')?.addEventListener('input', (e) => {
            window.soundEngine.setMusicVolume(parseFloat(e.target.value));
        });
        document.getElementById('slider-sfx')?.addEventListener('input', (e) => {
            window.soundEngine.setSfxVolume(parseFloat(e.target.value));
        });

        // Camera Mode Toggle
        document.getElementById('select-cam-mode')?.addEventListener('change', (e) => {
            if (this.game.gameScene) {
                this.game.gameScene.setCameraMode(e.target.value);
            }
        });
    }

    showStartMenu() {
        this.hideAll();
        if (this.startMenu) this.startMenu.style.display = 'flex';
        if (this.hudContainer) this.hudContainer.style.display = 'none';
        this.game.isPlaying = false;
        window.soundEngine.stopMusic();
    }

    showHUD() {
        this.hideAll();
        if (this.hudContainer) this.hudContainer.style.display = 'block';
    }

    showPauseMenu() {
        if (this.pauseMenu) this.pauseMenu.style.display = 'flex';
    }

    hidePauseMenu() {
        if (this.pauseMenu) this.pauseMenu.style.display = 'none';
    }

    showGameOver(stats) {
        this.hideAll();
        if (this.gameOverMenu) {
            this.gameOverMenu.style.display = 'flex';
            document.getElementById('go-final-score').innerText = stats.score.toLocaleString();
            document.getElementById('go-distance').innerText = `${stats.distance} m`;
            document.getElementById('go-correct').innerText = `${stats.correctCount} / ${stats.totalQuestions}`;
            const acc = stats.totalQuestions > 0 ? Math.round((stats.correctCount / stats.totalQuestions) * 100) : 0;
            document.getElementById('go-accuracy').innerText = `${acc}%`;

            // Check high score
            const highScoreKey = 'brain_runner_highscore';
            const prevHigh = parseInt(localStorage.getItem(highScoreKey) || '0');
            if (stats.score > prevHigh) {
                localStorage.setItem(highScoreKey, stats.score.toString());
                document.getElementById('go-highscore-tag').innerText = "🏆 REKOR BARU TERCIPTA!";
            } else {
                document.getElementById('go-highscore-tag').innerText = `Skor Tertinggi: ${prevHigh.toLocaleString()}`;
            }
        }
    }

    showVictory(stats) {
        this.hideAll();
        if (this.victoryMenu) {
            this.victoryMenu.style.display = 'flex';
            document.getElementById('vic-final-score').innerText = stats.score.toLocaleString();
            document.getElementById('vic-distance').innerText = `${stats.distance} m`;
            document.getElementById('vic-accuracy').innerText = `${Math.round((stats.correctCount / stats.totalQuestions) * 100)}%`;
        }
    }

    hideAll() {
        if (this.startMenu) this.startMenu.style.display = 'none';
        if (this.pauseMenu) this.pauseMenu.style.display = 'none';
        if (this.gameOverMenu) this.gameOverMenu.style.display = 'none';
        if (this.victoryMenu) this.victoryMenu.style.display = 'none';
        if (this.customQuizModal) this.customQuizModal.style.display = 'none';
    }

    // --- Custom Quiz Modal Helpers ---

    populateCustomQuizzesInDropdown() {
        if (!this.categorySelect) return;

        // Keep standard options
        const standardOptions = Array.from(this.categorySelect.options).filter(opt => !opt.value.startsWith('custom_'));
        this.categorySelect.innerHTML = '';
        standardOptions.forEach(opt => this.categorySelect.appendChild(opt));

        // Append custom quizzes
        const customQuizzes = window.customQuizManager.getAllQuizzes();
        if (customQuizzes.length > 0) {
            const group = document.createElement('optgroup');
            group.label = '⭐ KUIS BUATAN SENDIRI';
            customQuizzes.forEach(cq => {
                const opt = document.createElement('option');
                opt.value = `custom_${cq.id}`;
                opt.innerText = `✏️ ${cq.name} (${cq.questions.length} soal)`;
                group.appendChild(opt);
            });
            this.categorySelect.appendChild(group);
        }
    }

    openCustomQuizModal() {
        if (this.customQuizModal) this.customQuizModal.style.display = 'flex';
        this.renderCustomQuizList();
    }

    closeCustomQuizModal() {
        if (this.customQuizModal) this.customQuizModal.style.display = 'none';
        this.populateCustomQuizzesInDropdown();
    }

    renderCustomQuizList() {
        const listContainer = document.getElementById('custom-quiz-list');
        if (!listContainer) return;

        const quizzes = window.customQuizManager.getAllQuizzes();
        if (quizzes.length === 0) {
            listContainer.innerHTML = '<p class="empty-hint">Belum ada kuis buatan sendiri. Buat sekarang!</p>';
            return;
        }

        let html = '';
        quizzes.forEach(q => {
            html += `
                <div class="custom-quiz-card">
                    <div class="quiz-info">
                        <h4>${q.name}</h4>
                        <p>${q.questions.length} Soal | ${q.description || ''}</p>
                    </div>
                    <div class="quiz-actions">
                        <button class="btn-sm btn-export" onclick="window.menuManager.exportQuiz('${q.id}')">Export JSON</button>
                        <button class="btn-sm btn-delete" onclick="window.menuManager.deleteQuiz('${q.id}')">Hapus</button>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;
    }

    exportQuiz(id) {
        const json = window.customQuizManager.exportJSON(id);
        if (json) {
            navigator.clipboard.writeText(json).then(() => {
                alert("Data JSON kuis berhasil disalin ke Clipboard!");
            }).catch(() => {
                prompt("Salin kode JSON berikut:", json);
            });
        }
    }

    deleteQuiz(id) {
        if (confirm("Yakin ingin menghapus kuis ini?")) {
            window.customQuizManager.deleteQuiz(id);
            this.renderCustomQuizList();
            this.populateCustomQuizzesInDropdown();
        }
    }

    addQuestionField() {
        const container = document.getElementById('custom-questions-builder');
        if (!container) return;

        const count = container.children.length + 1;
        const qBlock = document.createElement('div');
        qBlock.className = 'custom-q-row';
        qBlock.innerHTML = `
            <div class="q-row-header">
                <strong>Soal #${count}</strong>
                <button type="button" class="btn-remove-q" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
            <input type="text" class="cq-input-text" placeholder="Tuliskan pertanyaan... (Contoh: Berapakah 25 x 4?)" required>
            <div class="cq-options-grid">
                <div>
                    <label>Pilihan A (Benar):</label>
                    <input type="text" class="cq-opt-correct" placeholder="Jawaban Benar" required>
                </div>
                <div>
                    <label>Pilihan B (Salah):</label>
                    <input type="text" class="cq-opt-wrong1" placeholder="Pilihan Salah 1" required>
                </div>
                <div>
                    <label>Pilihan C (Salah):</label>
                    <input type="text" class="cq-opt-wrong2" placeholder="Pilihan Salah 2" required>
                </div>
            </div>
        `;
        container.appendChild(qBlock);
    }

    saveCustomQuizFromForm() {
        const titleInput = document.getElementById('cq-title');
        const descInput = document.getElementById('cq-desc');
        const container = document.getElementById('custom-questions-builder');

        const title = titleInput ? titleInput.value.trim() : '';
        if (!title) {
            alert("Harap masukkan Nama Kuis!");
            return;
        }

        const rows = container.querySelectorAll('.custom-q-row');
        if (rows.length === 0) {
            alert("Harap tambahkan minimal 1 soal!");
            return;
        }

        const questions = [];
        for (let row of rows) {
            const qText = row.querySelector('.cq-input-text')?.value.trim();
            const correctOpt = row.querySelector('.cq-opt-correct')?.value.trim();
            const wrong1 = row.querySelector('.cq-opt-wrong1')?.value.trim();
            const wrong2 = row.querySelector('.cq-opt-wrong2')?.value.trim();

            if (!qText || !correctOpt || !wrong1 || !wrong2) {
                alert("Semua kolom pertanyaan dan 3 pilihan jawaban harus diisi!");
                return;
            }

            questions.push({
                q: qText,
                options: [correctOpt, wrong1, wrong2],
                correct: 0
            });
        }

        const newQuiz = {
            id: 'quiz_' + Date.now(),
            name: title,
            description: descInput ? descInput.value.trim() : '',
            questions: questions
        };

        window.customQuizManager.saveQuiz(newQuiz);
        alert(`Kuis "${title}" dengan ${questions.length} soal berhasil disimpan!`);

        // Reset form
        titleInput.value = '';
        if (descInput) descInput.value = '';
        container.innerHTML = '';
        this.addQuestionField();

        this.renderCustomQuizList();
        this.populateCustomQuizzesInDropdown();
    }
}

window.MenuManager = MenuManager;
