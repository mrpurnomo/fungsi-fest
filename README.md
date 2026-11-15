# Grafik Fungsi

Pembelajaran fungsi untuk **XI-F Soshum** (tablet, landscape saja).

| Halaman | Alamat | Untuk |
|---|---|---|
| Siswa | `/` | pengantar animasi → tes awal 5 soal → kelompok |
| Guru | `/guru` | penjelasan (pengantar yang sama), pantau, kelompok, kode hasil |

## Memasang di Vercel (±5 menit)

1. Vercel → **Add New → Project** → impor repositori ini → **Deploy** (tanpa pengaturan build).
2. Buka proyek → **Storage** → **Create Database** → pilih **Upstash (Redis)** → hubungkan ke proyek.
   Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` (atau `UPSTASH_REDIS_REST_URL/TOKEN`) terisi otomatis.
3. **Settings → Environment Variables** → tambah `GURU_PIN` (4 angka, bawaan `1611` bila tidak diisi).
4. **Deployments → Redeploy** supaya variabel terbaca.
5. Buka `/guru`, masukkan PIN. Chip **Server aktif** berarti semuanya tersambung.

Tanpa langkah 2–4 aplikasi tetap berjalan dalam **mode mandiri**: nama tidak dikunci, hasil diserahkan lewat **kode 5 karakter**
yang dimasukkan guru di tab *Kode hasil*, dan kelompok disusun di halaman guru.

## Struktur

- `index.html`, `guru.html` — halaman mandiri hasil bangun (`node sumber/bangun.js`); tidak butuh internet setelah termuat.
- `api/app.js` — fungsi serverless (Upstash Redis lewat REST, tanpa pustaka).
- `api/_lib/bersama.js` — daftar kelas, soal acak per siswa, kode hasil, pembentukan kelompok (dipakai peramban dan server).
- `sumber/` — sumber (HTML/CSS/JS), font berlisensi OFL.
- `cadangan/Grafik-Fungsi-siswa.html` — salinan halaman siswa untuk dibagikan lewat WhatsApp/Bluetooth.

## Catatan

- Kunci jawaban tes awal ikut dalam berkas halaman (diagnostik, bukan ujian). Siswa yang membuka kode sumber bisa melihatnya.
- Mengatur ulang nama siswa: halaman guru → **Pantau** → ketuk nama → *Atur ulang*.
