// ========== TAB SWITCHING ==========
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');

        const tabName = this.getAttribute('data-tab');
        const target = tabName === 'intake' ? 'sugarForm' : 'bloodSugarForm';
        document.getElementById(target).classList.add('active');
        document.getElementById('resultCard').classList.add('hidden');

        // Switch education panel
        document.querySelectorAll('.edu-panel').forEach(p => p.classList.remove('active'));
        const eduTarget = tabName === 'intake' ? 'eduIntake' : 'eduBloodSugar';
        document.getElementById(eduTarget).classList.add('active');
    });
});

// ========== SHAKE ERROR ==========
function shakeField(el) {
    const wrap = el.closest('.t-input-wrap');
    el.classList.add('is-error');
    if (wrap) wrap.classList.add('is-error');
    el.classList.remove('is-shaking');
    void el.offsetWidth;
    el.classList.add('is-shaking');
    el.addEventListener('animationend', () => el.classList.remove('is-shaking'), { once: true });
    setTimeout(() => {
        el.classList.remove('is-error', 'is-shaking');
        if (wrap) wrap.classList.remove('is-error');
    }, 3000);
}

function shakeInvalid(fields) {
    // fields: [{ el, valid }] — el is the .t-input element
    let anyInvalid = false;
    fields.forEach(({ el, valid }) => { if (!valid) { shakeField(el); anyInvalid = true; } });
    return !anyInvalid;
}

// ========== GAUGE ==========
function animateGauge(targetAngle) {
    const needle = document.getElementById('gaugeNeedleGroup');
    const from = parseFloat(needle.getAttribute('data-angle') || '0');
    const dur = 950, t0 = performance.now();
    (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        needle.setAttribute('transform', `rotate(${from + (targetAngle - from) * ease}, 100, 100)`);
        if (p < 1) requestAnimationFrame(step);
        else needle.setAttribute('data-angle', targetAngle);
    })(t0);
}

// Sugar intake: 0–12g → 0–60°, 12–limit → 60–120°, >limit → 120–178°
function sugarAngle(intake, limit) {
    if (intake <= 0) return 0;
    if (intake <= 12)     return (intake / 12) * 60;
    if (intake <= limit)  return 60 + ((intake - 12) / (limit - 12)) * 60;
    return 120 + Math.min((intake - limit) / (limit * 2), 1) * 58;
}

// Blood sugar: normal→0–60°, prediabetes→60–120°, diabetes→120–178°
function bloodAngle(level, normalMax, preMax) {
    if (level <= 0)        return 0;
    if (level <= normalMax) return (level / normalMax) * 60;
    if (level <= preMax)   return 60 + ((level - normalMax) / (preMax - normalMax)) * 60;
    return 120 + Math.min((level - preMax) / (preMax * 1.5), 1) * 58;
}

function showGauge(title, valueText, label, color, angle) {
    const panel = document.getElementById('sugarGaugePanel');
    document.getElementById('gaugeTitleText').textContent = title;
    document.getElementById('gaugeValueText').textContent = valueText;
    const lbl = document.getElementById('gaugeLevelLabel');
    lbl.textContent = label;
    lbl.style.color = color;
    panel.style.borderColor = color + '55';
    panel.style.background  = color + '0c';
    panel.classList.remove('hidden');
    animateGauge(angle);
}

// ========== SUGAR INTAKE FORM ==========
document.getElementById('sugarForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const gender    = document.getElementById('gender').value;
    const age       = document.getElementById('ageCategory').value;
    const intakeRaw = document.getElementById('currentIntake').value;
    const unit      = document.getElementById('unit').value;

    const genderEl  = document.getElementById('gender').closest('.t-input');
    const ageEl     = document.getElementById('ageCategory').closest('.t-input');
    const intakeEl  = document.getElementById('currentIntake');
    const unitEl    = document.getElementById('unit').closest('.t-input');

    const ok = shakeInvalid([
        { el: genderEl,  valid: !!gender },
        { el: ageEl,     valid: !!age },
        { el: intakeEl,  valid: !!intakeRaw && parseFloat(intakeRaw) >= 0 },
        { el: unitEl,    valid: !!unit },
    ]);
    if (!ok) return;

    const GRAMS_PER_TSP = 5;
    let intake = parseFloat(intakeRaw);
    if (unit === 'teaspoons') intake *= GRAMS_PER_TSP;

    let limit = 25;
    if (age === 'children')  limit = 22;
    else if (age === 'adult') limit = gender === 'male' ? 36 : 25;

    const limitTsp  = (limit / GRAMS_PER_TSP).toFixed(1);
    const intakeTsp = (intake / GRAMS_PER_TSP).toFixed(1);

    // UI elements
    const resultCard  = document.getElementById('resultCard');
    const resultStatus = document.getElementById('resultStatus');
    const healthTips   = document.getElementById('healthTips');
    const compBox      = document.getElementById('comparisonBox');

    document.getElementById('labelLimit').textContent   = `${limit}g  (${limitTsp} sdt)`;
    document.getElementById('labelCurrent').textContent = `${intake}g  (${intakeTsp} sdt)`;
    compBox.classList.remove('hidden');

    if (intake <= 12) {
        resultStatus.className   = 'result-status status-low';
        resultStatus.textContent = '↓ Konsumsi Gula Terlalu Rendah';
        healthTips.innerHTML = `
            Konsumsi gulamu sangat rendah (&lt;12g). Meski membatasi gula itu baik, tubuh tetap membutuhkan energi minimal dari karbohidrat.
            <br><br><strong>Tips:</strong> Pastikan asupan karbohidrat kompleks dari nasi, buah, atau ubi tetap terpenuhi agar kadar gula darah tidak turun drastis (hipoglikemia).
        `;
        showGauge('Parameter Gula Harianmu', `${intake}g`, 'RENDAH', '#16a34a', sugarAngle(intake, limit));
    } else if (intake <= limit) {
        resultStatus.className   = 'result-status status-safe';
        resultStatus.textContent = '✓ Konsumsi Gula Normal';
        healthTips.innerHTML = `
            Pertahankan pola makanmu, ya! Konsumsi gulamu masih di dalam batas maksimal harian untuk kategori tubuhmu.
            <br><br><strong>Tips:</strong> Tetap waspada terhadap <em>hidden sugar</em> (gula tersembunyi) yang sering ada di dalam minuman kemasan, saus, atau roti olahan.
        `;
        showGauge('Parameter Gula Harianmu', `${intake}g`, 'NORMAL', '#ca8a04', sugarAngle(intake, limit));
    } else {
        const selisih = (intake - limit).toFixed(1);
        const selisihTsp = (selisih / GRAMS_PER_TSP).toFixed(1);
        resultStatus.className   = 'result-status status-over';
        resultStatus.textContent = '⚠ Melebihi Batas Aman';
        healthTips.innerHTML = `
            Kamu kelebihan <strong>${selisih} gram (${selisihTsp} sdt)</strong> gula hari ini. Jika kebiasaan ini diteruskan, bisa meningkatkan risiko obesitas dan diabetes tipe 2.
            <br><br>
            <strong>Rekomendasi Aksi Cepat:</strong><br>
            1. Perbanyak minum air putih sekarang untuk membantu ginjal membuang kelebihan cairan.<br>
            2. Lakukan aktivitas fisik ringan (seperti jalan kaki 15–20 menit) untuk membantu tubuh membakar glukosa menjadi energi.<br>
            3. Kurangi camilan manis untuk sisa hari ini.
        `;
        showGauge('Parameter Gula Harianmu', `${intake}g`, 'TINGGI', '#dc2626', sugarAngle(intake, limit));
    }

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ========== BLOOD SUGAR FORM ==========
document.getElementById('bloodSugarForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const age       = document.getElementById('bloodSugarAge').value;
    const condition = document.getElementById('bloodSugarCondition').value;
    const levelRaw  = document.getElementById('bloodSugarLevel').value;

    const ageEl       = document.getElementById('bloodSugarAge').closest('.t-input');
    const conditionEl = document.getElementById('bloodSugarCondition').closest('.t-input');
    const levelEl     = document.getElementById('bloodSugarLevel');

    const ok = shakeInvalid([
        { el: ageEl,       valid: !!age },
        { el: conditionEl, valid: !!condition },
        { el: levelEl,     valid: !!levelRaw && parseFloat(levelRaw) >= 0 },
    ]);
    if (!ok) return;

    const level = parseFloat(levelRaw);
    const isPostOrRandom = condition === 'random' || condition === 'postmeal';
    const normalMax = isPostOrRandom ? 140 : 100;
    const preMax    = isPostOrRandom ? 199 : 125;

    const resultCard   = document.getElementById('resultCard');
    const resultStatus = document.getElementById('resultStatus');
    const healthTips   = document.getElementById('healthTips');
    const compBox      = document.getElementById('comparisonBox');

    compBox.classList.add('hidden');

    const condLabel = { fasting: 'Puasa', random: 'Acak', postmeal: 'Setelah makan' }[condition];

    if (level <= normalMax) {
        resultStatus.className   = 'result-status status-safe';
        resultStatus.textContent = '✓ Kadar Gula Darah Normal';
        healthTips.innerHTML = `
            <strong>Kadar Gula Darah: ${level} mg/dL (${condLabel})</strong>
            <br><br>Kadar gula darahmu berada dalam batas normal untuk kondisi ${condLabel}. Pertahankan gaya hidup sehat dengan makan bergizi seimbang, olahraga teratur, dan cukup istirahat.
            <br><br>
            <strong>Saran Aksi:</strong><br>
            • Lakukan pemeriksaan gula darah secara berkala.<br>
            • Hindari minuman manis dan makanan berkadar gula tinggi.<br>
            • Lakukan aktivitas fisik minimal 30 menit setiap hari.<br>
            • Konsultasi dengan dokter atau ahli gizi untuk rencana kesehatan yang tepat.
        `;
        showGauge('Parameter Gula Darah', `${level} mg/dL`, 'NORMAL', '#16a34a', bloodAngle(level, normalMax, preMax));
    } else if (level <= preMax) {
        resultStatus.className   = 'result-status status-warning';
        resultStatus.textContent = '⚠ Prediabetes — Perlu Perhatian';
        healthTips.innerHTML = `
            <strong>Kadar Gula Darah: ${level} mg/dL (${condLabel})</strong>
            <br><br>Kadar gula darahmu menunjukkan kondisi prediabetes. Ini adalah sinyal awal untuk mengubah gaya hidup sebelum menjadi diabetes tipe 2. Segera konsultasi dengan dokter dan kurangi asupan gula serta makanan berlemak.
            <br><br>
            <strong>Saran Aksi:</strong><br>
            • Kurangi asupan makanan dan minuman manis secara signifikan.<br>
            • Tingkatkan aktivitas fisik: minimal 150 menit per minggu.<br>
            • Pantau berat badan dan jaga agar tetap ideal.<br>
            • Segera konsultasi ke dokter untuk pemeriksaan HbA1c.
        `;
        showGauge('Parameter Gula Darah', `${level} mg/dL`, 'PREDIABETES', '#ca8a04', bloodAngle(level, normalMax, preMax));
    } else {
        resultStatus.className   = 'result-status status-over';
        resultStatus.textContent = '🔴 Indikasi Diabetes — Segera Konsultasi Dokter';
        healthTips.innerHTML = `
            <strong>Kadar Gula Darah: ${level} mg/dL (${condLabel})</strong>
            <br><br>Kadar gula darahmu sangat tinggi dan menunjukkan kemungkinan diabetes. Ini memerlukan perhatian medis serius. Segera konsultasikan ke dokter atau klinik kesehatan terdekat untuk pemeriksaan dan penanganan lebih lanjut.
            <br><br>
            <strong>Saran Aksi:</strong><br>
            • Segera periksakan ke dokter untuk diagnosis lebih lanjut.<br>
            • Hindari semua minuman manis dan makanan berkadar gula tinggi.<br>
            • Lakukan aktivitas fisik ringan minimal 30 menit setiap hari.<br>
            • Pantau kadar gula darah secara rutin dan catat hasilnya.
        `;
        showGauge('Parameter Gula Darah', `${level} mg/dL`, 'DIABETES', '#dc2626', bloodAngle(level, normalMax, preMax));
    }

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});