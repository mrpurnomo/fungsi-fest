/* Fungsi serverless Vercel: satu titik masuk /api/app (POST {a: aksi, ...}).
   Penyimpanan: Upstash Redis lewat REST (tanpa pustaka). Variabel lingkungan yang dipakai:
   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (atau KV_REST_API_URL + KV_REST_API_TOKEN)  dan  GURU_PIN. */
const B = require('./_lib/bersama.js');
const { AsyncLocalStorage } = require('node:async_hooks');
const als = new AsyncLocalStorage();
const KELAS_OK = ['xif', 'xig', 'xig2'];
const keys = (kl) => ({ S: 'gf:' + kl + ':siswa', KEL: 'gf:' + kl + ':kelompok', G: 'gf:' + kl + ':gerbang', L: 'gf:' + kl + ':langkah', A: 'gf:' + kl + ':arsip', KB: 'gf:' + kl + ':kelasbuka', P: 'gf:' + kl + ':pameran', SD: 'gf:' + kl + ':sidang', SL: 'gf:' + kl + ':sdslide', SV: 'gf:' + kl + ':sdsuara', JW: 'gf:' + kl + ':sdjawab', TG: 'gf:' + kl + ':sdtanggapan', NG: 'gf:' + kl + ':sdnilai', PR: 'gf:' + kl + ':sdperan', CR: 'gf:' + kl + ':sdcoret', CN: 'gf:' + kl + ':sdcn' });
const ctx = () => als.getStore() || { kl: 'xif', K: keys('xif') };
const nm = (i) => B.nama(i, ctx().kl), CFG = () => B.cfg(ctx().kl), NLANGKAH = () => CFG().langkah;

// Nama variabel bisa berawalan apa pun (KV_, UPSTASH_REDIS_, STORAGE_, ...): cari yang berakhiran REST_API_URL / REST_URL dan *_TOKEN.
const cariEnv = (akhir, jangan) => { const k = Object.keys(process.env).find((n) => n.endsWith(akhir) && !(jangan && n.includes(jangan))); return k ? process.env[k] : undefined; };
const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || cariEnv('REST_API_URL') || cariEnv('REDIS_REST_URL');
const TOK_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || cariEnv('REST_API_TOKEN', 'READ_ONLY') || cariEnv('REDIS_REST_TOKEN');
const PINS = [String(process.env.GURU_PIN || ''), B.PIN_GURU].filter(Boolean);   // PIN bawaan selalu berlaku, GURU_PIN (jika ada) juga berlaku
const pinOk = (p) => PINS.includes(String(p));

async function redis(...cmd) {
  const r = await fetch(URL_REDIS, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK_REDIS, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
}
async function semuaSiswa() { const arr = (await redis('HGETALL', ctx().K.S)) || [], out = {}; for (let i = 0; i < arr.length; i += 2) { try { out[arr[i]] = JSON.parse(arr[i + 1]); } catch (e) { /* abaikan */ } } return out; }
async function ambilSiswa(idx) { const v = await redis('HGET', ctx().K.S, 's' + idx); return v ? JSON.parse(v) : null; }
async function simpanSiswa(idx, d) { await redis('HSET', ctx().K.S, 's' + idx, JSON.stringify(d)); }
async function ambilKel() { const v = await redis('GET', ctx().K.KEL); return v ? JSON.parse(v) : null; }
async function simpanKel(k) { await redis('SET', ctx().K.KEL, JSON.stringify(k)); }
/* langkah tahap lanjutan: daftar langkah yang dibuka guru (tiap langkah bisa dibuka/ditutup sendiri). Format lama (satu angka n) dibaca sebagai langkah 1..n. */
async function bacaLangkah() { const v = await redis('GET', ctx().K.L); if (v == null) return [1]; try { const x = JSON.parse(v); if (Array.isArray(x)) return [...new Set(x.filter((n) => Number.isInteger(n) && n >= 1 && n <= NLANGKAH()))].sort((p, q) => p - q); if (Number.isInteger(x) && x >= 1) return Array.from({ length: NLANGKAH() }, (_, i) => i + 1).filter((n) => n <= x); } catch (e) { /* abaikan */ } return [1]; }
async function tulisLangkah(arr) { await redis('SET', ctx().K.L, JSON.stringify([...new Set(arr)].sort((p, q) => p - q))); }
/* arsip kelompok: bertahan walau semua data kelas diatur ulang */
async function ambilArsip() { const v = await redis('GET', ctx().K.A); try { return v ? JSON.parse(v) : []; } catch (e) { return []; } }
async function arsipkan(kel, label, ganti) {
  const arr = await ambilArsip(), snap = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), label: label || 'otomatis', kel: kel.kel.map((g) => g.map((s) => ({ idx: s.idx, skor: s.skor }))) };
  if (ganti && arr[0] && arr[0].label === 'otomatis') arr[0] = snap; else arr.unshift(snap); await redis('SET', ctx().K.A, JSON.stringify(arr.slice(0, 12))); return snap;
}
const bersihIdx = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && (n < CFG().daftar.length || n === B.DUMMY) ? n : null; };
const nyata = (k) => +k.slice(1) < CFG().daftar.length;   // tanpa akun uji coba
const selesaiNyata = (s) => Object.keys(s).filter((k) => nyata(k) && s[k].hasil).map((k) => ({ idx: +k.slice(1), skor: s[k].hasil.skor }));
const sudahMasuk = (kel, idx) => { for (let g = 0; g < kel.length; g++) if (kel[g].some((s) => s.idx === idx)) return g; return -1; };
const tampilKel = (kel) => kel.map((g) => g.map((s) => ({ idx: s.idx, nama: nm(s.idx) })));

/* ---------------- Sidang presentasi (kelas xig2) ---------------- */
const FASE_SD = ['siap', 'presentasi', 'tanya', 'soal', 'tanggapan', 'hasil', 'selesai'];
const hmap = (a) => { const o = {}; for (let i = 0; i < (a || []).length; i += 2) { try { o[a[i]] = JSON.parse(a[i + 1]); } catch (e) { /* abaikan */ } } return o; };
/* jadwal: 13.15-15.15 WITA, mulai tampil 13.25, sembilan kelompok => sekitar 12 menit per kelompok */
const DURASI0 = { presentasi: 270, tanya: 120, soal: 90, soal2: 90, tanggapan: 75 };
const sdBaru = () => ({ giliran: null, fase: 'siap', mulaiFase: 0, durasi: Object.assign({}, DURASI0), tambah: 0, jedaAt: null, selesai: [], soalSelesai: [], kecuali: [], anggota: [], peran: {}, berikut: null, buka: false, soalNo: 1, sub: 'jawab', hasil: {}, hasilBintang: null });
async function bacaSD() {
  const m = await redis('MGET', ctx().K.SD, ctx().K.SL); let s = sdBaru(); try { if (m[0]) { const x = JSON.parse(m[0]); s = Object.assign(s, x); s.durasi = Object.assign({}, DURASI0, x.durasi || {}); } } catch (e) { /* abaikan */ }
  let l = {}; try { if (m[1]) l = JSON.parse(m[1]); } catch (e) { /* abaikan */ }
  const sama = l && l.g === s.giliran; s.slide = sama ? (l.slide | 0) : 0; s.pembicara = sama && Number.isInteger(l.pembicara) ? l.pembicara : null; return s;
}
async function tulisSD(s) { const x = Object.assign({}, s); delete x.slide; delete x.pembicara; await redis('SET', ctx().K.SD, JSON.stringify(x)); }
const soalSD = (g, no) => B.soalPres(g, no === 2 ? 2 : 1);
const rata = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const durasiNow = (s) => (s.fase === 'soal' ? (s.sub === 'jawab' ? (s.soalNo === 2 ? s.durasi.soal2 : s.durasi.soal) : 0) : (s.durasi[s.fase] || 0));
const waktuHabis = (s) => { if (s.jedaAt) return false; const d = durasiNow(s); return !!d && Date.now() - s.mulaiFase >= (d + (s.tambah || 0)) * 1000; };
const jmlPenonton = (s) => CFG().daftar.length - s.anggota.length;
/* hasil per soal: jumlah, benar, sebaran jawaban */
async function hitungHasil(g, no) {
  const jw = hmap(await redis('HGETALL', ctx().K.JW)), q = soalSD(g, no), pre = 'g:' + g + ':' + no + ':', ks = Object.keys(jw).filter((k) => k.startsWith(pre)), benar = ks.filter((k) => jw[k].benar).length, cnt = {};
  ks.forEach((k) => { cnt[jw[k].j] = (cnt[jw[k].j] || 0) + 1; });
  const sebaran = Object.keys(cnt).map((j) => ({ j: Number(j), n: cnt[j], benar: Number(j) === q.kunci })).sort((a, b) => b.n - a.n).slice(0, 5);
  return { no, kunci: q.kunci, n: ks.length, benar, persen: ks.length ? Math.round(benar / ks.length * 100) : 0, sebaran };
}
async function hitungBintang(g) {
  const sv = hmap(await redis('HGETALL', ctx().K.SV)), ks = Object.keys(sv).filter((k) => k.startsWith('g:' + g + ':') && sv[k].k), dist = [0, 0, 0, 0, 0], pem = {};
  ks.forEach((k) => { dist[sv[k].k - 1]++; Object.keys(sv[k].p || {}).forEach((a) => { (pem[a] = pem[a] || []).push(sv[k].p[a]); }); });
  const o = {}; Object.keys(pem).forEach((a) => { o[a] = { n: pem[a].length, rata: rata(pem[a]) }; });
  return { n: ks.length, rata: rata(ks.map((k) => sv[k].k)), dist, pembicara: o };
}
async function kunciSekarang(s) { s.hasil = s.hasil || {}; s.hasil[s.soalNo] = await hitungHasil(s.giliran, s.soalNo); s.sub = 'kunci'; if (!s.soalSelesai.includes(s.giliran)) s.soalSelesai.push(s.giliran); }
const gantiFase = (s, f) => { s.fase = f; s.mulaiFase = Date.now(); s.tambah = 0; s.jedaAt = null; };
/* peralihan yang digerakkan penyaji (atau guru) */
async function terapkanAksi(s, a, guru) {
  const g = s.giliran; if (g == null) return 'tidak-ada-giliran';
  if (a === 'tanya') { if (!guru && s.fase !== 'presentasi') return 'urutan'; gantiFase(s, 'tanya'); return null; }
  if (a === 'soal') { if (!guru && !['presentasi', 'tanya'].includes(s.fase)) return 'urutan'; gantiFase(s, 'soal'); s.soalNo = 1; s.sub = 'jawab'; s.hasil = {}; return null; }
  if (a === 'kunci') { if (s.fase !== 'soal' || s.sub !== 'jawab') return 'urutan'; await kunciSekarang(s); return null; }
  if (a === 'lanjut') { if (s.fase !== 'soal' || s.sub !== 'kunci') return 'urutan'; if (s.soalNo === 1) { s.soalNo = 2; s.sub = 'jawab'; s.mulaiFase = Date.now(); s.tambah = 0; s.jedaAt = null; } else s.sub = 'stat'; return null; }
  if (a === 'nilai') { if (!guru && !(s.fase === 'soal' && s.sub === 'stat')) return 'urutan'; gantiFase(s, 'tanggapan'); return null; }
  if (a === 'hasil') { if (!guru) return 'urutan'; s.hasilBintang = await hitungBintang(g); gantiFase(s, 'hasil'); return null; }
  if (a === 'selesai') { if (!guru && s.fase !== 'hasil') return 'urutan'; if (!s.hasilBintang) s.hasilBintang = await hitungBintang(g); gantiFase(s, 'selesai'); if (!s.selesai.includes(g)) s.selesai.push(g); return null; }
  return 'aksi';
}
/* peralihan otomatis: waktu habis atau semua penonton sudah menjawab / menilai */
async function autoMaju(s, cn) {
  if (s.giliran == null) return false; const g = s.giliran, total = jmlPenonton(s);
  if (s.fase === 'soal' && s.sub === 'jawab') { const n = Number((cn && cn[s.soalNo === 2 ? 1 : 0]) || 0); if (waktuHabis(s) || (total > 0 && n >= total)) { await kunciSekarang(s); return true; } }
  if (s.fase === 'tanggapan') { const n = Number((cn && cn[2]) || 0); if (waktuHabis(s) || (total > 0 && n >= total)) { s.hasilBintang = await hitungBintang(g); gantiFase(s, 'hasil'); return true; } }
  return false;
}
const cnBaca = async (g) => { const r = await redis('HMGET', ctx().K.CN, 'j:' + g + ':1', 'j:' + g + ':2', 'v:' + g, 't:' + g); return (r || []).map((x) => Number(x) || 0); };
const grafikDari = (q) => (q.grafik ? { fam: q.grafik.fam, idx: q.grafik.idx, p: q.grafik.p } : null);
const semuaPeran = (m) => { const o = {}; Object.keys(m).forEach((k) => { const p = k.split(':'); if (p[0] === 'r') (o[p[1]] = o[p[1]] || {})[m[k]] = +p[2]; }); return o; };
async function peranG(g) { const m = hmap(await redis('HGETALL', ctx().K.PR)), o = {}; Object.keys(m).forEach((k) => { const p = k.split(':'); if (p[0] === 'r' && +p[1] === g) o[m[k]] = +p[2]; }); return o; }
/* klaim peran atomik (HSETNX): satu peran hanya untuk satu anggota walau dua murid menekan bersamaan */
async function simpanPeran(g, idx, p, bebas) {
  const K = ctx().K.PR, cur = await peranG(g);
  if (p) { const ok = await redis('HSETNX', K, 'r:' + g + ':' + p, JSON.stringify(idx)); if (!(ok === 1 || ok === '1')) { const ex = await redis('HGET', K, 'r:' + g + ':' + p); let pemilik = null; try { pemilik = ex != null ? JSON.parse(ex) : null; } catch (e) { /* abaikan */ } if (pemilik !== idx) return null; } }
  for (const r of [1, 2, 3]) if (r !== p && cur[idx] === r) await redis('HDEL', K, 'r:' + g + ':' + r);
  const hasil = await peranG(g); const s2 = await bacaSD(); if (s2.giliran === g) { s2.peran = hasil; await tulisSD(s2); } return hasil;
}
async function sdSiswaOk(b) { const idx = bersihIdx(b.idx); if (idx === null || idx === B.DUMMY || !b.token) return null; const d = await ambilSiswa(idx); return d && d.token === b.token ? idx : null; }
const kelompokDari = (kl, idx) => { let g = -1; (kl ? kl.kel : []).forEach((x, gi) => { if (x.some((m) => m.idx === idx)) g = gi; }); return g; };
async function sdAksiSiswa(b, kirim) {
  const K = ctx().K;
  if (b.a === 'sd-status') {
    const s = await bacaSD(), idx = bersihIdx(b.idx), saya = idx !== null && s.anggota.includes(idx); let cn = [0, 0, 0, 0];
    if (s.giliran != null && ['soal', 'tanggapan', 'hasil', 'selesai'].includes(s.fase)) { cn = await cnBaca(s.giliran); if (await autoMaju(s, cn)) await tulisSD(s); }
    const g = s.giliran, f = s.fase, no = s.soalNo, tampilHasil = f === 'soal' ? s.sub !== 'jawab' : ['tanggapan', 'hasil', 'selesai'].includes(f);
    const out = { ok: true, sekarang: Date.now(), fase: f, giliran: g, jenis: g != null ? B.JENIS[g] : null, slide: s.slide, pembicara: s.pembicara, mulaiFase: s.mulaiFase, durasi: s.durasi, tambah: s.tambah || 0, jedaAt: s.jedaAt || null, peran: s.peran || {}, anggota: s.anggota.map((i) => ({ idx: i, nama: nm(i) })), berikut: s.berikut, selesai: s.selesai, buka: !!s.buka, sayaPenyaji: saya, soalNo: no, sub: s.sub, total: g != null ? jmlPenonton(s) : 0, jawabN: cn[no === 2 ? 1 : 0], suaraN: cn[2], tepuk: cn[3] };
    if (g != null && f === 'soal') { const q = soalSD(g, no); out.soal = { no, tanya: q.tanya, grafik: grafikDari(q) }; }
    if (g != null && ['soal', 'tanggapan', 'hasil', 'selesai'].includes(f)) out.hasil = s.hasil || {};
    if (g != null && saya && ['hasil', 'selesai'].includes(f)) out.hasilBintang = s.hasilBintang;
    if (idx !== null && b.token && !saya && g != null && ['soal', 'tanggapan'].includes(f)) {
      const [d, jw, sv] = await Promise.all([ambilSiswa(idx), redis('HMGET', K.JW, 'g:' + g + ':1:' + idx, 'g:' + g + ':2:' + idx), redis('HGET', K.SV, 'g:' + g + ':' + idx)]);
      if (d && d.token === b.token) { try { const js = {}; (jw || []).forEach((x, i) => { if (x) { const o = JSON.parse(x), no2 = i + 1, h = (s.hasil || {})[no2]; js[no2] = { j: o.j, benar: h ? o.benar : undefined }; } }); out.jawabSaya = js; if (sv) out.suaraSaya = JSON.parse(sv); } catch (e) { /* abaikan */ } }
    }
    return kirim(200, out);
  }
  if (b.a === 'sd-info') { const kl = await ambilKel(), idx = bersihIdx(b.idx), sayaG = kelompokDari(kl, idx), pr = semuaPeran(hmap(await redis('HGETALL', ctx().K.PR))); return kirim(200, { ok: true, kelompok: kl ? tampilKel(kl.kel) : [], jenis: B.JENIS, sayaKelompok: sayaG, peran: pr }); }
  const idx = await sdSiswaOk(b); if (idx === null) return kirim(403, { error: 'tidak-dikenali' });
  const s = await bacaSD(), saya = s.anggota.includes(idx);
  if (b.a === 'sd-rapor') {
    const kl = await ambilKel(), g = kelompokDari(kl, idx); if (g < 0) return kirim(409, { error: 'tanpa-kelompok' });
    const rk = await sdRekap(), kg = rk.kelompok[g], ang = kl.kel[g].map((m) => m.idx), ind = rk.individu.filter((x) => ang.includes(x.idx)).map((x) => ({ nama: x.nama, penyampaian: x.penyampaian }));
    const [sv, tg, ng, cn] = await Promise.all([redis('HGETALL', K.SV), redis('HGETALL', K.TG), redis('HGETALL', K.NG), cnBaca(g)]), SVm = hmap(sv), TGm = hmap(tg), NGm = hmap(ng), ks = Object.keys(SVm).filter((k) => k.startsWith('g:' + g + ':') && SVm[k].k), tk = Object.keys(TGm).filter((k) => k.startsWith('g:' + g + ':')), dist = [0, 0, 0, 0, 0]; ks.forEach((k) => { dist[SVm[k].k - 1]++; });
    const jw = hmap(await redis('HGETALL', K.JW)), soal = [1, 2].map((no) => { const pre = 'g:' + g + ':' + no + ':', kk = Object.keys(jw).filter((k) => k.startsWith(pre)), bn = kk.filter((k) => jw[k].benar).length; return { no, n: kk.length, benar: bn, persen: kk.length ? Math.round(bn / kk.length * 100) : null }; });
    const ngg = NGm['g:' + g] || null;
    return kirim(200, { ok: true, g, jenis: B.JENIS[g], anggota: kl.kel[g].map((m) => nm(m.idx)), nilai: { guru: kg.guru, bintang: kg.bintang, mengajar: kg.mengajar, kontribusi: kg.kontribusi }, suara: { n: ks.length, rata: rata(ks.map((k) => SVm[k].k)), dist }, pembicara: kl.kel[g].map((m) => { const v = ks.map((k) => SVm[k].p && SVm[k].p[m.idx]).filter((x) => x != null); return { nama: nm(m.idx), n: v.length, rata: rata(v), nilaiAkhir: (ind.find((y) => y.nama === nm(m.idx)) || {}).penyampaian }; }), soal, rubrik: ngg, tanggapan: { total: tk.length, tanya: tk.filter((k) => TGm[k].jenis === 'tanya').length, saran: tk.filter((k) => TGm[k].jenis === 'saran').length, apresiasi: tk.filter((k) => TGm[k].jenis === 'apresiasi').length }, tepuk: cn[3], selesai: s.selesai.includes(g) });
  }
  if (b.a === 'sd-coret') {
    if (!saya || s.giliran == null) return kirim(403, { error: 'bukan-penyaji' }); const sl = Number(b.slide); if (!Number.isInteger(sl) || sl < 0 || sl > 30 || !Array.isArray(b.strokes)) return kirim(400, { error: 'coret' });
    const str = JSON.stringify({ g: s.giliran, slide: sl, strokes: b.strokes.slice(0, 200), t: Date.now() }); if (str.length > 120000) return kirim(413, { error: 'terlalu-besar' }); await redis('SET', K.CR, str); return kirim(200, { ok: true });
  }
  if (b.a === 'sd-peran') {
    const kl = await ambilKel(), g = kelompokDari(kl, idx); if (g < 0) return kirim(409, { error: 'tanpa-kelompok' }); if (s.selesai.includes(g)) return kirim(409, { error: 'sudah-selesai' });
    const p = Number(b.peran); if (![0, 1, 2, 3].includes(p)) return kirim(400, { error: 'peran' }); const cur = await simpanPeran(g, idx, p, false); if (!cur) return kirim(409, { error: 'peran-diambil' }); return kirim(200, { ok: true, g, peran: cur });
  }
  if (b.a === 'sd-mulai') {
    const kl = await ambilKel(), g = kelompokDari(kl, idx); if (g < 0) return kirim(409, { error: 'tanpa-kelompok' });
    if (!s.buka) return kirim(409, { error: 'belum-dibuka' }); if (s.selesai.includes(g)) return kirim(409, { error: 'sudah-selesai' });
    const prG = await peranG(g); if (!prG[idx]) return kirim(409, { error: 'peran-belum' });
    if (s.giliran !== null && s.giliran !== g && !['siap', 'selesai'].includes(s.fase)) return kirim(409, { error: 'kelompok-lain-tampil' });
    if (s.giliran !== g) { s.giliran = g; s.anggota = kl.kel[g].map((x) => x.idx); s.hasil = {}; s.hasilBintang = null; s.soalNo = 1; s.sub = 'jawab'; } s.peran = prG; if (s.berikut === g) s.berikut = null;
    if (s.fase === 'siap' || s.giliran !== g || s.fase === 'selesai') { gantiFase(s, 'presentasi'); s.hasil = {}; s.hasilBintang = null; s.soalNo = 1; s.sub = 'jawab'; }
    await tulisSD(s); return kirim(200, { ok: true, giliran: g });
  }
  if (b.a === 'sd-aksi') {
    if (!saya || s.giliran == null) return kirim(403, { error: 'bukan-penyaji' }); if (!['tanya', 'soal', 'kunci', 'lanjut', 'nilai', 'selesai'].includes(b.aksi)) return kirim(400, { error: 'aksi' });
    const e = await terapkanAksi(s, b.aksi, false); if (e) return kirim(409, { error: e }); await tulisSD(s); return kirim(200, { ok: true, fase: s.fase, soalNo: s.soalNo, sub: s.sub });
  }
  if (b.a === 'sd-slide') { if (!saya || s.giliran == null) return kirim(403, { error: 'bukan-penyaji' }); const n = Number(b.slide); if (!Number.isInteger(n) || n < 0 || n > 30) return kirim(400, { error: 'slide' }); const pm = Number(b.pembicara), pem = b.pembicara != null && s.anggota.includes(pm) ? pm : s.pembicara; await redis('SET', K.SL, JSON.stringify({ g: s.giliran, slide: n, pembicara: pem, t: Date.now() })); return kirim(200, { ok: true }); }
  if (b.a === 'sd-pembicara') { if (!saya || s.giliran == null) return kirim(403, { error: 'bukan-penyaji' }); const p = Number(b.pembicara); if (!s.anggota.includes(p)) return kirim(400, { error: 'pembicara' }); await redis('SET', K.SL, JSON.stringify({ g: s.giliran, slide: s.slide, pembicara: p, t: Date.now() })); return kirim(200, { ok: true }); }
  if (b.a === 'sd-suara') {
    if (saya || s.giliran == null || s.fase !== 'tanggapan' || !s.buka) return kirim(409, { error: 'di-luar-fase' });
    const key = 'g:' + s.giliran + ':' + idx, v = (x) => (Number.isInteger(x) && x >= 1 && x <= 5 ? x : null); let cur = { k: null, p: {} }, ada = false; try { const o = await redis('HGET', K.SV, key); if (o) { cur = JSON.parse(o); ada = true; } } catch (e) { /* abaikan */ }
    if (v(b.k)) cur.k = b.k; if (v(b.p) && s.anggota.includes(Number(b.pembicara))) { cur.p = cur.p || {}; cur.p[Number(b.pembicara)] = b.p; }
    if (b.pm && typeof b.pm === 'object') Object.keys(b.pm).forEach((a) => { if (s.anggota.includes(Number(a)) && v(b.pm[a])) { cur.p = cur.p || {}; cur.p[Number(a)] = b.pm[a]; } });
    await redis('HSET', K.SV, key, JSON.stringify(cur)); if (!ada) await redis('HINCRBY', K.CN, 'v:' + s.giliran, 1); return kirim(200, { ok: true, suaraSaya: cur });
  }
  if (b.a === 'sd-jawab') {
    if (saya || s.giliran == null || s.fase !== 'soal' || s.sub !== 'jawab' || !s.buka) return kirim(409, { error: 'di-luar-fase' }); const j = Number(b.j); if (!Number.isInteger(j) || Math.abs(j) > 1e9) return kirim(400, { error: 'jawaban' });
    const fld = 'g:' + s.giliran + ':' + s.soalNo + ':' + idx, ada = await redis('HGET', K.JW, fld); await redis('HSET', K.JW, fld, JSON.stringify({ j, benar: j === soalSD(s.giliran, s.soalNo).kunci, t: Date.now() })); if (ada == null) await redis('HINCRBY', K.CN, 'j:' + s.giliran + ':' + s.soalNo, 1); return kirim(200, { ok: true, no: s.soalNo });
  }
  if (b.a === 'sd-tepuk') {
    if (saya || s.giliran == null || !['hasil', 'selesai'].includes(s.fase)) return kirim(409, { error: 'di-luar-fase' }); const n = Math.max(1, Math.min(8, Number(b.n) || 1)); await redis('HINCRBY', K.CN, 't:' + s.giliran, n); return kirim(200, { ok: true });
  }
  return kirim(400, { error: 'Aksi tidak dikenal' });
}
async function sdRekap() {
  const K = ctx().K, [kl, sis, sv, jw, tg, ng, sd] = await Promise.all([ambilKel(), semuaSiswa(), redis('HGETALL', K.SV), redis('HGETALL', K.JW), redis('HGETALL', K.TG), redis('HGETALL', K.NG), bacaSD()]);
  const SVm = hmap(sv), JWm = hmap(jw), TGm = hmap(tg), NGm = hmap(ng), J = CFG().jmlKelompok, kelA = (kl && kl.kel) || [], anggota = (g) => (kelA[g] || []).map((x) => x.idx);
  const aktif = new Set([].concat(sd.selesai, sd.soalSelesai)); [SVm, JWm, TGm, NGm].forEach((m) => Object.keys(m).forEach((k) => { const p = k.split(':'); if (p[0] === 'g' || p[0] === 'i') { const g = +p[1]; if (Number.isInteger(g)) aktif.add(g); } }));
  const kelompok = [], individu = [], log = [];
  for (let g = 0; g < J; g++) {
    const ngg = NGm['g:' + g], gk = ngg ? rata(['isi', 'kedalaman', 'kejelasan', 'kompak'].map((c) => ngg[c]).filter((x) => Number.isFinite(x))) : null;
    const bin = Object.keys(SVm).filter((k) => k.startsWith('g:' + g + ':') && SVm[k].k).map((k) => SVm[k].k), jws = Object.keys(JWm).filter((k) => k.startsWith('g:' + g + ':')), lain = [...aktif].filter((h) => h !== g), kon = Object.keys(TGm).filter((k) => { const p = k.split(':'); return +p[2] === g && +p[1] !== g; }).length;
    kelompok.push({ g: g + 1, jenis: B.NAMA_FAM[B.JENIS[g]], anggota: anggota(g).map(nm), guru: gk == null ? null : gk * 25, bintang: bin.length ? rata(bin) / 5 * 100 : null, mengajar: jws.length ? jws.filter((k) => JWm[k].benar).length / jws.length * 100 : null, kontribusi: lain.length ? Math.min(1, kon / Math.min(8, lain.length)) * 100 : null, nSuara: bin.length, nJawab: jws.length, tampil: aktif.has(g) });
  }
  const eligible = (g) => sd.soalSelesai.filter((h) => h !== g);
  Object.keys(TGm).sort().forEach((k) => { const p = k.split(':'), t = TGm[k]; log.push({ presentasi: +p[1] + 1, jenisPresentasi: B.NAMA_FAM[B.JENIS[+p[1]]], kelompok: +p[2] + 1, jenis: t.jenis, oleh: Number.isInteger(t.oleh) ? nm(t.oleh) : '' }); });
  CFG().daftar.forEach((_, i) => {
    const hadir = !!sis['s' + i]; let g = -1; for (let x = 0; x < kelA.length; x++) if (kelA[x].some((m) => m.idx === i)) g = x;
    const pv = []; Object.keys(SVm).forEach((k) => { const o = SVm[k] && SVm[k].p; if (o && o[i] != null) pv.push(o[i]); });
    const gi = g >= 0 && NGm['i:' + g + ':' + i] != null ? NGm['i:' + g + ':' + i] * 25 : null, pe = [pv.length ? rata(pv) / 5 * 100 : null, gi].filter((x) => x != null), el = g >= 0 ? eligible(g) : sd.soalSelesai;
    let bnr = 0; el.forEach((h) => [1, 2].forEach((no) => { const o = JWm['g:' + h + ':' + no + ':' + i]; if (o && o.benar) bnr++; })); const tp = Object.keys(TGm).filter((k) => TGm[k].oleh === i).length, tot = el.length * 2;
    individu.push({ idx: i, nama: nm(i), kelompok: g + 1, hadir, penyampaian: hadir && pe.length ? rata(pe) : null, jawaban: hadir && tot ? bnr / tot * 100 : null, partisipasi: hadir && aktif.size ? Math.min(1, tp / 2) * 100 : null, nSoal: tot });
  });
  return { kelompok, individu, tanggapan: log, selesai: sd.selesai };
}
async function sdAksiGuru(b, kirim) {
  const K = ctx().K;
  if (b.a === 'g-sd-status') {
    const [s, sv, jw, tg, ng, kl, kb, pr] = await Promise.all([bacaSD(), redis('HGETALL', K.SV), redis('HGETALL', K.JW), redis('HGETALL', K.TG), redis('HGETALL', K.NG), ambilKel(), redis('GET', K.KB), redis('HGETALL', K.PR)]), g = s.giliran;
    let cn = [0, 0, 0, 0]; if (g != null && ['soal', 'tanggapan', 'hasil', 'selesai'].includes(s.fase)) { cn = await cnBaca(g); if (await autoMaju(s, cn)) await tulisSD(s); }
    const SVm = hmap(sv), JWm = hmap(jw), TGm = hmap(tg), NGm = hmap(ng), PRm = semuaPeran(hmap(pr));
    const out = { ok: true, sekarang: Date.now(), sd: Object.assign({}, s, { anggota: s.anggota.map((i) => ({ idx: i, nama: nm(i) })), jenis: g != null ? B.JENIS[g] : null }), penonton: CFG().daftar.length - s.anggota.length, kelompok: kl ? tampilKel(kl.kel) : [], kelasBuka: kb === '1', peran: PRm, cn: { j1: cn[0], j2: cn[1], v: cn[2], t: cn[3] } };
    out.ringkas = []; for (let h = 0; h < CFG().jmlKelompok; h++) { const ks = Object.keys(SVm).filter((k) => k.startsWith('g:' + h + ':')), js = Object.keys(JWm).filter((k) => k.startsWith('g:' + h + ':')), tk = Object.keys(TGm).filter((k) => k.startsWith('g:' + h + ':')), ngg = NGm['g:' + h], gk = ngg ? rata(['isi', 'kedalaman', 'kejelasan', 'kompak'].map((c) => ngg[c]).filter((x) => Number.isFinite(x))) : null; out.ringkas.push({ g: h, suaraN: ks.filter((k) => SVm[k].k).length, suaraRata: rata(ks.map((k) => SVm[k].k).filter((x) => x)), jawabN: js.length, benar: js.filter((k) => JWm[k].benar).length, tgN: tk.length, guru: gk == null ? null : gk * 25 }); }
    if (g != null) {
      const ks = Object.keys(SVm).filter((k) => k.startsWith('g:' + g + ':')), js = Object.keys(JWm).filter((k) => k.startsWith('g:' + g + ':' + s.soalNo + ':'));
      const rp = {}; s.anggota.forEach((a) => { const v = ks.map((k) => SVm[k].p && SVm[k].p[a]).filter((x) => x != null); rp[a] = { n: v.length, rata: rata(v) }; });
      out.suara = { n: ks.filter((k) => SVm[k].k).length, rata: rata(ks.map((k) => SVm[k].k).filter((x) => x)), pembicara: rp }; out.jawab = { n: js.length, benar: js.filter((k) => JWm[k].benar).length };
      out.tanggapan = {}; Object.keys(TGm).filter((k) => k.startsWith('g:' + g + ':')).forEach((k) => { out.tanggapan[k.split(':')[2]] = TGm[k]; }); out.nilai = NGm['g:' + g] || null; out.nilaiI = {}; s.anggota.forEach((a) => { if (NGm['i:' + g + ':' + a] != null) out.nilaiI[a] = NGm['i:' + g + ':' + a]; });
    }
    return kirim(200, out);
  }
  if (b.a === 'g-sd-set') {
    const s = await bacaSD(), nowT = Date.now(), gOk = (v) => Number.isInteger(v) && v >= 0 && v < CFG().jmlKelompok;
    if (b.durasi && typeof b.durasi === 'object') ['presentasi', 'tanya', 'soal', 'soal2', 'tanggapan'].forEach((k) => { const n = Number(b.durasi[k]); if (Number.isFinite(n) && n >= 10 && n <= 1800) s.durasi[k] = Math.round(n); });
    if (typeof b.buka === 'boolean') s.buka = b.buka;
    if (b.berikut !== undefined) s.berikut = gOk(b.berikut) ? b.berikut : null;
    if (gOk(b.giliran) && b.giliran !== s.giliran) { const kl = await ambilKel(); s.giliran = b.giliran; s.anggota = ((kl && kl.kel[b.giliran]) || []).map((x) => x.idx); s.hasil = {}; s.hasilBintang = null; s.soalNo = 1; s.sub = 'jawab'; s.fase = 'siap'; s.mulaiFase = nowT; s.tambah = 0; s.jedaAt = null; s.peran = await peranG(b.giliran); if (s.berikut === b.giliran) s.berikut = null; }
    if (b.nonaktif === true) { s.giliran = null; s.fase = 'siap'; s.anggota = []; s.peran = {}; s.hasil = {}; s.hasilBintang = null; s.mulaiFase = nowT; s.tambah = 0; s.jedaAt = null; }
    if (b.stop === true && s.giliran != null) { s.fase = 'siap'; s.mulaiFase = nowT; s.tambah = 0; s.jedaAt = null; }
    if (gOk(b.kecualiToggle)) { s.kecuali = s.kecuali.includes(b.kecualiToggle) ? s.kecuali.filter((x) => x !== b.kecualiToggle) : s.kecuali.concat([b.kecualiToggle]); }
    if (b.kecualiSemua === false) s.kecuali = [];
    if (b.aksi && s.giliran != null) { const e = await terapkanAksi(s, b.aksi, true); if (e) return kirim(409, { error: e }); }
    if (b.fase && FASE_SD.includes(b.fase) && s.giliran != null) {
      if (b.fase === 'soal') await terapkanAksi(s, 'soal', true); else if (b.fase === 'hasil') await terapkanAksi(s, 'hasil', true); else if (b.fase === 'selesai') await terapkanAksi(s, 'selesai', true); else { gantiFase(s, b.fase); if (b.fase === 'siap') { s.hasil = {}; s.soalNo = 1; s.sub = 'jawab'; } }
    }
    if (b.jeda === true && !s.jedaAt) s.jedaAt = nowT; if (b.jeda === false && s.jedaAt) { s.mulaiFase += nowT - s.jedaAt; s.jedaAt = null; }
    if (Number.isFinite(b.tambahDetik) && Math.abs(b.tambahDetik) <= 600) s.tambah = Math.max(-600, Math.min(1800, (s.tambah || 0) + Math.round(b.tambahDetik)));
    if (b.ulangFase === true && s.giliran != null) { s.mulaiFase = nowT; s.tambah = 0; s.jedaAt = null; }
    if (gOk(b.hapusSelesaiG)) s.selesai = s.selesai.filter((q) => q !== b.hapusSelesaiG);
    if (b.hapusSelesai === true && gOk(b.giliran)) s.selesai = s.selesai.filter((x) => x !== b.giliran);
    await tulisSD(s);
    if (Number.isInteger(b.slide) || Number.isInteger(b.pembicara)) { await redis('SET', K.SL, JSON.stringify({ g: s.giliran, slide: Number.isInteger(b.slide) ? Math.max(0, Math.min(30, b.slide)) : s.slide, pembicara: Number.isInteger(b.pembicara) ? b.pembicara : s.pembicara, t: nowT })); }
    return kirim(200, { ok: true });
  }
  if (b.a === 'g-sd-tanggapan') {
    const g = Number(b.giliran), k = Number(b.kelompok); if (![g, k].every((v) => Number.isInteger(v) && v >= 0 && v < CFG().jmlKelompok) || g === k) return kirim(400, { error: 'tidak-valid' });
    const key = 'g:' + g + ':' + k; if (!b.jenis) { await redis('HDEL', K.TG, key); return kirim(200, { ok: true }); }
    if (!['tanya', 'saran', 'apresiasi'].includes(b.jenis)) return kirim(400, { error: 'jenis' }); const kl = await ambilKel(), oleh = Number.isInteger(b.oleh) && kl && (kl.kel[k] || []).some((m) => m.idx === b.oleh) ? b.oleh : null;
    await redis('HSET', K.TG, key, JSON.stringify({ jenis: b.jenis, oleh, t: Date.now() })); return kirim(200, { ok: true });
  }
  if (b.a === 'g-sd-nilai') {
    const g = Number(b.giliran); if (!Number.isInteger(g) || g < 0 || g >= CFG().jmlKelompok) return kirim(400, { error: 'tidak-valid' }); const n4 = (v) => (Number.isInteger(v) && v >= 0 && v <= 4 ? v : null);
    if (b.kriteria && typeof b.kriteria === 'object') { let cur = {}; try { const o = await redis('HGET', K.NG, 'g:' + g); if (o) cur = JSON.parse(o); } catch (e) { /* abaikan */ } ['isi', 'kedalaman', 'kejelasan', 'kompak'].forEach((c) => { if (n4(b.kriteria[c]) !== null) cur[c] = b.kriteria[c]; }); await redis('HSET', K.NG, 'g:' + g, JSON.stringify(cur)); }
    if (Number.isInteger(b.idx) && n4(b.nilaiI) !== null) await redis('HSET', K.NG, 'i:' + g + ':' + b.idx, JSON.stringify(b.nilaiI));
    return kirim(200, { ok: true });
  }
  if (b.a === 'g-sd-rekap') return kirim(200, Object.assign({ ok: true }, await sdRekap()));
  if (b.a === 'g-salin-kelompok') {
    if (b.dari !== 'xig' || ctx().kl !== 'xig2') return kirim(400, { error: 'tidak-valid' }); const v = await redis('GET', keys('xig').KEL); if (!v) return kirim(409, { error: 'belum-ada-kelompok' });
    const kel = JSON.parse(v).kel.map((g) => g.map((s) => ({ idx: s.idx, skor: 0 }))); await simpanKel({ kel, dibuat: Date.now(), manual: true, salinDari: 'xig' }); return kirim(200, { ok: true, terpasang: kel.flat().length });
  }
  if (b.a === 'g-sd-coret') { const v = await redis('GET', K.CR); let o = null; try { o = v ? JSON.parse(v) : null; } catch (e) { /* abaikan */ } return kirim(200, { ok: true, coret: o }); }
  if (b.a === 'g-sd-peran') {
    const g = Number(b.giliran), idx = Number(b.idx), p = Number(b.peran), kl = await ambilKel(); if (!Number.isInteger(g) || !kl || !(kl.kel[g] || []).some((m) => m.idx === idx) || ![0, 1, 2, 3].includes(p)) return kirim(400, { error: 'tidak-valid' });
    const cur = await simpanPeran(g, idx, p, false); if (!cur) return kirim(409, { error: 'peran-diambil' }); return kirim(200, { ok: true, peran: cur });
  }
  if (b.a === 'g-sd-reset-kelompok') {
    const g = Number(b.giliran); if (!Number.isInteger(g) || g < 0 || g >= CFG().jmlKelompok) return kirim(400, { error: 'tidak-valid' });
    for (const H of [K.SV, K.JW, K.TG, K.NG]) { const m = hmap(await redis('HGETALL', H)); for (const k of Object.keys(m)) { const p = k.split(':'); if ((p[0] === 'g' && +p[1] === g) || (p[0] === 'i' && +p[1] === g)) await redis('HDEL', H, k); } }
    for (const f of ['j:' + g + ':1', 'j:' + g + ':2', 'v:' + g, 't:' + g]) await redis('HDEL', K.CN, f);
    const s = await bacaSD(); s.selesai = s.selesai.filter((x) => x !== g); s.soalSelesai = s.soalSelesai.filter((x) => x !== g); if (s.giliran === g) { s.giliran = null; s.fase = 'siap'; s.anggota = []; s.peran = {}; s.hasil = {}; s.hasilBintang = null; s.mulaiFase = Date.now(); s.tambah = 0; s.jedaAt = null; } if (s.berikut === g) s.berikut = null; await tulisSD(s); await redis('DEL', K.SL); return kirim(200, { ok: true });
  }
  if (b.a === 'g-sd-reset') { await redis('DEL', K.SD, K.SL, K.SV, K.JW, K.TG, K.NG, K.PR, K.CR, K.CN); return kirim(200, { ok: true }); }
  return kirim(400, { error: 'Aksi tidak dikenal' });
}

const handler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const kirim = (kode, o) => { res.statusCode = kode; res.end(JSON.stringify(o)); };
  if (req.method !== 'POST') return kirim(405, { error: 'Gunakan POST' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.a === 'cek') return kirim(200, { ok: true, penyimpanan: !!(URL_REDIS && TOK_REDIS) });
  if (!URL_REDIS || !TOK_REDIS) return kirim(503, { error: 'belum-dikonfigurasi' });
  try {
    /* ---------------- aksi siswa ---------------- */
    if (b.a === 'status') { const s = await semuaSiswa(), kb = !CFG().manual || (await redis('GET', ctx().K.KB)) === '1'; return kirim(200, { ok: true, kelasBuka: kb, manual: CFG().manual, diklaim: Object.keys(s).filter(nyata).map((k) => +k.slice(1)), selesai: Object.keys(s).filter((k) => nyata(k) && s[k].hasil).map((k) => +k.slice(1)) }); }
    if (String(b.a || '').startsWith('sd-')) { if (!CFG().sidang) return kirim(400, { error: 'bukan-kelas-sidang' }); return sdAksiSiswa(b, kirim); }
    if (b.a === 't2s') { const ak = await bacaLangkah(); const pam = Number(await redis('GET', ctx().K.P)) || 0; return kirim(200, { ok: true, buka: ak.length ? Math.max.apply(null, ak) : 0, aktif: ak, pameran: pam, n: NLANGKAH() }); }
    if (['klaim', 'ping', 'hasil', 'kelompok', 't2'].includes(b.a)) {
      const idx = bersihIdx(b.idx); if (idx === null || !b.token) return kirim(400, { error: 'Data tidak lengkap' });
      let d = await ambilSiswa(idx);
      if (b.a === 'klaim' && idx === B.DUMMY) { d = { hasil: null, token: b.token, aktif: Date.now(), tahap: 'masuk' }; await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: null, uji: true }); }
      if (b.a === 'klaim' && CFG().manual && idx !== B.DUMMY && (await redis('GET', ctx().K.KB)) !== '1') return kirim(423, { error: 'kelas-tutup' });
      if (b.a === 'klaim') { if (d && d.token !== b.token) return kirim(409, { error: 'dipakai' }); d = Object.assign({ hasil: null }, d, { token: b.token, aktif: Date.now(), tahap: d && d.tahap || 'masuk' }); await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: d.hasil }); }
      if (!d || d.token !== b.token) return kirim(403, { error: 'tidak-dikenali' });
      if (b.a === 'ping') { d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true }); }
      if (b.a === 'hasil') {
        if (!Array.isArray(b.jawab)) return kirim(400, { error: 'Jawaban tidak valid' });
        const jw = b.jawab.slice(0, 5).map((v) => (Number.isInteger(v) && v >= 0 && v <= 4 ? v : null)), n = B.nilai(idx, jw);
        if (!d.hasil) { d.hasil = { jawab: jw, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: Math.max(0, Math.min(B.durasi(ctx().kl), Number(b.detik) || 0)) }; d.tahap = 'selesai-tes'; await simpanSiswa(idx, d); }
        return kirim(200, { ok: true, benar: d.hasil.benar, kode: B.buatKode(idx, d.hasil.jawab) });
      }
      if (b.a === 't2') {
        const t = b.t2 || {}, u = d.t2 || {}, FAM = Object.keys(B.NAMA_FAM), ok = (v) => FAM.includes(v), n = (v, mx) => (Number.isInteger(v) && v >= 0 && v <= mx ? v : undefined);
        if (Number.isInteger(t.pasangan) && t.pasangan >= 0 && t.pasangan <= 2) u.pasangan = t.pasangan;
        if (t.paham && typeof t.paham === 'object') { u.paham = u.paham || {}; Object.keys(t.paham).filter(ok).forEach((k) => { if (['ya', 'bingung'].includes(t.paham[k])) u.paham[k] = t.paham[k]; }); }
        if (Array.isArray(t.kartu)) u.kartu = t.kartu.filter(ok);
        if (t.cocok && n(t.cocok.benar, 5) !== undefined) u.cocok = { benar: t.cocok.benar, total: 5 };
        if (t.tiket && n(t.tiket.skor, 3) !== undefined) u.tiket = { skor: t.tiket.skor };
        if (Array.isArray(t.kuasai)) u.kuasai = [...new Set(t.kuasai.filter(ok))];
        if (Array.isArray(t.bingung)) u.bingung = [...new Set(t.bingung.filter(ok))].filter((f) => !(u.kuasai || []).includes(f));
        if (t.diskusi && n(t.diskusi.benar, 6) !== undefined) u.diskusi = { benar: t.diskusi.benar, total: Math.min(6, Number(t.diskusi.total) || 6) };
        if (t.fung && n(t.fung.skor, 3) !== undefined) u.fung = { skor: t.fung.skor };
        if (t.pam && n(t.pam.benar, 9) !== undefined) u.pam = { benar: t.pam.benar, peran: ['jaga', 'kelana'].includes(t.pam.peran) ? t.pam.peran : ((u.pam && u.pam.peran) || null) };
        if (n(t.poin, 400) !== undefined) u.poin = t.poin;
        if (Array.isArray(t.lencana)) u.lencana = t.lencana.map((x) => String(x).slice(0, 24)).slice(0, 8);
        if (Array.isArray(t.sel) && t.sel.length === NLANGKAH()) u.sel = t.sel.map((v) => v === true);
        if (t.selesai === true) u.selesai = true; d.t2 = u; d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true });
      }
      if (b.a === 'kelompok') {
        if (!d.hasil && !CFG().manual) { const k0 = await ambilKel(); if (!(k0 && sudahMasuk(k0.kel, idx) >= 0)) return kirim(409, { error: 'belum-selesai' }); }
        if (!d.hasil && CFG().manual && idx !== B.DUMMY) return kirim(409, { error: 'belum-selesai' });
        if (CFG().manual) {
          const gerbangM = (await redis('GET', ctx().K.G)) || 'tutup', kelM = await ambilKel(); if (gerbangM === 'tutup' || !kelM) return kirim(200, { ok: true, menunggu: true });
          if (idx === B.DUMMY) { const k0 = JSON.parse(JSON.stringify(kelM.kel)); k0[0] = (k0[0] || []).concat([{ idx, skor: 0 }]); return kirim(200, { ok: true, kelompok: tampilKel(k0), saya: 0, uji: true }); }
          const gM = sudahMasuk(kelM.kel, idx); if (gM < 0) return kirim(409, { error: 'tanpa-kelompok' }); return kirim(200, { ok: true, kelompok: tampilKel(kelM.kel), saya: gM });
        }
        if (idx === B.DUMMY) { /* akun uji coba: lihat kelompok sementara, tidak disimpan dan tidak mengubah kelompok asli */
          const s0 = await semuaSiswa(), sel0 = selesaiNyata(s0); let k0 = await ambilKel(); k0 = k0 ? { kel: JSON.parse(JSON.stringify(k0.kel)) } : { kel: B.bentukKelompok(sel0) }; const g0 = B.tambahKelompok(k0.kel, { idx, skor: d.hasil.skor }); return kirim(200, { ok: true, kelompok: tampilKel(k0.kel), saya: g0 < 0 ? 0 : g0, uji: true }); }
        const gerbang = (await redis('GET', ctx().K.G)) || 'tutup'; let kel = await ambilKel();
        if (gerbang === 'tutup') return kirim(200, { ok: true, menunggu: true });
        if (!kel) { const s = await semuaSiswa(); kel = { kel: B.bentukKelompok(selesaiNyata(s)), dibuat: Date.now() }; await simpanKel(kel); await arsipkan(kel, 'otomatis', true); }
        let g = sudahMasuk(kel.kel, idx); if (g < 0) { g = B.tambahKelompok(kel.kel, { idx, skor: d.hasil ? d.hasil.skor : 0 }); if (g < 0) return kirim(409, { error: 'penuh' }); await simpanKel(kel); }
        return kirim(200, { ok: true, kelompok: tampilKel(kel.kel), saya: g });
      }
    }
    /* ---------------- aksi guru (butuh PIN) ---------------- */
    if (String(b.a || '').startsWith('g-')) {
      if (!pinOk(b.pin)) return kirim(401, { error: 'PIN salah' });
      if (['g-sd-status', 'g-sd-set', 'g-sd-tanggapan', 'g-sd-nilai', 'g-sd-rekap', 'g-salin-kelompok', 'g-sd-reset', 'g-sd-peran', 'g-sd-reset-kelompok', 'g-sd-coret'].includes(b.a)) { if (!CFG().sidang) return kirim(400, { error: 'bukan-kelas-sidang' }); return sdAksiGuru(b, kirim); }
      if (b.a === 'g-status') {
        const s = await semuaSiswa(), kel = await ambilKel(), gerbang = (await redis('GET', ctx().K.G)) || 'tutup';
        const uji = s['s' + B.DUMMY] ? { klaim: true, tahap: s['s' + B.DUMMY].tahap, skor: s['s' + B.DUMMY].hasil ? s['s' + B.DUMMY].hasil.skor : null } : { klaim: false };
        const FAM = Object.keys(B.NAMA_FAM), agr = {}; FAM.forEach((f) => { agr[f] = { kuasai: 0, bingung: 0 }; }); let cs = 0, cn = 0, ts = 0, tn = 0, ds = 0, dn = 0, sel2 = 0, fsum = 0, fn = 0, pjaga = 0, pkelana = 0; const poinSiswa = [];
        Object.keys(s).filter(nyata).forEach((k) => { const t = s[k].t2; if (!t) return; (t.kuasai || []).forEach((f) => { if (agr[f]) agr[f].kuasai++; }); (t.bingung || []).forEach((f) => { if (agr[f]) agr[f].bingung++; }); if (t.cocok) { cs += t.cocok.benar; cn++; } if (t.tiket) { ts += t.tiket.skor; tn++; } if (t.diskusi) { ds += t.diskusi.benar; dn++; } if (t.selesai) sel2++; if (t.fung) { fsum += t.fung.skor; fn++; } if (t.pam && t.pam.peran === 'jaga') pjaga++; if (t.pam && t.pam.peran === 'kelana') pkelana++; if (t.poin != null) poinSiswa.push({ idx: +k.slice(1), nama: nm(+k.slice(1)), poin: t.poin, lencana: t.lencana || [] }); });
        poinSiswa.sort((x, y) => y.poin - x.poin); const grupPoin = (kel ? kel.kel : []).map((g, gi) => { const p = g.map((m) => (poinSiswa.find((q) => q.idx === m.idx) || {}).poin).filter((v) => v != null); return { kel: gi + 1, n: p.length, total: p.reduce((x, y) => x + y, 0), rata: p.length ? p.reduce((x, y) => x + y, 0) / p.length : 0 }; });
        poinSiswa.forEach((p) => { p.kel = kel ? sudahMasuk(kel.kel, p.idx) + 1 : 0; });
        const aktifL = await bacaLangkah(), langkah = aktifL.length ? Math.max.apply(null, aktifL) : 0, selStep = Array.from({ length: NLANGKAH() }, () => 0); Object.keys(s).filter(nyata).forEach((k) => { const sl = s[k].t2 && s[k].t2.sel; if (sl) sl.forEach((v, i) => { if (v) selStep[i]++; }); });
        const tahap2 = { agr, cocok: cn ? cs / cn : null, cocokN: cn, tiket: tn ? ts / tn : null, tiketN: tn, diskusi: dn ? ds / dn : null, peranJaga: pjaga, peranKelana: pkelana, fung: fn ? fsum / fn : null, selesai: sel2, langkah, aktif: aktifL, selStep, peringkat: poinSiswa.slice(0, 10), grup: grupPoin };
        const daftar = CFG().daftar.map((_, i) => { const d = s['s' + i]; return { idx: i, nama: nm(i), klaim: !!d, aktif: d ? d.aktif : 0, tahap: d ? d.tahap : null, skor: d && d.hasil ? d.hasil.skor : null, detik: d && d.hasil ? d.hasil.detik : null, kel: kel ? sudahMasuk(kel.kel, i) : -1 }; });
        return kirim(200, { ok: true, sekarang: Date.now(), kelas: ctx().kl, manual: CFG().manual, kelasBuka: !CFG().manual || (await redis('GET', ctx().K.KB)) === '1', pameran: Number(await redis('GET', ctx().K.P)) || 0, nLangkah: NLANGKAH(), daftar, uji, tahap2, kelompok: kel ? tampilKel(kel.kel) : null, gerbang });
      }
      if (b.a === 'g-reset') { const idx = bersihIdx(b.idx); if (idx === null) return kirim(400, { error: 'idx' }); await redis('HDEL', ctx().K.S, 's' + idx); const kel = await ambilKel(); if (kel) { kel.kel = kel.kel.map((g) => g.filter((s) => s.idx !== idx)); await simpanKel(kel); } return kirim(200, { ok: true }); }
      if (b.a === 'g-reset-semua') { await redis('DEL', ctx().K.S); await redis('DEL', ctx().K.KEL); await redis('DEL', ctx().K.L); await redis('DEL', ctx().K.G); await redis('DEL', ctx().K.KB); await redis('DEL', ctx().K.P); return kirim(200, { ok: true }); }
      if (b.a === 'g-bentuk' && CFG().manual) return kirim(400, { error: 'kelompok-manual' });
      if (b.a === 'g-bentuk') { const s = await semuaSiswa(); const kel = { kel: B.bentukKelompok(selesaiNyata(s)), dibuat: Date.now() }; await simpanKel(kel); await arsipkan(kel, 'otomatis', true); return kirim(200, { ok: true, kelompok: tampilKel(kel.kel) }); }
      if (b.a === 'g-tambah') { const s = await semuaSiswa(); let kel = await ambilKel(); if (!kel) return kirim(200, { ok: true, ditambah: 0 }); let n = 0; Object.keys(s).filter((k) => nyata(k) && s[k].hasil).forEach((k) => { const idx = +k.slice(1); if (sudahMasuk(kel.kel, idx) < 0 && B.tambahKelompok(kel.kel, { idx, skor: s[k].hasil.skor }) >= 0) n++; }); await simpanKel(kel); if (n) await arsipkan(kel, 'otomatis', true); return kirim(200, { ok: true, ditambah: n }); }
      if (b.a === 'g-hapus-kelompok') { await redis('DEL', ctx().K.KEL); return kirim(200, { ok: true }); }
      if (b.a === 'g-gerbang') { await redis('SET', ctx().K.G, b.buka ? 'buka' : 'tutup'); if (b.buka && !CFG().manual && !(await ambilKel())) { const s = await semuaSiswa(); const k1 = { kel: B.bentukKelompok(selesaiNyata(s)), dibuat: Date.now() }; await simpanKel(k1); await arsipkan(k1, 'otomatis', true); } return kirim(200, { ok: true }); }
      if (b.a === 'g-langkah') {
        const N = NLANGKAH(), sem = Array.from({ length: N }, (_, i) => i + 1), n = Math.max(1, Math.min(N, Number(b.n) || 1)); let ak = await bacaLangkah();
        if (b.buka === true) ak.push(n); else if (b.buka === false) ak = ak.filter((x) => x !== n); else ak = sem.filter((x) => x <= n);   /* tanpa 'buka': cara lama = buka langkah 1..n */
        if (b.semua === true) ak = sem; if (b.semua === false) ak = [];
        await tulisLangkah(ak); return kirim(200, { ok: true, n, aktif: [...new Set(ak)].sort((p, q) => p - q) });
      }
      if (b.a === 'g-set-kelompok') {
        if (!CFG().manual || !Array.isArray(b.kel)) return kirim(400, { error: 'tidak-valid' });
        const J = CFG().jmlKelompok, pakai = new Set(), kel = Array.from({ length: J }, (_, i) => ((Array.isArray(b.kel[i]) ? b.kel[i] : []).map(Number).filter((v) => Number.isInteger(v) && v >= 0 && v < CFG().daftar.length && !pakai.has(v) && pakai.add(v)).map((v) => ({ idx: v, skor: 0 }))));
        await simpanKel({ kel, dibuat: Date.now(), manual: true }); return kirim(200, { ok: true, terpasang: pakai.size });
      }
      if (b.a === 'g-kelas') {
        if (!CFG().manual) return kirim(200, { ok: true }); const kelX = await ambilKel();
        if (b.buka === true) { if (!kelX || !kelX.kel.some((g) => g.length)) return kirim(409, { error: 'belum-ada-kelompok' }); await redis('SET', ctx().K.KB, '1'); await redis('SET', ctx().K.G, 'buka'); } else await redis('SET', ctx().K.KB, '0');
        return kirim(200, { ok: true });
      }
      if (b.a === 'g-pameran') { const n = Math.max(0, Math.min(9, Number(b.n) || 0)); await redis('SET', ctx().K.P, String(n)); return kirim(200, { ok: true, n }); }
      if (b.a === 'g-arsip') { const arr = await ambilArsip(); return kirim(200, { ok: true, arsip: arr.map((x) => ({ id: x.id, t: x.t, label: x.label, n: x.kel.length, total: x.kel.reduce((s, g) => s + g.length, 0), kel: tampilKel(x.kel) })) }); }
      if (b.a === 'g-simpan-kelompok') { const kel = await ambilKel(); if (!kel) return kirim(409, { error: 'belum-ada-kelompok' }); const sn = await arsipkan(kel, String(b.label || 'Disimpan guru').slice(0, 40), false); return kirim(200, { ok: true, id: sn.id }); }
      if (b.a === 'g-muat-kelompok') { const arr = await ambilArsip(), x = arr.find((q) => q.id === b.id); if (!x) return kirim(404, { error: 'tidak-ada' }); await simpanKel({ kel: x.kel.map((g) => g.map((s) => ({ idx: s.idx, skor: s.skor }))), dibuat: Date.now(), dimuat: x.id }); return kirim(200, { ok: true, kelompok: tampilKel(x.kel) }); }
      if (b.a === 'g-hapus-arsip') { const arr = (await ambilArsip()).filter((q) => q.id !== b.id); await redis('SET', ctx().K.A, JSON.stringify(arr)); return kirim(200, { ok: true }); }
      if (b.a === 'g-kode') { const r = B.bacaKode(b.kode); if (r.error) return kirim(200, { error: r.error }); if (r.idx >= CFG().daftar.length) return kirim(200, { error: 'Kode ini bukan milik kelas yang sedang dipilih' }); let d = await ambilSiswa(r.idx) || { token: null, tahap: 'kode' }; const n = B.nilai(r.idx, r.jawab); if (!d.hasil) { d.hasil = { jawab: r.jawab, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: null }; d.tahap = 'selesai-tes'; await simpanSiswa(r.idx, d); } return kirim(200, { ok: true, idx: r.idx, nama: nm(r.idx), benar: n.benar }); }
    }
    return kirim(400, { error: 'Aksi tidak dikenal' });
  } catch (e) { return kirim(500, { error: 'galat-server', pesan: String(e.message || e).slice(0, 120) }); }
};

module.exports = (req, res) => {
  let b = req.body; try { if (typeof b === 'string') b = JSON.parse(b || '{}'); } catch (e) { b = {}; }
  const kl = b && KELAS_OK.includes(b.kelas) ? b.kelas : 'xif';
  return als.run({ kl, K: keys(kl) }, () => handler(req, res));
};
