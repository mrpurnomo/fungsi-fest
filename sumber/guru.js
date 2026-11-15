/* Grafik Fungsi — halaman guru: penjelasan (pengantar sama persis dengan siswa), pantau, kelompok, kode hasil. */
(function () {
  'use strict';
  const { el, ik, esc, anim } = UI, B = BS;
  const atas = document.getElementById('atas'), pg = document.getElementById('panggung'), bawah = document.getElementById('bawah');
  const LS = (k, d) => { try { const v = localStorage.getItem('gfg_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, LSset = (k, v) => { try { localStorage.setItem('gfg_' + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } };
  let pin = '', net = 'cek', tab = 'penjelasan', intro = null, poll = null, data = null;
  const warna = ['poli', 'eksp', 'log', 'trig', 'rasional', 'akar', 'mutlak', 'tangga', 'sepotong'];
  const inisial = (n) => { const k = n.split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); if (!k.length) return '?'; return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };

  async function ga(a, d) { const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 7000); try { const r = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ a, pin }, d || {})), signal: ctl.signal }); const j = await r.json().catch(() => ({})); j._s = r.status; return j; } catch (e) { return { gagal: true, _s: 0 }; } finally { clearTimeout(to); } }
  const hasilLokal = () => LS('hasil', {}), kelLokal = () => LS('kelompok', null);

  function gambarAtas() {
    atas.innerHTML = ''; atas.append(el('span', { kelas: 'logo' }, 'Grafik ', el('b', null, 'Fungsi'), el('span', { kelas: 'chip sorot', gaya: 'margin-left:.4rem' }, 'Guru')));
    const tabs = el('div', { kelas: 'tabs-guru' }); [['penjelasan', 'layar', 'Penjelasan'], ['pantau', 'siswa', 'Pantau'], ['kelompok', 'kelompok', 'Kelompok'], ['t2', 'bintang', 'Tahap 2'], ['kode', 'salin', 'Kode']].forEach(([id, ikon, t]) => tabs.append(el('button', { type: 'button', kelas: id === tab ? 'aktif' : '', html: ik(ikon, 'kecil') + t, onclick: () => ke(id) }))); atas.append(el('span', { kelas: 'ruang' }), tabs, el('span', { kelas: 'ruang' }));
    atas.append(el('span', { kelas: 'chip ' + (net === 'online' ? 'ok' : (net === 'cek' ? 'abu' : 'warn')), html: ik(net === 'online' ? 'wifi' : 'putus', 'kecil') + (net === 'online' ? 'Server aktif' : (net === 'cek' ? 'Memeriksa…' : 'Mode mandiri')) }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('layar', 'kecil'), 'aria-label': 'Layar penuh', title: 'Layar penuh', onclick: UI.layarPenuh }), el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('kembali', 'kecil') + 'Keluar', onclick: keluar }));
  }
  async function keluar() { if (!(await UI.konfirmasi('Keluar dari halaman guru?', '<p class="tengah">Kamu akan kembali ke layar sambutan dan harus memasukkan PIN lagi.</p>', 'Keluar', 'Batal'))) return; try { sessionStorage.removeItem('gfg_pin'); } catch (e) { /* abaikan */ } location.href = 'index.html'; }
  function bersih() { clearInterval(poll); if (intro) { intro.stop(); intro = null; } pg.innerHTML = ''; }
  function ke(t) { tab = t; gambarAtas(); bersih(); ({ penjelasan: tPenjelasan, pantau: tPantau, kelompok: tKelompok, t2: tTahap2, kode: tKode })[t](); }

  /* ---------------- penjelasan = pengantar yang sama dengan siswa ---------------- */
  function tPenjelasan() { const host = el('div', { gaya: 'position:absolute;inset:0' }); pg.append(host); intro = Intro.mount(host, { guru: true, mulai: LS('intro', 0), played: LS('played', []), saatMain: (a) => LSset('played', a), labelAkhir: 'Tes awal dimulai', saatLangkah: (i) => LSset('intro', i), saatSelesai: () => ke('pantau') }); }

  /* ---------------- pantau ---------------- */
  async function tPantau() {
    const w = el('div', { kelas: 'pantau' }); pg.append(w);
    const render = () => {
      w.innerHTML = '';
      if (net !== 'online' || !data) { w.append(el('div', { kelas: 'tengah-isi' }, el('span', { kelas: 'ubin fx-tangga', gaya: 'width:5rem;height:5rem', html: ik('putus') }), el('h2', null, 'Mode mandiri'), el('p', { kelas: 'muted' }, 'Server belum terhubung (database belum diatur, atau halaman dibuka dari berkas). Pemantauan langsung tidak tersedia. Gunakan tab “Kode hasil” untuk memasukkan kode dari siswa.'))); return; }
      const d = data.daftar, masuk = d.filter((x) => x.klaim).length, selesai = d.filter((x) => x.skor != null), rata = selesai.length ? (selesai.reduce((a, b) => a + b.skor, 0) / selesai.length).toFixed(1).replace('.', ',') : '–';
      w.append(el('div', { kelas: 'stat-guru' }, stat('Sudah masuk', masuk + '/24', 'poli'), stat('Selesai tes awal', selesai.length + '/24', 'log'), stat('Rata-rata skor', rata + ' / 5', 'eksp'), el('button', { kelas: 'btn sekunder kecil', type: 'button', gaya: 'margin-left:auto', html: ik('pensil', 'kecil') + 'Akun uji coba: ' + (data.uji && data.uji.klaim ? (data.uji.skor != null ? 'selesai tes' : 'aktif') : 'kosong'), onclick: async () => { if (await UI.konfirmasi('Atur ulang akun uji coba?', '<p class="tengah">Akun uji coba dipakai guru untuk mencoba alur. Ini tidak memengaruhi siswa asli.</p>', 'Atur ulang', 'Tutup')) { await ga('g-reset', { idx: B.DUMMY }); UI.toast('Akun uji coba diatur ulang', 'centang'); muat(); } } }), el('button', { kelas: 'btn bahaya kecil', type: 'button', html: ik('hapus', 'kecil') + 'Atur ulang semua', onclick: async () => { if (await UI.konfirmasi('Atur ulang semua?', '<p>Semua nama, hasil tes, dan kelompok akan dihapus. Ini tidak bisa dibatalkan.</p>', 'Ya, hapus semua', 'Batal')) { await ga('g-reset-semua'); muat(); } } })));
      const grid = el('div', { kelas: 'grid-pantau' }); w.append(grid);
      d.forEach((x, i) => { const st = !x.klaim ? 'belum' : (x.skor != null ? 'selesai' : (Date.now() - x.aktif > 60000 ? 'diam' : 'aktif')); const lab = { belum: 'belum masuk', aktif: ({ intro: 'pengantar', tes: 'mengerjakan tes', hasil: 'melihat hasil', kelompok: 'melihat kelompok', lanjut: 'tahap lanjut', masuk: 'sudah masuk' })[x.tahap] || 'aktif', diam: 'tidak aktif >1 mnt', selesai: 'skor ' + x.skor + '/5' }[st];
        const t = el('button', { kelas: 'tile-pantau ' + st + ' fx-' + warna[i % 9], type: 'button', onclick: () => detail(x), html: '<span class="av">' + inisial(x.nama) + '</span><span class="nm">' + esc(x.nama) + '</span><span class="st">' + lab + '</span>' + (x.kel >= 0 ? '<span class="kg">K' + (x.kel + 1) + '</span>' : '') }); grid.append(t); });
    };
    const stat = (l, v, f) => el('div', { kelas: 'kartu stat fx-' + f, html: '<div class="eyebrow" style="margin:0">' + l + '</div><b>' + v + '</b>' });
    async function muat() { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else if (r._s === 401) { await mintaPin(true); return; } else { net = 'offline'; data = null; } gambarAtas(); render(); }
    function detail(x) { UI.dialog({ judul: x.nama, ikon: ik('siswa', 'besar'), isi: '<p>Status: <b>' + (x.klaim ? (x.skor != null ? 'selesai tes · skor ' + x.skor + ' dari 5' : 'sudah masuk') : 'belum masuk') + '</b>' + (x.kel >= 0 ? ' · Kelompok ' + (x.kel + 1) : '') + '</p><p class="muted">Atur ulang jika siswa berganti tablet atau salah memilih nama. Hasil tesnya ikut terhapus.</p>', tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }, { t: 'Atur ulang nama ini', nilai: true, kelas: 'bahaya', ikon: 'hapus' }], tutupLuar: true }).then(async (v) => { if (v) { await ga('g-reset', { idx: x.idx }); UI.toast('Nama diatur ulang', 'centang'); muat(); } }); }
    await muat(); poll = setInterval(muat, 3000);
  }

  /* ---------------- kelompok ---------------- */
  async function tKelompok() {
    const w = el('div', { kelas: 'kel-wrap' }); pg.append(w);
    const render = () => {
      w.innerHTML = ''; let kel = null, tahan = false;
      if (net === 'online' && data) { kel = data.kelompok; tahan = data.gerbang === 'tutup'; } else { const k = kelLokal(); kel = k ? k.map((g) => g.map((s) => ({ idx: s.idx, nama: B.nama(s.idx) }))) : null; }
      const ket = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.6rem;flex-wrap:wrap' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Kelompok heterogen · 4 kelompok · maks. 6 orang'), el('h2', { gaya: 'margin:0' }, kel ? 'Daftar kelompok' : 'Belum ada kelompok')));
      const aksi = el('div', { kelas: 'baris' }); aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kelompok', 'kecil') + (kel ? 'Susun ulang dari hasil terkini' : 'Bentuk kelompok sekarang'), onclick: bentuk }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('siswa', 'kecil') + 'Tambahkan yang menyusul', onclick: tambahSusul }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('hapus', 'kecil') + 'Hapus', onclick: async () => { if (net === 'online') await ga('g-hapus-kelompok'); else LSset('kelompok', null); muat(); } }));
      ket.append(aksi); w.append(ket);
      if (net === 'online') {
        const selesaiTes = data ? data.daftar.filter((x) => x.skor != null).length : 0;
        const gerbang = el('div', { kelas: 'kartu gerbang ' + (tahan ? 'kunci' : 'buka') });
        gerbang.append(el('span', { kelas: 'ubin ' + (tahan ? 'fx-tangga' : 'fx-log'), html: ik(tahan ? 'gembok' : 'centang') }), el('div', { gaya: 'flex:1' }, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Layar siswa saat ini'), el('h3', { gaya: 'margin:0;font-size:1.5rem' }, tahan ? 'Kelompok TERKUNCI. Siswa menunggu.' : 'Kelompok DIBUKA. Siswa bisa melihat kelompoknya.'), el('div', { kelas: 'muted' }, selesaiTes + ' siswa sudah selesai tes awal. ' + (tahan ? 'Buka setelah semua (atau cukup banyak) siswa selesai.' : 'Siswa yang menyusul masuk lewat “Tambahkan yang menyusul”.'))), el('button', { kelas: 'btn besar ' + (tahan ? 'hijau denyut-h' : 'sekunder'), type: 'button', html: ik(tahan ? 'nyala' : 'gembok') + (tahan ? 'Buka kelompok untuk siswa' : 'Kunci lagi'), onclick: async () => { if (tahan && !(selesaiTes >= 1)) { UI.toast('Belum ada siswa yang selesai tes awal', 'awas'); return; } await ga('g-gerbang', { buka: tahan }); muat(); } }));
        w.append(gerbang);
      }
      if (!kel) { w.append(el('div', { kelas: 'tengah-isi' }, el('p', { kelas: 'muted' }, 'Kelompok disusun dari siswa yang sudah selesai tes awal, secara seimbang (nilai tinggi dan rendah dicampur).'))); return; }
      const grid = el('div', { kelas: 'grid-kel' }); w.append(grid);
      kel.forEach((g, gi) => { const k = el('div', { kelas: 'kel-kartu' }); k.append(el('div', { kelas: 'kel-judul' }, 'Kelompok ' + (gi + 1), el('span', { kelas: 'chip abu' }, g.length + ' orang'))); g.forEach((s) => k.append(el('div', { kelas: 'kel-nama' }, el('span', { kelas: 'av2 fx-' + warna[s.idx % 9] }, inisial(s.nama)), el('span', null, s.nama)))); grid.append(k); });
    };
    async function muat() { if (net !== 'offline') { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else if (r._s === 401) { await mintaPin(true); return; } else { net = 'offline'; data = null; } gambarAtas(); } render(); }
    async function tambahSusul() { let n = 0; if (net === 'online') { const r = await ga('g-tambah'); n = r.ditambah || 0; } else { const h = hasilLokal(), k = kelLokal(); if (k) { const ada = new Set(k.flat().map((s) => s.idx)); Object.keys(h).map(Number).filter((i) => !ada.has(i)).forEach((i) => { if (B.tambahKelompok(k, { idx: i, skor: h[i] }) >= 0) n++; }); LSset('kelompok', k); } } UI.toast(n ? n + ' siswa ditambahkan ke kelompok' : 'Tidak ada siswa yang menyusul', n ? 'centang' : 'info'); muat(); }
    async function bentuk() {
      if (net === 'online') { const r = await ga('g-bentuk'); if (!r.ok) UI.toast('Gagal membentuk kelompok', 'awas'); } else { const h = hasilLokal(), sel = Object.keys(h).map((k) => ({ idx: +k, skor: h[k] })); if (!sel.length) return UI.toast('Belum ada hasil. Masukkan kode di tab Kode hasil.', 'awas'); LSset('kelompok', B.bentukKelompok(sel)); }
      muat();
    }
    await muat(); poll = setInterval(() => { if (net === 'online') muat(); }, 4000);
  }

  /* ---------------- tahap lanjutan: langkah, pemahaman, panggung kelas ---------------- */
  const LANGKAH = ['Kartu pakar', 'Tebak fungsinya', 'Cocokkan grafik', 'Tiket keluar'];
  function konfeti(n) { for (let i = 0; i < n; i++) { const c = el('div', { kelas: 'konfeti', gaya: 'left:' + (innerWidth * (.2 + Math.random() * .6)) + 'px;top:' + (innerHeight * .25) + 'px;background:' + ['#FFC233', '#6D35E8', '#12B886', '#F15BB5', '#2EA7F2', '#FF8A1F'][i % 6] }); document.body.append(c); const a = Math.random() * Math.PI * 2, d = 120 + Math.random() * 360; anim(c, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 220) + 'px) rotate(' + Math.random() * 720 + 'deg)', opacity: 0 }], { duration: 1400 + Math.random() * 1000, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => c.remove()); } }
  function panggungKelas(t) {
    const grup = (t.grup || []).filter((g) => g.n > 0).sort((a, b) => b.rata - a.rata), orang = (t.peringkat || []).slice(0, 10);
    if (!grup.length && !orang.length) { UI.info('Belum ada poin', '<p class="tengah">Poin muncul setelah siswa mengerjakan langkah di tahap lanjutan.</p>', 'Tutup'); return; }
    const seq = grup.map((g, i) => ({ jenis: 'g', i })).reverse().concat(orang.map((o, i) => ({ jenis: 'o', i })).reverse()), isi = el('div', { kelas: 'panggung-kelas' });
    const kolG = el('div', { kelas: 'pk-kol' }, el('h3', null, 'Kelompok terbaik'), el('div', { kelas: 'muted kecil' }, 'Rata-rata poin per siswa')), kolO = el('div', { kelas: 'pk-kol' }, el('h3', null, 'Bintang kelas'), el('div', { kelas: 'muted kecil' }, 'Poin tertinggi perorangan'));
    const medali = ['#F5B700', '#B8BECF', '#C9803A'];
    grup.forEach((g, i) => kolG.append(el('div', { kelas: 'pk-baris sembunyi', 'data-k': 'g' + i, html: '<span class="rk" style="background:' + (medali[i] || '#6D35E8') + '">' + (i + 1) + '</span><b>Kelompok ' + g.kel + '</b><span class="muted kecil">' + g.n + ' siswa</span><span class="pt">' + Math.round(g.rata) + ' <small>rata-rata</small></span>' })));
    orang.forEach((o, i) => kolO.append(el('div', { kelas: 'pk-baris sembunyi', 'data-k': 'o' + i, html: '<span class="rk" style="background:' + (medali[i] || '#6D35E8') + '">' + (i + 1) + '</span><b>' + esc(o.nama) + '</b><span class="muted kecil">' + (o.kel ? 'K' + o.kel : '') + (o.lencana && o.lencana.length ? ' · ' + o.lencana.length + ' lencana' : '') + '</span><span class="pt">' + o.poin + ' <small>poin</small></span>' })));
    isi.append(kolG, kolO); let n = 0;
    const tampil = () => { const x = seq[n++]; const e = isi.querySelector('[data-k="' + x.jenis + x.i + '"]'); if (e) { e.classList.remove('sembunyi'); anim(e, [{ transform: 'translateY(1.2rem) scale(.9)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.34,1.56,.64,1)' }); } if (x.i === 0) konfeti(x.jenis === 'o' ? 110 : 60); };
    const bMaju = el('button', { kelas: 'btn hijau', type: 'button', html: 'Tampilkan berikutnya' + ik('panah', 'kecil'), onclick: () => { if (n < seq.length) tampil(); if (n >= seq.length) { bMaju.disabled = true; bSemua.disabled = true; } } }), bSemua = el('button', { kelas: 'btn sekunder', type: 'button', html: 'Tampilkan semua', onclick: () => { while (n < seq.length) tampil(); bMaju.disabled = true; bSemua.disabled = true; } });
    const wrap = el('div', null, el('div', { kelas: 'baris', gaya: 'justify-content:center;margin-bottom:.8rem' }, bSemua, bMaju), isi);
    return UI.dialog({ lebar: true, judul: 'Panggung Kelas', ikon: ik('bintang', 'besar'), isi: wrap, tombol: [{ t: 'Tutup', nilai: false, kelas: 'sekunder' }] });
  }
  async function tTahap2() {
    const w = el('div', { kelas: 'pantau' }); pg.append(w);
    const render = () => {
      w.innerHTML = ''; if (net !== 'online' || !data || !data.tahap2) { w.append(el('div', { kelas: 'tengah-isi' }, el('h2', null, 'Perlu server'), el('p', { kelas: 'muted' }, 'Pemantauan tahap lanjutan hanya tersedia saat server terhubung.'))); return; }
      const t = data.tahap2, fmt = (v, d) => (v == null ? '–' : v.toFixed(d == null ? 1 : d).replace('.', ',')), lk = t.langkah || 1;
      const ctrl = el('div', { kelas: 'kartu ctrl-langkah' }); ctrl.append(el('div', null, el('div', { kelas: 'eyebrow', gaya: 'margin:0' }, 'Langkah yang dibuka untuk siswa'), el('div', { kelas: 'muted kecil' }, 'Siswa mengerjakan berurutan. Langkah berikutnya terbuka saat kamu menekannya.')));
      const seg = el('div', { kelas: 'seg-langkah' }); LANGKAH.forEach((nm, i) => seg.append(el('button', { type: 'button', kelas: (i + 1) === lk ? 'aktif' : ((i + 1) < lk ? 'lalu' : ''), html: '<span class="no">' + (i + 1) + '</span>' + nm + ((i + 1) < lk ? ik('centang', 'kecil') : ''), onclick: async () => { await ga('g-langkah', { n: i + 1 }); UI.toast('Langkah ' + (i + 1) + ' dibuka: ' + nm, 'centang'); muat(); } })));
      ctrl.append(seg, el('button', { kelas: 'btn sorot', type: 'button', html: ik('bintang', 'kecil') + 'Panggung Kelas', onclick: () => panggungKelas(t) })); w.append(ctrl);
      w.append(el('div', { kelas: 'stat-guru' }, el('div', { kelas: 'kartu stat fx-log', html: '<div class="eyebrow" style="margin:0">Selesai tahap lanjutan</div><b>' + t.selesai + '/24</b>' }), el('div', { kelas: 'kartu stat fx-trig', html: '<div class="eyebrow" style="margin:0">Tebak fungsinya</div><b>' + fmt(t.diskusi) + ' / 6</b>' }), el('div', { kelas: 'kartu stat fx-eksp', html: '<div class="eyebrow" style="margin:0">Cocokkan grafik</div><b>' + fmt(t.cocok) + ' / 5</b>' }), el('div', { kelas: 'kartu stat fx-poli', html: '<div class="eyebrow" style="margin:0">Tiket keluar</div><b>' + fmt(t.tiket) + ' / 3</b>' })));
      const k = el('div', { kelas: 'kartu gulir', gaya: 'flex:1;min-height:0' }); k.append(el('h3', null, 'Pemahaman per jenis grafik'), el('p', { kelas: 'muted kecil' }, 'Dari refleksi akhir siswa: jenis yang dikuasai dan yang masih membingungkan. Jenis dengan banyak “bingung” layak dibahas ulang.'));
      const maks = Math.max(1, ...Object.values(t.agr).map((x) => x.kuasai + x.bingung));
      UI.URUT.forEach((f) => { const x = t.agr[f]; k.append(el('div', { kelas: 'baris fx-' + f, gaya: 'margin:.45rem 0' }, el('div', { html: UI.ubin(f) }).firstChild, el('b', { gaya: 'width:11rem;color:var(--td)' }, UI.NAMA[f]), el('div', { kelas: 'bar-pemahaman' }, el('i', { kelas: 'p', gaya: 'width:' + (x.kuasai / maks * 100) + '%' }), el('i', { kelas: 'b', gaya: 'width:' + (x.bingung / maks * 100) + '%' })), el('span', { kelas: 'chip ok' }, 'dikuasai ' + x.kuasai), el('span', { kelas: 'chip warn' }, 'bingung ' + x.bingung))); });
      w.append(k);
    };
    async function muat() { const r = await ga('g-status'); if (r.ok) { data = r; net = 'online'; } else net = 'offline'; render(); }
    await muat(); poll = setInterval(muat, 4000);
  }

  /* ---------------- kode hasil ---------------- */
  function tKode() {
    const w = el('div', { kelas: 'kode-wrap' }); pg.append(w);
    const render = () => {
      const h = hasilLokal(), ids = Object.keys(h).map(Number).sort((a, b) => a - b); w.innerHTML = '';
      w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.6rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Untuk siswa yang tidak bisa mengirim'), el('h2', { gaya: 'margin:0' }, 'Masukkan kode hasil siswa')), el('div', { kelas: 'baris' }, el('button', { kelas: 'btn besar', type: 'button', html: ik('pensil') + 'Masukkan kode', onclick: tambah }), ids.length ? el('button', { kelas: 'btn sekunder', type: 'button', html: ik('hapus', 'kecil') + 'Kosongkan daftar', onclick: () => { LSset('hasil', {}); render(); } }) : null)));
      if (!ids.length) { w.append(el('div', { kelas: 'tengah-isi' }, el('p', { kelas: 'muted', gaya: 'font-size:1.2rem' }, 'Belum ada kode. Ketuk “Masukkan kode”, lalu ketik 5 karakter dari layar siswa.'))); return; }
      const grid = el('div', { kelas: 'grid-pantau' }); ids.forEach((i) => grid.append(el('div', { kelas: 'tile-pantau selesai fx-' + warna[i % 9], html: '<span class="av">' + inisial(B.nama(i)) + '</span><span class="nm">' + esc(B.nama(i)) + '</span><span class="st">skor ' + h[i] + '/5</span>' }))); w.append(el('div', { kelas: 'muted kecil', gaya: 'margin-bottom:.4rem' }, ids.length + ' siswa tercatat'), grid);
    };
    async function tambah() {
      for (;;) {
        const k = await UI.papanKetik({ judul: 'Kode hasil siswa', ikon: ik('salin', 'besar'), panjang: 5, otomatis: true, keyboard: true, kolom: 8, catatan: 'Ketik 5 karakter dari layar siswa (keyboard atau papan di layar).' }); if (!k) break;
        const r = B.bacaKode(k); if (r.error) { await UI.info('Kode ditolak', '<p class="tengah" style="font-size:1.2rem">' + esc(r.error) + '</p>', 'Coba lagi'); continue; }
        const n = B.nilai(r.idx, r.jawab); const h = hasilLokal(); h[r.idx] = n.benar; LSset('hasil', h); if (net === 'online') await ga('g-kode', { kode: k });
        const lagi = await UI.dialog({ judul: 'Kode diterima', ikon: ik('centang', 'besar'), isi: '<div class="tengah"><div style="font-family:var(--tampil);font-size:2rem;font-weight:700">' + esc(B.nama(r.idx)) + '</div><p style="font-size:1.5rem">Skor <b>' + n.benar + '</b> dari 5</p></div>', tombol: [{ t: 'Selesai', nilai: false, kelas: 'sekunder' }, { t: 'Kode berikutnya', nilai: true }] }); render(); if (!lagi) break;
      }
      render();
    }
    render();
  }

  async function mintaPin(salah) {
    const v = await UI.papanKetik({ judul: 'PIN guru', ikon: ik('kunci', 'besar'), panjang: 5, alfabet: '0123456789', kolom: 5, sembunyi: true, otomatis: true, keyboard: true, catatan: salah ? 'PIN salah. Coba lagi.' : 'Masukkan PIN guru (5 angka).' });
    if (v == null) { location.href = 'index.html'; return; } pin = v; const r = await ga('g-status'); if (r._s === 401) return mintaPin(true); if (r.ok) { net = 'online'; data = r; } else { net = 'offline'; if (pin !== B.PIN_GURU) return mintaPin(true); } try { sessionStorage.setItem('gfg_pin', pin); } catch (e) { /* abaikan */ } gambarAtas(); ke(tab);
  }
  UI.pasangPutar(); gambarAtas(); bawah.style.display = 'none';
  (async () => { const c = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'cek' }) }).then((r) => r.json()).catch(() => ({})); let ss = ''; try { ss = sessionStorage.getItem('gfg_pin') || ''; } catch (e) { /* abaikan */ }
    if (c.ok && c.penyimpanan) { net = 'online'; if (ss) { pin = ss; const r = await ga('g-status'); if (r.ok) { data = r; gambarAtas(); return ke('penjelasan'); } } await mintaPin(false); } else { net = 'offline'; if (ss === B.PIN_GURU) { pin = ss; gambarAtas(); ke('penjelasan'); } else await mintaPin(false); } })();
  window.gfGuru = { ke, ga: () => ga };
})();
