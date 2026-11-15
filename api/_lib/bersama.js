/* Kode bersama (peramban + server): daftar kelas, soal tes awal acak per siswa, kode hasil 5 karakter, pembentukan kelompok. */
(function (root) {
  'use strict';
  const KELAS = 'XI-F Soshum';
  const DAFTAR = ['AGASTYA DWI PRASETYA', 'ANDI YASMIN SYAURAH DIMITRI', 'AURELLYA AZ ZAHRA MAKARIM', 'BRILIANDHIKA KHAIRUNAS NATAGUNA', 'DHAFIN RIZQI ABDILLAH', 'DZAKIRA ESTA FAHIMA AZARIA', 'EVAN FABIAN', 'FIDYA ALIFA DEMETERY ABDULLAH', 'JHONSON LEONARD NADAEK', 'JIHAN RAMEYZA ALYA', 'KEYSHA EFITA YASMIN', 'KHAIRUNNISA AL-ZAHWA', 'LUNETTA ADZRA PANPILA', 'MUHAMMAD DANISH ALFAIZHA', 'MUHAMMAD FAKHRI IQBAL ZUHAIR', 'MUHAMMAD IRSYAD IHSANI', 'NABILA CYRA RAMADHANI', 'NABILA KHALISHAH SETIAWAN', 'NAURA DZAKIYYATURROHMAH', 'RAISYA ABIDAH SYAIFULLAH', 'RESKI ADITIYA IBRAHIM', 'SUCI KANAYA DIFKA', 'SYAKIIRA JESSENIA', 'YOSEFA GABRIELA'];
  const judulKata = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  const nama = (i) => judulKata(DAFTAR[i]);
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
  function buatKode(idx, jawab) { let a = 0, kali = 1; for (let i = 0; i < 5; i++) { const v = jawab[i] == null ? 5 : jawab[i]; a += v * kali; kali *= 6; } let n = idx + 24 * a, s = ''; for (let i = 0; i < 4; i++) { s = ALFA[n % 32] + s; n = Math.floor(n / 32); } let c = 0; for (let i = 0; i < 4; i++) c += (ALFA.indexOf(s[i]) + 1) * (2 * i + 3); return s + ALFA[c % 32]; }
  function bacaKode(kode) {
    const k = String(kode || '').toUpperCase().replace(/[^A-Z2-9]/g, ''); if (k.length !== 5) return { error: 'Kode harus 5 karakter' };
    let c = 0, n = 0; for (let i = 0; i < 4; i++) { const p = ALFA.indexOf(k[i]); if (p < 0) return { error: 'Karakter kode tidak dikenali' }; c += (p + 1) * (2 * i + 3); n = n * 32 + p; }
    if (ALFA[c % 32] !== k[4]) return { error: 'Kode salah ketik (karakter terakhir tidak cocok)' };
    const idx = n % 24; let a = Math.floor(n / 24); if (a >= 7776) return { error: 'Kode tidak valid' };
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

  const api = { KELAS, DAFTAR, nama, judulKata, DURASI, JUMLAH_SOAL, KELOMPOK, MAKS_ANGGOTA, soalSiswa, nilai, buatKode, bacaKode, bentukKelompok, tambahKelompok, ALFA };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BS = api;
})(typeof window !== 'undefined' ? window : globalThis);
