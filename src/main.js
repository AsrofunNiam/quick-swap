import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './style.css';

const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
const LARGE_FILE_BYTES = 250 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'mpeg', 'mpg', 'ogv'];

const elements = {
  dropZone: document.querySelector('#drop-zone'),
  fileInput: document.querySelector('#file-input'),
  browseButton: document.querySelector('#browse-button'),
  fileCard: document.querySelector('#file-card'),
  fileName: document.querySelector('#file-name'),
  fileSize: document.querySelector('#file-size'),
  removeFile: document.querySelector('#remove-file'),
  format: document.querySelector('#format-select'),
  convert: document.querySelector('#convert-button'),
  statusPanel: document.querySelector('#status-panel'),
  statusText: document.querySelector('#status-text'),
  progressValue: document.querySelector('#progress-value'),
  progressBar: document.querySelector('#progress-bar'),
  progressTrack: document.querySelector('.progress-track'),
  message: document.querySelector('#message'),
  download: document.querySelector('#download-button'),
};

let selectedFile = null;
let ffmpeg = null;
let ffmpegLoaded = false;
let downloadUrl = null;

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function extensionOf(name) {
  return name.includes('.') ? name.split('.').pop().toLowerCase() : '';
}

function showMessage(text, type = 'error') {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`;
}

function hideMessage() {
  elements.message.className = 'message hidden';
}

function resetDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
  elements.download.classList.add('hidden');
  elements.download.removeAttribute('href');
}

function setProgress(value, text) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  elements.progressBar.style.width = `${percent}%`;
  elements.progressValue.textContent = `${percent}%`;
  elements.progressTrack.setAttribute('aria-valuenow', String(percent));
  if (text) elements.statusText.textContent = text;
}

function selectFile(file) {
  hideMessage();
  resetDownload();
  const extension = extensionOf(file.name);
  const looksLikeVideo = file.type.startsWith('video/') || SUPPORTED_EXTENSIONS.includes(extension);
  if (!looksLikeVideo) {
    showMessage('That file does not look like a supported video. Choose an MP4, MOV, WebM, AVI, or MKV file.');
    return;
  }

  selectedFile = file;
  elements.fileName.textContent = file.name;
  elements.fileSize.textContent = formatBytes(file.size);
  elements.fileCard.classList.remove('hidden');
  elements.dropZone.classList.add('has-file');
  elements.convert.disabled = false;
  elements.statusPanel.classList.add('hidden');

  if (file.size > LARGE_FILE_BYTES) {
    showMessage(`This is a large file (${formatBytes(file.size)}). Conversion will use significant memory and may take several minutes.`, 'warning');
  }
}

function clearFile() {
  selectedFile = null;
  elements.fileInput.value = '';
  elements.fileCard.classList.add('hidden');
  elements.dropZone.classList.remove('has-file');
  elements.convert.disabled = true;
  elements.statusPanel.classList.add('hidden');
  hideMessage();
  resetDownload();
}

async function loadFFmpeg() {
  if (ffmpegLoaded) return;
  setProgress(2, 'Loading conversion engine…');
  ffmpeg = new FFmpeg();
  ffmpeg.on('progress', ({ progress }) => setProgress(progress * 100, 'Converting your video…'));
  await ffmpeg.load({
    coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  ffmpegLoaded = true;
}

function outputArguments(format, outputName) {
  const presets = {
    mp4: ['-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-movflags', '+faststart'],
    mov: ['-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac'],
    webm: ['-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '6', '-c:a', 'libopus'],
    avi: ['-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'mp3'],
    mkv: ['-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac'],
    gif: ['-vf', 'fps=12,scale=720:-1:flags=lanczos', '-loop', '0'],
  };
  return [...presets[format], outputName];
}

async function convertVideo() {
  if (!selectedFile) return;
  const file = selectedFile;
  const targetFormat = elements.format.value;
  const safeInputName = `input.${extensionOf(file.name) || 'video'}`;
  const outputName = `output.${targetFormat}`;

  elements.convert.disabled = true;
  elements.format.disabled = true;
  elements.removeFile.disabled = true;
  elements.statusPanel.classList.remove('hidden');
  hideMessage();
  resetDownload();
  setProgress(0, 'Preparing converter…');

  try {
    await loadFFmpeg();
    setProgress(4, 'Reading your video…');
    await ffmpeg.writeFile(safeInputName, await fetchFile(file));
    await ffmpeg.exec(['-i', safeInputName, ...outputArguments(targetFormat, outputName)]);
    const data = await ffmpeg.readFile(outputName);
    const mimeTypes = { mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', avi: 'video/x-msvideo', mkv: 'video/x-matroska', gif: 'image/gif' };
    downloadUrl = URL.createObjectURL(new Blob([data.buffer], { type: mimeTypes[targetFormat] }));
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'converted-video';
    elements.download.href = downloadUrl;
    elements.download.download = `${baseName}.${targetFormat}`;
    elements.download.textContent = `Download ${baseName}.${targetFormat}`;
    elements.download.classList.remove('hidden');
    setProgress(100, 'Conversion complete!');
    showMessage('Your converted file is ready. It remains on this device only.', 'success');
  } catch (error) {
    console.error(error);
    elements.statusPanel.classList.add('hidden');
    showMessage('Conversion failed. The file may be damaged, use an unsupported codec, or be too large for this browser. Try another format or file.');
  } finally {
    if (ffmpegLoaded) {
      for (const name of [safeInputName, outputName]) {
        try { await ffmpeg.deleteFile(name); } catch { /* file may not exist */ }
      }
    }
    elements.convert.disabled = false;
    elements.format.disabled = false;
    elements.removeFile.disabled = false;
  }
}

elements.browseButton.addEventListener('click', (event) => {
  event.stopPropagation();
  elements.fileInput.click();
});
elements.dropZone.addEventListener('click', () => elements.fileInput.click());
elements.dropZone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    elements.fileInput.click();
  }
});
elements.fileInput.addEventListener('change', () => {
  if (elements.fileInput.files[0]) selectFile(elements.fileInput.files[0]);
});
['dragenter', 'dragover'].forEach((name) => elements.dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  elements.dropZone.classList.add('dragging');
}));
['dragleave', 'drop'].forEach((name) => elements.dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  elements.dropZone.classList.remove('dragging');
}));
elements.dropZone.addEventListener('drop', (event) => {
  if (event.dataTransfer.files[0]) selectFile(event.dataTransfer.files[0]);
});
elements.removeFile.addEventListener('click', clearFile);
elements.convert.addEventListener('click', convertVideo);
window.addEventListener('beforeunload', () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); });
