/**
 * Question Bank for Brain Runner 3D
 * Multi-category, bilingual (Indonesian & English), 3-lane options (A / B / C)
 */
const QUESTION_BANK = {
    // === INDONESIAN CATEGORIES ===
    math_id: [
        { q: "Berapakah 15 x 8?", options: ["120", "110", "130"], correct: 0, diff: "easy" },
        { q: "Hasil dari 250 : 5 + 15 adalah...", options: ["65", "55", "75"], correct: 0, diff: "easy" },
        { q: "Berapakah akar kuadrat dari 169 (√169)?", options: ["13", "14", "12"], correct: 0, diff: "easy" },
        { q: "Berapakah 2 pangkat 6 (2^6)?", options: ["64", "32", "128"], correct: 0, diff: "medium" },
        { q: "Jika 3x + 9 = 24, berapakah nilai x?", options: ["5", "6", "4"], correct: 0, diff: "medium" },
        { q: "25% dari 480 adalah...", options: ["120", "140", "100"], correct: 0, diff: "medium" },
        { q: "Berapakah 12 x 12 - 44?", options: ["100", "90", "110"], correct: 0, diff: "easy" },
        { q: "Hasil dari 7! / 5! adalah...", options: ["42", "35", "49"], correct: 0, diff: "hard" },
        { q: "Keliling persegi dengan luas 81 cm² adalah...", options: ["36 cm", "32 cm", "40 cm"], correct: 0, diff: "medium" },
        { q: "Berapakah nilai dari (4 x 9) : (3 x 2)?", options: ["6", "8", "4"], correct: 0, diff: "easy" },
        { q: "Pecahan 3/4 setara dengan persentase...", options: ["75%", "80%", "70%"], correct: 0, diff: "easy" },
        { q: "Jumlah sudut dalam suatu segitiga adalah...", options: ["180°", "360°", "90°"], correct: 0, diff: "easy" },
        { q: "Bilangan prima terkecil yang lebih besar dari 20 adalah...", options: ["23", "21", "27"], correct: 0, diff: "medium" },
        { q: "Berapakah 17 x 4 - 18?", options: ["50", "48", "52"], correct: 0, diff: "easy" },
        { q: "Berapakah nilai logaritma ²log(32)?", options: ["5", "6", "4"], correct: 0, diff: "hard" },
        { q: "Volume kubus dengan rusuk 6 cm adalah...", options: ["216 cm³", "196 cm³", "256 cm³"], correct: 0, diff: "medium" },
        { q: "Berapakah 99 x 7?", options: ["693", "683", "703"], correct: 0, diff: "medium" },
        { q: "Jika sebuah mobil melaju 60 km/jam selama 2,5 jam, jaraknya adalah...", options: ["150 km", "140 km", "160 km"], correct: 0, diff: "medium" },
        { q: "Berapakah hasil dari √625 + √144?", options: ["37", "35", "39"], correct: 0, diff: "medium" },
        { q: "Berapakah sisa bagi dari 100 dibagi 7?", options: ["2", "3", "1"], correct: 0, diff: "hard" }
    ],

    science_id: [
        { q: "Planet terbesar dalam Tata Surya kita adalah...", options: ["Jupiter", "Saturnus", "Neptunus"], correct: 0, diff: "easy" },
        { q: "Simbol kimia untuk unsur Emas adalah...", options: ["Au", "Ag", "Fe"], correct: 0, diff: "easy" },
        { q: "Organ tubuh yang memompa darah ke seluruh tubuh adalah...", options: ["Jantung", "Paru-paru", "Ginjal"], correct: 0, diff: "easy" },
        { q: "Gas yang paling banyak terdapat di atmosfer Bumi adalah...", options: ["Nitrogen", "Oksigen", "Karbon Dioksida"], correct: 0, diff: "medium" },
        { q: "Proses fotosintesis pada tumbuhan menghasilkan oksigen dan...", options: ["Glukosa", "Karbon", "Nitrat"], correct: 0, diff: "easy" },
        { q: "Satuan standar internasional untuk gaya adalah...", options: ["Newton", "Joule", "Pascal"], correct: 0, diff: "easy" },
        { q: "Bagian sel yang berfungsi sebagai pembangkit energi adalah...", options: ["Mitokondria", "Ribosom", "Lisosom"], correct: 0, diff: "medium" },
        { q: "Benda langit yang mengorbit planet disebut...", options: ["Satelit", "Asteroid", "Komet"], correct: 0, diff: "easy" },
        { q: "Kecepatan cahaya dalam ruang hampa kira-kira adalah...", options: ["300.000 km/s", "150.000 km/s", "500.000 km/s"], correct: 0, diff: "medium" },
        { q: "Hewan yang memiliki tulang belakang disebut...", options: ["Vertebrata", "Avertebrata", "Arthropoda"], correct: 0, diff: "easy" },
        { q: "Lapisan atmosfer yang melindungi bumi dari radiasi ultraviolet adalah...", options: ["Ozon", "Troposfer", "Termosfer"], correct: 0, diff: "easy" },
        { q: "Zat hijau daun yang berperan dalam fotosintesis disebut...", options: ["Klorofil", "Karotenoid", "Xantofil"], correct: 0, diff: "easy" },
        { q: "Hukum gerak F = m . a dirumuskan oleh fisikawan...", options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei"], correct: 0, diff: "easy" },
        { q: "Logam cair pada suhu ruangan adalah...", options: ["Merkuri (Raksa)", "Timbal", "Tembaga"], correct: 0, diff: "medium" },
        { q: "Bakteri yang membantu pencernaan di usus besar manusia adalah...", options: ["E. Coli", "Salmonella", "Lactobacillus"], correct: 0, diff: "medium" }
    ],

    general_id: [
        { q: "Ibukota negara Australia adalah...", options: ["Canberra", "Sydney", "Melbourne"], correct: 0, diff: "easy" },
        { q: "Gunung tertinggi di dunia adalah...", options: ["Mount Everest", "K2", "Kilimanjaro"], correct: 0, diff: "easy" },
        { q: "Candi Borobudur dibangun pada masa kerajaan...", options: ["Syailendra", "Majapahit", "Singasari"], correct: 0, diff: "medium" },
        { q: "Mata uang resmi negara Jepang adalah...", options: ["Yen", "Won", "Yuan"], correct: 0, diff: "easy" },
        { q: "Benua terkecil di dunia berdasarkan luas daratan adalah...", options: ["Australia", "Eropa", "Antartika"], correct: 0, diff: "easy" },
        { q: "Penemu lampu pijar yang terkenal adalah...", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell"], correct: 0, diff: "easy" },
        { q: "Samudra terluas di dunia adalah...", options: ["Samudra Pasifik", "Samudra Atlantik", "Samudra Hindia"], correct: 0, diff: "easy" },
        { q: "Danau vulkanik terbesar di Indonesia dan Asia Tenggara adalah...", options: ["Danau Toba", "Danau Singkarak", "Danau Poso"], correct: 0, diff: "easy" },
        { q: "Lagu kebangsaan Indonesia Raya diciptakan oleh...", options: ["W.R. Supratman", "Ismail Marzuki", "Kusbini"], correct: 0, diff: "easy" },
        { q: "Negara kincir angin adalah julukan untuk negara...", options: ["Belanda", "Denmark", "Swiss"], correct: 0, diff: "easy" },
        { q: "Sungai terpanjang di dunia adalah...", options: ["Sungai Nil", "Sungai Amazon", "Sungai Yangtze"], correct: 0, diff: "medium" },
        { q: "Menara Eiffel terletak di kota...", options: ["Paris", "Roma", "Berlin"], correct: 0, diff: "easy" },
        { q: "Organisasi kesehatan dunia di bawah PBB bernama...", options: ["WHO", "UNESCO", "UNICEF"], correct: 0, diff: "easy" },
        { q: "Berapa jumlah provinsi di Indonesia saat ini (2024)?", options: ["38 Provinsi", "34 Provinsi", "36 Provinsi"], correct: 0, diff: "medium" },
        { q: "Planet terdekat dengan Matahari adalah...", options: ["Merkurius", "Venus", "Mars"], correct: 0, diff: "easy" }
    ],

    english_id: [
        { q: "What is the opposite (antonym) of 'Courageous'?", options: ["Cowardly", "Brave", "Heroic"], correct: 0, diff: "easy" },
        { q: "Choose the correct past tense: 'She ____ to the market yesterday.'", options: ["went", "gone", "goes"], correct: 0, diff: "easy" },
        { q: "What is the synonym of 'Enormous'?", options: ["Gigantic", "Tiny", "Fragile"], correct: 0, diff: "easy" },
        { q: "Which word is a noun?", options: ["Knowledge", "Quickly", "Beautiful"], correct: 0, diff: "easy" },
        { q: "Complete the idiom: 'Piece of ____'", options: ["cake", "bread", "apple"], correct: 0, diff: "easy" },
        { q: "What is the plural form of 'Child'?", options: ["Children", "Childs", "Childrens"], correct: 0, diff: "easy" },
        { q: "Choose the correct pronoun: 'Neither of the boys brought ____ book.'", options: ["his", "their", "them"], correct: 0, diff: "medium" },
        { q: "What does the word 'Abundant' mean?", options: ["Plentiful", "Rare", "Expensive"], correct: 0, diff: "medium" },
        { q: "Identify the adjective: 'The silver car zoomed past.'", options: ["Silver", "Zoomed", "Past"], correct: 0, diff: "easy" },
        { q: "Which sentence is in Present Perfect tense?", options: ["I have eaten.", "I ate food.", "I am eating."], correct: 0, diff: "medium" }
    ],

    logic_id: [
        { q: "Jika 5 kucing menangkap 5 tikus dalam 5 menit, berapa waktu 100 kucing untuk 100 tikus?", options: ["5 Menit", "100 Menit", "50 Menit"], correct: 0, diff: "medium" },
        { q: "Ayah Mary memiliki 5 anak perempuan: Nana, Nene, Nini, Nono. Siapa anak ke-5?", options: ["Mary", "Nunu", "Nana"], correct: 0, diff: "easy" },
        { q: "Mana yang lebih berat: 1 kg kapas atau 1 kg besi?", options: ["Sama Berat", "1 kg Besi", "1 kg Kapas"], correct: 0, diff: "easy" },
        { q: "Lanjutkan pola angka: 2, 4, 8, 16, 32, ...?", options: ["64", "48", "72"], correct: 0, diff: "easy" },
        { q: "Lanjutkan deret: 3, 6, 11, 18, 27, ...?", options: ["38", "36", "40"], correct: 0, diff: "hard" },
        { q: "Ada berapa huruf dalam abjad 'K-A-T-A'?", options: ["4 Huruf", "26 Huruf", "5 Huruf"], correct: 0, diff: "easy" },
        { q: "Berapa banyak bulan dalam setahun yang memiliki 28 hari?", options: ["12 Bulan (semuanya)", "1 Bulan (Februari)", "2 Bulan"], correct: 0, diff: "easy" },
        { q: "Sebuah kapal memiliki tangga tali dengan 10 anak tangga. Jika air naik 2 meter, berapa anak tangga tenggelam?", options: ["0 (kapal ikut naik)", "5 Anak Tangga", "10 Anak Tangga"], correct: 0, diff: "medium" }
    ],

    // === ENGLISH CATEGORIES ===
    math_en: [
        { q: "What is 14 x 9?", options: ["126", "116", "136"], correct: 0, diff: "easy" },
        { q: "Solve for x: 5x - 15 = 35", options: ["10", "8", "12"], correct: 0, diff: "easy" },
        { q: "What is the square root of 225 (√225)?", options: ["15", "13", "17"], correct: 0, diff: "easy" },
        { q: "What is 20% of 350?", options: ["70", "65", "75"], correct: 0, diff: "easy" },
        { q: "What is the value of 3^4 (3 to the power of 4)?", options: ["81", "64", "27"], correct: 0, diff: "medium" },
        { q: "How many degrees are in a full circle?", options: ["360°", "180°", "720°"], correct: 0, diff: "easy" },
        { q: "What is the next prime number after 29?", options: ["31", "33", "37"], correct: 0, diff: "medium" }
    ],

    science_en: [
        { q: "Which gas do plants absorb from the air for photosynthesis?", options: ["Carbon Dioxide", "Oxygen", "Nitrogen"], correct: 0, diff: "easy" },
        { q: "What is the powerhouse of the cell?", options: ["Mitochondria", "Nucleus", "Ribosome"], correct: 0, diff: "easy" },
        { q: "What is the chemical formula for water?", options: ["H2O", "CO2", "O2"], correct: 0, diff: "easy" },
        { q: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter"], correct: 0, diff: "easy" },
        { q: "What is the boiling point of pure water at sea level?", options: ["100°C", "90°C", "120°C"], correct: 0, diff: "easy" }
    ]
};

window.QUESTION_BANK = QUESTION_BANK;
