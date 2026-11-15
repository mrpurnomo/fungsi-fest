/* Grafik Fungsi — aplikasi siswa (tablet, landscape). */
(function () {
  'use strict';
  const { el, ik, esc, tidur, anim } = UI, B = BS;
  const app = document.getElementById('app'), pg = document.getElementById('panggung'), atas = document.getElementById('atas'), bawah = document.getElementById('bawah');
  const LK = 'gf_', lsGet = (k, d) => { try { const v = localStorage.getItem(LK + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, lsSet = (k, v) => { try { localStorage.setItem(LK + k, JSON.stringify(v)); } catch (e) { /* abaikan */ } };
  let token = lsGet('token', null); if (!token) { token = Math.random().toString(36).slice(2) + Date.now().toString(36); lsSet('token', token); }
  let net = 'cek', idx = null, P = null, intro = null, tmr = null, ping = null;
  const warnaNama = ['poli', 'eksp', 'log', 'trig', 'rasional', 'akar', 'mutlak', 'tangga', 'sepotong'];
  const inisial = (n) => { const k = n.split(/\s+/); return (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase(); };

  /* ---------------------------------------------------------------- jaringan */
  async function api(a, data) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 6500);
    try { const r = await fetch('/api/app', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ a, token }, data || {})), signal: ctl.signal }); const j = await r.json().catch(() => ({})); j._s = r.status; return j; } catch (e) { return { gagal: true, _s: 0 }; } finally { clearTimeout(to); }
  }
  async function cekJaringan() { const r = await api('cek'); net = r.ok && r.penyimpanan ? 'online' : 'offline'; gambarAtas(); return net; }
  function gambarAtas() {
    atas.innerHTML = '';
    atas.append(el('span', { kelas: 'logo' }, 'Grafik ', el('b', null, 'Fungsi')), el('span', { kelas: 'ruang' }));
    if (idx !== null) atas.append(el('span', { kelas: 'chip', html: ik('siswa', 'kecil') + esc(B.nama(idx).split(' ')[0]) }));
    atas.append(el('span', { kelas: 'chip ' + (net === 'online' ? 'ok' : (net === 'cek' ? 'abu' : 'warn')), html: ik(net === 'online' ? 'wifi' : 'putus', 'kecil') + (net === 'online' ? 'Terhubung ke guru' : (net === 'cek' ? 'Memeriksa…' : 'Mode mandiri')), title: net === 'offline' ? 'Tidak terhubung ke guru. Hasil diserahkan lewat kode.' : '' }));
  }
  const kosongkanBawah = () => { bawah.innerHTML = ''; bawah.style.display = 'none'; };
  function layar(isi, kelas) { clearInterval(tmr); if (intro) { intro.stop(); intro = null; } pg.innerHTML = ''; const d = el('div', { kelas: 'layar ' + (kelas || '') }); d.append(isi); pg.append(d); return d; }
  const simpan = () => { if (idx !== null) lsSet('p' + idx, P); };
  const baruP = () => ({ tahap: 'intro', intro: 0, tes: { jawab: [null, null, null, null, null], mulai: 0, selesai: false, detik: 0 }, terkirim: false });
  function konfeti(x, y, n) { for (let i = 0; i < (n || 40); i++) { const c = el('div', { kelas: 'konfeti', gaya: 'left:' + x + 'px;top:' + y + 'px;background:' + ['#FFC233', '#6D35E8', '#12B886', '#F15BB5', '#2EA7F2', '#FF8A1F'][i % 6] }); document.body.append(c); const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 260; anim(c, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 }, { transform: 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d + 160) + 'px) rotate(' + Math.random() * 720 + 'deg)', opacity: 0 }], { duration: 1200 + Math.random() * 900, easing: 'cubic-bezier(.2,.7,.3,1)' }).then(() => c.remove()); } }

  /* ---------------------------------------------------------------- 1. selamat datang */
  function sWelcome() {
    kosongkanBawah(); idx = null; gambarAtas();
    const w = el('div', { kelas: 'welcome' });
    w.innerHTML = '<div class="bg-kurva" aria-hidden="true"></div><div class="isi-welcome"><div class="eyebrow" style="justify-content:center">Matematika Tingkat Lanjut · SMA YPVDP Bontang</div><h1 class="judul-besar">Grafik <span class="hl">Fungsi</span></h1><p class="sub">Belajar menghitung, menggambar, dan mengenal bermacam-macam grafik fungsi.</p></div>';
    const bg = w.querySelector('.bg-kurva'); bg.innerHTML = '<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke-linecap="round" stroke-width="5"><path d="M20 340C140 340 150 60 270 60S400 340 520 340 640 60 780 60" stroke="#2EA7F2" opacity=".35"/><path d="M0 300L180 120 340 300 500 120 660 300 800 150" stroke="#F5B700" opacity=".35"/><path d="M0 380C200 370 380 330 540 190S740 20 800 10" stroke="#FF8A1F" opacity=".35"/><path d="M60 40V380M60 210H800" stroke="#9B5DE5" opacity=".18" stroke-dasharray="6 10"/></g></svg>';
    const gl = el('div', { kelas: 'garland-welcome' }); w.prepend(gl); setTimeout(() => UI.untaian(gl), 30);
    w.querySelector('.isi-welcome').append(el('button', { kelas: 'btn besar denyut', type: 'button', html: 'Masuk' + ik('panah'), onclick: async () => { UI.layarPenuh(); sKelas(); } }), el('div', { kelas: 'muted kecil', gaya: 'margin-top:1.2rem' }, 'Pastikan tabletmu dalam posisi mendatar (landscape).'));
    layar(w, 'tengah-layar');
  }

  /* ---------------------------------------------------------------- 2. pilih kelas */
  function sKelas() {
    kosongkanBawah(); gambarAtas();
    const w = el('div', { kelas: 'tengah-isi' }); w.append(el('div', { kelas: 'eyebrow' }, 'Langkah 1 dari 2'), el('h2', null, 'Pilih kelasmu'));
    const k = el('button', { kelas: 'kartu-kelas', type: 'button', onclick: sNama, html: '<span class="ubin fx-poli">' + UI.glif('trig') + '</span><div><div class="kelas-nama">XI-F Soshum</div><div class="muted">' + B.DAFTAR.length + ' murid · Matematika Tingkat Lanjut</div></div>' + ik('panah', 'besar') });
    w.append(k, el('button', { kelas: 'btn sekunder', type: 'button', gaya: 'margin-top:1.4rem', html: ik('kembali') + 'Kembali', onclick: sWelcome })); layar(w, 'tengah-layar');
  }

  /* ---------------------------------------------------------------- 3. pilih nama */
  async function sNama() {
    kosongkanBawah(); gambarAtas();
    const w = el('div', { kelas: 'nama-wrap' }); w.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.4rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Langkah 2 dari 2'), el('h2', { gaya: 'margin:0' }, 'Pilih namamu')), el('button', { kelas: 'btn sekunder kecil', type: 'button', html: ik('kembali', 'kecil') + 'Kembali', onclick: sKelas })));
    const grid = el('div', { kelas: 'grid-nama' }); w.append(grid); layar(w);
    let st = { diklaim: [], selesai: [] }; const r = await (net === 'cek' ? cekJaringan().then(() => api('status')) : api('status')); if (r && r.ok) st = r; else if (net !== 'offline') { net = 'offline'; gambarAtas(); }
    B.DAFTAR.forEach((_, i) => {
      const nm = B.nama(i), sudah = st.diklaim.includes(i), tamat = st.selesai.includes(i);
      const t = el('button', { kelas: 'tile-nama fx-' + warnaNama[i % 9] + (sudah ? ' dipakai' : ''), type: 'button', onclick: () => pilihNama(i), html: '<span class="av">' + inisial(nm) + '</span><span class="nm">' + esc(nm) + '</span>' + (sudah ? '<span class="lencana-n">' + (tamat ? ik('centang', 'kecil') + 'selesai' : ik('kunci', 'kecil') + 'dipakai') + '</span>' : '') }); grid.append(t); anim(t, [{ opacity: 0, transform: 'translateY(.8rem) scale(.9)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 25 });
    });
  }
  async function pilihNama(i) {
    const nm = B.nama(i);
    const ya = await UI.dialog({ judul: 'Apakah benar ini namamu?', ikon: ik('siswa', 'besar'), isi: '<div class="tengah" style="padding:.6rem 0"><div style="font-family:var(--tampil);font-size:2.2rem;font-weight:700;line-height:1.15">' + esc(nm) + '</div><div class="muted" style="margin-top:.5rem">XI-F Soshum</div></div>', tombol: [{ t: 'Bukan, kembali', nilai: false, kelas: 'sekunder' }, { t: 'Ya, benar', nilai: true, kelas: 'hijau', ikon: 'centang' }] });
    if (!ya) return;
    const r = await api('klaim', { idx: i });
    if (r._s === 409) { await UI.info('Nama ini sedang dipakai', '<div class="tengah"><p>Nama <b>' + esc(nm) + '</b> sudah dipakai di perangkat lain.</p><p class="muted">Kalau itu memang kamu (misalnya tablet berganti), minta <b>guru</b> untuk mengatur ulang nama ini.</p></div>', 'Mengerti', { ikon: ik('kunci', 'besar') }); return sNama(); }
    if (r.gagal || r._s >= 500 || r._s === 503) { net = 'offline'; } else if (r.ok) { net = 'online'; }
    idx = i; lsSet('aktif', i); P = lsGet('p' + i, null) || baruP();
    if (r.hasil && r.hasil.jawab) { P.tes.jawab = r.hasil.jawab; P.tes.selesai = true; P.tes.detik = r.hasil.detik || 0; P.terkirim = true; if (['intro', 'tes'].includes(P.tahap)) P.tahap = 'hasil'; }
    simpan(); gambarAtas(); mulaiPing(); lanjutDari();
  }
  function mulaiPing() { clearInterval(ping); if (net !== 'online') return; ping = setInterval(() => api('ping', { idx, tahap: P && P.tahap }), 20000); }
  function lanjutDari() { if (P.tahap === 'intro') return sIntro(); if (P.tahap === 'tes') return sTes(); if (P.tahap === 'hasil') return sHasil(); if (P.tahap === 'kelompok') return sKelompok(); return sLanjut(); }

  /* ---------------------------------------------------------------- 4. pengantar */
  async function sIntro() {
    kosongkanBawah(); gambarAtas(); const host = el('div', { gaya: 'position:absolute;inset:0' });
    if (P.intro === 0) { layar(host); await UI.dialog({ judul: 'Tunggu aba-aba dari guru', ikon: ik('jam', 'besar'), isi: '<div class="tengah"><p style="font-size:1.4rem">Jangan klik <b>Mulai</b> dulu.</p><p class="muted">Tunggu sampai gurumu mengatakan kita mulai bersama-sama.</p></div>', tombol: [{ t: 'Mulai pengantar', nilai: true, ikon: 'main' }] }); }
    else layar(host);
    intro = Intro.mount(host, { mulai: P.intro, labelAkhir: 'Mulai tes awal', saatLangkah: (i) => { P.intro = i; simpan(); }, saatSelesai: () => { P.tahap = 'tes'; P.intro = 0; simpan(); sTes(); } });
  }

  /* ---------------------------------------------------------------- 5. tes awal */
  const HURUF = 'ABCDE';
  async function sTes() {
    kosongkanBawah(); gambarAtas(); const soal = B.soalSiswa(idx); let aktif = 0;
    const w = el('div', { kelas: 'tes-wrap' }); layar(w);
    if (!P.tes.mulai) {
      await UI.dialog({ judul: 'Tes awal: 5 soal', ikon: ik('ujian', 'besar'), isi: '<ul class="aturan"><li>Ada <b>5 soal pilihan ganda</b> tentang fungsi dasar. Waktunya <b>10 menit</b>.</li><li>Soal tiap siswa <b>berbeda</b>, tetapi tingkat kesulitannya sama.</li><li>Boleh mengerjakan dari nomor mana saja.</li><li>Semua soal <b>harus dijawab</b> sebelum bisa dikumpulkan.</li><li>Kalau waktu habis, jawabanmu <b>dikumpulkan otomatis</b>.</li><li>Ini bukan nilai rapor. Tujuannya mengetahui titik awalmu.</li></ul>', tombol: [{ t: 'Mulai tes', nilai: true, ikon: 'main', kelas: 'hijau' }] });
      P.tes.mulai = Date.now(); simpan();
    }
    const kiri = el('div', { kelas: 'soal-kartu kartu' }), kanan = el('div', { kelas: 'tes-samping' }); w.append(kiri, kanan);
    const timer = el('div', { kelas: 'timer' }), grid = el('div', { kelas: 'nomor-grid' }), btnKirim = el('button', { kelas: 'btn hijau besar', type: 'button', html: ik('kirim') + 'Kumpulkan', onclick: () => kumpulkan(false) }), info = el('div', { kelas: 'kecil tengah muted' });
    kanan.append(timer, el('div', { kelas: 'eyebrow', gaya: 'margin-top:.4rem' }, 'Nomor soal'), grid, info, btnKirim);
    const jml = () => P.tes.jawab.filter((v) => v != null).length;
    function gambar() {
      const q = soal[aktif]; kiri.innerHTML = '';
      kiri.append(el('div', { kelas: 'eyebrow' }, 'Soal ' + (aktif + 1) + ' dari 5'), el('div', { kelas: 'teks-soal', html: q.tanya }));
      const ops = el('div', { kelas: 'opsi-wrap' }); q.opsi.forEach((o, k) => ops.append(el('button', { kelas: 'opsi' + (P.tes.jawab[aktif] === k ? ' pilih' : ''), type: 'button', html: '<span class="huruf">' + HURUF[k] + '</span><span>' + esc(o) + '</span>', onclick: () => { P.tes.jawab[aktif] = k; simpan(); gambar(); } }))); kiri.append(ops);
      kiri.append(el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-top:auto' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kembali') + 'Sebelumnya', disabled: aktif === 0, onclick: () => { aktif--; gambar(); } }), el('button', { kelas: 'btn sekunder', type: 'button', html: 'Berikutnya' + ik('panah'), disabled: aktif === 4, onclick: () => { aktif++; gambar(); } })));
      grid.innerHTML = ''; soal.forEach((_, i) => grid.append(el('button', { kelas: 'no' + (i === aktif ? ' aktif' : '') + (P.tes.jawab[i] != null ? ' isi' : ''), type: 'button', onclick: () => { aktif = i; gambar(); } }, i + 1)));
      const sisa = 5 - jml(); info.textContent = sisa ? sisa + ' soal belum dijawab' : 'Semua soal sudah dijawab'; btnKirim.disabled = sisa > 0; btnKirim.className = 'btn hijau besar' + (sisa ? ' mati' : ' denyut');
    }
    let selesaiOtomatis = false;
    function ketik() { const sisa = Math.max(0, B.DURASI - Math.floor((Date.now() - P.tes.mulai) / 1000)); timer.innerHTML = ik('jam') + '<b>' + String(Math.floor(sisa / 60)).padStart(2, '0') + ':' + String(sisa % 60).padStart(2, '0') + '</b>'; timer.classList.toggle('merah', sisa <= 60); if (sisa <= 0 && !selesaiOtomatis) { selesaiOtomatis = true; clearInterval(tmr); kumpulkan(true); } }
    async function kumpulkan(paksa) {
      if (!paksa) { const sisa = 5 - jml(); const ya = await UI.konfirmasi('Kumpulkan jawaban?', '<div class="tengah"><p style="font-size:1.25rem">Semua soal sudah terjawab.</p><p class="muted">Setelah dikumpulkan, jawaban <b>tidak bisa diubah</b>.</p></div>', 'Ya, kumpulkan', 'Periksa lagi'); if (!ya) return; }
      else await UI.info('Waktu habis', '<div class="tengah"><p style="font-size:1.25rem">Jawabanmu dikumpulkan otomatis.</p></div>', 'Lihat hasil', { ikon: ik('jam', 'besar') });
      P.tes.selesai = true; P.tes.detik = Math.min(B.DURASI, Math.floor((Date.now() - P.tes.mulai) / 1000)); P.tahap = 'hasil'; simpan(); sHasil(true);
    }
    gambar(); ketik(); tmr = setInterval(ketik, 1000);
  }

  /* ---------------------------------------------------------------- 6. hasil + perayaan */
  async function sHasil(baru) {
    kosongkanBawah(); gambarAtas(); clearInterval(tmr); const n = B.nilai(idx, P.tes.jawab), soal = B.soalSiswa(idx);
    const w = el('div', { kelas: 'hasil-wrap' }); layar(w);
    const kiri = el('div', { kelas: 'kartu hasil-skor tengah' }), kanan = el('div', { kelas: 'hasil-kanan' }); w.append(kiri, kanan);
    const kel = 2 * Math.PI * 70, cincin = '<div class="cincin"><svg viewBox="0 0 168 168"><circle cx="84" cy="84" r="70" fill="none" stroke="#EEEBFA" stroke-width="16"/><circle id="arc" cx="84" cy="84" r="70" fill="none" stroke="var(--markisa)" stroke-width="16" stroke-linecap="round" stroke-dasharray="0 ' + kel.toFixed(1) + '"/></svg><div class="pusat"><b id="angka">0</b><span class="muted">dari 5</span></div></div>';
    kiri.innerHTML = '<div class="eyebrow" style="justify-content:center">Tes awal selesai</div><h2>' + (n.benar >= 4 ? 'Hebat!' : (n.benar >= 2 ? 'Bagus, terus semangat!' : 'Terima kasih sudah berusaha!')) + '</h2>' + cincin + '<div class="baris" style="justify-content:center;margin-top:.4rem"><span class="chip ok" style="font-size:1.05rem">' + ik('centang', 'kecil') + n.benar + ' soal benar</span><span class="chip bad" style="font-size:1.05rem">' + ik('silang', 'kecil') + n.salah + ' soal salah</span></div><p class="muted kecil" style="margin-top:.8rem">Ini bukan nilai rapor. Hasilnya dipakai guru untuk menyusun kelompok belajar yang seimbang.</p>';
    kanan.append(el('div', { kelas: 'eyebrow' }, 'Ketuk nomor untuk melihat pembahasan'));
    const row = el('div', { kelas: 'nomor-hasil' }); n.hasil.forEach((h, i) => row.append(el('button', { kelas: 'no-h ' + (h.benar ? 'benar' : 'salah'), type: 'button', html: '<b>' + h.no + '</b>' + ik(h.benar ? 'centang' : 'silang', 'kecil') + '<span>' + (h.benar ? 'Benar' : 'Salah') + '</span>', onclick: () => pembahasan(i, soal, n) }))); kanan.append(row);
    const aksi = el('div', { kelas: 'kolom', gaya: 'margin-top:auto' }); kanan.append(aksi);
    const status = el('div', { kelas: 'umpan' }); aksi.append(status);
    const bKirim = el('button', { kelas: 'btn besar', type: 'button', html: ik('kirim') + 'Kirim hasil ke guru' }), bKode = el('button', { kelas: 'btn sekunder', type: 'button', html: ik('salin') + 'Tampilkan kode hasil untuk guru', onclick: () => tampilKode() }), bKel = el('button', { kelas: 'btn sorot besar', type: 'button', html: ik('kelompok') + 'Lihat kelompok', onclick: () => { P.tahap = 'kelompok'; simpan(); sKelompok(); } });
    aksi.append(bKirim, bKode, bKel);
    const perbarui = () => { if (P.terkirim) { status.className = 'umpan ok'; status.innerHTML = ik('centang') + '<span>Hasilmu sudah diterima guru.</span>'; bKirim.style.display = 'none'; bKode.style.display = 'none'; bKel.className = 'btn sorot besar denyut'; } else { status.className = 'umpan'; status.innerHTML = net === 'online' ? ik('info') + '<span>Kirim hasilmu ke guru. Jika gagal, pakai kode hasil.</span>' : ik('awas') + '<span>Tidak terhubung ke guru. Gunakan kode hasil (5 karakter) dan serahkan ke guru.</span>'; bKirim.className = 'btn besar' + (net === 'online' ? '' : ' mati'); bKode.className = 'btn sekunder' + (net === 'online' ? '' : ' denyut'); bKel.className = 'btn sorot besar mati'; } };
    bKirim.onclick = async () => { bKirim.classList.add('mati'); status.innerHTML = ik('jam') + '<span>Mengirim…</span>'; const r = await api('hasil', { idx, jawab: P.tes.jawab, detik: P.tes.detik }); if (r.ok) { P.terkirim = true; net = 'online'; simpan(); gambarAtas(); perbarui(); konfeti(innerWidth / 2, innerHeight / 3, 30); } else { if (r._s === 403 || r.error === 'tidak-dikenali') { await UI.info('Nama belum terdaftar di server', '<p>Minta guru mengatur ulang, atau serahkan <b>kode hasil</b>.</p>', 'Mengerti'); } else { net = 'offline'; gambarAtas(); UI.toast('Gagal terkirim. Pakai kode hasil.', 'awas'); } perbarui(); } };
    perbarui();
    if (baru) { setTimeout(() => konfeti(innerWidth / 2, innerHeight * .3, 80), 500); }
    const arc = document.getElementById('arc'), angka = document.getElementById('angka'); const t0 = performance.now(), dur = 1400, target = n.benar / 5 * kel;
    (function f(t) { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); if (!arc.isConnected) return; arc.setAttribute('stroke-dasharray', (target * e).toFixed(1) + ' ' + kel.toFixed(1)); angka.textContent = Math.round(n.benar * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }
  function pembahasan(i, soal, n) {
    const q = soal[i], h = n.hasil[i], mine = h.pilih;
    UI.dialog({ lebar: true, judul: 'Soal ' + (i + 1) + ' · ' + (h.benar ? 'Benar' : 'Salah'), ikon: ik(h.benar ? 'centang' : 'silang', 'besar'), tutupX: true, tutupLuar: true,
      isi: '<div class="teks-soal" style="font-size:1.35rem">' + q.tanya + '</div><div class="opsi-wrap" style="margin:.6rem 0">' + q.opsi.map((o, k) => '<div class="opsi ' + (k === q.kunci ? 'benar' : (k === mine ? 'salah' : '')) + '" style="cursor:default"><span class="huruf">' + HURUF[k] + '</span><span>' + esc(o) + '</span>' + (k === q.kunci ? '<span class="chip ok" style="margin-left:auto">jawaban benar</span>' : (k === mine ? '<span class="chip bad" style="margin-left:auto">jawabanmu</span>' : '')) + '</div>').join('') + '</div><div class="umpan ok" style="align-items:flex-start">' + ik('info') + '<span>' + esc(q.jelas) + '</span></div>', tombol: [{ t: 'Tutup', nilai: true }] });
  }
  function tampilKode() {
    const kode = B.buatKode(idx, P.tes.jawab);
    UI.dialog({ judul: 'Kode hasil untuk guru', ikon: ik('salin', 'besar'), isi: '<div class="tengah"><p>Berikan 5 karakter ini kepada gurumu:</p><div class="kode-besar kode">' + kode.split('').map((c) => '<span>' + c + '</span>').join('') + '</div><p class="muted kecil">Kode ini berisi namamu dan jawabanmu. Tulis persis seperti di layar.</p></div>', tombol: [{ t: 'Sudah saya serahkan', nilai: true, kelas: 'hijau' }] }).then(() => { UI.toast('Setelah itu tekan “Lihat kelompok”.', 'info'); const b = [...document.querySelectorAll('.btn')].find((x) => x.textContent.includes('Lihat kelompok')); if (b) b.classList.remove('mati'); });
  }

  /* ---------------------------------------------------------------- 7. kelompok */
  async function sKelompok() {
    kosongkanBawah(); gambarAtas(); const w = el('div', { kelas: 'kel-wrap' }); layar(w);
    const muat = async () => {
      w.innerHTML = '<div class="tengah-isi"><div class="spinner"></div><p class="muted">Menyusun kelompok…</p></div>';
      const r = await api('kelompok', { idx });
      if (r.ok && r.menunggu) { w.innerHTML = '<div class="tengah-isi"><span class="ubin fx-eksp" style="width:5rem;height:5rem">' + ik('jam') + '</span><h2>Guru belum membuka kelompok</h2><p class="muted">Tunggu sebentar, halaman ini akan memeriksa sendiri.</p></div>'; clearInterval(tmr); tmr = setTimeout(muat, 4000); return; }
      if (r.ok) { tampil(r.kelompok, r.saya); return; }
      if (r.error === 'belum-selesai') { w.innerHTML = '<div class="tengah-isi"><h2>Selesaikan tes dulu</h2></div>'; return; }
      w.innerHTML = '<div class="tengah-isi"><span class="ubin fx-tangga" style="width:5rem;height:5rem">' + ik('putus') + '</span><h2>Daftar kelompok ada di layar guru</h2><p class="muted" style="max-width:36rem">Tablet belum terhubung ke guru, jadi kelompok diumumkan lewat layar kelas. Lihat nama dan nomor kelompokmu di sana, lalu pindah ke mejanya.</p></div>'; const b = el('div', { kelas: 'baris', gaya: 'justify-content:center;margin-top:1rem' }, el('button', { kelas: 'btn sekunder', type: 'button', html: ik('ulang') + 'Coba terhubung lagi', onclick: muat }), el('button', { kelas: 'btn', type: 'button', html: 'Saya sudah tahu kelompokku' + ik('panah'), onclick: () => { P.tahap = 'lanjut'; simpan(); sLanjut(); } })); w.querySelector('.tengah-isi').append(b);
    };
    function tampil(kel, saya) {
      w.innerHTML = ''; const kepala = el('div', { kelas: 'baris', gaya: 'justify-content:space-between;margin-bottom:.6rem' }, el('div', null, el('div', { kelas: 'eyebrow' }, 'Kelompok belajar'), el('h2', { gaya: 'margin:0' }, 'Kamu di Kelompok ' + (saya + 1))), el('button', { kelas: 'btn', type: 'button', html: 'Saya sudah di meja kelompok' + ik('panah'), onclick: () => { P.tahap = 'lanjut'; simpan(); sLanjut(); } }));
      const grid = el('div', { kelas: 'grid-kel' }); w.append(kepala, el('div', { kelas: 'umpan ok', html: ik('info') + '<span>Pindahlah ke meja kelompokmu. Kelompok dibuat seimbang berdasarkan hasil tes awal.</span>' }), grid);
      kel.forEach((g, gi) => { const k = el('div', { kelas: 'kel-kartu' + (gi === saya ? ' saya' : ''), 'data-g': gi }); k.append(el('div', { kelas: 'kel-judul' }, 'Kelompok ' + (gi + 1), el('span', { kelas: 'chip abu' }, g.length + ' orang'))); g.forEach((s) => k.append(el('div', { kelas: 'kel-nama' + (s.idx === idx ? ' aku' : '') }, el('span', { kelas: 'av2 fx-' + warnaNama[s.idx % 9] }, inisial(s.nama)), el('span', null, s.nama + (s.idx === idx ? ' (kamu)' : ''))))); grid.append(k); anim(k, [{ opacity: 0, transform: 'translateY(1rem)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: gi * 120 }); });
      setTimeout(() => konfeti(innerWidth / 2, innerHeight * .25, 40), 600);
    }
    muat();
  }

  /* ---------------------------------------------------------------- 8. tahap berikutnya */
  function sLanjut() {
    kosongkanBawah(); gambarAtas(); const w = el('div', { kelas: 'tengah-isi' }); w.innerHTML = '<span class="ubin fx-trig" style="width:5.5rem;height:5.5rem">' + UI.glif('trig') + '</span><h2>Tahap berikutnya</h2><p class="muted" style="max-width:38rem;font-size:1.2rem">Tunggu arahan gurumu. Kegiatan berikutnya dilakukan bersama kelompok.</p>';
    w.append(el('button', { kelas: 'btn sekunder', type: 'button', html: ik('kelompok') + 'Lihat kelompok lagi', onclick: () => { P.tahap = 'kelompok'; simpan(); sKelompok(); } })); layar(w, 'tengah-layar');
  }

  /* ---------------------------------------------------------------- mulai */
  UI.pasangPutar(); gambarAtas(); sWelcome(); cekJaringan();
  window.gfDebug = { intro: () => intro, P: () => P, idx: () => idx, net: () => net, ke: { welcome: sWelcome, kelas: sKelas, nama: sNama, intro: sIntro, tes: sTes, hasil: sHasil, kelompok: sKelompok, lanjut: sLanjut }, pilih: (i) => { idx = i; P = lsGet('p' + i, null) || baruP(); return P; }, set: (i, p) => { idx = i; P = p; simpan(); } };
})();
