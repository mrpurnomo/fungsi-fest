/* Tahap lanjutan: pakar berpasangan — kartu pakar, saling menjelaskan, mencocokkan masalah dengan grafik, tiket keluar. */
(function (root) {
  'use strict';
  const { el, ik, esc, anim } = UI, B = BS, K = GF.K, NAMA = UI.NAMA;
  let E, tmrT = null;
  const T = () => E.P().t2;
  const kirim = (data) => { if (E.net() === 'online') E.api('t2', { idx: E.idx(), t2: data, tahap: 'tahap2' }); };
  const HURUF = ['A', 'B', 'C'];
  const VAR = { poli: 2, trig: 0 };
  const warnaFam = (f) => 'var(--f-' + f + ')';

  /* grafik tanpa angka sumbu (hanya bentuk) untuk pilihan */
  function miniGrafik(fam, berwarna) {
    const v = K[fam].varian[VAR[fam] || 0], b = GF.bidang(Object.assign({ W: 480, H: 340 }, v.spec, { xt: [], yt: [] })); if (v.tegak) v.tegak.forEach((x) => b.tegak(x, berwarna ? warnaFam(fam) : '#9B5DE5'));
    b.kurva(v.garis(), { warna: berwarna ? warnaFam(fam) : '#6D35E8', tebal: 6 }); (v.titik || []).forEach((p) => { b.lapis.titik.append(GF.S('circle', { cx: b.sx(p.x), cy: b.sy(p.y), r: 8, fill: p.t === 'kosong' ? '#fff' : (berwarna ? warnaFam(fam) : '#6D35E8'), stroke: berwarna ? warnaFam(fam) : '#6D35E8', 'stroke-width': 3.4 })); }); return b.svg;
  }

  /* ============================================================ penentuan pasangan */
  async function tentukan() {
    const t = T(); if (t.pas != null && t.fam) return;
    const r = await E.api('kelompok', { idx: E.idx() });
    if (r.ok && r.kelompok) { const g = r.kelompok[r.saya], pos = g.findIndex((s) => s.idx === E.idx()), bp = B.bagianPasangan(Math.max(0, pos), g.length); t.pas = bp.pasangan; t.fam = bp.keluarga; t.mitra = g.filter((s, i) => Math.min(bp.jumlahPasangan - 1, Math.floor(i / 2)) === bp.pasangan && s.idx !== E.idx()).map((s) => s.nama); t.grup = r.saya + 1; }
    else await pilihPasangan();
    E.simpan(); kirim({ pasangan: t.pas });
  }
  async function pilihPasangan() {
    const v = await UI.dialog({ judul: 'Kamu di pasangan mana?', ikon: ik('kelompok', 'besar'), isi: '<div class="tengah"><p>Kelompok berenam dibagi 3 pasangan: <b>A</b> (1–2), <b>B</b> (3–4), <b>C</b> (5–6) menurut urutan nama di daftar kelompok. Tanyakan gurumu bila belum jelas.</p></div>', tombol: [0, 1, 2].map((i) => ({ t: 'Pasangan ' + HURUF[i], nilai: i })) });
    const t = T(); t.pas = v == null ? 0 : v; t.fam = B.SET[t.pas].slice(); t.mitra = t.mitra || []; E.simpan();
  }

  /* ============================================================ pusat */
  async function hub() {
    E.bawahKosong(); E.gambarAtas(); clearInterval(tmrT); await tentukan(); const t = T(), fam = t.fam;
    const sel = { kartu: fam.every((f) => t.kartu[f]), jelas: !!t.jelasSelesai, cocok: !!t.cocok.selesai, tiket: !!t.tiket.selesai };
    const w = el('div', { kelas: 't2-hub' });
    const kiri = el('div', { kelas: 'kartu t2-kiri' }); kiri.innerHTML = '<div class="eyebrow">Tahap berikutnya</div><h2 style="margin-bottom:.2rem">Pakar Grafik</h2><p class="muted">Kamu dan pasanganmu menjadi pakar untuk beberapa jenis grafik, lalu saling menjelaskan di kelompok.</p>'
      + '<div class="eyebrow" style="margin-top:.4rem">Pasanganmu</div><div class="baris" style="flex-wrap:wrap"><span class="chip" style="font-size:1rem">Pasangan ' + HURUF[t.pas] + '</span>' + (t.grup ? '<span class="chip abu">Kelompok ' + t.grup + '</span>' : '') + '</div><div class="muted kecil" style="margin:.3rem 0">Bersama: <b>' + esc((t.mitra && t.mitra.length ? t.mitra.join(', ') : 'teman sebangku')) + '</b></div>'
      + '<div class="eyebrow" style="margin-top:.4rem">Jenis grafik yang kamu kuasai</div><div class="fam-chips">' + fam.map((f) => '<span class="chip fx-' + f + '" style="background:var(--tt);color:var(--td);font-size:.95rem">' + (t.kartu[f] ? ik('centang', 'kecil') : '') + NAMA[f] + '</span>').join('') + '</div>';
    kiri.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', gaya: 'margin-top:auto;align-self:flex-start', html: ik('ulang', 'kecil') + 'Ubah pasangan', onclick: async () => { await pilihPasangan(); hub(); } }));
    const kanan = el('div', { kelas: 't2-langkah' });
    const L = [['1', 'Kartu pakar', 'Pelajari rumus, bentuk grafik, dan contoh kehidupan. Jawab satu soal tiap kartu.', sel.kartu, kartuPakar, false], ['2', 'Jelaskan ke kelompok', 'Bergantian menjelaskan kartumu ke pasangan lain, dan menyimak penjelasan mereka.', sel.jelas, jelaskan, false], ['3', 'Cocokkan masalah', '5 masalah sehari-hari: pilih grafik yang paling cocok.', sel.cocok, cocok, false], ['4', 'Tiket keluar', '3 soal singkat dan refleksi. Kerjakan sendiri.', sel.tiket, tiket, !sel.cocok]];
    L.forEach(([no, j, d, ok, fn, kunci]) => kanan.append(el('div', { kelas: 'kartu t2-kartu' + (ok ? ' selesai' : '') + (kunci ? ' terkunci' : '') }, el('div', { kelas: 'baris' }, el('span', { kelas: 'no-bulat' }, ok ? ik('centang', 'kecil') : no), el('h3', { gaya: 'margin:0' }, j), ok ? el('span', { kelas: 'chip ok', gaya: 'margin-left:auto' }, 'selesai') : (kunci ? el('span', { kelas: 'chip abu', gaya: 'margin-left:auto', html: ik('kunci', 'kecil') + 'selesaikan langkah 3' }) : null)), el('p', { kelas: 'muted', gaya: 'margin:.3rem 0 .6rem' }, d), el('button', { kelas: 'btn' + (ok ? ' sekunder' : ''), type: 'button', gaya: 'margin-top:auto', disabled: kunci, html: (ok ? 'Buka lagi' : 'Mulai') + ik('panah'), onclick: fn }))));
    w.append(kiri, kanan);
    if (sel.kartu && sel.jelas && sel.cocok && sel.tiket) { const b = el('button', { kelas: 'btn hijau besar denyut', type: 'button', gaya: 'position:absolute;right:0;bottom:0', html: ik('bintang') + 'Lihat ringkasan akhir', onclick: tamat }); w.append(b); }
    E.layar(w);
  }

  /* ============================================================ langkah 1: kartu pakar */
  function isiKartu(f, o) {
    o = o || {}; const d = K[f], kolom = el('div', { kelas: 'isi fx-' + f, gaya: 'flex:1;min-height:0' }), kiri = el('div', { kelas: 'kotak-grafik' }), wad = el('div', { kelas: 'wadah' }); kiri.append(wad);
    const kanan = el('div', { kelas: 'info gulir' }), rk = el('div', { kelas: 'rumus-kartu' }), sv = el('div', { kelas: 'seg-varian' });
    kanan.append(el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(f) }).firstChild, el('h3', { gaya: 'margin:0;font-size:1.6rem;color:var(--td)' }, NAMA[f])), rk); if (d.varian.length > 1) kanan.append(sv);
    kanan.append(el('div', null, el('div', { kelas: 'eyebrow' }, 'Ciri grafik'), el('ul', { gaya: 'margin:.2rem 0;padding-left:1.2rem' }, d.ciri.map((x) => el('li', null, x)))), el('div', null, el('div', { kelas: 'eyebrow' }, 'Contoh dalam kehidupan'), el('ul', { gaya: 'margin:.2rem 0;padding-left:1.2rem' }, d.konteks.map((x) => el('li', null, x)))));
    const gambar = (v) => { wad.innerHTML = ''; const r = GF.gambarVarian(d.varian[v], 'var(--t)'); wad.append(r.b.svg); rk.innerHTML = '<div class="eyebrow" style="margin:0">Contoh fungsi · ' + esc(d.varian[v].nama) + '</div><div class="mat" style="font-size:' + (d.varian[v].rumus.length > 18 ? '1.35rem' : '2.1rem') + '">' + esc(d.varian[v].rumus) + '</div>'; GF.gambarKurva(r.kurva, 1200).then(() => r.b.svg.querySelectorAll('.tk').forEach((c) => c.setAttribute('opacity', 1))).catch(() => {}); };
    if (d.varian.length > 1) d.varian.forEach((v, k) => sv.append(el('button', { type: 'button', kelas: k === 0 ? 'aktif' : '', onclick: (e) => { [...sv.children].forEach((x) => x.classList.remove('aktif')); e.currentTarget.classList.add('aktif'); gambar(k); } }, v.nama.split('·')[0].trim())));
    gambar(0); kolom.append(kiri, kanan); return { kolom, kanan };
  }
  function kartuPakar() {
    E.bawahKosong(); const t = T(), fam = t.fam; let aktif = 0; const w = el('div', { kelas: 'kartu-wrap' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const daftar = el('div', { kelas: 'daftar gulir' }), f = fam[aktif], isi = el('div', { gaya: 'min-height:0;display:flex;flex-direction:column;gap:.5rem' });
      fam.forEach((x, i) => daftar.append(el('button', { kelas: 'tab fx-' + x + (i === aktif ? ' aktif' : '') + (t.kartu[x] ? ' lihat' : ''), type: 'button', html: UI.ubin(x) + '<span>' + NAMA[x] + '</span>' + ik('centang', 'kecil').replace('class="ik kecil"', 'class="ik kecil centang"'), onclick: () => { aktif = i; gambar(); } })));
      daftar.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', gaya: 'margin-top:auto', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub }));
      const { kolom, kanan } = isiKartu(f);
      kanan.append(el('div', { kelas: 'baris', gaya: 'margin-top:auto;justify-content:space-between' }, el('span', { kelas: 'chip ' + (t.kartu[f] ? 'ok' : 'abu') }, t.kartu[f] ? 'Sudah kamu kuasai' : 'Belum diuji'), el('button', { kelas: 'btn hijau', type: 'button', html: ik('ujian') + (t.kartu[f] ? 'Coba soal lagi' : 'Uji pemahaman'), onclick: () => uji(f) })));
      isi.append(kolom); w.append(el('div', { kelas: 'galeri', gaya: 'position:absolute;inset:0' }, daftar, isi));
    }
    async function uji(f) {
      const q = B.TANTANGAN[f], v = await UI.keypadAngka({ judul: 'Uji pemahaman · ' + NAMA[f], tanya: q.tanya, ikon: ik('ujian', 'besar') }); if (v == null) return;
      t.coba = t.coba || {}; t.coba[f] = (t.coba[f] || 0) + 1;
      if (v === q.kunci) { t.kartu[f] = 1; E.simpan(); kirim({ kartu: Object.keys(t.kartu) }); await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.3rem">' + esc(q.jelas) + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') }); E.konfeti(innerWidth / 2, innerHeight / 3, 30); if (fam.every((x) => t.kartu[x])) { await UI.info('Semua kartu selesai', '<div class="tengah"><p style="font-size:1.25rem">Kamu sudah menguasai semua kartumu. Saatnya menjelaskan ke teman.</p></div>', 'Kembali ke pusat'); return hub(); } gambar(); }
      else if (t.coba[f] >= 2) { t.kartu[f] = 2; E.simpan(); kirim({ kartu: Object.keys(t.kartu) }); await UI.info('Ini jawabannya', '<div class="tengah"><p style="font-size:1.3rem">' + esc(q.jelas) + '</p><p class="muted">Tidak apa-apa. Tanyakan pasanganmu bila masih bingung.</p></div>', 'Mengerti', { ikon: ik('info', 'besar') }); gambar(); }
      else { const lagi = await UI.dialog({ judul: 'Belum tepat', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu <b>' + String(v).replace('-', '−') + '</b> belum tepat.</p><p class="muted">Petunjuk: ganti <i>x</i> dengan angka yang diminta, lalu hitung pelan-pelan.</p></div>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Coba lagi', nilai: true }] }); if (lagi) uji(f); }
    }
    gambar();
  }

  /* ============================================================ langkah 2: saling menjelaskan */
  function jelaskan() {
    E.bawahKosong(); const t = T(), fam = t.fam, lain = B.SET.flat().filter((f) => !fam.includes(f)); t.jelas = t.jelas || {}; t.paham = t.paham || {}; if (!t.timerMulai) { t.timerMulai = 0; }
    const w = el('div', { kelas: 'jelas-wrap' }); E.layar(w);
    const DUR = 600, timer = el('span', { kelas: 'chip sorot', gaya: 'font-size:1.1rem' });
    const tick = () => { if (!t.timerMulai) { timer.innerHTML = ik('jam', 'kecil') + 'Pewaktu 10:00'; return; } const sisa = Math.max(0, DUR - Math.floor((Date.now() - t.timerMulai) / 1000)); timer.innerHTML = ik('jam', 'kecil') + String(Math.floor(sisa / 60)).padStart(2, '0') + ':' + String(sisa % 60).padStart(2, '0'); if (sisa <= 0) { clearInterval(tmrT); } };
    function gambar() {
      w.innerHTML = ''; const siapSelesai = lain.every((f) => t.paham[f]) || (t.timerMulai && Date.now() - t.timerMulai >= DUR * 1000);
      const kep = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.5rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Langkah 2'), el('h2', { gaya: 'margin:0' }, 'Saling menjelaskan')), el('div', { kelas: 'baris' }, timer, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('main', 'kecil') + (t.timerMulai ? 'Ulang pewaktu' : 'Mulai pewaktu'), onclick: () => { t.timerMulai = Date.now(); E.simpan(); clearInterval(tmrT); tmrT = setInterval(tick, 1000); tick(); gambar(); } }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub }), el('button', { kelas: 'btn hijau', type: 'button', disabled: !siapSelesai, html: ik('centang') + 'Selesai berbagi', onclick: () => { t.jelasSelesai = true; E.simpan(); hub(); } })));
      const isi = el('div', { kelas: 'jelas-isi' }), kiri = el('div', { kelas: 'kartu jelas-kol gulir' }), kanan = el('div', { kelas: 'kartu jelas-kol gulir' });
      kiri.append(el('h3', null, 'Giliranmu menjelaskan'), el('p', { kelas: 'muted kecil' }, 'Jelaskan kepada pasangan lain di kelompokmu. Centang bila sudah kamu sebutkan.'));
      fam.forEach((f) => { const j = t.jelas[f] = t.jelas[f] || [false, false, false]; kiri.append(el('div', { kelas: 'fam-baris fx-' + f }, el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(f) }).firstChild, el('b', { gaya: 'font-size:1.15rem;color:var(--td)' }, NAMA[f]), el('button', { kelas: 'btn sekunder kecil', type: 'button', gaya: 'margin-left:auto', html: ik('mata', 'kecil') + 'Lihat kartu', onclick: () => UI.dialog({ lebar: true, judul: NAMA[f], tutupX: true, tutupLuar: true, isi: isiKartu(f).kolom, tombol: [{ t: 'Tutup', nilai: true }] }) })), el('div', { kelas: 'baris', gaya: 'margin-top:.4rem;flex-wrap:wrap' }, ['Rumus', 'Bentuk grafik', 'Contoh kehidupan'].map((x, i) => el('button', { kelas: 'cek-chip' + (j[i] ? ' on' : ''), type: 'button', html: (j[i] ? ik('centang', 'kecil') : '') + x, onclick: () => { j[i] = !j[i]; E.simpan(); gambar(); } }))))); });
      kanan.append(el('h3', null, 'Giliranmu menyimak'), el('p', { kelas: 'muted kecil' }, 'Setelah pasangan lain menjelaskan, tandai: apakah kamu sudah paham?'));
      lain.forEach((f) => kanan.append(el('div', { kelas: 'fam-baris fx-' + f }, el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(f) }).firstChild, el('b', { gaya: 'color:var(--td)' }, NAMA[f]), el('div', { kelas: 'baris', gaya: 'margin-left:auto' }, el('button', { kelas: 'pil-paham ya' + (t.paham[f] === 'ya' ? ' on' : ''), type: 'button', html: ik('centang', 'kecil') + 'Paham', onclick: () => { t.paham[f] = 'ya'; E.simpan(); kirim({ paham: { [f]: 'ya' } }); gambar(); } }), el('button', { kelas: 'pil-paham bingung' + (t.paham[f] === 'bingung' ? ' on' : ''), type: 'button', html: ik('info', 'kecil') + 'Masih bingung', onclick: () => { t.paham[f] = 'bingung'; E.simpan(); kirim({ paham: { [f]: 'bingung' } }); gambar(); } }))))));
      isi.append(kiri, kanan); w.append(kep, isi);
    }
    gambar(); clearInterval(tmrT); tick(); if (t.timerMulai) tmrT = setInterval(tick, 1000);
  }

  /* ============================================================ langkah 3: cocokkan masalah dengan grafik */
  function tabelSit(s) { return '<table class="tabel-mini"><thead><tr><th>' + esc(s.x) + '</th><th>' + esc(s.y) + '</th></tr></thead><tbody>' + s.baris.map((r) => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</tbody></table>'; }
  function kartuSoal(item, o) {
    const s = B.SITUASI[item.situasi], w = el('div', { kelas: 'cocok-isi' }), kiri = el('div', { kelas: 'kartu cocok-sit' }), pil = el('div', { kelas: 'cocok-pilihan' });
    kiri.innerHTML = '<div class="eyebrow">Masalah sehari-hari</div><h3>' + esc(s.judul) + '</h3><p style="font-size:1.2rem">' + esc(s.teks) + '</p>' + tabelSit(s) + '<p class="muted kecil" style="margin:.4rem 0 0">Grafik mana yang bentuknya paling cocok?</p>';
    item.opsi.forEach((f, k) => { const tombol = el('button', { kelas: 'opsi-grafik' + (o.jawab != null ? (k === item.kunci ? ' benar' : (k === o.jawab ? ' salah' : '')) : ''), type: 'button', disabled: o.jawab != null, onclick: () => o.pilih(k) }, el('span', { kelas: 'hrf' }, 'ABC'[k]), miniGrafik(f, o.jawab != null), o.jawab != null ? el('span', { kelas: 'nm-fam' }, NAMA[f]) : null); pil.append(tombol); });
    w.append(kiri, pil); return w;
  }
  function cocok() {
    E.bawahKosong(); const t = T(), soal = B.cocokSiswa(E.idx()); let no = Math.min(t.cocok.jawab.length, 4); const w = el('div', { kelas: 'cocok-wrap' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const selesai = t.cocok.jawab.length >= 5;
      if (selesai && t.cocok.tampilHasil !== false) return hasil();
      const item = soal[no], terjawab = t.cocok.jawab[no];
      w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.5rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Langkah 3 · masalah ' + (no + 1) + ' dari 5'), el('h2', { gaya: 'margin:0' }, 'Cocokkan dengan grafik')), el('div', { kelas: 'baris' }, el('div', { kelas: 'nomor-grid', gaya: 'grid-template-columns:repeat(5,2.6rem)' }, soal.map((_, i) => el('button', { kelas: 'no' + (i === no ? ' aktif' : '') + (t.cocok.jawab[i] != null ? ' isi' : ''), type: 'button', onclick: () => { no = i; gambar(); } }, i + 1))), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub }))));
      w.append(kartuSoal(item, { jawab: terjawab, pilih: async (k) => { t.cocok.jawab[no] = k; E.simpan(); const ok = k === item.kunci; await UI.dialog({ judul: ok ? 'Tepat!' : 'Belum tepat', ikon: ik(ok ? 'centang' : 'silang', 'besar'), isi: '<div class="tengah"><p style="font-size:1.3rem">Ini fungsi <b>' + NAMA[item.fam] + '</b>.</p><p>' + esc(K[item.fam].ciri[0]) + '</p></div>', tombol: [{ t: no < 4 && t.cocok.jawab.length < 5 ? 'Berikutnya' : 'Lihat hasil', nilai: true }] }); if (ok) E.konfeti(innerWidth / 2, innerHeight / 3, 24); const sisa = soal.findIndex((_, i) => t.cocok.jawab[i] == null); if (sisa < 0) { t.cocok.benar = soal.filter((s, i) => t.cocok.jawab[i] === s.kunci).length; t.cocok.selesai = true; E.simpan(); kirim({ cocok: { benar: t.cocok.benar } }); t.cocok.tampilHasil = true; hasil(); } else { no = sisa; gambar(); } } }));
    }
    function hasil() {
      w.innerHTML = ''; const b = soal.filter((s, i) => t.cocok.jawab[i] === s.kunci).length;
      const k = el('div', { kelas: 'tengah-isi kartu', gaya: 'padding:2rem 3rem' }); k.innerHTML = '<div class="eyebrow" style="justify-content:center">Langkah 3 selesai</div><h2>' + b + ' dari 5 masalah tepat</h2><div class="baris" style="justify-content:center;flex-wrap:wrap">' + soal.map((s, i) => '<span class="chip ' + (t.cocok.jawab[i] === s.kunci ? 'ok' : 'warn') + '">' + (i + 1) + '. ' + esc(B.SITUASI[s.situasi].judul) + ' · ' + NAMA[s.fam] + '</span>').join('') + '</div><p class="muted">Yang belum tepat tidak apa-apa. Kamu bisa membahasnya bersama kelompok.</p>';
      k.append(el('div', { kelas: 'baris', gaya: 'justify-content:center' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Lihat lagi', onclick: () => { t.cocok.tampilHasil = false; no = 0; gambar(); } }), el('button', { kelas: 'btn', type: 'button', html: 'Ke pusat' + ik('panah'), onclick: hub })));
      w.append(k);
    }
    gambar();
  }

  /* ============================================================ langkah 4: tiket keluar + refleksi */
  function tiket() {
    E.bawahKosong(); const t = T(), idx = E.idx(), soal = B.tiketSiswa(idx), tk = t.tiket; tk.jawab = tk.jawab || [null, null, null]; let no = 0; const w = el('div', { kelas: 'cocok-wrap' }); E.layar(w);
    const terisi = () => tk.jawab.filter((v) => v != null).length;
    function gambar() {
      if (tk.selesai && !tk.ref) { return; } w.innerHTML = ''; const q = soal[no], j = tk.jawab[no];
      w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.5rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Tiket keluar · soal ' + (no + 1) + ' dari 3'), el('h2', { gaya: 'margin:0' }, 'Kerjakan sendiri')), el('div', { kelas: 'baris' }, el('div', { kelas: 'nomor-grid', gaya: 'grid-template-columns:repeat(3,2.6rem)' }, soal.map((_, i) => el('button', { kelas: 'no' + (i === no ? ' aktif' : '') + (tk.jawab[i] != null ? ' isi' : ''), type: 'button', onclick: () => { no = i; gambar(); } }, i + 1))), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub }), el('button', { kelas: 'btn hijau', type: 'button', disabled: terisi() < 3, html: ik('kirim') + 'Kumpulkan tiket', onclick: kumpul }))));
      if (q.jenis === 'hitung') { const k = el('div', { kelas: 'kartu tengah-isi', gaya: 'padding:2rem 3rem;max-width:44rem' }); k.innerHTML = '<div class="teks-soal" style="font-size:2.2rem">' + q.tanya + '</div><div class="layar-angka' + (j == null ? ' kosong' : '') + '" style="min-width:10rem">' + (j == null ? '…' : String(j).replace('-', '−')) + '</div>'; k.append(el('button', { kelas: 'btn besar', type: 'button', html: ik('pensil') + 'Isi jawaban', onclick: async () => { const v = await UI.keypadAngka({ judul: 'Jawabanmu', tanya: q.tanya }); if (v != null) { tk.jawab[no] = v; E.simpan(); gambar(); } } })); w.append(k); }
      else if (q.jenis === 'nama') { const k = el('div', { kelas: 'cocok-isi' }), kiri = el('div', { kelas: 'kartu cocok-sit' }); kiri.append(el('div', { kelas: 'eyebrow' }, 'Perhatikan grafik'), el('div', { gaya: 'height:15rem' }, miniGrafik(q.fam, false)), el('p', { kelas: 'teks-soal', gaya: 'font-size:1.3rem;margin-top:.6rem' }, q.tanya)); const op = el('div', { kelas: 'opsi-wrap', gaya: 'grid-template-columns:1fr;align-content:center' }); q.opsi.forEach((f, i) => op.append(el('button', { kelas: 'opsi' + (j === i ? ' pilih' : ''), type: 'button', html: '<span class="huruf">' + 'ABCD'[i] + '</span><span>' + NAMA[f] + '</span>', onclick: () => { tk.jawab[no] = i; E.simpan(); gambar(); } }))); k.append(kiri, op); w.append(k); }
      else { w.append(kartuSoal(q, { jawab: null, pilih: (k) => { tk.jawab[no] = k; E.simpan(); gambar(); } })); if (j != null) { const pl = w.querySelectorAll('.opsi-grafik'); pl[j] && pl[j].classList.add('dipilih'); } }
      const sel = w.querySelectorAll('.opsi-grafik'); if (j != null && sel[j]) sel[j].classList.add('dipilih');
    }
    async function kumpul() {
      const ya = await UI.konfirmasi('Kumpulkan tiket?', '<div class="tengah"><p style="font-size:1.25rem">Semua soal sudah terjawab.</p><p class="muted">Setelah dikumpulkan, jawaban tidak bisa diubah.</p></div>', 'Ya, kumpulkan', 'Periksa lagi'); if (!ya) return;
      const ok = soal.map((q, i) => (q.jenis === 'hitung' ? tk.jawab[i] === q.kunci : tk.jawab[i] === q.kunci)); tk.skor = ok.filter(Boolean).length; tk.selesai = true; tk.ok = ok; E.simpan(); kirim({ tiket: { skor: tk.skor } });
      await UI.dialog({ lebar: true, judul: 'Hasil tiket: ' + tk.skor + ' dari 3', ikon: ik(tk.skor >= 2 ? 'centang' : 'info', 'besar'), isi: soal.map((q, i) => '<div class="umpan ' + (ok[i] ? 'ok' : 'hint') + '" style="margin:.4rem 0;align-items:flex-start">' + ik(ok[i] ? 'centang' : 'info') + '<span><b>Soal ' + (i + 1) + ':</b> ' + (q.jenis === 'cocok' ? 'Masalah “' + esc(B.SITUASI[q.situasi].judul) + '”: fungsi ' + NAMA[q.fam] + '.' : esc(q.jelas)) + '</span></div>').join(''), tombol: [{ t: 'Lanjut ke refleksi', nilai: true }] });
      refleksi();
    }
    if (tk.selesai) return refleksi(); gambar();
  }
  function refleksi() {
    const t = T(); t.ref = t.ref || { mudah: null, bingung: null }; const w = el('div', { kelas: 'ref-wrap' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const pil = (jenis) => el('div', { kelas: 'ref-grid' }, B.SET.flat().map((f) => el('button', { kelas: 'ref-pil fx-' + f + (t.ref[jenis] === f ? ' on' : ''), type: 'button', html: UI.ubin(f) + '<span>' + NAMA[f] + '</span>', onclick: () => { t.ref[jenis] = f; E.simpan(); gambar(); } })));
      w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.4rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Refleksi'), el('h2', { gaya: 'margin:0' }, 'Bagaimana belajarmu hari ini?')), el('button', { kelas: 'btn hijau', type: 'button', disabled: !(t.ref.mudah && t.ref.bingung), html: ik('centang') + 'Selesai', onclick: () => { kirim({ ref: t.ref, selesai: true }); t.tamat = true; E.simpan(); tamat(); } })), el('div', { kelas: 'kartu', gaya: 'margin-bottom:.6rem' }, el('h3', null, 'Grafik yang paling mudah kupahami'), pil('mudah')), el('div', { kelas: 'kartu' }, el('h3', null, 'Grafik yang masih membuatku bingung'), pil('bingung')));
    }
    gambar();
  }
  function tamat() {
    E.bawahKosong(); const t = T(); const w = el('div', { kelas: 'tengah-isi kartu', gaya: 'padding:2.4rem 3.4rem' }); const b = B.cocokSiswa(E.idx()).filter((s, i) => t.cocok.jawab[i] === s.kunci).length;
    w.innerHTML = '<span class="ubin fx-akar" style="width:5.5rem;height:5.5rem;margin:0 auto">' + ik('bintang') + '</span><h1 style="font-size:2.6rem">Kerja bagus, ' + esc(B.nama(E.idx()).split(' ')[0]) + '!</h1><div class="baris" style="justify-content:center;flex-wrap:wrap"><span class="chip ok" style="font-size:1.05rem">' + (t.fam || []).filter((f) => t.kartu[f]).length + ' kartu pakar</span><span class="chip ok" style="font-size:1.05rem">Cocokkan: ' + b + ' dari 5</span><span class="chip ok" style="font-size:1.05rem">Tiket: ' + (t.tiket.skor || 0) + ' dari 3</span></div><p class="muted" style="font-size:1.2rem;max-width:34rem">Hari ini kamu belajar menghitung nilai fungsi, menggambar grafiknya, dan mengenal 9 jenis grafik. Tugas kecil: temukan satu hal di sekitarmu yang grafiknya mirip salah satu dari 9 jenis ini.</p>';
    w.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali ke pusat', onclick: hub })); E.layar(w, 'tengah-layar'); setTimeout(() => E.konfeti(innerWidth / 2, innerHeight * .3, 90), 400);
  }

  root.Tahap2 = { mulai: (env) => { E = env; const P = E.P(); P.t2 = P.t2 || {}; const t = P.t2; t.kartu = t.kartu || {}; t.jelas = t.jelas || {}; t.paham = t.paham || {}; t.cocok = t.cocok || { jawab: [] }; t.cocok.jawab = t.cocok.jawab || []; t.tiket = t.tiket || {}; hub(); } };
})(window);
