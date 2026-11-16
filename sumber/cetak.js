/* Cetak daftar kelompok: lembar A4 potret yang rapi, disimpan sebagai PDF lewat dialog cetak. */
(function (root) {
  'use strict';
  const { el, ik, esc } = UI, B = BS, NAMA = UI.NAMA;
  const HEX = { poli: '#9B5DE5', eksp: '#FF8A1F', log: '#14B8A6', trig: '#2EA7F2', rasional: '#F15BB5', akar: '#7BC043', mutlak: '#F5B700', tangga: '#EF5B4C', sepotong: '#4F5BD5' };
  const MUDA = { poli: '#F0E8FC', eksp: '#FFEFD9', log: '#DDF8F4', trig: '#E1F3FE', rasional: '#FDE6F3', akar: '#EAF7DC', mutlak: '#FFF3CC', tangga: '#FFE5E1', sepotong: '#E6E8FB' };
  const WARNA = ['#6D35E8', '#2EA7F2', '#FF8A1F', '#14B8A6', '#F15BB5', '#4F5BD5', '#7BC043', '#EF5B4C', '#F5B700'];
  const bersih = (n) => String(n).replace(/\s*\(.*\)\s*$/, '');
  const inisial = (n) => { const k = bersih(n).split(/\s+/).filter((x) => /^[A-Za-z]/.test(x)); return k.length ? (k[0][0] + (k.length > 1 ? k[k.length - 1][0] : '')).toUpperCase() : '?'; };

  function kartuKelompok(g, gi) {
    const n = g.length, w = WARNA[gi % WARNA.length], pasangan = {};
    g.forEach((s, pos) => { const bp = B.bagianPasangan(pos, n); (pasangan[bp.pasangan] = pasangan[bp.pasangan] || { huruf: bp.huruf, fam: bp.keluarga.length ? bp.keluarga : B.SET[bp.pasangan % 3], anggota: [] }).anggota.push(s); });
    const baris = Object.keys(pasangan).sort().map((k) => { const p = pasangan[k]; return '<div class="kk-pas"><div class="kk-pk"><span class="kk-huruf" style="background:' + w + '">' + p.huruf + '</span><div class="kk-nm">' + p.anggota.map((s) => '<div><span class="kk-av" style="background:' + w + '">' + esc(inisial(s.nama)) + '</span>' + esc(bersih(s.nama)) + '</div>').join('') + '</div></div><div class="kk-fam">' + p.fam.map((f) => '<span style="background:' + MUDA[f] + ';color:#1E1B4B;border-color:' + HEX[f] + '">' + NAMA[f] + '</span>').join('') + '</div></div>'; }).join('');
    return '<div class="kk" style="--w:' + w + '"><div class="kk-kep"><span class="kk-no">' + (gi + 1) + '</span><b>Kelompok ' + (gi + 1) + '</b><em>' + n + ' murid</em></div>' + baris + '</div>';
  }

  const CSS = `
#cetak-kel{position:fixed;inset:0;z-index:700;background:#CFCBE6;overflow:auto}
.ck-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:.8rem;padding:.6rem 1.2rem;background:#fff;border-bottom:1px solid var(--garis);box-shadow:var(--bayang)}.ck-bar b{font-family:var(--tampil);font-size:1.2rem}.ck-bar .ruang{flex:1}.ck-bar .muted{font-size:.85rem}
.ck-lembar{display:flex;flex-direction:column;align-items:center;gap:1.2rem;padding:1.4rem 0 3rem}
.kh{width:210mm;height:297mm;box-sizing:border-box;background:#fff;position:relative;overflow:hidden;padding:12mm 13mm;box-shadow:0 .5rem 2rem rgba(30,27,75,.25);color:#1E1B4B;font-family:Instrument,'Segoe UI',sans-serif;font-size:9.5pt;line-height:1.35;display:flex;flex-direction:column;flex:none}
.kh *{box-sizing:border-box}
.kh-kop{border-radius:5mm;padding:7mm 8mm;background:linear-gradient(135deg,#3E15A8,#6D35E8 60%,#9B5DE5);color:#fff;position:relative;overflow:hidden;flex:none}
.kh-kop svg{position:absolute;right:-6mm;top:-4mm;width:70mm;height:36mm;opacity:.5}
.kh-eye{font-size:8pt;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#FFE7A3}.kh-kop h1{font-family:Bricolage,sans-serif;font-size:25pt;line-height:1;margin:2mm 0 1mm}.kh-kop h1 b{background:#FFC233;color:#1E1B4B;padding:0 2.5mm;border-radius:2mm;display:inline-block;transform:rotate(-2deg)}.kh-sub{font-size:9.5pt;color:#E4D9FC;position:relative}
.kh-meta{display:flex;gap:2.5mm;margin-top:3mm;position:relative}.kh-meta span{background:rgba(255,255,255,.18);border:.3mm solid rgba(255,255,255,.35);border-radius:99px;padding:.6mm 3mm;font-size:8pt;font-weight:700}
.kh-grid{flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:1fr;gap:4mm;margin-top:5mm}
.kk{border:.5mm solid var(--w);border-radius:4.5mm;overflow:hidden;display:flex;flex-direction:column;background:#fff}
.kk-kep{display:flex;align-items:center;gap:2.5mm;background:var(--w);color:#fff;padding:2mm 3.5mm}.kk-kep b{font-family:Bricolage,sans-serif;font-size:13pt;flex:1}.kk-kep em{font-style:normal;font-size:8pt;font-weight:700;opacity:.95}.kk-no{width:7mm;height:7mm;border-radius:50%;background:#fff;color:#1E1B4B;display:grid;place-items:center;font-family:Bricolage,sans-serif;font-weight:700;font-size:11pt}
.kk-pas{padding:2.2mm 3.5mm;border-bottom:.25mm dashed #D3CFEA;flex:1;display:flex;flex-direction:column;justify-content:center;gap:1.4mm}.kk-pas:last-child{border-bottom:0}
.kk-pk{display:flex;gap:2.5mm;align-items:center}.kk-huruf{width:6mm;height:6mm;border-radius:1.6mm;color:#fff;display:grid;place-items:center;font-family:Bricolage,sans-serif;font-weight:700;font-size:9pt;flex:none}.kk-nm{flex:1;display:grid;grid-template-columns:1fr;gap:.8mm;font-weight:700;font-size:9.8pt}.kk-av{display:inline-grid;place-items:center;width:5.2mm;height:5.2mm;border-radius:50%;color:#fff;font-size:6.5pt;margin-right:1.6mm;vertical-align:middle}
.kk-fam{display:flex;flex-wrap:wrap;gap:1.2mm;margin-left:8.5mm}.kk-fam span{border:.3mm solid;border-radius:99px;padding:.2mm 2.2mm;font-size:7.6pt;font-weight:700}
.kh-kaki{flex:none;display:flex;justify-content:space-between;font-size:7.8pt;color:#6B6894;border-top:.3mm solid #E6E4F4;padding-top:2mm;margin-top:4mm}
@page{size:A4 portrait;margin:0}
@media print{html,body{background:#fff!important;height:auto!important;overflow:visible!important}body>*:not(#cetak-kel){display:none!important}#cetak-kel{position:static!important;overflow:visible!important;background:#fff!important}.ck-bar{display:none!important}.ck-lembar{display:block;padding:0}.kh{box-shadow:none!important;margin:0;page-break-after:always;break-after:page}.kh:last-child{page-break-after:auto;break-after:auto}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
`;

  function kelompok(kel, o) {
    o = o || {}; const lama = document.getElementById('cetak-kel'); if (lama) lama.remove();
    if (!document.getElementById('cetak-kel-css')) { const st = document.createElement('style'); st.id = 'cetak-kel-css'; st.textContent = CSS; document.head.append(st); }
    const tgl = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), total = kel.reduce((a, g) => a + g.length, 0), kelas = o.kelas || 'XI-F Soshum', judulLama = document.title;
    const per = 4, halaman = []; for (let i = 0; i < kel.length; i += per) halaman.push(kel.slice(i, i + per));
    const hias = '<svg viewBox="0 0 300 150" fill="none" stroke-linecap="round" stroke-width="5"><path d="M0 120C60 120 70 20 130 20S200 120 260 120 290 40 300 30" stroke="#2EA7F2"/><path d="M0 100L60 40 120 100 180 40 240 100 300 50" stroke="#FFC233"/></svg>';
    const html = halaman.map((hk, hi) => '<section class="kh"><div class="kh-kop">' + hias + '<div class="kh-eye">Matematika Tingkat Lanjut · ' + esc(kelas) + '</div><h1>Kelompok <b>Belajar</b></h1><div class="kh-sub">' + (o.label ? esc(o.label) + ' · ' : '') + tgl + '</div><div class="kh-meta"><span>' + kel.length + ' kelompok</span><span>' + total + ' murid</span><span>Kelompok heterogen</span><span>' + (halaman.length > 1 ? 'Halaman ' + (hi + 1) + ' dari ' + halaman.length : 'Pasangan pakar A · B · C') + '</span></div></div><div class="kh-grid">' + hk.map((g, k) => kartuKelompok(g, hi * per + k)).join('') + '</div><div class="kh-kaki"><span>SMA YPVDP Bontang · Aplikasi Grafik Fungsi</span><span>Tiap pasangan menjadi pakar untuk jenis grafik yang tertera</span></div></section>').join('');
    const w = el('div', { id: 'cetak-kel' }), tutup = () => { w.remove(); document.title = judulLama; };
    const cetak = () => { document.title = 'Kelompok ' + kelas; setTimeout(() => { try { window.print(); } catch (e) { UI.toast('Peramban ini tidak mendukung cetak', 'awas'); } }, 50); };
    window.addEventListener('afterprint', () => { document.title = judulLama; }, { once: true });
    w.append(el('div', { kelas: 'ck-bar' }, el('b', null, 'Daftar kelompok'), el('span', { kelas: 'muted' }, 'Tekan “Simpan sebagai PDF”, lalu pilih “Save as PDF” sebagai printer.'), el('span', { kelas: 'ruang' }), el('button', { kelas: 'btn hijau', type: 'button', html: ik('kirim') + 'Simpan sebagai PDF', onclick: cetak }), el('button', { kelas: 'btn sekunder', type: 'button', html: ik('silang', 'kecil') + 'Tutup', onclick: tutup })));
    const l = el('div', { kelas: 'ck-lembar' }); l.innerHTML = html; w.append(l); document.body.append(w); return w;
  }
  root.Cetak = { kelompok };
})(window);
