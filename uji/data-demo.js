// Mengisi data demo (bintang, jawaban, tanggapan, nilai) untuk melihat Perayaan dan rekap di server uji lokal.
const B = require('../api/_lib/bersama.js'), P = '00000';
const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ kelas: 'xig2', pin: P }, o)) }).then((r) => r.json());
const S = (a, idx, o) => api(Object.assign({ a, idx, token: 'T' + idx, pin: undefined }, o));
(async () => {
  for (let i = 0; i < 27; i++) await S('klaim', i);
  for (const g of [0, 1, 2]) {
    await api({ a: 'g-sd-set', giliran: g, fase: 'presentasi' }); await api({ a: 'g-sd-set', fase: 'soal' }); const kunci = B.tantanganAcak(B.JENIS[g], B.seedSoal(g)).kunci;
    for (let i = 0; i < 27; i++) if (Math.floor(i / 3) !== g) await S('sd-jawab', i, { j: (i + g) % 4 === 0 ? kunci + 1 : kunci });
    await api({ a: 'g-sd-set', fase: 'hasil' });
    for (let i = 0; i < 27; i++) if (Math.floor(i / 3) !== g) { await S('sd-suara', i, { k: 3 + ((i + g) % 3) }); await S('sd-suara', i, { p: 3 + (i % 3), pembicara: g * 3 }); }
    await api({ a: 'g-sd-set', fase: 'tanggapan' });
    for (let k = 0; k < 9; k++) if (k !== g && k % 2 === 0) await api({ a: 'g-sd-tanggapan', giliran: g, kelompok: k, jenis: 'tanya', oleh: k * 3 });
    await api({ a: 'g-sd-nilai', giliran: g, kriteria: { isi: 4, kedalaman: 3 + (g % 2), kejelasan: 4, kompak: 3 } }); await api({ a: 'g-sd-set', fase: 'selesai' });
  }
  console.log('data demo terisi');
})();
