# Spec: Mouse Detector (static web app)

## Objective
Detect a computer mouse (COCO class 64) in real time from the camera on PC and phone, fully in the browser, hosted on GitHub Pages.

## Tech stack
Static `index.html` + `app.js`, onnxruntime-web from jsDelivr (WebGPU, fallback WASM), `yolo26n.onnx` exported with Ultralytics at imgsz 320. No build step.

## Commands
- Export: `uvx --from ultralytics yolo export model=yolo26n.pt format=onnx imgsz=320 end2end=True` (end2end gives the NMS-free [1,300,6] output)
- Serve locally: `python -m http.server 8000`
- Self-test: open `index.html?test` (runs the model on `test.jpg`, asserts a mouse is found)

## Structure
index.html, app.js, yolo26n.onnx, test.jpg, SPEC.md, tasks/plan.md

## Behaviour
Start button -> getUserMedia({video:{facingMode:'environment'}}), `<video playsinline muted autoplay>`, overlay canvas with boxes, FPS readout, checkbox "show all classes". Responsive to phone width.

## Boundaries
Always: static files only. Never: frontend build, tracking/analytics, uploading frames.

## Success criteria
Model loads and the self-test finds a mouse in the built-in browser; Pages URL serves the site.
