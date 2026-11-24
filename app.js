const $ = id => document.getElementById(id);
const S = 320, TH = 0.3, MOUSE = 64;
const NAMES = 'person,bicycle,car,motorcycle,airplane,bus,train,truck,boat,traffic light,fire hydrant,stop sign,parking meter,bench,bird,cat,dog,horse,sheep,cow,elephant,bear,zebra,giraffe,backpack,umbrella,handbag,tie,suitcase,frisbee,skis,snowboard,sports ball,kite,baseball bat,baseball glove,skateboard,surfboard,tennis racket,bottle,wine glass,cup,fork,knife,spoon,bowl,banana,apple,sandwich,orange,broccoli,carrot,hot dog,pizza,donut,cake,chair,couch,potted plant,bed,dining table,toilet,tv,laptop,mouse,remote,keyboard,cell phone,microwave,oven,toaster,sink,refrigerator,book,clock,vase,scissors,teddy bear,hair drier,toothbrush'.split(',');
const TEST = location.search.includes('test');
const status = t => $('status').textContent = t;
const work = Object.assign(document.createElement('canvas'), { width: S, height: S });
const wctx = work.getContext('2d', { willReadFrequently: true });
const ov = $('ov'), octx = ov.getContext('2d');
let session, src, sw, sh;

ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
ort.env.wasm.numThreads = 1; // GitHub Pages has no COOP/COEP, so no wasm threads
const F = new Float32Array(3 * S * S);

async function loadModel() {
  status('Loading model...');
  for (const ep of [['webgpu', 'wasm'], ['wasm']]) {
    try {
      session = await ort.InferenceSession.create('./yolo26n.onnx', { executionProviders: ep });
      $('backend').textContent = ep.join('>') + (ep.length > 1 ? ' (webgpu if available)' : '');
      return;
    } catch (e) { console.warn('EP failed', ep, e); if (ep.length == 1) throw e; }
  }
}

// Letterbox src into 320x320, run model, return detections in source pixel coords.
async function detect() {
  const r = Math.min(S / sw, S / sh), nw = Math.round(sw * r), nh = Math.round(sh * r);
  const px = (S - nw) / 2, py = (S - nh) / 2;
  wctx.fillStyle = 'rgb(114,114,114)'; wctx.fillRect(0, 0, S, S);
  wctx.drawImage(src, px, py, nw, nh);
  const d = wctx.getImageData(0, 0, S, S).data, n = S * S;
  for (let i = 0; i < n; i++) { F[i] = d[4 * i] / 255; F[n + i] = d[4 * i + 1] / 255; F[2 * n + i] = d[4 * i + 2] / 255; }
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor('float32', F, [1, 3, S, S]) });
  const o = out[session.outputNames[0]].data, all = $('all').checked, res = [];
  for (let i = 0; i < o.length; i += 6) {
    const [x1, y1, x2, y2, score, c] = [o[i], o[i + 1], o[i + 2], o[i + 3], o[i + 4], Math.round(o[i + 5])];
    if (score < TH || (!all && c != MOUSE)) continue;
    res.push({ c, score, x1: (x1 - px) / r, y1: (y1 - py) / r, x2: (x2 - px) / r, y2: (y2 - py) / r });
  }
  return res;
}

function draw(dets) {
  const el = TEST ? $('img') : $('vid'), w = el.clientWidth, h = el.clientHeight;
  if (ov.width != w || ov.height != h) { ov.width = w; ov.height = h; }
  octx.clearRect(0, 0, w, h);
  const k = w / sw; octx.lineWidth = 2; octx.font = '14px sans-serif';
  for (const d of dets) {
    const col = d.c == MOUSE ? '#0f0' : '#fa0', t = `${NAMES[d.c]} ${(d.score * 100) | 0}%`;
    octx.strokeStyle = col; octx.strokeRect(d.x1 * k, d.y1 * k, (d.x2 - d.x1) * k, (d.y2 - d.y1) * k);
    octx.fillStyle = col; octx.fillText(t, d.x1 * k + 2, Math.max(14, d.y1 * k - 4));
  }
  $('count').textContent = dets.filter(d => d.c == MOUSE).length;
}

async function loop() {
  let t0 = performance.now(), frames = 0;
  while (true) {
    if (src.readyState >= 2) {
      sw = src.videoWidth; sh = src.videoHeight; // changes on phone rotation
      try { draw(await detect()); } catch (e) { status('Inference error: ' + e.message); return; }
      frames++;
      const t = performance.now();
      if (t - t0 >= 1000) { $('fps').textContent = (frames * 1000 / (t - t0)).toFixed(1); t0 = t; frames = 0; }
    }
    await new Promise(requestAnimationFrame);
  }
}

async function start() {
  $('start').disabled = true;
  if (!navigator.mediaDevices?.getUserMedia) return status('Camera needs HTTPS (or localhost). Open this page over https://.'), ($('start').disabled = false);
  try {
    const v = $('vid');
    v.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    await v.play();
    src = v; sw = v.videoWidth; sh = v.videoHeight;
  } catch (e) {
    $('start').disabled = false;
    return status(e.name == 'NotAllowedError' ? 'Camera access was denied. Allow it in the browser settings and try again.' : 'Camera error: ' + e.message);
  }
  if (!session) await loadModel().catch(e => status('Model failed to load: ' + e.message));
  if (!session) return $('start').disabled = false;
  status('Running (' + $('backend').textContent + ')'); loop();
}

async function selfTest() {
  $('start').hidden = true; $('vid').remove();
  const img = new Image(); img.id = 'img';
  $('wrap').prepend(img);
  let pass = false, dets = [];
  try {
    img.src = './test.jpg'; await img.decode();
    src = img; sw = img.naturalWidth; sh = img.naturalHeight;
    await loadModel();
    dets = await detect(); draw(dets);
    pass = dets.some(d => d.c == MOUSE);
  } catch (e) { console.error(e); status('Test error: ' + e.message); }
  const r = pass ? 'TEST PASS' : 'TEST FAIL';
  status('Done'); document.title = r; $('testline').textContent = r;
  window.testResult = { pass, detections: dets };
}

if (TEST) selfTest(); else { $('start').onclick = start; status('Press Start to open the camera'); }
