/* Kode bersama (peramban + server): daftar kelas, soal tes awal acak per siswa, kode hasil 5 karakter, pembentukan kelompok. */
(function (root) {
  'use strict';
  const KELAS = 'XI-F Soshum';
  const DAFTAR = ['AGASTYA DWI PRASETYA', 'ANDI YASMIN SYAURAH DIMITRI', 'AURELLYA AZ ZAHRA MAKARIM', 'BRILIANDHIKA KHAIRUNAS NATAGUNA', 'DHAFIN RIZQI ABDILLAH', 'DZAKIRA ESTA FAHIMA AZARIA', 'EVAN FABIAN', 'FIDYA ALIFA DEMETERY ABDULLAH', 'JHONSON LEONARD NADAEK', 'JIHAN RAMEYZA ALYA', 'KEYSHA EFITA YASMIN', 'KHAIRUNNISA AL-ZAHWA', 'LUNETTA ADZRA PANPILA', 'MUHAMMAD DANISH ALFAIZHA', 'MUHAMMAD FAKHRI IQBAL ZUHAIR', 'MUHAMMAD IRSYAD IHSANI', 'NABILA CYRA RAMADHANI', 'NABILA KHALISHAH SETIAWAN', 'NAURA DZAKIYYATURROHMAH', 'RAISYA ABIDAH SYAIFULLAH', 'RESKI ADITIYA IBRAHIM', 'SUCI KANAYA DIFKA', 'SYAKIIRA JESSENIA', 'YOSEFA GABRIELA'];
  const judulKata = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  const DUMMY = 24;                    // akun uji coba guru (tidak masuk kelompok dan statistik)
const PIN_GURU = '30594';
const DAFTAR_G = ['AFRA ATIQAH BALQIS', 'AMINAH', 'ANDI ALMAHYRA ZOYA TENRI AJENG', 'AURELFA SAFWA ANNORA NAAZHEEN', 'CHESTA ADABI DESAINI', 'DHINI RAHMADHANI ISMAIL PUTRI', 'DHIYA NABILAH RAHMAN', 'GABY MARCELLINA BAKARA', 'KANIA ALMIRA RUSDI', 'MAHERA GHANIYA HISYAM', 'MUHAMMAD NAUFAL ATHAYA RAMADHAN', 'MUHAMMAD TAUFIQURRAHMAN', 'MUHAMMAD YANISKO APRIALDI', 'NAYLA RAFA NABILA', 'NAYMA FAKHIRA ARDIFA', 'NAYSYILA PUTRI RABANI', 'RAIHAN FARELLIO', 'RAISSYA DAMAYANTI ATHA TSANIAH', 'SILAH MAHARANI PUTRI', 'SOFIE SASIKIRANA', 'SULMI IKHWAN KHAIRI', 'TSALTSA ANIN NURHUMAIRA', 'ZAHIRAH ALYA MUKHBITA YUCHA', 'ZUFAIRA QONITA MAZAYA'];
  /* pengaturan per kelas: XI-F (kelompok otomatis dari tes) dan XI-G (kelompok disusun guru, 9 kelompok, pakar satu jenis per kelompok) */
  const KELAS_CFG = {
    xif: { kode: 'xif', nama: 'XI-F Soshum', daftar: DAFTAR, durasi: 600, manual: false, langkah: 4, jmlKelompok: 4 },
    xig: { kode: 'xig', nama: 'XI-G', daftar: DAFTAR_G, durasi: 300, manual: true, langkah: 6, jmlKelompok: 9 }
  };
  let AKTIF = 'xif';
  const cfg = (k) => KELAS_CFG[k || AKTIF] || KELAS_CFG.xif;
  const setKelas = (k) => { if (KELAS_CFG[k]) AKTIF = k; return cfg(); };
  const nama = (i, k) => (i === DUMMY ? 'Siswa Uji Coba (Guru)' : judulKata(cfg(k).daftar[i]));
  const durasi = (k) => cfg(k).durasi;
  const DURASI = 600;      // detik (XI-F)
  const JUMLAH_SOAL = 5, KELOMPOK = 4, MAKS_ANGGOTA = 6;

  /* ---------- acak berbenih ---------- */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rint = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const acak = (r, arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const mn = (n) => String(n).replace('-', '−');
  const suku = (n) => (n < 0 ? '− ' + Math.abs(n) : '+ ' + n);
  const fLin = (a, b) => a + 'x ' + suku(b);

  /* ---------- soal: lima butir, tingkat kesulitan sama, parameter berbeda per siswa ---------- */
  function ambilOpsi(kunci, kandidat, fmt) {
    const set = []; [kunci].concat(kandidat).forEach((v) => { if (!set.some((x) => String(x) === String(v))) set.push(v); });
    let k = 1; while (set.length < 5) { const v = typeof kunci === 'number' ? kunci + (k % 2 ? k : -k) * 2 : kunci + k; if (!set.some((x) => String(x) === String(v))) set.push(v); k++; }
    return set.slice(0, 5).map(fmt || String);
  }
  function soalSiswa(idx) {
    const r = mulberry(7000 + idx * 7919), S = [];
    // 1. nilai fungsi linear
    { const a = rint(r, 2, 6), b = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6][rint(r, 0, 11)], c = rint(r, 2, 5), kunci = a * c + b;
      const o = ambilOpsi(kunci, [a * c - b, a + c + b, (a + b) * c, a * c, c * b + a], mn);
      S.push({ tanya: 'Diketahui fungsi <i>f</i>(<i>x</i>) = ' + fLin(a, b).replace('x', '<i>x</i>') + '. Nilai <i>f</i>(' + c + ') adalah …', opsi: o, kunci: mn(kunci), jelas: 'Ganti x dengan ' + c + ': f(' + c + ') = ' + a + '(' + c + ') ' + suku(b) + ' = ' + a * c + ' ' + suku(b) + ' = ' + kunci + '.' }); }
    // 2. nilai fungsi kuadrat dengan x negatif
    { const k = rint(r, 2, 9), mm = rint(r, 2, 5), kunci = mm * mm - k;
      const o = ambilOpsi(kunci, [-(mm * mm) - k, mm * mm + k, -mm - k, 2 * mm - k, mm - k], mn);
      S.push({ tanya: 'Diketahui fungsi <i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> − ' + k + '. Nilai <i>f</i>(−' + mm + ') adalah …', opsi: o, kunci: mn(kunci), jelas: 'Ganti x dengan −' + mm + ': f(−' + mm + ') = (−' + mm + ')² − ' + k + ' = ' + mm * mm + ' − ' + k + ' = ' + kunci + '. Ingat: (−' + mm + ')² = ' + mm * mm + ' (bukan −' + mm * mm + ').' }); }
    // 3. titik koordinat pada grafik
    { const p = rint(r, 2, 5), q = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5][rint(r, 0, 9)], x = [-3, -2, -1, 1, 2, 3][rint(r, 0, 5)], y = p * x + q, P = (u, v) => '(' + mn(u) + ', ' + mn(v) + ')';
      const kand = [P(y, x), P(x, p * x - q), P(x, p + x + q), P(p * x, q), P(x, y + 2), P(x, y - 3), P(-x, y), P(x + 1, y)]; const kunci = P(x, y); const set = [kunci]; kand.forEach((v) => { if (!set.includes(v)) set.push(v); });
      S.push({ tanya: 'Diketahui <i>f</i>(<i>x</i>) = ' + fLin(p, q).replace('x', '<i>x</i>') + '. Titik pada grafik fungsi untuk <i>x</i> = ' + mn(x) + ' adalah …', opsi: set.slice(0, 5), kunci, jelas: 'Titik ditulis (x, y). x = ' + mn(x) + ', y = f(' + mn(x) + ') = ' + p + '(' + mn(x) + ') ' + suku(q) + ' = ' + mn(y) + '. Jadi titiknya ' + kunci + '.' }); }
    // 4. sumbu mendatar (domain) dan sumbu tegak (kodomain)
    { const V = [['Pada grafik fungsi, nilai masukan <i>x</i> digambar pada …', 0], ['Pada grafik fungsi, nilai keluaran <i>f</i>(<i>x</i>) atau <i>y</i> digambar pada …', 1], ['Tarif parkir bergantung pada lama parkir. Jika lama parkir adalah <i>x</i>, maka lama parkir digambar pada …', 0], ['Tinggi tanaman bergantung pada umurnya. Jika tinggi tanaman adalah <i>y</i>, maka tinggi tanaman digambar pada …', 1]][rint(r, 0, 3)];
      const OP = ['sumbu mendatar (sumbu X)', 'sumbu tegak (sumbu Y)', 'titik asal (0, 0)', 'garis putus-putus penuntun', 'garis yang menghubungkan titik-titik'];
      S.push({ tanya: V[0], opsi: OP.slice(), kunci: OP[V[1]], jelas: 'Nilai masukan x (disebut domain) digambar pada sumbu mendatar. Nilai keluaran y (disebut kodomain) digambar pada sumbu tegak.' }); }
    // 5. bentuk grafik
    { const OP = ['garis lurus', 'melengkung seperti huruf U (parabola)', 'berulang seperti gelombang', 'berbentuk huruf V (patah)', 'berbentuk anak tangga'];
      if (r() < .5) { const a = rint(r, 2, 6), b = rint(r, 1, 7) * (r() < .5 ? -1 : 1); S.push({ tanya: 'Grafik fungsi <i>f</i>(<i>x</i>) = ' + fLin(a, b).replace('x', '<i>x</i>') + ' berbentuk …', opsi: OP.slice(), kunci: OP[0], jelas: 'Fungsi yang berbentuk ax + b disebut fungsi linear. Grafiknya garis lurus.' }); }
      else { const k = rint(r, 1, 9); S.push({ tanya: 'Grafik fungsi <i>f</i>(<i>x</i>) = <i>x</i><sup>2</sup> − ' + k + ' berbentuk …', opsi: OP.slice(), kunci: OP[1], jelas: 'Fungsi yang memuat x² disebut fungsi kuadrat. Grafiknya melengkung seperti huruf U (parabola).' }); } }
    return S.map((s, i) => { const rr = mulberry(31 + idx * 101 + i * 17); const urut = (i === 3 || i === 4) ? acak(rr, s.opsi.map((_, k) => k)) : acak(rr, s.opsi.map((_, k) => k)); const opsi = urut.map((k) => s.opsi[k]); return { no: i + 1, tanya: s.tanya, opsi, kunci: opsi.indexOf(s.kunci), jelas: s.jelas }; });
  }
  function nilai(idx, jawab) { const so = soalSiswa(idx), hasil = so.map((s, i) => ({ no: i + 1, pilih: jawab[i] == null || jawab[i] === 5 ? null : jawab[i], benar: jawab[i] === s.kunci })); return { benar: hasil.filter((h) => h.benar).length, salah: hasil.filter((h) => !h.benar).length, hasil }; }

  /* ---------- kode hasil 5 karakter (4 data + 1 cek), alfabet tanpa 0 O 1 I ---------- */
  const ALFA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  function buatKode(idx, jawab) { let a = 0, kali = 1; for (let i = 0; i < 5; i++) { const v = jawab[i] == null ? 5 : jawab[i]; a += v * kali; kali *= 6; } let n = idx + 25 * a, s = ''; for (let i = 0; i < 4; i++) { s = ALFA[n % 32] + s; n = Math.floor(n / 32); } let c = 0; for (let i = 0; i < 4; i++) c += (ALFA.indexOf(s[i]) + 1) * (2 * i + 3); return s + ALFA[c % 32]; }
  function bacaKode(kode) {
    const k = String(kode || '').toUpperCase().replace(/[^A-Z2-9]/g, ''); if (k.length !== 5) return { error: 'Kode harus 5 karakter' };
    let c = 0, n = 0; for (let i = 0; i < 4; i++) { const p = ALFA.indexOf(k[i]); if (p < 0) return { error: 'Karakter kode tidak dikenali' }; c += (p + 1) * (2 * i + 3); n = n * 32 + p; }
    if (ALFA[c % 32] !== k[4]) return { error: 'Kode salah ketik (karakter terakhir tidak cocok)' };
    const idx = n % 25; let a = Math.floor(n / 25); if (a >= 7776) return { error: 'Kode tidak valid' };
    const jawab = []; for (let i = 0; i < 5; i++) { const v = a % 6; jawab.push(v === 5 ? null : v); a = Math.floor(a / 6); }
    return { idx, jawab, kode: k };
  }

  /* ---------- kelompok heterogen: 4 kelompok, maks 6 anggota ---------- */
  function bentukKelompok(selesai) {
    const urut = selesai.slice().sort((a, b) => (b.skor - a.skor) || (a.idx - b.idx)), kel = Array.from({ length: KELOMPOK }, () => []), pola = []; for (let i = 0; i < 12; i++) pola.push(...[0, 1, 2, 3, 3, 2, 1, 0]);
    urut.forEach((s, i) => kel[pola[i]].push({ idx: s.idx, skor: s.skor })); return kel;
  }
  function tambahKelompok(kel, s) {
    const rata = (g) => (g.length ? g.reduce((a, b) => a + b.skor, 0) / g.length : 0), semua = kel.flat(), rataAll = semua.length ? semua.reduce((a, b) => a + b.skor, 0) / semua.length : s.skor;
    const buka = kel.map((g, i) => ({ g, i })).filter((x) => x.g.length < MAKS_ANGGOTA); if (!buka.length) return -1;
    const min = Math.min(...buka.map((x) => x.g.length)), kand = buka.filter((x) => x.g.length === min);
    kand.sort((a, b) => (s.skor >= rataAll ? rata(a.g) - rata(b.g) : rata(b.g) - rata(a.g))); const pilih = kand[0].i; kel[pilih].push({ idx: s.idx, skor: s.skor }); return pilih;
  }


  /* ================= TAHAP LANJUTAN: pakar berpasangan ================= */
  const SET = [['poli', 'eksp', 'log'], ['trig', 'rasional', 'akar'], ['mutlak', 'tangga', 'sepotong']];
  const NAMA_FAM = { poli: 'Polinomial', eksp: 'Eksponensial', log: 'Logaritma', trig: 'Trigonometri', rasional: 'Rasional', akar: 'Akar', mutlak: 'Nilai Mutlak', tangga: 'Tangga', sepotong: 'Sepotong-sepotong' };
  /* pos = urutan siswa dalam kelompok (0..), n = jumlah anggota. Tiga himpunan keluarga dibagi ke semua pasangan. */
  function bagianPasangan(pos, n) { const k = Math.max(1, Math.ceil(n / 2)), pas = Math.min(k - 1, Math.floor(pos / 2)), fam = []; SET.forEach((h, j) => { if (j % k === pas) fam.push(...h); }); return { pasangan: pas, jumlahPasangan: k, keluarga: fam, huruf: 'ABC'[pas] }; }
  const TANTANGAN = {
    poli: { tanya: 'Karton dilipat menjadi kotak tanpa tutup. Volume kotak (cm³) adalah <i>V</i>(<i>x</i>) = <i>x</i>(12 − 2<i>x</i>)<sup>2</sup>, dengan <i>x</i> = tinggi lipatan (cm). Berapa volume kotak jika tinggi lipatannya 2 cm?', kunci: 128, jelas: 'Ganti x dengan 2: V(2) = 2 × (12 − 4)² = 2 × 8² = 2 × 64 = 128 cm³. Setelah dijabarkan, pangkat tertingginya 3, jadi ini fungsi polinomial (derajat 3): grafiknya mulus dan melengkung.' },
    eksp: { tanya: 'Pengikut sebuah akun menjadi dua kali lipat setiap minggu: <i>P</i>(<i>t</i>) = 500 × 2<sup><i>t</i></sup>, dengan <i>t</i> = minggu ke-. Berapa pengikut pada minggu ke-3?', kunci: 4000, jelas: '2³ = 2 × 2 × 2 = 8, jadi P(3) = 500 × 8 = 4.000. Peubah t berada di pangkat. Itulah ciri fungsi eksponensial: naik makin lama makin cepat.' },
    log: { tanya: 'Kepuasan pembeli donat dirumuskan <i>K</i>(<i>q</i>) = 10 × <sup>2</sup>log <i>q</i>, dengan <i>q</i> = isi kotak. Berapa kepuasan untuk kotak berisi 8 buah?', kunci: 30, jelas: '²log 8 menanyakan: 2 dipangkatkan berapa agar hasilnya 8? Jawabannya 3, karena 2³ = 8. Jadi K(8) = 10 × 3 = 30. Logaritma cocok untuk “makin banyak, tambahannya makin kecil”.' },
    trig: { tanya: 'Tinggi gelombang di pantai (meter) adalah <i>h</i>(<i>x</i>) = 2 sin <i>x</i>, dengan <i>x</i> dalam derajat. Berapa tinggi gelombang saat <i>x</i> = 90?', kunci: 2, jelas: 'sin 90° = 1, jadi h = 2 × 1 = 2 meter. Sinus berayun naik turun dan berulang, cocok untuk gelombang dan pasang surut.' },
    rasional: { tanya: 'Patungan sewa bus Rp600.000. Iuran tiap orang (ribu rupiah) adalah <i>I</i>(<i>n</i>) = 600 ÷ <i>n</i>, dengan <i>n</i> = banyak peserta. Berapa iuran jika 20 orang ikut?', kunci: 30, jelas: '600 ÷ 20 = 30, jadi Rp30.000 per orang. Peubah n ada di penyebut: ciri fungsi rasional. Makin banyak peserta, iuran makin kecil tetapi tidak pernah nol.' },
    akar: { tanya: 'Lahan berbentuk persegi seluas <i>L</i> m² memiliki panjang sisi <i>s</i>(<i>L</i>) = √<i>L</i> meter. Berapa panjang sisi lahan seluas 49 m²?', kunci: 7, jelas: '√49 = 7 karena 7 × 7 = 49. Fungsi akar naik makin landai: luas 4 kali lipat, sisinya hanya 2 kali lipat.' },
    mutlak: { tanya: 'Harga acuan sebuah barang Rp50.000. Selisih harga adalah <i>d</i>(<i>p</i>) = |<i>p</i> − 50| (ribu rupiah). Berapa selisihnya jika harga di toko Rp35.000 (<i>p</i> = 35)?', kunci: 15, jelas: '|35 − 50| = |−15| = 15. Nilai mutlak tidak pernah negatif, jadi lebih murah maupun lebih mahal sama-sama dihitung sebagai selisih.' },
    tangga: { tanya: 'Tarif parkir motor: Rp3.000 untuk jam pertama, lalu Rp2.000 tiap jam berikutnya atau sebagiannya. Dengan rumus <i>T</i>(<i>t</i>) = 1 + 2 × (<i>t</i> dibulatkan ke atas) ribu rupiah, berapa tarif parkir 2,5 jam?', kunci: 7, jelas: '2,5 dibulatkan ke atas menjadi 3, jadi T = 1 + 2 × 3 = 7 ribu. Pembulatan ke atas membuat tarif naik dalam anak tangga.' },
    sepotong: { tanya: 'Tarif air (ribu rupiah): 3<i>x</i> jika pemakaian <i>x</i> ≤ 10 m³, dan 30 + 5(<i>x</i> − 10) jika <i>x</i> &gt; 10 m³. Berapa biaya pemakaian 14 m³?', kunci: 50, jelas: 'x = 14 lebih dari 10, jadi pakai rumus kedua: 30 + 5(14 − 10) = 30 + 20 = 50 ribu. Dua rumus berbeda dipakai pada rentang berbeda: itulah fungsi sepotong-sepotong.' }
  };
  const SITUASI = [
    { fam: 'poli', judul: 'Kotak dari karton', teks: 'Selembar karton dilipat membentuk kotak. Volume kotak bergantung pada tinggi lipatan: mula-mula naik, mencapai puncak, lalu turun lagi.', x: 'tinggi lipatan (cm)', y: 'volume (cm³)', baris: [[1, 100], [2, 128], [3, 108], [4, 64]] },
    { fam: 'eksp', judul: 'Pengikut akun', teks: 'Jumlah pengikut sebuah akun menjadi dua kali lipat setiap minggu.', x: 'minggu ke-', y: 'pengikut', baris: [[0, 500], [1, '1.000'], [2, '2.000'], [3, '4.000']] },
    { fam: 'log', judul: 'Kepuasan pembeli donat', teks: 'Isi kotak donat dilipatduakan, kepuasan hanya bertambah 10 poin. Makin banyak, pertambahannya makin kecil.', x: 'isi kotak', y: 'kepuasan', baris: [[1, 0], [2, 10], [4, 20], [8, 30]] },
    { fam: 'trig', judul: 'Wisatawan musiman', teks: 'Jumlah wisatawan di pantai naik turun mengikuti musim dan pola yang sama berulang setiap 12 bulan.', x: 'bulan ke-', y: 'wisatawan', baris: [[0, '2.000'], [2, '2.500'], [4, '3.500'], [6, '4.000'], [8, '3.500'], [10, '2.500'], [12, '2.000']] },
    { fam: 'rasional', judul: 'Patungan sewa bus', teks: 'Biaya bus Rp600.000 dibagi rata. Makin banyak peserta, iuran tiap orang makin kecil tetapi tidak pernah nol.', x: 'peserta', y: 'iuran (ribu)', baris: [[2, 300], [4, 150], [10, 60], [24, 25]] },
    { fam: 'akar', judul: 'Lahan persegi', teks: 'Panjang sisi lahan persegi adalah akar dari luasnya. Luas 4 kali lipat, sisi hanya 2 kali lipat.', x: 'luas (m²)', y: 'sisi (m)', baris: [[1, 1], [4, 2], [25, 5], [100, 10]] },
    { fam: 'mutlak', judul: 'Selisih dari harga acuan', teks: 'Selisih harga barang dari harga acuan Rp50.000, tanpa peduli lebih mahal atau lebih murah.', x: 'harga (ribu)', y: 'selisih (ribu)', baris: [[30, 20], [40, 10], [50, 0], [60, 10]] },
    { fam: 'tangga', judul: 'Tarif parkir', teks: 'Rp3.000 untuk 1 jam pertama, lalu Rp2.000 setiap jam berikutnya atau sebagiannya (dibulatkan ke atas).', x: 'lama (jam)', y: 'tarif (ribu)', baris: [['0,5', 3], [1, 3], ['1,5', 5], ['2,5', 7]] },
    { fam: 'sepotong', judul: 'Tagihan air', teks: 'Rp3.000 per m³ untuk 10 m³ pertama, lalu Rp5.000 per m³ untuk pemakaian di atasnya.', x: 'pemakaian (m³)', y: 'tagihan (ribu)', baris: [[5, 15], [10, 30], [15, 55], [20, 80]] }
  ];


  /* soal cerita kartu pakar: aljabar dan angka diacak tiap percobaan */
  const SUPD = '⁰¹²³⁴⁵⁶⁷⁸⁹'; const sp = (n) => String(n).split('').map((c) => SUPD[+c]).join(''); const pil = (r, a) => a[rint(r, 0, a.length - 1)];
  const rb = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  function tantanganAcak(fam, seed) {
    const r = mulberry(seed | 0), t = rint(r, 0, 1);
    if (fam === 'poli') {
      if (t === 0) { const a = pil(r, [12, 14, 16, 18, 20]), x = rint(r, 1, 3), v = x * (a - 2 * x) * (a - 2 * x); return { kunci: v, tanya: 'Karton dilipat menjadi kotak tanpa tutup. Volume kotak (cm³) adalah <i>V</i>(<i>x</i>) = <i>x</i>(' + a + ' − 2<i>x</i>)<sup>2</sup>, dengan <i>x</i> = tinggi lipatan (cm). Berapa volume kotak jika tinggi lipatannya ' + x + ' cm?', jelas: 'Ganti x dengan ' + x + ': V(' + x + ') = ' + x + ' × (' + a + ' − ' + 2 * x + ')² = ' + x + ' × ' + (a - 2 * x) + '² = ' + x + ' × ' + (a - 2 * x) * (a - 2 * x) + ' = ' + v + ' cm³. Jika dijabarkan, pangkat tertingginya 3, jadi ini polinomial derajat 3.' }; }
      const u = pil(r, [20, 30, 40]), tt = rint(r, 1, 3), v = u * tt - 5 * tt * tt; return { kunci: v, tanya: 'Bola dilempar ke atas. Tinggi bola (meter) adalah <i>h</i>(<i>t</i>) = ' + u + '<i>t</i> − 5<i>t</i><sup>2</sup>, dengan <i>t</i> = waktu (detik). Berapa tinggi bola pada detik ke-' + tt + '?', jelas: 'Ganti t dengan ' + tt + ': h(' + tt + ') = ' + u + ' × ' + tt + ' − 5 × ' + tt + '² = ' + u * tt + ' − ' + 5 * tt * tt + ' = ' + v + ' meter. Pangkat tertingginya 2, jadi ini polinomial derajat 2 (parabola).' };
    }
    if (fam === 'eksp') { const b = pil(r, [2, 3]), A = pil(r, [100, 200, 250, 500]), e = b === 2 ? rint(r, 3, 5) : rint(r, 2, 4), v = A * Math.pow(b, e), kata = t === 0 ? ['Pengikut sebuah akun', 'minggu'] : ['Jumlah bakteri', 'jam']; return { kunci: v, tanya: kata[0] + ' menjadi ' + (b === 2 ? 'dua' : 'tiga') + ' kali lipat setiap ' + kata[1] + ': <i>P</i>(<i>t</i>) = ' + A + ' × ' + b + '<sup><i>t</i></sup>, dengan <i>t</i> = ' + kata[1] + ' ke-. Berapa jumlahnya pada ' + kata[1] + ' ke-' + e + '?', jelas: b + sp(e) + ' = ' + Math.pow(b, e) + ', jadi P(' + e + ') = ' + A + ' × ' + Math.pow(b, e) + ' = ' + rb(v) + '. Peubah t berada di pangkat: ciri fungsi eksponensial yang naik makin cepat.' }; }
    if (fam === 'log') { const b = pil(r, [2, 3]), k = b === 2 ? rint(r, 2, 5) : rint(r, 2, 4), q = Math.pow(b, k), c = pil(r, [5, 10, 20]); return { kunci: c * k, tanya: 'Kepuasan pembeli dirumuskan <i>K</i>(<i>q</i>) = ' + c + ' × <sup>' + b + '</sup>log <i>q</i>, dengan <i>q</i> = jumlah barang. Berapa kepuasan untuk ' + q + ' barang?', jelas: sp(b) + 'log ' + q + ' menanyakan: ' + b + ' dipangkatkan berapa agar hasilnya ' + q + '? Jawabannya ' + k + ', karena ' + b + sp(k) + ' = ' + q + '. Jadi K(' + q + ') = ' + c + ' × ' + k + ' = ' + c * k + '.' }; }
    if (fam === 'trig') { const A = pil(r, [2, 4, 6, 8]), x = pil(r, [30, 90, 150, 270]), sv = { 30: 1 / 2, 90: 1, 150: 1 / 2, 270: -1 }[x], v = A * sv; return { kunci: v, tanya: 'Tinggi gelombang di pantai (meter) adalah <i>h</i>(<i>x</i>) = ' + A + ' sin <i>x</i>, dengan <i>x</i> dalam derajat. Berapa tinggi gelombang saat <i>x</i> = ' + x + '?', jelas: 'sin ' + x + '° = ' + (sv === 1 / 2 ? '½' : (sv === 1 ? '1' : '−1')) + ', jadi h = ' + A + ' × ' + (sv === 1 / 2 ? '½' : (sv === 1 ? '1' : '(−1)')) + ' = ' + v + '. Sinus berayun antara −1 dan 1 dan berulang: ciri fungsi trigonometri.' }; }
    if (fam === 'rasional') { const T = pil(r, [240, 360, 480, 600, 720, 1200]), ds = [4, 5, 6, 8, 10, 12, 15, 20, 24, 30, 40].filter((d) => T % d === 0), n = pil(r, ds); return { kunci: T / n, tanya: 'Patungan sewa bus Rp' + rb(T * 1000) + '. Iuran tiap orang (ribu rupiah) adalah <i>I</i>(<i>n</i>) = ' + T + ' ÷ <i>n</i>, dengan <i>n</i> = banyak peserta. Berapa iuran jika ' + n + ' orang ikut?', jelas: T + ' ÷ ' + n + ' = ' + T / n + ', jadi Rp' + rb(T / n * 1000) + ' per orang. Peubah n ada di penyebut: ciri fungsi rasional. Makin banyak peserta, iuran makin kecil.' }; }
    if (fam === 'akar') { if (t === 0) { const L = pil(r, [16, 25, 36, 49, 64, 81, 100, 121, 144]); return { kunci: Math.sqrt(L), tanya: 'Lahan berbentuk persegi seluas <i>L</i> m² memiliki panjang sisi <i>s</i>(<i>L</i>) = √<i>L</i> meter. Berapa panjang sisi lahan seluas ' + L + ' m²?', jelas: '√' + L + ' = ' + Math.sqrt(L) + ' karena ' + Math.sqrt(L) + ' × ' + Math.sqrt(L) + ' = ' + L + '. Fungsi akar naik makin landai.' }; } const k = rint(r, 2, 6), h = 5 * k * k; return { kunci: k, tanya: 'Waktu jatuh benda (detik) dari ketinggian <i>h</i> meter adalah <i>t</i>(<i>h</i>) = √(<i>h</i> ÷ 5). Berapa waktu jatuh dari ketinggian ' + h + ' m?', jelas: h + ' ÷ 5 = ' + k * k + ', lalu √' + k * k + ' = ' + k + ' detik. Fungsi akar naik makin landai.' }; }
    if (fam === 'mutlak') { const c = pil(r, [40, 50, 60, 75]), d = rint(r, 5, 30), p = t === 0 ? c - d : c + d, kata = t === 0 ? ['harga acuan', 'ribu rupiah'] : ['harga acuan', 'ribu rupiah']; return { kunci: d, tanya: 'Harga acuan sebuah barang Rp' + c + '.000. Selisih harga adalah <i>d</i>(<i>p</i>) = |<i>p</i> − ' + c + '| (' + kata[1] + '). Berapa selisihnya jika harga di toko Rp' + p + '.000 (<i>p</i> = ' + p + ')?', jelas: '|' + p + ' − ' + c + '| = |' + (p - c < 0 ? '−' + (c - p) : (p - c)) + '| = ' + d + '. Nilai mutlak tidak pernah negatif, jadi lebih murah maupun lebih mahal sama-sama dihitung sebagai selisih.' }; }
    if (fam === 'tangga') { const a = pil(r, [3, 4, 5]), b = pil(r, [2, 3]), tm = pil(r, [1.5, 2.2, 2.5, 3.1, 3.5]), n = Math.ceil(tm), v = a + b * (n - 1), tk = String(tm).replace('.', ','); return { kunci: v, tanya: 'Tarif parkir: ' + a + ' ribu untuk jam pertama, lalu ' + b + ' ribu tiap jam berikutnya atau sebagiannya. Dengan rumus <i>T</i>(<i>t</i>) = ' + a + ' + ' + b + ' × (<i>t</i> dibulatkan ke atas − 1) ribu rupiah, berapa tarif parkir ' + tk + ' jam?', jelas: tk + ' dibulatkan ke atas menjadi ' + n + ', jadi T = ' + a + ' + ' + b + ' × (' + n + ' − 1) = ' + v + ' ribu. Pembulatan ke atas membuat tarif naik seperti anak tangga.' }; }
    /* sepotong */ { const p1 = pil(r, [2, 3, 4]), p2 = pil(r, [5, 6, 7, 8]), bt = pil(r, [10, 20]), atas = rint(r, 0, 1) === 1, x = atas ? bt + rint(r, 2, 8) : rint(r, 3, bt - 2), v = atas ? p1 * bt + p2 * (x - bt) : p1 * x; return { kunci: v, tanya: 'Tarif air (ribu rupiah): ' + p1 + '<i>x</i> jika pemakaian <i>x</i> ≤ ' + bt + ' m³, dan ' + p1 * bt + ' + ' + p2 + '(<i>x</i> − ' + bt + ') jika <i>x</i> &gt; ' + bt + ' m³. Berapa biaya pemakaian ' + x + ' m³?', jelas: atas ? 'x = ' + x + ' lebih dari ' + bt + ', jadi pakai rumus kedua: ' + p1 * bt + ' + ' + p2 + '(' + x + ' − ' + bt + ') = ' + p1 * bt + ' + ' + p2 * (x - bt) + ' = ' + v + ' ribu. Dua rumus berlaku pada rentang berbeda: fungsi sepotong-sepotong.' : 'x = ' + x + ' tidak lebih dari ' + bt + ', jadi pakai rumus pertama: ' + p1 + ' × ' + x + ' = ' + v + ' ribu. Dua rumus berlaku pada rentang berbeda: fungsi sepotong-sepotong.' }; }
  }

  const ALASAN = {
    poli: 'Volume naik dulu sampai puncak (128 pada 2 cm), lalu turun lagi. Grafiknya melengkung mulus dengan satu “bukit”. Itu ciri polinomial (di sini derajat 3).',
    eksp: 'Tiap minggu dikali 2: 500 → 1.000 → 2.000 → 4.000. Kenaikannya makin besar sehingga grafik makin curam. Itu ciri eksponensial.',
    log: 'Isi dilipatduakan, kepuasan hanya bertambah 10 (0 → 10 → 20 → 30). Naik terus tetapi makin landai: ciri logaritma.',
    trig: 'Naik ke puncak 4.000 di bulan ke-6, turun lagi ke 2.000 di bulan ke-12, lalu mengulang pola yang sama. Pola berulang adalah ciri trigonometri (sinus/kosinus).',
    rasional: 'Hasil kali x dan y selalu 600 (2 × 300, 4 × 150, 10 × 60). Makin banyak peserta, iuran turun tajam lalu landai mendekati nol: ciri rasional.',
    akar: 'Luas 1, 4, 25, 100 menghasilkan sisi 1, 2, 5, 10. Mulai dari titik awal lalu makin landai: ciri fungsi akar.',
    mutlak: 'Selisih 20, 10, 0, 10: turun sampai harga acuan, lalu naik lagi. Bentuk huruf V dan tidak pernah negatif: ciri nilai mutlak.',
    tangga: 'Tarif tetap 3 untuk 0,5 dan 1 jam, lalu naik ke 5 dan 7. Nilainya berubah dengan lompatan dan mendatar di antaranya: ciri fungsi tangga.',
    sepotong: 'Sampai 10 m³ naik 3 tiap m³ (15 → 30), setelah itu naik 5 tiap m³ (30 → 55 → 80). Dua aturan berbeda dalam satu grafik: ciri sepotong-sepotong.'
  };
  SITUASI.forEach((x) => { x.alasan = ALASAN[x.fam]; });
  /* bank diskusi kelompok: konteks sehari-hari lain, ditebak bersama jenis fungsinya */
  const DISKUSI = [
    { fam: 'poli', judul: 'Tendangan bola', konteks: 'Bola ditendang ke atas. Tinggi bola dicatat setiap detik.', x: 'detik ke-', y: 'tinggi (m)', baris: [[0, 0], [1, 5], [2, 8], [3, 9], [4, 8], [5, 5], [6, 0]], alasan: 'Tinggi naik, mencapai puncak (9 m) di detik ke-3, lalu turun simetris. Lintasan bola berbentuk parabola, yaitu polinomial derajat 2.' },
    { fam: 'eksp', judul: 'Tabungan berbunga', konteks: 'Tabungan Rp1.000.000 berbunga 10% per tahun, bunganya ikut berbunga.', x: 'tahun ke-', y: 'saldo (ribu)', baris: [[0, '1.000'], [1, '1.100'], [2, '1.210'], [3, '1.331']], alasan: 'Setiap tahun dikali 1,1: 1.000 → 1.100 → 1.210 → 1.331. Tambahannya makin besar. Pertumbuhan dengan faktor kali yang tetap adalah ciri eksponensial.' },
    { fam: 'log', judul: 'Kerasnya suara', konteks: 'Tingkat kebisingan (desibel) diukur dari bunyi yang makin keras. Setiap bunyi 10 kali lebih kuat, desibel naik sama banyak.', x: 'kekuatan bunyi (kali)', y: 'desibel', baris: [[1, 0], [10, 10], [100, 20], [1000, 30]], alasan: 'Kekuatan dikali 10 membuat desibel hanya bertambah 10. Tambahan tetap untuk kali yang tetap adalah ciri logaritma.' },
    { fam: 'trig', judul: 'Jam sibuk jalan raya', konteks: 'Jumlah kendaraan yang lewat per jam di sebuah jalan, dicatat sepanjang hari. Pola yang sama berulang setiap hari.', x: 'jam ke-', y: 'kendaraan', baris: [[0, 200], [4, 400], [8, 800], [12, 1000], [16, 800], [20, 400], [24, 200]], alasan: 'Naik ke puncak 1000 pada jam ke-12 (siang), turun lagi, dan kembali ke 200 pada jam ke-24: pola berulang tiap 24 jam. Itu ciri trigonometri (periodik).' },
    { fam: 'rasional', judul: 'Waktu perjalanan', konteks: 'Jarak ke kota tujuan 120 km. Waktu tempuh bergantung pada kecepatan kendaraan.', x: 'kecepatan (km/jam)', y: 'waktu (jam)', baris: [[40, 3], [60, 2], [80, '1,5'], [120, 1]], alasan: 'Kecepatan dikali 2 membuat waktu menjadi setengahnya, dan hasil kali x dan y selalu 120. Itu ciri fungsi rasional (kebalikan).' },
    { fam: 'akar', judul: 'Benda jatuh', konteks: 'Sebuah benda dijatuhkan dari ketinggian tertentu. Waktu jatuhnya dicatat.', x: 'tinggi (m)', y: 'waktu (detik)', baris: [[5, 1], [20, 2], [45, 3], [80, 4]], alasan: 'Tinggi 4 kali lipat membuat waktu hanya 2 kali lipat (5 → 20, 1 → 2). Naik makin landai dan berawal dari titik awal: ciri fungsi akar.' },
    { fam: 'mutlak', judul: 'Jarak ke halte', konteks: 'Halte berada di km ke-3 pada jalan lurus. Kamu mencatat jarak dari beberapa rumah ke halte, tanpa peduli di kiri atau kanan halte.', x: 'posisi rumah (km)', y: 'jarak ke halte (km)', baris: [[0, 3], [1, 2], [3, 0], [5, 2]], alasan: 'Jarak mengecil sampai 0 di halte lalu membesar lagi, dan tidak pernah negatif. Bentuk huruf V: ciri nilai mutlak.' },
    { fam: 'tangga', judul: 'Ongkos kirim', konteks: 'Paket Rp9.000 untuk 1 kg pertama, lalu Rp3.000 tiap kilogram berikutnya atau sebagiannya.', x: 'berat (kg)', y: 'ongkos (ribu)', baris: [['0,8', 9], [1, 9], ['1,5', 12], ['2,2', 15]], alasan: 'Ongkos tetap sama untuk rentang berat tertentu, lalu melompat saat melewati kilogram penuh. Bentuk anak tangga: fungsi tangga.' },
    { fam: 'sepotong', judul: 'Tarif ojek', konteks: '5 km pertama dikenai Rp3.000 per km. Setelah itu Rp2.000 per km.', x: 'jarak (km)', y: 'tarif (ribu)', baris: [[2, 6], [5, 15], [8, 21], [10, 25]], alasan: 'Sampai 5 km naik 3 per km, setelah itu hanya naik 2 per km. Dua aturan dalam satu grafik: sepotong-sepotong.' }
  ];
  const PROMPT = ['Siapa yang bisa membaca konteksnya dengan kata-kata sendiri?', 'Apa yang terjadi pada y saat x makin besar: naik, turun, berulang, atau melompat?', 'Mirip dengan contoh grafik yang mana? Beri satu alasan.'];
  function diskusiSiswa(seed) { const r = mulberry(1300 + seed * 733); return acak(r, DISKUSI.map((_, i) => i)).slice(0, 6).map((i, n) => Object.assign({ no: n + 1, ref: i }, DISKUSI[i])); }
  /* dari tabel ke aturan fungsi (tambahan XI-G): tiga tugas per murid, angkanya diacak tetapi bentuknya tetap */
  function tugasFungsi(idx) {
    const r = mulberry(8800 + idx * 271), fn = (n) => String(n).replace('-', '−'), T = [];
    { const a = pil(r, [2, 3, 4, 5, -2, -3]), b = pil(r, [-5, -3, -2, 1, 2, 3, 4, 6]), xs = [0, 1, 2, 3];
      T.push({ jenis: 'linear', fam: 'poli', judul: 'Aturan garis lurus', rumus: '<i>f</i>(<i>x</i>) = [a]<i>x</i> + [b]', label: ['a', 'b'], jawab: [a, b], baris: xs.map((x) => [x, a * x + b]),
        petunjuk: ['Lihat baris x = 0. Nilai y pada baris itu adalah b.', 'Setiap x naik 1, y bertambah berapa? Tambahan itu adalah a.'],
        jelas: 'Saat x = 0, y = ' + fn(b) + ', jadi b = ' + fn(b) + '. Setiap x naik 1, y bertambah ' + fn(a) + ', jadi a = ' + fn(a) + '. Aturannya: f(x) = ' + fn(a) + 'x ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + '. Pola “bertambah tetap” adalah ciri garis lurus.' }); }
    { const a = pil(r, [1, 2, 3]), c = pil(r, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]), xs = [-2, -1, 0, 1, 2];
      T.push({ jenis: 'kuadrat', fam: 'poli', judul: 'Aturan lengkung (parabola)', rumus: '<i>f</i>(<i>x</i>) = [a]<i>x</i><sup>2</sup> + [c]', label: ['a', 'c'], jawab: [a, c], baris: xs.map((x) => [x, a * x * x + c]),
        petunjuk: ['Lihat baris x = 0. Karena 0² = 0, nilai y di sana adalah c.', 'Lihat baris x = 1: y = a + c. Kurangi c untuk mendapatkan a.'],
        jelas: 'Saat x = 0, y = ' + fn(c) + ', jadi c = ' + fn(c) + '. Saat x = 1, y = ' + fn(a + c) + ', jadi a = ' + fn(a + c) + ' − (' + fn(c) + ') = ' + a + '. Aturannya: f(x) = ' + (a === 1 ? '' : a) + 'x² ' + (c < 0 ? '− ' + (-c) : '+ ' + c) + '. Nilai y sama untuk x dan −x: grafik simetris.' }); }
    { const b = pil(r, [2, 3]), a = pil(r, [1, 2, 3, 4]), xs = [0, 1, 2, 3];
      T.push({ jenis: 'eksponen', fam: 'eksp', judul: 'Aturan yang berlipat', rumus: '<i>f</i>(<i>x</i>) = [a] · [b]<sup><i>x</i></sup>', label: ['a', 'b'], jawab: [a, b], baris: xs.map((x) => [x, a * Math.pow(b, x)]),
        petunjuk: ['Lihat baris x = 0. Karena b⁰ = 1, nilai y di sana adalah a.', 'Bagi y baris berikutnya dengan y baris sebelumnya. Hasilnya adalah b.'],
        jelas: 'Saat x = 0, y = ' + a + ', jadi a = ' + a + '. Tiap x naik 1, y dikali ' + b + ', jadi b = ' + b + '. Aturannya: f(x) = ' + (a === 1 ? '' : a + ' · ') + b + 'ˣ. Perubahan “dikali tetap” adalah ciri eksponensial.' }); }
    return T;
  }
  /* poin dan lencana tahap lanjutan */
  function hitungPoin(t) {
    const pamP = ((t.pam && t.pam.benar) || 0) * 5, fungP = ((t.fung && t.fung.skor) || 0) * 15, kartu = Object.keys(t.kartu || {}).reduce((a, f) => a + (t.kartu[f] === 1 ? 10 : 5), 0), dis = ((t.diskusi && t.diskusi.benar) || 0) * 10, coc = ((t.cocok && t.cocok.benar) || 0) * 10, tik = ((t.tiket && t.tiket.skor) || 0) * 20, bonus = t.tamat ? 10 : 0;
    const poin = Math.min(400, kartu + dis + coc + tik + bonus + pamP + fungP), L = [];
    if (t.pam && t.pam.benar >= 7) L.push('Murid Pameran');
    if (t.fung && t.fung.skor === 3) L.push('Penemu Rumus');
    if ((t.fam || []).length && (t.fam || []).every((f) => t.kartu && t.kartu[f])) L.push('Pakar Kartu');
    if (t.diskusi && t.diskusi.benar >= 5) L.push('Penebak Jitu');
    if (t.cocok && t.cocok.benar >= 4) L.push('Pemburu Masalah');
    if (t.tiket && t.tiket.skor === 3) L.push('Tiket Sempurna');
    if (t.tamat) L.push('Pembelajar Reflektif');
    const gelar = poin >= 170 ? 'Maestro Grafik' : (poin >= 130 ? 'Ahli Grafik' : (poin >= 90 ? 'Penjelajah Grafik' : 'Calon Ahli Grafik'));
    return { poin, lencana: L, gelar };
  }
  const PENGECOH = { poli: ['eksp', 'trig'], eksp: ['poli', 'akar'], log: ['akar', 'eksp'], trig: ['poli', 'mutlak'], rasional: ['eksp', 'log'], akar: ['log', 'poli'], mutlak: ['sepotong', 'trig'], tangga: ['sepotong', 'mutlak'], sepotong: ['mutlak', 'tangga'] };
  function cocokSiswa(idx, jumlah, mulaiDari) {
    const r = mulberry(9100 + idx * 6007), urut = acak(r, SITUASI.map((_, i) => i)), m0 = mulaiDari || 0, pilih = urut.slice(m0, m0 + (jumlah || 5));
    return pilih.map((si, n) => { const s = SITUASI[si], o = acak(r, [s.fam].concat(PENGECOH[s.fam])); return { no: n + 1, situasi: si, fam: s.fam, opsi: o, kunci: o.indexOf(s.fam) }; });
  }
  function tiketSiswa(idx) {
    const r = mulberry(5300 + idx * 4421), a = rint(r, 2, 6), b = [-4, -3, -2, 2, 3, 4, 5][rint(r, 0, 6)], c = rint(r, 3, 6), semua = Object.keys(NAMA_FAM), fam = semua[rint(r, 0, 8)];
    const nama = acak(r, [fam].concat(acak(r, semua.filter((f) => f !== fam)).slice(0, 3)));
    return [
      { jenis: 'hitung', tanya: 'Diketahui <i>f</i>(<i>x</i>) = ' + fLin(a, b).replace('x', '<i>x</i>') + '. Berapa <i>f</i>(' + c + ')?', kunci: a * c + b, jelas: 'f(' + c + ') = ' + a + '(' + c + ') ' + suku(b) + ' = ' + (a * c + b) + '.' },
      { jenis: 'nama', tanya: 'Grafik di atas termasuk keluarga fungsi apa?', fam, opsi: nama, kunci: nama.indexOf(fam), jelas: 'Itu grafik fungsi ' + NAMA_FAM[fam] + '.' },
      Object.assign({ jenis: 'cocok' }, cocokSiswa(idx, 1, 5)[0])
    ];
  }

  const api = { tugasFungsi, KELAS_CFG, cfg, setKelas, durasi, kelasAktif: () => AKTIF, tantanganAcak, KELAS, SET, NAMA_FAM, DISKUSI, PROMPT, diskusiSiswa, hitungPoin, bagianPasangan, TANTANGAN, SITUASI, PENGECOH, cocokSiswa, tiketSiswa, DAFTAR, DUMMY, PIN_GURU, nama, judulKata, DURASI, JUMLAH_SOAL, KELOMPOK, MAKS_ANGGOTA, soalSiswa, nilai, buatKode, bacaKode, bentukKelompok, tambahKelompok, ALFA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BS = api;
})(typeof window !== 'undefined' ? window : globalThis);
