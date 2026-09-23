# QuickSwap

QuickSwap adalah aplikasi web untuk mengonversi video langsung di browser menggunakan [ffmpeg.wasm](https://ffmpegwasm.netlify.app/). Seluruh pemrosesan dilakukan secara lokal di perangkat pengguna—file video tidak diunggah ke server mana pun.

## Fitur

- Drag-and-drop atau pemilihan file melalui file picker
- Konversi ke MP4, MOV, WebM, AVI, MKV, dan GIF
- Progress bar dan persentase selama konversi
- Download hasil dengan nama file asli dan ekstensi baru
- Validasi file serta pesan error yang mudah dipahami
- Peringatan untuk file berukuran lebih dari 250 MB
- Tampilan responsif untuk desktop dan perangkat mobile
- Tidak memerlukan backend

## Teknologi

- HTML, CSS, dan JavaScript
- Vite
- `@ffmpeg/ffmpeg` dan `@ffmpeg/util`
- `@ffmpeg/core` WebAssembly yang dimuat melalui CDN

## Persyaratan

- Node.js 20.19+ atau 22.12+ (Node.js 24 juga didukung)
- npm
- Browser modern dengan dukungan WebAssembly, seperti Chrome, Edge, Firefox, atau Safari versi terbaru
- Koneksi internet saat pertama kali mesin FFmpeg dimuat dari CDN

## Instalasi dan menjalankan aplikasi

Clone atau buka direktori proyek, kemudian jalankan:

```bash
npm install
npm run dev
```

Buka URL yang ditampilkan oleh Vite, biasanya `http://localhost:5173`.

Jangan membuka `index.html` secara langsung melalui `file://`, karena modul JavaScript, Web Worker, dan WebAssembly harus dijalankan melalui HTTP.

## Production build

Buat build produksi dengan:

```bash
npm run build
```

Hasil build tersimpan di direktori `dist/`. Untuk mengujinya secara lokal:

```bash
npm run preview
```

URL preview biasanya tersedia di `http://localhost:4173`.

Isi direktori `dist/` dapat di-deploy ke layanan static hosting seperti Netlify, Vercel, Cloudflare Pages, GitHub Pages, atau web server biasa. Hosting harus menyajikan aplikasi melalui HTTP/HTTPS, bukan sebagai file lokal.

## Format dan encoding keluaran

QuickSwap melakukan encoding ulang agar hasil lebih mudah diputar di berbagai perangkat.

| Format | Video | Audio | Catatan |
| --- | --- | --- | --- |
| MP4 | H.264, `yuv420p` | AAC stereo 48 kHz | Pilihan paling kompatibel |
| MOV | H.264, `yuv420p` | AAC stereo 48 kHz | Cocok untuk QuickTime dan editor modern |
| WebM | VP9, `yuv420p` | Opus stereo 48 kHz | Cocok untuk penggunaan web |
| AVI | MPEG-4 | MP3 stereo 48 kHz | Format lama; dukungan player dapat berbeda |
| MKV | H.264, `yuv420p` | AAC stereo 48 kHz | Dukungan browser terbatas, gunakan VLC/mpv |
| GIF | GIF 12 FPS | Tanpa audio | Lebar maksimum 720 px |

Resolusi video otomatis disesuaikan menjadi bilangan genap untuk mencegah kegagalan encoder H.264. Subtitle, data stream, dan metadata khusus dari file sumber tidak disalin ke hasil.

## Privasi

Video dibaca dan diproses di memori browser. QuickSwap tidak mempunyai backend dan tidak mengirim file pengguna ke internet. Browser hanya mengunduh FFmpeg WebAssembly core dari jsDelivr ketika mesin konversi pertama kali digunakan.

Hasil konversi disimpan sebagai object URL sementara. Data tersebut dibersihkan saat halaman ditutup atau hasil konversi diganti.

## Performa dan batasan

- Konversi WebAssembly biasanya lebih lambat daripada FFmpeg native.
- File besar membutuhkan RAM yang cukup karena file input dan output diproses di memori browser.
- File di atas 250 MB tetap dapat dicoba, tetapi prosesnya mungkin lambat atau gagal pada perangkat dengan memori terbatas.
- Jangan menutup atau me-refresh tab selama proses konversi.
- Format container yang tersedia tidak menjamin semua codec input dapat dibaca oleh build FFmpeg.
- Core FFmpeg yang dipakai adalah single-thread agar aplikasi dapat berjalan di static hosting tanpa konfigurasi cross-origin isolation.

## Troubleshooting

### Halaman tidak dapat dibuka

Jalankan aplikasi melalui `npm run dev` atau `npm run preview`. Jangan melakukan double-click pada `index.html` atau `dist/index.html`.

### Player menampilkan “unsupported encoding settings”

Konversi ulang file menggunakan versi aplikasi terbaru dan pilih MP4. Preset MP4 menggunakan H.264, AAC, dan pixel format `yuv420p` untuk kompatibilitas yang luas. Pastikan file yang dibuka adalah hasil konversi terbaru, bukan hasil dari build lama.

Jika MP4 terbaru masih tidak dapat diputar, coba VLC atau mpv untuk memastikan apakah masalah berasal dari dukungan codec player. Sertakan format input, format output, browser, dan nama player saat melaporkan masalah.

### Konversi gagal

- Pastikan file sumber tidak rusak dan benar-benar berisi video.
- Coba format MP4 terlebih dahulu.
- Tutup tab atau aplikasi lain jika perangkat kekurangan memori.
- Coba file yang lebih kecil untuk membedakan masalah codec dan keterbatasan memori.
- Buka Developer Tools browser untuk melihat detail error pada Console.

### Mesin FFmpeg tidak dapat dimuat

Pastikan perangkat mempunyai koneksi internet dan CDN jsDelivr tidak diblokir oleh firewall, ad blocker, atau kebijakan jaringan. Untuk penggunaan offline sepenuhnya, file `ffmpeg-core.js` dan `ffmpeg-core.wasm` perlu di-host bersama aplikasi lalu nilai `CORE_BASE` di `src/main.js` disesuaikan.

## Struktur proyek

```text
quick-swap/
├── index.html
├── src/
│   ├── main.js
│   └── style.css
├── package.json
├── package-lock.json
└── README.md
```

## Perintah npm

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server Vite |
| `npm run build` | Membuat production build ke `dist/` |
| `npm run preview` | Menyajikan production build secara lokal |

## Lisensi

Belum ada berkas lisensi yang ditetapkan untuk proyek ini.
