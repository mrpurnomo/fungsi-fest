/* Deck presentasi per jenis fungsi (11 slide): alur tiga peran, grafik beranimasi, slider ciri, dari grafik ke fungsi, dua contoh soal. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, NAMA = B.NAMA_FAM, JENIS = B.JENIS, NS = 11;
  const PERAN = [null,
    { nama: 'Pembuka', slide: [0, 1, 2, 3, 4], ket: 'Mengenalkan nama fungsi, bentuk umum, bentuk grafik, ciri dan perilaku (dengan slider), lalu contoh dalam kehidupan sehari-hari.' },
    { nama: 'Penjelas', slide: [5, 6, 7], ket: 'Menjelaskan cara mengubah grafik menjadi fungsi f(x): bentuk umum, titik-titik pada grafik, dan cara mencarinya lewat dua contoh grafik.' },
    { nama: 'Pemandu Soal', slide: [8, 9, 10], ket: 'Membahas dua contoh soal (hitungan dan dari grafik ke fungsi), lalu memimpin sesi tanya jawab dan memandu soal untuk teman.' }];
  const bagian = (n) => (n <= 4 ? 1 : n <= 7 ? 2 : 3);
  const JUDUL = ['Mengenal fungsinya', 'Bentuk umum', 'Bentuk grafik', 'Ciri dan perilaku', 'Dalam kehidupan sehari-hari', 'Dari grafik ke fungsi: caranya', 'Contoh grafik 1', 'Contoh grafik 2', 'Contoh soal 1: hitungan', 'Contoh soal 2: dari grafik ke fungsi', 'Terima kasih · sesi tanya jawab'];
  const CATATAN = ['Sebutkan nama fungsi dan nama lainnya. Tanyakan dulu: apa yang kalian lihat pada grafik ini?', 'Bacakan bentuk umum. Jelaskan arti tiap huruf dengan kata-kata sendiri.', 'Tunjukkan bentuk grafik tiap contoh. Putar ulang animasi bila perlu.', 'Geser slider pelan-pelan. Jelaskan apa yang berubah pada grafik, lalu sebut cirinya.', 'Beri satu contoh lain dari sekitar kalian.', 'Jelaskan empat langkah: baca titik, masukkan ke bentuk umum, selesaikan, lalu uji.', 'Ikuti animasi langkah demi langkah. Ulangi bagian yang belum jelas.', 'Sama seperti contoh 1. Ajak teman menebak langkah berikutnya.', 'Hitung bersama-sama. Jangan buru-buru ke jawaban.', 'Beri waktu teman berpikir, lalu tekan Tampilkan pembahasan.', 'Ucapkan terima kasih dan buka sesi tanya jawab. Slide boleh dibuka kembali.'];
  const BOBOT = [1, 1.3, 1.5, 2.2, 1.5, 1.7, 2.6, 2.6, 2.4, 2.6, 0.7];
  const fmtW = (s) => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  /* alur bicara: tiap slide dapat peran dan jatah detik dari total durasi presentasi */
  function alur(durasi) { const jml = BOBOT.reduce((a, b) => a + b, 0); let t = 0; return JUDUL.map((j, n) => { const d = Math.max(6, Math.round(durasi * BOBOT[n] / jml)), o = { n, judul: j, peran: bagian(n), detik: d, mulai: t }; t += d; return o; }); }
  const pembicaraDari = (n, ctx) => { const r = bagian(n), a = ctx && ctx.anggota ? ctx.anggota : []; const pr = ctx && ctx.peran ? ctx.peran : {}; const m = a.find((x) => pr[x.idx] === r); return { peran: r, nama: m ? m.nama.split(' ')[0] : '' }; };

  const DR = { poli: 'Domain: semua bilangan real. Range: semua real untuk derajat ganjil; ada batas atas atau bawah untuk derajat genap.', eksp: 'Domain: semua bilangan real. Range: y > 0 (selalu di atas sumbu x).', log: 'Domain: x > 0. Range: semua bilangan real.', trig: 'Sinus dan kosinus: domain semua real, range −1 ≤ y ≤ 1, berulang tiap 360°.', rasional: 'Domain: x ≠ 0. Range: y ≠ 0 (ada garis yang tidak pernah disentuh).', akar: 'Domain: x ≥ 0. Range: y ≥ 0.', mutlak: 'Domain: semua bilangan real. Range: y ≥ 0 (titik terendah di puncak V).', tangga: 'Domain: semua bilangan real. Range: hanya bilangan bulat.', sepotong: 'Domain dan range mengikuti tiap potongan; periksa titik sambungan antar potongan.' };
  const ARTI = { poli: ['<i>a</i><sub><i>n</i></sub>, …, <i>a</i><sub>0</sub>: koefisien (angka pengali)', '<i>n</i>: derajat, yaitu pangkat tertinggi', '<i>a</i><sub>0</sub>: titik potong dengan sumbu y'], eksp: ['<i>a</i>: nilai awal, grafik memotong sumbu y di (0, <i>a</i>)', '<i>b</i>: faktor kali. <i>b</i> &gt; 1 naik, 0 &lt; <i>b</i> &lt; 1 turun', '<i>x</i>: berada di pangkat'], log: ['<i>b</i>: basis (pokok) logaritma', '<i>x</i> harus lebih dari 0', '<sup><i>b</i></sup>log <i>x</i> = pangkat berapa <i>b</i> agar hasilnya <i>x</i>'], trig: ['<i>A</i>: amplitudo, tinggi gelombang', '<i>B</i>: frekuensi, periode = 360° ÷ <i>B</i>', 'sin <i>x</i> berayun antara −1 dan 1'], rasional: ['<i>k</i>: konstanta pembilang', '<i>x</i> ≠ 0 karena penyebut tidak boleh nol', '<i>x</i> · <i>y</i> selalu sama dengan <i>k</i>'], akar: ['<i>a</i>: pengali, makin besar makin curam', '<i>h</i>: titik awal grafik di sumbu x', 'isi akar tidak boleh negatif'], mutlak: ['<i>a</i>: kecuraman kedua sisi huruf V', '<i>h</i>: letak titik puncak V', 'hasil tidak pernah negatif untuk <i>a</i> positif'], tangga: ['pembulatan ke atas: 2,1 menjadi 3', 'tiap rentang nilainya tetap, lalu melompat', 'titik kosong tidak termasuk, titik penuh termasuk'], sepotong: ['tiap rumus hanya berlaku di rentang tertentu', 'periksa batas rentang (≤ atau &lt;)', 'grafik bisa melompat di titik batas'] };

  const ap = (p, ...x) => p.append(...x.flat().filter((y) => y != null && y !== false));
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


  /* ---------------------------------------------------------------- slider ciri dan perilaku (pengganti animasi parameter) */
  function ciriSlider(f, d, statis) {
    const D = PARAM[f], P = Object.assign({}, D.def); let aktif = 0;
    const wrap = el('div', { kelas: 'sd-cs' }), kiri = el('div', { kelas: 'sd-cs-g' }), kanan = el('div', { kelas: 'sd-cs-k' }); wrap.append(kiri, kanan);
    const b = GF.bidang(Object.assign({ W: 640, H: 440 }, D.spec)), gbox = el('div', { kelas: 'sd-cs-svg' }, b.svg); kiri.append(gbox);
    const rum = el('div', { kelas: 'sd-rumus sd-cs-rum' }), ket = el('div', { kelas: 'sd-ap-ket' }), chips = el('div', { kelas: 'sd-ap-chips' });
    const track = el('div', { kelas: 'sd-sl' }), fill = el('div', { kelas: 'sd-sl-f' }), thumb = el('div', { kelas: 'sd-sl-t' }), nilai = el('span', { kelas: 'sd-sl-v' }); track.append(fill, thumb);
    const kur = () => (D.garis ? D.garis(P) : GF.sampel((x) => D.f(x, P), D.spec.xmin, D.spec.xmax, 420, D.spec.ymin, D.spec.ymax));
    function gambar() {
      b.lapis.kurva.innerHTML = ''; const g = kur(); if (g.length && g[0].length) b.kurva(g, { warna: 'var(--t)', tebal: 5.5 }); rum.innerHTML = D.rumus(P);
      const pr = D.par[aktif], r = (P[pr.k] - pr.min) / (pr.max - pr.min); fill.style.width = (r * 100) + '%'; thumb.style.left = (r * 100) + '%'; nilai.textContent = pr.k + ' = ' + fx(P[pr.k]); ket.innerHTML = pr.ket(P[pr.k], P);
      chips.querySelectorAll('button').forEach((c, i) => c.classList.toggle('aktif', i === aktif));
    }
    const setNilai = (v) => { const pr = D.par[aktif]; P[pr.k] = Math.max(pr.min, Math.min(pr.max, v)); gambar(); };
    const dariX = (cx) => { const rc = track.getBoundingClientRect(), r = Math.max(0, Math.min(1, (cx - rc.left) / Math.max(1, rc.width))), pr = D.par[aktif]; setNilai(pr.min + r * (pr.max - pr.min)); };
    D.par.forEach((p, i) => chips.append(el('button', { type: 'button', kelas: 'sd-chip-p', onclick: () => { aktif = i; Object.assign(P, D.def); gambar(); } }, 'Ubah ' + p.k)));
    let tarik = false; track.addEventListener('pointerdown', (e) => { tarik = true; try { track.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } dariX(e.clientX); e.preventDefault(); }); track.addEventListener('pointermove', (e) => { if (tarik) dariX(e.clientX); }); const lepas = () => { tarik = false; }; track.addEventListener('pointerup', lepas); track.addEventListener('pointercancel', lepas);
    const langkah = (dl) => { const pr = D.par[aktif]; setNilai(P[pr.k] + dl * (pr.max - pr.min) / 20); };
    const baris = el('div', { kelas: 'sd-sl-baris' }, el('button', { kelas: 'btn kecil sekunder', type: 'button', 'aria-label': 'Kurangi', onclick: () => langkah(-1) }, '−'), track, el('button', { kelas: 'btn kecil sekunder', type: 'button', 'aria-label': 'Tambah', onclick: () => langkah(1) }, '+'), nilai);
    kiri.append(rum, chips, baris);
    kanan.append(el('div', { kelas: 'eyebrow' }, 'Ciri grafik'), el('ul', { kelas: 'sd-daftar' }, d.ciri.map((x) => el('li', null, x)), el('li', { gaya: 'color:var(--td);font-weight:700' }, DR[f])), el('div', { kelas: 'eyebrow' }, 'Geser slider, lihat perubahannya'), ket);
    gambar(); return wrap;
  }

  /* ---------------------------------------------------------------- grafik beranimasi bentuk umum (varian bisa dipilih) */
  function grafikVarian(f, d, statis) {
    const wrap = el('div', { kelas: 'sd-g2' }), area = el('div', { kelas: 'sd-g2-area' }), kap = el('div', { kelas: 'sd-g2-kap' }), kendali = el('div', { kelas: 'sd-g2-ctl' }); wrap.append(area, kap, kendali);
    let sekarang = 0; const tampil = (i) => { sekarang = i; area.innerHTML = ''; const v = d.varian[i]; kap.innerHTML = '<span class="mat">' + v.rumus + '</span><span class="muted"> · ' + esc(v.nama) + '</span>'; kendali.querySelectorAll('button.v').forEach((x, k) => x.classList.toggle('aktif', k === i));
      if (statis) { area.append(statisI(v, 'var(--t)', 5).svg); return; } const r = varianI(v, 'var(--t)'); area.append(r.b.svg); saatTampil(area, () => GF.gambarKurva(r.kurva, 1700).then(() => r.b.svg.querySelectorAll('.tk').forEach((c) => c.setAttribute('opacity', 1))).catch(() => {})); };
    if (d.varian.length > 1) d.varian.forEach((v, i) => kendali.append(el('button', { type: 'button', kelas: 'v sd-chip-p', onclick: () => tampil(i) }, v.nama.split('·')[0].trim()))); if (!statis) kendali.append(el('button', { type: 'button', kelas: 'btn kecil sekunder', html: ik('ulang', 'kecil') + 'Putar ulang', onclick: () => tampil(sekarang) }));
    tampil(0); return wrap;
  }

  /* ---------------------------------------------------------------- contoh dari grafik ke fungsi: 27 contoh (9 jenis x 3) */
  const fk = (n) => String(Math.round(n * 100) / 100).replace('-', '−').replace('.', ',');
  const TT = (x, y) => '(' + fk(x) + ', ' + fk(y) + ')';
  const H = (t) => '<b class="sdhl">' + t + '</b>';
  function tiks(a, b, n) { const r = b - a, raw = r / n, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p, st = (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p, o = []; for (let v = Math.ceil(a / st) * st; v <= b + 1e-9; v += st) o.push(Math.round(v / st) * st); return o; }
  const spek = (xr, yr) => ({ xmin: xr[0], xmax: xr[1], ymin: yr[0], ymax: yr[1], xt: tiksInt(xr[0], xr[1]), yt: tiksInt(yr[0], yr[1]) });
  const kunci = (ex) => ex;
  const EXF = {
    poli: (v) => { const [a, c, x2] = [[1, -4, 2], [-2, 8, 2], [2, -3, 1]][v], xr = [[-4, 4], [-3, 3], [-3, 3]][v], yr = [[-6, 12], [-12, 10], [-5, 16]][v], fn = (x) => a * x * x + c, y2 = fn(x2), rum = F0 + (a === 1 ? '' : fk(a)) + I('x') + '<sup>2</sup> ' + (c < 0 ? '− ' + fk(-c) : '+ ' + fk(c));
      return { umum: F0 + H('a') + I('x') + '<sup>2</sup> + ' + H('c'), rumus: rum, spec: spek(xr, yr), garis: () => GF.sampel(fn, xr[0], xr[1], 320, yr[0], yr[1]), titik: [[0, c], [x2, y2]], cek: [-x2, y2], langkah: [
        { t: 'Grafik ini berbentuk lengkung (parabola). Bentuk umumnya ' + F0 + H('a') + I('x') + '<sup>2</sup> + ' + H('c') + '. Kita cari ' + H('a') + ' dan ' + H('c') + ' dari titik pada grafik.' },
        { t: 'Titik ' + TT(0, c) + ': saat ' + I('x') + ' = 0, suku ' + I('ax') + '² menjadi 0, jadi ' + I('y') + ' = ' + I('c') + '. Maka ' + H('c = ' + fk(c)) + '.', p: [0] },
        { t: 'Titik ' + TT(x2, y2) + ': ' + fk(y2) + ' = ' + I('a') + ' · ' + x2 + '² + (' + fk(c) + ') → ' + fk(x2 * x2) + I('a') + ' = ' + fk(y2 - c) + ' → ' + H('a = ' + fk(a)) + '.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji titik ' + TT(-x2, y2) + ': ' + fk(a) + ' · (' + fk(-x2) + ')² ' + (c < 0 ? '− ' + fk(-c) : '+ ' + fk(c)) + ' = ' + fk(y2) + '. Cocok, titiknya ada di grafik!', cek: true }] }; },
    eksp: (v) => { const [a, b, xr, yr] = [[2, 3, [-2, 3], [-2, 20]], [4, 0.5, [-2, 4], [-1, 18]], [3, 2, [-2, 4], [-2, 26]]][v], fn = (x) => a * Math.pow(b, x), rum = F0 + fk(a) + ' · ' + fk(b) + '<sup>' + I('x') + '</sup>', xc = v === 2 ? 3 : 2;
      return { umum: F0 + H('a') + ' · ' + H('b') + '<sup>' + I('x') + '</sup>', rumus: rum, spec: spek(xr, yr), garis: () => GF.sampel(fn, xr[0], xr[1], 320, yr[0], yr[1]), titik: [[0, a], [1, a * b]], cek: [xc, fn(xc)], langkah: [
        { t: 'Grafik naik atau turun mendekati sumbu x: ciri eksponensial. Bentuk umumnya ' + F0 + H('a') + ' · ' + H('b') + '<sup>' + I('x') + '</sup>. Kita cari ' + H('a') + ' dan ' + H('b') + '.' },
        { t: 'Titik ' + TT(0, a) + ': saat ' + I('x') + ' = 0, ' + I('b') + '<sup>0</sup> = 1, jadi ' + I('y') + ' = ' + I('a') + '. Maka ' + H('a = ' + fk(a)) + '.', p: [0] },
        { t: 'Titik ' + TT(1, a * b) + ': ' + fk(a * b) + ' = ' + fk(a) + ' · ' + I('b') + '<sup>1</sup> → ' + I('b') + ' = ' + fk(a * b) + ' ÷ ' + fk(a) + ' = ' + H(fk(b)) + '.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji ' + I('x') + ' = ' + xc + ': ' + fk(a) + ' · ' + fk(b) + '<sup>' + xc + '</sup> = ' + fk(fn(xc)) + '. Titik ' + TT(xc, fn(xc)) + ' ada di grafik. Cocok!', cek: true }] }; },
    log: (v) => { const [bs, xr, yr] = [[2, [0, 9], [-3, 4]], [3, [0, 10], [-3, 3]], [4, [0, 17], [-3, 3]]][v], fn = (x) => Math.log(x) / Math.log(bs), rum = F0 + '<sup>' + bs + '</sup>log ' + I('x');
      return { umum: F0 + '<sup>' + H('b') + '</sup>log ' + I('x'), rumus: rum, spec: spek(xr, yr), garis: () => GF.sampel(fn, Math.max(0.02, xr[0]), xr[1], 400, yr[0], yr[1]), titik: [[bs, 1], [bs * bs, 2]], cek: [1, 0], langkah: [
        { t: 'Grafik naik makin landai dan hanya ada untuk ' + I('x') + ' &gt; 0: ciri logaritma. Bentuk umumnya ' + F0 + '<sup>' + H('b') + '</sup>log ' + I('x') + '. Kita cari basis ' + H('b') + '.' },
        { t: 'Titik ' + TT(bs, 1) + ': <sup>' + I('b') + '</sup>log ' + bs + ' = 1 artinya ' + I('b') + '<sup>1</sup> = ' + bs + '. Maka ' + H('b = ' + bs) + '.', p: [0] },
        { t: 'Titik ' + TT(bs * bs, 2) + ': <sup>' + I('b') + '</sup>log ' + (bs * bs) + ' = 2 artinya ' + I('b') + '² = ' + (bs * bs) + ', jadi ' + I('b') + ' = ' + bs + '. Cocok dengan titik pertama.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji ' + I('x') + ' = 1: <sup>' + bs + '</sup>log 1 = 0 (logaritma dari 1 selalu 0). Titik ' + TT(1, 0) + ' ada di grafik. Cocok!', cek: true }] }; },
    trig: (v) => { const [A, Bf] = [[2, 1], [3, 2], [1, 3]][v], xp = 90 / Bf, fn = (x) => A * Math.sin(Bf * x * Math.PI / 180), rum = F0 + fk(A) + ' sin (' + fk(Bf) + I('x') + ')', yr = [-(A + 1), A + 1];
      return { umum: F0 + H('A') + ' sin (' + H('B') + I('x') + ')', rumus: rum, spec: Object.assign(spek([0, 360], yr), { xt: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360] }), garis: () => GF.sampel(fn, 0, 360, 720, yr[0] - 1, yr[1] + 1), titik: [[xp, A], [3 * xp, -A]], cek: [2 * xp, 0], langkah: [
        { t: 'Grafik berayun naik turun dan berulang: ciri trigonometri. Bentuk umumnya ' + F0 + H('A') + ' sin (' + H('B') + I('x') + '). Kita cari amplitudo ' + H('A') + ' dan frekuensi ' + H('B') + '.' },
        { t: 'Puncak tertinggi di ' + TT(xp, A) + '. Tinggi puncak sama dengan amplitudo. Maka ' + H('A = ' + fk(A)) + '. Lembah di ' + TT(3 * xp, -A) + ' cocok: nilainya −' + fk(A) + '.', p: [0, 1] },
        { t: 'Puncak pertama di ' + I('x') + ' = ' + fk(xp) + '. Pada ' + I('A') + ' sin(' + I('Bx') + '), puncak pertama ada di ' + I('x') + ' = 90 ÷ ' + I('B') + '. Jadi 90 ÷ ' + I('B') + ' = ' + fk(xp) + ' → ' + H('B = ' + fk(Bf)) + '.', p: [0] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji ' + I('x') + ' = ' + fk(2 * xp) + ': sin(' + fk(Bf) + ' · ' + fk(2 * xp) + '°) = sin 180° = 0. Titik ' + TT(2 * xp, 0) + ' ada di grafik. Cocok!', cek: true }] }; },
    rasional: (v) => { const [k, p1, p2, c, xr, yr] = [[6, [2, 3], [3, 2], [6, 1], [-8, 8], [-8, 8]], [-4, [2, -2], [4, -1], [1, -4], [-6, 6], [-6, 6]], [8, [2, 4], [4, 2], [8, 1], [-10, 10], [-10, 10]]][v], fn = (x) => k / x, rum = F0 + fk(k) + ' ÷ ' + I('x');
      return { umum: F0 + H('k') + ' ÷ ' + I('x'), rumus: rum, spec: spek(xr, yr), garis: () => GF.sampel(fn, xr[0], xr[1], 800, yr[0], yr[1]), titik: [p1, p2], cek: c, langkah: [
        { t: 'Grafik terdiri dari dua cabang yang mendekati sumbu: ciri rasional. Bentuk umumnya ' + F0 + H('k') + ' ÷ ' + I('x') + '. Kita cari ' + H('k') + '.' },
        { t: 'Titik ' + TT(p1[0], p1[1]) + ': ' + I('x') + ' · ' + I('y') + ' = ' + p1[0] + ' · (' + fk(p1[1]) + ') = ' + fk(p1[0] * p1[1]) + '.', p: [0] },
        { t: 'Titik ' + TT(p2[0], p2[1]) + ': ' + p2[0] + ' · (' + fk(p2[1]) + ') = ' + fk(p2[0] * p2[1]) + '. Hasil kali selalu sama, itulah ' + H('k = ' + fk(k)) + '.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji ' + I('x') + ' = ' + c[0] + ': ' + fk(k) + ' ÷ ' + c[0] + ' = ' + fk(fn(c[0])) + '. Titik ' + TT(c[0], c[1]) + ' ada di grafik. Cocok!', cek: true }] }; },
    akar: (v) => { const [a, p1, p2, c, xr, yr] = [[2, [1, 2], [4, 4], [9, 6], [-1, 10], [-1, 8]], [3, [1, 3], [4, 6], [9, 9], [-1, 10], [-1, 11]], [1, [4, 2], [9, 3], [16, 4], [-1, 18], [-1, 6]]][v], fn = (x) => a * Math.sqrt(x), rum = F0 + (a === 1 ? '' : fk(a)) + '√' + I('x');
      return { umum: F0 + H('a') + '√' + I('x'), rumus: rum, spec: spek(xr, yr), garis: () => GF.sampel(fn, 0, xr[1], 400, yr[0], yr[1]), titik: [p1, p2], cek: c, langkah: [
        { t: 'Grafik berawal dari satu titik lalu naik makin landai: ciri fungsi akar. Bentuk umumnya ' + F0 + H('a') + '√' + I('x') + '. Kita cari ' + H('a') + '.' },
        { t: 'Titik ' + TT(p1[0], p1[1]) + ': ' + fk(p1[1]) + ' = ' + I('a') + ' · √' + p1[0] + ' = ' + I('a') + ' · ' + fk(Math.sqrt(p1[0])) + ' → ' + I('a') + ' = ' + fk(p1[1] / Math.sqrt(p1[0])) + '.', p: [0] },
        { t: 'Titik ' + TT(p2[0], p2[1]) + ': ' + fk(p2[1]) + ' = ' + I('a') + ' · √' + p2[0] + ' = ' + I('a') + ' · ' + fk(Math.sqrt(p2[0])) + ' → ' + H('a = ' + fk(a)) + '. Konsisten dengan titik pertama.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji ' + I('x') + ' = ' + c[0] + ': ' + (a === 1 ? '' : fk(a) + ' · ') + '√' + c[0] + ' = ' + fk(fn(c[0])) + '. Titik ' + TT(c[0], c[1]) + ' ada di grafik. Cocok!', cek: true }] }; },
    mutlak: (v) => { const [a, h, xr, yr] = [[1, 2, [-3, 7], [-1, 6]], [1, -1, [-5, 4], [-1, 6]], [2, 1, [-3, 5], [-1, 9]]][v], fn = (x) => a * Math.abs(x - h), x2 = h + 2, y2 = fn(x2), rum = F0 + (a === 1 ? '' : fk(a)) + '|' + I('x') + (h < 0 ? ' + ' + fk(-h) : ' − ' + fk(h)) + '|';
      return { umum: F0 + H('a') + '|' + I('x') + ' − ' + H('h') + '|', rumus: rum, spec: spek(xr, yr), garis: () => [GF.sampel(fn, xr[0], xr[1], 200, yr[0] - 5, yr[1] + 5)[0]], titik: [[h, 0], [x2, y2]], cek: [h - 2, y2], langkah: [
        { t: 'Grafik berbentuk huruf V dan tidak pernah di bawah sumbu x: ciri nilai mutlak. Bentuk umumnya ' + F0 + H('a') + '|' + I('x') + ' − ' + H('h') + '|. Kita cari ' + H('h') + ' dan ' + H('a') + '.' },
        { t: 'Titik puncak V di ' + TT(h, 0) + '. Letak puncak menunjukkan ' + I('x') + ' = ' + I('h') + '. Maka ' + H('h = ' + fk(h)) + '.', p: [0] },
        { t: 'Titik ' + TT(x2, y2) + ': ' + fk(y2) + ' = ' + I('a') + ' · |' + fk(x2) + ' − (' + fk(h) + ')| = ' + I('a') + ' · ' + fk(Math.abs(x2 - h)) + ' → ' + H('a = ' + fk(a)) + '.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji titik simetris ' + TT(h - 2, y2) + ': ' + fk(a) + ' · |' + fk(h - 2) + ' − (' + fk(h) + ')| = ' + fk(y2) + '. Cocok, grafik simetris!', cek: true }] }; },
    tangga: (v) => { const s = [2, 3, 1][v], yr = [0, 4 * s + 1], xr = [0, 4]; const garis = () => { const g = []; for (let k = 1; k <= 4; k++) g.push([[k - 1, s * k], [k, s * k]]); return g; }, rum = F0 + (s === 1 ? '' : fk(s) + ' × ') + 'pembulatan ke atas ' + I('x');
      return { umum: F0 + H('s') + ' × pembulatan ke atas ' + I('x'), rumus: rum, spec: Object.assign(spek(xr, yr), { xt: [0, 1, 2, 3, 4] }), garis, titik: [[0.5, s], [1.5, 2 * s]], cek: [2.5, 3 * s], langkah: [
        { t: 'Grafik berbentuk anak tangga: ada lompatan lalu mendatar. Bentuk umumnya ' + F0 + H('s') + ' × pembulatan ke atas ' + I('x') + '. Kita cari tinggi tiap anak tangga ' + H('s') + '.' },
        { t: 'Untuk 0 &lt; ' + I('x') + ' ≤ 1 (misal ' + I('x') + ' = 0,5) nilai ' + I('y') + ' = ' + fk(s) + '. Pembulatan ke atas 0,5 adalah 1, jadi ' + I('s') + ' × 1 = ' + fk(s) + '. Maka ' + H('s = ' + fk(s)) + '.', p: [0] },
        { t: 'Untuk 1 &lt; ' + I('x') + ' ≤ 2 (misal ' + I('x') + ' = 1,5) nilai ' + I('y') + ' = ' + fk(2 * s) + ' = ' + fk(s) + ' × 2. Tiap naik satu anak tangga, ' + I('y') + ' bertambah ' + fk(s) + '.', p: [1] },
        { t: 'Gabungkan: ' + H(rum) + '.', akhir: true },
        { t: 'Uji ' + I('x') + ' = 2,5: pembulatan ke atas 2,5 adalah 3, jadi ' + fk(s) + ' × 3 = ' + fk(3 * s) + '. Titik ' + TT(2.5, 3 * s) + ' ada di grafik. Cocok!', cek: true }] }; },
    sepotong: (v) => { const D3 = [{ c: 2, f1: (x) => x, f2: (x) => 2 * x - 2, t1: [[1, 1]], t2: [[3, 4], [4, 6]], r1: 'x', r2: '2x − 2', m2: 2, k2: -2, p1txt: 'Potongan pertama melalui ' + TT(0, 0) + ' dan ' + TT(1, 1) + ': kemiringan 1, rumusnya ' + H('y = x') + '.', yr: [-1, 8], xr: [0, 5] }, { c: 3, f1: (x) => 2 * x, f2: (x) => x + 3, t1: [[1, 2], [2, 4]], t2: [[4, 7], [5, 8]], r1: '2x', r2: 'x + 3', m2: 1, k2: 3, p1txt: 'Potongan pertama melalui ' + TT(1, 2) + ' dan ' + TT(2, 4) + ': kemiringan (4 − 2) ÷ (2 − 1) = 2, melalui titik asal, rumusnya ' + H('y = 2x') + '.', yr: [-1, 10], xr: [0, 6] }, { c: 2, f1: (x) => x + 1, f2: () => 3, t1: [[0, 1], [1, 2]], t2: [[3, 3], [4, 3]], r1: 'x + 1', r2: '3', m2: 0, k2: 3, p1txt: 'Potongan pertama melalui ' + TT(0, 1) + ' dan ' + TT(1, 2) + ': kemiringan 1, memotong sumbu y di 1, rumusnya ' + H('y = x + 1') + '.', yr: [-1, 5], xr: [0, 6] }][v];
      const { c, f1, f2, xr, yr } = D3, rum = F0 + '{ ' + D3.r1 + ' jika ' + I('x') + ' &lt; ' + c + ' ;  ' + D3.r2 + ' jika ' + I('x') + ' ≥ ' + c + ' }', tt = D3.t1.concat(D3.t2);
      return { umum: F0 + '{ ' + H('rumus 1') + ' jika ' + I('x') + ' &lt; ' + H('c') + ' ;  ' + H('rumus 2') + ' jika ' + I('x') + ' ≥ ' + H('c') + ' }', rumus: rum, spec: spek(xr, yr), garis: () => [[[xr[0], f1(xr[0])], [c, f1(c)]], [[c, f2(c)], [xr[1], f2(xr[1])]]], titik: tt, cek: [c, f2(c)], langkah: [
        { t: 'Grafik terdiri dari dua potongan garis yang berbeda: ciri sepotong-sepotong. Kita cari rumus tiap potongan dan titik pergantiannya ' + H('c') + '.' },
        { t: D3.p1txt, p: D3.t1.map((q, i) => i) },
        { t: 'Potongan kedua melalui ' + TT(D3.t2[0][0], D3.t2[0][1]) + ' dan ' + TT(D3.t2[1][0], D3.t2[1][1]) + ': kemiringan ' + fk(D3.m2) + '. Masukkan titik pertama: ' + fk(D3.t2[0][1]) + ' = ' + fk(D3.m2) + ' · ' + D3.t2[0][0] + ' + ' + I('k') + ' → ' + I('k') + ' = ' + fk(D3.k2) + '. Rumusnya ' + H('y = ' + D3.r2) + '.', p: D3.t2.map((q, i) => D3.t1.length + i) },
        { t: 'Gabungkan dengan batas pergantian ' + H('c = ' + c) + ': ' + H(rum) + '.', akhir: true },
        { t: 'Uji di ' + I('x') + ' = ' + c + ': rumus kedua memberi ' + fk(f2(c)) + '. Titik ' + TT(c, f2(c)) + ' ada di grafik dan kedua potongan tersambung. Cocok!', cek: true }] }; }
  };
  const contoh = (f, v) => EXF[f](v);

  /* skala sumbu: setiap bilangan bulat berlabel bila memungkinkan (interval 1), rentang besar memakai interval lebih lebar */
  function IV(v) { const s = v.spec; if (!s || v.__iv) return v; const o = Object.assign({}, v, { __iv: 1, spec: Object.assign({}, s, { xt: tiksInt(s.xmin, s.xmax), yt: tiksInt(s.ymin, s.ymax) }) }); return o; }
  function statisI(v, ...a) { return GF.statis(IV(v), ...a); }
  function varianI(v, ...a) { return GF.gambarVarian(IV(v), ...a); }
  function tiksInt(a, b) { const r = b - a, st = r <= 16 ? 1 : r <= 32 ? 2 : r <= 80 ? 5 : r <= 160 ? 10 : 30, o = []; for (let v = Math.ceil(a / st - 1e-9) * st; v <= b + 1e-9; v += st) o.push(Math.round(v * 100) / 100); return o; }
  Object.keys(PARAM).forEach((k) => { const sp = PARAM[k].spec; sp.xt = k === 'trig' ? [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360] : tiksInt(sp.xmin, sp.xmax); sp.yt = tiksInt(sp.ymin, sp.ymax); });
  /* grafik soal sidang (dipakai layar soal penyaji dan penonton) */
  function garisFam(fam, p, xr, yr) {
    const fn = (x) => B.FN_G[fam](p, x);
    if (fam === 'tangga') { const g = []; for (let k = 1; k <= 8; k++) g.push([[k - 1, p.s * k], [k, p.s * k]]); return g.filter((s) => s[0][0] < xr[1]); }
    if (fam === 'sepotong') return [[[xr[0], fn(xr[0])], [p.c - 1e-6, fn(p.c - 1e-6)]], [[p.c, fn(p.c)], [xr[1], fn(xr[1])]]];
    if (fam === 'log') return GF.sampel(fn, Math.max(0.02, xr[0]), xr[1], 500, yr[0], yr[1]);
    if (fam === 'akar') return GF.sampel(fn, 0, xr[1], 400, yr[0], yr[1]);
    return GF.sampel(fn, xr[0], xr[1], fam === 'trig' ? 720 : 500, yr[0] - 2, yr[1] + 2);
  }
  function soalGrafik(gr, opsi) {
    opsi = opsi || {}; const fam = gr.fam, p = gr.p, sp = Object.assign(spek(p.xr, p.yr), fam === 'trig' ? { xt: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360] } : {}), b = GF.bidang(Object.assign({ W: 640, H: 440 }, sp));
    const g = garisFam(fam, p, p.xr, p.yr); if (g.length && g[0].length) b.kurva(g, { warna: 'var(--t)', tebal: 5 });
    (p.t || []).forEach((q) => { b.lapis.titik.append(GF.S('circle', { cx: b.sx(q[0]), cy: b.sy(q[1]), r: 9, fill: '#1E1B4B', stroke: '#fff', 'stroke-width': 3 })); b.lapis.titik.append(GF.S('text', { x: b.sx(q[0]) + 12, y: b.sy(q[1]) - 12, 'font-size': 18, 'font-weight': 700, fill: '#1E1B4B', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, TT(q[0], q[1]))); });
    return b.svg;
  }

  /* ---------------------------------------------------------------- langkah besar bertahap (pembahasan soal hitungan) */
  function langkahBesar(teks, opsi) {
    opsi = opsi || {}; const N = teks.length, wrap = el('div', { kelas: 'sd-lb' }), kartu = el('div', { kelas: 'sd-lb-k' }), dots = el('div', { kelas: 'sd-fx-dots' }), ctl = el('div', { kelas: 'sd-lb-c' }); let i = 0, sibuk = false;
    const sorot = (t) => t.replace(/(−?\d[\d.,]*)/g, '<span class="ang">$1</span>');
    const tampil = async (baru, arah) => { if (sibuk) return; sibuk = true; try { if (kartu.firstChild && arah) await UI.anim(kartu, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(' + (-arah * 3) + 'rem)' }], { duration: 220 }); i = baru; kartu.innerHTML = '<span class="no">Langkah ' + (i + 1) + ' dari ' + N + '</span><div class="isi">' + sorot(teks[i]) + '</div>'; if (arah) await UI.anim(kartu, [{ opacity: 0, transform: 'translateX(' + (arah * 3) + 'rem)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 300 }); } finally { sibuk = false; kontrol(); } };
    const kontrol = () => { dots.innerHTML = ''; for (let k = 0; k < N; k++) dots.append(el('span', { kelas: 'dt' + (k === i ? ' now' : (k < i ? ' isi' : '')) })); ctl.innerHTML = ''; ap(ctl, el('button', { kelas: 'btn sekunder', type: 'button', disabled: sibuk || i === 0, html: ik('kembali', 'kecil') + 'Sebelumnya', onclick: () => tampil(i - 1, -1) }), el('button', { kelas: 'btn', type: 'button', disabled: sibuk || i >= N - 1, html: 'Berikutnya' + ik('panah', 'kecil'), onclick: () => tampil(i + 1, 1) }), opsi.tutup ? el('button', { kelas: 'btn sekunder kecil', type: 'button', onclick: opsi.tutup }, 'Tutup pembahasan') : null); };
    wrap.append(kartu, dots, ctl); tampil(0, 0); return wrap;
  }

  /* ---------------------------------------------------------------- mesin dari grafik ke fungsi: manual, mundur = animasi kebalikan */
  function mesin(ex, opsi) {
    opsi = opsi || {}; const statis = !!opsi.statis, N = ex.langkah.length, wrap = el('div', { kelas: 'sd-fx' }), kiri = el('div', { kelas: 'sd-fx-g' }), kanan = el('div', { kelas: 'sd-fx-k' }); wrap.append(kiri, kanan);
    const zoomBox = el('div', { kelas: 'sd-fx-zoom' }), b = GF.bidang(Object.assign({ W: 640, H: 440 }, ex.spec)), svg = b.svg; zoomBox.append(svg); kiri.append(zoomBox);
    const ov = GF.S('g', { class: 'ov' }); svg.append(ov); b.kurva(ex.garis(), { warna: 'var(--t)', tebal: 5.2 });
    const umum = el('div', { kelas: 'sd-fx-umum' }, el('span', null, 'Bentuk umum'), el('div', { kelas: 'mat', html: ex.umum })), hasil = el('div', { kelas: 'sd-fx-hasil' }, el('span', null, 'Fungsi yang dicari'), el('div', { kelas: 'mat', html: F0 + '?' })), narasi = el('div', { kelas: 'sd-fx-narasi' }), dots = el('div', { kelas: 'sd-fx-dots' }), ctl = el('div', { kelas: 'sd-fx-ctl' });
    kanan.append(umum, hasil, narasi, dots); if (!statis) kanan.append(ctl);
    let tk = UI.token(), langkah = 0, sibuk = false, cur = null; const rekam = Array.from({ length: N }, () => []), simpanHasil = {}; const pt = (i) => (i === 'cek' ? ex.cek : ex.titik[i]); const sx = (x) => b.sx(x), sy = (y) => b.sy(y); const rek = (n) => { if (cur) cur.push(n); return n; };
    const pulsa = async (x, y, an, kali) => { if (!an) return; const c = GF.S('circle', { cx: sx(x), cy: sy(y), r: 12, fill: 'none', stroke: '#FF8A1F', 'stroke-width': 4 }); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; ov.append(c); try { await tk.anim(c, [{ transform: 'scale(.8)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 700, iterations: kali || 1 }); } finally { c.remove(); } };
    const titikDot = async (x, y, an, warna) => { const c = rek(GF.S('circle', { cx: sx(x), cy: sy(y), r: 9, fill: warna || '#1E1B4B', stroke: '#fff', 'stroke-width': 3 })); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; ov.append(c); if (an) await tk.anim(c, [{ transform: 'scale(.1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 450 }); };
    const garis = async (x1, y1, x2, y2, warna, an) => { const L = rek(GF.S('line', { x1: sx(x1), y1: sy(y1), x2: sx(x2), y2: sy(y2), stroke: warna, 'stroke-width': 3.2, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round' })); ov.append(L); if (an) await GF.tumbuh(L, sx(x1), sy(y1), sx(x2), sy(y2), 480, tk); };
    const teks = async (x, y, t, warna, an, dx, dy, anchor) => { const tx = rek(GF.S('text', { x: sx(x) + (dx || 0), y: sy(y) + (dy || 0), 'font-size': 18, 'font-weight': 700, fill: warna, 'text-anchor': anchor || 'start', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, t)); ov.append(tx); if (an) { tx.setAttribute('opacity', 0); await tk.anim(tx, [{ opacity: 0 }, { opacity: 1 }], { duration: 260 }); tx.setAttribute('opacity', 1); } };
    const x0a = ex.spec.xmin > 0 ? ex.spec.xmin : 0, y0a = ex.spec.ymin > 0 ? ex.spec.ymin : 0;
    const proyeksi = async (x, y, an) => { await garis(x, y, x, y0a, '#FF8A1F', an); await garis(x, y, x0a, y, '#12B886', an); await teks(x, y0a, fk(x), '#C2570A', an, 0, 34, 'middle'); await teks(x0a, y, fk(y), '#0C8F69', an, -10, 6, 'end'); await teks(x, y, TT(x, y), '#1E1B4B', an, 12, -14); };
    const zoom = async (xs, ys, an, skala) => { const cx = xs.reduce((a, c) => a + c, 0) / xs.length, cy = ys.reduce((a, c) => a + c, 0) / ys.length; svg.style.transformOrigin = (sx(cx) / 640 * 100) + '% ' + (sy(cy) / 440 * 100) + '%'; if (an) await tk.anim(svg, [{ transform: 'scale(1)' }, { transform: 'scale(' + (skala || 1.55) + ')' }], { duration: 650 }); else svg.style.transform = 'scale(' + (skala || 1.55) + ')'; };
    const keluarZoom = async (an) => { if (an) await tk.anim(svg, [{ transform: svg.style.transform || 'scale(1.55)' }, { transform: 'scale(1)' }], { duration: 600 }); svg.getAnimations().forEach((x) => x.cancel()); svg.style.transform = ''; };
    const idxTitik = (L) => (L.cek ? ['cek'] : (L.p || []));
    async function maju(i, an) {
      const L = ex.langkah[i]; cur = rekam[i] = []; const idx = idxTitik(L), xs = idx.map((k) => pt(k)[0]), ys = idx.map((k) => pt(k)[1]);
      if (idx.length) { await zoom(xs, ys, an, idx.length > 1 ? 1.3 : 1.55); for (const k of idx) { const [x, y] = pt(k); await titikDot(x, y, an, L.cek ? '#12B886' : undefined); await pulsa(x, y, an, 1); await proyeksi(x, y, an); } if (an) await tk.tidur(700); await keluarZoom(an); }
      if (L.akhir) { simpanHasil[i] = hasil.querySelector('.mat').innerHTML; hasil.classList.add('benar'); hasil.querySelector('.mat').innerHTML = ex.rumus; if (an) await tk.anim(hasil, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 650 }); }
      cur = null;
    }
    async function mundur(i, an) {
      const L = ex.langkah[i], idx = idxTitik(L), xs = idx.map((k) => pt(k)[0]), ys = idx.map((k) => pt(k)[1]), nodes = (rekam[i] || []).slice();
      if (an && idx.length) await zoom(xs, ys, an, idx.length > 1 ? 1.3 : 1.55);
      for (let k = nodes.length - 1; k >= 0; k--) { if (an) { try { await tk.anim(nodes[k], [{ opacity: 1 }, { opacity: 0 }], { duration: 170 }); } catch (e) { if (e instanceof UI.Batal) throw e; } } nodes[k].remove(); }
      rekam[i] = []; if (L.akhir) { hasil.classList.remove('benar'); if (an) await tk.anim(hasil, [{ opacity: 1 }, { opacity: .2 }, { opacity: 1 }], { duration: 400 }); hasil.querySelector('.mat').innerHTML = simpanHasil[i] || (F0 + '?'); }
      if (an && idx.length) await keluarZoom(an);
    }
    const setNarasi = async (n, an) => { const isi = '<span class="fd-n">Langkah ' + (n + 1) + ' dari ' + N + '</span>' + ex.langkah[n].t; if (an) { try { await UI.anim(narasi, [{ opacity: 1 }, { opacity: 0 }], { duration: 160 }); } catch (e) { /* abaikan */ } } narasi.innerHTML = isi; if (an) UI.anim(narasi, [{ opacity: 0, transform: 'translateY(.6rem)' }, { opacity: 1, transform: 'none' }], { duration: 300 }); };
    const dotBar = () => { dots.innerHTML = ''; for (let i = 0; i < N; i++) dots.append(el('span', { kelas: 'dt' + (i === langkah ? ' now' : (i < langkah ? ' isi' : '')) })); };
    const kontrol = () => { ctl.innerHTML = ''; ap(ctl, el('button', { kelas: 'btn sekunder', type: 'button', disabled: sibuk || langkah <= 0, html: ik('kembali', 'kecil') + 'Mundur', onclick: () => pindah(-1) }), el('button', { kelas: 'btn', type: 'button', disabled: sibuk || langkah >= N - 1, html: 'Maju' + ik('panah', 'kecil'), onclick: () => pindah(1) }), el('button', { kelas: 'btn kecil sekunder', type: 'button', disabled: sibuk || langkah <= 0, html: ik('ulang', 'kecil') + 'Ulangi langkah', onclick: () => ulangi() }), el('button', { kelas: 'btn kecil sekunder', type: 'button', disabled: sibuk || langkah <= 0, onclick: () => keAwal() }, 'Ke awal'), opsi.tutup ? el('button', { kelas: 'btn kecil sekunder', type: 'button', onclick: opsi.tutup }, 'Tutup pembahasan') : null); dotBar(); };
    async function jalankan(fn) { if (sibuk) return; tk.stop(); tk = UI.token(); sibuk = true; kontrol(); try { await fn(); } catch (e) { if (!(e instanceof UI.Batal)) throw e; } finally { UI.instan = false; sibuk = false; cur = null; if (wrap.isConnected) kontrol(); } }
    const pindah = (arah) => jalankan(async () => { if (arah > 0 && langkah < N - 1) { langkah++; await setNarasi(langkah, true); await maju(langkah, true); } else if (arah < 0 && langkah > 0) { await mundur(langkah, true); langkah--; await setNarasi(langkah, true); } });
    const ulangi = () => jalankan(async () => { await mundur(langkah, false); await maju(langkah, true); });
    const keAwal = () => jalankan(async () => { UI.instan = true; for (let i = langkah; i >= 1; i--) await mundur(i, false); UI.instan = false; langkah = 0; await setNarasi(0, true); });
    if (statis) { b.lapis.kurva; ex.titik.forEach((q) => { ov.append(GF.S('circle', { cx: sx(q[0]), cy: sy(q[1]), r: 8, fill: '#1E1B4B', stroke: '#fff', 'stroke-width': 3 })); }); hasil.classList.add('benar'); hasil.querySelector('.mat').innerHTML = ex.rumus; narasi.innerHTML = '<ol>' + ex.langkah.map((L) => '<li>' + L.t + '</li>').join('') + '</ol>'; return wrap; }
    if (opsi.soal) {
      ex.titik.forEach((q) => { ov.append(GF.S('circle', { cx: sx(q[0]), cy: sy(q[1]), r: 9, fill: '#1E1B4B', stroke: '#fff', 'stroke-width': 3 })); ov.append(GF.S('text', { x: sx(q[0]) + 12, y: sy(q[1]) - 12, 'font-size': 18, 'font-weight': 700, fill: '#1E1B4B', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, TT(q[0], q[1]))); });
      const buka = () => { ov.innerHTML = ''; ctl.classList.remove('soal'); narasi.classList.remove('soal'); setNarasi(0, false); kontrol(); }; ctl.classList.add('soal'); narasi.classList.add('soal');
      narasi.innerHTML = '<span class="fd-n">Giliranmu</span><b>Tentukan fungsi f(x) dari grafik ini.</b><br>Pembahas boleh mencoret-coret dulu. Setelah selesai, buka pembahasannya.'; ap(ctl, el('button', { kelas: 'btn besar sorot', type: 'button', html: ik('main') + 'Buka pembahasan', onclick: buka })); return wrap;
    }
    setNarasi(0, false); kontrol(); return wrap;
  }

  /* peta cara: empat langkah baca titik -> bentuk umum -> selesaikan -> uji */
  function petaCara(f, statis) {
    const ex = contoh(f, 0), wrap = el('div', { kelas: 'sd-fx' }), kiri = el('div', { kelas: 'sd-fx-g' }), kanan = el('div', { kelas: 'sd-fx-k' }); wrap.append(kiri, kanan);
    const zb = el('div', { kelas: 'sd-fx-zoom' }), b = GF.bidang(Object.assign({ W: 640, H: 440 }, ex.spec)); b.kurva(ex.garis(), { warna: 'var(--t)', tebal: 5 }); const ov = GF.S('g', { class: 'ov' }); b.svg.append(ov); zb.append(b.svg); kiri.append(zb);
    const dot = ex.titik.map((q) => { const c = GF.S('circle', { cx: b.sx(q[0]), cy: b.sy(q[1]), r: 9, fill: '#1E1B4B', stroke: '#fff', 'stroke-width': 3, opacity: statis ? 1 : 0 }); ov.append(c); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; ov.append(GF.S('text', { x: b.sx(q[0]) + 12, y: b.sy(q[1]) - 12, 'font-size': 18, 'font-weight': 700, fill: '#1E1B4B', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4, opacity: statis ? 1 : 0 }, TT(q[0], q[1]))); return c; });
    const L = [['Baca titik penting', 'Cari titik yang jelas terbaca pada grafik, misalnya titik potong sumbu atau titik puncak.'], ['Masukkan ke bentuk umum', 'Ganti ' + I('x') + ' dan ' + I('y') + ' pada bentuk umum dengan angka dari titik itu.'], ['Selesaikan parameter', 'Dari persamaan yang terbentuk, hitung huruf yang belum diketahui satu per satu.'], ['Uji dengan titik lain', 'Pastikan fungsi yang ditemukan juga melewati titik lain pada grafik.']];
    const daf = el('div', { kelas: 'sd-cara' }, L.map((x, i) => el('div', { kelas: 'sd-cara-i', gaya: statis ? '' : 'opacity:0' }, el('i', null, String(i + 1)), el('div', null, el('b', null, x[0]), el('div', { kelas: 'muted', html: x[1] })))));
    kanan.append(el('div', { kelas: 'sd-fx-umum' }, el('span', null, 'Contoh bentuk umum'), el('div', { kelas: 'mat', html: ex.umum })), daf);
    if (!statis) saatTampil(wrap, async () => { const items = [...daf.children]; for (let i = 0; i < items.length; i++) { await new Promise((r) => setTimeout(r, 700)); if (!wrap.isConnected) return; items[i].style.opacity = 1; UI.anim(items[i], [{ transform: 'translateX(-1rem)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450 }); if (i === 0) { b.svg.querySelectorAll('.ov text').forEach((t) => t.setAttribute('opacity', 1)); dot.forEach((c) => { c.setAttribute('opacity', 1); UI.anim(c, [{ transform: 'scale(.2)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 500 }); }); } } });
    return wrap;
  }

  /* ---------------------------------------------------------------- slide */
  function slide(g, n, ctx) {
    ctx = ctx || {}; const f = JENIS[g], d = GF.K[f], statis = !!ctx.statis, root0 = el('div', { kelas: 'sd-slide fx-' + f + ' pr' + bagian(n) + ' s' + n });
    const pb = pembicaraDari(n, ctx), pill = el('div', { kelas: 'sd-bicara r' + pb.peran }, el('span', { kelas: 'sd-bicara-d' }), el('div', null, el('small', null, 'Sekarang bicara'), el('b', null, pb.nama || ('Peran ' + PERAN[pb.peran].nama))), el('em', null, PERAN[pb.peran].nama));
    root0.append(el('div', { kelas: 'sd-s-top' }, el('div', { kelas: 'sd-s-judul' }, el('span', { kelas: 'sd-s-chip', html: UI.glif(f) + 'Kelompok ' + (g + 1) + ' · ' + NAMA[f] }), el('h2', null, JUDUL[n])), statis ? null : pill, statis ? null : el('span', { kelas: 'sd-s-timer' }), el('span', { kelas: 'sd-s-no' }, (n + 1) + ' / ' + NS)));
    const isi = el('div', { kelas: 'sd-s-isi' }); root0.append(isi);
    if (n === 0) {
      isi.classList.add('judul2'); const kir = el('div', { kelas: 'sd-j-kiri' }, el('div', { html: UI.ubin(f), kelas: 'sd-ubin sd-denyut' }), el('h1', null, NAMA[f]), el('div', { kelas: 'sd-alias' }, d.alias.map((x) => el('span', { kelas: 'chip' }, x))), el('div', { kelas: 'sd-sub' }, 'Presentasi Kelompok ' + (g + 1)));
      const gr = el('div', { kelas: 'sd-j-kanan' }); const v = d.varian[0], rr = statis ? { b: statisI(v, 'var(--t)', 5) } : varianI(v, 'var(--t)'); gr.append(rr.b.svg); if (!statis) saatTampil(gr, () => GF.gambarKurva(rr.kurva, 2000).then(() => rr.b.svg.querySelectorAll('.tk').forEach((c) => c.setAttribute('opacity', 1))).catch(() => {})); isi.append(kir, gr);
    }
    if (n === 1) isi.append(el('div', { kelas: 'sd-rumus besar' + (statis ? '' : ' sd-muncul'), html: d.umum }), el('div', { kelas: 'sd-sub' }, 'Contoh: ', el('span', { kelas: 'sd-rumus kecil', html: d.varian[0].rumus })), el('div', { kelas: 'sd-arti' }, ARTI[f].map((x, i) => el('div', { kelas: 'sd-arti-k', gaya: statis ? '' : 'animation:sdmuncul .5s ' + (0.5 + i * 0.5) + 's both' }, el('i', null, String(i + 1)), el('div', { html: x })))));
    if (n === 2) isi.append(grafikVarian(f, d, statis));
    if (n === 3) isi.append(ciriSlider(f, d, statis));
    if (n === 4) { const v = d.varian[0], gr = el('div', { kelas: 'sd-j-kanan' }, statisI(v, 'var(--t)', 5).svg); isi.classList.add('dua'); isi.append(el('div', { kelas: 'sd-kartu-daftar' }, d.konteks.map((x, i) => el('div', { kelas: 'sd-kd', gaya: statis ? '' : 'animation:sdmuncul .5s ' + (0.2 + i * 0.6) + 's both' }, el('i', null, String(i + 1)), el('div', null, x)))), gr); }
    if (n === 5) isi.append(petaCara(f, statis));
    if (n === 6) isi.append(mesin(contoh(f, 0), { statis }));
    if (n === 7) isi.append(mesin(contoh(f, 1), { statis }));
    if (n === 8) {
      const q = B.tantanganAcak(f, B.seedContoh(g)), langkah = q.jelas.split(/(?<=[.!?])\s+/).filter(Boolean);
      if (statis) { isi.append(el('div', { kelas: 'sd-soal', html: q.tanya }), el('ol', { kelas: 'sd-langkah-ol' }, langkah.map((t) => el('li', null, t)))); }
      else {
        const wrapSoal = el('div', { kelas: 'sd-soalbox' }), kartu = el('div', { kelas: 'sd-soal besar', html: q.tanya }), aksi = el('div', { kelas: 'sd-soal-aksi' });
        const buka = () => { wrapSoal.innerHTML = ''; wrapSoal.append(el('div', { kelas: 'sd-soal kecil', html: q.tanya }), langkahBesar(langkah, { tutup: tutup })); }, tutup = () => { wrapSoal.innerHTML = ''; wrapSoal.append(kartu, aksi); };
        aksi.append(el('div', { kelas: 'sd-soal-ket' }, 'Pembahas boleh mencoret-coret untuk menghitung dulu. Setelah selesai, buka pembahasan.'), el('button', { kelas: 'btn besar sorot', type: 'button', html: ik('main') + 'Buka pembahasan', onclick: buka })); wrapSoal.append(kartu, aksi); isi.append(wrapSoal);
      }
    }
    if (n === 9) isi.append(mesin(contoh(f, 2), { statis, soal: !statis }));
    if (n === 10) { isi.classList.add('judul2'); isi.append(el('div', { kelas: 'sd-j-kiri' }, el('div', { html: UI.ubin(f), kelas: 'sd-ubin sd-denyut' }), el('h1', null, 'Terima kasih!'), el('div', { kelas: 'sd-sub' }, 'Silakan bertanya atau memberi saran.'), statis ? null : el('div', { kelas: 'sd-slot-aksi' })), el('div', { kelas: 'sd-j-kanan' }, statisI(d.varian[d.varian.length - 1], 'var(--t)', 5).svg)); }
    root0.append(el('div', { kelas: 'sd-s-kaki' }, el('div', { kelas: 'sd-kaki-kiri' }), el('div', { kelas: 'sd-prog' }, Array.from({ length: NS }, (_, i) => el('button', { type: 'button', kelas: i === n ? 'on' : (i < n ? 'isi' : ''), 'data-n': i, 'aria-label': 'Slide ' + (i + 1) }))), el('div', { kelas: 'sd-kaki-kanan' })));
    return root0;
  }
  const contohStatis = (f, v) => mesin(contoh(f, v), { statis: true });
  root.SidangDek = { slide, NS, PERAN, bagian, alur, JUDUL, CATATAN, fmtW, pembicaraDari, saatTampil, soalGrafik, contoh, contohStatis, ARTI, DR, mesin };
})(window);
