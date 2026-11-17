// Pembantu uji tangan: node uji/geser.js <giliran> <fase> [slide]
const P = '00000', a = process.argv; const api = (o) => fetch('http://localhost:3200/api/app', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ pin: P, kelas: 'xig2' }, o)) }).then((r) => r.json());
(async () => { const o = { a: 'g-sd-set' }; if (a[2] !== '-') o.giliran = +a[2]; if (a[3] && a[3] !== '-') o.fase = a[3]; if (a[4]) o.slide = +a[4]; console.log(await api(o)); })();
