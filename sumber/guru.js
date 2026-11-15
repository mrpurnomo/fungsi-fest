/* Grafik Fungsi — halaman guru: penjelasan (pengantar sama persis dengan siswa), pantau, kelompok, kode hasil. */
(function () {
  'use strict';
  const { el, ik, esc, anim } = UI, B = BS;
  const atas = document.getElementById('atas'), pg = document.getElementById('panggung'), bawah = document.getElementById('bawah');
  const LS = (k, d) => { try { const v = localStorage.getItem('gfg_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, LSset = (k, v) => { try { localStorage.setItem('gfg_' + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } };
  let pin = '', net = 'cek', tab = 'penjelasan', intro = null, poll = null, data = null;
  const warna = ['poli', 'eksp', 'log', 'trig', 'rasional', 'akar', 'mutlak', 'tangga', 'sepotong'];
  const inisial = (n) => { const k = n.split(/\s+/); return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };

  async function ga(a, d) { const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 7000); try { const r = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ a, pin }, d || {})), signal: ctl.signal }); const j = await r.json().catch(() => ({})); j._s = r.status; return j; } catch (e) { return { gagal: true, _s: 0 }; } finally { clearTimeout(to); } }
  const hasilLokal = () => LS('hasil', {}), kelLokal = () => LS('kelompok', null);

  function gambarAtas() {
    atas.innerHTML = ''; atas.append(el('span', { kelas: 'logo' }, 'Grafik ', el('b', null, 'Fungsi'), el('span', { kelas: 'chip sorot', gaya: 'margin-left:.4rem' }, 'Guru')));
    const tabs = el('div', { kelas: 'tabs-guru' }); [['penjelasan', 'layar', 'Penjelasan'], ['pantau', 'siswa', 'Pantau'], ['kelompok', 'kelompok', 'Kelompok'], ['kode', 'salin', 'Kode hasil']].forEach(([id, ikon, t]) => tabs.append(el('button', { type: 'button', kelas: id === tab ? 'aktif' : '', html: ik(ikon, 'kecil') + t, onclick: () => ke(id) }))); atas.append(el('span', { kelas: 'ruang' }), tabs, el('span', { kelas: 'ruang' }));
    atas.append(el('span', { kelas: 'chip ' + (net === 'online' ? 'ok' : (net === 'cek' ? 'abu' : 'warn')), html: ik(net === 'online' ? 'wifi' : 'putus', 'kecil') + (net === 'online' ? 'Server aktif' : (net === 'cek' ? 'Memeriksa…' : 'Mode mandiri')) }), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('layar', 'kecil') + 'Layar penuh', onclick: UI.layarPenuh }));
  }
  function bersih() { clearInterval(poll); if (intro) { intro.stop(); intro = null; } pg.innerHTML = ''; }
  function ke(t) { tab = t; gambarAtas(); bersih(); ({ penjelasan: tPenjelasan, pantau: tPantau, kelompok: tKelompok, kode: tKode })[t](); }

  /* ---------------- penjelasan = pengantar yang sama dengan siswa ---------------- */
  function tPenjelasan() { const host = el('div', { gaya: 'position:absolute;inset:0' }); pg.append(host); intro = Intro.mount(host, { guru: true, mulai: LS('intro', 0), labelAkhir: 'Tes awal dimulai', saatLangkah: (i) => LSset('intro', i), saatSelesai: () => ke('pantau') }); }

  /* ---------------- pantau ---------------- */
  async function tPantau() {
    const w = el('div', { kelas: 'pantau' }); pg.append(w);
    const render = () => {
      w.innerHTML = '';
      if (net !== 'online' || !data) { w.append(el('div', { kelas: 'tengah-isi' }, el('span', { kelas: 'ubin fx-tangga', gaya: 'width:5rem;height:5rem', html: ik('putus') }), el('h2', null, 'Mode mandiri'), el('p', { kelas: 'muted' }, 'Server belum terhubung (database belum diatur, atau halaman dibuka dari berkas). Pemantauan langsung tidak tersedia. Gunakan tab “Kode hasil” untuk memasukkan kode dari siswa.'))); return; }
      const d = data.daftar, masuk = d.filter((x) => x.klaim).length, selesai = d.filter((x) => x.skor != null), rata = selesai.length ? (selesai.reduce((a, b) => a + b.skor, 0) / selesai.length).toFixed(1).replace('.', ',') : '–';
      w.append(el('div', { kelas: 'stat-guru' }, stat('Sudah masuk', masuk + '/24', 'poli'), stat('Selesai tes awal', selesai.length + '/24', 'log'), stat('Rata-rata skor', rata + ' / 5', 'eksp'), el('button', { kelas: 'btn bahaya kecil', type: 'button', gaya: 'margin-left:auto', html: ik('hapus', 'kecil') + 'Atur ulang semua', onclick: async () => { if (await UI.konfirmasi('Atur ulang semua?', '<p>Semua nama, hasil tes, dan kelompok akan dihapus. Ini tidak bisa dibatalkan.</p>', 'Ya, hapus semua', 'Batal')) { await ga('g-reset-semua'); muat(); } } })));
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
      const aksi = el('div', { kelas: 'baris' }); aksi.append(el('button', { kelas: 'btn', type: 'button', html: ik('kelompok') + (kel ? 'Susun ulang dari hasil terkini' : 'Bentuk kelompok sekarang'), onclick: bentuk }));
      if (net === 'online') aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik(tahan ? 'buka' : 'gembok', 'kecil') + (tahan ? 'Buka untuk siswa' : 'Tahan dulu (siswa menunggu)'), onclick: async () => { await ga('g-gerbang', { buka: tahan }); muat(); } }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('siswa', 'kecil') + 'Tambahkan yang menyusul', onclick: tambahSusul }));
      if (kel) aksi.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('hapus', 'kecil') + 'Hapus', onclick: async () => { if (net === 'online') await ga('g-hapus-kelompok'); else LSset('kelompok', null); muat(); } }));
      ket.append(aksi); w.append(ket);
      if (net === 'online') w.append(el('div', { kelas: 'umpan ' + (tahan ? 'hint' : 'ok'), gaya: 'margin-bottom:.6rem', html: ik('info') + '<span>' + (tahan ? 'Siswa yang menekan “Lihat kelompok” akan menunggu sampai kamu membentuk kelompok.' : 'Kelompok terbentuk otomatis saat siswa pertama menekan “Lihat kelompok”. Siswa yang menyusul ditambahkan ke kelompok yang ada.') + '</span>' }));
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
        const k = await UI.papanKetik({ judul: 'Kode hasil siswa', ikon: ik('salin', 'besar'), panjang: 5, otomatis: true, kolom: 8, catatan: 'Ketik 5 karakter dari layar siswa.' }); if (!k) break;
        const r = B.bacaKode(k); if (r.error) { await UI.info('Kode ditolak', '<p class="tengah" style="font-size:1.2rem">' + esc(r.error) + '</p>', 'Coba lagi'); continue; }
        const n = B.nilai(r.idx, r.jawab); const h = hasilLokal(); h[r.idx] = n.benar; LSset('hasil', h); if (net === 'online') await ga('g-kode', { kode: k });
        const lagi = await UI.dialog({ judul: 'Kode diterima', ikon: ik('centang', 'besar'), isi: '<div class="tengah"><div style="font-family:var(--tampil);font-size:2rem;font-weight:700">' + esc(B.nama(r.idx)) + '</div><p style="font-size:1.5rem">Skor <b>' + n.benar + '</b> dari 5</p></div>', tombol: [{ t: 'Selesai', nilai: false, kelas: 'sekunder' }, { t: 'Kode berikutnya', nilai: true }] }); render(); if (!lagi) break;
      }
      render();
    }
    render();
  }

  async function mintaPin(salah) {
    const v = await UI.papanKetik({ judul: 'PIN guru', ikon: ik('kunci', 'besar'), panjang: 4, alfabet: '0123456789', kolom: 5, sembunyi: true, otomatis: true, catatan: salah ? 'PIN salah. Coba lagi.' : 'Masukkan PIN guru (4 angka).' });
    if (v == null) return mintaPin(false); pin = v; const r = await ga('g-status'); if (r._s === 401) return mintaPin(true); if (r.ok) { net = 'online'; data = r; } else net = 'offline'; gambarAtas(); ke(tab);
  }
  UI.pasangPutar(); gambarAtas(); bawah.style.display = 'none';
  (async () => { const c = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ a: 'cek' }) }).then((r) => r.json()).catch(() => ({})); if (c.ok && c.penyimpanan) { net = 'online'; await mintaPin(false); } else { net = 'offline'; gambarAtas(); ke('penjelasan'); } })();
  window.gfGuru = { ke, ga: () => ga };
})();
