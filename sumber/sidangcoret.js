/* Coretan layar presentasi: pena, penghapus bebas, hapus per goresan, undo, redo, reset, warna, ukuran, dan penguncian jari (hanya stylus atau mouse). */
(function (root) {
  'use strict';
  const { el } = UI, WARNA = ['#1E1B4B', '#E5383B', '#2EA7F2', '#12B886', '#FF8A1F', '#9B5DE5'], TEBAL = [3, 6, 11];
  const ringkas = (list) => list.map((s) => ({ c: s.c, w: s.w, m: s.m, p: [].concat.apply([], s.p.map((q) => [Math.round(q[0] * 1000), Math.round(q[1] * 1000)])).filter((_, i, a) => i < 1200) }));
  const lebarkan = (list) => (list || []).map((s) => { const p = []; for (let i = 0; i + 1 < (s.p || []).length; i += 2) p.push([s.p[i] / 1000, s.p[i + 1] / 1000]); return { c: s.c, w: s.w, m: s.m, p }; });
  function gambarSemua(cv, list) {
    const ctx = cv.getContext('2d'), W = cv.width, Hh = cv.height, k = Hh / 600; ctx.clearRect(0, 0, W, Hh); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    list.forEach((s) => { if (!s.p.length) return; ctx.globalCompositeOperation = s.m === 'hapus' ? 'destination-out' : 'source-over'; ctx.strokeStyle = s.m === 'hapus' ? '#000' : s.c; ctx.lineWidth = s.w * k * (s.m === 'hapus' ? 3 : 1); ctx.beginPath(); ctx.moveTo(s.p[0][0] * W, s.p[0][1] * Hh); if (s.p.length === 1) ctx.lineTo(s.p[0][0] * W + 0.1, s.p[0][1] * Hh); for (let i = 1; i < s.p.length; i++) ctx.lineTo(s.p[i][0] * W, s.p[i][1] * Hh); ctx.stroke(); });
    ctx.globalCompositeOperation = 'source-over';
  }
  function ukur(cv, host) { const r = host.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1); const w = Math.max(10, Math.round(r.width * d)), h = Math.max(10, Math.round(r.height * d)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; return true; } return false; }

  /* lapisan interaktif untuk penyaji */
  function pasang(host, opsi) {
    opsi = opsi || {}; const cv = el('canvas', { kelas: 'sd-coret' }), bar = el('div', { kelas: 'sd-alat' }); bar.style.display = 'none'; host.append(cv, bar);
    const S = { aktif: false, alat: 'pena', warna: WARNA[0], tebal: 1, jari: false, data: {}, kunci: opsi.kunci || 'k', undo: [], redo: [] }; let kini = null;
    const list = () => (S.data[S.kunci] = S.data[S.kunci] || []);
    const redraw = () => { ukur(cv, host); gambarSemua(cv, list().concat(kini ? [kini] : [])); };
    const ubah = () => { if (opsi.saatUbah) opsi.saatUbah(S.kunci, list()); };
    const catat = (a) => { S.undo.push(a); S.redo = []; bar.dispatchEvent(new Event('perbarui')); };
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
    const dekat = (s, x, y) => { const r = cv.getBoundingClientRect(), tol = 14; for (let i = 0; i < s.p.length; i++) { const dx = (s.p[i][0] - x) * r.width, dy = (s.p[i][1] - y) * r.height; if (dx * dx + dy * dy < tol * tol) return true; if (i) { const ax = s.p[i - 1][0] * r.width, ay = s.p[i - 1][1] * r.height, bx = s.p[i][0] * r.width, by = s.p[i][1] * r.height, px = x * r.width, py = y * r.height, vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L)), qx = ax + t * vx - px, qy = ay + t * vy - py; if (qx * qx + qy * qy < tol * tol) return true; } } return false; };
    const hapusGoresan = (x, y) => { const L = list(); for (let i = L.length - 1; i >= 0; i--) if (L[i].m !== 'hapus' && dekat(L[i], x, y)) { const s = L.splice(i, 1)[0]; catat({ t: 'del', s, i }); redraw(); ubah(); return; } };
    let tarik = false;
    cv.addEventListener('pointerdown', (e) => { if (!S.aktif) return; if (e.pointerType === 'touch' && !S.jari) { e.preventDefault(); return; } e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } tarik = true; const [x, y] = pos(e); if (S.alat === 'goresan') { hapusGoresan(x, y); return; } kini = { c: S.warna, w: TEBAL[S.tebal], m: S.alat === 'hapus' ? 'hapus' : 'pena', p: [[x, y]] }; redraw(); });
    cv.addEventListener('pointermove', (e) => { if (!tarik || !S.aktif) return; if (e.pointerType === 'touch' && !S.jari) return; const [x, y] = pos(e); if (S.alat === 'goresan') { hapusGoresan(x, y); return; } if (kini) { kini.p.push([x, y]); redraw(); } });
    const selesai = () => { if (!tarik) return; tarik = false; if (kini && kini.p.length) { list().push(kini); catat({ t: 'add', s: kini }); ubah(); } kini = null; redraw(); };
    cv.addEventListener('pointerup', selesai); cv.addEventListener('pointercancel', selesai);
    const undo = () => { const a = S.undo.pop(); if (!a) return; const L = list(); if (a.t === 'add') { const i = L.indexOf(a.s); if (i >= 0) L.splice(i, 1); } else if (a.t === 'del') L.splice(Math.min(a.i, L.length), 0, a.s); else if (a.t === 'clear') a.l.forEach((s) => L.push(s)); S.redo.push(a); redraw(); ubah(); bar.dispatchEvent(new Event('perbarui')); };
    const redo = () => { const a = S.redo.pop(); if (!a) return; const L = list(); if (a.t === 'add') L.push(a.s); else if (a.t === 'del') { const i = L.indexOf(a.s); if (i >= 0) L.splice(i, 1); } else if (a.t === 'clear') L.splice(0, L.length); S.undo.push(a); redraw(); ubah(); bar.dispatchEvent(new Event('perbarui')); };
    const reset = () => { const L = list(); if (!L.length) return; const salin = L.splice(0, L.length); catat({ t: 'clear', l: salin }); redraw(); ubah(); };
    function bangun() {
      bar.innerHTML = ''; const b = (t, on, fn, tip, dis) => el('button', { type: 'button', kelas: on ? 'on' : '', title: tip || t, disabled: !!dis, onclick: fn }, t);
      bar.append(b('✎ Pena', S.alat === 'pena', () => { S.alat = 'pena'; bangun(); }), b('◌ Penghapus', S.alat === 'hapus', () => { S.alat = 'hapus'; bangun(); }, 'Penghapus bebas'), b('✕ Goresan', S.alat === 'goresan', () => { S.alat = 'goresan'; bangun(); }, 'Hapus per goresan: ketuk goresan'), el('span', { kelas: 'gap' }));
      WARNA.forEach((c) => bar.append(el('button', { type: 'button', kelas: 'sw' + (S.warna === c && S.alat === 'pena' ? ' on' : ''), gaya: 'background:' + c, 'aria-label': 'Warna', onclick: () => { S.warna = c; S.alat = 'pena'; bangun(); } })));
      bar.append(el('span', { kelas: 'gap' })); TEBAL.forEach((t, i) => bar.append(b(['S', 'M', 'L'][i], S.tebal === i, () => { S.tebal = i; bangun(); }, 'Ukuran ' + ['kecil', 'sedang', 'besar'][i])));
      bar.append(el('span', { kelas: 'gap' }), b('↶', false, undo, 'Undo', !S.undo.length), b('↷', false, redo, 'Redo', !S.redo.length), b('Reset', false, reset, 'Hapus semua coretan di slide ini', !list().length), el('span', { kelas: 'gap' }), b(S.jari ? 'Jari: boleh' : 'Jari: mati', S.jari, () => { S.jari = !S.jari; bangun(); }, 'Aktifkan atau matikan coretan dengan jari (bawaan: hanya stylus atau mouse)'), b('Selesai', false, () => aktifkan(false), 'Matikan mode coretan'));
    }
    bar.addEventListener('perbarui', bangun);
    function aktifkan(v) { S.aktif = v; cv.classList.toggle('aktif', v); bar.style.display = v ? '' : 'none'; if (v) { bangun(); redraw(); } if (opsi.saatToggle) opsi.saatToggle(v); }
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => redraw()) : null; if (ro) ro.observe(host);
    return { toggle: () => aktifkan(!S.aktif), aktif: () => S.aktif, aktifkan, setKunci: (k) => { if (k === S.kunci) return; S.kunci = k; S.undo = []; S.redo = []; redraw(); if (S.aktif) bangun(); }, redraw, ringkas: () => ringkas(list()), hancur: () => { if (ro) ro.disconnect(); cv.remove(); bar.remove(); } };
  }
  /* lapisan baca-saja untuk layar guru */
  function lihat(host) { const cv = el('canvas', { kelas: 'sd-coret' }); host.append(cv); let data = []; const redraw = () => { ukur(cv, host); gambarSemua(cv, data); }; const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(redraw) : null; if (ro) ro.observe(host); return { tampil: (s) => { data = lebarkan(s); redraw(); }, hancur: () => { if (ro) ro.disconnect(); cv.remove(); } }; }
  root.SidangCoret = { pasang, lihat, ringkas, lebarkan };
})(window);
