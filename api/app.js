/* Fungsi serverless Vercel: satu titik masuk /api/app (POST {a: aksi, ...}).
   Penyimpanan: Upstash Redis lewat REST (tanpa pustaka). Variabel lingkungan yang dipakai:
   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN  (atau KV_REST_API_URL + KV_REST_API_TOKEN)  dan  GURU_PIN. */
const B = require('./_lib/bersama.js');

const URL_REDIS = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOK_REDIS = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const PIN = String(process.env.GURU_PIN || '1611');
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
const bersihIdx = (v) => { const n = Number(v); return Number.isInteger(n) && n >= 0 && n < B.DAFTAR.length ? n : null; };
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
    if (b.a === 'status') { const s = await semuaSiswa(); return kirim(200, { ok: true, diklaim: Object.keys(s).map((k) => +k.slice(1)), selesai: Object.keys(s).filter((k) => s[k].hasil).map((k) => +k.slice(1)) }); }
    if (['klaim', 'ping', 'hasil', 'kelompok'].includes(b.a)) {
      const idx = bersihIdx(b.idx); if (idx === null || !b.token) return kirim(400, { error: 'Data tidak lengkap' });
      let d = await ambilSiswa(idx);
      if (b.a === 'klaim') { if (d && d.token !== b.token) return kirim(409, { error: 'dipakai' }); d = Object.assign({ hasil: null }, d, { token: b.token, aktif: Date.now(), tahap: d && d.tahap || 'masuk' }); await simpanSiswa(idx, d); return kirim(200, { ok: true, hasil: d.hasil }); }
      if (!d || d.token !== b.token) return kirim(403, { error: 'tidak-dikenali' });
      if (b.a === 'ping') { d.aktif = Date.now(); if (b.tahap) d.tahap = String(b.tahap).slice(0, 20); await simpanSiswa(idx, d); return kirim(200, { ok: true }); }
      if (b.a === 'hasil') {
        if (!Array.isArray(b.jawab)) return kirim(400, { error: 'Jawaban tidak valid' });
        const jw = b.jawab.slice(0, 5).map((v) => (Number.isInteger(v) && v >= 0 && v <= 4 ? v : null)), n = B.nilai(idx, jw);
        if (!d.hasil) { d.hasil = { jawab: jw, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: Math.max(0, Math.min(B.DURASI, Number(b.detik) || 0)) }; d.tahap = 'selesai-tes'; await simpanSiswa(idx, d); }
        return kirim(200, { ok: true, benar: d.hasil.benar, kode: B.buatKode(idx, d.hasil.jawab) });
      }
      if (b.a === 'kelompok') {
        if (!d.hasil) return kirim(409, { error: 'belum-selesai' });
        const gerbang = await redis('GET', K_GERBANG); let kel = await ambilKel();
        if (!kel && gerbang === 'tutup') return kirim(200, { ok: true, menunggu: true });
        if (!kel) { const s = await semuaSiswa(), sel = Object.keys(s).filter((k) => s[k].hasil).map((k) => ({ idx: +k.slice(1), skor: s[k].hasil.skor })); kel = { kel: B.bentukKelompok(sel), dibuat: Date.now() }; await simpanKel(kel); }
        let g = sudahMasuk(kel.kel, idx); if (g < 0) { g = B.tambahKelompok(kel.kel, { idx, skor: d.hasil.skor }); if (g < 0) return kirim(409, { error: 'penuh' }); await simpanKel(kel); }
        return kirim(200, { ok: true, kelompok: tampilKel(kel.kel), saya: g });
      }
    }
    /* ---------------- aksi guru (butuh PIN) ---------------- */
    if (String(b.a || '').startsWith('g-')) {
      if (String(b.pin) !== PIN) return kirim(401, { error: 'PIN salah' });
      if (b.a === 'g-status') {
        const s = await semuaSiswa(), kel = await ambilKel(), gerbang = (await redis('GET', K_GERBANG)) || 'buka';
        const daftar = B.DAFTAR.map((_, i) => { const d = s['s' + i]; return { idx: i, nama: B.nama(i), klaim: !!d, aktif: d ? d.aktif : 0, tahap: d ? d.tahap : null, skor: d && d.hasil ? d.hasil.skor : null, detik: d && d.hasil ? d.hasil.detik : null, kel: kel ? sudahMasuk(kel.kel, i) : -1 }; });
        return kirim(200, { ok: true, sekarang: Date.now(), daftar, kelompok: kel ? tampilKel(kel.kel) : null, gerbang });
      }
      if (b.a === 'g-reset') { const idx = bersihIdx(b.idx); if (idx === null) return kirim(400, { error: 'idx' }); await redis('HDEL', K_SISWA, 's' + idx); const kel = await ambilKel(); if (kel) { kel.kel = kel.kel.map((g) => g.filter((s) => s.idx !== idx)); await simpanKel(kel); } return kirim(200, { ok: true }); }
      if (b.a === 'g-reset-semua') { await redis('DEL', K_SISWA); await redis('DEL', K_KEL); return kirim(200, { ok: true }); }
      if (b.a === 'g-bentuk') { const s = await semuaSiswa(), sel = Object.keys(s).filter((k) => s[k].hasil).map((k) => ({ idx: +k.slice(1), skor: s[k].hasil.skor })); const kel = { kel: B.bentukKelompok(sel), dibuat: Date.now() }; await simpanKel(kel); return kirim(200, { ok: true, kelompok: tampilKel(kel.kel) }); }
      if (b.a === 'g-tambah') { const s = await semuaSiswa(); let kel = await ambilKel(); if (!kel) return kirim(200, { ok: true, ditambah: 0 }); let n = 0; Object.keys(s).filter((k) => s[k].hasil).forEach((k) => { const idx = +k.slice(1); if (sudahMasuk(kel.kel, idx) < 0 && B.tambahKelompok(kel.kel, { idx, skor: s[k].hasil.skor }) >= 0) n++; }); await simpanKel(kel); return kirim(200, { ok: true, ditambah: n }); }
      if (b.a === 'g-hapus-kelompok') { await redis('DEL', K_KEL); return kirim(200, { ok: true }); }
      if (b.a === 'g-gerbang') { await redis('SET', K_GERBANG, b.buka ? 'buka' : 'tutup'); return kirim(200, { ok: true }); }
      if (b.a === 'g-kode') { const r = B.bacaKode(b.kode); if (r.error) return kirim(200, { error: r.error }); let d = await ambilSiswa(r.idx) || { token: null, tahap: 'kode' }; const n = B.nilai(r.idx, r.jawab); if (!d.hasil) { d.hasil = { jawab: r.jawab, benar: n.benar, skor: n.benar, waktu: Date.now(), detik: null }; d.tahap = 'selesai-tes'; await simpanSiswa(r.idx, d); } return kirim(200, { ok: true, idx: r.idx, nama: B.nama(r.idx), benar: n.benar }); }
    }
    return kirim(400, { error: 'Aksi tidak dikenal' });
  } catch (e) { return kirim(500, { error: 'galat-server', pesan: String(e.message || e).slice(0, 120) }); }
};
