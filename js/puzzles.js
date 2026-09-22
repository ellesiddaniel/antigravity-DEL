/**
 * Puzzle Engine - Generator & Solver algorithms for all math puzzle modes
 */
class PuzzleEngine {
    constructor() {
        this.operators = ['+', '-', '*', '/'];
    }

    // ==========================================
    // 1. MAKE 24 PUZZLE GENERATOR & SOLVER
    // ==========================================
    solve24(numbers) {
        const results = [];
        const EPSILON = 1e-6;

        // Recursive solver with expression tree building
        function solve(list) {
            if (list.length === 1) {
                if (Math.abs(list[0].val - 24) < EPSILON) {
                    results.push(list[0].expr);
                }
                return;
            }

            for (let i = 0; i < list.length; i++) {
                for (let j = 0; j < list.length; j++) {
                    if (i === j) continue;

                    const nextRemaining = [];
                    for (let k = 0; k < list.length; k++) {
                        if (k !== i && k !== j) nextRemaining.push(list[k]);
                    }

                    const a = list[i];
                    const b = list[j];

                    // Addition (a + b) - skip symmetric duplicates
                    if (i < j) {
                        solve([...nextRemaining, { val: a.val + b.val, expr: `(${a.expr} + ${b.expr})` }]);
                    }

                    // Subtraction (a - b)
                    solve([...nextRemaining, { val: a.val - b.val, expr: `(${a.expr} - ${b.expr})` }]);

                    // Multiplication (a * b) - skip symmetric duplicates
                    if (i < j) {
                        solve([...nextRemaining, { val: a.val * b.val, expr: `(${a.expr} × ${b.expr})` }]);
                    }

                    // Division (a / b)
                    if (Math.abs(b.val) > EPSILON) {
                        solve([...nextRemaining, { val: a.val / b.val, expr: `(${a.expr} ÷ ${b.expr})` }]);
                    }
                }
            }
        }

        const initialList = numbers.map(n => ({ val: n, expr: `${n}` }));
        solve(initialList);

        // Remove duplicate string representations
        const uniqueSolutions = Array.from(new Set(results));
        return uniqueSolutions;
    }

    generate24Puzzle(difficulty = 'normal') {
        // Pre-verified pool of interesting combinations + procedural generator
        let nums = [];
        let solutions = [];
        let attempts = 0;

        while (solutions.length === 0 && attempts < 100) {
            attempts++;
            if (difficulty === 'easy') {
                // Easier numbers with simple factors (1-9)
                nums = [
                    Math.floor(Math.random() * 8) + 1,
                    Math.floor(Math.random() * 8) + 1,
                    Math.floor(Math.random() * 8) + 1,
                    Math.floor(Math.random() * 8) + 1
                ];
            } else if (difficulty === 'hard') {
                // Harder combinations, potentially requiring fractions or unusual combinations
                nums = [
                    Math.floor(Math.random() * 11) + 2,
                    Math.floor(Math.random() * 11) + 2,
                    Math.floor(Math.random() * 11) + 2,
                    Math.floor(Math.random() * 11) + 2
                ];
            } else {
                nums = [
                    Math.floor(Math.random() * 9) + 1,
                    Math.floor(Math.random() * 9) + 1,
                    Math.floor(Math.random() * 9) + 1,
                    Math.floor(Math.random() * 9) + 1
                ];
            }
            solutions = this.solve24(nums);
        }

        // Fallback guaranteed sets if random misses
        if (solutions.length === 0) {
            const guaranteedPool = [
                [3, 8, 3, 8],
                [1, 3, 4, 6],
                [5, 5, 5, 1],
                [4, 4, 10, 10],
                [2, 3, 4, 5],
                [6, 6, 6, 6],
                [1, 5, 5, 5],
                [2, 8, 8, 8]
            ];
            nums = guaranteedPool[Math.floor(Math.random() * guaranteedPool.length)];
            solutions = this.solve24(nums);
        }

        return {
            numbers: nums,
            solutions: solutions,
            target: 24
        };
    }

    // ==========================================
    // 2. CROSS-MATH GRID EQUATIONS GENERATOR
    // ==========================================
    generateCrossGrid() {
        // Simple 2x2 or 3x3 Equation Grid
        // Row 1: A op1 B = R1
        // Col 1: A op3 C = C1
        // Row 2: C op2 D = R2
        // Col 2: B op4 D = C2

        let valid = false;
        let puzzle = null;
        let attempts = 0;

        while (!valid && attempts < 200) {
            attempts++;
            const ops = ['+', '-', '*'];
            const op1 = ops[Math.floor(Math.random() * ops.length)];
            const op2 = ops[Math.floor(Math.random() * ops.length)];
            const op3 = ops[Math.floor(Math.random() * ops.length)];
            const op4 = ops[Math.floor(Math.random() * ops.length)];

            const A = Math.floor(Math.random() * 12) + 1;
            const B = Math.floor(Math.random() * 12) + 1;
            const C = Math.floor(Math.random() * 12) + 1;
            const D = Math.floor(Math.random() * 12) + 1;

            const calc = (x, op, y) => {
                if (op === '+') return x + y;
                if (op === '-') return x - y;
                if (op === '*') return x * y;
                return 0;
            };

            const R1 = calc(A, op1, B);
            const R2 = calc(C, op2, D);
            const C1 = calc(A, op3, C);
            const C2 = calc(B, op4, D);

            // Valid conditions: Positive clean targets
            if (R1 > 0 && R2 > 0 && C1 > 0 && C2 > 0 && R1 <= 100 && R2 <= 100 && C1 <= 100 && C2 <= 100) {
                valid = true;
                
                // Mask 2 or 3 cells
                const cells = [
                    { id: 'A', value: A, masked: true },
                    { id: 'B', value: B, masked: Math.random() > 0.4 },
                    { id: 'C', value: C, masked: Math.random() > 0.4 },
                    { id: 'D', value: D, masked: true }
                ];

                // Ensure at least 2 are masked
                const maskedCount = cells.filter(c => c.masked).length;
                if (maskedCount < 2) {
                    cells[1].masked = true;
                }

                puzzle = {
                    cells: { A, B, C, D },
                    masked: {
                        A: cells[0].masked,
                        B: cells[1].masked,
                        C: cells[2].masked,
                        D: cells[3].masked
                    },
                    operators: { op1, op2, op3, op4 },
                    targets: { R1, R2, C1, C2 }
                };
            }
        }

        return puzzle;
    }

    // ==========================================
    // 3. VISUAL ALGEBRA RIDDLES GENERATOR
    // ==========================================
    generateVisualAlgebra() {
        const iconSets = [
            { a: '🍕', b: '🍔', c: '🍟', names: ['Pizza', 'Burger', 'Kentang'] },
            { a: '🍎', b: '🍌', c: '🍇', names: ['Apel', 'Pisang', 'Anggur'] },
            { a: '💎', b: '👑', c: '🪙', names: ['Berlian', 'Mahkota', 'Koin Emas'] },
            { a: '🚀', b: '🛸', c: '⭐', names: ['Roket', 'UFO', 'Bintang'] },
            { a: '🐱', b: '🐶', c: '🦊', names: ['Kucing', 'Anjing', 'Rubah'] }
        ];

        const icons = iconSets[Math.floor(Math.random() * iconSets.length)];
        const valA = Math.floor(Math.random() * 8) + 2; // e.g., 2 to 10
        const valB = Math.floor(Math.random() * 6) + 1;
        const valC = Math.floor(Math.random() * 6) + 1;

        // Equation 1: A + A + A = 3 * A
        const eq1_res = valA + valA + valA;
        const eq1 = `${icons.a} + ${icons.a} + ${icons.a} = ${eq1_res}`;

        // Equation 2: A + B + B = valA + 2*valB
        const eq2_res = valA + valB + valB;
        const eq2 = `${icons.a} + ${icons.b} + ${icons.b} = ${eq2_res}`;

        // Equation 3: B + C + C = valB + 2*valC
        const eq3_res = valB + valC + valC;
        const eq3 = `${icons.b} + ${icons.c} + ${icons.c} = ${eq3_res}`;

        // Question: A + B × C (Kabataku precedence test!)
        const targetAnswer = valA + (valB * valC);
        const question = `${icons.a} + ${icons.b} × ${icons.c} = ?`;

        const explanation = [
            `Langkah 1: 3 ${icons.a} = ${eq1_res} → ${icons.a} = ${valA}`,
            `Langkah 2: ${valA} + 2 ${icons.b} = ${eq2_res} → 2 ${icons.b} = ${eq2_res - valA} → ${icons.b} = ${valB}`,
            `Langkah 3: ${valB} + 2 ${icons.c} = ${eq3_res} → 2 ${icons.c} = ${eq3_res - valB} → ${icons.c} = ${valC}`,
            `Langkah 4: Hitung perkalian terlebih dahulu! (${icons.b} × ${icons.c} = ${valB} × ${valC} = ${valB * valC})`,
            `Langkah 5: Tambahkan dengan ${icons.a} (${valA} + ${valB * valC} = ${targetAnswer})`
        ];

        // Generate 4 plausible multiple choice options
        const wrong1 = (valA + valB) * valC; // Common trap: adding first without Kabataku
        const wrong2 = targetAnswer + valC;
        const wrong3 = Math.max(1, targetAnswer - valB);

        const optionsSet = new Set([targetAnswer, wrong1, wrong2, wrong3]);
        while (optionsSet.size < 4) {
            optionsSet.add(targetAnswer + Math.floor(Math.random() * 10) - 5);
        }

        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        return {
            icons,
            values: { a: valA, b: valB, c: valC },
            equations: [eq1, eq2, eq3],
            question,
            answer: targetAnswer,
            options,
            explanation
        };
    }

    // ==========================================
    // 4. NUMBER SEQUENCE PATTERNS GENERATOR
    // ==========================================
    generateSequencePattern() {
        const types = ['arithmetic', 'geometric', 'second_diff', 'fibonacci', 'squares', 'alternating'];
        const chosen = types[Math.floor(Math.random() * types.length)];

        let seq = [];
        let rule = '';
        let missingIndex = 4; // usually the last or second to last
        let answer = 0;

        if (chosen === 'arithmetic') {
            const start = Math.floor(Math.random() * 20) + 1;
            const diff = Math.floor(Math.random() * 8) + 2;
            seq = [start, start + diff, start + 2 * diff, start + 3 * diff, start + 4 * diff];
            rule = `Pola Aritmatika: Setiap angka bertambah +${diff}`;
            answer = seq[4];
            missingIndex = 4;
        } else if (chosen === 'geometric') {
            const start = Math.floor(Math.random() * 4) + 1;
            const ratio = Math.floor(Math.random() * 2) + 2; // ratio 2 or 3
            seq = [start, start * ratio, start * ratio * ratio, start * Math.pow(ratio, 3), start * Math.pow(ratio, 4)];
            rule = `Pola Geometri: Setiap angka dikalikan ×${ratio}`;
            answer = seq[4];
            missingIndex = 4;
        } else if (chosen === 'second_diff') {
            const start = Math.floor(Math.random() * 10) + 1;
            let current = start;
            let diff = 2;
            const step = Math.floor(Math.random() * 3) + 1;
            seq = [current];
            for (let i = 0; i < 4; i++) {
                current += diff;
                diff += step;
                seq.push(current);
            }
            rule = `Pola Selisih Bertingkat: Selisih antar suku bertambah +${step}`;
            answer = seq[4];
            missingIndex = 4;
        } else if (chosen === 'fibonacci') {
            const a = Math.floor(Math.random() * 5) + 1;
            const b = Math.floor(Math.random() * 5) + 2;
            seq = [a, b, a + b, a + 2 * b, 2 * a + 3 * b, 3 * a + 5 * b];
            rule = `Pola Penjumlahan Fibonacci: Setiap suku adalah jumlah dari 2 suku sebelumnya`;
            answer = seq[5];
            missingIndex = 5;
        } else if (chosen === 'squares') {
            const offset = Math.floor(Math.random() * 4);
            const k = Math.floor(Math.random() * 3);
            seq = [
                Math.pow(1 + offset, 2) + k,
                Math.pow(2 + offset, 2) + k,
                Math.pow(3 + offset, 2) + k,
                Math.pow(4 + offset, 2) + k,
                Math.pow(5 + offset, 2) + k
            ];
            rule = `Pola Kuadrat: Pola bilangan kuadrat n² ${k > 0 ? '+ ' + k : ''}`;
            answer = seq[4];
            missingIndex = 4;
        } else {
            // Alternating
            const start = Math.floor(Math.random() * 15) + 5;
            const add = Math.floor(Math.random() * 4) + 3;
            const sub = Math.floor(Math.random() * 2) + 1;
            seq = [start, start + add, start + add - sub, start + 2 * add - sub, start + 2 * add - 2 * sub];
            rule = `Pola Bergantian: Berpola (+${add}, -${sub}, +${add}, -${sub})`;
            answer = seq[4];
            missingIndex = 4;
        }

        // Generate multiple choices
        const optionsSet = new Set([answer, answer + 2, Math.max(1, answer - 2), answer + 4]);
        while (optionsSet.size < 4) {
            optionsSet.add(answer + Math.floor(Math.random() * 8) - 4);
        }
        const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

        return {
            sequence: seq,
            missingIndex,
            answer,
            rule,
            options
        };
    }

    // ==========================================
    // 5. TIME ATTACK RAPID GENERATOR
    // ==========================================
    generateTimeAttack(difficultyTier = 1) {
        const types = ['add', 'sub', 'mul', 'missing_op'];
        const chosen = types[Math.floor(Math.random() * types.length)];

        let questionText = '';
        let answer = 0;

        if (chosen === 'add') {
            const a = Math.floor(Math.random() * (20 * difficultyTier)) + 5;
            const b = Math.floor(Math.random() * (20 * difficultyTier)) + 5;
            questionText = `${a} + ${b} = ?`;
            answer = a + b;
        } else if (chosen === 'sub') {
            const b = Math.floor(Math.random() * (15 * difficultyTier)) + 3;
            const ans = Math.floor(Math.random() * (20 * difficultyTier)) + 5;
            const a = ans + b;
            questionText = `${a} - ${b} = ?`;
            answer = ans;
        } else if (chosen === 'mul') {
            const a = Math.floor(Math.random() * (9 + difficultyTier)) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            questionText = `${a} × ${b} = ?`;
            answer = a * b;
        } else {
            // Missing operand e.g. 8 * ? = 72 or ? + 14 = 30
            const a = Math.floor(Math.random() * 9) + 2;
            const b = Math.floor(Math.random() * 9) + 2;
            const prod = a * b;
            if (Math.random() > 0.5) {
                questionText = `${a} × [ ? ] = ${prod}`;
                answer = b;
            } else {
                const x = Math.floor(Math.random() * 25) + 5;
                const y = Math.floor(Math.random() * 25) + 5;
                questionText = `[ ? ] + ${x} = ${x + y}`;
                answer = y;
            }
        }

        // Generate 4 fast choices
        const choices = new Set([answer]);
        const offsets = [-1, 1, -2, 2, -10, 10, 3, -3];
        while (choices.size < 4) {
            const off = offsets[Math.floor(Math.random() * offsets.length)];
            const val = answer + off;
            if (val > 0) choices.add(val);
        }

        const options = Array.from(choices).sort(() => Math.random() - 0.5);

        return {
            question: questionText,
            answer,
            options
        };
    }
}

window.puzzleEngine = new PuzzleEngine();
