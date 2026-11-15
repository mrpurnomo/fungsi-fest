/* Kode bersama (peramban + server): daftar kelas, soal tes awal acak per siswa, kode hasil 5 karakter, pembentukan kelompok. */
(function (root) {
  'use strict';
  const KELAS = 'XI-F Soshum';
  const DAFTAR = ['AGASTYA DWI PRASETYA', 'ANDI YASMIN SYAURAH DIMITRI', 'AURELLYA AZ ZAHRA MAKARIM', 'BRILIANDHIKA KHAIRUNAS NATAGUNA', 'DHAFIN RIZQI ABDILLAH', 'DZAKIRA ESTA FAHIMA AZARIA', 'EVAN FABIAN', 'FIDYA ALIFA DEMETERY ABDULLAH', 'JHONSON LEONARD NADAEK', 'JIHAN RAMEYZA ALYA', 'KEYSHA EFITA YASMIN', 'KHAIRUNNISA AL-ZAHWA', 'LUNETTA ADZRA PANPILA', 'MUHAMMAD DANISH ALFAIZHA', 'MUHAMMAD FAKHRI IQBAL ZUHAIR', 'MUHAMMAD IRSYAD IHSANI', 'NABILA CYRA RAMADHANI', 'NABILA KHALISHAH SETIAWAN', 'NAURA DZAKIYYATURROHMAH', 'RAISYA ABIDAH SYAIFULLAH', 'RESKI ADITIYA IBRAHIM', 'SUCI KANAYA DIFKA', 'SYAKIIRA JESSENIA', 'YOSEFA GABRIELA'];
  const judulKata = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  const DUMMY = 24;                    // akun uji coba guru (tidak masuk kelompok dan statistik)
const PIN_GURU = '30594';
const nama = (i) => (i === DUMMY ? 'Siswa Uji Coba (Guru)' : judulKata(DAFTAR[i]));
  const DURASI = 600;      // detik
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
      S.push({ tanya: 'Diketahui fungsi <i>f</i>(<i>x</i>) = <i>x</i>² − ' + k + '. Nilai <i>f</i>(−' + mm + ') adalah …', opsi: o, kunci: mn(kunci), jelas: 'Ganti x dengan −' + mm + ': f(−' + mm + ') = (−' + mm + ')² − ' + k + ' = ' + mm * mm + ' − ' + k + ' = ' + kunci + '. Ingat: (−' + mm + ')² = ' + mm * mm + ' (bukan −' + mm * mm + ').' }); }
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
      else { const k = rint(r, 1, 9); S.push({ tanya: 'Grafik fungsi <i>f</i>(<i>x</i>) = <i>x</i>² − ' + k + ' berbentuk …', opsi: OP.slice(), kunci: OP[1], jelas: 'Fungsi yang memuat x² disebut fungsi kuadrat. Grafiknya melengkung seperti huruf U (parabola).' }); } }
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
    poli: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = <i>x</i>² − 4. Berapa <i>f</i>(−3)?', kunci: 5, jelas: 'f(−3) = (−3)² − 4 = 9 − 4 = 5.' },
    eksp: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = 2<sup><i>x</i></sup>. Berapa <i>f</i>(3)?', kunci: 8, jelas: 'f(3) = 2 × 2 × 2 = 8.' },
    log: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = log₂ <i>x</i>. Berapa <i>f</i>(8)?', kunci: 3, jelas: 'log₂ 8 menanyakan: 2 dipangkatkan berapa agar hasilnya 8? Jawabannya 3, karena 2³ = 8.' },
    trig: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = sin <i>x</i> (x dalam derajat). Berapa <i>f</i>(90)?', kunci: 1, jelas: 'sin 90° = 1. Itulah puncak gelombang sinus.' },
    rasional: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = 6 ÷ <i>x</i>. Berapa <i>f</i>(2)?', kunci: 3, jelas: 'f(2) = 6 ÷ 2 = 3.' },
    akar: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = √<i>x</i>. Berapa <i>f</i>(9)?', kunci: 3, jelas: '√9 = 3, karena 3 × 3 = 9.' },
    mutlak: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = |<i>x</i> − 2|. Berapa <i>f</i>(−1)?', kunci: 3, jelas: 'f(−1) = |−1 − 2| = |−3| = 3. Nilai mutlak selalu tidak negatif.' },
    tangga: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = pembulatan ke atas dari <i>x</i>. Berapa <i>f</i>(2,3)?', kunci: 3, jelas: 'Dibulatkan ke atas: 2,3 menjadi 3.' },
    sepotong: { tanya: 'Diketahui <i>f</i>(<i>x</i>) = <i>x</i> untuk <i>x</i> ≤ 2, dan 2<i>x</i> − 2 untuk <i>x</i> > 2. Berapa <i>f</i>(4)?', kunci: 6, jelas: 'x = 4 lebih dari 2, jadi pakai potongan kedua: 2(4) − 2 = 6.' }
  };
  const SITUASI = [
    { fam: 'poli', judul: 'Kotak dari karton', teks: 'Selembar karton dilipat membentuk kotak. Volume kotak bergantung pada tinggi lipatan: mula-mula naik, mencapai puncak, lalu turun lagi.', x: 'tinggi lipatan (cm)', y: 'volume (cm³)', baris: [[1, 100], [2, 128], [3, 108], [4, 64]] },
    { fam: 'eksp', judul: 'Pengikut akun', teks: 'Jumlah pengikut sebuah akun menjadi dua kali lipat setiap minggu.', x: 'minggu ke-', y: 'pengikut', baris: [[0, 500], [1, '1.000'], [2, '2.000'], [3, '4.000']] },
    { fam: 'log', judul: 'Kepuasan pembeli donat', teks: 'Isi kotak donat dilipatduakan, kepuasan hanya bertambah 10 poin. Makin banyak, pertambahannya makin kecil.', x: 'isi kotak', y: 'kepuasan', baris: [[1, 0], [2, 10], [4, 20], [8, 30]] },
    { fam: 'trig', judul: 'Wisatawan musiman', teks: 'Jumlah wisatawan di pantai naik turun mengikuti musim dan pola yang sama berulang setiap 12 bulan.', x: 'bulan ke-', y: 'wisatawan', baris: [[0, '2.000'], [3, '3.000'], [6, '4.000'], [9, '3.000'], [12, '2.000']] },
    { fam: 'rasional', judul: 'Patungan sewa bus', teks: 'Biaya bus Rp600.000 dibagi rata. Makin banyak peserta, iuran tiap orang makin kecil tetapi tidak pernah nol.', x: 'peserta', y: 'iuran (ribu)', baris: [[2, 300], [4, 150], [10, 60], [24, 25]] },
    { fam: 'akar', judul: 'Lahan persegi', teks: 'Panjang sisi lahan persegi adalah akar dari luasnya. Luas 4 kali lipat, sisi hanya 2 kali lipat.', x: 'luas (m²)', y: 'sisi (m)', baris: [[1, 1], [4, 2], [25, 5], [100, 10]] },
    { fam: 'mutlak', judul: 'Selisih dari harga acuan', teks: 'Selisih harga barang dari harga acuan Rp50.000, tanpa peduli lebih mahal atau lebih murah.', x: 'harga (ribu)', y: 'selisih (ribu)', baris: [[30, 20], [40, 10], [50, 0], [60, 10]] },
    { fam: 'tangga', judul: 'Tarif parkir', teks: 'Rp3.000 untuk 1 jam pertama, lalu Rp2.000 setiap jam berikutnya atau sebagiannya (dibulatkan ke atas).', x: 'lama (jam)', y: 'tarif (ribu)', baris: [['0,5', 3], [1, 3], ['1,5', 5], ['2,5', 7]] },
    { fam: 'sepotong', judul: 'Tagihan air', teks: 'Rp3.000 per m³ untuk 10 m³ pertama, lalu Rp5.000 per m³ untuk pemakaian di atasnya.', x: 'pemakaian (m³)', y: 'tagihan (ribu)', baris: [[5, 15], [10, 30], [15, 55], [20, 80]] }
  ];
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

  const api = { KELAS, SET, NAMA_FAM, bagianPasangan, TANTANGAN, SITUASI, PENGECOH, cocokSiswa, tiketSiswa, DAFTAR, DUMMY, PIN_GURU, nama, judulKata, DURASI, JUMLAH_SOAL, KELOMPOK, MAKS_ANGGOTA, soalSiswa, nilai, buatKode, bacaKode, bentukKelompok, tambahKelompok, ALFA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BS = api;
})(typeof window !== 'undefined' ? window : globalThis);
