/* Catatan belajar per jenis fungsi: lembar A4 potret yang rapi (kop, identitas tim, isi dua kolom, soal, ringkasan, kaki halaman). Bisa dilihat di layar dan diunduh lewat cetak/PDF. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, DEK = root.SidangDek, NAMA = B.NAMA_FAM, JENIS = B.JENIS;
  const tgl = () => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const sg = (x) => String(x).replace('-', '−');
  const bag = (no, judul, ...isi) => el('section', { kelas: 'cet-bag' }, el('h2', null, el('i', null, String(no)), judul), ...isi);
  const stat = (svg) => { const w = el('div', { kelas: 'cet-grafik' }, svg); return w; };
  function bangun(g, info) {
    info = info || {}; const f = JENIS[g], d = GF.K[f], kel = info.anggota || [], pr = info.peran || {}, idxA = info.idxAnggota || [], q1 = B.soalPres(g, 1), q2 = B.soalPres(g, 2);
    const sheet = el('div', { kelas: 'cet fx-' + f });
    /* kop */
    sheet.append(el('header', { kelas: 'cet-kop' }, el('div', { kelas: 'cet-kop-a' }, el('span', { html: UI.ubin(f) }), el('div', null, el('small', null, 'CATATAN BELAJAR'), el('h1', null, 'Fungsi ' + NAMA[f]), el('div', { kelas: 'cet-sub' }, 'Matematika Tingkat Lanjut · Kelas XI-G Soshum'))), el('div', { kelas: 'cet-kop-b' }, el('b', null, 'SMA YPVDP Bontang'), el('span', null, 'Pertemuan 2 · Sidang Presentasi'))));
    sheet.append(el('table', { kelas: 'cet-id' }, el('tr', null, el('th', null, 'Kelompok'), el('td', null, 'Kelompok ' + (g + 1) + ' · ' + NAMA[f]), el('th', null, 'Tanggal'), el('td', null, tgl())), el('tr', null, el('th', null, 'Anggota'), el('td', { colspan: 3 }, kel.length ? kel.map((n, i) => n + (pr[idxA[i]] ? ' (' + DEK.PERAN[pr[idxA[i]]].nama + ')' : '')).join(' · ') : '–')), el('tr', null, el('th', null, 'Materi'), el('td', { colspan: 3 }, 'Grafik fungsi ' + NAMA[f].toLowerCase() + ': bentuk umum, grafik, ciri, contoh sehari-hari, dari grafik ke fungsi, dan soal latihan'))));
    /* 1 kenalan */
    sheet.append(bag(1, 'Mengenal fungsi ' + NAMA[f].toLowerCase(), el('div', { kelas: 'cet-dua' }, el('div', null, el('p', null, el('b', null, 'Nama lain: '), d.alias.join(', ') + '.'), el('div', { kelas: 'cet-rumus', html: d.umum }), el('p', { kelas: 'cet-kecil' }, 'Contoh: ', el('span', { html: d.varian[0].rumus })), el('ul', null, DEK.ARTI[f].map((x) => el('li', { html: x })))), stat(GF.statis(d.varian[0], 'var(--t)', 4).svg))));
    /* 2 bentuk grafik */
    sheet.append(bag(2, 'Bentuk grafik', el('div', { kelas: 'cet-grid' + (d.varian.length > 2 ? ' g3' : '') }, d.varian.slice(0, 4).map((v) => el('figure', null, stat(GF.statis(v, 'var(--t)', 4).svg), el('figcaption', { html: esc(v.nama) + ' · <span class="mat">' + v.rumus + '</span>' }))))));
    /* 3 ciri */
    sheet.append(bag(3, 'Ciri dan perilaku grafik', el('ul', null, d.ciri.map((x) => el('li', null, x))), el('div', { kelas: 'cet-kotak' }, el('b', null, 'Domain dan range. '), DEK.DR[f])));
    /* 4 kehidupan */
    sheet.append(bag(4, 'Contoh dalam kehidupan sehari-hari', el('ul', null, d.konteks.map((x) => el('li', null, x)))));
    /* 5 dari grafik ke fungsi */
    const m1 = DEK.mesin(DEK.contoh(f, 0), { statis: true }), m2 = DEK.mesin(DEK.contoh(f, 1), { statis: true });
    sheet.append(bag(5, 'Dari grafik ke fungsi f(x)', el('ol', { kelas: 'cet-cara' }, ['Baca titik-titik penting pada grafik (titik potong sumbu, puncak, atau titik yang jelas).', 'Masukkan nilai x dan y titik itu ke bentuk umum.', 'Selesaikan persamaan untuk mencari huruf yang belum diketahui.', 'Uji hasilnya dengan satu titik lain pada grafik.'].map((t) => el('li', null, t))), el('div', { kelas: 'cet-contoh' }, el('h3', null, 'Contoh 1'), m1), el('div', { kelas: 'cet-contoh' }, el('h3', null, 'Contoh 2'), m2)));
    /* 6 soal */
    const soal = (no, q) => el('div', { kelas: 'cet-soal' }, el('h3', null, 'Soal ' + no + (no === 1 ? ' · hitungan' : ' · dari grafik ke fungsi')), q.grafik ? stat(DEK.soalGrafik(q.grafik)) : null, el('div', { html: q.tanya }), el('div', { kelas: 'cet-kunci' }, el('b', null, 'Jawaban: ' + sg(q.kunci)), el('div', null, q.jelas)));
    sheet.append(bag(6, 'Latihan soal dan pembahasan', soal(1, q1), soal(2, q2)));
    /* 7 ringkasan */
    sheet.append(bag(7, 'Ringkasan', el('ul', null, el('li', { html: 'Bentuk umum: ' + d.umum }), el('li', null, d.ciri[0]), el('li', null, 'Mencari fungsi dari grafik: baca titik → masukkan → selesaikan → uji.')), el('div', { kelas: 'cet-catat' }, el('b', null, 'Catatanku'), el('div', { kelas: 'garis' }), el('div', { kelas: 'garis' }), el('div', { kelas: 'garis' }), el('div', { kelas: 'garis' }))));
    sheet.append(el('footer', { kelas: 'cet-kaki' }, el('span', null, 'Catatan Belajar · Fungsi ' + NAMA[f] + ' · Kelompok ' + (g + 1)), el('span', null, 'Grafik Fungsi · SMA YPVDP Bontang'), el('span', null, tgl())));
    return sheet;
  }
  /* tampilan di layar (pratinjau) dengan tombol unduh */
  function lihat(g, info) {
    const ov = el('div', { kelas: 'cet-ov' }), kotak = el('div', { kelas: 'cet-ov-k' }), sheet = bangun(g, info), wrap = el('div', { kelas: 'cet-skala' }, sheet);
    const skala = () => { const z = Math.min(1, (kotak.clientWidth - 24) / 794); wrap.style.zoom = String(Math.max(.4, z)); };
    const tutup = () => { ov.classList.add('menutup'); setTimeout(() => ov.remove(), 240); };
    ov.append(el('div', { kelas: 'cet-ov-h' }, el('b', null, 'Catatan · Fungsi ' + NAMA[JENIS[g]]), el('div', { kelas: 'baris', gaya: 'gap:.5rem' }, el('button', { kelas: 'btn hijau pesta', type: 'button', html: ik('kirim', 'kecil') + 'Unduh PDF', onclick: () => cetak(g, info) }), el('button', { kelas: 'btn sekunder', type: 'button', onclick: tutup }, 'Tutup'))), kotak); kotak.append(wrap); document.body.append(ov); skala(); setTimeout(skala, 60);
  }
  /* unduh: dialog cetak peramban, pilih "Simpan sebagai PDF" */
  function cetak(g, info) {
    const host = el('div', { kelas: 'sd-cetak' }); host.append(bangun(g, info)); document.body.append(host); document.body.classList.add('mencetak');
    const bersih = () => { host.remove(); document.body.classList.remove('mencetak'); window.removeEventListener('afterprint', bersih); }; window.addEventListener('afterprint', bersih); setTimeout(() => window.print(), 350); setTimeout(() => { if (host.isConnected) bersih(); }, 180000);
  }
  root.SidangCatatan = { bangun, lihat, cetak };
})(window);
