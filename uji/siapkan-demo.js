// Menyiapkan data demo di server uji lokal: kelompok xig disalin ke xig2, kelas dibuka.
const P = '00000', api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(o) }).then((r) => r.json());
(async () => { const kel = Array.from({ length: 9 }, (_, g) => [g * 3, g * 3 + 1, g * 3 + 2]); await api({ a: 'g-set-kelompok', pin: P, kelas: 'xig', kel }); console.log(await api({ a: 'g-salin-kelompok', pin: P, kelas: 'xig2', dari: 'xig' }), await api({ a: 'g-kelas', pin: P, kelas: 'xig2', buka: true })); })();
