# QuickSwap

QuickSwap is a web application for converting videos directly in the browser using [ffmpeg.wasm](https://ffmpegwasm.netlify.app/). All processing happens locally on the user's device—video files are never uploaded to a server.

## Features

- Drag-and-drop area and file picker
- Conversion to MP4, MOV, WebM, AVI, MKV, and GIF
- Progress bar and percentage during conversion
- Downloads using the original filename with the new extension
- File validation and clear error messages
- Warning for files larger than 250 MB
- Responsive interface for desktop and mobile devices
- No backend required

## Technology

- HTML, CSS, and JavaScript
- Vite
- `@ffmpeg/ffmpeg` and `@ffmpeg/util`
- `@ffmpeg/core` WebAssembly loaded from a CDN

## Requirements

- Node.js 20.19+ or 22.12+ (Node.js 24 is also supported)
- npm
- A modern browser with WebAssembly support, such as a recent version of Chrome, Edge, Firefox, or Safari
- An internet connection when the FFmpeg engine is first loaded from the CDN

## Installation and local development

Clone or open the project directory, then run:

```bash
npm install
npm run dev
```

Open the URL displayed by Vite, usually `http://localhost:5173`.

Do not open `index.html` directly through `file://`. JavaScript modules, Web Workers, and WebAssembly must be served over HTTP.

## Production build

Create a production build with:

```bash
npm run build
```

The build output is written to the `dist/` directory. To test it locally:

```bash
npm run preview
```

The preview is usually available at `http://localhost:4173`.

The contents of `dist/` can be deployed to a static hosting service such as Netlify, Vercel, Cloudflare Pages, GitHub Pages, or a regular web server. The application must be served over HTTP/HTTPS rather than opened as a local file.

## Output formats and encoding

QuickSwap re-encodes videos to make the output easier to play across different devices.

| Format | Video | Audio | Notes |
| --- | --- | --- | --- |
| MP4 | H.264, `yuv420p` | AAC stereo 48 kHz | Most compatible option |
| MOV | H.264, `yuv420p` | AAC stereo 48 kHz | Suitable for QuickTime and modern editors |
| WebM | VP9, `yuv420p` | Opus stereo 48 kHz | Suitable for web use |
| AVI | MPEG-4 | MP3 stereo 48 kHz | Legacy format; player support varies |
| MKV | H.264, `yuv420p` | AAC stereo 48 kHz | Limited browser support; use VLC or mpv |
| GIF | GIF at 12 FPS | No audio | Maximum width of 720 px |

Video dimensions are automatically adjusted to even numbers to prevent H.264 encoder failures. Subtitles, data streams, and custom metadata from the source file are not copied to the output.

## Privacy

Videos are read and processed in browser memory. QuickSwap has no backend and does not send user files over the internet. The browser only downloads the FFmpeg WebAssembly core from jsDelivr when the conversion engine is first used.

Converted files are stored as temporary object URLs. This data is cleared when the page is closed or the conversion result is replaced.

## Performance and limitations

- WebAssembly conversion is generally slower than native FFmpeg.
- Large files require sufficient RAM because both input and output are processed in browser memory.
- Files larger than 250 MB can still be attempted, but conversion may be slow or fail on devices with limited memory.
- Do not close or refresh the tab during conversion.
- Supporting a container format does not guarantee that every input codec can be decoded by the FFmpeg build.
- QuickSwap uses the single-thread FFmpeg core so it can run on static hosting without cross-origin isolation configuration.

## Troubleshooting

### The page does not open

Run the application with `npm run dev` or `npm run preview`. Do not double-click `index.html` or `dist/index.html`.

### The player reports “unsupported encoding settings”

Convert the file again using the latest version of the application and select MP4. The MP4 preset uses H.264, AAC, and the `yuv420p` pixel format for broad compatibility. Make sure you open the latest converted file rather than an output created by an older build.

If the latest MP4 still cannot be played, try VLC or mpv to determine whether the problem is caused by the player's codec support. Include the input format, output format, browser, and player name when reporting an issue.

### Conversion fails

- Make sure the source file is not damaged and contains a valid video stream.
- Try MP4 first.
- Close other tabs or applications if the device is low on memory.
- Try a smaller file to distinguish codec problems from memory limitations.
- Open the browser's Developer Tools and check the Console for detailed errors.

### The FFmpeg engine cannot be loaded

Make sure the device has an internet connection and that the jsDelivr CDN is not blocked by a firewall, ad blocker, or network policy. For fully offline use, host `ffmpeg-core.js` and `ffmpeg-core.wasm` with the application and update the `CORE_BASE` value in `src/main.js`.

## Project structure

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

## npm commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## License

QuickSwap is released under the [MIT License](LICENSE). Anyone may use, copy,
modify, merge, publish, distribute, sublicense, or sell copies of the software,
provided that the copyright notice and license text are included.
