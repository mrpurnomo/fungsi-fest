/* Mesin grafik: bidang Kartesius SVG yang bisa dianimasikan + katalog sembilan keluarga fungsi. */
(function (root) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, attrs, ...anak) => { const e = document.createElementNS(NS, tag); for (const k in (attrs || {})) e.setAttribute(k, attrs[k]); anak.flat().forEach((a) => a != null && e.append(a.nodeType ? a : document.createTextNode(a))); return e; };
  const fmt = (n) => { const r = Math.round(n * 100) / 100; return String(r).replace('-', '−').replace('.', ','); };

  function sampel(f, a, b, n, lo, hi) {
    const out = []; let cur = [];
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n, y = f(x); if (!isFinite(y) || y < lo || y > hi) { if (cur.length > 1) out.push(cur); cur = []; continue; } cur.push([x, y]); }
    if (cur.length > 1) out.push(cur); return out;
  }

  /* bidang Kartesius: sx/sy memetakan koordinat data ke piksel SVG */
  function bidang(o) {
    const W = o.W || 640, H = o.H || 440, m = { l: 54, r: 26, t: 26, b: 48 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
    const sx = (x) => m.l + (x - o.xmin) / (o.xmax - o.xmin) * pw, sy = (y) => m.t + ph - (y - o.ymin) / (o.ymax - o.ymin) * ph;
    const svg = S('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'bidang', role: 'img', 'aria-label': o.label || 'Grafik fungsi', style: 'width:100%;height:100%;display:block;overflow:visible;font-family:Instrument,Segoe UI,sans-serif' });
    const lapis = {}; ['grid', 'sumbu', 'label', 'putus', 'kurva', 'titik', 'atas'].forEach((n) => { lapis[n] = S('g', { class: 'l-' + n }); svg.append(lapis[n]); });
    svg.insertBefore(S('rect', { x: m.l, y: m.t, width: pw, height: ph, fill: '#fff', stroke: '#E6E4F4', rx: 6 }), lapis.grid);
    (o.xt || []).forEach((v) => { lapis.grid.append(S('line', { x1: sx(v), x2: sx(v), y1: m.t, y2: m.t + ph, stroke: '#EEEBFA' })); lapis.label.append(S('text', { x: sx(v), y: m.t + ph + 20, 'font-size': 15, 'text-anchor': 'middle', fill: '#4A4775' }, fmt(v))); });
    (o.yt || []).forEach((v) => { lapis.grid.append(S('line', { x1: m.l, x2: m.l + pw, y1: sy(v), y2: sy(v), stroke: '#EEEBFA' })); lapis.label.append(S('text', { x: m.l - 9, y: sy(v) + 5, 'font-size': 15, 'text-anchor': 'end', fill: '#4A4775' }, fmt(v))); });
    const ax = S('line', { class: 'sx', x1: m.l, x2: m.l + pw, y1: sy(Math.max(o.ymin, Math.min(o.ymax, 0))), y2: sy(Math.max(o.ymin, Math.min(o.ymax, 0))), stroke: '#1E1B4B', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    const ay = S('line', { class: 'sy', x1: sx(Math.max(o.xmin, Math.min(o.xmax, 0))), x2: sx(Math.max(o.xmin, Math.min(o.xmax, 0))), y1: m.t, y2: m.t + ph, stroke: '#1E1B4B', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
    lapis.sumbu.append(ax, ay);
    const tx = S('text', { class: 'tx', x: m.l + pw - 2, y: m.t + ph + 40, 'font-size': 17, 'font-weight': 700, 'text-anchor': 'end', fill: '#1E1B4B' }, o.labelX || 'x');
    const ty = S('text', { class: 'ty', x: m.l + 8, y: m.t + 14, 'font-size': 17, 'font-weight': 700, fill: '#1E1B4B' }, o.labelY || 'y');
    lapis.label.append(tx, ty);
    const api = { svg, sx, sy, lapis, m, pw, ph, ax, ay, tx, ty, o,
      titik(x, y, w) { w = w || {}; const g = S('g', { class: 'tt' }); const c = S('circle', { cx: sx(x), cy: sy(y), r: w.r || 8, fill: w.warna || '#6D35E8', stroke: '#fff', 'stroke-width': 3 }); g.append(c);
        if (w.teks !== false) { const t = S('text', { x: sx(x) + 12, y: sy(y) - 12, 'font-size': 17, 'font-weight': 700, fill: w.warnaTeks || '#4A4775', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 4 }, '(' + fmt(x) + ', ' + fmt(y) + ')'); g.append(t); }
        g.style.transformBox = 'fill-box'; g.style.transformOrigin = 'center'; lapis.titik.append(g); return g; },
      putus(x, y, warna) { const v = S('line', { x1: sx(x), y1: sy(0 > o.ymax || 0 < o.ymin ? o.ymin : 0), x2: sx(x), y2: sy(0 > o.ymax || 0 < o.ymin ? o.ymin : 0), stroke: warna || '#FF8A1F', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' });
        const h = S('line', { x1: sx(0 > o.xmax || 0 < o.xmin ? o.xmin : 0), y1: sy(y), x2: sx(0 > o.xmax || 0 < o.xmin ? o.xmin : 0), y2: sy(y), stroke: warna || '#FF8A1F', 'stroke-width': 3, 'stroke-dasharray': '7 6', 'stroke-linecap': 'round' }); lapis.putus.append(v, h); return { v, h, x, y }; },
      kurva(garis, w) { w = w || {}; const g = S('g'); (Array.isArray(garis[0][0]) ? garis : [garis]).forEach((seg) => { const d = seg.map((p, i) => (i ? 'L' : 'M') + sx(p[0]).toFixed(1) + ' ' + sy(p[1]).toFixed(1)).join(''); g.append(S('path', { d, fill: 'none', stroke: w.warna || '#6D35E8', 'stroke-width': w.tebal || 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': w.sembunyi ? 1 : null, 'stroke-dashoffset': w.sembunyi ? 1 : null })); }); lapis.kurva.append(g); return g; },
      tegak(x, warna) { const l = S('line', { x1: sx(x), x2: sx(x), y1: m.t, y2: m.t + ph, stroke: warna || '#9B5DE5', 'stroke-width': 2.4, 'stroke-dasharray': '8 6' }); lapis.kurva.append(l); return l; } };
    return api;
  }
  /* tumbuhkan garis putus dari titik awal ke akhir (rAF) */
  function tumbuh(line, x1, y1, x2, y2, ms, batal) {
    return new Promise((res, rej) => { ms = ms / (root.UI.instan ? 1e6 : root.UI.speed); const t0 = performance.now(); line.setAttribute('x1', x1); line.setAttribute('y1', y1);
      const f = (t) => { if (batal && batal.batal) return rej(new root.UI.Batal()); const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); line.setAttribute('x2', x1 + (x2 - x1) * e); line.setAttribute('y2', y1 + (y2 - y1) * e); k < 1 ? requestAnimationFrame(f) : res(); }; requestAnimationFrame(f); });
  }
  const gambarKurva = (grp, ms, batal) => { const ps = [...grp.querySelectorAll('path')]; return Promise.all(ps.map((p) => root.UI.anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: ms, easing: 'cubic-bezier(.4,.1,.2,1)' }))).then(() => { if (batal) batal.cek(); }); };

  /* ---------- katalog sembilan keluarga ---------- */
  const K = {};
  const F = '<i>f</i>(<i>x</i>) = ', X = '<i>x</i>';
  const poly = (id, f, xr, yr, xt, yt, nama, rumus) => ({ nama, rumus: F + rumus, spec: { xmin: xr[0], xmax: xr[1], ymin: yr[0], ymax: yr[1], xt, yt }, garis: () => sampel(f, xr[0], xr[1], 400, yr[0], yr[1]) });
  K.poli = { alias: ['Suku banyak', 'Polynomial'], ciri: ['Garisnya mulus tanpa patah dan tanpa putus.', 'Pangkat tertinggi (derajat) menentukan jumlah lengkungannya: makin tinggi, makin banyak lekukan.'], konteks: ['Biaya produksi = biaya tetap + biaya per barang (derajat 1).', 'Lintasan bola atau luas kebun yang dibatasi pagar (derajat 2).', 'Volume kotak dari selembar karton (derajat 3).'],
    varian: [poly('p1', (x) => 2 * x + 1, [-4, 4], [-8, 10], [-4, -2, 0, 2, 4], [-8, -4, 0, 4, 8], 'Derajat 1 · garis lurus', '2' + X + ' + 1'), poly('p2', (x) => x * x - 4, [-4, 4], [-6, 12], [-4, -2, 0, 2, 4], [-4, 0, 4, 8, 12], 'Derajat 2 · parabola', X + '<sup>2</sup> − 4'),
      poly('p3', (x) => x * x * x - 3 * x, [-3, 3], [-8, 8], [-3, -2, -1, 0, 1, 2, 3], [-8, -4, 0, 4, 8], 'Derajat 3', X + '<sup>3</sup> − 3' + X), poly('p4', (x) => x * x * x * x - 5 * x * x + 4, [-3, 3], [-4, 10], [-3, -2, -1, 0, 1, 2, 3], [-4, 0, 4, 8], 'Derajat 4', X + '<sup>4</sup> − 5' + X + '<sup>2</sup> + 4')] };
  K.eksp = { alias: ['Eksponen', 'Exponential'], ciri: ['Naik terus, dan makin lama makin curam.', 'Selalu di atas sumbu x dan memotong sumbu y di titik (0, 1).'], konteks: ['Jumlah pengikut akun yang berlipat dua tiap minggu.', 'Tabungan yang bunganya ikut berbunga (bunga majemuk).'],
    varian: [poly('e', (x) => Math.pow(2, x), [-3, 4], [-1, 10], [-3, -2, -1, 0, 1, 2, 3, 4], [0, 2, 4, 6, 8, 10], 'Eksponensial', '2<sup>' + X + '</sup>')] };
  K.log = { alias: ['Logaritma', 'Logarithm', 'kebalikan dari eksponen'], ciri: ['Naik terus, tetapi makin lama makin landai.', 'Hanya ada untuk x lebih dari 0, dan memotong sumbu x di titik (1, 0).'], konteks: ['Kepuasan pembeli: tambahan pertama terasa besar, berikutnya makin kecil.', 'Skala kekuatan gempa dan tingkat kebisingan.'],
    varian: [poly('l', (x) => Math.log(x) / Math.LN2, [0, 8], [-3, 4], [0, 2, 4, 6, 8], [-2, 0, 2, 4], 'Logaritma basis 2', '<sup>2</sup>log ' + X)] };
  K.trig = { alias: ['Sinus, kosinus, tangen', 'Trigonometric'], ciri: ['Polanya berulang terus dengan bentuk yang sama (periodik).', 'Sinus dan kosinus berayun antara −1 dan 1; tangen memiliki garis putus-putus yang tidak pernah disentuh.'], konteks: ['Pasang surut air laut.', 'Jumlah wisatawan yang naik turun mengikuti musim.', 'Tangen: titik sorot lampu panggung yang berputar di dinding.'],
    varian: [poly('s', (x) => Math.sin(x * Math.PI / 180), [0, 360], [-1.4, 1.4], [0, 90, 180, 270, 360], [-1, 0, 1], 'Sinus', 'sin ' + X), poly('c', (x) => Math.cos(x * Math.PI / 180), [0, 360], [-1.4, 1.4], [0, 90, 180, 270, 360], [-1, 0, 1], 'Kosinus', 'cos ' + X),
      Object.assign(poly('t', (x) => Math.tan(x * Math.PI / 180), [-90, 90], [-4, 4], [-90, -45, 0, 45, 90], [-4, -2, 0, 2, 4], 'Tangen', 'tan ' + X), { tegak: [-90, 90], garis: () => sampel((x) => Math.tan(x * Math.PI / 180), -89.9, 89.9, 800, -4, 4) })] };
  K.rasional = { alias: ['Pecahan', 'Hiperbola', 'Rational'], ciri: ['Terdiri dari dua cabang yang mendekati sumbu tanpa pernah menyentuhnya.', 'Nilai x = 0 tidak boleh dipakai.'], konteks: ['Patungan: iuran tiap orang = total biaya ÷ jumlah orang.', 'Waktu tempuh = jarak ÷ kecepatan.'],
    varian: [Object.assign(poly('r', (x) => 6 / x, [-6, 6], [-8, 8], [-6, -3, 0, 3, 6], [-8, -4, 0, 4, 8], 'Rasional', '<span class="frak"><span class="at">6</span><span class="bw">' + X + '</span></span>'), { garis: () => [sampel((x) => 6 / x, -6, -0.7, 200, -8, 8)[0], sampel((x) => 6 / x, 0.7, 6, 200, -8, 8)[0]].filter(Boolean), tegak: [0] })] };
  K.akar = { alias: ['Radikal', 'Square root'], ciri: ['Dimulai dari satu titik, lalu naik makin landai.', 'Hanya ada untuk x yang tidak negatif.'], konteks: ['Panjang sisi lahan persegi dari luasnya.', 'Waktu jatuh benda dari ketinggian tertentu.'],
    varian: [poly('a', (x) => Math.sqrt(x), [0, 9], [-.5, 4], [0, 1, 4, 9], [0, 1, 2, 3, 4], 'Akar', '<span class="akar">√<span class="di">' + X + '</span></span>')] };
  K.mutlak = { alias: ['Modulus', 'Absolute value'], ciri: ['Berbentuk huruf V: turun dulu, lalu naik.', 'Nilainya tidak pernah negatif.'], konteks: ['Selisih harga barang dari harga acuan toko.', 'Jarak rumah ke halte, tanpa memedulikan kiri atau kanan.'],
    varian: [poly('m', (x) => Math.abs(x - 2), [-2, 6], [-.5, 5], [-2, 0, 2, 4, 6], [0, 1, 2, 3, 4, 5], 'Nilai mutlak', '|' + X + ' − 2|')] };
  const tg = []; for (let k = 1; k <= 5; k++) tg.push([[k - 1, k], [k, k]]);
  K.tangga = { alias: ['Fungsi pembulatan', 'Step function', 'Ceiling function'], ciri: ['Berbentuk anak tangga: ada lompatan, lalu mendatar lagi.', 'Titik kosong berarti tidak termasuk, titik penuh berarti termasuk.'], konteks: ['Tarif parkir per jam, dibulatkan ke atas.', 'Ongkos kirim per kilogram.'],
    varian: [{ nama: 'Tangga', rumus: F + 'pembulatan ke atas dari ' + X, spec: { xmin: 0, xmax: 5, ymin: 0, ymax: 5.6, xt: [0, 1, 2, 3, 4, 5], yt: [0, 1, 2, 3, 4, 5] }, garis: () => tg, titik: tg.flatMap((s, i) => [{ x: i, y: i + 1, t: 'kosong' }, { x: i + 1, y: i + 1, t: 'isi' }]) }] };
  K.sepotong = { alias: ['Piecewise', 'Fungsi bercabang', 'Fungsi bersyarat'], ciri: ['Dibuat dari beberapa rumus; tiap rumus hanya berlaku pada rentang x tertentu.', 'Di grafik ini garis naik sampai x = 2 (titik kosong), lalu melompat ke titik penuh dan menurun.'], konteks: ['Tarif air bertingkat: pemakaian awal murah, lalu lebih mahal.', 'Pajak penghasilan bertingkat.'],
    varian: [{ nama: 'Dua cabang', rumus: '<span class="cabang"><i>f</i>(<i>x</i>) =<span class="kurawal">{</span><span class="isi-cabang"><span><i>x</i> + 1,&emsp;jika <i>x</i> &lt; 2</span><span>6 − <i>x</i>,&emsp;jika <i>x</i> ≥ 2</span></span></span>', spec: { xmin: -1, xmax: 5, ymin: -1, ymax: 6, xt: [-1, 0, 1, 2, 3, 4, 5], yt: [0, 1, 2, 3, 4, 5, 6] }, garis: () => [[[-1, 0], [2, 3]], [[2, 4], [5, 1]]], titik: [{ x: 2, y: 3, t: 'kosong' }, { x: 2, y: 4, t: 'isi' }] }] };
  K.sepotong.varian[0].panjang = true;

  const UMUM = {"poli":"<i>f</i>(<i>x</i>) = <i>a</i><sub><i>n</i></sub><i>x</i><sup><i>n</i></sup> + … + <i>a</i><sub>1</sub><i>x</i> + <i>a</i><sub>0</sub>","eksp":"<i>f</i>(<i>x</i>) = <i>a</i> · <i>b</i><sup><i>x</i></sup>,&emsp;<i>b</i> &gt; 0 dan <i>b</i> ≠ 1","log":"<i>f</i>(<i>x</i>) = <sup><i>b</i></sup>log <i>x</i>,&emsp;<i>b</i> &gt; 0 dan <i>b</i> ≠ 1","trig":"<i>f</i>(<i>x</i>) = <i>a</i> sin <i>x</i>,&emsp;<i>a</i> cos <i>x</i>,&emsp;atau tan <i>x</i>","rasional":"<i>f</i>(<i>x</i>) = <i>k</i> ÷ <i>x</i>&emsp;atau&emsp;<i>p</i>(<i>x</i>) ÷ <i>q</i>(<i>x</i>),&emsp;<i>q</i>(<i>x</i>) ≠ 0","akar":"<i>f</i>(<i>x</i>) = <i>a</i>√(<i>x</i> + <i>c</i>)&emsp;(bentuk paling sederhana: √<i>x</i>)","mutlak":"<i>f</i>(<i>x</i>) = |<i>ax</i> + <i>b</i>|&emsp;(bentuk paling sederhana: |<i>x</i>|)","tangga":"<i>f</i>(<i>x</i>) = ⌈<i>x</i>⌉ (dibulatkan ke atas)&emsp;atau&emsp;⌊<i>x</i>⌋ (dibulatkan ke bawah)","sepotong":"rumus<sub>1</sub> untuk <i>x</i> &lt; <i>c</i>,&emsp;rumus<sub>2</sub> untuk <i>x</i> ≥ <i>c</i>&emsp;(tiap rumus punya rentang sendiri)"}; Object.keys(UMUM).forEach((f) => { K[f].umum = UMUM[f]; });
  /* gambar satu varian ke dalam bidang baru; animasi opsional */
  function gambarVarian(v, warna, tebal) {
    const b = bidang(Object.assign({ W: 640, H: 440 }, v.spec)); if (v.tegak) v.tegak.forEach((x) => b.tegak(x, warna));
    const g = b.kurva(v.garis(), { warna, tebal: tebal || 5.5, sembunyi: true });
    (v.titik || []).forEach((p) => { const c = S('circle', { cx: b.sx(p.x), cy: b.sy(p.y), r: 8, fill: p.t === 'kosong' ? '#fff' : warna, stroke: warna, 'stroke-width': 3.4, opacity: 0, class: 'tk' }); b.lapis.titik.append(c); });
    return { b, kurva: g };
  }
  function statis(v, warna, tebal) { const b = bidang(Object.assign({ W: 640, H: 440 }, v.spec)); if (v.tegak) v.tegak.forEach((x) => b.tegak(x, warna)); b.kurva(v.garis(), { warna, tebal: tebal || 5 }); (v.titik || []).forEach((p) => b.lapis.titik.append(S('circle', { cx: b.sx(p.x), cy: b.sy(p.y), r: 8, fill: p.t === 'kosong' ? '#fff' : warna, stroke: warna, 'stroke-width': 3.4 }))); return b; }
  root.GF = { S, fmt, sampel, bidang, tumbuh, gambarKurva, K, gambarVarian, statis };
})(window);
