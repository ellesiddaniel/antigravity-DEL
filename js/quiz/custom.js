/**
 * Custom Quiz Manager
 * Allows players and teachers to create custom sets, save to localStorage, import/export JSON
 */
class CustomQuizManager {
    constructor() {
        this.storageKey = 'brain_runner_custom_quizzes';
        this.quizzes = this.loadQuizzes();
    }

    loadQuizzes() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load custom quizzes", e);
        }
        return [
            {
                id: "sample_math",
                name: "Contoh Soal Cepat",
                description: "Paket kuis matematika & logika buatan sendiri",
                questions: [
                    { q: "Berapakah 25 x 4?", options: ["100", "90", "110"], correct: 0 },
                    { q: "Ibukota Jawa Barat adalah...", options: ["Bandung", "Surabaya", "Semarang"], correct: 0 },
                    { q: "Hewan tercepat di darat adalah...", options: ["Cheetah", "Singa", "Kuda"], correct: 0 },
                    { q: "Hasil dari 100 - 37 adalah...", options: ["63", "67", "53"], correct: 0 }
                ]
            }
        ];
    }

    saveQuizzes() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.quizzes));
        } catch (e) {
            console.error("Failed to save custom quizzes", e);
        }
    }

    getAllQuizzes() {
        return this.quizzes;
    }

    getQuiz(id) {
        return this.quizzes.find(q => q.id === id);
    }

    saveQuiz(quiz) {
        const existingIdx = this.quizzes.findIndex(q => q.id === quiz.id);
        if (existingIdx >= 0) {
            this.quizzes[existingIdx] = quiz;
        } else {
            if (!quiz.id) quiz.id = 'quiz_' + Date.now();
            this.quizzes.push(quiz);
        }
        this.saveQuizzes();
        return quiz;
    }

    deleteQuiz(id) {
        this.quizzes = this.quizzes.filter(q => q.id !== id);
        this.saveQuizzes();
    }

    exportJSON(id) {
        const quiz = this.getQuiz(id);
        if (!quiz) return null;
        return JSON.stringify(quiz, null, 2);
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.name && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                parsed.id = 'quiz_' + Date.now();
                this.quizzes.push(parsed);
                this.saveQuizzes();
                return { success: true, quiz: parsed };
            }
            return { success: false, error: "Format JSON tidak valid (harus memiliki name dan questions)." };
        } catch (e) {
            return { success: false, error: "Gagal memproses JSON: " + e.message };
        }
    }
}

window.customQuizManager = new CustomQuizManager();
