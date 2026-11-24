# Plan
1. Export yolo26n -> ONNX 320, inspect I/O (agent: model-export). Verify: onnx shapes printed.
2. index.html + app.js: camera, preprocess (letterbox 320, RGB/255 NCHW), postprocess (end-to-end output [1,300,6] x1,y1,x2,y2,score,cls), draw, FPS (agent: frontend-inference).
3. Mobile performance review (agent: web-performance-auditor).
4. QA self-test on test.jpg (agent: test-engineer).
5. Code review (agent: code-reviewer). Checkpoint: coordinator approves, browser check.
6. Deploy: gh repo create + Pages (coordinator, after user OK).
