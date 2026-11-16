/* Tahap lanjutan: pakar berpasangan. Langkah berurutan, dibuka guru:
   1 Kartu pakar · 2 Tebak fungsinya (diskusi kelompok) · 3 Cocokkan grafik · 4 Tiket keluar + refleksi + Kartu Penghargaan */
(function (root) {
  'use strict';
  const { el, ik, esc, anim } = UI, B = BS, K = GF.K, NAMA = UI.NAMA;
  let E, tmrCek = null;
  const T = () => E.P().t2;
  const XG = () => B.cfg(B.kelasAktif()).manual;
  const NO = () => (XG() ? { kartu: 1, pam: 2, dis: 3, cocok: 4, fung: 5, tiket: 6 } : { kartu: 1, dis: 2, cocok: 3, tiket: 4 });
  const kirim = (d) => { if (E.net() === 'online') E.api('t2', { idx: E.idx(), t2: d, tahap: 'tahap2' }); };
  const HURUF = ['A', 'B', 'C'], VAR = { poli: 2, trig: 0 }, warnaFam = (f) => 'var(--f-' + f + ')';
  const WARNA9 = ['poli', 'eksp', 'log', 'trig', 'rasional', 'akar', 'mutlak', 'tangga', 'sepotong'];
  const inisial = (n) => { const k = String(n).split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); if (!k.length) return '?'; return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };
  const num = (v) => { if (typeof v === 'number') return v; const s = String(v); return parseFloat(s.indexOf(',') >= 0 ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\./g, '')); };
  const F = (n) => String(n).replace('-', '−');
  const adaFam = (f, arr) => (arr || []).indexOf(f) >= 0;

  /* ---------- poin & sinkron ke guru ---------- */
  function hitung() { const t = T(); return B.hitungPoin({ kartu: t.kartu, fam: t.fam, diskusi: t.dis, cocok: t.cocok, tiket: t.tiket, pam: t.pam, fung: t.fung, tamat: t.tamat }); }
  function sinkron(extra) { const t = T(), p = hitung(); t.poin = p.poin; t.lencana = p.lencana; E.simpan(); kirim(Object.assign({ poin: p.poin, lencana: p.lencana, sel: status() }, extra || {})); return p; }

  /* ---------- grafik bantu ---------- */
  function miniGrafik(fam, berwarna) {
    const v = K[fam].varian[VAR[fam] || 0], b = GF.bidang(Object.assign({ W: 480, H: 340 }, v.spec, { xt: [], yt: [] })); if (v.tegak) v.tegak.forEach((x) => b.tegak(x, berwarna ? warnaFam(fam) : '#9B5DE5'));
    b.kurva(v.garis(), { warna: berwarna ? warnaFam(fam) : '#6D35E8', tebal: 6 }); (v.titik || []).forEach((p) => { b.lapis.titik.append(GF.S('circle', { cx: b.sx(p.x), cy: b.sy(p.y), r: 8, fill: p.t === 'kosong' ? '#fff' : (berwarna ? warnaFam(fam) : '#6D35E8'), stroke: berwarna ? warnaFam(fam) : '#6D35E8', 'stroke-width': 3.4 })); }); return b.svg;
  }
  /* titik-titik data masalah sehari-hari digambar pada bidang Kartesius; kurva dihaluskan untuk jenis yang mulus */
  const MULUS = ['poli', 'eksp', 'log', 'trig', 'rasional', 'akar'];
  function plotData(s, fam, o) {
    const xs = s.baris.map((r) => num(r[0])), ys = s.baris.map((r) => num(r[1]));
    const rentang = (a) => { let lo = Math.min.apply(null, a), hi = Math.max.apply(null, a); const r = (hi - lo) || 1; lo = (lo >= 0 && lo <= 0.4 * hi) ? 0 : lo - 0.14 * r; return [lo, hi + 0.14 * r]; };
    const [x0, x1] = rentang(xs), [y0, y1] = rentang(ys);
    const b = GF.bidang({ W: 460, H: 330, xmin: x0, xmax: x1, ymin: y0, ymax: y1, xt: xs, yt: ys, labelX: s.x, labelY: s.y, label: 'Titik data ' + s.judul }), P = xs.map((x, i) => [b.sx(x), b.sy(ys[i])]), warna = fam ? warnaFam(fam) : '#6D35E8';
    if (fam && MULUS.indexOf(fam) >= 0 && P.length > 2) { let d = 'M' + P[0][0].toFixed(1) + ' ' + P[0][1].toFixed(1); for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ',' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ',' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } b.lapis.kurva.append(GF.S('path', { d, fill: 'none', stroke: warna, 'stroke-width': 4.5, 'stroke-linecap': 'round', opacity: .85 })); }
    else if (fam === 'tangga') { for (let i = 0; i < P.length - 1; i++) if (ys[i] === ys[i + 1]) b.lapis.kurva.append(GF.S('line', { x1: P[i][0], y1: P[i][1], x2: P[i + 1][0], y2: P[i + 1][1], stroke: warna, 'stroke-width': 4.5, 'stroke-linecap': 'round' })); }
    else b.lapis.kurva.append(GF.S('polyline', { points: P.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' '), fill: 'none', stroke: warna, 'stroke-width': 4.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: .85 }));
    xs.forEach((x, i) => b.titik(x, ys[i], { teks: !!(o && o.label), r: 9, warna: '#1E1B4B' })); return b.svg;
  }
  /* penjelasan dengan tombol untuk melihat grafiknya (tidak langsung di soal supaya siswa membaca soalnya) */
  function grafikDialog(s, fam) {
    const isi = el('div', { kelas: 'gd' }); isi.innerHTML = '<div><div class="eyebrow">Titik-titik datanya</div><div class="gd-g"></div><p class="muted kecil" style="margin:.3rem 0 0">Titik-titik dihubungkan agar polanya terlihat.</p></div><div><div class="eyebrow">Bentuk grafik fungsi ' + NAMA[fam] + '</div><div class="gd-g gd-b"></div><p class="muted kecil" style="margin:.3rem 0 0">' + esc(K[fam].ciri[0]) + '</p></div>';
    const g = isi.querySelectorAll('.gd-g'); g[0].append(plotData(s, fam)); g[1].append(miniGrafik(fam, true));
    return UI.dialog({ lebar: true, judul: 'Grafik untuk “' + esc(s.judul) + '”', ikon: ik('mata', 'besar'), isi, tombol: [{ t: 'Kembali ke penjelasan', nilai: true }] });
  }
  async function penjelasan(o) {
    for (;;) {
      const salah = o.pilihF && o.pilihF !== o.fam, isi = el('div'); isi.innerHTML = '<p style="font-size:1.3rem;margin:0 0 .5rem">Ini fungsi <b>' + NAMA[o.fam] + '</b>' + (salah ? ', bukan ' + NAMA[o.pilihF] : '') + '.</p><p style="margin:.2rem 0;font-size:1.1rem"><b>Mengapa?</b> ' + esc(o.s.alasan) + '</p>' + (salah ? '<p class="muted" style="margin:.4rem 0">Ciri <b>' + NAMA[o.pilihF] + '</b>: ' + esc(K[o.pilihF].ciri[0]) + ' Data pada soal tidak seperti itu.</p>' : '') + '<p class="muted kecil" style="margin:.6rem 0 0">Ingin melihat gambarnya? Tekan “Lihat grafiknya”.</p>';
      const v = await UI.dialog({ lebar: true, judul: o.judul, ikon: ik(o.ok ? 'centang' : 'info', 'besar'), isi, tombol: [{ t: 'Lihat grafiknya', nilai: 'grafik', kelas: 'sekunder', ikon: 'mata' }, { t: o.lanjut || 'Lanjut', nilai: true }] });
      if (v === 'grafik') await grafikDialog(o.s, o.fam); else return;
    }
  }
  const tabelData = (s) => '<table class="tabel-mini"><thead><tr><th>' + esc(s.x) + '</th><th>' + esc(s.y) + '</th></tr></thead><tbody>' + s.baris.map((r) => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td></tr>').join('') + '</tbody></table>';

  /* ---------- kerangka layar: kepala, isi, navigasi ---------- */
  function kerangka(eyebrow, judul, o) {
    o = o || {}; const w = el('div', { kelas: 't2-bingkai' }), kep = el('div', { kelas: 't2-kepala' }), isi = el('div', { kelas: 't2-isi' }), nav = el('div', { kelas: 't2-nav' });
    const kiri = el('div', null, el('div', { kelas: 'eyebrow' }, eyebrow), el('h2', { gaya: 'margin:0' }, judul)), kanan = el('div', { kelas: 'baris' });
    if (o.titik) kanan.append(el('div', { kelas: 't2-titik' }, o.titik.map((s, i) => el('button', { type: 'button', 'aria-label': 'Nomor ' + (i + 1), kelas: 'dt' + (s === 'now' ? ' now' : '') + (s === 'isi' ? ' isi' : ''), onclick: o.ke ? () => o.ke(i) : null }, String(i + 1)))));
    if (o.pusat !== false) kanan.append(el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub }));
    kep.append(kiri, kanan); w.append(kep, isi, nav); return { w, isi, nav };
  }
  const tombol = (t, ikon, o) => el('button', Object.assign({ kelas: 'btn ' + ((o && o.kelas) || ''), type: 'button', html: (o && o.kiri ? ik(ikon, 'kecil') + t : t + (ikon ? ik(ikon, 'kecil') : '')) }, o && o.p ? o.p : {}));

  /* ============================================================ penentuan pasangan */
  async function tentukan() {
    const t = T(); if (t.pas != null && t.fam && t.fam.length) return;
    const r = await E.api('kelompok', { idx: E.idx() });
    if (XG()) { if (r.ok && r.kelompok && r.kelompok[r.saya]) { const g = r.kelompok[r.saya]; t.grup = r.saya + 1; t.pas = 0; t.fam = [B.SET.flat()[r.saya % 9]]; t.pos = Math.max(0, g.findIndex((x) => x.idx === E.idx())); t.mitra = g.filter((x) => x.idx !== E.idx()).map((x) => x.nama); } else { t.pas = 0; t.fam = [B.SET.flat()[0]]; t.mitra = []; t.grup = null; t.pos = 0; } E.simpan(); kirim({ pasangan: 0 }); return; }
    if (r.ok && r.kelompok && r.kelompok[r.saya]) {
      const g = r.kelompok[r.saya], pos = Math.max(0, g.findIndex((s) => s.idx === E.idx())), bp = B.bagianPasangan(pos, g.length);
      t.pas = bp.pasangan; t.fam = bp.keluarga.length ? bp.keluarga : B.SET[bp.pasangan % 3].slice(); t.pos = pos; t.grup = r.saya + 1;
      if (E.idx() === B.DUMMY && g.length < 2) { t.pas = 0; t.fam = B.SET[0].slice(); t.pos = 0; t.mitra = ['Teman Contoh']; E.simpan(); kirim({ pasangan: t.pas }); return; }
      t.mitra = g.filter((s, i) => Math.min(bp.jumlahPasangan - 1, Math.floor(i / 2)) === bp.pasangan && s.idx !== E.idx()).map((s) => s.nama);
    } else { await pilihPasangan(); }
    E.simpan(); kirim({ pasangan: t.pas });
  }
  async function pilihPasangan() {
    const v = await UI.dialog({ judul: 'Kamu di pasangan mana?', ikon: ik('kelompok', 'besar'), isi: '<div class="tengah"><p>Kelompok berenam dibagi 3 pasangan: <b>A</b> (urutan 1–2), <b>B</b> (3–4), <b>C</b> (5–6) menurut daftar kelompok di layar guru.</p></div>', tombol: [0, 1, 2].map((i) => ({ t: 'Pasangan ' + HURUF[i], nilai: i })) });
    const t = T(); t.pas = v == null ? 0 : v; t.fam = B.SET[t.pas].slice(); t.mitra = t.mitra || []; t.pos = t.pas * 2; t.grup = t.grup || null; E.simpan();
  }
  async function sapaPasangan() {
    const t = T(), aku = B.nama(E.idx()), av = (n, tag) => '<div class="av-kol"><span class="av-besar fx-' + WARNA9[(n.length + (tag ? 1 : 3)) % 9] + '">' + esc(inisial(n)) + '</span><b>' + esc(n.split(/\s+/).slice(0, 2).join(' ')) + '</b>' + (tag ? '<span class="muted kecil">kamu</span>' : '') + '</div>';
    const teman = t.mitra && t.mitra.length;
    const isi = '<div class="tengah"><p style="font-size:1.35rem;margin:.1rem 0 .4rem">' + (teman ? (XG() ? 'Teman sekelompokmu adalah <b>' : 'Pasangan belajarmu adalah <b>') + t.mitra.map(esc).join(' dan ') + '</b>.' : 'Kamu belajar sendiri untuk bagian ini. Kamu boleh bertanya kepada teman sekelompokmu.') + '</p>'
      + '<div class="baris" style="justify-content:center;gap:1.4rem;margin:.6rem 0">' + av(aku, true) + (teman ? '<span class="plus-p">+</span>' + t.mitra.map((m) => av(m, false)).join('') : '') + '</div>'
      + '<div class="eyebrow" style="justify-content:center;margin-top:.8rem">Tugas ' + (teman ? 'kalian' : 'kamu') + ': jadi pakar untuk</div><div class="baris" style="justify-content:center;flex-wrap:wrap;gap:.5rem;margin-top:.3rem">' + t.fam.map((f) => '<span class="chip fx-' + f + '" style="background:var(--tt);color:var(--td);font-size:1.05rem">' + UI.ubin(f) + NAMA[f] + '</span>').join('') + '</div>'
      + (XG() ? '<p class="muted" style="margin:.8rem 0 0">Kelompok ' + t.grup + ' akan menjelaskan jenis grafik ini kepada seluruh kelas pada <b>Pameran Pakar</b>. Siapkan dulu bersama temanmu.</p></div>' : '<p class="muted" style="margin:.8rem 0 0">Pasangan ini tidak diubah, supaya semua kelompok punya pakar untuk sembilan jenis grafik.</p></div>');
    await UI.dialog({ judul: 'Selamat!', ikon: ik('bintang', 'besar'), isi, lebar: true, tombol: [{ t: 'Mulai belajar', nilai: true, ikon: 'panah' }] });
    E.konfeti(innerWidth / 2, innerHeight / 3, 50);
  }

  /* ============================================================ pusat */
  const pamSelesai = (t) => Object.keys((t.pam && t.pam.jawab) || {}).length >= 9;
  const status = () => { const t = T(); if (XG()) return [t.fam.every((f) => t.kartu[f]), pamSelesai(t), !!t.dis.selesai, !!t.cocok.selesai, !!(t.fung && t.fung.selesai), !!t.tamat]; return [t.fam.every((f) => t.kartu[f]), !!t.dis.selesai, !!t.cocok.selesai, !!t.tamat]; };
  function terbuka(k, sel) { if (E.idx() === B.DUMMY) return true; if (E.net() === 'online') return (T().aktif || [1]).indexOf(k) >= 0; return k === 1 || sel[k - 2]; }
  async function hub() {
    E.bawahKosong(); E.gambarAtas(); await tentukan(); const t = T(); if (!t.sapa) { await sapaPasangan(); t.sapa = true; E.simpan(); }
    mulaiCek(); render(); kirim({ sel: status() });
  }
  function render() {
    const t = T(), sel = status(), selesai = sel.filter(Boolean).length, p = hitung(), fam = t.fam; const w = el('div', { kelas: 't2-hub' });
    /* sisi kiri */
    const sisi = el('aside', { kelas: 'kartu t2-sisi' }), tim = [B.nama(E.idx())].concat(t.mitra || []);
    sisi.append(el('div', { kelas: 'eyebrow' }, 'Pakar Grafik' + (t.grup ? ' · Kelompok ' + t.grup : '')));
    sisi.append(el('div', { kelas: 't2-tim', html: tim.map((n, i) => '<div class="av-kol kecil"><span class="av-besar kecil fx-' + WARNA9[(n.length + i * 4) % 9] + '">' + esc(inisial(n)) + '</span><span>' + esc(n.split(/\s+/)[0]) + (i === 0 ? ' <span class="muted kecil">(kamu)</span>' : '') + '</span></div>').join('') }));
    const R = 34, C = 2 * Math.PI * R;
    sisi.append(el('div', { kelas: 't2-kemajuan', html: '<svg viewBox="0 0 80 80" class="cincin"><circle cx="40" cy="40" r="' + R + '" fill="none" stroke="#E4D9FC" stroke-width="8"/><circle cx="40" cy="40" r="' + R + '" fill="none" stroke="#6D35E8" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (C * selesai / sel.length).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 40 40)"/><text x="40" y="47" text-anchor="middle" font-size="22" font-weight="700" font-family="Bricolage,sans-serif" fill="#1E1B4B">' + selesai + '/' + sel.length + '</text></svg><div><b style="font-size:1.1rem">Kemajuanmu</b><div class="muted kecil">' + selesai + ' dari ' + sel.length + ' langkah selesai</div><span class="chip sorot" style="margin-top:.3rem">' + ik('bintang', 'kecil') + p.poin + ' poin</span></div>' }));
    sisi.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.2rem' }, 'Pakar untuk'), el('div', { kelas: 't2-fam', html: fam.map((f) => '<div class="t2-fam-baris fx-' + f + '">' + UI.ubin(f) + '<b>' + NAMA[f] + '</b>' + (t.kartu[f] ? '<span class="ok-bulat">' + ik('centang', 'kecil') + '</span>' : '') + '</div>').join('') }));
    if (t.tiket.selesai) sisi.append(el('button', { kelas: 'btn hijau denyut-h t2-catatan', type: 'button', html: ik('buku', 'kecil') + 'Catatan belajar (PDF)', onclick: bukaCatatan }));
    sisi.append(el('button', { kelas: 'btn ' + (t.tamat ? 'hijau' : 'sekunder') + ' t2-ringkas', type: 'button', disabled: !t.tamat, html: ik(t.tamat ? 'bintang' : 'gembok', 'kecil') + 'Lihat ringkasan akhir', onclick: tamat }));
    /* sisi kanan */
    const kanan = el('section', { kelas: 't2-utama' }); kanan.append(el('div', { kelas: 't2-judul' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Tahap lanjutan'), el('h2', { gaya: 'margin:0' }, 'Perjalanan belajarmu')), el('div', { kelas: 't2-sambung' }, el('div', { kelas: 'muted' }, 'Langkah dibuka oleh guru saat sudah waktunya.'), el('div', { kelas: 'baris', gaya: 'justify-content:flex-end;gap:.5rem' }, statusSambung(), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('ulang', 'kecil') + 'Segarkan', onclick: async (e) => { const b = e.currentTarget; b.disabled = true; await cekGuru(true); if (document.querySelector('.t2-hub')) render(); } })))));
    const L = XG() ? langkahXG(t, fam) : [
      [1, 'Kartu pakar', 'buku', 'Pelajari rumus, bentuk grafik, dan contoh nyata. Lalu uji dengan soal cerita.', fam.filter((f) => t.kartu[f]).length + ' dari ' + fam.length + ' kartu', kartuPakar, 'poli', fam.length, fam.filter((f) => t.kartu[f]).length],
      [2, 'Tebak fungsinya', 'kelompok', 'Diskusi bersama kelompok: kejadian sehari-hari ini grafiknya jenis apa?', ((t.dis.rnd || []).filter((r) => r && r.selesai).length) + ' dari 6 tebakan', diskusi, 'trig', 6, (t.dis.rnd || []).filter((r) => r && r.selesai).length],
      [3, 'Cocokkan grafik', 'mata', 'Lihat data lima masalah nyata, lalu tentukan nama fungsinya.', t.cocok.jawab.filter((v) => v != null).length + ' dari 5 masalah', cocok, 'eksp', 5, t.cocok.jawab.filter((v) => v != null).length],
      [4, 'Tiket keluar', 'pensil', 'Tiga soal singkat, lalu refleksi. Kerjakan sendiri.', (t.tiket.jawab || []).filter((v) => v != null).length + ' dari 3 soal', tiket, 'sepotong', 3, (t.tiket.jawab || []).filter((v) => v != null).length]
    ];
    const grid = el('div', { kelas: 't2-langkah' + (XG() ? ' n6' : '') });
    L.forEach(([no, j, ikon, d, meta, fn, warna, tot, isi]) => {
      const ok = sel[no - 1], buka = terbuka(no, sel), kelas = ok ? 'selesai' : (buka ? 'siap' : 'terkunci');
      const kartu = el('div', { kelas: 'kartu t2-kartu fx-' + warna + ' ' + kelas });
      kartu.append(el('div', { kelas: 'baris' }, el('span', { kelas: 'no-bulat', html: ok ? ik('centang', 'kecil') : (buka ? String(no) : ik('gembok', 'kecil')) }), el('h3', { gaya: 'margin:0' }, j), el('span', { kelas: 'chip ' + (ok ? 'ok' : (buka ? 'sorot' : 'abu')), gaya: 'margin-left:auto', html: ok ? 'selesai' : (buka ? 'terbuka' : ik('gembok', 'kecil') + 'menunggu guru') })),
        el('p', { kelas: 'muted', gaya: 'margin:.5rem 0 .3rem' }, d), el('div', { kelas: 't2-meta' }, meta), el('div', { kelas: 't2-prog' }, Array.from({ length: tot }, (_, i) => el('span', { kelas: 'pt' + (i < isi ? ' on' : '') }))));
      kartu.append(el('button', { kelas: 'btn t2-tbl' + (ok ? ' sekunder' : (buka ? ' denyut' : '')), type: 'button', disabled: !buka, html: !buka ? ik('gembok', 'kecil') + 'Menunggu aba-aba guru' : (ok ? 'Buka lagi' : (meta.charAt(0) === '0' ? 'Mulai' : 'Lanjutkan')) + ik('panah', 'kecil'), onclick: () => fn() })); grid.append(kartu);
    });
    kanan.append(grid); w.append(sisi, kanan); E.layar(w);
  }
  function langkahXG(t, fam) {
    const pamN = Object.keys((t.pam && t.pam.jawab) || {}).length, fungN = ((t.fung && t.fung.hasil) || []).filter(Boolean).length, rd = (t.dis.rnd || []).filter((r) => r && r.selesai).length, cj = t.cocok.jawab.filter((v) => v != null).length, tj = (t.tiket.jawab || []).filter((v) => v != null).length;
    return [
      [1, 'Kartu pakar', 'buku', 'Kuasai satu jenis grafik kelompokmu: rumus, bentuk, ciri, lalu soal cerita.', fam.filter((f) => t.kartu[f]).length + ' dari ' + fam.length + ' kartu', kartuPakar, 'poli', fam.length, fam.filter((f) => t.kartu[f]).length],
      [2, 'Pameran pakar', 'kelompok', 'Sembilan kelompok bergantian menjelaskan. Simak dan coba soal tiap jenis.', pamN + ' dari 9 kelompok', pameran, 'log', 9, pamN],
      [3, 'Tebak fungsinya', 'kelompok', 'Diskusi: kejadian sehari-hari ini grafiknya jenis apa?', rd + ' dari 6 tebakan', diskusi, 'trig', 6, rd],
      [4, 'Cocokkan grafik', 'mata', 'Lihat data lima masalah nyata, lalu tentukan nama fungsinya.', cj + ' dari 5 masalah', cocok, 'eksp', 5, cj],
      [5, 'Dari grafik ke fungsi', 'pensil', 'Lihat tabel angka dan temukan aturan fungsinya sendiri.', fungN + ' dari 3 tugas', fungsi, 'rasional', 3, fungN],
      [6, 'Tiket keluar', 'ujian', 'Tiga soal singkat, lalu refleksi. Kerjakan sendiri.', tj + ' dari 3 soal', tiket, 'sepotong', 3, tj]
    ];
  }
  function bukaCatatan() { if (window.Catatan) Catatan.buka({ idx: E.idx(), P: E.P() }); }
  /* sambungan ke guru: memeriksa langkah yang dibuka. Gagal diperiksa = ditampilkan jelas, bukan diam-diam. */
  const sambung = { ok: 0, gagal: 0 };
  const jam = (ms) => new Date(ms).toTimeString().slice(0, 8);
  function statusSambung() {
    if (E.idx() === B.DUMMY) return el('span', { kelas: 'chip sorot', html: 'Akun uji coba: semua langkah terbuka' });
    if (E.net() !== 'online') return el('span', { kelas: 'chip warn', html: ik('putus', 'kecil') + 'Mode mandiri' });
    if (sambung.ok && sambung.gagal === 0) return el('span', { kelas: 'chip ok', html: ik('wifi', 'kecil') + 'Terhubung ke guru · ' + jam(sambung.ok) });
    if (sambung.gagal >= 2) return el('span', { kelas: 'chip warn', html: ik('putus', 'kecil') + 'Belum bisa memeriksa guru' });
    return el('span', { kelas: 'chip abu', html: 'Memeriksa guru…' });
  }
  function perbaruiStatus() { const w = document.querySelector('.t2-sambung .baris'); if (w && w.firstChild) w.replaceChild(statusSambung(), w.firstChild); }
  async function cekGuru(manual) { try { await cekGuru2(manual); } finally { perbaruiStatus(); } }
  async function cekGuru2(manual) {
    if (E.idx() === B.DUMMY) return;
    if (E.net() !== 'online' && E.cekNet) await E.cekNet();
    if (E.net() !== 'online') { sambung.gagal++; return; }
    const r = await E.api('t2s', { idx: E.idx() });
    if (!(r && r.ok)) { sambung.gagal++; if (manual) UI.toast('Belum tersambung ke guru. Coba lagi sebentar lagi.', 'awas'); return; }
    sambung.ok = Date.now(); sambung.gagal = 0;
    const t = T(); if ((r.pameran || 0) !== (t.pameran || 0)) { t.pameran = r.pameran || 0; E.simpan(); if (pamHook) pamHook(); if (t.pameran) UI.toast('Pameran pakar: giliran Kelompok ' + t.pameran, 'bintang'); }
    const baru = Array.isArray(r.aktif) ? r.aktif : Array.from({ length: r.n || 4 }, (_, i) => i + 1).filter((n) => n <= (r.buka || 1)), lama = t.aktif || [1];
    if (JSON.stringify(baru) === JSON.stringify(lama)) { if (manual) UI.toast('Sudah yang terbaru', 'centang'); return; }
    t.aktif = baru; E.simpan(); const nb = baru.filter((n) => lama.indexOf(n) < 0), tutup = lama.filter((n) => baru.indexOf(n) < 0);
    if (nb.length) UI.toast('Guru membuka langkah ' + nb.join(', '), 'bintang'); else if (tutup.length) UI.toast('Guru menutup langkah ' + tutup.join(', '), 'info');
    if (document.querySelector('.t2-hub')) render();
  }
  function mulaiCek() {
    clearInterval(tmrCek); document.removeEventListener('visibilitychange', cekLagi); document.addEventListener('visibilitychange', cekLagi);
    if (E.idx() === B.DUMMY) return; cekGuru(false); tmrCek = setInterval(() => cekGuru(false), 4000);
  }
  function cekLagi() { if (!document.hidden && E.idx() !== B.DUMMY) cekGuru(false); }

  /* ============================================================ langkah 1: kartu pakar */
  function isiKartu(f, o) {
    const d = K[f], kolom = el('div', { kelas: 'isi fx-' + f, gaya: 'flex:1;min-height:0' }), kiri = el('div', { kelas: 'kotak-grafik' }), wad = el('div', { kelas: 'wadah' }); kiri.append(wad);
    const kanan = el('div', { kelas: 'info gulir' }), rk = el('div', { kelas: 'rumus-kartu' }), sv = el('div', { kelas: 'seg-varian' });
    kanan.append(el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(f) }).firstChild, el('h3', { gaya: 'margin:0;font-size:1.6rem;color:var(--td)' }, NAMA[f])), el('div', { kelas: 'baris', gaya: 'flex-wrap:wrap;gap:.35rem' }, el('span', { kelas: 'muted kecil' }, 'Nama lain:'), d.alias.map((x) => el('span', { kelas: 'chip abu' }, x))), rk); if (d.varian.length > 1) kanan.append(sv);
    kanan.append(el('div', null, el('div', { kelas: 'eyebrow' }, 'Ciri grafik'), el('ul', null, d.ciri.map((x) => el('li', null, x)))), el('div', null, el('div', { kelas: 'eyebrow' }, 'Contoh dalam kehidupan'), el('ul', null, d.konteks.map((x) => el('li', null, x)))));
    const gambar = (v) => { wad.innerHTML = ''; const r = GF.gambarVarian(d.varian[v], 'var(--t)'); wad.append(r.b.svg); rk.innerHTML = '<div class="eyebrow" style="margin:0">Contoh fungsi · ' + esc(d.varian[v].nama) + '</div><div class="mat" style="font-size:' + ((d.varian[v].panjang || d.varian[v].rumus.replace(/<[^>]+>/g, '').length > 24) ? '1.4rem' : '2.1rem') + '">' + d.varian[v].rumus + '</div>' + '<div class="umum"><span>Bentuk umum</span>' + d.umum + '</div>'; GF.gambarKurva(r.kurva, 1200).then(() => r.b.svg.querySelectorAll('.tk').forEach((c) => c.setAttribute('opacity', 1))).catch(() => {}); };
    if (d.varian.length > 1) d.varian.forEach((v, k) => sv.append(el('button', { type: 'button', kelas: k === 0 ? 'aktif' : '', onclick: (e) => { [...sv.children].forEach((x) => x.classList.remove('aktif')); e.currentTarget.classList.add('aktif'); gambar(k); } }, v.nama.split('·')[0].trim())));
    gambar(0); kolom.append(kiri, kanan); return { kolom, kanan };
  }
  function kartuPakar() {
    E.bawahKosong(); const t = T(), fam = t.fam; let aktif = Math.max(0, fam.findIndex((f) => !t.kartu[f])); const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const f = fam[aktif], sel = fam.every((x) => t.kartu[x]);
      const kep = el('div', { kelas: 't2-kepala' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Langkah 1 · ' + fam.filter((x) => t.kartu[x]).length + ' dari ' + fam.length + ' kartu selesai'), el('h2', { gaya: 'margin:0' }, 'Kartu pakar')), el('div', { kelas: 'baris' }, sel ? el('button', { kelas: 'btn hijau denyut-h', type: 'button', html: 'Semua kartu selesai' + ik('panah', 'kecil'), onclick: hub }) : null, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Ke pusat', onclick: hub })));
      const daftar = el('div', { kelas: 'daftar gulir' }), isi = el('div', { gaya: 'min-height:0;display:flex;flex-direction:column;gap:.5rem' });
      fam.forEach((x, i) => daftar.append(el('button', { kelas: 'tab fx-' + x + (i === aktif ? ' aktif' : '') + (t.kartu[x] ? ' lihat' : ''), type: 'button', html: UI.ubin(x) + '<span>' + NAMA[x] + '</span>' + ik('centang', 'kecil').replace('class="ik kecil"', 'class="ik kecil centang"'), onclick: () => { aktif = i; gambar(); } })));
      const { kolom, kanan } = isiKartu(f);
      if (XG()) kanan.append(el('div', { kelas: 'umpan ok', gaya: 'align-items:flex-start', html: ik('info') + '<span><b>Siapkan penjelasanmu.</b> Kelompokmu akan menjelaskan jenis ini kepada seluruh kelas: rumus dan nama lain, bentuk grafik, satu contoh kehidupan. Latihan dulu bersama temanmu.</span>' }));
      kanan.append(el('div', { kelas: 'uji-kotak' }, el('div', null, el('b', null, t.kartu[f] ? 'Kartu ini sudah kamu kuasai' : 'Siap menguji dirimu?'), el('div', { kelas: 'muted kecil' }, 'Satu soal cerita sehari-hari tentang ' + NAMA[f] + '.')), el('button', { kelas: 'btn hijau ' + (t.kartu[f] ? '' : 'denyut-h'), type: 'button', html: ik('ujian') + (t.kartu[f] ? 'Coba lagi' : 'Uji sekarang'), onclick: () => uji(f, true) })));
      isi.append(kolom); w.append(kep, el('div', { kelas: 'galeri t2-galeri' }, daftar, isi));
    }
    async function uji(f, baru) {
      t.coba = t.coba || {}; if (baru) t.coba[f] = 0; const q = B.tantanganAcak(f, Math.floor(Math.random() * 2e9)), v = await UI.keypadAngka({ judul: 'Soal cerita · ' + NAMA[f], tanya: q.tanya, ikon: ik('ujian', 'besar') }); if (v == null) return;
      t.coba = t.coba || {}; t.coba[f] = (t.coba[f] || 0) + 1;
      if (v === q.kunci) { t.kartu[f] = 1; sinkron({ kartu: Object.keys(t.kartu) }); E.konfeti(innerWidth / 2, innerHeight / 3, 34); await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.25rem">' + esc(q.jelas) + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') }); if (fam.every((x) => t.kartu[x])) { await UI.info('Semua kartu selesai', '<div class="tengah"><p style="font-size:1.25rem">Kamu dan pasanganmu sudah menguasai kartu pakar. Tunggu aba-aba guru untuk langkah berikutnya.</p></div>', 'Kembali ke pusat'); return hub(); } aktif = Math.max(0, fam.findIndex((x) => !t.kartu[x])); gambar(); }
      else if (t.coba[f] >= 2) { if (!t.kartu[f]) t.kartu[f] = 2; sinkron({ kartu: Object.keys(t.kartu) }); await UI.info('Ini jawabannya', '<div class="tengah"><p style="font-size:1.25rem">' + esc(q.jelas) + '</p><p class="muted">Tidak apa-apa. Tanyakan pasanganmu bila masih bingung.</p></div>', 'Mengerti', { ikon: ik('info', 'besar') }); gambar(); }
      else { const lagi = await UI.dialog({ judul: 'Belum tepat', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu <b>' + F(v) + '</b> belum tepat.</p><p class="muted">Petunjuk: ganti peubah dengan angka yang diminta, lalu hitung pelan-pelan.</p></div>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Coba lagi', nilai: true }] }); if (lagi) uji(f); }
    }
    gambar();
  }

  /* ============================================================ langkah 2: tebak fungsinya (diskusi) */
  const PERAN = [['Pembaca', 'Bacakan konteks dan tabel dengan kata-katamu sendiri.'], ['Penebak', 'Sebutkan tebakanmu dan satu alasan.'], ['Penyanggah', 'Setuju atau beri pandangan lain, lengkap dengan alasannya.'], ['Pencatat', 'Ketuk jawaban setelah kelompok sepakat.']];
  function diskusi() {
    E.bawahKosong(); const t = T(), soal = B.diskusiSiswa(t.grup || (E.idx() % 4) + 1), semua = B.SET.flat(); t.dis.rnd = t.dis.rnd || []; let no = Math.min(5, t.dis.rnd.filter((r) => r && r.selesai).length);
    const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const s = soal[no], r = t.dis.rnd[no] = t.dis.rnd[no] || { coba: 0, selesai: false, ok: false }, peran = PERAN[(no + (t.pos || 0)) % 4];
      const k = kerangka('Langkah ' + NO().dis + ' · putaran ' + (no + 1) + ' dari 6', 'Tebak fungsinya', { titik: soal.map((_, i) => (i === no ? 'now' : ((t.dis.rnd[i] && t.dis.rnd[i].selesai) ? 'isi' : ''))), ke: (i) => { if (i <= t.dis.rnd.filter((x) => x && x.selesai).length) { no = i; gambar(); } } });
      const kiri = el('div', { kelas: 'kartu t2-konteks' }); kiri.innerHTML = '<div class="eyebrow">Kejadian sehari-hari</div><h3>' + esc(s.judul) + '</h3><p style="font-size:1.15rem;margin:.2rem 0 .4rem">' + esc(s.konteks) + '</p><div class="tabel-besar">' + tabelData(s) + '</div><p class="muted kecil" style="margin:.5rem 0 0">Baca tabelnya: apa yang terjadi pada y saat x bertambah?</p>';
      const kanan = el('div', { kelas: 't2-diskusi' }); kanan.append(el('div', { kelas: 'peran' }, el('span', { kelas: 'chip sorot', html: ik('siswa', 'kecil') + 'Perananmu: ' + peran[0] }), el('span', { kelas: 'muted kecil' }, peran[1])), el('div', { kelas: 'umpan ok', gaya: 'align-items:flex-start;flex-direction:column;gap:.15rem' , html: '<b>Bicarakan dulu bersama kelompok</b>' + B.PROMPT.map((x, i) => '<span>' + (i + 1) + '. ' + esc(x) + '</span>').join('') }));
      const gridF = el('div', { kelas: 'fam-pilih' }); semua.forEach((f) => gridF.append(el('button', { kelas: 'fam-tbl fx-' + f + (r.selesai ? (f === s.fam ? ' benar' : '') : '') + (r.salah === f && !r.selesai ? ' salah' : ''), type: 'button', html: UI.ubin(f) + '<span>' + NAMA[f] + '</span>', onclick: () => (r.selesai ? lihat() : pilih(f)) }))); kanan.append(el('div', { kelas: 'eyebrow', gaya: 'margin-top:.2rem' }, r.selesai ? 'Jawaban kelompok' : 'Menurut kelompokmu, ini fungsi apa?'), r.selesai ? el('button', { kelas: 'btn hijau', type: 'button', html: ik('mata') + 'Lihat penjelasan dan grafiknya', onclick: lihat }) : null, gridF);
      k.isi.append(kiri, kanan); k.isi.classList.add('dua'); const sudah = t.dis.rnd.filter((x) => x && x.selesai).length;
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), el('span', { kelas: 'muted' }, r.selesai ? 'Tebakanmu sudah dikunci' : 'Tanpa batas waktu. Diskusikan sampai sepakat.'), no < 5 ? tombol('Berikutnya', 'panah', { p: { disabled: !r.selesai, onclick: () => { no++; gambar(); } } }) : tombol('Selesai diskusi', 'centang', { kelas: 'hijau', kiri: true, p: { disabled: sudah < 6, onclick: akhir } }));
      w.append(k.w);
    }
    async function pilih(f) {
      const s = soal[no], r = t.dis.rnd[no]; r.salah = null;
      if (f === s.fam) { r.selesai = true; r.ok = r.coba === 0; r.pilih = f; hitungDis(); E.simpan(); sinkron({ diskusi: { benar: t.dis.benar, total: 6 } }); if (r.ok) E.konfeti(innerWidth / 2, innerHeight / 3, 30); gambar(); await penjelasan({ ok: true, judul: r.ok ? 'Tepat sekali!' : 'Tepat!', s, fam: s.fam, lanjut: no < 5 ? 'Lanjut' : 'Tutup' }); }
      else if (r.coba >= 1) { r.selesai = true; r.ok = false; r.pilih = s.fam; hitungDis(); E.simpan(); sinkron({ diskusi: { benar: t.dis.benar, total: 6 } }); gambar(); await penjelasan({ ok: false, judul: 'Ini jawabannya', s, fam: s.fam, pilihF: f, lanjut: no < 5 ? 'Lanjut' : 'Tutup' }); }
      else { r.coba++; r.salah = f; E.simpan(); gambar(); await UI.dialog({ judul: 'Belum cocok', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.2rem">Bukan <b>' + NAMA[f] + '</b>. Diskusikan sekali lagi.</p><p class="muted">Perhatikan angkanya: apa yang terjadi pada y saat x bertambah? Naik terus, turun, berulang, atau melompat?</p></div>', tombol: [{ t: 'Coba lagi', nilai: true }] }); }
    }
    const lihat = () => penjelasan({ ok: !!(t.dis.rnd[no] && t.dis.rnd[no].ok), judul: 'Penjelasan putaran ' + (no + 1), s: soal[no], fam: soal[no].fam, lanjut: 'Tutup' });
    function hitungDis() { t.dis.benar = t.dis.rnd.filter((x) => x && x.ok).length; }
    function dialogFeedback(ok, s, f, judul) {
      const isi = el('div', { kelas: 'umpan-isi' }); isi.innerHTML = '<div class="umpan-g"></div><div><p style="font-size:1.25rem;margin:0 0 .4rem">Ini fungsi <b>' + NAMA[s.fam] + '</b>' + (ok ? '' : ', bukan ' + NAMA[f]) + '.</p><p style="margin:.2rem 0">' + esc(s.alasan) + '</p></div>'; isi.querySelector('.umpan-g').append(miniGrafik(s.fam, true));
      return UI.dialog({ lebar: true, judul, ikon: ik(ok ? 'centang' : 'info', 'besar'), isi, tombol: [{ t: no < 5 ? 'Lanjut' : 'Tutup', nilai: true }] });
    }
    async function akhir() {
      t.dis.selesai = true; hitungDis(); sinkron({ diskusi: { benar: t.dis.benar, total: 6 } }); E.konfeti(innerWidth / 2, innerHeight / 3, 50);
      await UI.info('Diskusi selesai', '<div class="tengah"><p style="font-size:1.3rem"><b>' + t.dis.benar + ' dari 6</b> tebakan tepat pada percobaan pertama.</p><p class="muted">Tunggu aba-aba guru untuk langkah berikutnya.</p></div>', 'Kembali ke pusat', { ikon: ik('bintang', 'besar') }); hub();
    }
    gambar();
  }

  /* ============================================================ langkah 3 & soal tiket: cocokkan grafik */
  function kartuSoal(item, o) {
    const s = B.SITUASI[item.situasi], w = el('div', { kelas: 'cocok-isi' }), kiri = el('div', { kelas: 'kartu cocok-sit gulir' }), pil = el('div', { kelas: 'cocok-nama' });
    kiri.innerHTML = '<div class="eyebrow">Masalah sehari-hari</div><h3>' + esc(s.judul) + '</h3><p style="font-size:1.12rem;margin:.1rem 0 .3rem">' + esc(s.teks) + '</p><div class="tabel-besar">' + tabelData(s) + '</div><p class="muted kecil" style="margin:.5rem 0 0">Baca soalnya dengan teliti, lalu tentukan jenis fungsinya.</p>';
    pil.append(el('div', { kelas: 'eyebrow' }, 'Data di atas cocok dengan fungsi…'));
    item.opsi.forEach((f, k) => { const st = o.reveal ? (k === item.kunci ? ' benar' : (k === o.jawab ? ' salah' : '')) : (k === o.jawab ? ' dipilih' : ''); pil.append(el('button', { kelas: 'opsi-nama fx-' + f + st, type: 'button', disabled: !!o.reveal, onclick: () => o.pilih(k), html: '<span class="hrf">' + 'ABC'[k] + '</span><span class="nm"><b>' + NAMA[f] + '</b><span class="muted kecil">' + K[f].alias.slice(0, 2).join(' · ') + '</span></span>' + (st.indexOf('benar') >= 0 ? ik('centang') : (st.indexOf('salah') >= 0 ? ik('silang') : '')) })); });
    w.append(kiri, pil); return w;
  }
  function umpanCocok(item, k) {
    const s = B.SITUASI[item.situasi], ok = k === item.kunci, f = item.fam, pilihF = item.opsi[k], isi = el('div', { kelas: 'umpan-isi' });
    isi.innerHTML = '<div class="umpan-g"></div><div><p style="font-size:1.25rem;margin:0 0 .3rem">Ini fungsi <b>' + NAMA[f] + '</b>' + (ok ? '' : ', bukan ' + NAMA[pilihF]) + '.</p><p style="margin:.2rem 0"><b>Mengapa?</b> ' + esc(s.alasan) + '</p>' + (ok ? '' : '<p class="muted" style="margin:.3rem 0">Ciri <b>' + NAMA[pilihF] + '</b>: ' + esc(K[pilihF].ciri[0]) + ' Data di atas tidak seperti itu.</p>') + '</div>'; isi.querySelector('.umpan-g').append(miniGrafik(f, true)); return isi;
  }
  function cocok() {
    E.bawahKosong(); const t = T(), soal = B.cocokSiswa(E.idx()); let no = Math.min(4, t.cocok.jawab.filter((v) => v != null).length); const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      if (t.cocok.selesai && t.cocok.tampilHasil !== false && no > 4) return hasil();
      w.innerHTML = ''; const item = soal[no], jwb = t.cocok.jawab[no], terjawab = jwb != null;
      const k = kerangka('Langkah ' + NO().cocok + ' · masalah ' + (no + 1) + ' dari 5', 'Cocokkan grafik', { titik: soal.map((_, i) => (i === no ? 'now' : (t.cocok.jawab[i] != null ? 'isi' : ''))), ke: (i) => { no = i; gambar(); } });
      k.isi.append(kartuSoal(item, { jawab: jwb, reveal: terjawab, pilih: async (p) => { t.cocok.jawab[no] = p; t.cocok.benar = soal.filter((s, i) => t.cocok.jawab[i] === s.kunci).length; if (t.cocok.jawab.filter((v) => v != null).length >= 5) t.cocok.selesai = true; sinkron({ cocok: { benar: t.cocok.benar } }); const ok = p === item.kunci; gambar(); if (ok) E.konfeti(innerWidth / 2, innerHeight / 3, 26); await penjelasan({ ok, judul: ok ? 'Tepat!' : 'Belum tepat', s: B.SITUASI[item.situasi], fam: item.fam, pilihF: item.opsi[p], lanjut: t.cocok.selesai && no === 4 ? 'Lihat hasil' : 'Lanjut' }); if (t.cocok.selesai && no === 4) { t.cocok.tampilHasil = true; no = 5; return hasil(); } if (no < 4) { no++; gambar(); } } }));
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), terjawab ? el('button', { kelas: 'btn hijau kecil', type: 'button', html: ik('mata', 'kecil') + 'Lihat penjelasan dan grafik', onclick: () => penjelasan({ ok: jwb === item.kunci, judul: 'Penjelasan masalah ' + (no + 1), s: B.SITUASI[item.situasi], fam: item.fam, pilihF: item.opsi[jwb], lanjut: 'Tutup' }) }) : el('span', { kelas: 'muted' }, 'Pilih satu jawaban'), no < 4 ? tombol('Berikutnya', 'panah', { p: { disabled: !terjawab, onclick: () => { no++; gambar(); } } }) : tombol('Lihat hasil', 'centang', { kelas: 'hijau', kiri: true, p: { disabled: !t.cocok.selesai, onclick: () => { no = 5; hasil(); } } }));
      w.append(k.w);
    }
    function hasil() {
      w.innerHTML = ''; const b = soal.filter((s, i) => t.cocok.jawab[i] === s.kunci).length;
      const k = el('div', { kelas: 'tengah-isi kartu', gaya: 'padding:2rem 3rem;margin:auto' }); k.innerHTML = '<div class="eyebrow" style="justify-content:center">Langkah ' + NO().cocok + ' selesai</div><h2>' + b + ' dari 5 masalah tepat</h2><div class="baris" style="justify-content:center;flex-wrap:wrap">' + soal.map((s, i) => '<span class="chip ' + (t.cocok.jawab[i] === s.kunci ? 'ok' : 'warn') + '">' + (i + 1) + '. ' + esc(B.SITUASI[s.situasi].judul) + ' · ' + NAMA[s.fam] + '</span>').join('') + '</div><p class="muted">Yang belum tepat tidak apa-apa. Bahas bersama kelompokmu.</p>';
      k.append(el('div', { kelas: 'baris', gaya: 'justify-content:center' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Lihat lagi', onclick: () => { no = 0; gambar(); } }), el('button', { kelas: 'btn', type: 'button', html: 'Ke pusat' + ik('panah'), onclick: hub }))); w.append(k); E.konfeti(innerWidth / 2, innerHeight * .3, 40);
    }
    gambar();
  }

  /* ============================================================ langkah 4: tiket keluar + refleksi */
  function tiket() {
    E.bawahKosong(); const t = T(), idx = E.idx(), soal = B.tiketSiswa(idx), tk = t.tiket; tk.jawab = tk.jawab || [null, null, null]; if (tk.selesai) return refleksi(); let no = 0; const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    const terisi = () => tk.jawab.filter((v) => v != null).length;
    function gambar() {
      w.innerHTML = ''; const q = soal[no], j = tk.jawab[no];
      const k = kerangka('Tiket keluar · soal ' + (no + 1) + ' dari 3', 'Kerjakan sendiri', { titik: soal.map((_, i) => (i === no ? 'now' : (tk.jawab[i] != null ? 'isi' : ''))), ke: (i) => { no = i; gambar(); } });
      if (q.jenis === 'hitung') { const c = el('div', { kelas: 'kartu tengah-isi', gaya: 'padding:2rem 3rem;max-width:44rem;margin:auto' }); c.innerHTML = '<div class="teks-soal" style="font-size:2.1rem">' + q.tanya + '</div><div class="layar-angka' + (j == null ? ' kosong' : '') + '" style="min-width:10rem">' + (j == null ? '…' : F(j)) + '</div>'; c.append(el('button', { kelas: 'btn besar', type: 'button', html: ik('pensil') + (j == null ? 'Isi jawaban' : 'Ubah jawaban'), onclick: async () => { const v = await UI.keypadAngka({ judul: 'Jawabanmu', tanya: q.tanya }); if (v != null) { tk.jawab[no] = v; E.simpan(); gambar(); } } })); k.isi.append(c); }
      else if (q.jenis === 'nama') { const c = el('div', { kelas: 'cocok-isi' }), kiri = el('div', { kelas: 'kartu cocok-sit gulir' }); kiri.append(el('div', { kelas: 'eyebrow' }, 'Perhatikan grafik'), el('div', { gaya: 'height:15rem' }, miniGrafik(q.fam, false)), el('p', { kelas: 'teks-soal', gaya: 'font-size:1.3rem;margin-top:.6rem' }, q.tanya)); const op = el('div', { kelas: 'cocok-nama' }); q.opsi.forEach((f, i) => op.append(el('button', { kelas: 'opsi-nama fx-' + f + (j === i ? ' dipilih' : ''), type: 'button', html: '<span class="hrf">' + 'ABCD'[i] + '</span><span class="nm"><b>' + NAMA[f] + '</b></span>', onclick: () => { tk.jawab[no] = i; E.simpan(); gambar(); } }))); c.append(kiri, op); k.isi.append(c); }
      else { k.isi.append(kartuSoal(q, { jawab: j, reveal: false, pilih: (p) => { tk.jawab[no] = p; E.simpan(); gambar(); } })); }
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), el('span', { kelas: 'muted' }, terisi() + ' dari 3 soal terjawab'), no < 2 ? tombol('Berikutnya', 'panah', { p: { onclick: () => { no++; gambar(); } } }) : tombol('Kumpulkan tiket', 'kirim', { kelas: 'hijau', kiri: true, p: { disabled: terisi() < 3, onclick: kumpul } }));
      w.append(k.w);
    }
    async function kumpul() {
      const ya = await UI.konfirmasi('Kumpulkan tiket?', '<div class="tengah"><p style="font-size:1.25rem">Semua soal sudah terjawab.</p><p class="muted">Setelah dikumpulkan, jawaban tidak bisa diubah.</p></div>', 'Ya, kumpulkan', 'Periksa lagi'); if (!ya) return;
      const ok = soal.map((q, i) => tk.jawab[i] === q.kunci); tk.skor = ok.filter(Boolean).length; tk.selesai = true; tk.ok = ok; sinkron({ tiket: { skor: tk.skor } });
      await UI.dialog({ lebar: true, judul: 'Hasil tiket: ' + tk.skor + ' dari 3', ikon: ik(tk.skor >= 2 ? 'centang' : 'info', 'besar'), isi: soal.map((q, i) => '<div class="umpan ' + (ok[i] ? 'ok' : 'hint') + '" style="margin:.4rem 0;align-items:flex-start">' + ik(ok[i] ? 'centang' : 'info') + '<span><b>Soal ' + (i + 1) + ':</b> ' + (q.jenis === 'cocok' ? 'Masalah “' + esc(B.SITUASI[q.situasi].judul) + '”: fungsi ' + NAMA[q.fam] + '. ' + esc(B.SITUASI[q.situasi].alasan) : q.jelas) + '</span></div>').join(''), tombol: [{ t: 'Lanjut ke refleksi', nilai: true }] });
      refleksi();
    }
    gambar();
  }
  function refleksi() {
    E.bawahKosong(); const t = T(); t.ref = t.ref || { kuasai: [], bingung: [] }; t.ref.kuasai = t.ref.kuasai || []; t.ref.bingung = t.ref.bingung || []; const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    function gambar() {
      w.innerHTML = ''; const total = t.ref.kuasai.length + t.ref.bingung.length;
      const k = kerangka('Refleksi', 'Bagaimana belajarmu hari ini?', { pusat: false });
      const kartu = (judul, ket, jenis, lain) => { const c = el('div', { kelas: 'kartu ref-kartu' }), g = el('div', { kelas: 'ref-grid' }); c.append(el('h3', { gaya: 'margin:0' }, judul), el('div', { kelas: 'muted kecil', gaya: 'margin-bottom:.4rem' }, ket)); B.SET.flat().forEach((f) => { const on = adaFam(f, t.ref[jenis]), mati = adaFam(f, t.ref[lain]); g.append(el('button', { kelas: 'ref-pil fx-' + f + (on ? ' on' : '') + (mati ? ' mati' : ''), type: 'button', disabled: mati, title: mati ? 'Sudah kamu pilih di kotak lainnya' : '', html: UI.ubin(f) + '<span>' + NAMA[f] + '</span><span class="cek">' + ik('centang', 'kecil') + '</span>', onclick: () => { const a = t.ref[jenis], i = a.indexOf(f); if (i >= 0) a.splice(i, 1); else a.push(f); E.simpan(); gambar(); } })); }); c.append(g); return c; };
      k.isi.append(el('div', { kelas: 'ref-dua' }, kartu('Grafik yang sudah kukuasai', 'Boleh pilih lebih dari satu.', 'kuasai', 'bingung'), kartu('Grafik yang masih membuatku bingung', 'Jenis yang sudah kamu kuasai tidak bisa dipilih di sini.', 'bingung', 'kuasai')));
      k.nav.append(el('span', { kelas: 'muted' }, total + ' jenis grafik dipilih'), el('span'), tombol('Selesai dan lihat penghargaan', 'bintang', { kelas: 'hijau denyut-h', kiri: true, p: { disabled: total === 0, onclick: () => { t.tamat = true; sinkron({ kuasai: t.ref.kuasai, bingung: t.ref.bingung, selesai: true }); tamat(); } } }));
      w.append(k.w);
    }
    gambar();
  }

  /* ============================================================ penutup: kartu penghargaan */
  function tamat() {
    E.bawahKosong(); const t = T(), p = hitung(), b = B.cocokSiswa(E.idx()).filter((s, i) => t.cocok.jawab[i] === s.kunci).length;
    const w = el('div', { kelas: 'penghargaan' }); const nama = B.nama(E.idx());
    w.innerHTML = '<div class="kartu-hadiah"><div class="pita">Kartu Penghargaan</div><div class="eyebrow" style="justify-content:center">Matematika Tingkat Lanjut · Fungsi</div><h1 class="ph-nama">' + esc(nama) + '</h1><div class="gelar">' + esc(p.gelar) + '</div>'
      + '<div class="poin-besar"><span id="angkaPoin">0</span><small>poin</small></div>'
      + '<div class="lencana-baris">' + (p.lencana.length ? p.lencana.map((l) => '<span class="lencana">' + ik('bintang', 'kecil') + esc(l) + '</span>').join('') : '<span class="muted">Kumpulkan lencana dengan menyelesaikan langkah-langkahnya.</span>') + '</div>'
      + '<div class="ph-stat"><div><b>' + (t.fam || []).filter((f) => t.kartu[f]).length + '/' + (t.fam || []).length + '</b><span>kartu pakar</span></div><div><b>' + ((t.dis && t.dis.benar) || 0) + '/6</b><span>tebakan tepat</span></div><div><b>' + b + '/5</b><span>cocokkan grafik</span></div><div><b>' + ((t.tiket && t.tiket.skor) || 0) + '/3</b><span>tiket keluar</span></div></div>'
      + '<p class="muted ph-tugas">Tugas kecil: temukan satu hal di sekitarmu yang grafiknya mirip salah satu dari 9 jenis tadi.</p></div>';
    w.append(el('div', { kelas: 'baris', gaya: 'justify-content:center' }, el('button', { kelas: 'btn hijau denyut-h', type: 'button', html: ik('buku') + 'Catatan belajar (PDF)', onclick: bukaCatatan }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali ke pusat', onclick: hub })));
    E.layar(w, 'tengah-layar');
    const a = w.querySelector('#angkaPoin'), t0 = performance.now(), dur = 1600; const f = (now) => { const k = Math.min(1, (now - t0) / dur); a.textContent = Math.round(p.poin * (1 - Math.pow(1 - k, 3))); if (k < 1 && a.isConnected) requestAnimationFrame(f); }; requestAnimationFrame(f);
    [300, 1100, 2000].forEach((ms) => setTimeout(() => { if (w.isConnected) E.konfeti(innerWidth * (0.25 + Math.random() * .5), innerHeight * .25, 70); }, ms));
  }

  /* ============================================================ XI-G · langkah 2: pameran pakar (dikendalikan guru) */
  let pamLihat = null, pamOto = true, pamHook = null;
  function pameran() {
    E.bawahKosong(); const t = T(); t.pam = t.pam || { jawab: {} }; t.pam.jawab = t.pam.jawab || {}; const urut = B.SET.flat(), w = el('div', { kelas: 't2-bingkai t2-pameran' }); E.layar(w); pamOto = true; pamLihat = t.pameran || 0;
    pamHook = () => { if (!document.querySelector('.t2-pameran')) { pamHook = null; return; } if (pamOto) pamLihat = t.pameran || 0; gambar(); };
    const benarN = () => Object.keys(t.pam.jawab).filter((k) => t.pam.jawab[k] === 'benar').length;
    function gambar() {
      w.innerHTML = ''; const cur = t.pameran || 0, r = pamLihat;
      if (r && r === t.grup && !t.pam.jawab[r]) { t.pam.jawab[r] = 'sendiri'; t.pam.benar = benarN(); sinkron({ pam: { benar: t.pam.benar } }); }
      const k = kerangka('Langkah ' + NO().pam + ' · ' + (cur ? 'putaran ' + cur + ' dari 9' : 'menunggu aba-aba guru'), 'Pameran pakar', { titik: Array.from({ length: 9 }, (_, i) => (i + 1 === r ? 'now' : (t.pam.jawab[i + 1] ? 'isi' : ''))), ke: (i) => { if (i + 1 <= cur) { pamLihat = i + 1; pamOto = (i + 1 === cur); gambar(); } } });
      if (!r) { k.isi.append(el('div', { kelas: 'kartu tengah-isi', gaya: 'margin:auto;padding:2.2rem 3rem;max-width:40rem' }, el('span', { kelas: 'ubin fx-log', gaya: 'width:5rem;height:5rem;margin:0 auto', html: ik('jam') }), el('h2', null, 'Pameran belum dimulai'), el('p', { kelas: 'muted', gaya: 'font-size:1.15rem' }, 'Gurumu akan memanggil kelompok satu per satu. Layar ini berganti sendiri saat gilirannya tiba.'), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Segarkan', onclick: () => cekGuru(true) }))); w.append(k.w); return; }
      const f = urut[r - 1], own = r === t.grup, st = t.pam.jawab[r], { kolom } = isiKartu(f);
      k.isi.append(el('div', { kelas: 'umpan ' + (own ? 'ok' : 'hint'), gaya: 'margin-bottom:.5rem', html: ik(own ? 'bintang' : 'info') + '<span>' + (own ? '<b>Giliran kelompokmu!</b> Jelaskan ' + NAMA[f] + ' kepada seluruh kelas: rumus, bentuk grafik, dan satu contoh kehidupan.' : '<b>Kelompok ' + r + '</b> sedang menjelaskan <b>' + NAMA[f] + '</b>. Simak, lalu coba soal ceritanya.') + '</span>' }), el('div', { kelas: 'galeri', gaya: 'grid-template-columns:1fr;flex:1;min-height:0' }, kolom));
      const tombolSoal = own ? el('span', { kelas: 'chip ok', html: ik('centang', 'kecil') + 'Kelompokmu yang menjelaskan' }) : el('button', { kelas: 'btn hijau ' + (st ? '' : 'denyut-h'), type: 'button', html: ik('ujian') + (st === 'benar' ? 'Soal selesai · coba lagi' : (st === 'gagal' ? 'Coba soal baru' : 'Coba soal ceritanya')), onclick: () => ujiPam(f, r, true) });
      k.nav.append(tombol('Putaran sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: r <= 1, onclick: () => { pamLihat = r - 1; pamOto = false; gambar(); } } }), tombolSoal, tombol('Putaran berikutnya', 'panah', { p: { disabled: r >= cur, onclick: () => { pamLihat = r + 1; pamOto = (r + 1 === cur); gambar(); } } }));
      w.append(k.w);
    }
    const coba = {};
    async function ujiPam(f, r, baru) {
      if (baru) coba[r] = 0; const q = B.tantanganAcak(f, Math.floor(Math.random() * 2e9)), v = await UI.keypadAngka({ judul: 'Soal cerita · ' + NAMA[f], tanya: q.tanya, ikon: ik('ujian', 'besar') }); if (v == null) return;
      coba[r] = (coba[r] || 0) + 1;
      if (v === q.kunci) { t.pam.jawab[r] = 'benar'; t.pam.benar = benarN(); sinkron({ pam: { benar: t.pam.benar } }); E.konfeti(innerWidth / 2, innerHeight / 3, 28); gambar(); await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.2rem">' + esc(q.jelas) + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') }); }
      else if (coba[r] >= 2) { if (t.pam.jawab[r] !== 'benar') t.pam.jawab[r] = 'gagal'; t.pam.benar = benarN(); sinkron({ pam: { benar: t.pam.benar } }); gambar(); await UI.info('Ini jawabannya', '<div class="tengah"><p style="font-size:1.2rem">' + esc(q.jelas) + '</p></div>', 'Mengerti', { ikon: ik('info', 'besar') }); }
      else { const lagi = await UI.dialog({ judul: 'Belum tepat', ikon: ik('info', 'besar'), isi: '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu <b>' + F(v) + '</b> belum tepat.</p><p class="muted">Petunjuk: ganti peubah dengan angka yang diminta, lalu hitung pelan-pelan.</p></div>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Coba lagi', nilai: true }] }); if (lagi) ujiPam(f, r); }
    }
    gambar();
  }

  /* ============================================================ XI-G · langkah 5a: contoh beranimasi (satu soal, langkah demi langkah) */
  function fungsiDemo() {
    E.bawahKosong(); const w = el('div', { kelas: 't2-bingkai' }); E.layar(w);
    const XS = [0, 1, 2, 3], YS = [3, 5, 7, 9]; let langkah = 0, tk = UI.token(), sibuk = false;
    const k = kerangka('Langkah ' + NO().fung + ' · contoh dulu', 'Dari grafik ke fungsi', {});
    const kiri = el('div', { kelas: 'kartu cocok-sit fd-kiri' }); kiri.innerHTML = '<div class="eyebrow">Contoh dulu, lalu giliranmu</div><h3>Menemukan aturan dari tabel dan grafik</h3><div class="data-baris"><div><table class="tabel-mini fd-tabel"><thead><tr><th>x</th><th>y</th><th class="fd-sel">naik</th></tr></thead><tbody>' + XS.map((x, i) => '<tr data-i="' + i + '"><td class="cx">' + x + '</td><td class="cy">' + YS[i] + '</td><td class="fd-sel"><span class="dl">' + (i ? '+' + (YS[i] - YS[i - 1]) : '') + '</span></td></tr>').join('') + '</tbody></table></div><div class="plot-kecil fd-plot"></div></div>';
    const bd = GF.bidang({ W: 460, H: 330, xmin: -1, xmax: 4, ymin: -1, ymax: 10, xt: [0, 1, 2, 3, 4], yt: [0, 2, 4, 6, 8, 10], labelX: 'x', labelY: 'y' }); bd.kurva([[-0.5, 2], [3.5, 10]], { warna: '#9B5DE5', tebal: 4.5 }); XS.forEach((x, i) => bd.titik(x, YS[i], { teks: false, r: 8, warna: '#1E1B4B' }));
    const ov = GF.S('g', { class: 'ov' }); bd.svg.append(ov); kiri.querySelector('.fd-plot').append(bd.svg); const plot = bd.svg;
    const kanan = el('div', { kelas: 'kartu fung-aturan' }); kanan.innerHTML = '<div class="fung-umum"><span>Bentuk umum</span><div class="mat"><i>f</i>(<i>x</i>) = <b class="huruf-l">a</b><i>x</i> + <b class="huruf-l">b</b></div><small><b class="huruf-l">a</b> = tambahan <i>y</i> setiap <i>x</i> naik 1. <b class="huruf-l">b</b> = nilai <i>y</i> saat <i>x</i> = 0.</small></div><div class="eyebrow">Aturan rahasia</div><div class="fung-rumus mat"><i>f</i>(<i>x</i>) = <button type="button" class="slot-f kosong" data-l="a" disabled>a</button><i>x</i> + <button type="button" class="slot-f kosong" data-l="b" disabled>b</button></div><div class="fd-cap"></div><div class="fd-titik"></div>';
    k.isi.append(el('div', { kelas: 'cocok-isi' }, kiri, kanan)); k.isi.classList.add('fung-isi');
    const cap = kanan.querySelector('.fd-cap'), slot = (l) => kanan.querySelector('.slot-f[data-l="' + l + '"]'), baris = (i) => kiri.querySelector('tr[data-i="' + i + '"]'), dots = kanan.querySelector('.fd-titik');
    const TEKS = ['Ada sebuah fungsi rahasia berbentuk <b>f(x) = ax + b</b>. Tugas kita: menemukan angka <b>a</b> dan <b>b</b> dari tabel dan grafik.', 'Cari <b>b</b>. Saat <i>x</i> = 0, bagian <i>ax</i> menjadi 0, jadi <i>y</i> = b. Di tabel, saat <i>x</i> = 0 nilai <i>y</i> = 3. Maka <b>b = 3</b>.', 'Cari <b>a</b>. Lihat berapa <i>y</i> bertambah setiap <i>x</i> naik 1: dari 3 ke 5, dari 5 ke 7, dari 7 ke 9. Selalu naik 2. Maka <b>a = 2</b>.', 'Gabungkan: <b>f(x) = 2x + 3</b>.', 'Cek dengan <i>x</i> = 2: 2 · 2 + 3 = 7. Di tabel, saat <i>x</i> = 2 nilai <i>y</i> = 7. Cocok, aturannya benar!'];
    const pulsa = async (x, y, an, kali) => { const c = GF.S('circle', { cx: bd.sx(x), cy: bd.sy(y), r: 12, fill: 'none', stroke: '#FF8A1F', 'stroke-width': 4 }); c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; ov.append(c); if (an) await tk.anim(c, [{ transform: 'scale(.8)', opacity: 1 }, { transform: 'scale(2.6)', opacity: 0 }], { duration: 800, iterations: kali || 2 }); else c.style.opacity = 0; };
    const zoom = async (x, y, an, skala) => { plot.style.transformOrigin = (bd.sx(x) / 460 * 100) + '% ' + (bd.sy(y) / 330 * 100) + '%'; if (an) await tk.anim(plot, [{ transform: 'scale(1)' }, { transform: 'scale(' + (skala || 1.5) + ')' }], { duration: 700 }); else plot.style.transform = 'scale(' + (skala || 1.5) + ')'; };
    const keluarZoom = async (an) => { if (an) { await tk.anim(plot, [{ transform: plot.style.transform || 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 600 }); } plot.getAnimations().forEach((x) => x.cancel()); plot.style.transform = ''; };
    const terbang = async (dariEl, keEl, teks, an) => { if (!an || !dariEl || !keEl) return; const r1 = dariEl.getBoundingClientRect(), r2 = keEl.getBoundingClientRect(), f = el('div', { kelas: 'fd-terbang' }, teks); f.style.left = r1.left + 'px'; f.style.top = r1.top + 'px'; document.body.append(f); try { await tk.anim(f, [{ transform: 'translate(0,0) scale(1)' }, { transform: 'translate(' + (r2.left - r1.left) + 'px,' + (r2.top - r1.top) + 'px) scale(1.4)' }], { duration: 1000, easing: 'ease-in-out' }); } finally { f.remove(); } };
    const isi = (l, v) => { const s = slot(l); s.textContent = v; s.classList.remove('kosong'); s.classList.add('isi'); };
    const garis = async (x1, y1, x2, y2, warna, teks, an) => { const L = GF.S('line', { x1: bd.sx(x1), y1: bd.sy(y1), x2: bd.sx(x2), y2: bd.sy(y2), stroke: warna, 'stroke-width': 4, 'stroke-dasharray': '7 5', 'stroke-linecap': 'round' }); ov.append(L); const tx = GF.S('text', { x: (bd.sx(x1) + bd.sx(x2)) / 2 + (x1 === x2 ? 10 : 0), y: (bd.sy(y1) + bd.sy(y2)) / 2 + (x1 === x2 ? 5 : 22), 'font-size': 19, 'font-weight': 700, fill: warna, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, teks); ov.append(tx); if (an) { UI.instan = false; await GF.tumbuh(L, bd.sx(x1), bd.sy(y1), bd.sx(x2), bd.sy(y2), 600, tk); tx.setAttribute('opacity', 0); await tk.anim(tx, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); } };
    function reset() { tk.cek(); ov.innerHTML = ''; document.querySelectorAll('.fd-terbang').forEach((x) => x.remove()); kiri.querySelectorAll('tr').forEach((r) => r.classList.remove('sorot')); kiri.querySelectorAll('.fd-sel .dl').forEach((d) => { d.style.opacity = 0; }); plot.getAnimations().forEach((x) => x.cancel()); plot.style.transform = ''; ['a', 'b'].forEach((l) => { const s = slot(l); s.textContent = l; s.className = 'slot-f kosong'; }); cap.innerHTML = ''; }
    const S = [
      async (an) => { if (an) await tk.tidur(300); ['a', 'b'].forEach((l) => slot(l).classList.add('denyut')); },
      async (an) => { baris(0).classList.add('sorot'); await zoom(0, 3, an, 1.45); await pulsa(0, 3, an, 2); await terbang(baris(0).querySelector('.cy'), slot('b'), '3', an); isi('b', '3'); if (an) await tk.tidur(500); await keluarZoom(an); },
      async (an) => { for (let i = 1; i <= 3; i++) { baris(i - 1).classList.add('sorot'); baris(i).classList.add('sorot'); await garis(XS[i - 1], YS[i - 1], XS[i], YS[i - 1], '#FF8A1F', '+1', an); await garis(XS[i], YS[i - 1], XS[i], YS[i], '#12B886', '+2', an); const d = baris(i).querySelector('.dl'); if (an) { await tk.anim(d, [{ opacity: 0, transform: 'translateY(-.4rem)' }, { opacity: 1, transform: 'none' }], { duration: 350 }); await tk.tidur(i === 3 ? 400 : 200); } else d.style.opacity = 1; } await terbang(baris(3).querySelector('.dl'), slot('a'), '2', an); isi('a', '2'); },
      async (an) => { ['a', 'b'].forEach((l) => slot(l).classList.remove('denyut')); const r = kanan.querySelector('.fung-rumus'); r.classList.add('benar'); if (an) { await tk.anim(r, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 700 }); E.konfeti(innerWidth * .7, innerHeight * .45, 22); } },
      async (an) => { baris(2).classList.add('sorot'); await zoom(2, 7, an, 1.45); await pulsa(2, 7, an, 3); if (an) await tk.tidur(500); await keluarZoom(an); }
    ];
    const kontrol = () => { k.nav.innerHTML = ''; dots.innerHTML = ''; for (let i = 0; i < 5; i++) dots.append(el('span', { kelas: 'dt' + (i === langkah ? ' now' : (i < langkah ? ' isi' : '')) }));
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: langkah === 0 || sibuk, onclick: () => jalankan(langkah - 1, false) } }), el('div', { kelas: 'baris', gaya: 'gap:.5rem' }, el('button', { kelas: 'btn sekunder', type: 'button', disabled: sibuk, html: ik('ulang', 'kecil') + 'Ulangi animasi', onclick: () => jalankan(langkah, true) }), el('button', { kelas: 'btn sekunder', type: 'button', disabled: sibuk, html: ik('main', 'kecil') + 'Putar semua', onclick: putarSemua }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: 'Lewati ke soal', onclick: () => { tk.stop(); fungsiSoal(); } })), langkah < 4 ? tombol('Berikutnya', 'panah', { p: { disabled: sibuk, onclick: () => jalankan(langkah + 1, true) } }) : tombol('Mulai mencoba', 'panah', { kelas: 'hijau denyut-h', p: { onclick: () => { tk.stop(); fungsiSoal(); } } })); };
    async function jalankan(n, an) {
      if (sibuk) return; tk.stop(); tk = UI.token(); sibuk = true; langkah = n; kontrol();
      try { reset(); cap.innerHTML = '<span class="fd-n">Langkah ' + (n + 1) + ' dari 5</span>' + TEKS[n]; UI.instan = true; for (let i = 0; i < n; i++) await S[i](false); UI.instan = false; await S[n](an); }
      catch (e) { if (!(e instanceof UI.Batal)) throw e; } finally { UI.instan = false; sibuk = false; kontrol(); }
    }
    async function putarSemua() { for (let n = 0; n < 5; n++) { if (!w.isConnected) return; await jalankan(n, true); if (!w.isConnected) return; await UI.tidur(1500); } }
    w.append(k.w); kontrol(); jalankan(0, true);
  }

  /* ============================================================ XI-G · langkah 5: dari tabel ke aturan fungsi */
  function fungsi() { const t = T(); t.fung = t.fung || { hasil: [] }; t.fung.hasil = t.fung.hasil || []; if (t.fung.seed == null) { t.fung.seed = Math.floor(Math.random() * 1e6); E.simpan(); } if (t.fung.hasil.some(Boolean)) fungsiSoal(); else fungsiDemo(); }
  function fungsiSoal() {
    E.bawahKosong(); const t = T(), tugas = B.tugasFungsi(t.fung.seed); t.fung = t.fung || { hasil: [] }; t.fung.hasil = t.fung.hasil || []; let no = Math.min(2, t.fung.hasil.filter(Boolean).length);
    const w = el('div', { kelas: 't2-bingkai' }); E.layar(w); const nilai = tugas.map((tg) => tg.label.map(() => null)), salah = tugas.map(() => 0), buka = tugas.map(() => 0);
    const skor = () => t.fung.hasil.filter((h) => h && h.ok).length;
    function gambar() {
      w.innerHTML = ''; const tg = tugas[no], h = t.fung.hasil[no], sel = skor();
      const k = kerangka('Langkah ' + NO().fung + ' · tugas ' + (no + 1) + ' dari 3', 'Dari grafik ke fungsi', { titik: tugas.map((_, i) => (i === no ? 'now' : (t.fung.hasil[i] ? 'isi' : ''))), ke: (i) => { no = i; gambar(); } });
      const kiri = el('div', { kelas: 'kartu cocok-sit gulir' }), s = { judul: tg.judul, x: 'x', y: 'y', baris: tg.baris };
      kiri.innerHTML = '<div class="eyebrow">Mesin misterius</div><h3>' + esc(tg.judul) + '</h3><p style="font-size:1.1rem;margin:.1rem 0 .3rem">' + (tg.tampil === 'grafik' ? 'Grafik ini dibuat oleh sebuah fungsi. Baca koordinat titik-titiknya, lalu temukan aturannya.' : 'Tabel ini dibuat oleh sebuah fungsi. Temukan aturan yang menghasilkannya.') + '</p>' + (tg.tampil === 'grafik' ? '<div class="plot-besar"></div>' : '<div class="data-baris"><div>' + tabelData(s) + '</div><div class="plot-kecil"></div></div>'); kiri.querySelector(tg.tampil === 'grafik' ? '.plot-besar' : '.plot-kecil').append(plotData(s, tg.fam, { label: tg.tampil === 'grafik' }));
      const kanan = el('div', { kelas: 'kartu fung-aturan' }), formula = el('div', { kelas: 'fung-rumus mat' }); formula.innerHTML = tg.rumus.replace(/\[(\w)\]/g, (m, l) => '<button type="button" class="slot-f" data-l="' + l + '"></button>');
      kanan.append(el('div', { kelas: 'fung-umum', html: '<span>Bentuk umum</span><div class="mat">' + tg.umum.replace(/<i>(\w)<\/i>(?=<i>|<sup>| |$)/g, (m, l) => (tg.label.indexOf(l) >= 0 ? '<b class="huruf-l">' + l + '</b>' : m)) + '</div><small>Cari nilai ' + tg.label.map((l) => '<b class="huruf-l">' + l + '</b>').join(' dan ') + ' pada bentuk umum ini.</small>' }), el('div', { kelas: 'eyebrow' }, 'Tulis aturannya'), formula);
      formula.querySelectorAll('.slot-f').forEach((b) => { const i = tg.label.indexOf(b.dataset.l), selesai = !!h; b.textContent = selesai ? F(tg.jawab[i]) : (nilai[no][i] == null ? b.dataset.l : F(nilai[no][i])); if (!selesai && nilai[no][i] == null) b.classList.add('kosong'); b.disabled = selesai; if (selesai) b.classList.add('isi'); else if (nilai[no][i] != null) b.classList.add('terisi'); b.onclick = async () => { const v = await UI.keypadAngka({ judul: 'Nilai ' + b.dataset.l, tanya: 'Berapa nilai <b>' + b.dataset.l + '</b> pada aturan fungsi ini?', ikon: ik('pensil', 'besar') }); if (v != null) { nilai[no][i] = v; gambar(); } }; });
      const ph = el('div', { kelas: 'fung-petunjuk' }); for (let i = 0; i < buka[no]; i++) ph.append(el('div', { kelas: 'umpan hint', html: ik('info') + '<span><b>Petunjuk ' + (i + 1) + ':</b> ' + esc(tg.petunjuk[i]) + '</span>' }));
      kanan.append(ph);
      if (h) kanan.append(el('div', { kelas: 'umpan ' + (h.ok ? 'ok' : 'hint'), html: ik(h.ok ? 'centang' : 'info') + '<span><b>' + (h.ok ? 'Tepat!' : 'Ini aturannya.') + '</b> ' + esc(tg.jelas) + '</span>' }));
      else kanan.append(el('div', { kelas: 'baris', gaya: 'margin-top:auto;flex-wrap:wrap' }, el('button', { kelas: 'btn sekunder', type: 'button', disabled: buka[no] >= 2, html: ik('info', 'kecil') + (buka[no] ? 'Petunjuk berikutnya' : 'Minta petunjuk'), onclick: () => { buka[no]++; gambar(); } }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('main', 'kecil') + 'Lihat contoh', onclick: fungsiDemo }), el('button', { kelas: 'btn hijau', type: 'button', disabled: nilai[no].some((v) => v == null), html: ik('centang') + 'Periksa', onclick: periksa })));
      if (t.fung.hasil.filter(Boolean).length >= 3) kanan.append(el('button', { kelas: 'btn sekunder', type: 'button', gaya: 'align-self:flex-start', html: ik('ulang', 'kecil') + 'Latihan dengan soal baru', onclick: () => { t.fung.seed = Math.floor(Math.random() * 1e6); t.fung.hasil = []; E.simpan(); fungsiSoal(); } }));
      k.isi.append(el('div', { kelas: 'cocok-isi' }, kiri, kanan)); k.isi.classList.add('fung-isi');
      k.nav.append(tombol('Sebelumnya', 'kembali', { kelas: 'sekunder', kiri: true, p: { disabled: no === 0, onclick: () => { no--; gambar(); } } }), el('span', { kelas: 'muted' }, sel + ' dari 3 tugas ditemukan aturannya'), no < 2 ? tombol('Berikutnya', 'panah', { p: { onclick: () => { no++; gambar(); } } }) : tombol('Selesai', 'centang', { kelas: 'hijau', kiri: true, p: { disabled: t.fung.hasil.filter(Boolean).length < 3, onclick: hub } }));
      w.append(k.w);
    }
    async function periksa() {
      const tg = tugas[no], ok = tg.jawab.every((v, i) => v === nilai[no][i]);
      if (ok) { t.fung.hasil[no] = { ok: true, petunjuk: buka[no] }; E.konfeti(innerWidth / 2, innerHeight / 3, 30); }
      else { salah[no]++; if (salah[no] >= 3) t.fung.hasil[no] = { ok: false }; }
      t.fung.skor = Math.max(t.fung.skor || 0, skor()); t.fung.selesai = t.fung.selesai || t.fung.hasil.filter(Boolean).length >= 3; sinkron({ fung: { skor: t.fung.skor } }); gambar();
      if (ok) await UI.info('Tepat!', '<div class="tengah"><p style="font-size:1.2rem">' + esc(tg.jelas) + '</p></div>', 'Lanjut', { ikon: ik('centang', 'besar') });
      else if (salah[no] >= 3) await UI.info('Ini aturannya', '<div class="tengah"><p style="font-size:1.2rem">' + esc(tg.jelas) + '</p><p class="muted">Tidak apa-apa. Coba pahami langkahnya.</p></div>', 'Mengerti', { ikon: ik('info', 'besar') });
      else await UI.info('Belum tepat', '<div class="tengah"><p style="font-size:1.2rem">Coba periksa lagi nilai yang kamu tulis.</p><p class="muted">Tekan “Minta petunjuk” bila perlu.</p></div>', 'Coba lagi', { ikon: ik('info', 'besar') });
    }
    gambar();
  }

  root.Tahap2 = { mulai: (env) => {
    E = env; const P = E.P(); P.t2 = P.t2 || {}; const t = P.t2; t.kartu = t.kartu || {}; t.dis = t.dis || { rnd: [] }; t.cocok = t.cocok || { jawab: [] }; t.cocok.jawab = t.cocok.jawab || []; t.tiket = t.tiket || {}; t.aktif = t.aktif || [1]; t.pam = t.pam || { jawab: {} }; t.fung = t.fung || { hasil: [] };
    if (t.ref && !Array.isArray(t.ref.kuasai)) t.ref = { kuasai: [], bingung: [] };
    hub();
  } };
})(window);
