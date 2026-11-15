/* Pengantar bergaya motion graphic: substitusi, mesin fungsi interaktif, menggambar grafik, galeri sembilan jenis, tujuan.
   Dipakai sama persis oleh tablet siswa dan layar guru. */
(function (root) {
  'use strict';
  const { el, ik, tidur, anim, esc } = UI, { S, fmt, K } = GF;
  const m = (n) => String(n).replace('-', '−');
  const NAMA = UI.NAMA;
  const pesta = (x, y) => { for (let i = 0; i < 26; i++) { const c = el('div', { kelas: 'konfeti', gaya: 'left:' + x + 'px;top:' + y + 'px;background:' + ['#FFC233', '#6D35E8', '#12B886', '#F15BB5', '#2EA7F2', '#FF8A1F'][i % 6] }); document.body.append(c); const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 140; anim(c, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 90) + 'px) rotate(' + (Math.random() * 540) + 'deg)', opacity: 0 }], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => c.remove()); } };
  const pop = (e) => anim(e, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 1, offset: .6 }, { transform: 'scale(1)', opacity: 1 }], { duration: 520, easing: 'ease-out' });
  const muncul = (e, d) => anim(e, [{ opacity: 0, transform: 'translateY(.9rem)' }, { opacity: 1, transform: 'none' }], { duration: d || 480 });

  /* ======================================================== adegan: judul */
  async function adJudul(c) {
    const { a, t } = c; const wadah = el('div', { kelas: 'hero kartu' }); a.append(wadah);
    wadah.innerHTML = '<div class="eyebrow">Matematika Tingkat Lanjut · XI-F</div><h1>Mengenal <span class="hl">Grafik Fungsi</span></h1><p>Fungsi itu seperti mesin: kita masukkan satu angka, mesin memberi satu angka baru. Hari ini kita belajar menghitungnya, menggambarnya, dan mengenal bermacam-macam bentuknya.</p><div id="mini" style="width:22rem;height:11rem;margin:.4rem auto 0"></div>';
    await muncul(wadah, 600); t.cek();
    const b = GF.bidang({ xmin: -3, xmax: 3, ymin: -2, ymax: 6, xt: [], yt: [], W: 400, H: 200 }); wadah.querySelector('#mini').append(b.svg);
    const g = b.kurva(GF.sampel((x) => x * x - 1, -2.6, 2.6, 80, -2, 6), { warna: '#6D35E8', tebal: 6, sembunyi: true }); await GF.gambarKurva(g, 1600, t); c.siap();
  }

  /* ======================================================== adegan: pengenalan fungsi linear */
  async function adLinear(c) {
    const { a, t } = c; const w = el('div', { kelas: 'subst' }); a.append(w);
    w.innerHTML = '<div class="eyebrow">Fungsi pertama</div><div class="rumus" id="rm" style="font-size:5.4rem;opacity:0">f(<span class="warna-x">x</span>) = 2<span class="warna-x">x</span> + 1</div><div id="pt" style="opacity:0" class="pita">Ini fungsi <b>linear</b></div><div id="pj" style="opacity:0;max-width:46rem" class="sorotan tengah">Linear artinya grafiknya berupa <b>garis lurus</b>.</div><div id="pk" style="opacity:0;font-size:1.3rem" class="tengah muted">Kita isi <b style="color:var(--f-eksp)">x</b> dengan bilangan apa saja, lalu hitung hasilnya.</div>';
    await anim(w.querySelector('#rm'), [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1.06)', offset: .7 }, { opacity: 1, transform: 'scale(1)' }], { duration: 800 }); t.cek();
    await t.tidur(500); await pop(w.querySelector('#pt')); await t.tidur(500); await muncul(w.querySelector('#pj')); await t.tidur(700); await muncul(w.querySelector('#pk')); c.siap();
  }

  /* ======================================================== adegan: substitusi satu nilai x (animasi hitung) */
  async function adSubst(c, cfg) {
    const { a, t } = c, x = cfg.x, kuad = cfg.tipe === 'kuad';
    const v1 = kuad ? x * x : 2 * x, y = kuad ? v1 - 4 : v1 + 1;
    const w = el('div', { kelas: 'subst' }); a.append(w);
    const X = '<span class="tok warna-x v">x</span>', slot = (i, par) => '<span class="tok slot" data-s="' + i + '" data-par="' + (par ? 1 : 0) + '" style="visibility:hidden">' + (par ? '(' + m(x) + ')' : m(x)) + '</span>';
    const L1 = kuad ? 'f(' + X + ') = ' + X + '² − 4' : 'f(' + X + ') = 2' + X + ' + 1';
    const L2 = kuad ? 'f(' + slot(0) + ') = ' + slot(1, true) + '² − 4' : 'f(' + slot(0) + ') = 2' + slot(1, true) + ' + 1';
    const L3 = 'f(' + m(x) + ') = <span class="tok antara">' + m(v1) + '</span> ' + (kuad ? '− 4' : '+ 1');
    const L4 = 'f(' + m(x) + ') = <span class="tok hasil">' + m(y) + '</span>';
    w.innerHTML = '<div class="eyebrow">' + (cfg.judul || 'Mari mencoba') + '</div><div class="baris" style="gap:1.4rem"><span class="cip-x" id="cx">x = ' + m(x) + '</span></div>'
      + [L1, L2, L3, L4].map((r, i) => '<div class="baris-rumus" id="b' + i + '"><div class="rumus">' + r + '</div></div>').join('') + '<div class="titik-hasil" id="th">Titik koordinat <span class="mat">(x, y)</span> = <span style="font-family:var(--mat);font-size:2.2rem">(' + m(x) + ', ' + m(y) + ')</span></div>';
    const b = (i) => w.querySelector('#b' + i), cx = w.querySelector('#cx');
    await muncul(b(0)); await t.tidur(500);
    await pop(cx); await t.tidur(500); b(1).style.opacity = 1; b(1).style.transform = 'none';
    const slots = [...b(1).querySelectorAll('.slot')];
    for (const s of slots) {
      const r1 = cx.getBoundingClientRect(), r2 = s.getBoundingClientRect(); const f = el('div', { kelas: 'terbang', gaya: 'left:' + r1.left + 'px;top:' + r1.top + 'px', html: m(x) }); document.body.append(f);
      await anim(f, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + ((r1.left + r2.left) / 2 - r1.left) + 'px,' + (-60) + 'px) scale(1.25)', opacity: 1, offset: .5 }, { transform: 'translate(' + (r2.left - r1.left) + 'px,' + (r2.top - r1.top) + 'px) scale(.8)', opacity: .9 }], { duration: 850, easing: 'cubic-bezier(.4,.1,.3,1)' }).catch(() => {}); f.remove();
      if (t.batal) throw new UI.Batal(); s.style.visibility = 'visible'; pop(s); await t.tidur(180);
    }
    await t.tidur(900); await muncul(b(2)); const an = b(2).querySelector('.antara'); anim(an, [{ transform: 'rotateX(90deg)', color: '#FF8A1F' }, { transform: 'rotateX(0)', color: '#6D35E8' }], { duration: 700 }); await t.tidur(1100);
    await muncul(b(3)); const hs = b(3).querySelector('.hasil'); await anim(hs, [{ transform: 'scale(.4)' }, { transform: 'scale(1.5)', offset: .6 }, { transform: 'scale(1)' }], { duration: 700 }); const r = hs.getBoundingClientRect(); pesta(r.left + r.width / 2, r.top); await t.tidur(700);
    await pop(w.querySelector('#th')); w.querySelector('#th').style.opacity = 1; c.siap();
  }

  /* ======================================================== adegan: mesin fungsi interaktif */
  const RODA = '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill="none" stroke="#fff" stroke-width="7" stroke-dasharray="5.5 5.5"/><circle cx="20" cy="20" r="11" fill="#fff"/><circle cx="20" cy="20" r="4" fill="#6D35E8"/></svg>';
  async function adMesin(c, cfg) {
    const { a, t } = c; let sibuk = false, selesai = 0;
    const w = el('div', { gaya: 'flex:1;display:flex;flex-direction:column;min-height:0' }); a.append(w);
    w.innerHTML = '<div class="sorotan tengah" id="ins" style="align-self:center;margin-bottom:.5rem">' + cfg.petunjuk + '</div><div class="mesin-adegan"><div class="baki" id="bm"><h4>Masukan (x)</h4></div><div class="mesin" id="ms"><div class="judul-mesin">f(x) = ' + cfg.rumus + '</div><div class="lubang" id="lb">Letakkan angka di sini</div><div class="roda-baris"><div class="roda">' + RODA + '</div><div class="roda">' + RODA + '</div><div class="roda">' + RODA + '</div></div><div class="layar-hitung" id="lh">siap</div><div class="corong" id="cr"></div></div><div class="baki" id="bk"><h4>Keluaran (y)</h4></div></div><div class="panel-titik" id="pt"><span class="lab">Titik yang terkumpul</span></div>';
    const bm = w.querySelector('#bm'), bk = w.querySelector('#bk'), ms = w.querySelector('#ms'), lb = w.querySelector('#lb'), lh = w.querySelector('#lh'), cr = w.querySelector('#cr'), pt = w.querySelector('#pt'), ins = w.querySelector('#ins');
    (cfg.awal || []).forEach((p) => pt.append(el('span', { kelas: 'cip-titik' }, '(' + m(p.x) + ', ' + m(p.y) + ')')));
    const dalam = (cx, cy) => { const r = ms.getBoundingClientRect(); return cx > r.left - 30 && cx < r.right + 30 && cy > r.top - 30 && cy < r.bottom + 30; };
    async function proses(chip, x) {
      if (sibuk || chip.classList.contains('pakai')) return; sibuk = true; chip.classList.add('pakai'); lb.classList.add('sambut');
      const r1 = chip.getBoundingClientRect(), r2 = lb.getBoundingClientRect();
      const f = el('div', { kelas: 'terbang', gaya: 'left:' + r1.left + 'px;top:' + r1.top + 'px', html: m(x) }); document.body.append(f);
      await anim(f, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + (r2.left + r2.width / 2 - r1.left - 20) + 'px,' + (r2.top + r2.height / 2 - r1.top - 14) + 'px) scale(.4)', opacity: .1 }], { duration: 550, easing: 'cubic-bezier(.5,0,.8,.5)' }).catch(() => {}); f.remove(); t.cek();
      lb.classList.remove('sambut'); ms.classList.add('jalan'); const y = cfg.f(x), cepat = cfg.cepat;
      lh.textContent = cfg.tulis(x); await t.tidur(cepat ? 450 : 1100); lh.innerHTML = cfg.tulis(x) + ' = <b style="color:#FFC233">' + m(y) + '</b>'; await t.tidur(cepat ? 250 : 650); ms.classList.remove('jalan');
      const out = el('div', { kelas: 'chip-angka keluar', html: m(y), gaya: 'opacity:0' }); bk.append(out);
      const rc = cr.getBoundingClientRect(), ro = out.getBoundingClientRect(), dx = rc.left + rc.width / 2 - (ro.left + ro.width / 2), dy = rc.top - ro.top;
      await anim(out, [{ opacity: 1, transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.3)' }, { opacity: 1, transform: 'translate(' + dx * .35 + 'px,' + (dy * .15 + 14) + 'px) scale(1.25)', offset: .45 }, { transform: 'translate(' + dx * .08 + 'px,-.9rem) scale(.92)', offset: .7 }, { transform: 'translate(0,.2rem) scale(1.04)', offset: .88 }, { transform: 'none', opacity: 1 }], { duration: cepat ? 650 : 1050, easing: 'cubic-bezier(.3,.9,.4,1)' }); t.cek();
      const cp = el('span', { kelas: 'cip-titik', html: '(' + m(x) + ', ' + m(y) + ')' }); pt.append(cp); pop(cp); lh.textContent = 'siap'; selesai++; sibuk = false;
      if (selesai >= cfg.masukan.length) { ins.innerHTML = cfg.akhir; ins.style.background = 'var(--mint-100)'; ins.style.color = 'var(--mint-800)'; pop(ins); c.siap(); }
    }
    cfg.masukan.forEach((x) => { const chip = el('div', { kelas: 'chip-angka', html: m(x) }); bm.append(chip);
      UI.seret(chip, { aktif: () => !sibuk, jatuh: dalam, saatJatuh: () => proses(chip, x).catch((e) => { if (!(e instanceof UI.Batal)) throw e; }), saatKetuk: () => proses(chip, x).catch((e) => { if (!(e instanceof UI.Batal)) throw e; }) }); });
    await muncul(w, 400);
  }

  /* ======================================================== adegan: titik → bidang Kartesius → grafik */
  async function adPlot(c, cfg) {
    const { a, t } = c; const w = el('div', { kelas: 'plot-adegan' }); a.append(w);
    const tab = el('div', { kelas: 'tabel-titik' }); tab.append(el('div', { kelas: 'b kepala' }, el('span', null, 'x'), el('span', null, 'y')));
    cfg.titik.forEach((p, i) => tab.append(el('div', { kelas: 'b', 'data-i': i }, el('span', { gaya: 'color:var(--f-eksp-d)' }, m(p.x)), el('span', { gaya: 'color:var(--mint-800)' }, m(p.y)))));
    const kg = el('div', { kelas: 'kotak-grafik' }), wad = el('div', { kelas: 'wadah' }), ket = el('div', { kelas: 'keterangan' }); kg.append(wad, ket); w.append(tab, kg);
    const b = GF.bidang(cfg.spec); wad.append(b.svg); const baris = [...tab.querySelectorAll('.b:not(.kepala)')];
    baris.forEach((r) => (r.style.opacity = 0)); b.ax.style.opacity = 0; b.ay.style.opacity = 0;
    for (const r of baris) { await muncul(r, 220); await t.tidur(90); } t.cek(); await t.tidur(400);
    await Promise.all([anim(b.ax, [{ opacity: 0 }, { opacity: 1 }], { duration: 700 }), anim(b.ay, [{ opacity: 0 }, { opacity: 1 }], { duration: 700 })]);
    if (cfg.ingatkan) {
      const cx = el('span', { kelas: 'chip', gaya: 'background:var(--f-eksp-t);color:var(--f-eksp-d);font-size:1.05rem;opacity:0' }, 'Sumbu x = domain (nilai masukan x)'), cy = el('span', { kelas: 'chip', gaya: 'background:var(--mint-100);color:var(--mint-800);font-size:1.05rem;opacity:0' }, 'Sumbu y = kodomain (nilai keluaran y)'); ket.append(cx, cy);
      b.ax.setAttribute('stroke', '#FF8A1F'); await muncul(cx); anim(b.tx, [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 900 }); await t.tidur(1900);
      b.ax.setAttribute('stroke', '#1E1B4B'); b.ay.setAttribute('stroke', '#12B886'); await muncul(cy); await t.tidur(2000); b.ay.setAttribute('stroke', '#1E1B4B'); await t.tidur(300);
    }
    const urut = cfg.titik.map((p, i) => ({ p, i })).sort((u, v) => u.p.x - v.p.x); let n = 0;
    for (const { p, i } of urut) {
      const cepat = n++ >= 2 ? .5 : 1, r = baris[i]; r.classList.add('sorot');
      const g = b.putus(p.x, p.y, '#FF8A1F'); g.h.setAttribute('stroke', '#12B886');
      const x0 = +g.v.getAttribute('x1'), y0 = +g.v.getAttribute('y1'), x1 = b.sx(p.x), y1 = b.sy(p.y), hx0 = +g.h.getAttribute('x1'), hy0 = +g.h.getAttribute('y1');
      await Promise.all([GF.tumbuh(g.v, x0, y0, x1, y1, 700 * cepat, t), GF.tumbuh(g.h, hx0, hy0, x1, y1, 700 * cepat, t)]);
      const tt = b.titik(p.x, p.y, { warna: '#6D35E8' }); await pop(tt); r.classList.remove('sorot'); r.classList.add('selesai'); await t.tidur(280 * cepat);
    }
    await t.tidur(500);
    const kv = b.kurva(cfg.garis(), { warna: cfg.warna, tebal: 6, sembunyi: true }); await GF.gambarKurva(kv, 1800, t);
    const l1 = el('span', { kelas: 'chip', gaya: 'background:' + cfg.warna + ';color:#fff;font-size:1.15rem;opacity:0' }, 'Grafik ' + cfg.label), l2 = el('span', { kelas: 'chip sorot', gaya: 'font-size:1.05rem;opacity:0' }, cfg.jenis);
    ket.innerHTML = ''; ket.append(l1, l2); await muncul(l1); await muncul(l2); c.siap();
  }

  /* ======================================================== adegan: galeri sembilan grafik */
  async function adGaleri(c) {
    const { a, t, guru } = c; const lihat = new Set(); let idx = 0, vi = 0;
    const g = el('div', { kelas: 'galeri' }); a.append(g); const daftar = el('div', { kelas: 'daftar gulir' }), isi = el('div', { gaya: 'min-height:0;display:flex;flex-direction:column;gap:.4rem' }); g.append(daftar, isi);
    const tabs = UI.URUT.map((id, i) => { const b = el('button', { kelas: 'tab fx-' + id, type: 'button', html: UI.ubin(id) + '<span>' + NAMA[id] + '</span>' + ik('centang', 'kecil').replace('class="ik kecil"', 'class="ik kecil centang"') , onclick: () => tampil(i) }); daftar.append(b); return b; });
    let tt;
    function tampil(i) {
      idx = i; vi = 0; lihat.add(i); const id = UI.URUT[i], d = K[id]; tabs.forEach((b, k) => { b.classList.toggle('aktif', k === i); b.classList.toggle('lihat', lihat.has(k)); });
      isi.innerHTML = ''; const baris = el('div', { kelas: 'isi fx-' + id, gaya: 'flex:1' }); isi.append(baris); if (tt) tt.stop(); tt = UI.token();
      const kiri = el('div', { kelas: 'kotak-grafik' }), wad = el('div', { kelas: 'wadah' }); kiri.append(wad); const kanan = el('div', { kelas: 'info gulir' }); baris.append(kiri, kanan);
      const nama = el('div', { kelas: 'baris' }, el('div', { html: UI.ubin(id) }).firstChild, el('h3', { gaya: 'margin:0;font-size:1.6rem;color:var(--td)' }, NAMA[id])); const rk = el('div', { kelas: 'rumus-kartu' }); const sv = el('div', { kelas: 'seg-varian' });
      kanan.append(nama, rk); if (d.varian.length > 1) kanan.append(sv);
      kanan.append(el('div', null, el('div', { kelas: 'eyebrow' }, 'Ciri grafik'), el('ul', null, d.ciri.map((x) => el('li', null, x)))), el('div', null, el('div', { kelas: 'eyebrow' }, 'Contoh dalam kehidupan'), el('ul', null, d.konteks.map((x) => el('li', null, x)))));
      const gb = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-top:auto' }, el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Sebelumnya', disabled: i === 0, onclick: () => tampil(i - 1) }), el('button', { kelas: 'btn kecil', type: 'button', html: 'Berikutnya' + ik('panah', 'kecil'), disabled: i === 8, onclick: () => tampil(i + 1) })); kanan.append(gb);
      const gambar = (v) => { const cur = tt; wad.innerHTML = ''; const r = GF.gambarVarian(d.varian[v], 'var(--t)'); wad.append(r.b.svg); rk.innerHTML = '<div class="eyebrow" style="margin:0">Contoh fungsi · ' + esc(d.varian[v].nama) + '</div><div class="mat" style="font-size:' + (d.varian[v].rumus.length > 18 ? '1.35rem' : '2.1rem') + '">' + esc(d.varian[v].rumus) + '</div>';
        (async () => { try { await GF.gambarKurva(r.kurva, 1300, cur); r.b.svg.querySelectorAll('.tk').forEach((c2) => c2.setAttribute('opacity', 1)); } catch (e) { if (!(e instanceof UI.Batal)) throw e; } })(); };
      if (d.varian.length > 1) d.varian.forEach((v, k) => sv.append(el('button', { type: 'button', kelas: k === 0 ? 'aktif' : '', onclick: (e) => { [...sv.children].forEach((x) => x.classList.remove('aktif')); e.currentTarget.classList.add('aktif'); gambar(k); } }, v.nama.split('·')[0].trim())));
      gambar(0); if (lihat.size >= 9 || guru) c.siap(true);
      const info = document.getElementById('infoGaleri'); if (info) info.textContent = 'Dilihat ' + lihat.size + ' dari 9';
    }
    tampil(0);
  }

  /* ======================================================== adegan: tujuan pembelajaran */
  async function adTujuan(c) {
    const { a, t } = c; const w = el('div', { kelas: 'tujuan-daftar' }); a.append(w);
    w.append(el('div', { kelas: 'tengah' }, el('div', { kelas: 'eyebrow' }, 'Tujuan hari ini'), el('h2', null, 'Setelah pelajaran ini, kalian bisa …')));
    const T = ['Menghitung nilai fungsi: memasukkan x ke rumus untuk mendapatkan y.', 'Menemukan titik koordinat (x, y) lalu menggambar grafik fungsi dari titik-titik itu.', 'Mengenal 9 jenis grafik fungsi beserta rumus dan contoh kejadian sehari-hari.', 'Membaca bentuk grafik untuk memahami masalah di sekitar kita.'];
    const baris = T.map((s, i) => { const r = el('div', { kelas: 'tujuan' }, el('span', { kelas: 'no' }, i + 1), el('span', null, s)); w.append(r); return r; });
    for (const r of baris) { await t.tidur(500); await anim(r, [{ opacity: 0, transform: 'translateX(2rem)' }, { opacity: 1, transform: 'none' }], { duration: 560 }); }
    c.siap();
  }

  /* ======================================================== daftar adegan */
  const LIN = { titik: [{ x: -1, y: -1 }, { x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }] };
  const KUA = { titik: [{ x: -3, y: 5 }, { x: -2, y: 0 }, { x: -1, y: -3 }, { x: 0, y: -4 }, { x: 1, y: -3 }, { x: 2, y: 0 }, { x: 3, y: 5 }] };
  const ADEGAN = [
    { judul: 'Selamat datang', f: adJudul },
    { judul: 'Fungsi linear', f: adLinear },
    { judul: 'Mengisi x = 0', f: (c) => adSubst(c, { tipe: 'lin', x: 0, judul: 'Mari mencoba: x = 0' }) },
    { judul: 'Mengisi x = 1', f: (c) => adSubst(c, { tipe: 'lin', x: 1, judul: 'Sekarang: x = 1' }) },
    { judul: 'Mesin fungsi', f: (c) => adMesin(c, { rumus: '2x + 1', f: (x) => 2 * x + 1, tulis: (x) => '2(' + m(x) + ') + 1', masukan: [-1, 2, 3], awal: [{ x: 0, y: 1 }, { x: 1, y: 3 }], petunjuk: 'Seret angka ke mesin (atau ketuk angkanya). Ada 3 angka untuk dicoba.', akhir: 'Rumusnya sama, hanya x yang berbeda — kita mendapat <b>banyak titik koordinat</b>!' }) },
    { judul: 'Menggambar grafik', f: (c) => adPlot(c, { titik: LIN.titik, spec: { xmin: -4, xmax: 5, ymin: -4, ymax: 9, xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4, 5], yt: [-4, -2, 0, 2, 4, 6, 8], labelX: 'x', labelY: 'y' }, garis: () => [[[-1.7, -2.4], [3.4, 7.8]]], warna: '#2EA7F2', label: 'f(x) = 2x + 1', jenis: 'Fungsi linear: garis lurus', ingatkan: true }) },
    { judul: 'Fungsi lain', f: (c) => adLinearKuad(c) },
    { judul: 'Mengisi x = 0', f: (c) => adSubst(c, { tipe: 'kuad', x: 0, judul: 'f(x) = x² − 4, coba x = 0' }) },
    { judul: 'Mesin fungsi', f: (c) => adMesin(c, { rumus: 'x² − 4', f: (x) => x * x - 4, tulis: (x) => '(' + m(x) + ')² − 4', masukan: [-3, -2, -1, 1, 2, 3], cepat: true, awal: [{ x: 0, y: -4 }], petunjuk: 'Coba 6 angka ini. Animasinya lebih cepat.', akhir: 'Perhatikan: <b>x = −2 dan x = 2</b> menghasilkan y yang sama.' }) },
    { judul: 'Grafik fungsi kuadrat', f: (c) => adPlot(c, { titik: KUA.titik, spec: { xmin: -4, xmax: 4, ymin: -6, ymax: 8, xt: [-4, -3, -2, -1, 0, 1, 2, 3, 4], yt: [-6, -4, -2, 0, 2, 4, 6, 8] }, garis: () => GF.sampel((x) => x * x - 4, -3.2, 3.2, 120, -6, 8), warna: '#F15BB5', label: 'f(x) = x² − 4', jenis: 'Melengkung, berbeda dari garis lurus' }) },
    { judul: 'Sembilan jenis grafik', f: adGaleri },
    { judul: 'Tujuan pembelajaran', f: adTujuan }
  ];
  async function adLinearKuad(c) {
    const { a, t } = c; const w = el('div', { kelas: 'subst' }); a.append(w);
    w.innerHTML = '<div class="eyebrow">Fungsi yang berbeda</div><div class="rumus" id="rm" style="font-size:5.4rem;opacity:0">f(<span class="warna-x">x</span>) = <span class="warna-x">x</span>² − 4</div><div id="pj" style="opacity:0;max-width:50rem" class="sorotan tengah">Rumus yang berbeda menghasilkan <b>gambar grafik yang berbeda</b>.</div><div id="pk" style="opacity:0;font-size:1.3rem" class="tengah muted">Cara menggambarnya sama: hitung beberapa titik, gambar titiknya, lalu hubungkan.</div>';
    await anim(w.querySelector('#rm'), [{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 800 }); t.cek(); await t.tidur(600); await muncul(w.querySelector('#pj')); await t.tidur(900); await muncul(w.querySelector('#pk')); c.siap();
  }

  /* ======================================================== pemutar */
  function mount(host, o) {
    o = o || {}; const guru = !!o.guru; let idx = o.mulai || 0, tok = null, siap = false, ulangFn = null;
    host.innerHTML = '';
    const root0 = el('div', { kelas: 'intro' }), kepala = el('div', { kelas: 'kepala-intro' }), adegan = el('div', { kelas: 'adegan' }), kendali = el('div', { kelas: 'kendali' });
    const judul = el('h2'), no = el('span', { kelas: 'chip' }); kepala.append(judul, no, el('div', { gaya: 'flex:1' }), el('span', { id: 'infoGaleri', kelas: 'chip abu', hidden: true }));
    const titik = el('div', { kelas: 'titik-langkah' }); ADEGAN.forEach((x, i) => titik.append(el('i', { 'aria-label': 'Langkah ' + (i + 1) })));
    const bMundur = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Kembali', onclick: () => ke(idx - 1) });
    const bUlang = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Ulangi', onclick: () => ke(idx) });
    const bMaju = el('button', { kelas: 'btn', type: 'button', onclick: () => { if (idx === ADEGAN.length - 1) { if (o.saatSelesai) o.saatSelesai(); } else ke(idx + 1); } });
    kendali.append(bMundur, titik, bUlang, bMaju); root0.append(kepala, adegan, kendali); host.append(root0);
    function perbarui() {
      judul.textContent = ADEGAN[idx].judul; no.textContent = (idx + 1) + ' / ' + ADEGAN.length; [...titik.children].forEach((d, i) => { d.className = i === idx ? 'aktif' : (i < idx ? 'sudah' : ''); });
      bMundur.disabled = idx === 0; const akhir = idx === ADEGAN.length - 1;
      bMaju.innerHTML = (akhir ? (o.labelAkhir || 'Selesai') : 'Lanjut') + ik(akhir ? 'centang' : 'panah'); bMaju.className = 'btn' + (akhir ? ' hijau' : '') + ((siap || guru) ? ' denyut' : ' mati');
      document.getElementById('infoGaleri') && (document.getElementById('infoGaleri').hidden = ADEGAN[idx].f !== adGaleri);
    }
    async function ke(i) {
      if (i < 0 || i >= ADEGAN.length) return; if (tok) tok.stop(); tok = UI.token(); idx = i; siap = false; adegan.innerHTML = ''; perbarui(); if (o.saatLangkah) o.saatLangkah(i);
      const t = tok; const ctx = { a: adegan, t, guru, siap: () => { if (t.batal) return; siap = true; perbarui(); } };
      try { await ADEGAN[i].f(ctx); } catch (e) { if (!(e instanceof UI.Batal)) console.error(e); }
    }
    const tombol = (e) => { if (!guru && !o.papan) return; if (e.key === 'ArrowRight') { if (idx < ADEGAN.length - 1) ke(idx + 1); } else if (e.key === 'ArrowLeft') ke(idx - 1); };
    document.addEventListener('keydown', tombol);
    ke(idx);
    return { ke, jumlah: ADEGAN.length, stop() { if (tok) tok.stop(); document.removeEventListener('keydown', tombol); }, idx: () => idx };
  }
  root.Intro = { mount, JUMLAH: ADEGAN.length };
})(window);
