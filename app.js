const $ = id => document.getElementById(id);
// broetchen.onnx: YOLO26n-seg, end2end, imgsz 640. output0 [1,300,38] = x1 y1 x2 y2 score cls + 32 mask coefs,
// output1 [1,32,160,160] = mask prototypes (model pixels / 4).
const S = 640, P = 160, TH = 0.4;
const CLASSES = [
  { name: 'Normal', rgb: [218, 112, 44] },        // Flexoki orange
  { name: 'Körner', rgb: [135, 154, 57] },        // Flexoki green
  { name: 'Sonnenblumen', rgb: [208, 162, 21] },  // Flexoki yellow
];
const TEST = location.search.includes('test');
const status = t => $('status').textContent = t;
const work = Object.assign(document.createElement('canvas'), { width: S, height: S });
const wctx = work.getContext('2d', { willReadFrequently: true });
const mcan = Object.assign(document.createElement('canvas'), { width: P, height: P });
const mctx = mcan.getContext('2d');
const mimg = mctx.createImageData(P, P);
const ov = $('ov'), octx = ov.getContext('2d');
let session, src, sw, sh, running = false;

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
ort.env.wasm.numThreads = 1; // GitHub Pages has no COOP/COEP, so no wasm threads
const F = new Float32Array(3 * S * S);

async function loadModel() {
  status('Modell wird geladen …');
  for (const ep of [['webgpu', 'wasm'], ['wasm']]) {
    try {
      session = await ort.InferenceSession.create('./broetchen.onnx', { executionProviders: ep });
      $('backend').textContent = ep.length > 1 && navigator.gpu ? 'WebGPU' : 'WASM';
      return;
    } catch (e) { console.warn('EP failed', ep, e); if (ep.length == 1) throw e; }
  }
}

// Letterbox src into SxS, run the model; boxes in source pixels, mask painted into mimg (proto grid).
async function detect() {
  const r = Math.min(S / sw, S / sh), nw = Math.round(sw * r), nh = Math.round(sh * r);
  const px = (S - nw) / 2, py = (S - nh) / 2;
  wctx.fillStyle = 'rgb(114,114,114)'; wctx.fillRect(0, 0, S, S);
  wctx.drawImage(src, px, py, nw, nh);
  const d = wctx.getImageData(0, 0, S, S).data, n = S * S;
  for (let i = 0; i < n; i++) { F[i] = d[4 * i] / 255; F[n + i] = d[4 * i + 1] / 255; F[2 * n + i] = d[4 * i + 2] / 255; }
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor('float32', F, [1, 3, S, S]) });
  const o = out[session.outputNames[0]].data, pr = out[session.outputNames[1]].data, res = [];
  const m = mimg.data; m.fill(0);
  for (let i = 0; i < o.length; i += 38) {
    const score = o[i + 4], c = Math.round(o[i + 5]);
    if (score < TH || !CLASSES[c]) continue;
    const [x1, y1, x2, y2] = [o[i], o[i + 1], o[i + 2], o[i + 3]];
    // Mask = sigmoid(coefs . protos) > 0.5, i.e. the dot product > 0, cropped to the box.
    const [r0, g0, b0] = CLASSES[c].rgb;
    for (let y = Math.max(0, y1 / 4 | 0); y < Math.min(P, Math.ceil(y2 / 4)); y++)
      for (let x = Math.max(0, x1 / 4 | 0); x < Math.min(P, Math.ceil(x2 / 4)); x++) {
        const p = y * P + x; let s = 0;
        for (let k = 0; k < 32; k++) s += o[i + 6 + k] * pr[k * P * P + p];
        if (s > 0) { m[4 * p] = r0; m[4 * p + 1] = g0; m[4 * p + 2] = b0; m[4 * p + 3] = 110; }
      }
    res.push({ c, score, x1: (x1 - px) / r, y1: (y1 - py) / r, x2: (x2 - px) / r, y2: (y2 - py) / r });
  }
  mctx.putImageData(mimg, 0, 0);
  return { dets: res, crop: [px / 4, py / 4, nw / 4, nh / 4] };
}

function draw({ dets, crop }) {
  const el = TEST ? $('img') : $('vid'), w = el.clientWidth, h = el.clientHeight;
  const dpr = devicePixelRatio || 1;
  if (ov.width != Math.round(w * dpr) || ov.height != Math.round(h * dpr)) { ov.width = Math.round(w * dpr); ov.height = Math.round(h * dpr); }
  octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  octx.clearRect(0, 0, w, h);
  octx.imageSmoothingEnabled = true;
  octx.drawImage(mcan, ...crop, 0, 0, w, h);
  const k = w / sw; octx.lineWidth = 2; octx.font = '600 13px system-ui,sans-serif';
  const counts = CLASSES.map(() => 0);
  for (const d of dets) {
    counts[d.c]++;
    const col = `rgb(${CLASSES[d.c].rgb})`, t = `${CLASSES[d.c].name} ${(d.score * 100) | 0}%`;
    const x = d.x1 * k, y = d.y1 * k;
    octx.strokeStyle = col; octx.strokeRect(x, y, (d.x2 - d.x1) * k, (d.y2 - d.y1) * k);
    const tw = octx.measureText(t).width + 8, ty = Math.max(0, y - 20);
    octx.fillStyle = col; octx.fillRect(x, ty, tw, 20);
    octx.fillStyle = '#100F0F'; octx.fillText(t, x + 4, ty + 14);
  }
  CLASSES.forEach((_, i) => { const e = $('count' + i); if (e) e.textContent = counts[i]; });
  return counts;
}

async function loop() {
  let t0 = performance.now(), frames = 0;
  while (running) {
    if (src.readyState >= 2) {
      sw = src.videoWidth; sh = src.videoHeight; // changes on phone rotation
      try { draw(await detect()); } catch (e) { stop(); status('Fehler bei der Erkennung: ' + e.message); return; }
      frames++;
      const t = performance.now();
      if (t - t0 >= 1000) { $('fps').textContent = (frames * 1000 / (t - t0)).toFixed(1); t0 = t; frames = 0; }
    }
    await new Promise(requestAnimationFrame);
  }
}

const modelReady = TEST ? null : loadModel().catch(e => { status('Modell konnte nicht geladen werden: ' + e.message); });

function stop() {
  running = false;
  const v = $('vid'); v.srcObject?.getTracks().forEach(t => t.stop()); v.srcObject = null;
  $('start').textContent = 'Kamera starten'; $('start').disabled = false;
  status('Kamera gestoppt');
}

const CAM_ERR = {
  NotAllowedError: 'Kamerazugriff verweigert. Bitte in den Browser-Einstellungen erlauben.',
  NotFoundError: 'Keine Kamera gefunden.',
  NotReadableError: 'Die Kamera wird gerade von einer anderen App benutzt.',
};

async function start() {
  if (running) return stop();
  $('start').disabled = true;
  if (!navigator.mediaDevices?.getUserMedia) return status('Kamera nicht verfügbar. Seite über https:// in Safari oder Chrome öffnen.'), ($('start').disabled = false);
  if (!session) { status('Modell wird geladen …'); await modelReady; }
  if (!session) return $('start').disabled = false;
  try {
    const v = $('vid');
    v.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    await v.play();
    src = v; sw = v.videoWidth; sh = v.videoHeight;
  } catch (e) {
    $('start').disabled = false;
    return status(CAM_ERR[e.name] || 'Kamerafehler: ' + e.message);
  }
  $('start').textContent = 'Kamera stoppen'; $('start').disabled = false;
  status('Erkennung läuft'); running = true; loop();
}

// The camera keeps running (and on iOS freezes) in the background, so stop it when the page is hidden.
document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });

// Self-test: test.jpg (frame 000189 of the training recording) holds 2 Körner and 2 Sonnenblumen.
async function selfTest() {
  $('start').hidden = true; $('vid').remove();
  const img = new Image(); img.id = 'img';
  $('wrap').prepend(img);
  let pass = false, dets = [], counts = [];
  try {
    img.src = './test.jpg'; await img.decode();
    src = img; sw = img.naturalWidth; sh = img.naturalHeight;
    await loadModel();
    const r = await detect(); dets = r.dets; counts = draw(r);
    pass = counts[0] == 0 && counts[1] == 2 && counts[2] == 2;
    status('Fertig');
  } catch (e) { console.error(e); status('Testfehler: ' + e.message); }
  const r = pass ? 'TEST PASS' : 'TEST FAIL'; document.title = r; $('testline').textContent = r + ' ' + JSON.stringify(counts);
  window.testResult = { pass, counts, detections: dets };
}

if (TEST) selfTest(); else { $('start').onclick = start; status('Tippe auf „Kamera starten“'); }
