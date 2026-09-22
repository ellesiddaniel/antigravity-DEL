/**
 * Dynamic Question Generator & Quiz Manager
 * Supplies seamless questions with randomized lane distribution
 */
class QuizEngine {
    constructor() {
        this.currentCategory = 'mixed_id';
        this.currentDifficulty = 'medium';
        this.activeQuestion = null;
        this.questionHistory = [];
        this.usedIndices = new Set();
    }

    setCategory(cat) {
        this.currentCategory = cat;
        this.usedIndices.clear();
    }

    setDifficulty(diff) {
        this.currentDifficulty = diff;
    }

    getNextQuestion() {
        let rawQ = null;

        // Check for custom quiz questions first
        if (this.currentCategory.startsWith('custom_')) {
            const customQuiz = window.customQuizManager.getQuiz(this.currentCategory.replace('custom_', ''));
            if (customQuiz && customQuiz.questions && customQuiz.questions.length > 0) {
                const idx = Math.floor(Math.random() * customQuiz.questions.length);
                rawQ = JSON.parse(JSON.stringify(customQuiz.questions[idx]));
            }
        }

        // If math generator mode
        if (!rawQ && (this.currentCategory === 'math_dynamic' || Math.random() < 0.4 && this.currentCategory.includes('math'))) {
            rawQ = this.generateDynamicMathQuestion(this.currentDifficulty);
        }

        // Pull from QUESTION_BANK
        if (!rawQ) {
            let pool = [];
            if (this.currentCategory === 'mixed_id') {
                pool = [
                    ...QUESTION_BANK.math_id,
                    ...QUESTION_BANK.science_id,
                    ...QUESTION_BANK.general_id,
                    ...QUESTION_BANK.english_id,
                    ...QUESTION_BANK.logic_id
                ];
            } else if (this.currentCategory === 'mixed_en') {
                pool = [
                    ...QUESTION_BANK.math_en,
                    ...QUESTION_BANK.science_en
                ];
            } else if (QUESTION_BANK[this.currentCategory]) {
                pool = QUESTION_BANK[this.currentCategory];
            } else {
                pool = QUESTION_BANK.math_id;
            }

            // Filter by difficulty if available
            const filtered = pool.filter(item => !item.diff || item.diff === this.currentDifficulty || this.currentDifficulty === 'all');
            const targetPool = filtered.length > 0 ? filtered : pool;

            const randomIndex = Math.floor(Math.random() * targetPool.length);
            rawQ = JSON.parse(JSON.stringify(targetPool[randomIndex]));
        }

        // Shuffle options and assign correct lane (0 = Left, 1 = Center, 2 = Right)
        const correctText = rawQ.options[rawQ.correct || 0];
        const shuffled = this.shuffleArray([...rawQ.options]);
        const correctLane = shuffled.indexOf(correctText);

        this.activeQuestion = {
            question: rawQ.q,
            options: shuffled,
            correctLane: correctLane,
            correctText: correctText,
            category: this.currentCategory
        };

        return this.activeQuestion;
    }

    generateDynamicMathQuestion(diff) {
        let a, b, op, ans, questionText;
        const ops = ['+', '-', 'x'];

        if (diff === 'easy') {
            op = ops[Math.floor(Math.random() * ops.length)];
            if (op === '+') {
                a = Math.floor(Math.random() * 50) + 10;
                b = Math.floor(Math.random() * 50) + 10;
                ans = a + b;
            } else if (op === '-') {
                a = Math.floor(Math.random() * 60) + 30;
                b = Math.floor(Math.random() * 25) + 5;
                ans = a - b;
            } else {
                a = Math.floor(Math.random() * 12) + 2;
                b = Math.floor(Math.random() * 10) + 2;
                ans = a * b;
            }
            questionText = `Berapakah ${a} ${op} ${b}?`;
        } else if (diff === 'hard' || diff === 'insane') {
            const hardType = Math.floor(Math.random() * 4);
            if (hardType === 0) { // Square root
                const root = Math.floor(Math.random() * 15) + 11;
                const sq = root * root;
                const bonus = Math.floor(Math.random() * 20) + 5;
                ans = root + bonus;
                questionText = `Berapakah √${sq} + ${bonus}?`;
            } else if (hardType === 1) { // Power
                const base = Math.floor(Math.random() * 4) + 2;
                const exp = Math.floor(Math.random() * 3) + 3;
                ans = Math.pow(base, exp);
                questionText = `Berapakah ${base}^${exp}?`;
            } else if (hardType === 2) { // Percentage
                const pct = [15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 6)];
                const val = (Math.floor(Math.random() * 10) + 2) * 100;
                ans = (pct / 100) * val;
                questionText = `Berapakah ${pct}% dari ${val}?`;
            } else { // Mixed operations
                a = Math.floor(Math.random() * 15) + 5;
                b = Math.floor(Math.random() * 8) + 3;
                const c = Math.floor(Math.random() * 30) + 10;
                ans = (a * b) - c;
                questionText = `Berapakah (${a} x ${b}) - ${c}?`;
            }
        } else { // medium
            const medType = Math.floor(Math.random() * 3);
            if (medType === 0) {
                a = Math.floor(Math.random() * 20) + 11;
                b = Math.floor(Math.random() * 12) + 4;
                ans = a * b;
                questionText = `Berapakah ${a} x ${b}?`;
            } else if (medType === 1) {
                ans = Math.floor(Math.random() * 20) + 5;
                b = Math.floor(Math.random() * 8) + 3;
                a = ans * b;
                questionText = `Berapakah ${a} : ${b}?`;
            } else {
                a = Math.floor(Math.random() * 40) + 20;
                b = Math.floor(Math.random() * 30) + 15;
                const c = Math.floor(Math.random() * 20) + 5;
                ans = a + b - c;
                questionText = `Berapakah ${a} + ${b} - ${c}?`;
            }
        }

        // Generate clever distractors (close to the answer)
        const distractors = new Set();
        while (distractors.size < 2) {
            const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() < 0.5 ? -1 : 1);
            const fake = ans + offset;
            if (fake !== ans && fake >= 0) {
                distractors.add(fake.toString());
            }
        }

        const options = [ans.toString(), ...Array.from(distractors)];

        return {
            q: questionText,
            options: options,
            correct: 0,
            diff: diff
        };
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

window.quizEngine = new QuizEngine();
