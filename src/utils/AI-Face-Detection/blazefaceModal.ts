// Face detection using Python API only
import { PYTHON_API_URL } from '../../config/python-api';

type DetectionResult = {
  imageDataUrl: string;
  detections: any[];
  croppedImageDataUrl?: string;
};

// Face data structure from Python API
type PythonFace = {
  topLeft: [number, number];
  bottomRight: [number, number];
  probability: [number];
  landmarks?: number[][];
};

function createModal(): HTMLElement {
  const existing = document.getElementById('faceDetectionModal');
  if (existing) return existing;

  const wrapper = document.createElement('div');
  wrapper.id = 'faceDetectionModal';
  wrapper.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 hidden';
  wrapper.innerHTML = `
    <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl mx-4">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-base font-semibold text-gray-900 dark:text-white">Face Detection</h3>
        <button id="closeFaceModalBtn" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
      </div>
      <div class="p-4 space-y-3">
         <div id="faceStatus" class="text-sm text-gray-600 dark:text-gray-300">Allow camera access, position your face in the camera frame, then take a photo.</div>
         <div id="faceServiceStatus" class="text-xs text-gray-500 dark:text-gray-400 mb-2 hidden">
           <span id="serviceStatusIcon" class="inline-block w-2 h-2 rounded-full mr-2"></span>
           <span id="serviceStatusText">Checking AI service...</span>
         </div>
         <div id="faceLegend" class="text-xs text-gray-500 dark:text-gray-400 mb-2 hidden">
           <span class="inline-flex items-center mr-4"><span class="w-3 h-3 bg-green-500 rounded mr-1"></span>Perfect face</span>
           <span class="inline-flex items-center mr-4"><span class="w-3 h-3 bg-blue-500 rounded mr-1"></span>Face detected</span>
           <span class="inline-flex items-center mr-4"><span class="w-3 h-3 bg-red-500 rounded mr-1"></span>Multiple faces</span>
           <span class="inline-flex items-center"><span class="w-3 h-3 bg-gray-500 rounded mr-1"></span>No face</span>
         </div>
         
         <!-- Camera Section -->
         <div id="cameraSection">
           <div class="flex gap-4">
             <!-- Main Camera View -->
             <div class="flex-1">
         <div id="cameraContainer" class="relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-white border-opacity-80">
           <video id="faceVideo" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>
           <canvas id="faceCanvas" class="absolute inset-0 w-full h-full"></canvas>
           <!-- Live feedback indicator -->
           <div id="faceFeedback" class="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white"></div>
         </div>
               <div class="flex items-center justify-between gap-2 mt-3">
           <button id="faceStartBtn" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Start Face Detection</button>
           <button id="faceCaptureBtn" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hidden">Take Photo</button>
           <button id="faceRetakeBtn" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 hidden">Retake</button>
         </div>
             </div>
             
             <!-- Live Face Preview -->
             <div class="w-64">
               <div class="text-xs text-gray-500 mb-1">Live Face Preview</div>
               <div class="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden border">
                 <canvas id="liveFacePreview" class="w-full h-full object-cover"></canvas>
                 <div id="livePreviewPlaceholder" class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                   Face preview will appear here
                 </div>
               </div>
               <div id="livePreviewStatus" class="text-xs text-gray-500 mt-1 text-center">No face detected</div>
             </div>
           </div>
         </div>

         <!-- Preview Section -->
         <div id="previewSection" class="hidden">
           <div class="text-sm text-gray-600 dark:text-gray-300 mb-2">Face detected and cropped. Review the image below:</div>
           <div class="flex gap-4">
             <!-- Original Image -->
             <div class="flex-1">
               <div class="text-xs text-gray-500 mb-1">Original</div>
               <div class="relative w-full aspect-video bg-gray-100 rounded-md overflow-hidden border">
                 <img id="originalImage" class="w-full h-full object-cover" />
               </div>
             </div>
             <!-- Cropped Face -->
             <div class="flex-1">
               <div class="text-xs text-gray-500 mb-1">Cropped Face</div>
               <div class="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden border">
                 <img id="croppedImage" class="w-full h-full object-cover" alt="Cropped face will appear here" />
                 <div id="croppedImagePlaceholder" class="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                   Cropped face preview
                 </div>
               </div>
             </div>
           </div>
           <div class="flex justify-between mt-3">
             <button id="faceRetakeFromPreviewBtn" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Retake Photo</button>
             <button id="faceConfirmBtn" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50" disabled>Confirm & Use This Photo</button>
           </div>
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
  croppedImageDataUrl?: string;
  detections?: any[];
  confidence?: number;
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
  const cameraSection = wrapper.querySelector('#cameraSection') as HTMLElement;
  const previewSection = wrapper.querySelector('#previewSection') as HTMLElement;
  const originalImage = wrapper.querySelector('#originalImage') as HTMLImageElement;
  const croppedImage = wrapper.querySelector('#croppedImage') as HTMLImageElement;
  const croppedImagePlaceholder = wrapper.querySelector('#croppedImagePlaceholder') as HTMLElement;
  const retakeFromPreviewBtn = wrapper.querySelector('#faceRetakeFromPreviewBtn') as HTMLButtonElement;
  const faceLegend = wrapper.querySelector('#faceLegend') as HTMLElement;
  const liveFacePreview = wrapper.querySelector('#liveFacePreview') as HTMLCanvasElement;
  const livePreviewPlaceholder = wrapper.querySelector('#livePreviewPlaceholder') as HTMLElement;
  const livePreviewStatus = wrapper.querySelector('#livePreviewStatus') as HTMLElement;
  const faceServiceStatus = wrapper.querySelector('#faceServiceStatus') as HTMLElement;
  const serviceStatusIcon = wrapper.querySelector('#serviceStatusIcon') as HTMLElement;
  const serviceStatusText = wrapper.querySelector('#serviceStatusText') as HTMLElement;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const livePreviewCtx = liveFacePreview.getContext('2d');
  if (!livePreviewCtx) throw new Error('Live preview canvas 2D context unavailable');

  // Persistent live preview crop state for smoothing (reserved for future use)
  // let livePrevCropX: number | null = null;
  // let livePrevCropY: number | null = null;
  // let livePrevCropSize: number | null = null;

  await startCamera(video);
  wrapper.classList.remove('hidden');

  let lastDetection: DetectionResult | null = null;
  let isLiveDetectionActive = false; // Start with detection disabled
  let animationFrameId: number | null = null;
  let hasAutoPreview: boolean = false; // ensure we only auto-open preview once per session

  // Auto-start detection with fallback
  setTimeout(() => {
    if (video.videoWidth && video.videoHeight) {
      startFaceDetection();
    } else {
      console.log('Video not ready for auto-start, showing start button');
      statusEl.textContent = 'Camera loading... Click "Start Face Detection" when ready.';
    }
  }, 500);

  // Function to check if a face is usable in the camera frame
  function isFaceUsable(face: PythonFace, canvasWidth: number, canvasHeight: number): boolean {
    if (!face.topLeft || !face.bottomRight) return false;
    
    const [yMin, xMin, yMax, xMax] = [
      face.topLeft[1], 
      face.topLeft[0], 
      face.bottomRight[1], 
      face.bottomRight[0]
    ];
    
    const faceWidth = (xMax - xMin) * canvasWidth;
    const faceHeight = (yMax - yMin) * canvasHeight;
    
    // Very lenient size check - just ensure face isn't extremely tiny
    const minFaceSize = Math.min(canvasWidth, canvasHeight) * 0.05; // 5% of frame
    const faceSize = Math.min(faceWidth, faceHeight);
    
    // Basic size check only
    return faceSize >= minFaceSize;
  }

  // Compute IoU between two faces' boxes (faces use normalized coords)
  function computeIoU(a: PythonFace, b: PythonFace): number {
    if (!a.topLeft || !a.bottomRight || !b.topLeft || !b.bottomRight) return 0;
    const ax1 = a.topLeft[0], ay1 = a.topLeft[1];
    const ax2 = a.bottomRight[0], ay2 = a.bottomRight[1];
    const bx1 = b.topLeft[0], by1 = b.topLeft[1];
    const bx2 = b.bottomRight[0], by2 = b.bottomRight[1];

    const x1 = Math.max(ax1, bx1);
    const y1 = Math.max(ay1, by1);
    const x2 = Math.min(ax2, bx2);
    const y2 = Math.min(ay2, by2);

    const interW = Math.max(0, x2 - x1);
    const interH = Math.max(0, y2 - y1);
    const inter = interW * interH;

    const areaA = Math.max(0, ax2 - ax1) * Math.max(0, ay2 - ay1);
    const areaB = Math.max(0, bx2 - bx1) * Math.max(0, by2 - by1);
    const union = areaA + areaB - inter;

    if (union <= 0) return 0;
    return inter / union;
  }

  // Non-maximum suppression to dedupe overlapping detections
  function nmsFaces(faces: PythonFace[], iouThreshold = 0.3): PythonFace[] {
    // Sort by probability desc (fallback to 1 if missing)
    const sorted = [...faces].sort((a, b) => (b.probability?.[0] || 1) - (a.probability?.[0] || 1));
    const result: PythonFace[] = [];

    for (const f of sorted) {
      let overlaps = false;
      for (const kept of result) {
        if (computeIoU(f, kept) > iouThreshold) {
          overlaps = true;
          break;
        }
      }
      if (!overlaps) result.push(f);
    }
    return result;
  }

  // Live face detection function
  async function liveFaceDetection() {
    if (!isLiveDetectionActive || !video.videoWidth || !video.videoHeight) {
      console.log('Live detection not active or video not ready:', {
        isLiveDetectionActive,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      });
      return;
    }

    try {
      console.log('Running face detection on video frame...');
      const predictions = await detectFaces(video);
      console.log('Raw predictions:', predictions?.length || 0, 'faces detected');
      
      if (predictions && predictions.length > 0) {
        console.log('First face detection data:', predictions[0]);
        console.log('Face topLeft:', predictions[0].topLeft);
        console.log('Face bottomRight:', predictions[0].bottomRight);
        console.log('Face probability:', predictions[0].probability);
      }
      
      // Clear canvas for live detection overlay
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply NMS to dedupe overlapping faces
      const deduped = (predictions && predictions.length > 0) ? nmsFaces(predictions) : [];
      console.log('After NMS deduplication:', deduped?.length || 0, 'faces');
      
      // Update live face preview
      updateLiveFacePreview(deduped);
      
      // Draw bounding boxes for all detected faces
      if (deduped && deduped.length > 0) {
        deduped.forEach((face, index) => {
          if (face.topLeft && face.bottomRight) {
            const [yMin, xMin, yMax, xMax] = [
              face.topLeft[1], 
              face.topLeft[0], 
              face.bottomRight[1], 
              face.bottomRight[0]
            ];
            
            const x = xMin * canvas.width;
            const y = yMin * canvas.height;
            const width = (xMax - xMin) * canvas.width;
            const height = (yMax - yMin) * canvas.height;
            
            // Check if this face is usable
            const isUsable = isFaceUsable(face, video.videoWidth, video.videoHeight);
            
            if (ctx) {
              // Stroke style with stronger visibility
              ctx.lineWidth = 3;
              ctx.shadowColor = 'rgba(0,0,0,0.8)';
              ctx.shadowBlur = 6;
              
              // Set color based on usability
              if (isUsable) {
                ctx.strokeStyle = '#22c55e'; // Green
                ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
              } else {
                ctx.strokeStyle = '#ef4444'; // Red
                ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
              }
              
              // Draw filled rectangle and border
              ctx.fillRect(x, y, width, height);
              ctx.strokeRect(x, y, width, height);
              
              // Label
              ctx.shadowBlur = 0;
              ctx.fillStyle = isUsable ? '#22c55e' : '#ef4444';
              ctx.font = '14px Arial';
              ctx.fillText(`Face ${index + 1}`, x + 5, y + 20);
            }
          }
        });
      }
      
      if (deduped && deduped.length > 0) {
        // Check if faces are usable
        const usableFaces = deduped.filter(face => {
          const usable = isFaceUsable(face, video.videoWidth, video.videoHeight);
          if (!usable) {
            const [yMin, xMin, yMax, xMax] = [
              face.topLeft[1], 
              face.topLeft[0], 
              face.bottomRight[1], 
              face.bottomRight[0]
            ];
            const faceWidth = (xMax - xMin) * video.videoWidth;
            const faceHeight = (yMax - yMin) * video.videoHeight;
            const faceSize = Math.min(faceWidth, faceHeight);
            const minRequired = Math.min(video.videoWidth, video.videoHeight) * 0.05;
            console.log('Face not usable:', {
              faceSize: Math.round(faceSize),
              minRequired: Math.round(minRequired),
              faceWidth: Math.round(faceWidth),
              faceHeight: Math.round(faceHeight),
              videoSize: `${video.videoWidth}x${video.videoHeight}`
            });
          }
          return usable;
        });
        
        if (usableFaces.length === 1) {
          // Green feedback - perfect
          feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg';
          cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-green-500 border-opacity-90';
          statusEl.textContent = 'Perfect! One face detected.';
          captureBtn.disabled = false; // kept for fallback

          // Auto-capture once
          if (!hasAutoPreview) {
            hasAutoPreview = true;
            const faceToUse = usableFaces[0];
            await autoCaptureToPreview(faceToUse);
            return; // stop this frame; preview shown
          }
        } else if (usableFaces.length > 1) {
          // Red feedback - multiple faces (not allowed)
          feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg';
          cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-red-500 border-opacity-90';
          statusEl.textContent = 'Multiple faces detected! Please ensure only ONE person is in the frame.';
          captureBtn.disabled = true; // Disable capture button
        } else {
          // Check if there are any faces at all (even if not "usable")
          if (deduped.length > 0) {
            // Blue feedback - face detected
            feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg';
            cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-blue-500 border-opacity-90';
            statusEl.textContent = 'Face detected.';
            captureBtn.disabled = false; // Allow capture

            // Auto-capture once using first face if none are "usable"
            if (!hasAutoPreview) {
              hasAutoPreview = true;
              const faceToUse = deduped[0];
              await autoCaptureToPreview(faceToUse);
              return;
            }
          } else {
            // Red feedback - no face detected
            feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg';
            cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-red-500 border-opacity-90';
            statusEl.textContent = 'No face detected. Please position your face in the camera frame.';
            captureBtn.disabled = true; // Disable capture button
          }
        }
      } else {
        // No face detected
        feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-gray-500 border-2 border-white shadow-lg';
        cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-white border-opacity-80';
        statusEl.textContent = 'No face detected. Please position your face in the camera frame.';
        captureBtn.disabled = true; // Disable capture button
      }
    } catch (error) {
      console.error('Live detection error:', error);
    }

    // Continue live detection
    animationFrameId = requestAnimationFrame(liveFaceDetection);
  }

  // Function to start face detection
  function startFaceDetection() {
    console.log('Starting face detection...');
    hasAutoPreview = false;
    isLiveDetectionActive = true;
    startBtn.classList.add('hidden');
    captureBtn.classList.add('hidden'); // hide manual take photo button in auto mode
    captureBtn.disabled = true;
    faceLegend.classList.remove('hidden'); // Show the legend
    statusEl.textContent = 'Position your face in the camera frame.';
    
    // Wait a bit for video to be ready, then start detection
    setTimeout(async () => {
      console.log('Video ready check:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        videoReadyState: video.readyState
      });
      
      if (video.videoWidth && video.videoHeight) {
        // Check if AI service is available before starting detection
        const isServiceAvailable = await checkPythonServiceHealth();
        if (isServiceAvailable) {
          liveFaceDetection();
        } else {
          // Service not available - show manual capture option
          console.log('AI service not available, showing manual capture');
          captureBtn.classList.remove('hidden');
          statusEl.textContent = 'AI service not available. Click "Take Photo" to capture your face manually.';
          faceLegend.classList.add('hidden'); // Hide legend since detection is disabled
        }
      } else {
        console.log('Video not ready, showing manual capture button');
        captureBtn.classList.remove('hidden');
        statusEl.textContent = 'Camera ready. Click "Take Photo" to capture your face.';
      }
    }, 1000);
  }

  // Unused function - commented out
  // function drawDetections(result: DetectionResult) {
  //   if (!video.videoWidth || !video.videoHeight) return;
  //   
  //   // For the preview, we'll show the full image with the face highlighted
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   
  //   // Draw captured frame as background
  //   const img = new Image();
  //   img.onload = () => {
  //     if (ctx) {
  //       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  //       
  //       // Draw green border around the detected face
  //       ctx.strokeStyle = '#22c55e';
  //       ctx.lineWidth = 3;
  //       for (const det of result.detections) {
  //         if (det.topLeft && det.bottomRight) {
  //           const [yMin, xMin, yMax, xMax] = [
  //             det.topLeft[1], 
  //             det.topLeft[0], 
  //             det.bottomRight[1], 
  //             det.bottomRight[0]
  //           ];
  //           const w = xMax - xMin;
  //           const h = yMax - yMin;
  //           ctx.strokeRect(
  //             xMin * canvas.width, 
  //             yMin * canvas.height, 
  //             w * canvas.width, 
  //             h * canvas.height
  //           );
  //         }
  //       }
  //     }
  //   };
  //   img.src = result.imageDataUrl;
  // }

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
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    // Run detection on the captured canvas (not video) to get accurate coordinates
    console.log('Running face detection on captured canvas...');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    const predictions = await detectFaces(canvas);
    console.log('Canvas face detection results:', predictions?.length || 0, 'faces');
    
    if (predictions && predictions.length > 0) {
      console.log('First detected face in canvas:', predictions[0]);
      console.log('Face topLeft:', predictions[0].topLeft);
      console.log('Face bottomRight:', predictions[0].bottomRight);
    }
    
    const deduped = (predictions && predictions.length > 0) ? nmsFaces(predictions) : [];
    if (!deduped || deduped.length === 0) {
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

    // Check if exactly one face is usable among deduped
    const usableFaces = deduped.filter(face => 
      isFaceUsable(face, canvas.width, canvas.height)
    );

    if (usableFaces.length !== 1) {
      if (usableFaces.length === 0) {
        // Use the first deduped face as fallback
        if (deduped.length > 0) {
          statusEl.textContent = 'Face detected. Proceeding with capture.';
          const firstFace = deduped[0];
          lastDetection = { imageDataUrl: dataUrl, detections: [firstFace] };
          await showPreviewWithCroppedFace(dataUrl, firstFace);
          confirmBtn.disabled = false;
          captureBtn.classList.add('hidden');
          retakeBtn.classList.remove('hidden');
          cameraSection.classList.add('hidden');
          previewSection.classList.remove('hidden');
          faceLegend.classList.add('hidden'); // Hide legend in preview
          livePreviewPlaceholder.style.display = 'flex'; // Hide live preview
          return;
      } else {
          statusEl.textContent = 'No face detected. Please retake the photo.';
        }
      } else if (usableFaces.length > 1) {
        statusEl.textContent = 'Multiple faces detected. Please ensure only ONE person is in the frame and retake.';
        // Show visual feedback for multiple faces and force retake
        feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg';
        cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-red-500 border-opacity-90';
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
    
    console.log('Face detection successful, showing preview...');
    
    // Show preview section with original and cropped images
    await showPreviewWithCroppedFace(dataUrl, usableFaces[0]);
    
    confirmBtn.disabled = false;
    captureBtn.classList.add('hidden');
    retakeBtn.classList.remove('hidden');
    cameraSection.classList.add('hidden');
    previewSection.classList.remove('hidden');
    faceLegend.classList.add('hidden'); // Hide legend in preview
    livePreviewPlaceholder.style.display = 'flex'; // Hide live preview
    
    console.log('Preview section should now be visible');
  }

  // Function to show preview with cropped face
  async function showPreviewWithCroppedFace(originalImageDataUrl: string, face: PythonFace) {
    try {
      // Show original image
      originalImage.src = originalImageDataUrl;
      
      // Create and show cropped face
      console.log('Starting face cropping...');
      const croppedImageDataUrl = await cropFaceFromImage(originalImageDataUrl, face);
      console.log('Face cropping completed, setting cropped image source...');
      
      // Check if cropping returned the original image (fallback)
      if (croppedImageDataUrl === originalImageDataUrl) {
        console.warn('Face cropping failed, using original image as fallback');
        // Show a message to the user
        statusEl.textContent = 'Face cropping failed, using full image. You can still proceed.';
      }
      
      // Ensure the cropped image loads properly
      croppedImage.onload = () => {
        console.log('Cropped image loaded successfully in preview');
        // Hide placeholder and remove any error styling
        croppedImagePlaceholder.style.display = 'none';
        croppedImage.style.border = '';
      };
      croppedImage.onerror = (e) => {
        console.error('Failed to load cropped image in preview:', e);
        // Show placeholder and error styling
        croppedImagePlaceholder.style.display = 'flex';
        croppedImagePlaceholder.textContent = 'Failed to load';
        croppedImage.style.border = '2px solid red';
        croppedImage.alt = 'Failed to load cropped image';
        statusEl.textContent = 'Error loading cropped image. Please retake the photo.';
      };
      
      // Set the cropped image source
      croppedImage.src = croppedImageDataUrl;
      
      // Store the cropped image for later use
      if (lastDetection) {
        lastDetection.croppedImageDataUrl = croppedImageDataUrl;
        console.log('Cropped image stored in lastDetection');
      }
    } catch (error) {
      console.error('Error in showPreviewWithCroppedFace:', error);
      statusEl.textContent = 'Error processing face image. Please retake the photo.';
    }
  }

  // Auto-capture helper: capture current frame and open preview for selected face
  async function autoCaptureToPreview(selectedFace: PythonFace): Promise<void> {
    if (!video.videoWidth || !video.videoHeight) return;

    // Stop live detection during capture
    isLiveDetectionActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Grab current frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    if (ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');

    // Re-run face detection on the captured image to get accurate coordinates
    console.log('Re-running face detection on captured image...');
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    const capturedPredictions = await detectFaces(canvas);
    console.log('Captured image face detection results:', capturedPredictions?.length || 0, 'faces');
    
    if (capturedPredictions && capturedPredictions.length > 0) {
      console.log('First detected face in captured image:', capturedPredictions[0]);
      console.log('Face topLeft:', capturedPredictions[0].topLeft);
      console.log('Face bottomRight:', capturedPredictions[0].bottomRight);
    }
    
    let faceToUse = selectedFace;
    if (capturedPredictions && capturedPredictions.length > 0) {
      // Use the first face detected in the captured image
      faceToUse = capturedPredictions[0];
      console.log('Using face from captured image:', faceToUse);
    } else {
      console.log('No face detected in captured image, using original detection');
      console.log('Original face data:', selectedFace);
    }

    // Save detection and show preview
    lastDetection = { imageDataUrl: dataUrl, detections: [faceToUse] };
    await showPreviewWithCroppedFace(dataUrl, faceToUse);

    confirmBtn.disabled = false;
    retakeBtn.classList.remove('hidden');
    cameraSection.classList.add('hidden');
    previewSection.classList.remove('hidden');
    faceLegend.classList.add('hidden');
    livePreviewPlaceholder.style.display = 'flex';
  }

  function resetForRetake() {
    console.log('Resetting for retake...');
    
    confirmBtn.disabled = true;
    statusEl.textContent = 'Position your face in the camera frame.';
    retakeBtn.classList.add('hidden');
    captureBtn.classList.add('hidden'); // Hide manual capture button for auto mode
    
    // Hide preview section and show camera section
    previewSection.classList.add('hidden');
    cameraSection.classList.remove('hidden');
    faceLegend.classList.remove('hidden'); // Show legend again
    
    // Clear preview images and reset placeholder
    originalImage.src = '';
    croppedImage.src = '';
    croppedImagePlaceholder.style.display = 'flex';
    croppedImagePlaceholder.textContent = 'Cropped face preview';
    croppedImage.style.border = '';
    
    if (video.videoWidth && video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    lastDetection = null;
    
    // Reset feedback indicators
    feedbackEl.className = 'absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white';
    cameraContainer.className = 'relative w-full aspect-video bg-black rounded-md overflow-hidden border-4 border-white border-opacity-80';
    
    // Reset auto-preview flag and restart live detection
    hasAutoPreview = false;
    isLiveDetectionActive = true;
    liveFaceDetection();
  }

  // Update service status UI
  function updateServiceStatus(isAvailable: boolean, message?: string) {
    if (faceServiceStatus) {
      faceServiceStatus.classList.remove('hidden');
    }
    
    if (serviceStatusIcon) {
      serviceStatusIcon.className = `inline-block w-2 h-2 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`;
    }
    
    if (serviceStatusText) {
      serviceStatusText.textContent = message || (isAvailable ? 'AI service connected' : 'AI service unavailable - using fallback');
    }
  }

  // Check if Python AI service is available and can communicate bidirectionally
  async function checkPythonServiceHealth(): Promise<boolean> {
    try {
      updateServiceStatus(false, 'Checking AI service...');
      
      // First, check the status endpoint
      const statusResponse = await fetch(`${PYTHON_API_URL}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!statusResponse.ok) {
        updateServiceStatus(false, 'AI service not responding');
        return false;
      }
      
      const statusResult = await statusResponse.json();
      console.log('Python AI service status:', statusResult);
      
      // Check if the service reports bidirectional connectivity
      const isRunning = statusResult.status === 'running';
      const frontendConnected = statusResult.frontend_connected === true || statusResult.main_app_connected === true;
      const bidirectional = statusResult.connectivity?.bidirectional === true;
      
      console.log('Service status check:', {
        isRunning,
        frontendConnected,
        bidirectional,
        statusResult
      });
      
      if (isRunning && frontendConnected && bidirectional) {
        updateServiceStatus(true, 'AI service fully connected');
        return true;
      } else if (isRunning && frontendConnected) {
        // Service is running and frontend is connected, but bidirectional check might be failing
        updateServiceStatus(true, 'AI service connected (bidirectional check may be unreliable)');
        return true; // Allow face detection even if bidirectional check fails
      } else if (isRunning) {
        // Service is running but connectivity check failed - still allow face detection
        updateServiceStatus(true, 'AI service running (connectivity check failed but allowing face detection)');
        return true; // Allow face detection even if connectivity check fails
      } else {
        updateServiceStatus(false, 'AI service not ready - face detection disabled');
        return false;
      }
      
    } catch (error) {
      console.log('Python AI service not available:', error);
      updateServiceStatus(false, 'AI service unavailable - face detection disabled');
      return false;
    }
  }

  // Test bidirectional connectivity by pinging the service (unused for now)
  // async function testBidirectionalConnectivity(): Promise<boolean> {
  //   try {
  //     const pingResponse = await fetch('http://localhost:5000/ping', {
  //       method: 'GET',
  //       headers: { 'Content-Type': 'application/json' }
  //     });
  //     
  //     if (pingResponse.ok) {
  //       const pingResult = await pingResponse.json();
  //       console.log('Ping test successful:', pingResult);
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     console.log('Ping test failed:', error);
  //     return false;
  //   }
  // }

  // Function to detect faces using Python API with fallback
  async function detectFaces(imageElement: HTMLVideoElement | HTMLCanvasElement): Promise<any[]> {
    try {
      // Check service health first
      const isServiceAvailable = await checkPythonServiceHealth();
      if (!isServiceAvailable) {
        console.log('Python AI service not available, disabling face detection');
        // Don't use fallback detection - it's too unreliable
        return [];
      }

      // Convert image element to data URL
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];
      
      if (imageElement instanceof HTMLVideoElement) {
        canvas.width = imageElement.videoWidth;
        canvas.height = imageElement.videoHeight;
        ctx.drawImage(imageElement, 0, 0);
      } else {
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        ctx.drawImage(imageElement, 0, 0);
      }
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Call Python API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      try {
        const response = await fetch(`${PYTHON_API_URL}/detect-face-base64`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: dataUrl }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Python API face detection result:', result);
        
        if (result.success && result.faces) {
          return result.faces;
        } else {
          console.log('No faces detected by Python API');
          return [];
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Error calling Python face detection API:', error);
      console.log('AI service error - no face detection available');
      return [];
    }
  }


  // Function to crop face from the captured image - COMPLETELY REWRITTEN
  function cropFaceFromImage(imageDataUrl: string, face: PythonFace): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          console.log('=== FACE CROPPING DEBUG ===');
          console.log('Image dimensions:', img.width, 'x', img.height);
          console.log('Face data:', face);
          console.log('Face topLeft:', face.topLeft);
          console.log('Face bottomRight:', face.bottomRight);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
          resolve(imageDataUrl);
          return;
        }

          // Check if we have valid face data
          if (!face || !face.topLeft || !face.bottomRight) {
            console.error('No valid face data - using center crop fallback');
            createCenterCrop(img, canvas, ctx, resolve);
            return;
          }

          // Get face coordinates - BlazeFace uses [x, y] format
          const [faceX1, faceY1] = face.topLeft;    // top-left corner
          const [faceX2, faceY2] = face.bottomRight; // bottom-right corner

          console.log('Raw face coordinates:', {
            topLeft: face.topLeft,
            bottomRight: face.bottomRight,
            faceX1, faceY1, faceX2, faceY2
          });

          // Validate normalized coordinates first
          if (faceX1 < 0 || faceY1 < 0 || faceX2 > 1 || faceY2 > 1 || faceX1 >= faceX2 || faceY1 >= faceY2) {
            console.error('Invalid normalized coordinates:', { faceX1, faceY1, faceX2, faceY2 });
            createCenterCrop(img, canvas, ctx, resolve);
            return;
          }

          // Convert normalized coordinates to pixel coordinates
          const pixelX1 = Math.round(faceX1 * img.width);
          const pixelY1 = Math.round(faceY1 * img.height);
          const pixelX2 = Math.round(faceX2 * img.width);
          const pixelY2 = Math.round(faceY2 * img.height);

          console.log('Pixel coordinates:', {
            x1: pixelX1, y1: pixelY1,
            x2: pixelX2, y2: pixelY2,
            imgWidth: img.width,
            imgHeight: img.height
          });

          // Calculate face dimensions
          const faceWidth = pixelX2 - pixelX1;
          const faceHeight = pixelY2 - pixelY1;

          console.log('Face dimensions:', faceWidth, 'x', faceHeight);
          console.log('Face area:', faceWidth * faceHeight, 'pixels');

          // Validate face dimensions
          if (faceWidth <= 0 || faceHeight <= 0 || faceWidth > img.width || faceHeight > img.height) {
            console.error('Invalid face dimensions - using center crop fallback');
            createCenterCrop(img, canvas, ctx, resolve);
          return;
        }

          // Calculate face center
          const faceCenterX = pixelX1 + faceWidth / 2;
          const faceCenterY = pixelY1 + faceHeight / 2;

          console.log('Face center:', faceCenterX, faceCenterY);

          // Create square crop around face with padding
          const padding = 0.4; // 40% padding around face
          const faceSize = Math.max(faceWidth, faceHeight);
          const cropSize = Math.round(faceSize * (1 + padding * 2));

          // Calculate crop bounds
          const cropX = Math.max(0, Math.round(faceCenterX - cropSize / 2));
          const cropY = Math.max(0, Math.round(faceCenterY - cropSize / 2));
          const finalCropSize = Math.min(cropSize, Math.min(img.width - cropX, img.height - cropY));

          console.log('Crop bounds:', {
            x: cropX, y: cropY,
            size: finalCropSize,
            originalSize: cropSize
          });

          // Set canvas size
          canvas.width = finalCropSize;
          canvas.height = finalCropSize;

          // Fill with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, finalCropSize, finalCropSize);

        // Draw the cropped face
        if (ctx) {
          ctx.drawImage(
            img,
              cropX, cropY, finalCropSize, finalCropSize,
              0, 0, finalCropSize, finalCropSize
            );
        }

          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG with compression
          console.log('Face cropped successfully! Size:', finalCropSize, 'x', finalCropSize);
          console.log('=== END FACE CROPPING DEBUG ===');
          resolve(croppedDataUrl);

        } catch (error) {
          console.error('Error in face cropping:', error);
          createCenterCrop(img, canvas, ctx, resolve);
        }
      };

      img.onerror = () => {
        console.error('Failed to load image for cropping');
        resolve(imageDataUrl);
      };
      img.src = imageDataUrl;
    });
  }

  // Helper function to create a center crop when face detection fails
  function createCenterCrop(img: HTMLImageElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null, resolve: (value: string) => void) {
    console.log('Creating center crop fallback');
    
    const size = Math.min(img.width, img.height) * 0.7; // 70% of smallest dimension
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    
    const cropX = Math.round(centerX - size / 2);
    const cropY = Math.round(centerY - size / 2);
    const cropSize = Math.round(size);
    
    canvas.width = cropSize;
    canvas.height = cropSize;
    
    if (ctx) {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cropSize, cropSize);
      
      // Draw center crop
      ctx.drawImage(
        img,
        cropX, cropY, cropSize, cropSize,
        0, 0, cropSize, cropSize
      );
    }
    
    const centerCropDataUrl = canvas.toDataURL('image/png');
    console.log('Center crop created, size:', cropSize, 'x', cropSize);
    resolve(centerCropDataUrl);
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
    retakeFromPreviewBtn.onclick = () => {
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
        // Use the already cropped image from preview
        const croppedImageDataUrl = result.croppedImageDataUrl || await cropFaceFromImage(result.imageDataUrl, result.detections[0]);
        const confidence = result.detections[0].probability?.[0] || 0;
        
        resolve({ 
          success: true, 
          imageDataUrl: result.imageDataUrl,
          croppedImageDataUrl: croppedImageDataUrl, 
          detections: result.detections,
          confidence: confidence
        });
      } else {
        resolve({ success: false });
      }
    };
  });

  // Function to update live face preview with actual face snapshots
  function updateLiveFacePreview(faces: PythonFace[]) {
    // Wait until the video has dimensions
    if (!video.videoWidth || !video.videoHeight) {
      return;
    }
    
    if (!faces || faces.length === 0) {
      livePreviewPlaceholder.style.display = 'flex';
      livePreviewStatus.textContent = 'No face detected';
      return;
    }

    // Use the first detected face
    const face = faces[0];
    if (!face.topLeft || !face.bottomRight) {
      livePreviewPlaceholder.style.display = 'flex';
      livePreviewStatus.textContent = 'Invalid face data';
      return;
    }

    // Set canvas size
    liveFacePreview.width = 256;
    liveFacePreview.height = 256;

    // Clear canvas with white background
    if (livePreviewCtx) {
      livePreviewCtx.fillStyle = '#ffffff';
      livePreviewCtx.fillRect(0, 0, 256, 256);
    }

    // Get face coordinates in normalized format (0-1)
    const xMin = face.topLeft[0];
    const yMin = face.topLeft[1];
    const xMax = face.bottomRight[0];
    const yMax = face.bottomRight[1];

    // Convert to pixel coordinates
    const facePixelX = xMin * video.videoWidth;
    const facePixelY = yMin * video.videoHeight;
    const facePixelW = (xMax - xMin) * video.videoWidth;
    const facePixelH = (yMax - yMin) * video.videoHeight;

    // Create a square crop centered on the face with generous padding
    const padding = 0.3; // 30% padding around the face
    const faceSize = Math.max(facePixelW, facePixelH);
    const cropSize = faceSize * (1 + padding * 2);

    // Center the crop on the face
    const faceCenterX = facePixelX + facePixelW / 2;
    const faceCenterY = facePixelY + facePixelH / 2;

    // Calculate crop bounds
    let cropX = Math.round(faceCenterX - cropSize / 2);
    let cropY = Math.round(faceCenterY - cropSize / 2);

    // Clamp to video bounds
    cropX = Math.max(0, Math.min(cropX, video.videoWidth - cropSize));
    cropY = Math.max(0, Math.min(cropY, video.videoHeight - cropSize));

    // Ensure we have valid dimensions
    const finalCropW = Math.min(cropSize, video.videoWidth - cropX);
    const finalCropH = Math.min(cropSize, video.videoHeight - cropY);

    if (finalCropW > 0 && finalCropH > 0 && livePreviewCtx) {
      // Draw the face snapshot to preview canvas
      livePreviewCtx.drawImage(
        video,
        cropX, cropY, finalCropW, finalCropH,
        0, 0, 256, 256
      );
    }

    // Hide placeholder and update status
    livePreviewPlaceholder.style.display = 'none';
    const isUsable = isFaceUsable(face, video.videoWidth, video.videoHeight);
    livePreviewStatus.textContent = isUsable ? 'Good face detected' : 'Face detected';
    livePreviewStatus.className = `text-xs mt-1 text-center ${isUsable ? 'text-green-600' : 'text-blue-600'}`;
  }
}


