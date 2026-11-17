// Uji API Sidang Presentasi (xig2) versi 4: sesi dibuka guru, peran, alur soal digerakkan penyaji, penghitung nyata, penilaian, tepuk tangan, rapor.
// Jalankan server uji lebih dulu (port 3200), lalu: node uji/uji-sidang.js
const B = require('../api/_lib/bersama.js');
const ok = (c, m) => { console.log((c ? 'LULUS  ' : 'GAGAL  ') + m); if (!c) process.exitCode = 1; };
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) }).then(async (r) => { const j = await r.json(); j._s = r.status; return j; });
const G = (a, o) => api(Object.assign({ a, pin: B.PIN_GURU, kelas: 'xig2' }, o)); const S = (a, idx, o) => api(Object.assign({ a, kelas: 'xig2', idx, token: 'T' + idx }, o));
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  await G('g-sd-reset'); await G('g-reset-semua');
  let r = await api({ a: 'sd-status', kelas: 'xif' }); ok(r._s === 400, 'XI-F menolak aksi sidang');
  r = await G('g-salin-kelompok', { dari: 'xig' }); ok(r._s === 409, 'salin kelompok ditolak bila pertemuan 1 belum punya kelompok');
  const kel = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23], [24, 25, 26]];
  await api({ a: 'g-reset-semua', pin: B.PIN_GURU, kelas: 'xig' }); await api({ a: 'g-set-kelompok', pin: B.PIN_GURU, kelas: 'xig', kel });
  r = await G('g-salin-kelompok', { dari: 'xig' }); ok(r.ok && r.terpasang === 27, 'kelompok disalin dari pertemuan 1 (27 murid)');
  r = await G('g-kelas', { buka: true }); ok(r.ok, 'guru membuka kelas xig2');
  for (let i = 0; i < 27; i++) { r = await S('klaim', i); if (!r.ok) break; } ok(r.ok, '27 murid masuk tanpa tes');
  r = await S('sd-status', 0); ok(r.ok && r.fase === 'siap' && r.giliran === null && r.buka === false, 'status awal: siap dan sesi belum dibuka');
  ok(r.durasi.presentasi === 270 && r.durasi.tanya === 120 && r.durasi.soal === 90 && r.durasi.soal2 === 90 && r.durasi.tanggapan === 75, 'durasi bawaan sesuai jadwal 13.15-15.15 (tidak ada NaN)');
  /* peran */
  r = await S('sd-peran', 0, { peran: 5 }); ok(r._s === 400, 'peran di luar 1-3 ditolak');
  r = await S('sd-peran', 0, { peran: 1 }); ok(r.ok && r.peran['0'] === 1, 'murid menyimpan peran 1 sebelum sesi dibuka');
  r = await S('sd-peran', 1, { peran: 1 }); ok(r._s === 409 && r.error === 'peran-diambil', 'peran sama dalam satu kelompok ditolak');
  const pp = await Promise.all([S('sd-peran', 1, { peran: 2 }), S('sd-peran', 2, { peran: 2 })]); ok(pp.filter((x) => x.ok).length === 1, 'dua murid menekan peran sama bersamaan: hanya satu berhasil');
  r = await S('sd-peran', 2, { peran: 3 }); ok(r.ok, 'anggota ketiga mengambil peran 3');
  r = await S('sd-peran', 1, { peran: 2 }); if (!r.ok) r = await S('sd-peran', 1, { peran: 3 }); r = await S('sd-info', 20); ok(r.peran['0'] && r.peran['0']['0'] === 1 && Object.keys(r.peran['0']).length >= 2, 'sd-info memuat peran anggota');
  /* gerbang sesi */
  r = await S('sd-mulai', 0); ok(r._s === 409 && r.error === 'belum-dibuka', 'mulai presentasi ditolak sebelum guru membuka sesi');
  r = await G('g-sd-set', { buka: true }); r = await S('sd-status', 0); ok(r.buka === true, 'guru membuka sesi presentasi');
  r = await S('sd-mulai', 3); ok(r._s === 409 && r.error === 'peran-belum', 'mulai ditolak bila peran belum disimpan');
  r = await S('sd-mulai', 0); ok(r.ok && r.giliran === 0, 'penyaji memulai presentasi kelompoknya');
  r = await S('sd-status', 20); ok(r.fase === 'presentasi' && r.jenis === 'poli' && r.sayaPenyaji === false && r.anggota.length === 3 && !r.soal, 'penonton melihat status presentasi tanpa soal');
  r = await S('sd-peran', 3, { peran: 1 }); r = await S('sd-mulai', 3); ok(r._s === 409, 'kelompok lain tidak bisa mulai saat kelompok 1 tampil');
  r = await S('sd-slide', 20, { slide: 2 }); ok(r._s === 403, 'penonton tidak boleh mengganti slide');
  r = await S('sd-slide', 0, { slide: 3, pembicara: 1 }); ok(r.ok, 'penyaji mengganti slide dan pembicara sekaligus'); r = await S('sd-status', 20); ok(r.slide === 3 && r.pembicara === 1, 'slide dan pembicara tersinkron ke penonton');
  r = await S('sd-slide', 0, { slide: 40 }); ok(r._s === 400, 'nomor slide divalidasi');
  r = await S('sd-coret', 0, { slide: 2, strokes: [{ c: '#000', w: 3, m: 'pena', p: [10, 10, 20, 20] }] }); ok(r.ok, 'penyaji mengirim coretan'); r = await S('sd-coret', 20, { slide: 2, strokes: [] }); ok(r._s === 403, 'penonton tidak boleh mengirim coretan'); r = await G('g-sd-coret'); ok(r.coret && r.coret.g === 0 && r.coret.strokes.length === 1, 'guru menerima coretan');
  /* alur digerakkan penyaji */
  r = await S('sd-aksi', 20, { aksi: 'soal' }); ok(r._s === 403, 'penonton tidak boleh menggerakkan alur sesi');
  r = await S('sd-aksi', 0, { aksi: 'kunci' }); ok(r._s === 409, 'urutan salah ditolak (kunci sebelum soal)');
  r = await S('sd-aksi', 0, { aksi: 'tanya' }); ok(r.ok && r.fase === 'tanya', 'penyaji membuka tanya jawab'); r = await S('sd-status', 20); ok(r.fase === 'tanya' && !r.soal, 'penonton ikut tanya jawab (tanpa soal)');
  r = await S('sd-jawab', 5, { j: 1 }); ok(r._s === 409, 'jawaban ditolak di luar sesi soal');
  r = await S('sd-aksi', 0, { aksi: 'soal' }); ok(r.ok && r.fase === 'soal' && r.soalNo === 1 && r.sub === 'jawab', 'penyaji memulai sesi soal (soal 1)');
  const q1 = B.soalPres(0, 1), q2 = B.soalPres(0, 2);
  r = await S('sd-status', 5); ok(r.fase === 'soal' && r.soal.no === 1 && r.soal.tanya.length > 10 && r.total === 24 && r.jawabN === 0 && JSON.stringify(r).indexOf('"kunci"') < 0, 'penonton melihat soal 1 tanpa kunci; total 24; jawaban 0');
  r = await S('sd-jawab', 1, { j: q1.kunci }); ok(r._s === 409, 'penyaji tidak boleh menjawab');
  r = await S('sd-jawab', 5, { j: q1.kunci + 1 }); ok(r.ok, 'penonton menjawab'); r = await S('sd-jawab', 5, { j: q1.kunci }); ok(r.ok, 'penonton mengubah jawaban sebelum kunci');
  await S('sd-jawab', 6, { j: q1.kunci + 7 }); await S('sd-jawab', 7, { j: q1.kunci });
  r = await S('sd-jawab', 8, { j: 'x' }); ok(r._s === 400, 'jawaban non-angka ditolak'); r = await api({ a: 'sd-jawab', kelas: 'xig2', idx: 8, token: 'salah', j: 1 }); ok(r._s === 403, 'token salah ditolak');
  r = await S('sd-status', 20); ok(r.jawabN === 3, 'penghitung jawaban realtime: 3 (perubahan jawaban tidak dihitung ganda)');
  r = await G('g-sd-status'); ok(r.cn.j1 === 3 && r.jawab.n === 3 && r.jawab.benar === 2 && r.penonton === 24, 'guru melihat 3 jawaban, 2 benar, 24 penonton');
  r = await S('sd-aksi', 0, { aksi: 'kunci' }); ok(r.ok && r.sub === 'kunci', 'penyaji menampilkan jawaban soal 1');
  r = await S('sd-status', 5); ok(r.sub === 'kunci' && r.hasil['1'].kunci === q1.kunci && r.hasil['1'].n === 3 && r.hasil['1'].benar === 2 && r.hasil['1'].persen === 67 && r.jawabSaya['1'].benar === true, 'hasil soal 1: kunci, 67% benar, status pribadi benar');
  r = await S('sd-status', 6); ok(r.jawabSaya['1'].benar === false, 'status pribadi salah untuk jawaban keliru');
  r = await S('sd-jawab', 9, { j: q1.kunci }); ok(r._s === 409, 'jawaban ditolak setelah kunci tampil');
  r = await S('sd-aksi', 0, { aksi: 'lanjut' }); ok(r.ok && r.soalNo === 2 && r.sub === 'jawab', 'lanjut ke soal 2');
  r = await S('sd-status', 5); ok(r.soal.no === 2 && r.soal.grafik && r.soal.grafik.fam === 'poli' && r.soal.grafik.p.t.length === 2 && r.jawabN === 0 && JSON.stringify(r.soal).indexOf('kunci') < 0, 'soal 2 berupa grafik tanpa kunci; penghitung kembali 0');
  for (let i = 3; i <= 25; i++) await S('sd-jawab', i, { j: i % 3 === 0 ? q2.kunci : q2.kunci + 1 });
  r = await S('sd-status', 20); ok(r.sub === 'jawab' && r.jawabN === 23, '23 dari 24 sudah menjawab: belum otomatis');
  await S('sd-jawab', 26, { j: q2.kunci }); r = await S('sd-status', 20); ok(r.sub === 'kunci' && r.hasil['2'] && r.hasil['2'].n === 24 && r.hasil['2'].sebaran.length >= 2, 'semua penonton menjawab: kunci tampil otomatis dengan sebaran jawaban');
  r = await S('sd-aksi', 0, { aksi: 'lanjut' }); ok(r.ok && r.sub === 'stat', 'lanjut ke statistik');
  r = await S('sd-status', 0); ok(r.hasil['1'] && r.hasil['2'], 'statistik memuat hasil kedua soal');
  r = await S('sd-aksi', 0, { aksi: 'nilai' }); ok(r.ok && r.fase === 'tanggapan', 'penyaji membuka penilaian');
  /* penilaian */
  r = await S('sd-suara', 1, { k: 5 }); ok(r._s === 409, 'penyaji tidak boleh menilai kelompoknya');
  r = await S('sd-suara', 3, { k: 9 }); ok(r.ok && !r.suaraSaya.k, 'bintang di luar 1-5 diabaikan');
  r = await S('sd-suara', 3, { k: 5, pm: { 0: 4, 1: 5, 2: 3, 9: 5 } }); ok(r.ok && r.suaraSaya.k === 5 && r.suaraSaya.p['0'] === 4 && !r.suaraSaya.p['9'], 'penonton mengirim bintang kelompok dan pembicara sekaligus (anggota luar diabaikan)');
  r = await S('sd-status', 20); ok(r.fase === 'tanggapan' && r.suaraN === 1, 'penghitung penilaian realtime: 1');
  await S('sd-suara', 3, { k: 5 }); r = await S('sd-status', 20); ok(r.suaraN === 1, 'mengubah penilaian tidak menambah hitungan');
  for (let i = 4; i <= 25; i++) await S('sd-suara', i, { k: 3 + (i % 3), pm: { 0: 4, 1: 4, 2: 5 } });
  r = await S('sd-status', 20); ok(r.fase === 'tanggapan' && r.suaraN === 23, '23 dari 24 sudah menilai: belum otomatis');
  await S('sd-suara', 26, { k: 5, pm: { 0: 5 } }); r = await S('sd-status', 20); ok(r.fase === 'hasil' && r.hasilBintang === undefined, 'semua sudah menilai: otomatis ke hasil; hasil bintang tidak dikirim ke penonton');
  r = await S('sd-status', 0); ok(r.fase === 'hasil' && r.hasilBintang && r.hasilBintang.n === 24 && r.hasilBintang.rata > 3 && r.hasilBintang.dist.length === 5 && r.hasilBintang.pembicara['0'].n >= 20, 'penyaji menerima hasil bintang gabungan (24 penilai)');
  r = await S('sd-aksi', 20, { aksi: 'selesai' }); ok(r._s === 403, 'penonton tidak bisa menyelesaikan');
  r = await S('sd-aksi', 0, { aksi: 'selesai' }); ok(r.ok && r.fase === 'selesai', 'penyaji menyelesaikan presentasi');
  r = await S('sd-status', 20); ok(r.fase === 'selesai' && r.selesai.includes(0), 'kelompok 1 tercatat selesai');
  r = await S('sd-tepuk', 4, { n: 3 }); ok(r.ok, 'penonton menepuk tangan'); r = await S('sd-tepuk', 5, { n: 99 }); ok(r.ok, 'tepuk besar dibatasi'); r = await S('sd-status', 0); ok(r.tepuk === 11, 'penyaji melihat jumlah tepuk tangan (3 + 8 maksimum)');
  r = await S('sd-tepuk', 0, { n: 1 }); ok(r._s === 409, 'penyaji tidak boleh menepuk sendiri');
  r = await S('sd-peran', 0, { peran: 2 }); ok(r._s === 409 && r.error === 'sudah-selesai', 'peran tidak bisa diganti setelah selesai');
  r = await S('sd-mulai', 0); ok(r._s === 409 && r.error === 'sudah-selesai', 'tidak bisa presentasi ulang tanpa izin guru');
  r = await S('sd-rapor', 1); ok(r.ok && r.g === 0 && r.suara.n === 24 && r.soal.length === 2 && r.soal[0].n === 3 && r.soal[1].n === 24 && r.pembicara.length === 3 && r.tepuk === 11 && JSON.stringify(r).indexOf('"idx"') < 0, 'rapor kelompok: bintang, hasil dua soal, pembicara, tepuk; tanpa identitas pemilih');
  r = await S('sd-rapor', 5); ok(r.ok && r.g === 1, 'rapor hanya untuk kelompok pemintanya'); r = await api({ a: 'sd-rapor', kelas: 'xig2', idx: 1, token: 'salah' }); ok(r._s === 403, 'rapor butuh token');
  /* rekap */
  r = await G('g-sd-nilai', { giliran: 0, kriteria: { isi: 4, kedalaman: 3, kejelasan: 4, kompak: 3 } }); r = await G('g-sd-rekap'); const k1 = r.kelompok[0];
  ok(Math.abs(k1.guru - 87.5) < 1e-9 && k1.bintang > 60 && k1.mengajar > 20, 'rekap kelompok 1: guru 87,5, bintang dan keberhasilan mengajar dihitung dari dua soal');
  const i5 = r.individu.find((x) => x.idx === 5); ok(i5.hadir && i5.nSoal === 2 && i5.jawaban === 50, 'rekap individu: jawaban benar dihitung dari dua soal (1 dari 2 = 50%)');
  /* izin ulang dan reset */
  r = await G('g-sd-set', { hapusSelesaiG: 0 }); r = await S('sd-peran', 0, { peran: 1 }); ok(r.ok, 'guru mengizinkan presentasi ulang: peran bisa diubah lagi');
  r = await G('g-sd-reset-kelompok', { giliran: 0 }); ok(r.ok, 'guru mereset progres kelompok 1'); r = await G('g-sd-status'); ok(r.ringkas[0].suaraN === 0 && r.ringkas[0].jawabN === 0 && r.cn.j1 === 0 && !r.sd.selesai.includes(0), 'progres kelompok 1 bersih (termasuk penghitung)');
  r = await G('g-sd-reset-kelompok', { giliran: 99 }); ok(r._s === 400, 'reset di luar rentang ditolak');
  /* kendali guru dan waktu */
  r = await G('g-sd-set', { giliran: 1 }); r = await G('g-sd-set', { fase: 'presentasi' }); r = await S('sd-status', 20); const m0 = r.mulaiFase;
  r = await G('g-sd-set', { tambahDetik: 60 }); r = await S('sd-status', 20); ok(r.tambah === 60, '+1 menit tercatat');
  r = await G('g-sd-set', { jeda: true }); r = await S('sd-status', 20); ok(r.jedaAt > 0, 'jeda mencatat waktu henti'); await tunggu(1100); r = await G('g-sd-set', { jeda: false }); r = await S('sd-status', 20); ok(r.jedaAt === null && r.mulaiFase - m0 >= 1000, 'lanjut dari jeda menggeser awal fase');
  r = await G('g-sd-set', { aksi: 'soal' }); r = await S('sd-status', 20); ok(r.fase === 'soal' && r.soalNo === 1 && r.tambah === 0, 'guru boleh mengambil alih dan memulai sesi soal');
  r = await G('g-sd-set', { durasi: { soal: 10, soal2: 15, tanya: 90 } }); r = await S('sd-status', 20); ok(r.durasi.soal === 10 && r.durasi.soal2 === 15 && r.durasi.tanya === 90, 'durasi per soal dan tanya jawab bisa diatur guru');
  r = await G('g-sd-set', { ulangFase: true }); await tunggu(10500); r = await S('sd-status', 20); ok(r.sub === 'kunci', 'waktu soal habis: jawaban tampil otomatis tanpa menunggu penyaji');
  r = await G('g-sd-set', { stop: true }); r = await S('sd-status', 20); ok(r.fase === 'siap' && r.giliran === 1, 'stop presentasi: kembali bersiap, kelompok tetap ditampilkan');
  r = await G('g-sd-set', { nonaktif: true }); r = await S('sd-status', 20); ok(r.giliran === null && r.fase === 'siap' && Object.keys(r.peran).length === 0, 'nonaktifkan tampil');
  r = await G('g-sd-set', { kecualiToggle: 5 }); r = await G('g-sd-status'); ok(r.sd.kecuali.join() === '5', 'kelompok dikecualikan dari roda'); await G('g-sd-set', { kecualiToggle: 5 }); r = await G('g-sd-status'); ok(r.sd.kecuali.length === 0, 'kelompok dimunculkan kembali');
  r = await G('g-sd-tanggapan', { giliran: 1, kelompok: 2, jenis: 'tanya', oleh: 7 }); ok(r.ok, 'tanggapan dicatat'); r = await G('g-sd-tanggapan', { giliran: 1, kelompok: 1, jenis: 'tanya' }); ok(r._s === 400, 'tanggapan dari kelompok penyaji sendiri ditolak');
  r = await api({ a: 'g-sd-status', kelas: 'xig2', pin: '99999' }); ok(r._s === 401, 'aksi guru butuh PIN');
  r = await api({ a: 'status', kelas: 'xig' }); ok(r.diklaim.length === 0, 'XI-G pertemuan 1 tidak terpengaruh');
  /* soal valid untuk semua jenis */
  let valid = true; for (let g = 0; g < 9; g++) for (const no of [1, 2]) { const q = B.soalPres(g, no); if (!Number.isFinite(q.kunci) || q.kunci % 1 !== 0 || (no === 2 && !q.grafik)) valid = false; } ok(valid, 'kunci 18 soal sesi (9 jenis x 2) bulat dan valid');
  await G('g-sd-reset'); r = await G('g-sd-status'); ok(r.sd.giliran === null && r.sd.selesai.length === 0 && r.sd.buka === false, 'atur ulang sidang (sesi tertutup lagi)');
  await G('g-reset-semua'); await api({ a: 'g-reset-semua', pin: B.PIN_GURU, kelas: 'xig' });
})();
