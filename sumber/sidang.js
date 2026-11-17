/* Sidang Presentasi (kelas xig2): deck per jenis, layar murid (penyaji/penonton), layar guru, layar presentasi, rekap Excel. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, NAMA = B.NAMA_FAM, JENIS = B.JENIS, NS = 8;
  const FASE_NAMA = { siap: 'Bersiap', presentasi: 'Presentasi', soal: 'Soal untuk penonton', hasil: 'Hasil soal', tanggapan: 'Tanggapan & bintang', selesai: 'Selesai' };
  const JT = { tanya: 'Pertanyaan', saran: 'Saran', apresiasi: 'Apresiasi' };
  const DR = { poli: 'Domain: semua bilangan real. Range: semua real untuk derajat ganjil; ada batas atas atau bawah untuk derajat genap.', eksp: 'Domain: semua bilangan real. Range: y > 0 (selalu di atas sumbu x).', log: 'Domain: x > 0. Range: semua bilangan real.', trig: 'Sinus dan kosinus: domain semua real, range −1 ≤ y ≤ 1, berulang tiap 360°.', rasional: 'Domain: x ≠ 0. Range: y ≠ 0 (ada garis yang tidak pernah disentuh).', akar: 'Domain: x ≥ 0. Range: y ≥ 0.', mutlak: 'Domain: semua bilangan real. Range: y ≥ 0 (titik terendah di puncak V).', tangga: 'Domain: semua bilangan real. Range: hanya bilangan bulat.', sepotong: 'Domain dan range mengikuti tiap potongan; periksa titik sambungan antar potongan.' };
  const SALAH = {
    poli: ['Mengira grafik pasti garis lurus; derajat 2 ke atas melengkung.', 'Lupa mengkuadratkan dulu: (−2)² = 4, bukan −4.', 'Mengira derajat = jumlah suku; derajat adalah pangkat tertinggi.'],
    eksp: ['Tertukar dengan polinomial: 2ˣ (x di pangkat) berbeda dari x².', 'Mengira grafik menyentuh sumbu x; ia hanya mendekat.', 'Lupa b⁰ = 1, sehingga memotong sumbu y di (0, a).'],
    log: ['Memakai x ≤ 0; domain logaritma hanya x > 0.', 'Tertukar arah: ²log 8 = 3 karena 2³ = 8.', 'Mengira naik cepat; logaritma naik makin landai.'],
    trig: ['Memakai satuan sudut yang salah (derajat atau radian).', 'Lupa nilai sin 90° = 1 dan sin 270° = −1.', 'Mengira pola berhenti; polanya berulang terus.'],
    rasional: ['Memakai x = 0 padahal penyebut tidak boleh nol.', 'Mengira dua cabang menyambung; ada garis yang tak pernah disentuh.', 'Mengira makin besar x, y makin besar; justru mengecil mendekati 0.'],
    akar: ['Memasukkan x negatif ke dalam akar.', 'Menganggap √(a + b) = √a + √b.', 'Lupa grafik mulai dari satu titik lalu makin landai.'],
    mutlak: ['Menulis |−15| = −15; yang benar 15.', 'Membuang tanda mutlak tanpa memeriksa tanda isinya.', 'Lupa grafik berbentuk V dan tidak pernah di bawah sumbu x.'],
    tangga: ['Membulatkan ke bawah padahal tarif dibulatkan ke atas.', 'Menghubungkan titik dengan garis miring; grafik melompat.', 'Salah membaca titik kosong dan titik penuh.'],
    sepotong: ['Memakai rumus yang salah untuk rentang x tertentu.', 'Lupa memeriksa batas rentang (≤ atau <).', 'Mengira grafik pasti tersambung di titik batas.']
  };
  const JUDUL = ['Kenalan dengan grafiknya', 'Bentuk umum', 'Bentuk grafik', 'Ciri dan perilaku', 'Contoh dalam kehidupan', 'Contoh soal terselesaikan', 'Dari grafik ke fungsi', 'Kesalahan umum & ringkasan'];
  const PANDU = ['Apa yang kamu lihat pertama kali pada grafik ini?', 'Apa arti tiap huruf pada bentuk umumnya?', 'Apa beda grafik tiap contoh?', 'Naik, turun, atau berulang? Di mana memotong sumbu?', 'Sebutkan satu contoh lain dari sekitarmu.', 'Coba hitung sendiri dulu sebelum melihat langkahnya.', 'Petunjuk mana pada tabel yang menunjukkan jenisnya?', 'Kesalahan mana yang paling mudah terjadi?'];
  const ap = (p, ...x) => p.append(...x.flat().filter((y) => y != null && y !== false));
  const bagian = (n) => (n < 3 ? 0 : n < 6 ? 1 : 2);
  const fmtW = (s) => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const depan = (n) => String(n || '').split(' ')[0];

  /* ---------------------------------------------------------------- deck */
  function slide(g, n, anggota) {
    const f = JENIS[g], d = GF.K[f], root0 = el('div', { kelas: 'sd-slide fx-' + f });
    const kep = el('div', { kelas: 'sd-s-kep' }, el('span', { kelas: 'chip', html: UI.glif(f) + 'Kelompok ' + (g + 1) + ' · ' + NAMA[f] }), el('span', { kelas: 'sd-s-no' }, (n + 1) + ' / ' + NS), el('h2', null, JUDUL[n])); root0.append(kep);
    const isi = el('div', { kelas: 'sd-s-isi' }); root0.append(isi);
    if (n === 0) { isi.classList.add('judul'); isi.append(el('div', { html: UI.ubin(f), kelas: 'sd-ubin' }), el('h1', null, NAMA[f]), el('div', { kelas: 'baris', gaya: 'justify-content:center;flex-wrap:wrap;gap:.5rem' }, d.alias.map((x) => el('span', { kelas: 'chip abu', gaya: 'font-size:1.2rem' }, x)))); }
    if (n === 1) { isi.append(el('div', { kelas: 'sd-rumus', html: d.umum }), el('div', { kelas: 'sd-sub' }, 'Contoh: ', el('span', { kelas: 'sd-rumus kecil', html: d.varian[0].rumus }))); }
    if (n === 2) { const grid = el('div', { kelas: 'sd-grafik g' + Math.min(4, d.varian.length) }); d.varian.slice(0, 4).forEach((v) => { const b = GF.statis(v, 'var(--t)', 5); grid.append(el('figure', null, b.svg, el('figcaption', { html: esc(v.nama) + ' · <span class="mat">' + v.rumus + '</span>' }))); }); isi.append(grid); }
    if (n === 3) { isi.append(el('ul', { kelas: 'sd-daftar' }, d.ciri.map((x) => el('li', null, x)), el('li', { gaya: 'color:var(--td);font-weight:700' }, DR[f]))); }
    if (n === 4) { isi.append(el('ul', { kelas: 'sd-daftar' }, d.konteks.map((x) => el('li', null, x)))); }
    if (n === 5) { const q = B.tantanganAcak(f, B.seedContoh(g)); isi.append(el('div', { kelas: 'sd-soal', html: q.tanya }), el('div', { kelas: 'sd-jelas' }, el('b', null, 'Langkah penyelesaian: '), q.jelas)); }
    if (n === 6) {
      const tf = B.tugasFungsi(g + 1).find((t) => (f === 'poli' ? t.jenis === 'kuadrat' : f === 'eksp' ? t.jenis === 'eksponen' : false)), sit = B.SITUASI.find((x) => x.fam === f);
      const baris = tf ? tf.baris : sit.baris, hx = tf ? 'x' : sit.x, hy = tf ? 'f(x)' : sit.y;
      const tb = el('table', { kelas: 'sd-tabel', html: '<tr><th>' + esc(hx) + '</th>' + baris.map((r) => '<td>' + esc(r[0]) + '</td>').join('') + '</tr><tr><th>' + esc(hy) + '</th>' + baris.map((r) => '<td>' + esc(r[1]) + '</td>').join('') + '</tr>' });
      isi.append(tf ? el('p', { kelas: 'sd-sub' }, 'Bentuk yang dicari: ', el('span', { html: tf.umum })) : el('p', { kelas: 'sd-sub' }, sit.judul + ': ' + sit.teks), tb, el('ol', { kelas: 'sd-daftar' }, el('li', null, 'Baca pola tabel: tambah tetap, kali tetap, berulang, atau melompat?'), el('li', null, tf ? tf.jelas : sit.alasan), el('li', null, 'Cocokkan dengan ciri grafik lalu tulis bentuk umumnya, uji dengan satu titik.')));
    }
    if (n === 7) { isi.append(el('div', { kelas: 'eyebrow' }, 'Kesalahan umum'), el('ul', { kelas: 'sd-daftar' }, SALAH[f].map((x) => el('li', null, x))), el('div', { kelas: 'sd-ring' }, el('b', null, 'Ringkasan: '), d.ciri[0] + ' Bentuk umum: ', el('span', { html: d.umum }))); }
    const k = bagian(n), nm = anggota && anggota[k] ? depan(anggota[k].nama) : '';
    root0.append(el('div', { kelas: 'sd-s-kaki' }, el('span', { kelas: 'chip ok' }, 'Bagian bicara: anggota ' + (k + 1) + (nm ? ' (' + nm + ')' : '')), el('span', { kelas: 'sd-pandu' }, 'Tanya penonton: ' + PANDU[n])));
    return root0;
  }

  /* ---------------------------------------------------------------- jaringan sidang: waktu fase */
  const durFase = (S) => (S && S.durasi ? S.durasi[S.fase] : 0) || 0;
  const sisaFase = (S, off) => (durFase(S) ? durFase(S) - ((Date.now() + off - S.mulaiFase) / 1000) : null);

  /* ---------------------------------------------------------------- murid */
  function murid(E) {
    E.kosongkan(); const idx = E.idx(), A = (x, d) => E.api(x, Object.assign({ idx }, d)), w = el('div', { kelas: 'sd' }), ban = el('div', { kelas: 'sd-ban' }), main = el('div', { kelas: 'sd-main' }), panel = el('div', { kelas: 'sd-panel' }); w.append(ban, main, panel); E.layar(w);
    let S = null, off = 0, gagal = 0, lokal = null, jwLokal = null, kB = '', kS = '', kP = '', hitung = 0;
    const sayaP = () => !!(S && S.sayaPenyaji);
    async function ambil() { if (!w.isConnected) { clearInterval(iv); clearInterval(iv2); return; } const r = await A('sd-status', { idx }); if (r.ok) { gagal = 0; S = r; off = r.sekarang - Date.now(); } else gagal++; gambar(); }
    function gambar() {
      const kb = [gagal > 1, S && S.fase, S && S.giliran, S && S.berikut].join('|'); if (kb !== kB) { kB = kb; bangunBan(); }
      if (!S) { main.innerHTML = '<div class="sd-tunggu">Menghubungkan ke guru…</div>'; return; }
      if (S.giliran == null) { const k = 'kosong'; if (kS !== k) { kS = k; main.innerHTML = ''; main.append(el('div', { kelas: 'sd-tunggu' }, el('h2', null, 'Sidang presentasi belum dimulai'), el('p', { kelas: 'muted' }, 'Tunggu guru memilih kelompok yang tampil. Layar ini berganti sendiri.'))); } }
      else {
        const cur = lokal && lokal.g === S.giliran && Date.now() - lokal.t < 3500 ? lokal.slide : S.slide, k = S.giliran + ':' + cur + ':' + sayaP(); if (kS !== k) { kS = k; main.innerHTML = ''; main.append(slide(S.giliran, cur, S.anggota)); if (sayaP()) main.append(el('div', { kelas: 'sd-nav' }, el('button', { kelas: 'btn sekunder besar', type: 'button', disabled: cur === 0, html: ik('kembali') + 'Sebelumnya', onclick: () => geser(-1) }), el('button', { kelas: 'btn besar', type: 'button', disabled: cur === NS - 1, html: 'Berikutnya' + ik('panah'), onclick: () => geser(1) }))); }
      }
      const kp = [S.fase, S.giliran, sayaP(), S.pembicara, JSON.stringify(S.jawabanSaya || jwLokal), JSON.stringify(S.suaraSaya), S.hasilSoal && S.hasilSoal.persen].join('|'); if (kp !== kP) { kP = kp; bangunPanel(); }
    }
    function curSlide() { return lokal && S && lokal.g === S.giliran && Date.now() - lokal.t < 3500 ? lokal.slide : (S ? S.slide : 0); }
    async function geser(d) { const n = Math.max(0, Math.min(NS - 1, curSlide() + d)); lokal = { g: S.giliran, slide: n, t: Date.now() }; kS = ''; gambar(); const r = await A('sd-slide', { slide: n }); if (!r.ok) UI.toast('Slide belum terkirim. Tekan Segarkan.', 'awas'); }
    function bangunBan() {
      ban.innerHTML = ''; const f = S && S.giliran != null ? JENIS[S.giliran] : null;
      ap(ban, el('span', { kelas: 'chip ' + (gagal > 1 ? 'warn' : 'ok'), html: ik(gagal > 1 ? 'putus' : 'wifi', 'kecil') + (gagal > 1 ? 'Tidak tersambung' : 'Terhubung') }), S && S.fase ? el('span', { kelas: 'chip', html: esc(FASE_NAMA[S.fase] || '') }) : null, f ? el('span', { kelas: 'sd-judul-ban' }, 'Kelompok ' + (S.giliran + 1) + ' · ' + NAMA[f]) : null, S && S.berikut != null ? el('span', { kelas: 'chip sorot' }, 'Giliran selanjutnya: Kelompok ' + (S.berikut + 1) + ' · ' + NAMA[JENIS[S.berikut]]) : null, el('span', { kelas: 'ruang' }), el('span', { kelas: 'sd-timer', id: 'sd-timer' }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil') + 'Segarkan', onclick: async () => { await ambil(); UI.toast(gagal ? 'Belum tersambung ke guru' : 'Diperbarui', gagal ? 'awas' : 'centang'); } }));
    }
    function bintang(label, nilai, pilih, sorot) {
      const r = el('div', { kelas: 'sd-bintang' + (sorot ? ' sorot' : '') }, el('div', { kelas: 'sd-b-l' }, label)), s = el('div', { kelas: 'sd-b-s' });
      for (let i = 1; i <= 5; i++) s.append(el('button', { type: 'button', kelas: 'sd-b' + (nilai >= i ? ' on' : ''), 'aria-label': i + ' bintang', onclick: () => pilih(i) }, '★')); r.append(s); return r;
    }
    async function kirimSuara(data) { const r = await A('sd-suara', data); if (r.ok) { S.suaraSaya = r.suaraSaya; kP = ''; gambar(); } else UI.toast(r._s === 409 ? 'Bintang sudah ditutup guru' : 'Gagal terkirim. Coba lagi.', 'awas'); }
    function bangunPanel() {
      panel.innerHTML = ''; if (!S || S.giliran == null) { panel.append(el('div', { kelas: 'muted tengah' }, 'Menunggu giliran…')); return; }
      const f = JENIS[S.giliran], saya = sayaP(), ph = el('div', { kelas: 'sd-pn fx-' + f }); panel.append(ph);
      const pem = S.pembicara != null ? (S.anggota.find((a) => a.idx === S.pembicara) || {}).nama : null;
      if (saya) {
        ph.append(el('div', { kelas: 'sd-pn-t' }, el('b', null, 'Kelompokmu tampil. '), FASE_NAMA[S.fase] === 'Bersiap' ? 'Tunggu aba-aba guru.' : 'Fase: ' + FASE_NAMA[S.fase] + '.'));
        ph.append(el('div', { kelas: 'baris', gaya: 'gap:.5rem;flex-wrap:wrap' }, el('span', { kelas: 'muted' }, 'Yang sedang bicara:'), S.anggota.map((a) => el('button', { type: 'button', kelas: 'btn kecil ' + (S.pembicara === a.idx ? 'hijau' : 'sekunder'), onclick: async () => { S.pembicara = a.idx; kP = ''; gambar(); const r = await A('sd-pembicara', { pembicara: a.idx }); if (!r.ok) UI.toast('Pembicara belum terkirim', 'awas'); } }, depan(a.nama)))));
        if (S.hasilSoal) ph.append(el('div', { kelas: 'umpan ok', html: ik('centang') + '<span>Keberhasilan mengajar: <b>' + S.hasilSoal.persen + '%</b> penonton menjawab benar (' + S.hasilSoal.benar + ' dari ' + S.hasilSoal.n + ').</span>' }));
        return;
      }
      if (S.fase === 'siap' || S.fase === 'presentasi') ph.append(el('div', { kelas: 'sd-pn-t' }, el('b', null, 'Kelompok ' + (S.giliran + 1) + ' sedang tampil. '), pem ? 'Pembicara: ' + pem + '.' : 'Simak penjelasannya, lalu bersiap menjawab soal.'));
      if (S.fase === 'soal' && S.soal) {
        const jw = S.jawabanSaya || jwLokal;
        ph.append(el('div', { kelas: 'sd-soal-p', html: S.soal.tanya }), el('div', { kelas: 'baris', gaya: 'gap:1rem' }, el('button', { kelas: 'btn besar hijau', type: 'button', html: ik('pensil') + (jw ? 'Ubah jawaban' : 'Jawab'), onclick: async () => { const v = await UI.keypadAngka({ tanya: S.soal.tanya, judul: 'Jawabanmu' }); if (v === null) return; const r = await A('sd-jawab', { j: v }); if (r.ok) { jwLokal = { j: v }; if (S) S.jawabanSaya = { j: v }; kP = ''; gambar(); } else UI.toast(r._s === 409 ? 'Waktu menjawab sudah ditutup' : 'Gagal terkirim. Coba lagi.', 'awas'); } }), jw ? el('span', { kelas: 'chip ok', gaya: 'font-size:1.2rem' }, 'Jawabanmu terkirim: ' + String(jw.j).replace('-', '−')) : el('span', { kelas: 'muted' }, 'Belum menjawab')));
      }
      if (S.fase === 'hasil' || S.fase === 'tanggapan' || S.fase === 'selesai') {
        if (S.hasilSoal && (S.fase === 'hasil' || S.fase === 'tanggapan')) { const jw = S.jawabanSaya; ph.append(el('div', { kelas: 'umpan ' + (jw && jw.benar ? 'ok' : ''), html: (S.soal ? '<span><b>Jawaban benar: ' + String(S.hasilSoal.kunci).replace('-', '−') + '</b> · ' + S.hasilSoal.persen + '% penonton benar. ' + (jw ? (jw.benar ? 'Jawabanmu benar.' : 'Jawabanmu: ' + String(jw.j).replace('-', '−') + '.') : 'Kamu belum menjawab.') + '</span>' : '') }), el('div', { kelas: 'sd-jelas kecil' }, S.hasilSoal.jelas)); }
        if (S.fase === 'hasil' || S.fase === 'tanggapan') { const sv = S.suaraSaya || {}, p = sv.p || {}; ph.append(bintang('Bintang untuk kelompok', sv.k || 0, (i) => kirimSuara({ k: i })), el('div', { kelas: 'sd-bgrid' }, S.anggota.map((a) => bintang('Pembicara: ' + depan(a.nama), p[a.idx] || 0, (i) => kirimSuara({ p: i, pembicara: a.idx }), S.pembicara === a.idx))), el('div', { kelas: 'muted kecil' }, 'Bintangmu anonim. Boleh diubah selama waktu masih jalan.')); }
        if (S.fase === 'selesai') ph.append(el('div', { kelas: 'sd-pn-t' }, el('b', null, 'Presentasi selesai. '), 'Terima kasih! Tunggu kelompok berikutnya.'));
      }
    }
    function tick() { const t = document.getElementById('sd-timer'); if (!t || !S) return; const s = sisaFase(S, off); if (s == null || S.fase === 'selesai' || S.fase === 'hasil' || S.fase === 'siap') { t.textContent = ''; return; } t.textContent = fmtW(Math.max(0, s)); t.className = 'sd-timer' + (s <= 10 ? ' merah' : ''); }
    const iv = setInterval(ambil, 2000), iv2 = setInterval(tick, 500); ambil();
  }

  /* ---------------------------------------------------------------- layar presentasi guru */
  function layarPresentasi(E, g0) {
    let g = g0, n = 0, tutup = false; const ov = el('div', { kelas: 'sd-ov' }), hdr = el('div', { kelas: 'sd-ov-h' }), body = el('div', { kelas: 'sd-ov-b' }); ov.append(hdr, body); document.body.append(ov);
    let kS = '', S = null, off = 0;
    const live = () => S && S.sd && S.sd.giliran === g;
    function gambar(paksa) {
      const cur = live() ? S.sd.slide : n, k = g + ':' + cur; if (paksa || k !== kS) { kS = k; n = cur; body.innerHTML = ''; body.append(slide(g, cur, live() ? S.sd.anggota : null)); }
      hdr.innerHTML = ''; const sd = S && S.sd, pem = live() && sd.pembicara != null ? (sd.anggota.find((a) => a.idx === sd.pembicara) || {}).nama : null;
      ap(hdr, el('span', { kelas: 'chip', html: UI.glif(JENIS[g]) + 'Kelompok ' + (g + 1) }), live() ? el('span', { kelas: 'chip ok' }, FASE_NAMA[sd.fase]) : el('span', { kelas: 'chip abu' }, 'Bukan kelompok yang sedang tampil: slide tidak tersinkron'), pem ? el('span', { kelas: 'chip sorot' }, 'Bicara: ' + pem) : null, el('span', { kelas: 'ruang' }), el('span', { kelas: 'sd-timer', id: 'sd-ov-timer' }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Sebelumnya', onclick: () => ganti(-1) }), el('button', { kelas: 'btn kecil', type: 'button', html: 'Berikutnya' + ik('panah', 'kecil'), onclick: () => ganti(1) }), el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('silang', 'kecil') + 'Tutup', onclick: tutupFn }));
    }
    async function ganti(d) { const m = Math.max(0, Math.min(NS - 1, n + d)); if (m === n) return; n = m; gambar(true); if (live()) { S.sd.slide = m; await E.ga('g-sd-set', { slide: m }); } }
    async function ambil() { if (tutup) return; const r = await E.ga('g-sd-status'); if (r.ok) { S = r; off = r.sekarang - Date.now(); gambar(false); } }
    const key = (e) => { if (e.key === 'ArrowRight' || e.key === ' ') { ganti(1); e.preventDefault(); } else if (e.key === 'ArrowLeft') { ganti(-1); e.preventDefault(); } else if (e.key === 'Escape') tutupFn(); };
    function tutupFn() { tutup = true; clearInterval(iv); clearInterval(iv2); document.removeEventListener('keydown', key); ov.remove(); }
    const iv = setInterval(ambil, 1500), iv2 = setInterval(() => { const t = document.getElementById('sd-ov-timer'); if (t && S && S.sd) { const s = sisaFase(S.sd, off); t.textContent = s == null || ['siap', 'hasil', 'selesai'].includes(S.sd.fase) ? '' : fmtW(Math.max(0, s)); t.className = 'sd-timer' + (s != null && s <= 10 ? ' merah' : ''); } }, 500);
    document.addEventListener('keydown', key); body.addEventListener('click', (e) => { if (e.target.closest('svg,.btn')) return; ganti(1); }); gambar(true); ambil();
  }

  /* ---------------------------------------------------------------- guru */
  function guru(E) {
    const pg = E.pg, w = el('div', { kelas: 'sdg' }); pg.append(w);
    let D = null, kD = '', off = 0, pilihTg = null, tampilAkhir = null;
    const sdSet = async (o) => { const r = await E.ga('g-sd-set', o); if (!r.ok) UI.toast('Gagal menyimpan. Coba lagi.', 'awas'); await muat(true); return r; };
    async function muat(paksa) { const r = await E.ga('g-sd-status'); if (!r.ok) { if (r._s === 401) return; w.innerHTML = ''; w.append(el('div', { kelas: 'tengah-isi' }, el('h2', null, 'Server belum terjangkau'), el('p', { kelas: 'muted' }, 'Tekan Segarkan di bagian atas. Mode manual: jalankan sidang dari layar kelas tanpa aplikasi.'))); kD = ''; return; } D = r; off = r.sekarang - Date.now(); const k = JSON.stringify([r.sd, r.suara, r.jawab, r.tanggapan, r.nilai, r.nilaiI, r.kelompok, r.kelasBuka, pilihTg]); if (paksa || k !== kD) { kD = k; gambar(); } }
    const statusG = (g) => (D.sd.giliran === g ? 'sedang' : D.sd.selesai.includes(g) ? 'selesai' : 'belum');
    function gambar() {
      const sd = D.sd, g = sd.giliran, kel = D.kelompok || [], ada = kel.some((x) => x.length); w.innerHTML = '';
      /* kiri: daftar kelompok */
      const kiri = el('div', { kelas: 'sdg-kiri' }), tengah = el('div', { kelas: 'sdg-tengah' }), kanan = el('div', { kelas: 'sdg-kanan' }); w.append(kiri, tengah, kanan);
      kiri.append(el('div', { kelas: 'eyebrow' }, 'Daftar kelompok'));
      if (!ada) kiri.append(el('div', { kelas: 'umpan', html: ik('info') + '<span>Belum ada kelompok. Salin dari pertemuan 1 atau susun di tab Kelompok.</span>' }));
      kiri.append(el('div', { kelas: 'baris', gaya: 'gap:.4rem;flex-wrap:wrap' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('salin', 'kecil') + 'Salin kelompok dari pertemuan 1', onclick: async () => { if (ada && !(await UI.konfirmasi('Timpa kelompok?', '<p class="tengah">Kelompok yang ada sekarang akan diganti dengan salinan dari pertemuan 1.</p>', 'Ya, salin', 'Batal'))) return; const r = await E.ga('g-salin-kelompok', { dari: 'xig' }); UI.toast(r.ok ? 'Kelompok disalin (' + r.terpasang + ' murid)' : (r.error === 'belum-ada-kelompok' ? 'Kelompok pertemuan 1 belum ada' : 'Gagal menyalin'), r.ok ? 'centang' : 'awas'); muat(true); } }), el('button', { kelas: 'btn kecil ' + (D.kelasBuka ? 'hijau' : ''), type: 'button', html: ik(D.kelasBuka ? 'centang' : 'gembok', 'kecil') + (D.kelasBuka ? 'Kelas terbuka (klik: tutup)' : 'Buka kelas untuk murid'), onclick: async () => { const r = await E.ga('g-kelas', { buka: !D.kelasBuka }); if (!r.ok) UI.toast(r.error === 'belum-ada-kelompok' ? 'Salin atau susun kelompok dulu' : 'Gagal', 'awas'); muat(true); } })));
      const dl = el('div', { kelas: 'sdg-daftar' }); kiri.append(dl);
      for (let i = 0; i < 9; i++) { const st = statusG(i), names = (kel[i] || []).map((s) => depan(s.nama)).join(', '); dl.append(el('div', { kelas: 'sdg-kel fx-' + JENIS[i] + ' ' + st + (sd.berikut === i ? ' berikut' : '') }, el('div', { kelas: 'sdg-kel-a' }, el('span', { html: UI.ubin(JENIS[i]) }), el('div', { gaya: 'flex:1;min-width:0' }, el('b', null, 'Kelompok ' + (i + 1) + ' · ' + NAMA[JENIS[i]]), el('div', { kelas: 'muted kecil', gaya: 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis' }, names || 'kosong')), el('span', { kelas: 'chip ' + (st === 'selesai' ? 'ok' : st === 'sedang' ? '' : 'abu') }, st === 'selesai' ? 'selesai' : st === 'sedang' ? 'tampil' : 'belum')), el('div', { kelas: 'baris', gaya: 'gap:.3rem' }, el('button', { kelas: 'btn kecil', type: 'button', onclick: async () => { if (g != null && g !== i && sd.fase !== 'selesai' && sd.fase !== 'siap' && !(await UI.konfirmasi('Ganti kelompok?', '<p class="tengah">Kelompok ' + (g + 1) + ' belum ditandai selesai. Tetap pindah ke kelompok ' + (i + 1) + '?</p>', 'Ya, pindah', 'Batal'))) return; sdSet({ giliran: i, fase: 'presentasi' }); } }, g === i ? 'Mulai ulang' : 'Mulai'), el('button', { kelas: 'btn sekunder kecil', type: 'button', onclick: () => sdSet({ berikut: sd.berikut === i ? -1 : i }) }, sd.berikut === i ? 'Batal berikutnya' : 'Jadikan berikutnya'), el('button', { kelas: 'btn sekunder kecil', type: 'button', title: 'Layar presentasi kelompok ini', html: ik('layar', 'kecil'), onclick: () => layarPresentasi(E, i) })))); }
      kiri.append(el('div', { kelas: 'baris', gaya: 'gap:.4rem;flex-wrap:wrap;margin-top:.4rem' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', onclick: unduhXlsx, html: ik('kirim', 'kecil') + 'Unduh Excel' }), el('button', { kelas: 'btn sekunder kecil', type: 'button', onclick: unduhCsv, html: ik('salin', 'kecil') + 'CSV cadangan' }), el('button', { kelas: 'btn sekunder kecil', type: 'button', onclick: rekapLihat, html: ik('buku', 'kecil') + 'Rekap' }), el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('hapus', 'kecil') + 'Atur ulang sidang', onclick: async () => { if (await UI.konfirmasi('Atur ulang sidang?', '<p class="tengah">Semua suara, jawaban, tanggapan, dan nilai guru pertemuan 2 akan dihapus. Tidak bisa dibatalkan.</p>', 'Hapus semua', 'Batal')) { await E.ga('g-sd-reset'); muat(true); } } })));
      /* tengah */
      if (g == null) { tengah.append(el('div', { kelas: 'tengah-isi' }, el('h2', null, 'Pilih kelompok yang tampil'), el('p', { kelas: 'muted' }, 'Ketuk “Mulai” pada salah satu kelompok di sebelah kiri. Urutan bebas.'))); }
      else {
        const f = JENIS[g], ang = sd.anggota;
        tengah.append(el('div', { kelas: 'sdg-kepala fx-' + f }, el('span', { html: UI.ubin(f) }), el('div', { gaya: 'flex:1' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Sedang tampil'), el('h2', { gaya: 'margin:0' }, 'Kelompok ' + (g + 1) + ' · ' + NAMA[f])), el('span', { kelas: 'sd-timer besar', id: 'sdg-timer' }), el('button', { kelas: 'btn', type: 'button', html: ik('layar') + 'Layar Presentasi', onclick: () => layarPresentasi(E, g) })));
        const fb = el('div', { kelas: 'sdg-fase' }); [['presentasi', 'Presentasi'], ['soal', 'Soal'], ['hasil', 'Hasil soal'], ['tanggapan', 'Tanggapan & bintang'], ['selesai', 'Selesai']].forEach(([id, t]) => fb.append(el('button', { kelas: 'btn ' + (sd.fase === id ? 'hijau' : 'sekunder'), type: 'button', onclick: () => sdSet({ fase: id }) }, t))); tengah.append(fb);
        const dur = el('div', { kelas: 'baris', gaya: 'gap:.6rem;flex-wrap:wrap' }, el('span', { kelas: 'muted kecil' }, 'Durasi:')); [['presentasi', 'Presentasi'], ['soal', 'Soal'], ['tanggapan', 'Tanggapan']].forEach(([id, t]) => dur.append(el('span', { kelas: 'sdg-dur' }, t + ' ' + fmtW(sd.durasi[id]), el('button', { type: 'button', onclick: () => sdSet({ durasi: { [id]: Math.max(30, sd.durasi[id] - 30) } }) }, '−'), el('button', { type: 'button', onclick: () => sdSet({ durasi: { [id]: sd.durasi[id] + 30 } }) }, '+')))); tengah.append(dur);
        const sv = D.suara || { n: 0 }, jw = D.jawab || { n: 0, benar: 0 }, tg = D.tanggapan || {}, nTg = Object.keys(tg).length;
        tengah.append(el('div', { kelas: 'sdg-hitung' }, hit('Suara masuk', sv.n + ' / ' + D.penonton, sv.rata ? '★ ' + sv.rata.toFixed(1).replace('.', ',') : '–'), hit('Jawaban masuk', jw.n + ' / ' + D.penonton, jw.n ? Math.round(jw.benar / jw.n * 100) + '% benar' : '–'), hit('Tanggapan', nTg + ' / 8', '')));
        if (ang.length) tengah.append(el('div', { kelas: 'baris', gaya: 'gap:.5rem;flex-wrap:wrap' }, el('span', { kelas: 'muted kecil' }, 'Bintang pembicara:'), ang.map((a) => { const r = (sv.pembicara || {})[a.idx]; return el('span', { kelas: 'chip' + (sd.pembicara === a.idx ? ' ok' : ' abu') }, depan(a.nama) + ' ' + (r && r.rata ? '★ ' + r.rata.toFixed(1).replace('.', ',') + ' (' + r.n + ')' : '–')); })));
        /* papan tanggapan */
        tengah.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.4rem' }, 'Papan tanggapan · ketuk kelompok yang berbicara'));
        const chips = el('div', { kelas: 'sdg-chips' }); for (let k = 0; k < 9; k++) { if (k === g) continue; const t = tg[k]; chips.append(el('button', { type: 'button', kelas: 'sdg-chip fx-' + JENIS[k] + (t ? ' ada' : '') + (pilihTg && pilihTg.k === k ? ' pilih' : ''), onclick: () => { pilihTg = { k, jenis: t ? t.jenis : null }; kD = ''; muat(true); } }, el('b', null, 'Kel. ' + (k + 1)), el('small', null, t ? JT[t.jenis] + (Number.isInteger(t.oleh) ? ' · ' + depan(((kel[k] || []).find((s) => s.idx === t.oleh) || {}).nama) : '') : '–'))); } tengah.append(chips);
        if (pilihTg && pilihTg.k !== g) { const k = pilihTg.k, p = el('div', { kelas: 'sdg-pilih' }); ap(p, el('b', null, 'Kelompok ' + (k + 1) + ': '), ['tanya', 'saran', 'apresiasi'].map((j) => el('button', { type: 'button', kelas: 'btn kecil ' + (pilihTg.jenis === j ? 'hijau' : 'sekunder'), onclick: () => { pilihTg.jenis = j; kD = ''; muat(true); } }, JT[j])));
          if (pilihTg.jenis) ap(p, el('span', { kelas: 'muted kecil' }, ' siapa?'), (kel[k] || []).map((s) => el('button', { type: 'button', kelas: 'btn kecil', onclick: async () => { await E.ga('g-sd-tanggapan', { giliran: g, kelompok: k, jenis: pilihTg.jenis, oleh: s.idx }); pilihTg = null; muat(true); } }, depan(s.nama))), el('button', { type: 'button', kelas: 'btn kecil sekunder', onclick: async () => { await E.ga('g-sd-tanggapan', { giliran: g, kelompok: k, jenis: pilihTg.jenis, oleh: null }); pilihTg = null; muat(true); } }, 'tanpa nama'));
          if (tg[k]) ap(p, el('button', { type: 'button', kelas: 'btn kecil bahaya', onclick: async () => { await E.ga('g-sd-tanggapan', { giliran: g, kelompok: k, jenis: null }); pilihTg = null; muat(true); } }, 'Batalkan'));
          ap(p, el('button', { type: 'button', kelas: 'btn kecil sekunder', onclick: () => { pilihTg = null; kD = ''; muat(true); } }, 'Tutup')); tengah.append(p); }
        /* penilaian guru */
        const nl = D.nilai || {}, rub = [['isi', 'Akurasi isi'], ['kedalaman', 'Kedalaman perincian'], ['kejelasan', 'Kejelasan'], ['kompak', 'Kekompakan']];
        kanan.append(el('div', { kelas: 'eyebrow' }, 'Penilaian guru · Kelompok ' + (g + 1)));
        rub.forEach(([id, t]) => kanan.append(skala(t, nl[id], async (v) => { await E.ga('g-sd-nilai', { giliran: g, kriteria: { [id]: v } }); muat(true); })));
        if (ang.length) { kanan.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.6rem' }, 'Nilai individu (opsional)')); ang.forEach((a) => kanan.append(skala(depan(a.nama), (D.nilaiI || {})[a.idx], async (v) => { await E.ga('g-sd-nilai', { giliran: g, idx: a.idx, nilaiI: v }); muat(true); }))); }
      }
      tickG();
    }
    const hit = (t, v, s) => el('div', { kelas: 'kartu sdg-h' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, t), el('b', null, v), el('span', { kelas: 'muted' }, s));
    const skala = (t, v, pilih) => { const r = el('div', { kelas: 'sdg-skala' }, el('span', null, t)), s = el('span', { kelas: 'sdg-sk' }); for (let i = 0; i <= 4; i++) s.append(el('button', { type: 'button', kelas: v === i ? 'on' : '', onclick: () => pilih(i) }, String(i))); r.append(s); return r; };
    function tickG() { const t = document.getElementById('sdg-timer'); if (!t || !D) return; const s = sisaFase(D.sd, off); t.textContent = s == null || ['siap', 'hasil', 'selesai'].includes(D.sd.fase) ? '' : fmtW(Math.max(0, s)); t.className = 'sd-timer besar' + (s != null && s <= 10 ? ' merah' : ''); }
    async function ambilRekap() { const r = await E.ga('g-sd-rekap'); if (!r.ok) { UI.toast('Gagal mengambil rekap', 'awas'); return null; } return r; }
    const bulat = (v) => (v == null ? null : Math.round(v * 10) / 10);
    async function rekapLihat() { const r = await ambilRekap(); if (!r) return; const T = hitungTabel(r); const isi = el('div', { kelas: 'gulir', gaya: 'max-height:60vh;overflow:auto' }); isi.append(el('table', { kelas: 'sd-tabel kecil', html: '<tr><th>Nama</th><th>Kel.</th><th>Nilai Kelompok</th><th>Nilai Individu</th><th>Nilai Akhir</th></tr>' + T.rekap.map((x) => '<tr><td>' + esc(x.nama) + '</td><td>' + (x.kel || '') + '</td><td>' + fm(x.k) + '</td><td>' + fm(x.i) + '</td><td><b>' + fm(x.a) + '</b></td></tr>').join('') })); UI.dialog({ lebar: true, judul: 'Rekap nilai sementara', ikon: ik('buku', 'besar'), isi, tombol: [{ t: 'Tutup', nilai: null, kelas: 'sekunder' }], tutupLuar: true }); }
    const fm = (v) => (v == null || v === '' ? '' : String(v).replace('.', ','));
    /* hitung nilai sama seperti rumus lembar Excel (bobot bawaan) */
    const BOBOT = { k: [40, 25, 20, 15], i: [40, 30, 30], a: [50, 50] };
    const gab = (vals, bw) => { let n = 0, d = 0; vals.forEach((v, i) => { if (v != null) { n += v * bw[i]; d += bw[i]; } }); return d ? bulat(n / d) : null; };
    function hitungTabel(r) {
      const kel = r.kelompok.map((x) => Object.assign({}, x, { nilai: gab([bulat(x.guru), bulat(x.bintang), bulat(x.mengajar), bulat(x.kontribusi)], BOBOT.k) }));
      const ind = r.individu.filter((x) => x.hadir).map((x) => Object.assign({}, x, { nilai: gab([bulat(x.penyampaian), bulat(x.jawaban), bulat(x.partisipasi)], BOBOT.i) })).sort((p, q) => p.nama.localeCompare(q.nama, 'id'));
      const rekap = r.individu.slice().sort((p, q) => p.nama.localeCompare(q.nama, 'id')).map((x) => { const i = ind.find((y) => y.idx === x.idx), k = x.kelompok > 0 ? kel[x.kelompok - 1].nilai : null; return { nama: x.nama, kel: x.kelompok > 0 ? x.kelompok : '', hadir: x.hadir, k: x.hadir ? k : null, i: i ? i.nilai : null, a: x.hadir ? gab([k, i ? i.nilai : null], BOBOT.a) : null }; });
      return { kel, ind, rekap };
    }
    const tgl = () => new Date().toISOString().slice(0, 10);
    async function unduhCsv() { const r = await ambilRekap(); if (!r) return; const T = hitungTabel(r), q = (s) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; const baris = [['No', 'Nama lengkap', 'Kelompok', 'Nilai Kelompok', 'Nilai Individu', 'Nilai Akhir']].concat(T.rekap.map((x, i) => [i + 1, x.nama, x.kel, fm(x.k), fm(x.i), fm(x.a)])); unduhBerkas('﻿' + baris.map((b) => b.map(q).join(';')).join('\r\n'), 'Nilai-Presentasi-XI-G-' + tgl() + '.csv', 'text/csv;charset=utf-8'); }
    async function unduhXlsx() { const r = await ambilRekap(); if (!r) return; try { const T = hitungTabel(r); unduhBerkas(Xlsx.buat(r, T, BOBOT, hitungKelompokKomponen), 'Nilai-Presentasi-XI-G-' + tgl() + '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); UI.toast('Excel diunduh', 'centang'); } catch (e) { UI.toast('Excel gagal dibuat, pakai CSV cadangan', 'awas'); } }
    const hitungKelompokKomponen = (x) => [bulat(x.guru), bulat(x.bintang), bulat(x.mengajar), bulat(x.kontribusi)];
    function unduhBerkas(isi, nama, tipe) { const bl = new Blob([isi], { type: tipe }), a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = nama; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
    E.mulaiPoll(() => { muat(false); }, 3000); const ivT = setInterval(() => { if (!w.isConnected) clearInterval(ivT); else tickG(); }, 500); muat(true);
  }

  /* ---------------------------------------------------------------- Excel (.xlsx) tanpa dependensi: OOXML + ZIP tanpa kompresi */
  const Xlsx = (function () {
    const tabel = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    const crc = (u) => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = tabel[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
    const enc = new TextEncoder(), u16 = (v) => [v & 255, (v >> 8) & 255], u32 = (v) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255];
    function zip(files) {
      const parts = [], cen = []; let off = 0;
      files.forEach(([nama, isi]) => { const nb = enc.encode(nama), d = enc.encode(isi), c = crc(d); const h = Uint8Array.from([].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c), u32(d.length), u32(d.length), u16(nb.length), u16(0))); parts.push(h, nb, d); cen.push(Uint8Array.from([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(c), u32(d.length), u32(d.length), u16(nb.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nb); off += h.length + nb.length + d.length; });
      const csz = cen.reduce((a, b) => a + b.length, 0); parts.push(...cen, Uint8Array.from([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(csz), u32(off), u16(0)))); return new Blob(parts, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
    const X = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])), kol = (i) => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    /* sel: string | number | {f, v} | null; baris pertama (judul) tebal */
    function sheet(rows, lebar) {
      let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols>' + lebar.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols><sheetData>';
      rows.forEach((row, r) => { x += '<row r="' + (r + 1) + '">'; row.forEach((c, i) => { if (c == null || c === '') return; const ref = kol(i) + (r + 1), st = r === 0 ? ' s="1"' : ((typeof c === 'number' && !Number.isInteger(c)) || (c && typeof c.v === 'number') ? ' s="2"' : ''); if (typeof c === 'number') x += '<c r="' + ref + '"' + st + '><v>' + c + '</v></c>'; else if (typeof c === 'string') x += '<c r="' + ref + '"' + st + ' t="inlineStr"><is><t>' + X(c) + '</t></is></c>'; else if (c && c.f) x += typeof c.v === 'number' ? '<c r="' + ref + '"' + st + '><f>' + X(c.f) + '</f><v>' + c.v + '</v></c>' : '<c r="' + ref + '" t="str"><f>' + X(c.f) + '</f><v>' + X(c.v == null ? '' : c.v) + '</v></c>'; }); x += '</row>'; }); return x + '</sheetData></worksheet>';
    }
    function buat(r, T, BOBOT, komp) {
      const F = (f, v) => ({ f, v: v == null ? '' : v }), nK = T.kel.length;
      const rowsK = [['Kelompok', 'Jenis fungsi', 'Anggota', 'Penilaian guru', 'Bintang kelompok', 'Keberhasilan mengajar', 'Kontribusi sebagai penonton', 'Nilai Kelompok']].concat(T.kel.map((x, i) => { const [a, b, c, d] = komp(x), rr = i + 2; return [x.g, x.jenis, x.anggota.join(', '), a, b, c, d, F('IF(COUNT(D' + rr + ':G' + rr + ')=0,"",ROUND(SUMPRODUCT(D' + rr + ':G' + rr + ',Bobot!$B$2:$E$2)/SUMPRODUCT(--ISNUMBER(D' + rr + ':G' + rr + '),Bobot!$B$2:$E$2),1))', x.nilai)]; }));
      const rowsI = [['Nama lengkap', 'Kelompok', 'Penyampaian', 'Jawaban soal', 'Partisipasi tanggapan', 'Nilai Individu']].concat(T.ind.map((x, i) => { const rr = i + 2; return [x.nama, x.kelompok || '', bulat0(x.penyampaian), bulat0(x.jawaban), bulat0(x.partisipasi), F('IF(COUNT(C' + rr + ':E' + rr + ')=0,"",ROUND(SUMPRODUCT(C' + rr + ':E' + rr + ',Bobot!$B$3:$D$3)/SUMPRODUCT(--ISNUMBER(C' + rr + ':E' + rr + '),Bobot!$B$3:$D$3),1))', x.nilai)]; }));
      const rowsR = [['No', 'Nama lengkap', 'Kelompok', 'Nilai Kelompok', 'Nilai Individu', 'Nilai Akhir']].concat(T.rekap.map((x, i) => { const rr = i + 2, ii = T.ind.findIndex((y) => y.nama === x.nama); if (!x.hadir) return [i + 1, x.nama, x.kel || '']; return [i + 1, x.nama, x.kel || '', x.kel ? F('INDEX(Kelompok!$H$2:$H$' + (nK + 1) + ',C' + rr + ')', x.k) : '', ii >= 0 ? F('Individu!F' + (ii + 2), x.i) : '', F('IF(COUNT(D' + rr + ':E' + rr + ')=0,"",ROUND(SUMPRODUCT(D' + rr + ':E' + rr + ',Bobot!$B$4:$C$4)/SUMPRODUCT(--ISNUMBER(D' + rr + ':E' + rr + '),Bobot!$B$4:$C$4),1))', x.a)]; }));
      const rowsT = [['Presentasi (kelompok)', 'Jenis fungsi', 'Kelompok penonton', 'Jenis tanggapan', 'Disampaikan oleh']].concat(r.tanggapan.map((t) => [t.presentasi, t.jenisPresentasi, t.kelompok, JT[t.jenis] || t.jenis, t.oleh]));
      const rowsB = [['Komponen', 'Bobot 1', 'Bobot 2', 'Bobot 3', 'Bobot 4'], ['Nilai Kelompok: penilaian guru | bintang kelompok | keberhasilan mengajar | kontribusi penonton'].concat(BOBOT.k), ['Nilai Individu: penyampaian | jawaban soal | partisipasi tanggapan'].concat(BOBOT.i), ['Nilai Akhir: Nilai Kelompok | Nilai Individu'].concat(BOBOT.a), [], ['Ubah angka bobot di atas; semua nilai di lembar lain menghitung ulang. Komponen yang belum ada datanya dilewati dan bobot sisanya dinormalkan.']];
      const S = [['Rekap', sheet(rowsR, [6, 42, 10, 15, 15, 14])], ['Kelompok', sheet(rowsK, [10, 20, 46, 14, 16, 20, 24, 15])], ['Individu', sheet(rowsI, [42, 10, 14, 14, 20, 14])], ['Tanggapan', sheet(rowsT, [20, 20, 18, 16, 36])], ['Bobot', sheet(rowsB, [80, 10, 10, 10, 10])]];
      const files = [['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + S.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') + '</Types>'],
        ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
        ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + S.map((s, i) => '<sheet name="' + s[0] + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>'],
        ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + S.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('') + '<Relationship Id="rId' + (S.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
        ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>']]
        .concat(S.map((s, i) => ['xl/worksheets/sheet' + (i + 1) + '.xml', s[1]]));
      return zip(files);
    }
    const bulat0 = (v) => (v == null ? null : Math.round(v * 10) / 10);
    return { buat };
  })();

  root.Sidang = { murid, guru, slide };
})(window);
