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

  /* ---------------------------------------------------------------- catatan per jenis (cetak / simpan PDF) */
  function catatan(g) {
    const f = JENIS[g], q = B.tantanganAcak(f, B.seedSoal(g)), d = GF.K[f], host = el('div', { kelas: 'sd-cetak fx-' + f }); host.append(el('h1', null, 'Catatan: Fungsi ' + NAMA[f]), el('p', { kelas: 'muted' }, 'Kelompok ' + (g + 1) + ' · XI-G Soshum · Matematika Tingkat Lanjut · SMA YPVDP Bontang'));
    for (let n = 0; n < NS; n++) host.append(slide(g, n, null));
    host.append(el('section', { kelas: 'sd-cet-soal' }, el('h2', null, 'Soal presentasi dan pembahasan'), el('div', { html: q.tanya }), el('p', null, el('b', null, 'Jawaban: '), String(q.kunci).replace('-', '−')), el('p', null, q.jelas)), el('section', { kelas: 'sd-cet-soal' }, el('h2', null, 'Ringkasan'), el('ul', null, d.ciri.map((x) => el('li', null, x))), el('p', { html: '<b>Bentuk umum:</b> ' + d.umum }), el('h2', null, 'Umpan balik untukku'), el('div', { kelas: 'sd-cet-isi' }, '__________________________________________'), el('div', { kelas: 'sd-cet-isi' }, '__________________________________________')));
    document.body.append(host); document.body.classList.add('mencetak'); const bersih = () => { host.remove(); document.body.classList.remove('mencetak'); window.removeEventListener('afterprint', bersih); }; window.addEventListener('afterprint', bersih); setTimeout(() => window.print(), 250); setTimeout(() => { if (host.isConnected) bersih(); }, 120000);
  }
  /* rapor kelompok penyaji */
  async function rapor(A) {
    const r = await A('sd-rapor'); if (!r.ok) { UI.toast('Rapor belum tersedia', 'awas'); return; } const f = (v) => (v == null ? '–' : v.toFixed(1).replace('.', ',')), isi = el('div', { kelas: 'sd-rapor fx-' + r.jenis });
    isi.append(el('div', { kelas: 'sdg-hitung' }, [['Bintang kelompok', '★ ' + f(r.suara.rata), r.suara.n + ' penilai'], ['Penonton benar', r.jawab.n ? Math.round(r.jawab.benar / r.jawab.n * 100) + '%' : '–', r.jawab.benar + ' dari ' + r.jawab.n], ['Tanggapan', String(r.tanggapan.total), r.tanggapan.tanya + ' tanya · ' + r.tanggapan.saran + ' saran · ' + r.tanggapan.apresiasi + ' apresiasi']].map(([t, v, s]) => el('div', { kelas: 'kartu sdg-h' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, t), el('b', null, v), el('span', { kelas: 'muted' }, s)))), el('div', { kelas: 'eyebrow', gaya: 'margin-top:.8rem' }, 'Bintang pembicara'), el('div', { kelas: 'baris', gaya: 'gap:.5rem;flex-wrap:wrap' }, r.pembicara.map((p) => el('span', { kelas: 'chip', gaya: 'font-size:1rem' }, depan(p.nama) + ' ★ ' + f(p.rata) + (p.n ? ' (' + p.n + ')' : '')))), el('p', { kelas: 'muted kecil' }, 'Penilaian teman bersifat anonim. Nilai akhir diumumkan guru.'));
    UI.dialog({ lebar: true, judul: 'Rapor presentasi · Kelompok ' + (r.g + 1), ikon: ik('bintang', 'besar'), isi, tombol: [{ t: 'Tutup', nilai: true, kelas: 'sekunder' }, { t: 'Unduh catatan', nilai: false, ikon: 'kirim' }], tutupLuar: true }).then((v) => { if (v === false) catatan(r.g); });
  }

  /* ---------------------------------------------------------------- waktu fase (dengan jeda dan tambah/kurang waktu) */
  const durFase = (S) => (S && S.durasi && S.durasi[S.fase] ? Math.max(0, S.durasi[S.fase] + (S.tambah || 0)) : 0);
  const sisaFase = (S, off) => { if (!S || !['presentasi', 'soal', 'tanggapan'].includes(S.fase)) return null; const ref = S.jedaAt || (Date.now() + off); return durFase(S) - (ref - S.mulaiFase) / 1000; };
  const wkt = (s, S) => (S && S.jedaAt ? '⏸ ' : '') + fmtW(Math.max(0, s));
  const warnaJenis = (f) => { try { return getComputedStyle(document.documentElement).getPropertyValue('--f-' + f).trim() || '#6D35E8'; } catch (e) { return '#6D35E8'; } };

  /* ---------------------------------------------------------------- murid: dasbor, penyaji, penonton */
  function murid(E) {
    E.kosongkan(); const idx = E.idx(), A = (x, d) => E.api(x, Object.assign({ idx }, d)), w = el('div', { kelas: 'sd' }), ban = el('div', { kelas: 'sd-ban' }), body = el('div', { kelas: 'sd-body' }); w.append(ban, body); E.layar(w);
    let S = null, INFO = null, off = 0, gagal = 0, view = 'dash', lokal = null, jwLokal = null, kB = '', kV = '', kC = '', kM = '', kP = '', infoT = 0, sibuk = false, mainBox = null, panelBox = null;
    const sayaP = () => !!(S && S.sayaPenyaji), sayaG = () => (INFO ? INFO.sayaKelompok : -1), nmKel = (g) => (INFO && INFO.kelompok[g] ? INFO.kelompok[g] : []);
    const live = () => !!(S && S.giliran != null && !['siap', 'selesai'].includes(S.fase));
    const setView = (v) => { view = v; kV = ''; kB = ''; gambar(); };
    async function ambil() {
      if (!w.isConnected) { clearInterval(iv); clearInterval(iv2); return; } if (sibuk) return; sibuk = true;
      try { const r = await A('sd-status'); if (r.ok) { gagal = 0; S = r; off = r.sekarang - Date.now(); } else gagal++; if (!INFO || Date.now() - infoT > 15000) { const i = await A('sd-info'); if (i.ok) { INFO = i; infoT = Date.now(); } } } finally { sibuk = false; } gambar();
    }
    function skel(v) { if (kV === v) return false; kV = v; body.innerHTML = ''; kC = ''; kM = ''; kP = ''; mainBox = null; panelBox = null; return true; }
    function gambar() {
      const kb = [gagal > 1, view, S && S.fase, S && S.giliran, S && S.berikut].join('|'); if (kb !== kB) { kB = kb; bangunBan(); }
      if (!S) { skel('tunggu'); body.innerHTML = '<div class="sd-tunggu">Menghubungkan ke guru…</div>'; return; }
      if (view === 'penyaji' && !sayaP()) view = 'dash'; if (view === 'penonton' && sayaP()) view = 'dash';
      if (view === 'dash') dash(); else if (view === 'penyaji') penyaji(); else penonton();
    }
    function bangunBan() {
      ban.innerHTML = ''; const f = S && S.giliran != null ? JENIS[S.giliran] : null;
      ap(ban, view !== 'dash' ? el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Dasbor', onclick: () => setView('dash') }) : null, el('span', { kelas: 'chip ' + (gagal > 1 ? 'warn' : 'ok'), html: ik(gagal > 1 ? 'putus' : 'wifi', 'kecil') + (gagal > 1 ? 'Tidak tersambung' : 'Terhubung') }), f ? el('span', { kelas: 'chip', html: UI.glif(f) + 'Kel. ' + (S.giliran + 1) + ' · ' + esc(FASE_NAMA[S.fase] || '') }) : el('span', { kelas: 'chip abu' }, 'Belum ada yang tampil'), S && S.berikut != null ? el('span', { kelas: 'chip sorot' }, 'Berikutnya: Kelompok ' + (S.berikut + 1)) : null, el('span', { kelas: 'ruang' }), el('span', { kelas: 'sd-timer', id: 'sd-timer' }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil') + 'Segarkan', onclick: async () => { await ambil(); UI.toast(gagal ? 'Belum tersambung ke guru' : 'Diperbarui', gagal ? 'awas' : 'centang'); } }));
    }
    /* ---- dasbor ---- */
    function statusKel(g) { if (S.giliran === g && S.fase !== 'selesai') return S.fase === 'siap' ? 'bersiap' : 'tampil'; if ((S.selesai || []).includes(g)) return 'selesai'; return 'belum'; }
    function dash() {
      const k = ['d', S.fase, S.giliran, S.berikut, (S.selesai || []).join(), infoT, sayaP()].join('|'); if (!skel('dash') && k === kC) return; kC = k; body.innerHTML = '';
      const g = sayaG(), kiri = el('div', { kelas: 'sd-dash-kiri' }), kanan = el('div', { kelas: 'sd-dash-kanan' }), wrap = el('div', { kelas: 'sd-dash' }, kiri, kanan); body.append(wrap);
      if (!INFO) { kiri.append(el('div', { kelas: 'sd-tunggu' }, 'Memuat daftar kelompok…')); return; }
      const mine = sayaP(), lain = live() && S.giliran !== g;
      if (g < 0) kiri.append(el('div', { kelas: 'sd-hero' }, el('h2', null, 'Namamu belum masuk kelompok'), el('p', { kelas: 'sd-hero-p' }, 'Beri tahu gurumu agar namamu dimasukkan ke sebuah kelompok, lalu tekan Segarkan.')));
      else {
        const f = JENIS[g], sudah = (S.selesai || []).includes(g) && S.giliran !== g;
        const teks = mine ? 'Kelompokmu sedang tampil sekarang.' : lain ? 'Kelompok ' + (S.giliran + 1) + ' sedang tampil. Tunggu giliranmu.' : sudah ? 'Presentasi kelompokmu sudah selesai. Kerja bagus!' : S.berikut === g ? 'Giliran kelompokmu selanjutnya! Siapkan diri.' : 'Saat gurumu memanggil kelompokmu, tekan tombol di bawah.';
        const btn = el('button', { kelas: 'btn besar' + (mine || S.berikut === g ? ' sorot denyut' : ''), type: 'button', disabled: lain, html: ik('main') + (mine ? 'Buka layar presentasi' : sudah ? 'Tampil lagi' : 'Mulai presentasi'), onclick: async () => { if (mine) return setView('penyaji'); btn.disabled = true; const r = await A('sd-mulai'); if (r.ok) { await ambil(); setView('penyaji'); } else { btn.disabled = false; UI.toast(r.error === 'kelompok-lain-tampil' ? 'Kelompok lain sedang tampil' : 'Gagal memulai. Coba lagi.', 'awas'); } } });
        kiri.append(el('div', { kelas: 'sd-hero fx-' + f }, el('div', { kelas: 'sd-hero-a' }, el('span', { html: UI.ubin(f) }), el('div', null, el('div', { kelas: 'eyebrow' }, 'Kelompokmu'), el('h2', null, 'Kelompok ' + (g + 1) + ' · ' + NAMA[f]))), el('div', { kelas: 'sd-anggota' }, nmKel(g).map((a) => el('span', { kelas: 'sd-ang' + (a.idx === idx ? ' aku' : '') }, depan(a.nama) + (a.idx === idx ? ' (kamu)' : '')))), el('p', { kelas: 'sd-hero-p' }, teks), el('div', { kelas: 'baris', gaya: 'gap:.6rem;flex-wrap:wrap' }, btn, sudah || (S.selesai || []).includes(g) ? el('button', { kelas: 'btn sekunder', type: 'button', html: ik('bintang') + 'Lihat rapor', onclick: () => rapor(A) }) : null)));
      }
      if (live() && !mine) { const f = JENIS[S.giliran]; kiri.append(el('div', { kelas: 'sd-live fx-' + f }, el('span', { kelas: 'chip ok' }, 'Sedang berlangsung'), el('h3', null, 'Kelompok ' + (S.giliran + 1) + ' · ' + NAMA[f]), el('div', { kelas: 'muted' }, FASE_NAMA[S.fase]), el('button', { kelas: 'btn besar hijau', type: 'button', html: ik('bintang') + 'Lihat presentasi & beri penilaian', onclick: () => setView('penonton') }))); }
      else if (!mine) kiri.append(el('div', { kelas: 'sd-live kosong' }, el('h3', null, S.berikut != null ? 'Giliran selanjutnya: Kelompok ' + (S.berikut + 1) : 'Belum ada presentasi berlangsung'), el('div', { kelas: 'muted' }, 'Halaman ini berganti sendiri saat guru memulai.')));
      kanan.append(el('div', { kelas: 'eyebrow' }, 'Kelompok lain'));
      const daftar = el('div', { kelas: 'sd-daftar-kel' }); kanan.append(daftar);
      for (let i = 0; i < 9; i++) { if (i === g) continue; const st = statusKel(i), f = JENIS[i], nm = nmKel(i).map((a) => depan(a.nama)).join(', '); daftar.append(el('div', { kelas: 'sd-kel fx-' + f + ' ' + st }, el('span', { html: UI.ubin(f) }), el('div', { gaya: 'flex:1;min-width:0' }, el('b', null, 'Kelompok ' + (i + 1) + ' · ' + NAMA[f]), el('div', { kelas: 'muted kecil sd-nm' }, nm || '–')), st === 'tampil' && !mine ? el('button', { kelas: 'btn kecil hijau', type: 'button', onclick: () => setView('penonton') }, 'Lihat') : st === 'selesai' ? el('button', { kelas: 'btn kecil sekunder', type: 'button', html: ik('kirim', 'kecil') + 'Catatan', onclick: () => catatan(i) }) : el('span', { kelas: 'chip ' + (st === 'selesai' ? 'ok' : st === 'tampil' || st === 'bersiap' ? 'sorot' : 'abu') }, st === 'selesai' ? 'Selesai' : st === 'tampil' ? 'Tampil' : st === 'bersiap' ? 'Bersiap' : 'Belum'))); }
    }
    /* ---- penyaji ---- */
    function curSlide() { return lokal && S && lokal.g === S.giliran && Date.now() - lokal.t < 3500 ? lokal.slide : (S ? S.slide : 0); }
    async function geser(d) { const n = Math.max(0, Math.min(NS - 1, curSlide() + d)); lokal = { g: S.giliran, slide: n, t: Date.now() }; kM = ''; gambar(); const r = await A('sd-slide', { slide: n }); if (!r.ok) UI.toast('Slide belum terkirim. Tekan Segarkan.', 'awas'); }
    function penyaji() {
      if (skel('penyaji')) { mainBox = el('div', { kelas: 'sd-main' }); panelBox = el('div', { kelas: 'sd-panel' }); body.append(mainBox, panelBox); }
      const cur = curSlide(), km = S.giliran + ':' + cur; if (km !== kM) { kM = km; mainBox.innerHTML = ''; mainBox.append(slide(S.giliran, cur, S.anggota), el('div', { kelas: 'sd-nav' }, el('button', { kelas: 'btn sekunder besar', type: 'button', disabled: cur === 0, html: ik('kembali') + 'Sebelumnya', onclick: () => geser(-1) }), el('button', { kelas: 'btn besar', type: 'button', disabled: cur === NS - 1, html: 'Berikutnya' + ik('panah'), onclick: () => geser(1) }))); }
      const kp = [S.fase, S.giliran, S.pembicara, S.hasilSoal && S.hasilSoal.persen].join('|'); if (kp !== kP) { kP = kp; panelBox.innerHTML = ''; const ph = el('div', { kelas: 'sd-pn fx-' + JENIS[S.giliran] }); panelBox.append(ph);
        ph.append(el('div', { kelas: 'sd-pn-t' }, el('b', null, 'Kelompokmu tampil. '), S.fase === 'siap' ? 'Tunggu aba-aba guru.' : 'Fase: ' + FASE_NAMA[S.fase] + '.'));
        ap(ph, el('div', { kelas: 'baris', gaya: 'gap:.5rem;flex-wrap:wrap' }, el('span', { kelas: 'muted' }, 'Yang sedang bicara:'), S.anggota.map((a) => el('button', { type: 'button', kelas: 'btn kecil ' + (S.pembicara === a.idx ? 'hijau' : 'sekunder'), onclick: async () => { S.pembicara = a.idx; kP = ''; gambar(); const r = await A('sd-pembicara', { pembicara: a.idx }); if (!r.ok) UI.toast('Pembicara belum terkirim', 'awas'); } }, depan(a.nama)))));
        if (S.hasilSoal) ph.append(el('div', { kelas: 'umpan ok', html: ik('centang') + '<span>Keberhasilan mengajar: <b>' + S.hasilSoal.persen + '%</b> penonton menjawab benar (' + S.hasilSoal.benar + ' dari ' + S.hasilSoal.n + ').</span>' })); }
    }
    /* ---- penonton (tanpa slide): soal, hasil, bintang ---- */
    function bintang(label, nilai, pilih, sorot) {
      const r = el('div', { kelas: 'sd-bintang' + (sorot ? ' sorot' : '') }, el('div', { kelas: 'sd-b-l' }, label)), s = el('div', { kelas: 'sd-b-s' });
      for (let i = 1; i <= 5; i++) s.append(el('button', { type: 'button', kelas: 'sd-b' + (nilai >= i ? ' on' : ''), 'aria-label': i + ' bintang', onclick: () => pilih(i) }, '★')); r.append(s); return r;
    }
    async function kirimSuara(data) { const r = await A('sd-suara', data); if (r.ok) { S.suaraSaya = r.suaraSaya; kC = ''; gambar(); } else UI.toast(r._s === 409 ? 'Bintang sudah ditutup guru' : 'Gagal terkirim. Coba lagi.', 'awas'); }
    function penonton() {
      const k = ['n', S.fase, S.giliran, S.pembicara, JSON.stringify(S.jawabanSaya || jwLokal), JSON.stringify(S.suaraSaya), S.hasilSoal && S.hasilSoal.persen].join('|'); if (!skel('penonton') && k === kC) return; kC = k; body.innerHTML = '';
      const box = el('div', { kelas: 'sd-pv' }); body.append(box);
      if (S.giliran == null) { box.append(el('div', { kelas: 'sd-tunggu' }, el('h2', null, 'Belum ada kelompok yang tampil'), el('button', { kelas: 'btn', type: 'button', onclick: () => setView('dash') }, 'Kembali ke dasbor'))); return; }
      const f = JENIS[S.giliran], pem = S.pembicara != null ? (S.anggota.find((a) => a.idx === S.pembicara) || {}).nama : null, FS = ['presentasi', 'soal', 'hasil', 'tanggapan'], ci = FS.indexOf(S.fase);
      box.classList.add('fx-' + f);
      box.append(el('div', { kelas: 'sd-pv-kep' }, el('span', { html: UI.ubin(f) }), el('div', { gaya: 'flex:1' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Sedang tampil'), el('h2', { gaya: 'margin:0' }, 'Kelompok ' + (S.giliran + 1) + ' · ' + NAMA[f]), el('div', { kelas: 'muted' }, pem ? 'Pembicara: ' + pem : 'Anggota: ' + S.anggota.map((a) => depan(a.nama)).join(', '))), el('div', { kelas: 'sd-langkah' }, ['Presentasi', 'Soal', 'Hasil', 'Bintang'].map((t, i) => el('span', { kelas: 'sd-lg' + (i === ci ? ' on' : '') + (i < ci ? ' done' : '') }, t)))));
      const isi = el('div', { kelas: 'sd-pv-isi' }); box.append(isi);
      if (S.fase === 'siap' || S.fase === 'presentasi') isi.append(el('div', { kelas: 'sd-besar' }, el('h3', null, 'Simak presentasinya'), el('p', null, 'Perhatikan penjelasan kelompok ini. Sebentar lagi ada soal untukmu, lalu kamu bisa memberi bintang.')));
      if (S.fase === 'soal' && S.soal) {
        const jw = S.jawabanSaya || jwLokal;
        isi.append(el('div', { kelas: 'sd-soal-p', html: S.soal.tanya }), el('div', { kelas: 'baris', gaya: 'gap:1rem;flex-wrap:wrap' }, el('button', { kelas: 'btn besar hijau', type: 'button', html: ik('pensil') + (jw ? 'Ubah jawaban' : 'Jawab'), onclick: async () => { const v = await UI.keypadAngka({ tanya: S.soal.tanya, judul: 'Jawabanmu' }); if (v === null) return; const r = await A('sd-jawab', { j: v }); if (r.ok) { jwLokal = { j: v }; if (S) S.jawabanSaya = { j: v }; kC = ''; gambar(); } else UI.toast(r._s === 409 ? 'Waktu menjawab sudah ditutup' : 'Gagal terkirim. Coba lagi.', 'awas'); } }), jw ? el('span', { kelas: 'chip ok', gaya: 'font-size:1.2rem' }, 'Jawabanmu terkirim: ' + String(jw.j).replace('-', '−')) : el('span', { kelas: 'muted' }, 'Belum menjawab')));
      }
      if (['hasil', 'tanggapan', 'selesai'].includes(S.fase)) {
        if (S.hasilSoal && S.fase !== 'selesai') { const jw = S.jawabanSaya; isi.append(el('div', { kelas: 'umpan ' + (jw && jw.benar ? 'ok' : ''), html: '<span><b>Jawaban benar: ' + String(S.hasilSoal.kunci).replace('-', '−') + '</b> · ' + S.hasilSoal.persen + '% penonton benar. ' + (jw ? (jw.benar ? 'Jawabanmu benar.' : 'Jawabanmu: ' + String(jw.j).replace('-', '−') + '.') : 'Kamu belum menjawab.') + '</span>' }), el('div', { kelas: 'sd-jelas kecil' }, S.hasilSoal.jelas)); }
        if (S.fase === 'hasil' || S.fase === 'tanggapan') { const sv = S.suaraSaya || {}, p = sv.p || {}; isi.append(el('div', { kelas: 'eyebrow' }, 'Beri bintang · anonim'), bintang('Bintang untuk kelompok', sv.k || 0, (i) => kirimSuara({ k: i })), el('div', { kelas: 'sd-bgrid' }, S.anggota.map((a) => bintang('Pembicara: ' + depan(a.nama), p[a.idx] || 0, (i) => kirimSuara({ p: i, pembicara: a.idx }), S.pembicara === a.idx))), el('div', { kelas: 'muted kecil' }, 'Bintangmu tidak diketahui siapa pun. Boleh diubah selama waktu masih jalan.')); }
        if (S.fase === 'selesai') isi.append(el('div', { kelas: 'sd-besar' }, el('h3', null, 'Presentasi selesai'), el('p', null, 'Terima kasih sudah menyimak dan menilai!'), el('div', { kelas: 'baris', gaya: 'gap:.6rem;flex-wrap:wrap;justify-content:center' }, el('button', { kelas: 'btn besar hijau', type: 'button', html: ik('kirim') + 'Unduh catatan ' + NAMA[f], onclick: () => catatan(S.giliran) }), el('button', { kelas: 'btn besar sekunder', type: 'button', onclick: () => setView('dash') }, 'Kembali ke dasbor'))));
      }
    }
    function tick() { const t = document.getElementById('sd-timer'); if (!t || !S) return; const s = sisaFase(S, off); if (s == null) { t.textContent = ''; return; } t.textContent = wkt(s, S); t.className = 'sd-timer' + (s <= 10 && !S.jedaAt ? ' merah' : '') + (S.jedaAt ? ' jeda' : ''); }
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
    let D = null, kD = '', off = 0, pilihTg = null;
    const sdSet = async (o) => { const r = await E.ga('g-sd-set', o); if (!r.ok) UI.toast('Gagal menyimpan. Coba lagi.', 'awas'); await muat(true); return r; };
    async function muat(paksa) { const r = await E.ga('g-sd-status'); if (!r.ok) { if (r._s === 401) return; w.innerHTML = ''; w.append(el('div', { kelas: 'tengah-isi' }, el('h2', null, 'Server belum terjangkau'), el('p', { kelas: 'muted' }, 'Tekan Segarkan di bagian atas. Mode manual: jalankan sidang dari layar kelas tanpa aplikasi.'))); kD = ''; return; } D = r; off = r.sekarang - Date.now(); const k = JSON.stringify([r.sd, r.suara, r.jawab, r.tanggapan, r.nilai, r.nilaiI, r.kelompok, r.kelasBuka, pilihTg]); if (paksa || k !== kD) { kD = k; gambar(); } }
    const statusG = (g) => (D.sd.giliran === g && D.sd.fase !== 'selesai' ? 'sedang' : D.sd.selesai.includes(g) ? 'selesai' : 'belum');
    const FS = [['presentasi', 'Presentasi'], ['soal', 'Soal'], ['hasil', 'Hasil'], ['tanggapan', 'Bintang'], ['selesai', 'Selesai']];
    const tb = (t, ikon, kelas, fn, tip) => el('button', { type: 'button', kelas: 'btn kecil ' + (kelas || ''), title: tip || t, html: (ikon ? ik(ikon, 'kecil') : '') + esc(t), onclick: fn });
    function gambar() {
      const sd = D.sd, g = sd.giliran, kel = D.kelompok || [], ada = kel.some((x) => x.length), tengahBebas = g == null; w.innerHTML = '';
      const kiri = el('aside', { kelas: 'sdg-kiri' }), tengah = el('main', { kelas: 'sdg-tengah' }), kanan = el('aside', { kelas: 'sdg-kanan' }); w.append(kiri, tengah, kanan);
      /* ---- kiri: urutan, roda, setelan ---- */
      kiri.append(el('div', { kelas: 'sdg-sec' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Urutan tampil'), el('span', { kelas: 'chip ' + (sd.selesai.length === 9 ? 'ok' : 'abu') }, sd.selesai.length + ' / 9 selesai')));
      kiri.append(el('div', { kelas: 'sdg-alat' }, el('button', { type: 'button', kelas: 'btn sdg-roda-btn', html: ik('nyala') + 'Putar roda kelompok', onclick: roda }), tb('Salin kelompok', 'salin', 'sekunder', async () => { if (ada && !(await UI.konfirmasi('Timpa kelompok?', '<p class="tengah">Kelompok yang ada sekarang akan diganti dengan salinan dari pertemuan 1.</p>', 'Ya, salin', 'Batal'))) return; const r = await E.ga('g-salin-kelompok', { dari: 'xig' }); UI.toast(r.ok ? 'Kelompok disalin (' + r.terpasang + ' murid)' : (r.error === 'belum-ada-kelompok' ? 'Kelompok pertemuan 1 belum ada' : 'Gagal menyalin'), r.ok ? 'centang' : 'awas'); muat(true); }, 'Salin kelompok dari pertemuan 1'), tb(D.kelasBuka ? 'Kelas terbuka' : 'Buka kelas', D.kelasBuka ? 'centang' : 'gembok', D.kelasBuka ? 'hijau' : 'sorot', async () => { const r = await E.ga('g-kelas', { buka: !D.kelasBuka }); if (!r.ok) UI.toast(r.error === 'belum-ada-kelompok' ? 'Salin atau susun kelompok dulu' : 'Gagal', 'awas'); muat(true); }, D.kelasBuka ? 'Klik untuk menutup kelas' : 'Buka kelas untuk murid')));
      if (!ada) kiri.append(el('div', { kelas: 'umpan', html: ik('info') + '<span>Belum ada kelompok. Salin dari pertemuan 1 atau susun di tab Kelompok.</span>' }));
      const dl = el('div', { kelas: 'sdg-daftar' }); kiri.append(dl);
      for (let i = 0; i < 9; i++) {
        const st = statusG(i), names = (kel[i] || []).map((s) => depan(s.nama)).join(', ');
        dl.append(el('div', { kelas: 'sdg-kel fx-' + JENIS[i] + ' ' + st + (sd.berikut === i ? ' berikut' : '') },
          el('div', { kelas: 'sdg-kel-a' }, el('span', { html: UI.ubin(JENIS[i]) }), el('div', { gaya: 'flex:1;min-width:0' }, el('b', null, 'Kelompok ' + (i + 1)), el('div', { kelas: 'sdg-jn' }, NAMA[JENIS[i]])), el('span', { kelas: 'chip ' + (st === 'selesai' ? 'ok' : st === 'sedang' ? '' : 'abu') }, st === 'selesai' ? 'Selesai' : st === 'sedang' ? 'Tampil' : (sd.berikut === i ? 'Berikutnya' : 'Belum'))),
          el('div', { kelas: 'sdg-nm' }, names || 'kosong'),
          el('div', { kelas: 'sdg-kel-b' }, tb(g === i ? 'Ulang' : 'Mulai', 'main', '', async () => { if (g != null && g !== i && !['siap', 'selesai'].includes(sd.fase) && !(await UI.konfirmasi('Ganti kelompok?', '<p class="tengah">Kelompok ' + (g + 1) + ' belum ditandai selesai. Tetap pindah ke kelompok ' + (i + 1) + '?</p>', 'Ya, pindah', 'Batal'))) return; sdSet({ giliran: i, fase: 'presentasi' }); }, 'Mulai presentasi kelompok ini'), tb(sd.berikut === i ? 'Batal' : 'Berikut', 'panah', 'sekunder', () => sdSet({ berikut: sd.berikut === i ? -1 : i }), 'Tandai sebagai giliran selanjutnya'), tb('Layar', 'layar', 'sekunder', () => layarPresentasi(E, i), 'Tampilkan layar presentasi kelompok ini'))));
      }
      kiri.append(el('div', { kelas: 'sdg-kaki' }, tb('Excel', 'kirim', 'sekunder', unduhXlsx, 'Unduh nilai (.xlsx)'), tb('CSV', 'salin', 'sekunder', unduhCsv, 'Cadangan CSV'), tb('Rekap', 'buku', 'sekunder', rekapLihat, 'Lihat rekap nilai'), tb('Reset', 'hapus', 'bahaya', async () => { if (await UI.konfirmasi('Atur ulang sidang?', '<p class="tengah">Semua suara, jawaban, tanggapan, dan nilai guru pertemuan 2 akan dihapus. Tidak bisa dibatalkan.</p>', 'Hapus semua', 'Batal')) { await E.ga('g-sd-reset'); muat(true); } }, 'Atur ulang seluruh sidang')));
      /* ---- tengah ---- */
      if (tengahBebas) { tengah.append(el('div', { kelas: 'sdg-kosong' }, el('div', { kelas: 'sdg-kosong-i', html: ik('nyala', 'besar') }), el('h2', null, 'Siap memulai sidang'), el('p', { kelas: 'muted' }, 'Putar roda untuk memilih kelompok yang maju, atau tekan “Mulai” pada kelompok di sebelah kiri. Urutan bebas.'), el('button', { kelas: 'btn besar', type: 'button', html: ik('nyala') + 'Putar roda kelompok', onclick: roda }))); tickG(); return; }
      const f = JENIS[g], ang = sd.anggota, ci = FS.findIndex((x) => x[0] === sd.fase), berjalan = ['presentasi', 'soal', 'tanggapan'].includes(sd.fase);
      tengah.append(el('div', { kelas: 'sdg-kepala fx-' + f }, el('span', { html: UI.ubin(f) }), el('div', { gaya: 'flex:1;min-width:0' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, sd.fase === 'selesai' ? 'Baru selesai' : 'Sedang tampil'), el('h2', { gaya: 'margin:0' }, 'Kelompok ' + (g + 1) + ' · ' + NAMA[f]), el('div', { kelas: 'muted kecil sdg-nm' }, ang.map((a) => depan(a.nama)).join(', '))), el('button', { kelas: 'btn', type: 'button', html: ik('layar') + 'Layar Presentasi', onclick: () => layarPresentasi(E, g) })));
      tengah.append(el('div', { kelas: 'sdg-step' }, FS.map(([id, t], i) => el('button', { type: 'button', kelas: 'sdg-st' + (id === sd.fase ? ' on' : '') + (i < ci ? ' done' : ''), title: t, onclick: () => sdSet({ fase: id }), html: '<i>' + (i + 1) + '</i><span>' + t + '</span>' }))));
      const dur = el('div', { kelas: 'sdg-dur-baris' }, el('span', { kelas: 'muted kecil' }, 'Durasi bawaan:')); [['presentasi', 'Presentasi'], ['soal', 'Soal'], ['tanggapan', 'Tanggapan']].forEach(([id, t]) => dur.append(el('span', { kelas: 'sdg-dur' }, t + ' ' + fmtW(sd.durasi[id]), el('button', { type: 'button', 'aria-label': 'Kurangi 30 detik', onclick: () => sdSet({ durasi: { [id]: Math.max(30, sd.durasi[id] - 30) } }) }, '−'), el('button', { type: 'button', 'aria-label': 'Tambah 30 detik', onclick: () => sdSet({ durasi: { [id]: sd.durasi[id] + 30 } }) }, '+'))));
      tengah.append(el('div', { kelas: 'kartu sdg-tc' }, el('div', { kelas: 'sdg-tc-t' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Sisa waktu · ' + (FASE_NAMA[sd.fase] || '')), el('span', { kelas: 'sd-timer besar', id: 'sdg-timer' }), sd.jedaAt ? el('span', { kelas: 'chip warn' }, 'Dijeda') : (sd.tambah ? el('span', { kelas: 'chip abu' }, (sd.tambah > 0 ? '+' : '−') + fmtW(Math.abs(sd.tambah)) + ' disesuaikan') : null)), berjalan ? el('div', { kelas: 'sdg-tc-a' }, tb('−1 menit', 'kembali', 'sekunder', () => sdSet({ tambahDetik: -60 })), tb(sd.jedaAt ? 'Lanjut dari jeda' : 'Jeda', sd.jedaAt ? 'main' : 'jam', sd.jedaAt ? 'hijau denyut' : 'sekunder', () => sdSet({ jeda: !sd.jedaAt })), tb('+1 menit', 'panah', 'sekunder', () => sdSet({ tambahDetik: 60 })), tb('Ulang', 'ulang', 'sekunder', () => sdSet({ ulangFase: true }), 'Ulang waktu dari awal')) : el('div', { kelas: 'muted' }, 'Pewaktu aktif pada fase Presentasi, Soal, dan Tanggapan.'), dur));
      const sv = D.suara || { n: 0 }, jw = D.jawab || { n: 0, benar: 0 }, tg = D.tanggapan || {}, nTg = Object.keys(tg).length;
      tengah.append(el('div', { kelas: 'sdg-hitung' }, hit('Suara masuk', sv.n + ' / ' + D.penonton, sv.rata ? '★ ' + sv.rata.toFixed(1).replace('.', ',') + ' rata-rata' : 'belum ada'), hit('Jawaban masuk', jw.n + ' / ' + D.penonton, jw.n ? Math.round(jw.benar / jw.n * 100) + '% benar' : 'belum ada'), hit('Tanggapan', nTg + ' / 8', nTg ? 'tercatat' : 'belum ada')));
      if (ang.length) tengah.append(el('div', { kelas: 'baris', gaya: 'gap:.4rem;flex-wrap:wrap' }, el('span', { kelas: 'muted kecil' }, 'Bintang pembicara:'), ang.map((a) => { const r = (sv.pembicara || {})[a.idx]; return el('span', { kelas: 'chip' + (sd.pembicara === a.idx ? ' ok' : ' abu') }, depan(a.nama) + ' ' + (r && r.rata ? '★ ' + r.rata.toFixed(1).replace('.', ',') + ' (' + r.n + ')' : '–')); })));
      tengah.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.3rem' }, 'Papan tanggapan · ketuk kelompok yang berbicara'));
      const chips = el('div', { kelas: 'sdg-chips' }); for (let k = 0; k < 9; k++) { if (k === g) continue; const t = tg[k]; chips.append(el('button', { type: 'button', kelas: 'sdg-chip fx-' + JENIS[k] + (t ? ' ada' : '') + (pilihTg && pilihTg.k === k ? ' pilih' : ''), onclick: () => { pilihTg = { k, jenis: t ? t.jenis : null }; kD = ''; muat(true); } }, el('b', null, 'Kel. ' + (k + 1)), el('small', null, t ? JT[t.jenis] + (Number.isInteger(t.oleh) ? ' · ' + depan(((kel[k] || []).find((s) => s.idx === t.oleh) || {}).nama) : '') : '–'))); } tengah.append(chips);
      if (pilihTg && pilihTg.k !== g) { const k = pilihTg.k, p = el('div', { kelas: 'sdg-pilih' }); ap(p, el('b', null, 'Kelompok ' + (k + 1) + ': '), ['tanya', 'saran', 'apresiasi'].map((j) => el('button', { type: 'button', kelas: 'btn kecil ' + (pilihTg.jenis === j ? 'hijau' : 'sekunder'), onclick: () => { pilihTg.jenis = j; kD = ''; muat(true); } }, JT[j])));
        if (pilihTg.jenis) ap(p, el('span', { kelas: 'muted kecil' }, ' siapa?'), (kel[k] || []).map((s) => el('button', { type: 'button', kelas: 'btn kecil', onclick: async () => { await E.ga('g-sd-tanggapan', { giliran: g, kelompok: k, jenis: pilihTg.jenis, oleh: s.idx }); pilihTg = null; muat(true); } }, depan(s.nama))), el('button', { type: 'button', kelas: 'btn kecil sekunder', onclick: async () => { await E.ga('g-sd-tanggapan', { giliran: g, kelompok: k, jenis: pilihTg.jenis, oleh: null }); pilihTg = null; muat(true); } }, 'tanpa nama'));
        if (tg[k]) ap(p, el('button', { type: 'button', kelas: 'btn kecil bahaya', onclick: async () => { await E.ga('g-sd-tanggapan', { giliran: g, kelompok: k, jenis: null }); pilihTg = null; muat(true); } }, 'Batalkan'));
        ap(p, el('button', { type: 'button', kelas: 'btn kecil sekunder', onclick: () => { pilihTg = null; kD = ''; muat(true); } }, 'Tutup')); tengah.append(p); }
      /* ---- kanan: penilaian guru ---- */
      const nl = D.nilai || {}, rub = [['isi', 'Akurasi isi'], ['kedalaman', 'Kedalaman perincian'], ['kejelasan', 'Kejelasan'], ['kompak', 'Kekompakan']];
      kanan.append(el('div', { kelas: 'sdg-sec' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Penilaian guru'), el('span', { kelas: 'chip abu' }, 'Kelompok ' + (g + 1))));
      rub.forEach(([id, t]) => kanan.append(skala(t, nl[id], async (v) => { await E.ga('g-sd-nilai', { giliran: g, kriteria: { [id]: v } }); muat(true); })));
      kanan.append(el('div', { kelas: 'muted kecil' }, 'Skala 0–4. Dihitung rata-rata × 25.'));
      if (ang.length) { kanan.append(el('div', { kelas: 'sdg-sec', gaya: 'margin-top:.5rem' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Nilai individu (opsional)'))); ang.forEach((a) => kanan.append(skala(depan(a.nama), (D.nilaiI || {})[a.idx], async (v) => { await E.ga('g-sd-nilai', { giliran: g, idx: a.idx, nilaiI: v }); muat(true); }))); }
      tickG();
    }
    /* ---- roda putar ---- */
    function roda() {
      const sd = D.sd, sisa = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !sd.selesai.includes(i) && !(sd.giliran === i && sd.fase !== 'selesai'));
      if (!sisa.length) { UI.toast('Semua kelompok sudah tampil', 'info'); return; }
      const NSVG = 'http://www.w3.org/2000/svg', R = 150, n = sisa.length, seg = 360 / n, pol = (a, r) => [(r * Math.sin(a * Math.PI / 180)).toFixed(2), (-r * Math.cos(a * Math.PI / 180)).toFixed(2)];
      const mk = (t, at, txt) => { const e = document.createElementNS(NSVG, t); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; return e; };
      const svg = mk('svg', { viewBox: '-170 -185 340 350', class: 'roda-svg' }), grp = mk('g', { class: 'roda-g' }); svg.append(grp);
      if (n === 1) grp.append(mk('circle', { r: R, fill: warnaJenis(JENIS[sisa[0]]), stroke: '#fff', 'stroke-width': 3 }), mk('text', { x: 0, y: -60, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700, 'font-size': 24 }, 'Kel. ' + (sisa[0] + 1)));
      if (n > 1) sisa.forEach((gi, i) => { const a1 = i * seg, a2 = (i + 1) * seg, p1 = pol(a1, R), p2 = pol(a2, R), pm = pol(a1 + seg / 2, R * 0.66);
        grp.append(mk('path', { d: 'M0,0 L' + p1.join(',') + ' A' + R + ',' + R + ' 0 ' + (seg > 180 ? 1 : 0) + ' 1 ' + p2.join(',') + ' Z', fill: warnaJenis(JENIS[gi]), stroke: '#fff', 'stroke-width': 3 }));
        const t = mk('text', { x: pm[0], y: pm[1], 'text-anchor': 'middle', 'dominant-baseline': 'middle', transform: 'rotate(' + (a1 + seg / 2 > 180 ? a1 + seg / 2 + 90 : a1 + seg / 2 - 90) + ' ' + pm[0] + ' ' + pm[1] + ')', fill: '#fff', 'font-weight': 700, 'font-size': n > 6 ? 17 : 21, style: 'paint-order:stroke;stroke:rgba(0,0,0,.25);stroke-width:3px' }, 'Kel. ' + (gi + 1)); grp.append(t); });
      grp.append(mk('circle', { r: 26, fill: '#fff', stroke: '#E6E4F4', 'stroke-width': 4 })); svg.append(mk('path', { d: 'M-14,-172 L14,-172 L0,-146 Z', fill: '#1E1B4B', stroke: '#fff', 'stroke-width': 3, 'stroke-linejoin': 'round' }));
      const hasil = el('div', { kelas: 'roda-hasil' }, el('span', { kelas: 'muted' }, 'Tekan “Putar” untuk memilih kelompok yang maju.')), aksi = el('div', { kelas: 'baris', gaya: 'gap:.5rem;justify-content:center;flex-wrap:wrap' });
      let rot = 0, jalan = false, tutupFn = null;
      const putar = () => { if (jalan) return; jalan = true; aksi.innerHTML = ''; const i = Math.floor(Math.random() * n), gi = sisa[i]; rot = rot - (rot % 360) + 360 * 6 + (360 - (i + 0.5) * seg); grp.style.transition = 'transform 5.2s cubic-bezier(.12,.72,.08,1)'; grp.style.transform = 'rotate(' + rot + 'deg)'; hasil.innerHTML = '<span class="muted">Berputar…</span>';
        setTimeout(() => { jalan = false; hasil.innerHTML = '<div class="roda-menang fx-' + JENIS[gi] + '"><small>Yang maju</small><b>Kelompok ' + (gi + 1) + '</b><span>' + esc(NAMA[JENIS[gi]]) + '</span></div>'; ap(aksi, tb('Mulai sekarang', 'main', '', async () => { if (tutupFn) tutupFn(); await sdSet({ giliran: gi, fase: 'presentasi' }); }), tb('Jadikan berikutnya', 'panah', 'sorot', async () => { if (tutupFn) tutupFn(); await sdSet({ berikut: gi }); UI.toast('Kelompok ' + (gi + 1) + ' tampil berikutnya', 'centang'); }), tb('Putar lagi', 'ulang', 'sekunder', putar)); }, 5400); };
      const isi = el('div', { kelas: 'roda-wrap' }, el('div', { kelas: 'roda-kotak' }, svg), el('div', { kelas: 'roda-sisi' }, el('div', { kelas: 'eyebrow' }, n + ' kelompok belum tampil'), hasil, aksi)); ap(aksi, el('button', { kelas: 'btn besar', type: 'button', html: ik('nyala') + 'Putar', onclick: putar }));
      UI.dialog({ lebar: true, judul: 'Roda putar kelompok', ikon: ik('nyala', 'besar'), isi, tombol: [{ t: 'Tutup', nilai: null, kelas: 'sekunder' }], tutupLuar: true, saatBuka: (b, t) => { tutupFn = t; } });
    }
    const hit = (t, v, s) => el('div', { kelas: 'kartu sdg-h' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, t), el('b', null, v), el('span', { kelas: 'muted' }, s));
    const skala = (t, v, pilih) => { const r = el('div', { kelas: 'sdg-skala' }, el('span', { kelas: 'sdg-sk-t' }, t)), s = el('span', { kelas: 'sdg-sk' }); for (let i = 0; i <= 4; i++) s.append(el('button', { type: 'button', kelas: v === i ? 'on' : '', onclick: () => pilih(i) }, String(i))); r.append(s); return r; };
    function tickG() { const t = document.getElementById('sdg-timer'); if (!t || !D) return; const s = sisaFase(D.sd, off); t.textContent = s == null ? '–' : wkt(s, D.sd); t.className = 'sd-timer besar' + (s != null && s <= 10 && !D.sd.jedaAt ? ' merah' : '') + (D.sd.jedaAt ? ' jeda' : ''); }

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

  root.Sidang = { murid, guru, slide, catatan };
})(window);
