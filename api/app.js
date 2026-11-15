/* Fungsi serverless Vercel: satu titik masuk /api/app (POST {a: aksi, ...}).
   Penyimpanan: Upstash Redis lewat REST (tanpa pustaka). Variabel lingkungan yang dipakai:
   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (atau KV_REST_API_URL + KV_REST_API_TOKEN)  dan  GURU_PIN. */
const B = require('./_lib/bersama.js');

// Nama variabel bisa berawalan apa pun (KV_, UPSTASH_REDIS_, STORAGE_, ...): cari yang berakhiran REST_API_URL / REST_URL dan *_TOKEN.
const cariEnv = (akhir, jangan) => { const k = Object.keys(process.env).find((n) => n.endsWith(akhir) && !(jangan && n.includes(jangan))); return k ? process.env[k] : undefined; };
const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || cariEnv('REST_API_URL') || cariEnv('REDIS_REST_URL');
const TOK_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || cariEnv('REST_API_TOKEN', 'READ_ONLY') || cariEnv('REDIS_REST_TOKEN');
const PINS = [String(process.env.GURU_PIN || ''), B.PIN_GURU].filter(Boolean);   // PIN bawaan selalu berlaku, GURU_PIN (jika ada) juga berlaku
const pinOk = (p) => PINS.includes(String(p));
const K_SISWA = 'gf:xif:siswa', K_KEL = 'gf:xif:kelompok', K_GERBANG = 'gf:xif:gerbang';

async function redis(...cmd) {
  const r = await fetch(URL_REDIS, { method: 'POST', headers: { Authorization: 'Bearer ' + TOK_REDIS, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json(); if (j.error) throw new Error(j.error); return j.result;
}
async function semuaSiswa() { const arr = (await redis('HGETALL', K_SISWA)) || [], out = {}; for (let i = 0; i < arr.length; i += 2) { try { out[arr[i]] = JSON.parse(arr[i + 1]); } catch (e) { /* abaikan */ } } return out; }
async function ambilSiswa(idx) { const v = await redis('HGET', K_SISWA, 's' + idx); return v ? JSON.parse(v) : null; }
async function simpanSiswa(idx, d) { await redis('HSET', K_SISWA, 's' + idx, JSON.stringify(d)); }
async function ambilKel() { const v = await redis('GET', K_KEL); return v ? JSON.parse(v) : null; }
async function simpanKel(k) { await redis('SET', K_KEL, JSON.stringify(k)); }
const bersihIdx = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= B.DUMMY ? n : null; };
const nyata = (k) => +k.slice(1) < B.DAFTAR.length;   // tanpa akun uji coba
const selesaiNyata = (s) => Object.keys(s).filter((k) => nyata(k) && s[k].hasil).map((k) => ({ idx: +k.slice(1), skor: s[k].hasil.skor }));
const sudahMasuk = (kel, idx) => { for (let g = 0; g < kel.length; g++) if (kel[g].some((s) => s.idx === idx)) return g; return -1; };
const tampilKel = (kel) => kel.map((g) => g.map((s) => ({ idx: s.idx, nama: B.nama(s.idx) })));

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store'); res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const kirim = (kode, o) => { res.statusCode = kode; res.end(JSON.stringify(o)); };
  if (req.method !== 'POST') return kirim(405, { error: 'Gunakan POST' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  if (b.a === 'cek') return kirim(200, { ok: true, penyimpanan: !!(URL_REDIS && TOK_REDIS) });
  if (!URL_REDIS || !TOK_REDIS) return kirim(503, { error: 'belum-dikonfigurasi' });
  try {
    /* ---------------- aksi siswa ---------------- */
    if (b.a === 'status') { const s = await semuaSiswa(); return kirim(200, { ok: true, diklaim: Object.keys(s).filter(nyata).map((k) => +k.slice(1)), selesai: Object.keys(s).filter((k) => nyata(k) && s[k].hasil).map((k) => +k.slice(1)) }); }
    if (['klaim', 'ping', 'hasil', 'kelompok', 't2'].includes(b.a)) {
      const idx = bersihIdx(b.idx); if (idx === null || !b.token) return kirim(400, { error: 'Data tidak lengkap' });
      let d = await ambilSiswa(idx);
      if (b.a === 'klaim' && idx === B.DUMMY) { d = { hasil: null, token: b.token, aktif: Date.now(), tahap: 'masuk' }; await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: null, uji: true }); }
      if (b.a === 'klaim') { if (d && d.token !== b.token) return kirim(409, { error: 'dipakai' }); d = Object.assign({ hasil: null }, d, { token: b.token, aktif: Date.now(), tahap: d && d.tahap || 'masuk' }); await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: d.hasil }); }
      if (!d || d.token !== b.token) return kirim(403, { error: 'tidak-dikenali' });
      if (b.a === 'ping') { d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true }); }
      if (b.a === 'hasil') {
        if (!Array.isArray(b.jawab)) return kirim(400, { error: 'Jawaban tidak valid' });
        const jw = b.jawab.slice(0, 5).map((v) => (Number.isInteger(v) && v >= 0 && v <= 4 ? v : null)), n = B.nilai(idx, jw);
        if (!d.hasil) { d.hasil = { jawab: jw, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: Math.max(0, Math.min(B.DURASI, Number(b.detik) || 0)) }; d.tahap = 'selesai-tes'; await simpanSiswa(idx, d); }
        return kirim(200, { ok: true, benar: d.hasil.benar, kode: B.buatKode(idx, d.hasil.jawab) });
      }
      if (b.a === 't2') {
        const t = b.t2 || {}, u = d.t2 || {}, FAM = Object.keys(B.NAMA_FAM), ok = (v) => FAM.includes(v), n = (v, mx) => (Number.isInteger(v) && v >= 0 && v <= mx ? v : undefined);
        if (Number.isInteger(t.pasangan) && t.pasangan >= 0 && t.pasangan <= 2) u.pasangan = t.pasangan;
        if (t.paham && typeof t.paham === 'object') { u.paham = u.paham || {}; Object.keys(t.paham).filter(ok).forEach((k) => { if (['ya', 'bingung'].includes(t.paham[k])) u.paham[k] = t.paham[k]; }); }
        if (Array.isArray(t.kartu)) u.kartu = t.kartu.filter(ok);
        if (t.cocok && n(t.cocok.benar, 5) !== undefined) u.cocok = { benar: t.cocok.benar, total: 5 };
        if (t.tiket && n(t.tiket.skor, 3) !== undefined) u.tiket = { skor: t.tiket.skor };
        if (t.ref && typeof t.ref === 'object') u.ref = { mudah: ok(t.ref.mudah) ? t.ref.mudah : null, bingung: ok(t.ref.bingung) ? t.ref.bingung : null };
        if (t.selesai === true) u.selesai = true; d.t2 = u; d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true });
      }
      if (b.a === 'kelompok') {
        if (!d.hasil) return kirim(409, { error: 'belum-selesai' });
        if (idx === B.DUMMY) { /* akun uji coba: lihat kelompok sementara, tidak disimpan dan tidak mengubah kelompok asli */
          const s0 = await semuaSiswa(), sel0 = selesaiNyata(s0); let k0 = await ambilKel(); k0 = k0 ? { kel: JSON.parse(JSON.stringify(k0.kel)) } : { kel: B.bentukKelompok(sel0) }; const g0 = B.tambahKelompok(k0.kel, { idx, skor: d.hasil.skor }); return kirim(200, { ok: true, kelompok: tampilKel(k0.kel), saya: g0 < 0 ? 0 : g0, uji: true }); }
        const gerbang = await redis('GET', K_GERBANG); let kel = await ambilKel();
        if (!kel && gerbang === 'tutup') return kirim(200, { ok: true, menunggu: true });
        if (!kel) { const s = await semuaSiswa(); kel = { kel: B.bentukKelompok(selesaiNyata(s)), dibuat: Date.now() }; await simpanKel(kel); }
        let g = sudahMasuk(kel.kel, idx); if (g < 0) { g = B.tambahKelompok(kel.kel, { idx, skor: d.hasil.skor }); if (g < 0) return kirim(409, { error: 'penuh' }); await simpanKel(kel); }
        return kirim(200, { ok: true, kelompok: tampilKel(kel.kel), saya: g });
      }
    }
    /* ---------------- aksi guru (butuh PIN) ---------------- */
    if (String(b.a || '').startsWith('g-')) {
      if (!pinOk(b.pin)) return kirim(401, { error: 'PIN salah' });
      if (b.a === 'g-status') {
        const s = await semuaSiswa(), kel = await ambilKel(), gerbang = (await redis('GET', K_GERBANG)) || 'buka';
        const uji = s['s' + B.DUMMY] ? { klaim: true, tahap: s['s' + B.DUMMY].tahap, skor: s['s' + B.DUMMY].hasil ? s['s' + B.DUMMY].hasil.skor : null } : { klaim: false };
        const FAM = Object.keys(B.NAMA_FAM), agr = {}; FAM.forEach((f) => { agr[f] = { paham: 0, bingung: 0, mudah: 0, ref: 0 }; }); let cs = 0, cn = 0, ts = 0, tn = 0, sel2 = 0;
        Object.keys(s).filter(nyata).forEach((k) => { const t = s[k].t2; if (!t) return; if (t.paham) Object.keys(t.paham).forEach((f) => { if (agr[f]) agr[f][t.paham[f] === 'ya' ? 'paham' : 'bingung']++; }); if (t.ref) { if (agr[t.ref.bingung]) agr[t.ref.bingung].ref++; if (agr[t.ref.mudah]) agr[t.ref.mudah].mudah++; } if (t.cocok) { cs += t.cocok.benar; cn++; } if (t.tiket) { ts += t.tiket.skor; tn++; } if (t.selesai) sel2++; });
        const tahap2 = { agr, cocok: cn ? cs / cn : null, cocokN: cn, tiket: tn ? ts / tn : null, tiketN: tn, selesai: sel2 };
        const daftar = B.DAFTAR.map((_, i) => { const d = s['s' + i]; return { idx: i, nama: B.nama(i), klaim: !!d, aktif: d ? d.aktif : 0, tahap: d ? d.tahap : null, skor: d && d.hasil ? d.hasil.skor : null, detik: d && d.hasil ? d.hasil.detik : null, kel: kel ? sudahMasuk(kel.kel, i) : -1 }; });
        return kirim(200, { ok: true, sekarang: Date.now(), daftar, uji, tahap2, kelompok: kel ? tampilKel(kel.kel) : null, gerbang });
      }
      if (b.a === 'g-reset') { const idx = bersihIdx(b.idx); if (idx === null) return kirim(400, { error: 'idx' }); await redis('HDEL', K_SISWA, 's' + idx); const kel = await ambilKel(); if (kel) { kel.kel = kel.kel.map((g) => g.filter((s) => s.idx !== idx)); await simpanKel(kel); } return kirim(200, { ok: true }); }
      if (b.a === 'g-reset-semua') { await redis('DEL', K_SISWA); await redis('DEL', K_KEL); return kirim(200, { ok: true }); }
      if (b.a === 'g-bentuk') { const s = await semuaSiswa(); const kel = { kel: B.bentukKelompok(selesaiNyata(s)), dibuat: Date.now() }; await simpanKel(kel); return kirim(200, { ok: true, kelompok: tampilKel(kel.kel) }); }
      if (b.a === 'g-tambah') { const s = await semuaSiswa(); let kel = await ambilKel(); if (!kel) return kirim(200, { ok: true, ditambah: 0 }); let n = 0; Object.keys(s).filter((k) => nyata(k) && s[k].hasil).forEach((k) => { const idx = +k.slice(1); if (sudahMasuk(kel.kel, idx) < 0 && B.tambahKelompok(kel.kel, { idx, skor: s[k].hasil.skor }) >= 0) n++; }); await simpanKel(kel); return kirim(200, { ok: true, ditambah: n }); }
      if (b.a === 'g-hapus-kelompok') { await redis('DEL', K_KEL); return kirim(200, { ok: true }); }
      if (b.a === 'g-gerbang') { await redis('SET', K_GERBANG, b.buka ? 'buka' : 'tutup'); return kirim(200, { ok: true }); }
      if (b.a === 'g-kode') { const r = B.bacaKode(b.kode); if (r.error) return kirim(200, { error: r.error }); let d = await ambilSiswa(r.idx) || { token: null, tahap: 'kode' }; const n = B.nilai(r.idx, r.jawab); if (!d.hasil) { d.hasil = { jawab: r.jawab, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: null }; d.tahap = 'selesai-tes'; await simpanSiswa(r.idx, d); } return kirim(200, { ok: true, idx: r.idx, nama: B.nama(r.idx), benar: n.benar }); }
    }
    return kirim(400, { error: 'Aksi tidak dikenal' });
  } catch (e) { return kirim(500, { error: 'galat-server', pesan: String(e.message || e).slice(0, 120) }); }
};
