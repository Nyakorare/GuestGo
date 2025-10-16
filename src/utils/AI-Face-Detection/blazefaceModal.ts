import * as blazeface from '@tensorflow-models/blazeface';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-wasm';
import * as tf from '@tensorflow/tfjs';

type DetectionResult = {
  imageDataUrl: string;
  detections: blazeface.NormalizedFace[];
};

let modelPromise: Promise<blazeface.BlazeFaceModel> | null = null;

async function loadModel(): Promise<blazeface.BlazeFaceModel> {
  if (!modelPromise) {
    // Prefer WebGL, fallback to WASM, then CPU
    try {
      await tf.setBackend('webgl');
    } catch (_) {
      try {
        await tf.setBackend('wasm');
      } catch (_) {
        await tf.setBackend('cpu');
      }
    }
    await tf.ready();
    modelPromise = blazeface.load();
  }
  return modelPromise;
}

function createModal(): HTMLElement {
  const existing = document.getElementById('faceDetectionModal');
  if (existing) return existing;

  const wrapper = document.createElement('div');
  wrapper.id = 'faceDetectionModal';
  wrapper.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 hidden';
  wrapper.innerHTML = `
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Face Detection</h3>
        <button id="closeFaceModalBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
      </div>
      <div class="p-4 space-y-3">
         <div id="faceStatus" class="text-sm text-gray-600 dark:text-gray-300">Allow camera access, position your face in the camera frame, then take a photo.</div>
         <div id="cameraContainer" class="relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-white border-opacity-80">
           <video id="faceVideo" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>
           <canvas id="faceCanvas" class="absolute inset-0 w-full h-full"></canvas>
           <!-- Live feedback indicator -->
           <div id="faceFeedback" class="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white"></div>
         </div>
         <div class="flex items-center justify-between gap-2">
           <button id="faceStartBtn" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Start Face Detection</button>
           <button id="faceCaptureBtn" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hidden">Take Photo</button>
           <button id="faceRetakeBtn" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 hidden">Retake</button>
         </div>
        <div class="flex justify-end">
          <button id="faceConfirmBtn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50" disabled>Use This Photo</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  // close interactions
  wrapper.addEventListener('click', (e) => {
    if (e.target === wrapper) hideModal();
  });
  wrapper.querySelector('#closeFaceModalBtn')?.addEventListener('click', () => hideModal());

  return wrapper;
}

let activeStream: MediaStream | null = null;

async function startCamera(video: HTMLVideoElement): Promise<void> {
  stopCamera();
  activeStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
  video.srcObject = activeStream;
}

function stopCamera() {
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
}

function hideModal() {
  const wrapper = document.getElementById('faceDetectionModal');
  if (wrapper) {
    wrapper.classList.add('hidden');
  }
  stopCamera();
}

export type FaceDetectionOutcome = {
  success: boolean;
  imageDataUrl?: string;
  detections?: blazeface.NormalizedFace[];
};

export async function openFaceDetectionModal(): Promise<FaceDetectionOutcome> {
  const wrapper = createModal();
  const video = wrapper.querySelector('#faceVideo') as HTMLVideoElement;
  const canvas = wrapper.querySelector('#faceCanvas') as HTMLCanvasElement;
  const statusEl = wrapper.querySelector('#faceStatus') as HTMLElement;
  const startBtn = wrapper.querySelector('#faceStartBtn') as HTMLButtonElement;
  const captureBtn = wrapper.querySelector('#faceCaptureBtn') as HTMLButtonElement;
  const retakeBtn = wrapper.querySelector('#faceRetakeBtn') as HTMLButtonElement;
  const confirmBtn = wrapper.querySelector('#faceConfirmBtn') as HTMLButtonElement;
  const feedbackEl = wrapper.querySelector('#faceFeedback') as HTMLElement;
  const cameraContainer = wrapper.querySelector('#cameraContainer') as HTMLElement;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const model = await loadModel();
  await startCamera(video);
  wrapper.classList.remove('hidden');

  let lastDetection: DetectionResult | null = null;
  let isLiveDetectionActive = false; // Start with detection disabled
  let animationFrameId: number | null = null;

  // Function to check if a face is usable in the camera frame
  function isFaceUsable(face: blazeface.NormalizedFace, canvasWidth: number, canvasHeight: number): boolean {
    if (!face.topLeft || !face.bottomRight) return false;
    
    const [yMin, xMin, yMax, xMax] = [
      face.topLeft[1], 
      face.topLeft[0], 
      face.bottomRight[1], 
      face.bottomRight[0]
    ];
    
    const faceWidth = (xMax - xMin) * canvasWidth;
    const faceHeight = (yMax - yMin) * canvasHeight;
    
    // Very lenient size check - just make sure face isn't extremely tiny
    const minFaceSize = Math.min(canvasWidth, canvasHeight) * 0.05; // At least 5% of frame
    const faceSize = Math.min(faceWidth, faceHeight);
    
    // If there's a face that's not extremely small, use it
    return faceSize >= minFaceSize;
  }

  // Live face detection function
  async function liveFaceDetection() {
    if (!isLiveDetectionActive || !video.videoWidth || !video.videoHeight) {
      return;
    }

    try {
      const predictions = await model.estimateFaces(video, false);
      
      // Clear canvas for live detection overlay
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (predictions && predictions.length > 0) {
        // Check if faces are usable
        const usableFaces = predictions.filter(face => 
          isFaceUsable(face, video.videoWidth, video.videoHeight)
        );
        
        if (usableFaces.length === 1) {
          // Green feedback - perfect
          feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg';
          cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-green-500 border-opacity-90';
          statusEl.textContent = 'Perfect! Face detected. You can take the photo.';
        } else if (usableFaces.length > 1) {
          // Yellow feedback - multiple faces
          feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-lg';
          cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-yellow-500 border-opacity-90';
          statusEl.textContent = 'Multiple faces detected. Please ensure only one person is in the frame.';
        } else {
          // Red feedback - face too small
          feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg';
          cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-red-500 border-opacity-90';
          statusEl.textContent = 'Face detected but too small. Please move closer to the camera.';
        }
      } else {
        // No face detected
        feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-lg';
        cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-white border-opacity-80';
        statusEl.textContent = 'No face detected. Please position your face in the camera frame.';
      }
    } catch (error) {
      console.error('Live detection error:', error);
    }

    // Continue live detection
    animationFrameId = requestAnimationFrame(liveFaceDetection);
  }

  // Function to start face detection
  function startFaceDetection() {
    isLiveDetectionActive = true;
    startBtn.classList.add('hidden');
    captureBtn.classList.remove('hidden');
    statusEl.textContent = 'Position your face in the camera frame.';
    liveFaceDetection();
  }

  function drawDetections(result: DetectionResult) {
    if (!video.videoWidth || !video.videoHeight) return;
    
    // For the preview, we'll show the full image with the face highlighted
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw captured frame as background
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw green border around the detected face
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      for (const det of result.detections) {
        if (det.topLeft && det.bottomRight) {
          const [yMin, xMin, yMax, xMax] = [
            det.topLeft[1], 
            det.topLeft[0], 
            det.bottomRight[1], 
            det.bottomRight[0]
          ];
          const w = xMax - xMin;
          const h = yMax - yMin;
          ctx.strokeRect(
            xMin * canvas.width, 
            yMin * canvas.height, 
            w * canvas.width, 
            h * canvas.height
          );
        }
      }
    };
    img.src = result.imageDataUrl;
  }

  async function captureAndDetect(): Promise<void> {
    if (!video.videoWidth || !video.videoHeight) {
      statusEl.textContent = 'Camera not ready yet. Please try again.';
      return;
    }

    // Stop live detection during capture
    isLiveDetectionActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    // Run detection on the current frame
    const predictions = await model.estimateFaces(video, false);
    if (!predictions || predictions.length === 0) {
      statusEl.textContent = 'No face detected. Please retake the photo.';
      confirmBtn.disabled = true;
      captureBtn.classList.remove('hidden');
      retakeBtn.classList.add('hidden');
      lastDetection = null;
      // Restart live detection
      isLiveDetectionActive = true;
      liveFaceDetection();
      return;
    }

    // Check if exactly one face is usable
    const usableFaces = predictions.filter(face => 
      isFaceUsable(face, video.videoWidth, video.videoHeight)
    );

    if (usableFaces.length !== 1) {
      if (usableFaces.length === 0) {
        statusEl.textContent = 'No usable face detected. Please position your face better and retake.';
      } else {
        statusEl.textContent = 'Multiple faces detected. Please ensure only one person is in the frame.';
      }
      confirmBtn.disabled = true;
      captureBtn.classList.remove('hidden');
      retakeBtn.classList.add('hidden');
      lastDetection = null;
      // Restart live detection
      isLiveDetectionActive = true;
      liveFaceDetection();
      return;
    }

    // Success - exactly one face usable
    statusEl.textContent = 'Perfect! Face detected and ready.';
    lastDetection = { imageDataUrl: dataUrl, detections: usableFaces };
    confirmBtn.disabled = false;
    captureBtn.classList.add('hidden');
    retakeBtn.classList.remove('hidden');
    drawDetections(lastDetection);
  }

  function resetForRetake() {
    confirmBtn.disabled = true;
    statusEl.textContent = 'Reposition and take a clear photo.';
    retakeBtn.classList.add('hidden');
    captureBtn.classList.remove('hidden');
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    lastDetection = null;
    
    // Reset feedback indicators
    feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white';
    cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-white border-opacity-80';
    
    // Restart live detection
    isLiveDetectionActive = true;
    liveFaceDetection();
  }

  // Function to crop face from the captured image
  function cropFaceFromImage(imageDataUrl: string, face: blazeface.NormalizedFace): string {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        if (!face.topLeft || !face.bottomRight) {
          resolve(imageDataUrl);
          return;
        }

        const [yMin, xMin, yMax, xMax] = [
          face.topLeft[1], 
          face.topLeft[0], 
          face.bottomRight[1], 
          face.bottomRight[0]
        ];

        // Calculate face dimensions with some padding
        const padding = 0.1; // 10% padding around the face
        const faceWidth = (xMax - xMin) * img.width;
        const faceHeight = (yMax - yMin) * img.height;
        const paddingX = faceWidth * padding;
        const paddingY = faceHeight * padding;

        const cropX = Math.max(0, (xMin * img.width) - paddingX);
        const cropY = Math.max(0, (yMin * img.height) - paddingY);
        const cropWidth = Math.min(img.width - cropX, faceWidth + (paddingX * 2));
        const cropHeight = Math.min(img.height - cropY, faceHeight + (paddingY * 2));

        // Set canvas size to crop dimensions
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Draw the cropped face
        ctx.drawImage(
          img,
          cropX, cropY, cropWidth, cropHeight,
          0, 0, cropWidth, cropHeight
        );

        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageDataUrl;
    });
  }

  return new Promise<FaceDetectionOutcome>((resolve) => {
    startBtn.onclick = () => {
      startFaceDetection();
    };
    captureBtn.onclick = async () => {
      await captureAndDetect();
    };
    retakeBtn.onclick = () => {
      resetForRetake();
    };
    confirmBtn.onclick = async () => {
      const result = lastDetection;
      hideModal();
      
      // Stop live detection
      isLiveDetectionActive = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      if (result && result.detections && result.detections.length > 0) {
        // Crop the face from the image
        const croppedImageDataUrl = await cropFaceFromImage(result.imageDataUrl, result.detections[0]);
        resolve({ 
          success: true, 
          imageDataUrl: croppedImageDataUrl, 
          detections: result.detections 
        });
      } else {
        resolve({ success: false });
      }
    };
  });
}


