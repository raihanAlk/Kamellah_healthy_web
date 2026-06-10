let score = 0;
let currentIndex = 0;

const questions = [
    { q: "Makan terlalu banyak gula adalah penyebab utama diabetes tipe 1.", a: "Mitos", exp: "Diabetes tipe 1 adalah penyakit autoimun, bukan karena gula." },
    { q: "Diabetes tipe 2 bisa dicegah dengan gaya hidup sehat.", a: "Fakta", exp: "Diet dan olahraga menurunkan risiko tipe 2 secara signifikan." },
    { q: "Penderita diabetes tidak boleh makan buah sama sekali.", a: "Mitos", exp: "Buah boleh dimakan dalam porsi terkontrol dan kaya serat." },
    { q: "Diabetes bisa menular melalui sentuhan atau air liur.", a: "Mitos", exp: "Diabetes adalah penyakit metabolik, tidak menular." },
    { q: "Olahraga rutin membantu tubuh menggunakan insulin lebih efektif.", a: "Fakta", exp: "Aktivitas fisik meningkatkan sensitivitas insulin." },
    { q: "Penderita diabetes harus menghindari karbohidrat total.", a: "Mitos", exp: "Tubuh tetap butuh karbohidrat kompleks/berserat." },
    { q: "Diabetes dapat menyebabkan komplikasi pada mata dan ginjal.", a: "Fakta", exp: "Gula darah tinggi kronis merusak pembuluh darah kecil." },
    { q: "Diabetes gestasional akan hilang setelah melahirkan.", a: "Fakta", exp: "Namun tetap perlu pemantauan karena risiko tipe 2 di masa depan." },
    { q: "Insulin adalah penyembuh total diabetes.", a: "Mitos", exp: "Insulin adalah terapi untuk mengontrol kadar gula darah." },
    { q: "Gejala diabetes sering kali tidak disadari di tahap awal.", a: "Fakta", exp: "Seringkali muncul saat kondisi sudah cukup tinggi." }
];
 
window.onload = function() {
    currentIndex = 0;
    score = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('progress').innerText = `Soal ${currentIndex + 1} / ${questions.length}`;
    document.getElementById('ribbon').style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    document.getElementById('start-content').style.display = 'flex';
    document.getElementById('question-content').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'none';

    const card = document.getElementById('card');
    const startBtn = document.getElementById('start-btn');
    card.classList.add('page-enter');
    startBtn.classList.add('page-enter');

    setTimeout(() => {
        card.classList.remove('page-enter');
        startBtn.classList.remove('page-enter');
    }, 800);
};

const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (e.target.closest('.card, .navbar, .footer, .controls, .btn')) {
        glow.style.opacity = '0'; 
    } else {
        glow.style.opacity = '1'; 
    }
});

function checkAnswer(userChoice) {
    const card = document.getElementById('card');
    const mythBtn = document.getElementById('myth-btn');
    const factBtn = document.getElementById('fact-btn');
    const nextBtn = document.getElementById('next-btn');

    if (mythBtn.style.display === 'none') return; 

    const isCorrect = questions[currentIndex].a === userChoice;

    mythBtn.style.display = "none";
    factBtn.style.display = "none";
    nextBtn.style.display = "block";

    document.getElementById('answer-status').innerText = isCorrect ? "BENAR!" : "SALAH!";
    document.getElementById('explanation-text').innerText = questions[currentIndex].exp;
    card.classList.add('flipped');

    if(isCorrect) {
        score += 10;
        document.getElementById('score').innerText = score;
        try {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 100,
                    spread: 80,
                    origin: { y: 0.6, x: 0.1 }, 
                    zIndex: 10001
                });
                confetti({
                    particleCount: 100,
                    spread: 80,
                    origin: { y: 0.6, x: 0.9 }, 
                    zIndex: 10001
                });
            }
        } catch (error) {
            console.log("Animasi confetti dilewati.");
        }
    } else {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
    }
}

function nextQuestion() {
    currentIndex++;
    const card = document.getElementById('card');
    const questionText = document.getElementById('question-text');

    if (currentIndex < questions.length) {
        card.classList.add('question-change');
        document.getElementById('card').classList.remove('flipped');
        
        setTimeout(() => {
            questionText.classList.remove('fade-slide-in');
            questionText.classList.add('fade-slide-out');
        }, 50);

        setTimeout(() => {
            document.getElementById('myth-btn').style.display = "block";
            document.getElementById('fact-btn').style.display = "block";
            document.getElementById('next-btn').style.display = "none";
            questionText.innerText = questions[currentIndex].q;
            document.getElementById('progress').innerText = `Soal ${currentIndex + 1} / 10`;
            questionText.classList.remove('fade-slide-out');
            questionText.classList.add('fade-slide-in');
            card.classList.remove('question-change');
        }, 320);
    } else {
        document.getElementById('question-text').innerText = "Game Selesai! Skor Akhir: " + score;
        document.getElementById('card').classList.remove('flipped');
        
        setTimeout(() => {
            document.getElementById('myth-btn').style.display = "none";
            document.getElementById('fact-btn').style.display = "none";
            document.getElementById('next-btn').style.display = "none";
            document.getElementById('restart-btn').style.display = "block";
        }, 300);
    }
}
function startGame() {
    currentIndex = 0;
    score = 0;
    const card = document.getElementById('card');
    const startContent = document.getElementById('start-content');
    const questionContent = document.getElementById('question-content');
    const questionText = document.getElementById('question-text');

    document.getElementById('score').innerText = score;
    document.getElementById('progress').innerText = `Soal ${currentIndex + 1} / ${questions.length}`;
    
    document.getElementById('ribbon').style.display = 'block';
    document.getElementById('controls').style.display = 'flex';
    
    startContent.classList.remove('fade-slide-in');
    startContent.classList.add('fade-slide-out');
    
    card.classList.add('card-reveal');
    
    setTimeout(() => {
        startContent.style.display = 'none';
        questionContent.style.display = 'flex';
        questionContent.classList.remove('fade-slide-out');
        questionContent.classList.add('fade-slide-in');
        questionText.innerText = questions[currentIndex].q;
        document.getElementById('myth-btn').style.display = 'block';
        document.getElementById('fact-btn').style.display = 'block';
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('restart-btn').style.display = 'none';
        document.getElementById('card').classList.remove('flipped');
        setTimeout(() => card.classList.remove('card-reveal'), 700);
    }, 260);
}