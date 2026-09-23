# QuickSwap

A private, client-side video converter powered by ffmpeg.wasm. Files are processed entirely in the browser and are never uploaded.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The first conversion downloads the ffmpeg WebAssembly core, so an internet connection is required unless the core files are self-hosted.

## Production build

```bash
npm run build
npm run preview
```

The production output is written to `dist/` and can be deployed to any static host.
