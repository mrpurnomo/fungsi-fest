/* Deck presentasi per jenis fungsi: 9 slide dengan grafik beranimasi, animasi parameter, contoh soal bertahap, dan alur pembicara. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, NAMA = B.NAMA_FAM, JENIS = B.JENIS, NS = 9;
  const PERAN = [null,
    { nama: 'Pembuka', slide: [0, 1, 2], ket: 'Memperkenalkan jenis fungsi, bentuk umum, dan bentuk grafiknya.' },
    { nama: 'Penjelas', slide: [3, 4, 5], ket: 'Menjelaskan animasi parameter, ciri grafik, dan contoh dalam kehidupan.' },
    { nama: 'Pemandu Soal', slide: [6, 7, 8], ket: 'Membawakan contoh soal, dari grafik ke fungsi, kesalahan umum, lalu memandu soal untuk teman.' }];
  const bagian = (n) => Math.min(2, Math.floor(n / 3)) + 1;
  const JUDUL = ['Kenalan dengan grafiknya', 'Bentuk umum', 'Bentuk grafik', 'Animasi parameter', 'Ciri dan perilaku', 'Contoh dalam kehidupan', 'Contoh soal terselesaikan', 'Dari grafik ke fungsi', 'Kesalahan umum & ringkasan'];
  const PANDU = ['Apa yang kamu lihat pertama kali pada grafik ini?', 'Apa arti tiap huruf pada bentuk umumnya?', 'Apa beda grafik tiap contoh?', 'Apa yang berubah saat parameternya berubah?', 'Naik, turun, atau berulang? Di mana memotong sumbu?', 'Sebutkan satu contoh lain dari sekitarmu.', 'Coba hitung sendiri dulu sebelum melihat langkahnya.', 'Petunjuk mana pada tabel yang menunjukkan jenisnya?', 'Kesalahan mana yang paling mudah terjadi?'];
  const BOBOT = [1.2, 1.6, 1.6, 2.6, 1.6, 1.4, 2.8, 2.4, 1.6];
  const fmtW = (s) => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  /* alur bicara: tiap slide dapat peran dan jatah detik dari total durasi presentasi */
  function alur(durasi) { const jml = BOBOT.reduce((a, b) => a + b, 0); let t = 0; return JUDUL.map((j, n) => { const d = Math.max(8, Math.round(durasi * BOBOT[n] / jml)), o = { n, judul: j, peran: bagian(n), detik: d, mulai: t }; t += d; return o; }); }
  const pembicaraDari = (n, ctx) => { const r = bagian(n), a = ctx && ctx.anggota ? ctx.anggota : []; const pr = ctx && ctx.peran ? ctx.peran : {}; const m = a.find((x) => pr[x.idx] === r); return { peran: r, nama: m ? m.nama.split(' ')[0] : '' }; };

  const DR = { poli: 'Domain: semua bilangan real. Range: semua real untuk derajat ganjil; ada batas atas atau bawah untuk derajat genap.', eksp: 'Domain: semua bilangan real. Range: y > 0 (selalu di atas sumbu x).', log: 'Domain: x > 0. Range: semua bilangan real.', trig: 'Sinus dan kosinus: domain semua real, range −1 ≤ y ≤ 1, berulang tiap 360°.', rasional: 'Domain: x ≠ 0. Range: y ≠ 0 (ada garis yang tidak pernah disentuh).', akar: 'Domain: x ≥ 0. Range: y ≥ 0.', mutlak: 'Domain: semua bilangan real. Range: y ≥ 0 (titik terendah di puncak V).', tangga: 'Domain: semua bilangan real. Range: hanya bilangan bulat.', sepotong: 'Domain dan range mengikuti tiap potongan; periksa titik sambungan antar potongan.' };
  const ARTI = { poli: ['<i>a</i><sub><i>n</i></sub>, …, <i>a</i><sub>0</sub>: koefisien (angka pengali)', '<i>n</i>: derajat, yaitu pangkat tertinggi', '<i>a</i><sub>0</sub>: titik potong dengan sumbu y'], eksp: ['<i>a</i>: nilai awal, grafik memotong sumbu y di (0, <i>a</i>)', '<i>b</i>: faktor kali. <i>b</i> &gt; 1 naik, 0 &lt; <i>b</i> &lt; 1 turun', '<i>x</i>: berada di pangkat'], log: ['<i>b</i>: basis (pokok) logaritma', '<i>x</i> harus lebih dari 0', '<sup><i>b</i></sup>log <i>x</i> = pangkat berapa <i>b</i> agar hasilnya <i>x</i>'], trig: ['<i>A</i>: amplitudo, tinggi gelombang', '<i>B</i>: frekuensi, periode = 360° ÷ <i>B</i>', 'sin <i>x</i> berayun antara −1 dan 1'], rasional: ['<i>k</i>: konstanta pembilang', '<i>x</i> ≠ 0 karena penyebut tidak boleh nol', '<i>x</i> · <i>y</i> selalu sama dengan <i>k</i>'], akar: ['<i>a</i>: pengali, makin besar makin curam', '<i>h</i>: titik awal grafik di sumbu x', 'isi akar tidak boleh negatif'], mutlak: ['<i>a</i>: kecuraman kedua sisi huruf V', '<i>h</i>: letak titik puncak V', 'hasil tidak pernah negatif untuk <i>a</i> positif'], tangga: ['pembulatan ke atas: 2,1 menjadi 3', 'tiap rentang nilainya tetap, lalu melompat', 'titik kosong tidak termasuk, titik penuh termasuk'], sepotong: ['tiap rumus hanya berlaku di rentang tertentu', 'periksa batas rentang (≤ atau &lt;)', 'grafik bisa melompat di titik batas'] };
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

  /* ---------------------------------------------------------------- animasi parameter */
  const fx = (n) => String(Math.round(n * 10) / 10).replace('-', '−').replace('.', ',');
  const I = (t) => '<i>' + t + '</i>';
  const F0 = I('f') + '(' + I('x') + ') = ';
  const lin = (x0, x1, n) => { const a = []; for (let i = 0; i <= n; i++) a.push(x0 + (x1 - x0) * i / n); return a; };
  const PARAM = {
    poli: { spec: { xmin: -4, xmax: 4, ymin: -12, ymax: 12, xt: [-4, -2, 0, 2, 4], yt: [-12, -6, 0, 6, 12] }, def: { a: 1, c: -3 }, par: [
      { k: 'a', min: -2, max: 2, ket: (v) => (v > 0.15 ? 'a positif: parabola membuka ke atas.' : v < -0.15 ? 'a negatif: parabola membuka ke bawah.' : 'a mendekati 0: lengkungan hilang, tinggal garis datar.') + ' Makin besar |a|, makin sempit.' },
      { k: 'c', min: -6, max: 6, ket: (v) => 'c menggeser grafik naik-turun. Memotong sumbu y di (0, ' + fx(v) + ').' }],
      f: (x, P) => P.a * x * x + P.c, rumus: (P) => F0 + fx(P.a) + I('x') + '<sup>2</sup> ' + (P.c < 0 ? '− ' + fx(-P.c) : '+ ' + fx(P.c)) },
    eksp: { spec: { xmin: -3, xmax: 4, ymin: -1, ymax: 10, xt: [-3, -2, -1, 0, 1, 2, 3, 4], yt: [0, 2, 4, 6, 8, 10] }, def: { b: 2, a: 1 }, par: [
      { k: 'b', min: 0.4, max: 3, ket: (v) => (v > 1.05 ? 'b > 1: grafik naik, makin lama makin curam (pertumbuhan).' : v < 0.95 ? '0 < b < 1: grafik turun mendekati 0 (peluruhan).' : 'b ≈ 1: grafik hampir datar.') },
      { k: 'a', min: 0.5, max: 3, ket: (v) => 'a adalah nilai awal. Grafik memotong sumbu y di (0, ' + fx(v) + ').' }],
      f: (x, P) => P.a * Math.pow(P.b, x), rumus: (P) => F0 + fx(P.a) + ' · ' + fx(P.b) + '<sup>' + I('x') + '</sup>' },
    log: { spec: { xmin: 0, xmax: 8, ymin: -3, ymax: 4, xt: [0, 2, 4, 6, 8], yt: [-2, 0, 2, 4] }, def: { b: 2, h: 0 }, par: [
      { k: 'b', min: 1.5, max: 8, ket: (v) => 'Makin besar basis b, grafik makin landai.' },
      { k: 'h', min: 0, max: 3, ket: (v) => 'h menggeser grafik ke kanan. Domain menjadi x > ' + fx(v) + '.' }],
      f: (x, P) => Math.log(x - P.h) / Math.log(P.b), rumus: (P) => F0 + '<sup>' + fx(P.b) + '</sup>log (' + I('x') + (P.h ? ' − ' + fx(P.h) : '') + ')' },
    trig: { spec: { xmin: 0, xmax: 360, ymin: -3.4, ymax: 3.4, xt: [0, 90, 180, 270, 360], yt: [-3, -2, -1, 0, 1, 2, 3] }, def: { A: 1, B: 1 }, par: [
      { k: 'A', min: 0.5, max: 3, ket: (v) => 'A = amplitudo: gelombang berayun dari −' + fx(v) + ' sampai ' + fx(v) + '.' },
      { k: 'B', min: 0.5, max: 3, ket: (v) => 'B = frekuensi. Periode = 360° ÷ ' + fx(v) + ' = ' + fx(360 / v) + '°. Makin besar B, makin rapat gelombangnya.' }],
      f: (x, P) => P.A * Math.sin(P.B * x * Math.PI / 180), rumus: (P) => F0 + fx(P.A) + ' sin (' + fx(P.B) + I('x') + ')' },
    rasional: { spec: { xmin: -6, xmax: 6, ymin: -8, ymax: 8, xt: [-6, -3, 0, 3, 6], yt: [-8, -4, 0, 4, 8] }, def: { k: 6 }, par: [
      { k: 'k', min: -8, max: 8, ket: (v) => (v > 0.4 ? 'k positif: dua cabang di kuadran I dan III.' : v < -0.4 ? 'k negatif: dua cabang di kuadran II dan IV.' : 'k ≈ 0: kedua cabang menempel di sumbu x.') + ' Makin besar |k|, makin jauh dari sumbu.' }],
      f: (x, P) => P.k / x, rumus: (P) => F0 + fx(P.k) + ' ÷ ' + I('x') },
    akar: { spec: { xmin: -3, xmax: 9, ymin: -1, ymax: 6, xt: [-3, 0, 3, 6, 9], yt: [0, 2, 4, 6] }, def: { a: 1, h: 0 }, par: [
      { k: 'a', min: 0.4, max: 3, ket: (v) => 'a pengali: makin besar, grafik makin curam.' },
      { k: 'h', min: -3, max: 4, ket: (v) => 'h menggeser titik awal ke x = ' + fx(v) + '. Domain: x ≥ ' + fx(v) + '.' }],
      f: (x, P) => P.a * Math.sqrt(x - P.h), rumus: (P) => F0 + fx(P.a) + '√(' + I('x') + (P.h ? (P.h < 0 ? ' + ' + fx(-P.h) : ' − ' + fx(P.h)) : '') + ')' },
    mutlak: { spec: { xmin: -4, xmax: 6, ymin: -8, ymax: 8, xt: [-4, -2, 0, 2, 4, 6], yt: [-8, -4, 0, 4, 8] }, def: { a: 1, h: 2 }, par: [
      { k: 'a', min: -2, max: 2, ket: (v) => (v > 0.15 ? 'a positif: huruf V menghadap ke atas.' : v < -0.15 ? 'a negatif: V terbalik, menghadap ke bawah.' : 'a ≈ 0: V menjadi garis datar.') + ' Makin besar |a|, makin curam.' },
      { k: 'h', min: -3, max: 4, ket: (v) => 'h menggeser puncak V ke x = ' + fx(v) + '.' }],
      f: (x, P) => P.a * Math.abs(x - P.h), rumus: (P) => F0 + fx(P.a) + '|' + I('x') + (P.h ? (P.h < 0 ? ' + ' + fx(-P.h) : ' − ' + fx(P.h)) : '') + '|' },
    tangga: { spec: { xmin: 0, xmax: 6, ymin: 0, ymax: 8, xt: [0, 1, 2, 3, 4, 5, 6], yt: [0, 2, 4, 6, 8] }, def: { w: 1, s: 1 }, par: [
      { k: 'w', min: 0.5, max: 2.5, ket: (v) => 'w = lebar tiap anak tangga: nilai tetap selama ' + fx(v) + ' satuan x.' },
      { k: 's', min: 1, max: 3, ket: (v) => 's = tinggi lompatan tiap anak tangga: ' + fx(v) + '.' }],
      garis: (P) => { const g = []; for (let k = 1; (k - 1) * P.w < 6 && k < 30; k++) g.push([[(k - 1) * P.w, P.s * k], [Math.min(6, k * P.w), P.s * k]]); return g; },
      rumus: (P) => F0 + fx(P.s) + ' × pembulatan ke atas (' + I('x') + ' ÷ ' + fx(P.w) + ')' },
    sepotong: { spec: { xmin: 0, xmax: 6, ymin: -2, ymax: 8, xt: [0, 1, 2, 3, 4, 5, 6], yt: [-2, 0, 2, 4, 6, 8] }, def: { m: 0.5, c: 2 }, par: [
      { k: 'm', min: -1, max: 3, ket: (v) => 'm = kemiringan potongan kedua: ' + (v > 0 ? 'naik' : v < 0 ? 'turun' : 'datar') + ' ' + fx(Math.abs(v)) + ' tiap 1 satuan x.' },
      { k: 'c', min: 1, max: 4, ket: (v) => 'c = titik sambung. Rumus berganti di x = ' + fx(v) + '.' }],
      garis: (P) => [[[0, 0], [P.c, P.c]], [[P.c, P.c], [6, P.c + P.m * (6 - P.c)]]],
      rumus: (P) => F0 + I('x') + ' jika ' + I('x') + ' &lt; ' + fx(P.c) + ', lalu naik ' + fx(P.m) + ' tiap 1 satuan ' + I('x') }
  };
  /* tunggu elemen terpasang di dokumen lalu jalankan fn; berhenti bila tak kunjung terpasang */
  const saatTampil = (node, fn, mx) => { let n = 0; const c = () => { if (node.isConnected) fn(); else if (n++ < (mx || 40)) setTimeout(c, 60); }; c(); };

  function animParam(f, statis) {
    const D = PARAM[f], P = Object.assign({}, D.def), wrap = el('div', { kelas: 'sd-ap' }), kiri = el('div', { kelas: 'sd-ap-g' }), kanan = el('div', { kelas: 'sd-ap-k' }); wrap.append(kiri, kanan);
    const b = GF.bidang(Object.assign({ W: 640, H: 440 }, D.spec)); kiri.append(b.svg);
    const rum = el('div', { kelas: 'sd-rumus' }), ket = el('div', { kelas: 'sd-ap-ket' }), chips = el('div', { kelas: 'sd-ap-chips' }), ctr = el('div', { kelas: 'baris', gaya: 'gap:.5rem;flex-wrap:wrap' });
    let aktif = 0, jalan = !statis, lalu = 0, tPrev = 0, mulai = false, belum = 0, mati = false; const T = 5200;
    const kur = () => (D.garis ? D.garis(P) : GF.sampel((x) => D.f(x, P), D.spec.xmin, D.spec.xmax, 420, D.spec.ymin, D.spec.ymax));
    function gambar() { b.lapis.kurva.innerHTML = ''; const g = kur(); if (g.length && g[0].length) b.kurva(g, { warna: 'var(--t)', tebal: 5.5 }); rum.innerHTML = D.rumus(P); const pr = D.par[aktif]; ket.innerHTML = '<b>' + pr.k + ' = ' + fx(P[pr.k]) + '</b> · ' + pr.ket(P[pr.k], P); chips.querySelectorAll('button').forEach((c, i) => c.classList.toggle('aktif', i === aktif)); }
    const reset = () => { Object.assign(P, D.def); };
    D.par.forEach((p, i) => chips.append(el('button', { type: 'button', kelas: 'sd-chip-p', onclick: () => { aktif = i; reset(); lalu = 0; gambar(); } }, 'Ubah ' + p.k)));
    const bPlay = el('button', { kelas: 'btn kecil sekunder', type: 'button', html: ik('jam', 'kecil') + 'Jeda', onclick: () => { jalan = !jalan; bPlay.innerHTML = ik(jalan ? 'jam' : 'main', 'kecil') + (jalan ? 'Jeda' : 'Putar'); } });
    const langkah = (d) => { const pr = D.par[aktif], st = (pr.max - pr.min) / 12; P[pr.k] = Math.max(pr.min, Math.min(pr.max, P[pr.k] + d * st)); gambar(); };
    ctr.append(bPlay, el('button', { kelas: 'btn kecil sekunder', type: 'button', onclick: () => { jalan = false; bPlay.innerHTML = ik('main', 'kecil') + 'Putar'; langkah(-1); }, 'aria-label': 'Kurangi' }, '−'), el('button', { kelas: 'btn kecil sekunder', type: 'button', onclick: () => { jalan = false; bPlay.innerHTML = ik('main', 'kecil') + 'Putar'; langkah(1); }, 'aria-label': 'Tambah' }, '+'));
    kanan.append(el('div', { kelas: 'eyebrow' }, 'Apa yang terjadi jika parameter berubah?'), rum, chips, ket); if (!statis) kanan.append(ctr);
    function frame(ts) {
      if (mati) return; if (!wrap.isConnected) { if (mulai) { mati = true; return; } if (belum++ > 120) { mati = true; return; } requestAnimationFrame(frame); return; } mulai = true;
      const dt = tPrev ? Math.min(80, ts - tPrev) : 0; tPrev = ts;
      if (jalan) { lalu += dt; const pr = D.par[aktif], mid = (pr.min + pr.max) / 2, amp = (pr.max - pr.min) / 2, ph0 = Math.asin(Math.max(-1, Math.min(1, (D.def[pr.k] - mid) / amp))); P[pr.k] = mid + amp * Math.sin(ph0 + 2 * Math.PI * lalu / T); if (lalu >= T) { lalu = 0; reset(); aktif = (aktif + 1) % D.par.length; } gambar(); }
      requestAnimationFrame(frame);
    }
    gambar(); if (!statis) requestAnimationFrame(frame); return wrap;
  }

  /* ---------------------------------------------------------------- grafik beranimasi bentuk umum (varian bisa dipilih) */
  function grafikVarian(f, d, statis) {
    const wrap = el('div', { kelas: 'sd-g2' }), area = el('div', { kelas: 'sd-g2-area' }), kap = el('div', { kelas: 'sd-g2-kap' }), kendali = el('div', { kelas: 'sd-g2-ctl' }); wrap.append(area, kap, kendali);
    let sekarang = 0; const tampil = (i) => { sekarang = i; area.innerHTML = ''; const v = d.varian[i]; kap.innerHTML = '<span class="mat">' + v.rumus + '</span><span class="muted"> · ' + esc(v.nama) + '</span>'; kendali.querySelectorAll('button.v').forEach((x, k) => x.classList.toggle('aktif', k === i));
      if (statis) { area.append(GF.statis(v, 'var(--t)', 5).svg); return; } const r = GF.gambarVarian(v, 'var(--t)'); area.append(r.b.svg); saatTampil(area, () => GF.gambarKurva(r.kurva, 1700).then(() => r.b.svg.querySelectorAll('.tk').forEach((c) => c.setAttribute('opacity', 1))).catch(() => {})); };
    if (d.varian.length > 1) d.varian.forEach((v, i) => kendali.append(el('button', { type: 'button', kelas: 'v sd-chip-p', onclick: () => tampil(i) }, v.nama.split('·')[0].trim()))); if (!statis) kendali.append(el('button', { type: 'button', kelas: 'btn kecil sekunder', html: ik('ulang', 'kecil') + 'Putar ulang', onclick: () => tampil(sekarang) }));
    tampil(0); return wrap;
  }

  /* ---------------------------------------------------------------- tabel -> grafik */
  const angka = (v) => { if (typeof v === 'number') return v; const t = String(v).replace(/\./g, '').replace(',', '.'); const n = parseFloat(t); return isFinite(n) ? n : 0; };
  function tiks(a, b, n) { const r = b - a, raw = r / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, st = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, o = []; for (let v = Math.ceil(a / st) * st; v <= b + 1e-9; v += st) o.push(Math.round(v / st) * st); return o; }
  function grafikTabel(f, tf, sit, statis) {
    const baris = (tf ? tf.baris : sit.baris).map((r) => [angka(r[0]), angka(r[1])]), xs = baris.map((r) => r[0]), ys = baris.map((r) => r[1]);
    let x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys.concat(0)), y1 = Math.max.apply(null, ys); const px = (x1 - x0) * 0.12 || 1, py = (y1 - y0) * 0.15 || 1; x0 -= px; x1 += px; y1 += py; if (y0 < 0) y0 -= py;
    const b = GF.bidang({ W: 640, H: 440, xmin: x0, xmax: x1, ymin: y0, ymax: y1, xt: tiks(x0, x1, 6), yt: tiks(y0, y1, 5), labelX: tf ? 'x' : sit.x, labelY: tf ? 'f(x)' : sit.y });
    if (tf) { const J = tf.jawab; const fn = tf.jenis === 'kuadrat' ? (x) => J[0] * x * x + J[1] : (x) => J[0] * Math.pow(J[1], x); const g = GF.sampel(fn, x0, x1, 300, y0, y1); if (g.length) { const k = b.kurva(g, { warna: 'var(--t)', tebal: 5, sembunyi: !statis }); k.style.opacity = statis ? 1 : 0; b.__k = k; } }
    else if (baris.length > 1) { const poly = baris.slice().sort((p, q) => p[0] - q[0]); b.kurva([poly], { warna: 'var(--t)', tebal: 2.4 }); b.lapis.kurva.style.opacity = statis ? .45 : 0; b.__poly = b.lapis.kurva; }
    const titik = baris.map((r) => { const c = GF.S('circle', { cx: b.sx(r[0]), cy: b.sy(r[1]), r: 9, fill: 'var(--t)', stroke: '#fff', 'stroke-width': 3, opacity: statis ? 1 : 0 }); b.lapis.titik.append(c); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; return c; });
    if (!statis) saatTampil(b.svg, async () => { for (let i = 0; i < titik.length; i++) { await new Promise((r) => setTimeout(r, 700)); if (!b.svg.isConnected) return; titik[i].setAttribute('opacity', 1); UI.anim(titik[i], [{ transform: 'scale(.2)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 420 }); } await new Promise((r) => setTimeout(r, 500)); if (!b.svg.isConnected) return; if (b.__k) { b.__k.style.opacity = 1; GF.gambarKurva(b.__k, 1500).catch(() => {}); } if (b.__poly) { b.__poly.style.transition = 'opacity .6s'; b.__poly.style.opacity = .45; } });
    return { svg: b.svg, titik };
  }

  /* ---------------------------------------------------------------- slide */
  function slide(g, n, ctx) {
    ctx = ctx || {}; const f = JENIS[g], d = GF.K[f], statis = !!ctx.statis, root0 = el('div', { kelas: 'sd-slide fx-' + f });
    root0.append(el('div', { kelas: 'sd-s-kep' }, el('span', { kelas: 'chip', html: UI.glif(f) + 'Kelompok ' + (g + 1) + ' · ' + NAMA[f] }), el('span', { kelas: 'sd-s-no' }, (n + 1) + ' / ' + NS), el('h2', null, JUDUL[n])));
    const isi = el('div', { kelas: 'sd-s-isi' }); root0.append(isi);
    if (n === 0) {
      isi.classList.add('judul2'); const kir = el('div', { kelas: 'sd-j-kiri' }, el('div', { html: UI.ubin(f), kelas: 'sd-ubin sd-denyut' }), el('h1', null, NAMA[f]), el('div', { kelas: 'baris', gaya: 'justify-content:center;flex-wrap:wrap;gap:.5rem' }, d.alias.map((x) => el('span', { kelas: 'chip abu', gaya: 'font-size:1.15rem' }, x))), el('div', { kelas: 'sd-sub' }, 'Presentasi Kelompok ' + (g + 1)));
      const gr = el('div', { kelas: 'sd-j-kanan' }); const v = d.varian[0], rr = statis ? { b: GF.statis(v, 'var(--t)', 5) } : GF.gambarVarian(v, 'var(--t)'); gr.append(rr.b.svg); if (!statis) saatTampil(gr, () => GF.gambarKurva(rr.kurva, 2000).then(() => rr.b.svg.querySelectorAll('.tk').forEach((c) => c.setAttribute('opacity', 1))).catch(() => {})); isi.append(kir, gr);
    }
    if (n === 1) {
      isi.append(el('div', { kelas: 'sd-rumus' + (statis ? '' : ' sd-muncul'), html: d.umum }), el('div', { kelas: 'sd-sub' }, 'Contoh: ', el('span', { kelas: 'sd-rumus kecil', html: d.varian[0].rumus })), el('ul', { kelas: 'sd-daftar sd-arti' }, ARTI[f].map((x, i) => el('li', { html: x, gaya: statis ? '' : 'animation:sdmuncul .5s ' + (0.5 + i * 0.6) + 's both' }))));
    }
    if (n === 2) isi.append(grafikVarian(f, d, statis));
    if (n === 3) isi.append(animParam(f, statis));
    if (n === 4) {
      const v = d.varian[0], gr = el('div', { kelas: 'sd-j-kanan' }, GF.statis(v, 'var(--t)', 5).svg); isi.classList.add('dua'); isi.append(el('ul', { kelas: 'sd-daftar' }, d.ciri.map((x) => el('li', null, x)), el('li', { gaya: 'color:var(--td);font-weight:700' }, DR[f])), gr);
    }
    if (n === 5) isi.append(el('ul', { kelas: 'sd-daftar besar' }, d.konteks.map((x, i) => el('li', { gaya: statis ? '' : 'animation:sdmuncul .5s ' + (0.2 + i * 0.7) + 's both' }, x))), el('div', { kelas: 'sd-sub' }, 'Pikirkan: apa yang menjadi x dan apa yang menjadi f(x) pada contoh ini?'));
    if (n === 6) {
      const q = B.tantanganAcak(f, B.seedContoh(g)), langkah = q.jelas.split(/(?<=[.!?])\s+/).filter(Boolean), ol = el('ol', { kelas: 'sd-langkah-ol' }, langkah.map((t) => el('li', { gaya: statis ? '' : 'opacity:0' }, t))); let tm = [];
      const tunjuk = () => { tm.forEach(clearTimeout); tm = []; [...ol.children].forEach((li) => { li.style.opacity = 0; }); [...ol.children].forEach((li, i) => { tm.push(setTimeout(() => { if (!ol.isConnected) return; li.style.opacity = 1; UI.anim(li, [{ transform: 'translateX(-1rem)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450 }); }, 700 + i * 1800)); }); };
      const semua = () => { tm.forEach(clearTimeout); [...ol.children].forEach((li) => { li.style.opacity = 1; }); };
      isi.append(el('div', { kelas: 'sd-soal', html: q.tanya }), el('div', { kelas: 'eyebrow' }, 'Langkah penyelesaian'), ol, statis ? null : el('div', { kelas: 'baris', gaya: 'gap:.5rem' }, el('button', { kelas: 'btn kecil sekunder', type: 'button', html: ik('ulang', 'kecil') + 'Ulangi langkah', onclick: tunjuk }), el('button', { kelas: 'btn kecil sekunder', type: 'button', onclick: semua }, 'Tampilkan semua'))); if (!statis) saatTampil(ol, tunjuk);
    }
    if (n === 7) {
      const tf = B.tugasFungsi(g + 1).find((t) => (f === 'poli' ? t.jenis === 'kuadrat' : f === 'eksp' ? t.jenis === 'eksponen' : false)), sit = B.SITUASI.find((x) => x.fam === f), baris = tf ? tf.baris : sit.baris, hx = tf ? 'x' : sit.x, hy = tf ? 'f(x)' : sit.y;
      const tb = el('table', { kelas: 'sd-tabel', html: '<tr><th>' + esc(hx) + '</th>' + baris.map((r) => '<td>' + esc(r[0]) + '</td>').join('') + '</tr><tr><th>' + esc(hy) + '</th>' + baris.map((r) => '<td>' + esc(r[1]) + '</td>').join('') + '</tr>' });
      const gr = grafikTabel(f, tf, sit, statis); isi.classList.add('dua');
      isi.append(el('div', { kelas: 'sd-j-kiri2' }, tf ? el('p', { kelas: 'sd-sub' }, 'Bentuk yang dicari: ', el('span', { html: tf.umum })) : el('p', { kelas: 'sd-sub' }, sit.judul + ': ' + sit.teks), tb, el('ol', { kelas: 'sd-daftar kecil2' }, el('li', null, 'Baca pola tabel: tambah tetap, kali tetap, berulang, atau melompat?'), el('li', null, tf ? tf.jelas : sit.alasan), el('li', null, 'Cocokkan dengan ciri grafik, tulis bentuk umumnya, lalu uji dengan satu titik.'))), el('div', { kelas: 'sd-j-kanan' }, gr.svg));
    }
    if (n === 8) { const gr = el('div', { kelas: 'sd-j-kanan' }, GF.statis(d.varian[d.varian.length - 1], 'var(--t)', 4).svg); isi.classList.add('dua'); isi.append(el('div', { kelas: 'sd-j-kiri2' }, el('div', { kelas: 'eyebrow' }, 'Kesalahan umum'), el('ul', { kelas: 'sd-daftar' }, SALAH[f].map((x) => el('li', null, x))), el('div', { kelas: 'sd-ring' }, el('b', null, 'Ringkasan: '), d.ciri[0] + ' Bentuk umum: ', el('span', { html: d.umum }))), gr); }
    const pb = pembicaraDari(n, ctx);
    root0.append(el('div', { kelas: 'sd-s-kaki' }, el('span', { kelas: 'chip ok' }, 'Bicara: ' + (pb.nama ? pb.nama + ' · ' : '') + PERAN[pb.peran].nama), el('span', { kelas: 'sd-pandu' }, 'Tanya penonton: ' + PANDU[n])));
    return root0;
  }
  root.SidangDek = { slide, NS, PERAN, bagian, alur, JUDUL, fmtW, pembicaraDari, SALAH, saatTampil };
})(window);
