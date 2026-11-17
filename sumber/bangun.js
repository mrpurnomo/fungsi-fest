// Menyatukan sumber menjadi halaman mandiri: ../index.html (siswa) dan ../guru.html (guru). Jalankan: node sumber/bangun.js
const fs = require('fs'), path = require('path');
const S = __dirname, R = path.join(S, '..'); const baca = (f) => fs.readFileSync(path.join(S, f), 'utf8');
const font = (f) => 'url(data:font/ttf;base64,' + fs.readFileSync(path.join(S, 'fonts', f)).toString('base64') + ')';
const fonts = '@font-face{font-family:"Bricolage";font-weight:700;font-display:swap;src:' + font('BricolageGrotesque-Bold.ttf') + '}@font-face{font-family:"Bricolage";font-weight:400;font-display:swap;src:' + font('BricolageGrotesque-Bold.ttf') + '}@font-face{font-family:"Instrument";font-weight:400;font-display:swap;src:' + font('InstrumentSans-Regular.ttf') + '}@font-face{font-family:"Instrument";font-weight:700;font-display:swap;src:' + font('InstrumentSans-Bold.ttf') + '}' + '@font-face{font-family:"Lora Math";font-style:italic;font-weight:400;font-display:swap;src:' + font('Lora-Italic.ttf') + '}';
const css = ['tema.css', 'intro.css', 'layar.css', 'guru.css', 'tahap2.css', 'sidang.css', 'sidang2.css', 'sidang3.css', 'sidang4.css'].map(baca).join('\n');
const bersama = fs.readFileSync(path.join(R, 'api', '_lib', 'bersama.js'), 'utf8');
function rakit(judul, jsAkhir, keluar, tambahan) {
  const js = [baca('ui.js'), baca('grafik.js'), bersama, baca('intro.js')].concat((tambahan || []).map(baca), [baca(jsAkhir)]).join('\n;\n');
  const h = baca('halaman.html').replace('@JUDUL@', judul).replace('/*@FONTS*/', () => fonts).replace('/*@CSS*/', () => css).replace('/*@JS*/', () => js);
  fs.writeFileSync(path.join(R, keluar), h); console.log(keluar.padEnd(28), (Buffer.byteLength(h) / 1024).toFixed(0) + ' KB');
}
rakit('Grafik Fungsi', 'siswa.js', 'index.html', ['tahap2.js', 'catatan.js', 'sidangdek.js', 'sidangcoret.js', 'sidangcatatan.js', 'sidang.js']); rakit('Grafik Fungsi — Guru', 'guru.js', 'guru.html', ['cetak.js', 'sidangdek.js', 'sidangcoret.js', 'sidangcatatan.js', 'sidang.js']);
fs.mkdirSync(path.join(R, 'cadangan'), { recursive: true }); fs.copyFileSync(path.join(R, 'index.html'), path.join(R, 'cadangan', 'Grafik-Fungsi-siswa.html'));
