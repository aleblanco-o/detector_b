# Spec: Brötchen-Erkenner (static web app)

## Objective
Detect and segment three kinds of bread rolls (Normal, Körner, Sonnenblumen) live from the camera on phone and PC, fully in the browser, hosted on GitHub Pages. A German 4-step guide (Datenaufnahme, Labeling, Training, Inferenz) explains how such a model is made.

## Tech stack
Static `index.html` + `app.js` + `guide.js`, onnxruntime-web 1.22 from jsDelivr (WebGPU, fallback WASM single thread), `broetchen.onnx`: YOLO26n-seg trained at 1280 on 602 frames, exported at 640. No build step. Flexoki palette, light and dark.

## Commands
- Export: `yolo export model=best.pt format=onnx imgsz=640 end2end=True` (output0 [1,300,38] = box, score, class, 32 mask coefs; output1 [1,32,160,160] mask prototypes)
- Serve locally: `python -m http.server 8000`
- Self-test: open `index.html?test` (runs the model on `test.jpg`, expects 0 Normal, 2 Körner, 2 Sonnenblumen)

## Behaviour
"Kamera starten" toggles the rear camera (`<video playsinline muted autoplay>`); the model preloads at page open. Overlay canvas draws masks, boxes and labels at devicePixelRatio; result card shows counts per class, FPS and backend. The camera stops when the page is hidden. Mobile first, safe areas, no horizontal scroll.

## Boundaries
Always: static files only. Never: frontend build, tracking/analytics, uploading frames.

## Success criteria
Self-test passes; Pages URL serves the site over HTTPS; the camera flow works on iPhone Safari and Android Chrome.
