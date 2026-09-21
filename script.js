(() => {
  const body = document.body;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Theme
  const savedTheme = localStorage.getItem('ruang-aman-theme');
  if (savedTheme === 'dark') body.dataset.theme = 'dark';
  const themeToggle = $('#themeToggle');
  const updateThemeIcon = () => {
    const dark = body.dataset.theme === 'dark';
    themeToggle.textContent = dark ? '☀' : '☾';
    themeToggle.setAttribute('aria-label', dark ? 'Gunakan tema terang' : 'Gunakan tema gelap');
  };
  updateThemeIcon();
  themeToggle.addEventListener('click', () => {
    const dark = body.dataset.theme === 'dark';
    if (dark) delete body.dataset.theme;
    else body.dataset.theme = 'dark';
    localStorage.setItem('ruang-aman-theme', dark ? 'light' : 'dark');
    updateThemeIcon();
  });

  // Mobile navigation
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  menuToggle.addEventListener('click', () => {
    const willOpen = mobileNav.hidden;
    mobileNav.hidden = !willOpen;
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.textContent = willOpen ? '×' : '☰';
  });
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = '☰';
  }));

  // Reading progress
  const progress = $('#readingProgress');
  const setProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  // Smooth scroll buttons
  $$('[data-scroll]').forEach(btn => btn.addEventListener('click', () => {
    const target = $(btn.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  }));

  // Reveal on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => observer.observe(el));

  // Accordions
  $$('.accordion-btn').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    $$('.accordion-btn').forEach(other => other.setAttribute('aria-expanded', 'false'));
    btn.setAttribute('aria-expanded', String(!open));
  }));

  // Boundary cards
  const boundaryDetail = $('#boundaryDetail');
  const boundaryData = {
    Fisik: '<strong>Fisik:</strong> menyangkut sentuhan, jarak tubuh, atau ruang personal. <br><br><b>Contoh:</b> “Aku menghargai niat baikmu, tapi aku lebih nyaman kalau kita cukup saling menyapa dengan lambaian tangan.”',
    Waktu: '<strong>Waktu:</strong> menyangkut jadwal, energi, dan kapan kamu tersedia. <br><br><b>Contoh:</b> “Aku baru bisa membalas malam hari setelah selesai belajar.”',
    Emosi: '<strong>Emosi:</strong> kamu boleh peduli tanpa mengambil tanggung jawab penuh atas perasaan orang lain. <br><br><b>Contoh:</b> “Aku mau mendengarkan, tapi aku belum bisa menyelesaikan masalah ini untukmu.”',
    Digital: '<strong>Digital:</strong> menyangkut chat, notifikasi, foto, username, akun, dan kebiasaan online. <br><br><b>Contoh:</b> “Aku tidak selalu online, jadi mungkin balasanku tidak cepat.”',
    Privasi: '<strong>Privasi:</strong> menyangkut cerita pribadi, dokumen, kata sandi, dan informasi yang belum siap kamu bagikan. <br><br><b>Contoh:</b> “Itu cukup pribadi buatku. Aku memilih tidak membicarakannya sekarang.”'
  };
  $$('.boundary-node').forEach(btn => btn.addEventListener('click', () => {
    $$('.boundary-node').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    boundaryDetail.innerHTML = boundaryData[btn.dataset.boundary];
  }));

  // Copy buttons
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  $$('.copy-btn').forEach(btn => btn.addEventListener('click', async () => {
    const text = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Kalimat berhasil disalin.');
    } catch {
      showToast('Salin manual dari kartu ini.');
    }
  }));

  // Quiz
  const quizQuestions = [
    { q: 'Aku mengatakan “iya” walau sebenarnya sudah kelelahan.', a: 0 },
    { q: 'Aku merasa bersalah ketika menolak permintaan yang wajar.', a: 0 },
    { q: 'Aku takut orang berubah menjauh jika aku tidak menuruti keinginannya.', a: 0 },
    { q: 'Aku sulit menyampaikan bahwa suatu perilaku membuatku tidak nyaman.', a: 0 },
    { q: 'Aku sering baru sadar kebutuhanku setelah kebutuhan orang lain terpenuhi.', a: 0 },
    { q: 'Aku terus memikirkan apakah orang lain kecewa terhadapku.', a: 0 }
  ];
  const scale = ['Tidak pernah', 'Jarang', 'Kadang-kadang', 'Sering', 'Hampir selalu'];
  let quizIndex = -1;
  let quizScore = 0;
  let answered = false;
  const quizEl = $('#quiz');
  const nextQuestion = $('#nextQuestion');
  const quizCount = $('#quizCount');
  const quizResult = $('#quizResult');
  const renderQuiz = () => {
    if (quizIndex >= quizQuestions.length) {
      const level = quizScore <= 8 ? 'Pola relatif ringan' : quizScore <= 17 ? 'Ada beberapa pola yang layak diperhatikan' : 'Pola cukup sering muncul';
      quizEl.innerHTML = `<div class="quiz-question">Selesai. Skor refleksi: <strong>${quizScore}/24</strong></div><p class="tool-help"><strong>${level}</strong>. Ini bukan diagnosis. Fokus berikutnya adalah melihat kapan kamu paling sulit menjaga kebutuhan dan batasmu.</p>`;
      nextQuestion.textContent = 'Ulangi';
      quizResult.hidden = false;
      quizResult.innerHTML = '<b>Langkah berikutnya:</b> pilih satu situasi nyata, lalu coba satu kalimat batas yang sederhana. Perubahan kecil yang konsisten biasanya lebih realistis daripada memaksa diri berubah sekaligus.';
      quizCount.textContent = '6 / 6';
      return;
    }
    if (quizIndex < 0) {
      quizEl.innerHTML = '<div class="quiz-question">Klik “Mulai” untuk menjawab 6 pernyataan.</div><p class="tool-help">Tidak ada jawaban benar atau salah.</p>';
      quizCount.textContent = '0 / 6';
      nextQuestion.textContent = 'Mulai';
      return;
    }
    answered = false;
    quizResult.hidden = true;
    quizCount.textContent = `${quizIndex + 1} / 6`;
    nextQuestion.textContent = quizIndex === quizQuestions.length - 1 ? 'Lihat hasil' : 'Lanjut';
    quizEl.innerHTML = `<div class="quiz-question">${quizQuestions[quizIndex].q}</div>${scale.map((t,i)=>`<button class="choice" data-score="${i}">${t}</button>`).join('')}`;
    $$('.choice', quizEl).forEach(btn => btn.addEventListener('click', () => {
      $$('.choice', quizEl).forEach(x => x.classList.remove('selected'));
      btn.classList.add('selected');
      quizQuestions[quizIndex].a = Number(btn.dataset.score);
      answered = true;
    }));
  };
  renderQuiz();
  nextQuestion.addEventListener('click', () => {
    if (quizIndex === -1) { quizIndex = 0; quizScore = 0; renderQuiz(); return; }
    if (quizIndex >= quizQuestions.length) { quizIndex = -1; quizScore = 0; renderQuiz(); return; }
    if (!answered) { showToast('Pilih satu jawaban dulu.'); return; }
    quizScore += quizQuestions[quizIndex].a;
    quizIndex += 1;
    renderQuiz();
  });

  // Scenario lab
  const feedback = $('#scenarioFeedback');
  $$('.scenario-options button').forEach(btn => btn.addEventListener('click', () => {
    const type = btn.dataset.scenario;
    const content = {
      A: '<strong>A — terlalu mengorbankan diri.</strong><br>Respons ini menyelesaikan masalah orang lain, tetapi kebutuhanmu hilang. Kamu bisa membantu tanpa mengambil alih tugas mereka.',
      B: '<strong>B — tegas, tetapi unnecessarily keras.</strong><br>Pesan intinya boleh benar, tetapi kalimatnya bisa dibuat lebih menghormati orang lain.',
      C: '<strong>C — asertif.</strong><br>Kamu menyatakan batas sekaligus menawarkan bentuk bantuan yang masih sanggup kamu lakukan.'
    }[type];
    feedback.innerHTML = content;
  }));

  // Boundary builder
  const templates = {
    time: {
      calm: '“Aku sedang cukup penuh. Aku memilih tidak ikut kali ini supaya bisa menyelesaikan yang sudah menjadi prioritasku.”',
      firm: '“Aku tidak bisa ikut kali ini. Jadwalku sudah penuh.”',
      warm: '“Makasih sudah mengajakku. Aku ingin ikut di lain waktu, tetapi kali ini aku perlu menjaga energiku.”'
    },
    chat: {
      calm: '“Aku tidak selalu bisa membalas cepat. Kalau sedang belajar atau istirahat, aku akan membalas saat sudah senggang.”',
      firm: '“Aku tidak bisa standby chat terus. Aku akan membalas ketika tersedia.”',
      warm: '“Aku tetap peduli, ya. Aku cuma tidak selalu pegang HP, jadi balasanku bisa agak lama.”'
    },
    privacy: {
      calm: '“Aku belum siap membahas itu. Terima kasih sudah memahami.”',
      firm: '“Aku memilih tidak membagikan hal itu.”',
      warm: '“Aku tahu kamu mungkin penasaran, tetapi aku belum nyaman cerita. Nanti kalau sudah siap, aku yang akan cerita.”'
    },
    work: {
      calm: '“Aku tidak bisa mengerjakan bagianmu. Aku bisa membantu menjelaskan langkahnya supaya kamu bisa menyelesaikannya sendiri.”',
      firm: '“Aku tidak akan mengerjakan bagianmu. Silakan selesaikan bagianmu sendiri.”',
      warm: '“Aku belum bisa mengambil bagianmu, tetapi aku boleh menemani kamu memahami bagian yang sulit.”'
    }
  };
  $('#buildBoundary').addEventListener('click', () => {
    $('#generatedText').textContent = templates[$('#situation').value][$('#tone').value];
  });

  // Myth cards
  $$('.myth-card').forEach(card => card.addEventListener('click', () => card.classList.toggle('flipped')));

  // Check-in
  const needMessages = {
    istirahat: 'Kebutuhanmu hari ini: istirahat. Kamu tidak harus selalu produktif untuk layak beristirahat.',
    ruang: 'Kebutuhanmu hari ini: ruang pribadi. Sedikit jarak bisa membantu pikiran kembali jernih.',
    dukungan: 'Kebutuhanmu hari ini: dukungan. Meminta bantuan tidak membuatmu lemah.',
    kejelasan: 'Kebutuhanmu hari ini: kejelasan. Bertanya dan meminta penjelasan adalah bentuk menjaga diri.',
    waktu: 'Kebutuhanmu hari ini: waktu. Tidak semua keputusan harus dijawab sekarang juga.',
    aman: 'Kebutuhanmu hari ini: rasa aman. Saat situasi tidak aman, cari orang tepercaya dan utamakan keselamatan.'
  };
  $$('#needGrid button').forEach(btn => btn.addEventListener('click', () => {
    $$('#needGrid button').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    $('#checkinResult').textContent = needMessages[btn.dataset.need];
  }));
})();
