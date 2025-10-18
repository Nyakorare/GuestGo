let cameraStream = null;
let uploadedFaceEncoding = null;
let isComparing = false;
let autoCompareInterval = null;
let sessionActive = false;
let sessionResults = [];
// Verification sampling interval; continue until user stops
const SAMPLE_INTERVAL_MS = 900;    // capture roughly once per second
// Auto-stop criteria
const AUTO_MIN_SAMPLES = 6;
const AUTO_MATCH_THRESHOLD = 0.75;     // stop early if >= 75% matches
const AUTO_NONMATCH_THRESHOLD = 0.25;   // or <= 25% matches
// Scanner animation state
let scanAnimationId = null;
let lastBBox = null;      // [x1,y1,x2,y2]
let lastMatch = null;     // true/false
let scanStartTs = null;
const SCAN_CYCLE_MS = 1500;
// Enrolled face (cropped) data URL
let enrolledFaceCropData = null;

// Cross-browser getUserMedia helper
function getUserMediaCompat(constraints) {
  return new Promise((resolve, reject) => {
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        navigator.mediaDevices.getUserMedia(constraints).then(resolve).catch(reject);
        return;
      }
      const legacy = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      if (legacy) {
        legacy.call(navigator, constraints, resolve, reject);
        return;
      }
      reject(new Error('Camera API not available. Use a modern browser over https or localhost.'));
    } catch (e) {
      reject(e);
    }
  });
}

function syncOverlayToVideo(videoEl, overlayEl) {
  if (!videoEl || !overlayEl) return;
  // Set canvas internal resolution to video pixel resolution
  overlayEl.width = videoEl.videoWidth || overlayEl.width;
  overlayEl.height = videoEl.videoHeight || overlayEl.height;
  // Match CSS size to rendered video size for correct alignment
  overlayEl.style.width = videoEl.clientWidth + 'px';
  overlayEl.style.height = videoEl.clientHeight + 'px';
}

function disableUploadUI() {
  try {
    if (uploadArea) {
      uploadArea.style.pointerEvents = 'none';
      uploadArea.style.opacity = '0.5';
      uploadArea.title = 'Upload disabled: an enrolled face already exists.';
    }
    if (fileInput) fileInput.disabled = true;
  } catch {}
}

function drawGuideOverlay(canvas, verifying = false) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) return;
  const { cx, cy, radius } = getGuideParams();
  ctx.clearRect(0, 0, w, h);
  // darken outside
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // dashed guide circle
  ctx.strokeStyle = verifying ? '#22c55e' : '#6366f1';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function getGuideParams() {
  const w = cameraOverlay.width || 0;
  const h = cameraOverlay.height || 0;
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);
  const radius = Math.floor(Math.min(w, h) * 0.28); // ~56% diameter of min dimension
  return { cx, cy, radius };
}

function drawGuideCircle(ctx, color = 'rgba(99,102,241,0.8)') {
  const { cx, cy, radius } = getGuideParams();
  if (!radius) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function bboxInsideGuide(bbox) {
  if (!bbox) return false;
  const [x1, y1, x2, y2] = bbox;
  const bx = (x1 + x2) / 2;
  const by = (y1 + y2) / 2;
  const bw = x2 - x1;
  const bh = y2 - y1;
  const { cx, cy, radius } = getGuideParams();
  if (!radius) return false;
  const dist = Math.hypot(bx - cx, by - cy);
  const centerOk = dist <= radius * 0.75; // center must be well inside
  const sizeOk = Math.max(bw, bh) <= radius * 1.6; // face should fit inside guide
  return centerOk && sizeOk;
}

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadStatus = document.getElementById('uploadStatus');
const faceInfo = document.getElementById('faceInfo');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
const cameraOverlay = document.getElementById('cameraOverlay');
// Enrollment camera elements
const enrollVideo = document.getElementById('enrollVideo');
const enrollOverlay = document.getElementById('enrollOverlay');
const startEnrollBtn = document.getElementById('startEnroll');
const stopEnrollBtn = document.getElementById('stopEnroll');
const enrollStatus = document.getElementById('enrollStatus');
const startCameraBtn = document.getElementById('startCamera');
const stopCameraBtn = document.getElementById('stopCamera');
const cameraStatus = document.getElementById('cameraStatus');
const recognitionResult = document.getElementById('recognitionResult');

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
});
uploadArea.addEventListener('dragleave', () => {});
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) handleFileUpload(files[0]);
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
});

startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);
if (startEnrollBtn) startEnrollBtn.addEventListener('click', startEnrollCamera);
if (stopEnrollBtn) stopEnrollBtn.addEventListener('click', stopEnrollCamera);

async function handleFileUpload(file) {
  // Reset any previous enrollment UI and data so only one picture is active
  try {
    enrolledFaceCropData = null;
    uploadedFaceEncoding = false;
    // Clear previous face info/details
    if (faceInfo) {
      faceInfo.innerHTML = '';
      faceInfo.classList.add('hidden');
    }
    // Clear previous recognition/capture details
    if (recognitionResult) recognitionResult.innerHTML = '';
    const prevDetails = document.getElementById('compareDetails');
    if (prevDetails) prevDetails.remove();
  } catch {}

  if (!file.type.startsWith('image/')) {
    showStatus(uploadStatus, 'Please select a valid image file.', 'error');
    return;
  }
  showStatus(uploadStatus, 'Processing image...', 'info');
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: e.target.result })
      });
      const result = await response.json();
      if (result.success) {
        showStatus(uploadStatus, result.message, 'success');
        showFaceInfo(result);
        // Save enrolled face crop
        if (result.faces && result.faces.length > 0) {
          try {
            enrolledFaceCropData = await cropFromDataUrl(e.target.result, result.faces[0].bbox);
          } catch {}
        }
        uploadedFaceEncoding = true;
        disableUploadUI();
      } else {
        // Show a friendly message instead of undefined; treat as info so UI keeps retrying
        const msg = result.message || result.error || 'Retrying...';
        showStatus(uploadStatus, msg, 'info');
        // If faces are provided (partial), render basic face info panel
        if (result.faces && result.faces.length > 0) {
          try { showFaceInfo({ faces_detected: result.faces.length, faces: result.faces }); } catch {}
        }
      }
    } catch (error) {
      showStatus(uploadStatus, 'Error uploading image: ' + error.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}

function showFaceInfo(result) {
  const faceInfoDiv = document.getElementById('faceInfo');
  if (result.faces_detected === 0) {
    faceInfoDiv.innerHTML = `
      <div class="bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg p-4 text-center">
        <h3 class="font-semibold">⚠️ No Faces Detected</h3>
        <p>Try uploading a clearer image with better lighting</p>
        <p>Make sure the face is clearly visible and not too small</p>
      </div>`;
    faceInfoDiv.classList.remove('hidden');
    return;
  }
  const html = `
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-4 text-center">
      <h3 class="font-semibold mb-1">🎯 Best Face Selected!</h3>
      <p>Best face detected for comparison</p>
    </div>
    <button class="mt-3 px-4 py-2 rounded-full bg-indigo-600 text-white" onclick="toggleFaceDetails()">Show Details</button>
    <div id="faceDetails" class="hidden mt-3">
      <div class="bg-white rounded-lg p-4 shadow">
        <h3 class="text-lg font-semibold mb-2">📊 Face Analysis</h3>
        <div class="flex flex-wrap gap-4">
          ${result.faces.map((face, index) => `
            <div class="bg-gray-50 rounded-lg border p-4 text-center min-w-[150px]">
              <h4 class="font-medium">Selected Face</h4>
              <div id="faceImage${index}"></div>
              <div class="text-sm text-gray-600 mt-2">
                <p><strong>Confidence:</strong> ${(face.confidence * 100).toFixed(1)}%</p>
                <div class="w-full h-2 bg-gray-200 rounded mt-1">
                  <div class="h-2 rounded bg-gradient-to-r from-red-400 via-yellow-300 to-green-500" style="width: ${face.confidence * 100}%"></div>
                </div>
                <p class="mt-1"><strong>Position:</strong> (${face.bbox[0]}, ${face.bbox[1]})</p>
                <p><strong>Size:</strong> ${face.bbox[2] - face.bbox[0]} × ${face.bbox[3] - face.bbox[1]}px</p>
                <p><strong>Status:</strong> Ready for camera comparison</p>
              </div>
            </div>
          `).join('')}
          ${enrolledFaceCropData ? `
          <div class="bg-gray-50 rounded-lg border p-4 text-center">
            <h4 class="font-medium">Enrolled Face</h4>
            <img class="max-w-[120px] max-h-[120px] rounded border-2 border-green-400 mt-2" src="${enrolledFaceCropData}" alt="Enrolled face" />
            <div class="text-sm text-gray-600 mt-2">
              <p>This is the face template used for verification.</p>
            </div>
          </div>` : ''}
        </div>
      </div>
    </div>`;
  faceInfoDiv.innerHTML = html;
  faceInfoDiv.classList.remove('hidden');
  cropAndDisplayFaces(result.faces);
}

function toggleFaceDetails() {
  const detailsDiv = document.getElementById('faceDetails');
  const btn = document.querySelector('#faceInfo button');
  const isHidden = detailsDiv.classList.contains('hidden');
  detailsDiv.classList.toggle('hidden');
  btn.textContent = isHidden ? 'Hide Details' : 'Show Details';
}

function cropAndDisplayFaces(faces) {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      faces.forEach((face, index) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const x = face.bbox[0];
        const y = face.bbox[1];
        const width = face.bbox[2] - face.bbox[0];
        const height = face.bbox[3] - face.bbox[1];
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
        const faceImageDiv = document.getElementById(`faceImage${index}`);
        if (faceImageDiv) {
          faceImageDiv.innerHTML = `<img class="max-w-[120px] max-h-[120px] rounded border-2 border-indigo-400 mt-2" src="${canvas.toDataURL()}" alt="Face ${index + 1}">`;
        }
      });
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function cropFromDataUrl(dataUrl, bbox) {
  return new Promise((resolve, reject) => {
    try {
      const [x1, y1, x2, y2] = bbox || [];
      const img = new Image();
      img.onload = () => {
        const w = Math.max(1, x2 - x1);
        const h = Math.max(1, y2 - y1);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, x1, y1, w, h, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = reject;
      img.src = dataUrl;
    } catch (e) {
      reject(e);
    }
  });
}

async function startCamera() {
  try {
    cameraStream = await getUserMediaCompat({ video: { width: { ideal: 640 }, height: { ideal: 480 } } });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.onloadedmetadata = () => {
    syncOverlayToVideo(cameraVideo, cameraOverlay);
    // initial guide
    drawGuideOverlay(cameraOverlay, false);
    };
    startCameraBtn.disabled = true;
    stopCameraBtn.disabled = false;
    showStatus(cameraStatus, 'Camera started successfully', 'success');
    startVerificationSession();
  } catch (error) {
    showStatus(cameraStatus, 'Error accessing camera: ' + error.message, 'error');
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
  }
  startCameraBtn.disabled = false;
  stopCameraBtn.disabled = true;
  endVerificationSession(true);
  const ctx = cameraOverlay.getContext('2d');
  ctx.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);
  showStatus(cameraStatus, 'Camera stopped', 'info');
  recognitionResult.innerHTML = '';
  const details = document.getElementById('compareDetails');
  if (details) details.remove();
}

async function captureAndCompare() {
  if (!uploadedFaceEncoding) {
    showStatus(recognitionResult, 'Please upload an image first', 'error');
    return;
  }
  if (isComparing) return;
  isComparing = true;
  try {
    const canvas = cameraCanvas;
    const context = canvas.getContext('2d');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    context.drawImage(cameraVideo, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const response = await fetch('/compare', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: imageData })
    });
    const result = await response.json();
    if (result.error) {
      showStatus(recognitionResult, result.error, 'error');
    } else if (bboxInsideGuide(result.bbox)) {
      drawGuideOverlay(cameraOverlay, true);
      displayRecognitionResult(result);
      drawLiveBBox(result);
      drawKeypoints(result);
      showCompareDetails(imageData, result);
      sessionResults.push({ match: !!result.match, confidence: Number(result.confidence || 0) });
      updateLiveScanStatus();
      maybeAutoStop();
    } else {
      const ctx = cameraOverlay.getContext('2d');
      ctx.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);
      drawGuideOverlay(cameraOverlay, false);
      showStatus(recognitionResult, 'Align your face within the guide circle to verify.', 'info');
    }
  } catch (error) {
    showStatus(recognitionResult, 'Error comparing faces: ' + error.message, 'error');
  } finally {
    isComparing = false;
  }
}

function startVerificationSession() {
  if (sessionActive) return;
  sessionActive = true;
  sessionResults = [];
  if (autoCompareInterval) clearInterval(autoCompareInterval);
  autoCompareInterval = setInterval(async () => {
    if (!sessionActive) return;
    await captureAndCompare();
  }, SAMPLE_INTERVAL_MS);
}

function endVerificationSession(forceStop) {
  if (autoCompareInterval) {
    clearInterval(autoCompareInterval);
    autoCompareInterval = null;
  }
  if (!sessionActive) return;
  sessionActive = false;
  if (forceStop) return;
  if (sessionResults.length === 0) {
    showStatus(recognitionResult, 'No samples captured. Try again.', 'error');
    return;
  }
  const matches = sessionResults.filter(r => r.match).length;
  const avgConfidence = sessionResults.reduce((s, r) => s + r.confidence, 0) / sessionResults.length;
  // Require a stronger consensus when scanning slowly
  const verdict = matches > (sessionResults.length * 0.7); // >70% of samples must match
  const ctx = cameraOverlay.getContext('2d');
  ctx.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);
  stopScanAnimation();
  recognitionResult.innerHTML = `
    <div class="rounded-lg p-4 ${verdict ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
      <h3 class="font-semibold">${verdict ? 'Verification Passed' : 'Verification Failed'}</h3>
      <p><strong>Samples:</strong> ${sessionResults.length}</p>
      <p><strong>Matches:</strong> ${matches}</p>
      <p><strong>Avg confidence:</strong> ${(avgConfidence * 100).toFixed(1)}%</p>
    </div>`;
}

function maybeAutoStop() {
  if (!sessionActive) return;
  const total = sessionResults.length;
  if (total < AUTO_MIN_SAMPLES) return;
  const matches = sessionResults.filter(r => r.match).length;
  const ratio = matches / total;
  if (ratio >= AUTO_MATCH_THRESHOLD || ratio <= AUTO_NONMATCH_THRESHOLD) {
    endVerificationSession(false);
  }
}

function displayRecognitionResult(result) {
  const confidence = (result.confidence * 100).toFixed(2);
  const matchText = result.match ? 'MATCH FOUND!' : 'No match';
  recognitionResult.innerHTML = `
    <div class="rounded-lg p-4 ${result.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
      <h3 class="font-semibold">${matchText}</h3>
      <p><strong>Confidence:</strong> ${confidence}%</p>
      <div class="w-full h-2 bg-gray-200 rounded">
        <div class="h-2 rounded bg-gradient-to-r from-red-400 via-yellow-300 to-green-500" style="width: ${confidence}%"></div>
      </div>
      <p><strong>Distance:</strong> ${result.distance.toFixed(4)}</p>
      ${result.match ? '<p class="mt-2 font-medium">Please hold still. Do not move.</p>' : ''}
    </div>`;
}

function drawLiveBBox(result) {
  if (!result.bbox) {
    lastBBox = null;
    lastMatch = null;
    return;
  }
  lastBBox = result.bbox.slice();
  lastMatch = !!result.match;
  startScanAnimation();
}

function drawKeypoints(result) {
  const ctx = cameraOverlay.getContext('2d');
  if (!result.keypoints || !Array.isArray(result.keypoints)) return;
  // Draw keypoints
  ctx.fillStyle = '#60a5fa';
  const pts = [];
  for (const kp of result.keypoints) {
    if (!kp || kp.length < 2) continue;
    pts.push({ x: kp[0], y: kp[1] });
    ctx.beginPath();
    ctx.arc(kp[0], kp[1], 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Optional wireframe connections between common facial landmarks if available order
  const connect = (a, b) => {
    if (pts[a] && pts[b]) {
      ctx.strokeStyle = 'rgba(96,165,250,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
      ctx.stroke();
    }
  };
  // Heuristic: if Mediapipe provides 6 keypoints (eyes, ears, nose, mouth) typical order
  // indices often: 0 right eye,1 left eye,2 nose tip,3 mouth center,4 right ear,5 left ear
  if (pts.length >= 6) {
    connect(0, 2); connect(1, 2); // eyes to nose
    connect(0, 3); connect(1, 3); // eyes to mouth
    connect(4, 0); connect(5, 1); // ears to respective eyes
    connect(4, 5);               // across forehead
    connect(3, 2);               // mouth to nose
  }
}

function showCompareDetails(imageData, result) {
  const detailsId = 'compareDetails';
  let details = document.getElementById(detailsId);
  if (!details) {
    details = document.createElement('div');
    details.id = detailsId;
    details.className = 'bg-white rounded-lg p-4 shadow mt-4';
    recognitionResult.parentNode.appendChild(details);
  }
  const [x1, y1, x2, y2] = result.bbox || [0,0,0,0];
  const width = Math.max(0, x2 - x1);
  const height = Math.max(0, y2 - y1);
  const img = new Image();
  img.onload = () => {
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    cropCanvas.width = Math.max(1, width);
    cropCanvas.height = Math.max(1, height);
    if (width > 0 && height > 0) {
      cropCtx.drawImage(img, x1, y1, width, height, 0, 0, width, height);
    }
    details.innerHTML = `
      <button id="toggleCompareDetails" class="px-4 py-2 rounded-full bg-indigo-600 text-white">Show Capture Details</button>
      <div id="compareDetailsPanel" class="hidden mt-3">
        <h3 class=\"text-lg font-semibold mb-2\">📸 Capture Details</h3>
        <div class=\"flex flex-wrap gap-4\">
          <div class=\"bg-gray-50 rounded-lg border p-4 text-center\">
            <h4 class=\"font-medium\">Captured Frame</h4>
            <img class=\"max-w-md rounded mt-2\" src=\"${imageData}\" alt=\"Captured frame\" />
          </div>
          <div class=\"bg-gray-50 rounded-lg border p-4 text-center\">
            <h4 class=\"font-medium\">Detected Face</h4>
            <img class=\"max-w-[160px] rounded mt-2 border-2 border-indigo-400\" src=\"${width>0 && height>0 ? cropCanvas.toDataURL() : imageData}\" alt=\"Cropped face\" />
            ${result.bbox ? `<div class=\"text-sm text-gray-600 mt-2\">
              <p><strong>Position:</strong> (${x1}, ${y1})</p>
              <p><strong>Size:</strong> ${width} × ${height}px</p>
            </div>` : '<div class=\"text-sm text-gray-600 mt-2\"><p>No face detected in capture.</p></div>'}
          </div>
        </div>
      </div>`;
    const toggleBtn = document.getElementById('toggleCompareDetails');
    const panel = document.getElementById('compareDetailsPanel');
    if (toggleBtn && panel) {
      toggleBtn.onclick = () => {
        const isHidden = panel.classList.contains('hidden');
        panel.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? 'Hide Capture Details' : 'Show Capture Details';
      };
    }
  };
  img.src = imageData;
}

function showStatus(element, message, type) {
  const cls = type === 'success' ? 'bg-green-100 text-green-800' : type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  element.innerHTML = `<div class="rounded-lg p-3 ${cls}">${message}</div>`;
}

function showEnrollDetails(imageData, face, cropDataUrl) {
  const host = enrollStatus.parentElement;
  let details = document.getElementById('enrollDetails');
  if (!details) {
    details = document.createElement('div');
    details.id = 'enrollDetails';
    details.className = 'bg-white rounded-lg p-4 shadow mt-3';
    host.appendChild(details);
  }
  const [x1, y1, x2, y2] = face.bbox || [0,0,0,0];
  const width = Math.max(0, x2 - x1);
  const height = Math.max(0, y2 - y1);
  details.innerHTML = `
    <button id="toggleEnrollDetails" class="px-4 py-2 rounded-full bg-indigo-600 text-white">Show Enrollment Details</button>
    <div id="enrollDetailsPanel" class="hidden mt-3">
      <h3 class="text-lg font-semibold mb-2">📥 Enrollment Capture</h3>
      <div class="flex flex-wrap gap-4">
        <div class="bg-gray-50 rounded-lg border p-4 text-center">
          <h4 class="font-medium">Captured Frame</h4>
          <img class="max-w-md rounded mt-2" src="${imageData}" alt="Enroll frame" />
        </div>
        <div class="bg-gray-50 rounded-lg border p-4 text-center">
          <h4 class="font-medium">Enrolled Face</h4>
          <img class="max-w-[160px] rounded mt-2 border-2 border-green-400" src="${cropDataUrl}" alt="Enrolled face" />
          <div class="text-sm text-gray-600 mt-2">
            <p><strong>Position:</strong> (${x1}, ${y1})</p>
            <p><strong>Size:</strong> ${width} × ${height}px</p>
            <p><strong>Confidence:</strong> ${(face.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>`;
  const toggleBtn = document.getElementById('toggleEnrollDetails');
  const panel = document.getElementById('enrollDetailsPanel');
  if (toggleBtn && panel) {
    toggleBtn.onclick = () => {
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      toggleBtn.textContent = isHidden ? 'Hide Enrollment Details' : 'Show Enrollment Details';
    };
  }
}

function updateLiveScanStatus() {
  if (!sessionActive) return;
  const matches = sessionResults.filter(r => r.match).length;
  const total = sessionResults.length;
  const pct = total ? Math.round((matches / total) * 100) : 0;
  const bar = `
    <div class="mt-2 w-full h-2 bg-gray-200 rounded">
      <div class="h-2 rounded ${pct>=70 ? 'bg-green-500' : pct>=40 ? 'bg-yellow-400' : 'bg-red-500'}" style="width:${pct}%"></div>
    </div>`;
  const info = `<div class="mt-2 text-sm text-gray-600">Scanning... ${matches}/${total} matches (${pct}%)</div>`;
  recognitionResult.insertAdjacentHTML('beforeend', bar + info);
}

function startScanAnimation() {
  if (scanAnimationId) return;
  scanStartTs = performance.now();
  const ctx = cameraOverlay.getContext('2d');
  const animate = (ts) => {
    if (!lastBBox || !sessionActive) {
      scanAnimationId = null;
      return;
    }
    const [x1, y1, x2, y2] = lastBBox;
    const w = x2 - x1;
    const h = y2 - y1;
    const t = ((ts - scanStartTs) % SCAN_CYCLE_MS) / SCAN_CYCLE_MS; // 0..1
    const yLine = y1 + Math.max(0, Math.min(1, t)) * h;

    ctx.clearRect(0, 0, cameraOverlay.width, cameraOverlay.height);

    ctx.strokeStyle = lastMatch ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, w, h);

    const grad = ctx.createLinearGradient(x1, yLine, x2, yLine);
    grad.addColorStop(0, 'rgba(59,130,246,0.0)');
    grad.addColorStop(0.5, 'rgba(59,130,246,0.9)');
    grad.addColorStop(1, 'rgba(59,130,246,0.0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, yLine);
    ctx.lineTo(x2, yLine);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(x1, Math.max(0, y1 - 24), 180, 22);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Segoe UI, Tahoma, sans-serif';
    const confText = lastMatch === null ? 'Scanning...' : (lastMatch ? 'Match' : 'No match');
    ctx.fillText(confText, x1 + 6, Math.max(12, y1 - 8));

    scanAnimationId = requestAnimationFrame(animate);
  };
  scanAnimationId = requestAnimationFrame(animate);
}

function stopScanAnimation() {
  if (scanAnimationId) cancelAnimationFrame(scanAnimationId);
  scanAnimationId = null;
  lastBBox = null;
  lastMatch = null;
}

window.addEventListener('beforeunload', () => {
  if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
  if (enrollVideo && enrollVideo.srcObject) {
    enrollVideo.srcObject.getTracks().forEach(t => t.stop());
  }
});

// Enrollment from live camera (MediaPipe-based on server in /upload)
let enrollStream = null;
let enrollInterval = null;

async function startEnrollCamera() {
  try {
    enrollStream = await getUserMediaCompat({ video: { width: { ideal: 640 }, height: { ideal: 480 } } });
    enrollVideo.srcObject = enrollStream;
    enrollVideo.classList.remove('hidden');
    enrollOverlay.classList.remove('hidden');
    enrollVideo.onloadedmetadata = () => {
      syncOverlayToVideo(enrollVideo, enrollOverlay);
      const ectx = enrollOverlay.getContext('2d');
      ectx.clearRect(0, 0, enrollOverlay.width, enrollOverlay.height);
    };
    startEnrollBtn.disabled = true;
    stopEnrollBtn.disabled = false;
    showStatus(enrollStatus, 'Enrollment camera started. Hold your face in the guide.', 'info');
    // Auto-capture a few frames and submit to /upload until success
    if (enrollInterval) clearInterval(enrollInterval);
    enrollInterval = setInterval(async () => {
      const canvas = document.createElement('canvas');
      canvas.width = enrollVideo.videoWidth;
      canvas.height = enrollVideo.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(enrollVideo, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      try {
        const resp = await fetch('/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: imageData }) });
        const result = await resp.json();
        const ectx = enrollOverlay.getContext('2d');
        enrollOverlay.width = enrollVideo.videoWidth;
        enrollOverlay.height = enrollVideo.videoHeight;
        ectx.clearRect(0, 0, enrollOverlay.width, enrollOverlay.height);
        if (result && result.faces && result.faces.length > 0) {
          // Draw all detected boxes while retrying
          for (const f of result.faces) {
            const [x1, y1, x2, y2] = f.bbox || [];
            if (x2 > x1 && y2 > y1) {
              ectx.strokeStyle = '#22c55e';
              ectx.lineWidth = 3;
              ectx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            }
          }
        }
        if (result && result.success) {
          showStatus(enrollStatus, 'Enrollment successful. You can stop the enrollment camera.', 'success');
          if (result.faces && result.faces.length > 0) {
            const face = result.faces[0];
            const bbox = face.bbox;
            // Save enrolled crop and show details
            try {
              enrolledFaceCropData = await cropFromDataUrl(imageData, bbox);
              showEnrollDetails(imageData, face, enrolledFaceCropData);
            } catch {}
          }
          // Mark template as ready for Step 2 verification
          uploadedFaceEncoding = true;
          disableUploadUI();
          clearInterval(enrollInterval);
          enrollInterval = null;
          try { stopEnrollCamera(); } catch {}
        } else if (result && result.message) {
          // Show retrying status subtly
          showStatus(enrollStatus, (result.message || 'Retrying...'), 'info');
        }
      } catch (e) {
        // ignore transient errors
      }
    }, 1000);
  } catch (e) {
    showStatus(enrollStatus, 'Error starting enrollment camera: ' + e.message, 'error');
  }
}

function stopEnrollCamera() {
  if (enrollInterval) {
    clearInterval(enrollInterval);
    enrollInterval = null;
  }
  if (enrollVideo && enrollVideo.srcObject) {
    enrollVideo.srcObject.getTracks().forEach(t => t.stop());
    enrollVideo.srcObject = null;
  }
  startEnrollBtn.disabled = false;
  stopEnrollBtn.disabled = true;
  enrollVideo.classList.add('hidden');
  enrollOverlay.classList.add('hidden');
  const ectx = enrollOverlay.getContext('2d');
  ectx.clearRect(0, 0, enrollOverlay.width, enrollOverlay.height);
  enrollStatus.innerHTML = '';
}