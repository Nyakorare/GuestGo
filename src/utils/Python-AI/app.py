from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
import base64
import io
import os
import time
import requests
import gc  # Garbage collection for memory management
from typing import Dict

# Cache YOLO model to avoid reloading on each request
_YOLO_MODEL = None
_YOLO_MODEL_NAME = None
_YOLO_MODEL_EXPLICITLY_LOADED = False  # Track if model was explicitly loaded via reload endpoint

def _get_yolo_model(model_name=None):
    """Get YOLO model, optionally loading a specific model name"""
    global _YOLO_MODEL
    global _YOLO_MODEL_NAME
    # If a specific model is requested and it's different from current, reset cache
    if model_name and model_name != _YOLO_MODEL_NAME:
        _YOLO_MODEL = None
        _YOLO_MODEL_NAME = None
    if _YOLO_MODEL is not None:
        return _YOLO_MODEL
    try:
        print("Attempting to import ultralytics...")
        
        # Set PyTorch weights_only=False BEFORE importing and KEEP IT SET
        # PyTorch 2.6+ defaults to weights_only=True, but Ultralytics models need weights_only=False
        # We keep this False for the entire session since our models are trusted
        if 'TORCH_WEIGHTS_ONLY' not in os.environ or os.environ.get('TORCH_WEIGHTS_ONLY', 'True') != 'False':
            os.environ['TORCH_WEIGHTS_ONLY'] = 'False'
            print("✅ Set TORCH_WEIGHTS_ONLY=False for model loading")
        
        try:
            from ultralytics import YOLO
            print("✅ Ultralytics imported successfully")
            
            # Also configure torch.serialization for PyTorch 2.6+ compatibility
            try:
                import torch
                if hasattr(torch.serialization, 'add_safe_globals'):
                    # Add Ultralytics classes to safe globals for PyTorch 2.6+
                    try:
                        from ultralytics.nn.tasks import DetectionModel
                        torch.serialization.add_safe_globals([DetectionModel])
                        print("✅ Added Ultralytics to PyTorch safe globals")
                    except ImportError:
                        print("⚠️  Could not import DetectionModel for safe globals, using env var")
            except ImportError:
                print("⚠️  torch not available, relying on environment variable")
        except Exception as import_error:
            print(f"❌ Error importing ultralytics: {import_error}")
            raise
        
        # Resolve model path; allow override via env var (generic YOLO)
        # Prefer well-known YOLO-FACE checkpoints, try multiple options
        candidates = []
        
        # If a specific model is requested, prioritize it but prepare fallbacks
        requested_model_paths = []
        if model_name:
            # Try both models/ directory and root directory
            model_paths = [
                os.path.join('models', model_name),
                model_name
            ]
            for path in model_paths:
                if os.path.isfile(path):
                    requested_model_paths.append(path)
                    print(f"Found requested model: {path}")
                    break
            # If not found locally, try downloading it
            if not requested_model_paths:
                requested_model_paths.append(model_name)
                print(f"Requested model not found locally, will try to download: {model_name}")
        
        env_model = os.getenv('YOLO_MODEL') or os.getenv('YOLO_FACE_MODEL')
        if env_model and not model_name:
            candidates.append(env_model)
            print(f"Using environment model: {env_model}")
        
        # Always prepare fallback models in priority order: best.pt → best-lite.pt → others
        # This ensures if requested model fails, we fall back properly
        local_models = [
            os.path.join('models', 'best.pt'),  # Custom trained model (highest priority)
            os.path.join('models', 'best-lite.pt'),  # Custom trained lite model (second priority)
            os.path.join('models', 'yolov8n-face.pt'),  # Nano model first (smallest)
            os.path.join('models', 'yolo11n-face.pt'),  # YOLO11 nano
            os.path.join('models', 'yolov8s-face.pt'),  # Small model
            os.path.join('models', 'yolo11s-face.pt'),   # YOLO11 small
            os.path.join('models', 'yolov5s-face.pt'),
            'best.pt',  # Custom trained model in root directory
            'best-lite.pt',  # Custom trained lite model in root directory
            'yolov8n-face.pt',  # Nano model first (smallest)
            'yolo11n-face.pt',  # YOLO11 nano
            'yolov8s-face.pt',  # Small model
            'yolo11s-face.pt',  # YOLO11 small
            'yolov5s-face.pt'
        ]
        
        # If specific model requested, try it first, then fallbacks
        if model_name and requested_model_paths:
            candidates.extend(requested_model_paths)
            # Add fallback models (excluding the requested one to avoid duplicates)
            for model in local_models:
                # Check if this model is different from requested
                model_name_only = os.path.basename(model) if os.path.sep in model or '/' in model or '\\' in model else model
                requested_name_only = os.path.basename(model_name) if os.path.sep in model_name or '/' in model_name or '\\' in model_name else model_name
                if model_name_only != requested_name_only and os.path.isfile(model):
                    candidates.append(model)
        else:
            # No specific model requested, use default priority order
            # Add local models that exist
            for model in local_models:
                if os.path.isfile(model):
                    candidates.append(model)
            
            # Only try downloading models if no local models found
            if not any(os.path.isfile(c) for c in local_models):
                print("No local models found, trying to download...")
                # Try general YOLO models (prefer nano to save memory)
                candidates.extend([
                    'yolov8n.pt',  # General YOLOv8 nano model (smallest, ~6MB)
                    # Don't add larger models to save memory
                ])
        
        print(f"Trying {len(candidates)} model candidates...")
        last_error = None
        for i, cand in enumerate(candidates):
            if not cand:
                continue
            try:
                print(f"  [{i+1}/{len(candidates)}] Trying: {cand}")
                # If local path with separator, ensure it exists
                if (os.path.sep in cand or '/' in cand or '\\' in cand) and not os.path.isfile(cand):
                    print(f"    ❌ File not found, skipping")
                    continue
                
                # Try loading with different strategies
                # TORCH_WEIGHTS_ONLY should already be False from import time
                try:
                    print(f"    🔄 Loading model: {cand}")
                    # Ensure environment is set (should already be set, but double-check)
                    os.environ['TORCH_WEIGHTS_ONLY'] = 'False'
                    
                    _YOLO_MODEL = YOLO(cand)
                    
                    # Test the model with a small dummy image to ensure it works
                    print(f"    🧪 Testing model with dummy image...")
                    import numpy as np
                    test_img = np.zeros((100, 100, 3), dtype=np.uint8)
                    _ = _YOLO_MODEL.predict(test_img, verbose=False)
                    _YOLO_MODEL_NAME = cand
                    print(f"    ✅ Successfully loaded and tested: {cand}")
                    return _YOLO_MODEL
                            
                except Exception as load_error:
                    error_str = str(load_error)
                    error_lower = error_str.lower()
                    
                    # Print full error for debugging
                    print(f"    ❌ Load error: {error_str[:300]}...")
                    
                    # If it's a weights-only error, try additional fixes
                    if "weights only" in error_lower or "weights_only" in error_lower or "weightsonly" in error_lower:
                        print(f"    ⚠️  PyTorch weights_only error detected")
                        print(f"    💡 Attempting fix with torch.serialization context...")
                        
                        try:
                            import torch
                            # Try to patch torch.load to use weights_only=False
                            # This is a workaround for PyTorch 2.6+ strict loading
                            original_load = torch.load
                            
                            def patched_load(*args, **kwargs):
                                kwargs['weights_only'] = False
                                return original_load(*args, **kwargs)
                            
                            torch.load = patched_load
                            
                            try:
                                _YOLO_MODEL = YOLO(cand)
                                import numpy as np
                                test_img = np.zeros((100, 100, 3), dtype=np.uint8)
                                _ = _YOLO_MODEL.predict(test_img, verbose=False)
                                _YOLO_MODEL_NAME = cand
                                print(f"    ✅ Successfully loaded with patched torch.load: {cand}")
                                return _YOLO_MODEL
                            finally:
                                torch.load = original_load
                        except Exception as patch_error:
                            print(f"    ❌ Patch attempt failed: {str(patch_error)[:200]}...")
                            # Fall through to raise original error
                    
                    # Re-raise the error to continue to next candidate
                    raise load_error
                        
            except Exception as e:
                last_error = e
                error_msg = str(e)
                error_msg_lower = error_msg.lower()
                
                # Print full error for debugging
                print(f"    ❌ Failed to load {cand}")
                print(f"       Error type: {type(e).__name__}")
                print(f"       Error message: {error_msg[:500]}")  # Show more of the error
                
                if "rate limit" in error_msg_lower:
                    print(f"    ⚠️  GitHub API rate limit exceeded")
                elif "weights only" in error_msg_lower or "weights_only" in error_msg_lower:
                    print(f"    ⚠️  PyTorch weights_only security error")
                    print(f"    💡 This model requires weights_only=False. Check if TORCH_WEIGHTS_ONLY is set correctly.")
                elif "file" in error_msg_lower and "not found" in error_msg_lower:
                    print(f"    ⚠️  Model file not found")
                elif "permission" in error_msg_lower or "access" in error_msg_lower:
                    print(f"    ⚠️  Permission/access error")
                else:
                    print(f"    ⚠️  Unknown error - see full message above")
                continue
        
        if last_error:
            print(f"❌ Failed to load any YOLO model after trying {len(candidates)} candidates")
            print(f"   Last error: {str(last_error)[:500]}")
            print(f"   💡 Troubleshooting:")
            print(f"      - Check if model files exist: models/best.pt, models/best-lite.pt")
            print(f"      - Verify PyTorch version: python -c 'import torch; print(torch.__version__)'")
            print(f"      - Check TORCH_WEIGHTS_ONLY setting: {os.environ.get('TORCH_WEIGHTS_ONLY', 'not set')}")
            if "weights only" in str(last_error).lower() or "weights_only" in str(last_error).lower():
                print(f"      - PyTorch 2.6+ requires weights_only=False for custom models")
                print(f"      - Try: export TORCH_WEIGHTS_ONLY=False (Linux/Mac) or set TORCH_WEIGHTS_ONLY=False (Windows)")
        else:
            print(f"❌ Failed to load any YOLO model. No models found to try.")
        return None
    except ImportError as e:
        print(f"❌ Error importing ultralytics: {e}")
        print("💡 Try installing with: pip install ultralytics")
        return None
    except Exception as e:
        print(f"❌ Error loading YOLO model: {e}")
        return None


app = Flask(__name__, static_folder='.', static_url_path='')

# Configure CORS to allow requests from Vercel frontend and local development
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
# Normalize frontend URL (remove trailing slash)
frontend_url = frontend_url.rstrip('/')

# Always include localhost for local development, even if FRONTEND_URL is set to deployed URL
default_origins = [
    'https://guest-go.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    frontend_url  # Include the FRONTEND_URL as well
]

# Get allowed origins from environment or use defaults
cors_origins_env = os.getenv('CORS_ORIGINS', ','.join(default_origins))
# Parse and combine with defaults to ensure localhost is always included
env_origins = [origin.strip() for origin in cors_origins_env.split(',') if origin.strip()]
# Merge and deduplicate
allowed_origins = list(set(env_origins + default_origins))

CORS(app, 
     origins=allowed_origins,
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True,
     expose_headers=['Content-Type'])

# Add after_request handler to ensure CORS headers are always sent, even on errors
@app.after_request
def after_request(response):
    """Ensure CORS headers are always present, even on error responses"""
    origin = request.headers.get('Origin')
    if origin and origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    elif not origin and request.method == 'OPTIONS':
        # Handle preflight requests - allow from any origin for OPTIONS
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response

# Error handlers to ensure CORS headers are sent on exceptions
@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with CORS headers"""
    origin = request.headers.get('Origin')
    response = jsonify({'error': 'Internal server error', 'message': str(error)})
    if origin and origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors with CORS headers"""
    origin = request.headers.get('Origin')
    response = jsonify({'error': 'Not found', 'message': str(error)})
    if origin and origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 404

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 errors with CORS headers"""
    origin = request.headers.get('Origin')
    response = jsonify({'error': 'Bad request', 'message': str(error)})
    if origin and origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
        response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 400

# Global variable to store the uploaded face features
uploaded_face_features = None

# Create models directory if it doesn't exist
models_dir = 'models'
if not os.path.exists(models_dir):
    os.makedirs(models_dir)
    print(f"📁 Created models directory: {models_dir}")

# Initialize model on startup - DISABLED to save memory
# Models will be loaded lazily on first use
# Set ENABLE_YOLO_ON_STARTUP=true to load on startup (uses more memory)
enable_yolo_on_startup = os.getenv('ENABLE_YOLO_ON_STARTUP', 'false').lower() == 'true'

if enable_yolo_on_startup:
    print("Initializing face detection model on startup...")
    try:
        _get_yolo_model()
        if _YOLO_MODEL is not None:
            # Mark as explicitly loaded (via startup, not Step 1, but still counts)
            _YOLO_MODEL_EXPLICITLY_LOADED = True
            print(f"✅ YOLO model loaded successfully: {_YOLO_MODEL_NAME}")
        else:
            print("⚠️  YOLO model failed to load, will use MediaPipe fallback")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        print("⚠️  Will use MediaPipe fallback for face detection")
else:
    print("⚠️  YOLO model loading deferred (lazy loading) to save memory")
    print("    Models will be loaded on first use. Set ENABLE_YOLO_ON_STARTUP=true to load on startup.")
    print("    For Step 1 testing: Select and reload a model to use YOLO, otherwise MediaPipe will be used.")

def process_image(image_data, max_size=1280):
    """Process image data from base64 string with memory optimization"""
    # Remove data URL prefix if present
    if ',' in image_data:
        image_data = image_data.split(',')[1]
    
    # Decode base64 image
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Resize image if too large to save memory (face detection doesn't need full resolution)
    width, height = image.size
    if max(width, height) > max_size:
        # Calculate new size maintaining aspect ratio
        if width > height:
            new_width = max_size
            new_height = int(height * (max_size / width))
        else:
            new_height = max_size
            new_width = int(width * (max_size / height))
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f"  📐 Resized image from {width}x{height} to {new_width}x{new_height} to save memory")
    
    # Convert to numpy array
    image_array = np.array(image)
    
    # Explicitly delete the PIL image to free memory
    del image
    
    return image_array

def detect_faces_yolo(image: np.ndarray) -> Dict[str, dict]:
    """Detect the best face using a YOLO face model (Ultralytics).

    Loads a YOLO face model (configurable) and returns the best face with
    keys: 'score' and 'facial_area' [x1,y1,x2,y2].
    """
    try:
        # Check if YOLO is disabled via environment variable
        if os.getenv('DISABLE_YOLO', 'false').lower() == 'true':
            print("  ⚠️  YOLO disabled via DISABLE_YOLO environment variable")
            return {}
        
        model = _get_yolo_model()
        if model is None:
            return {}

        # Inference settings tuned for faces - use smaller image size to save memory
        # Default to 640 instead of larger sizes
        infer_imgsz = int(os.getenv('YOLO_IMGSZ', os.getenv('YOLO_FACE_IMGSZ', '640')))
        # Cap at 640 to save memory
        infer_imgsz = min(infer_imgsz, 640)
        conf_thr = float(os.getenv('YOLO_CONF', os.getenv('YOLO_FACE_CONF', '0.25')))
        iou_thr = float(os.getenv('YOLO_IOU', os.getenv('YOLO_FACE_IOU', '0.5')))

        # Run inference (Ultralytics accepts numpy arrays in RGB)
        # Use device='cpu' explicitly to avoid GPU memory issues
        results = model.predict(image, imgsz=infer_imgsz, conf=conf_thr, iou=iou_thr, agnostic_nms=False, verbose=False, device='cpu')
        if not results:
            return {}

        # Take first image's results
        res = results[0]
        boxes = getattr(res, 'boxes', None)
        # Retry with more permissive settings if initial pass found no boxes
        if boxes is None or len(boxes) == 0:
            try:
                retry_imgsz = max(640, int(infer_imgsz * 1.5))
                retry_imgsz = min(640, retry_imgsz)  # Cap at 640 to save memory
                retry_conf = min(0.20, conf_thr * 0.7)
                retry_iou = max(0.45, iou_thr * 0.9)
                results = model.predict(image, imgsz=retry_imgsz, conf=retry_conf, iou=retry_iou, agnostic_nms=False, verbose=False, device='cpu')
                if not results:
                    return {}
                res = results[0]
                boxes = getattr(res, 'boxes', None)
                if boxes is None or len(boxes) == 0:
                    return {}
            except Exception:
                return {}

        # Select best face by combined score: confidence + area + center proximity
        h, w = image.shape[0], image.shape[1]
        img_area = float(max(1, w * h))
        cx_img, cy_img = w / 2.0, h / 2.0

        best_metric = -1.0
        best_score = 0.0
        best_bbox = None
        for b in boxes:
            xyxy = b.xyxy.cpu().numpy()[0]
            score = float(b.conf.cpu().numpy()[0] if getattr(b, 'conf', None) is not None else 0.0)
            x1, y1, x2, y2 = [int(max(0, v)) for v in xyxy]
            if x2 <= x1 or y2 <= y1:
                continue
            bw = x2 - x1
            bh = y2 - y1
            area_ratio = (bw * bh) / img_area
            cx = x1 + bw / 2.0
            cy = y1 + bh / 2.0
            dist = np.hypot(cx - cx_img, cy - cy_img)
            max_dist = np.hypot(cx_img, cy_img)
            center_bonus = 1.0 - (dist / max_dist if max_dist > 0 else 0.0)
            # Weighted metric: emphasize confidence, then area, then center
            metric = (score * 0.7) + (min(area_ratio, 0.25) * 0.25) + (max(0.0, center_bonus) * 0.05)
            if metric > best_metric:
                best_metric = metric
                best_score = score
                best_bbox = [x1, y1, x2, y2]

        if best_bbox is None:
            return {}

        # Optional padding around bbox to include full face context
        pad_ratio = float(os.getenv('YOLO_PAD', os.getenv('YOLO_FACE_PAD', '0.06')))
        if pad_ratio > 0:
            x1, y1, x2, y2 = best_bbox
            bw = x2 - x1
            bh = y2 - y1
            px = int(bw * pad_ratio)
            py = int(bh * pad_ratio)
            x1 = max(0, x1 - px)
            y1 = max(0, y1 - py)
            x2 = min(w - 1, x2 + px)
            y2 = min(h - 1, y2 + py)
            best_bbox = [x1, y1, x2, y2]

        return {
            'face_0': {
                'score': float(best_score),
                'facial_area': [int(v) for v in best_bbox]
            }
        }
    except Exception as e:
        print(f"Error in YOLO face detection: {e}")
        return {}

def detect_faces(image: np.ndarray) -> Dict[str, dict]:
    """Try YOLO first if model is loaded, then fall back to MediaPipe if no face is found.
    In production: If ENABLE_YOLO_ON_STARTUP=true, models load automatically and YOLO is tried first.
    In local dev: Only tries YOLO if model was explicitly loaded via Step 1."""
    print("🔍 Starting face detection...")
    
    # Try YOLO if model is loaded (either via startup or Step 1 reload)
    if _YOLO_MODEL is not None:
        try:
            print("  Trying YOLO detection...")
            faces = detect_faces_yolo(image) or {}
            if faces:
                print(f"  ✅ YOLO found {len(faces)} face(s)")
                return faces
            else:
                print("  ❌ YOLO found no faces")
        except Exception as e:
            print(f"  ❌ YOLO error: {e}")
    else:
        # Check if we're in production and should try loading models
        is_production = os.getenv('RENDER', '').lower() == 'true' or \
                       (os.getenv('FRONTEND_URL', '') and 'localhost' not in os.getenv('FRONTEND_URL', ''))
        
        if is_production and not _YOLO_MODEL_EXPLICITLY_LOADED:
            # In production, if ENABLE_YOLO_ON_STARTUP was false but models exist, try lazy loading once
            enable_startup = os.getenv('ENABLE_YOLO_ON_STARTUP', 'false').lower() == 'true'
            if not enable_startup:
                print("  ℹ️  No YOLO model loaded, using MediaPipe directly")
            else:
                print("  ℹ️  YOLO model not available, using MediaPipe")
        else:
            print("  ℹ️  No YOLO model loaded, using MediaPipe directly")
    
    # Use MediaPipe (more permissive for uploads/metrics)
    try:
        print("  Trying MediaPipe detection...")
        # Use a slightly lower confidence and looser area gating
        faces = detect_faces_mediapipe_custom(image, min_confidence=0.5) or {}
        if faces:
            print(f"  ✅ MediaPipe found {len(faces)} face(s)")
        else:
            print("  ❌ MediaPipe found no faces")
        return faces
    except Exception as e:
        print(f"  ❌ MediaPipe error: {e}")
        # Last resort: try with very low confidence
        try:
            print("  Trying MediaPipe with low confidence...")
            faces = detect_faces_mediapipe_any(image, min_confidence=0.1) or {}
            if faces:
                print(f"  ✅ MediaPipe (low conf) found {len(faces)} face(s)")
            return faces
        except Exception as e2:
            print(f"  ❌ MediaPipe (low conf) error: {e2}")
            return {}

def detect_faces_mediapipe(image):
    """Detect the best face using MediaPipe FaceDetection and return one face.

    Returns a dict similar to detect_faces_opencv with one entry 'face_0'
    containing keys: 'score' (float 0..1) and 'facial_area' [x1, y1, x2, y2].
    """
    try:
        # MediaPipe expects RGB input; our image is RGB already
        height, width = image.shape[0], image.shape[1]

        mp_fd = mp.solutions.face_detection
        # model_selection=1 is for faces further from the camera; 0 for close-range
        # min_detection_confidence controls filtering of weak detections
        with mp_fd.FaceDetection(model_selection=1, min_detection_confidence=0.6) as detector:
            results = detector.process(image)

        if not results or not results.detections:
            return {}

        best_score = 0.0
        best_bbox = None

        for det in results.detections:
            # Confidence score
            score = 0.0
            if det.score and len(det.score) > 0:
                score = float(det.score[0])

            # Bounding box in relative coordinates
            rel = det.location_data.relative_bounding_box
            x = int(max(0, rel.xmin) * width)
            y = int(max(0, rel.ymin) * height)
            w = int(max(0, rel.width) * width)
            h = int(max(0, rel.height) * height)

            # Convert to [x1, y1, x2, y2] and clamp to image bounds
            x1 = max(0, x)
            y1 = max(0, y)
            x2 = min(width - 1, x + w)
            y2 = min(height - 1, y + h)

            # Keep only reasonable boxes
            if x2 <= x1 or y2 <= y1:
                continue

            # Collect keypoints (landmarks) in absolute pixels if available
            keypoints = []
            if det.location_data and det.location_data.relative_keypoints:
                for kp in det.location_data.relative_keypoints:
                    keypoints.append([
                        int(kp.x * width),
                        int(kp.y * height)
                    ])

            # Track best by score, tie-breaker by area
            area = (x2 - x1) * (y2 - y1)
            if score > best_score or (abs(score - best_score) < 1e-6 and best_bbox is not None and area > (best_bbox[2]-best_bbox[0])*(best_bbox[3]-best_bbox[1])):
                best_score = score
                best_bbox = [x1, y1, x2, y2]
                best_keypoints = keypoints

        if best_bbox is None:
            return {}

        # Enforce full-face constraints
        x1, y1, x2, y2 = best_bbox
        width, height = image.shape[1], image.shape[0]
        face_w = x2 - x1
        face_h = y2 - y1
        area_ratio = (face_w * face_h) / float(width * height) if width * height > 0 else 0.0
        pad_x = int(0.02 * width)
        pad_y = int(0.02 * height)
        touches_border = (x1 <= pad_x) or (y1 <= pad_y) or (x2 >= width - pad_x) or (y2 >= height - pad_y)
        if area_ratio < 0.06 or touches_border:
            # Not a full-face capture
            return {}

        return {
            'face_0': {
                'score': float(best_score),
                'facial_area': [int(v) for v in best_bbox],
                'keypoints': best_keypoints if 'best_keypoints' in locals() else []
            }
        }
    except Exception as e:
        print(f"Error in MediaPipe face detection: {e}")
        return {}

def detect_faces_mediapipe_custom(image, min_confidence: float = 0.6):
    """MediaPipe FaceDetection with adjustable min_detection_confidence for flexible use (e.g., metrics).

    Returns a dict with one best 'face_0' when passing quality checks; otherwise empty dict.
    """
    try:
        height, width = image.shape[0], image.shape[1]
        mp_fd = mp.solutions.face_detection
        min_conf = max(0.1, min(0.99, float(min_confidence)))
        with mp_fd.FaceDetection(model_selection=1, min_detection_confidence=min_conf) as detector:
            results = detector.process(image)
        if not results or not results.detections:
            return {}
        best_score = 0.0
        best_bbox = None
        for det in results.detections:
            score = float(det.score[0]) if (det.score and len(det.score) > 0) else 0.0
            rel = det.location_data.relative_bounding_box
            x = int(max(0, rel.xmin) * width)
            y = int(max(0, rel.ymin) * height)
            w = int(max(0, rel.width) * width)
            h = int(max(0, rel.height) * height)
            x1 = max(0, x)
            y1 = max(0, y)
            x2 = min(width - 1, x + w)
            y2 = min(height - 1, y + h)
            if x2 <= x1 or y2 <= y1:
                continue
            area = (x2 - x1) * (y2 - y1)
            if score > best_score or (abs(score - best_score) < 1e-6 and best_bbox is not None and area > (best_bbox[2]-best_bbox[0])*(best_bbox[3]-best_bbox[1])):
                best_score = score
                best_bbox = [x1, y1, x2, y2]
        if best_bbox is None:
            return {}
        # Looser quality checks for metrics
        x1, y1, x2, y2 = best_bbox
        face_w = x2 - x1
        face_h = y2 - y1
        area_ratio = (face_w * face_h) / float(width * height) if width * height > 0 else 0.0
        if area_ratio < 0.03:  # more permissive than enrollment path
            return {}
        return {
            'face_0': {
                'score': float(best_score),
                'facial_area': [int(v) for v in best_bbox]
            }
        }
    except Exception as e:
        print(f"Error in MediaPipe custom detection: {e}")
        return {}

def detect_faces_mediapipe_any(image, min_confidence: float = 0.3):
    """MediaPipe detection without strict full-face gating. Returns best face if any."""
    try:
        height, width = image.shape[0], image.shape[1]
        mp_fd = mp.solutions.face_detection
        min_conf = max(0.05, min(0.99, float(min_confidence)))
        with mp_fd.FaceDetection(model_selection=1, min_detection_confidence=min_conf) as detector:
            results = detector.process(image)
        if not results or not results.detections:
            return {}
        best_score = 0.0
        best_bbox = None
        for det in results.detections:
            score = float(det.score[0]) if (det.score and len(det.score) > 0) else 0.0
            rel = det.location_data.relative_bounding_box
            x = int(max(0, rel.xmin) * width)
            y = int(max(0, rel.ymin) * height)
            w = int(max(0, rel.width) * width)
            h = int(max(0, rel.height) * height)
            x1 = max(0, x)
            y1 = max(0, y)
            x2 = min(width - 1, x + w)
            y2 = min(height - 1, y + h)
            if x2 <= x1 or y2 <= y1:
                continue
            area = (x2 - x1) * (y2 - y1)
            if score > best_score or (abs(score - best_score) < 1e-6 and best_bbox is not None and area > (best_bbox[2]-best_bbox[0])*(best_bbox[3]-best_bbox[1])):
                best_score = score
                best_bbox = [x1, y1, x2, y2]
        if best_bbox is None:
            return {}
        return {
            'face_0': {
                'score': float(best_score),
                'facial_area': [int(v) for v in best_bbox]
            }
        }
    except Exception as e:
        print(f"Error in MediaPipe any detection: {e}")
        return {}

def extract_face_features(image, face_rect):
    """Extract face features using OpenCV's LBPH face recognizer"""
    try:
        x, y, w, h = face_rect
        face_roi = image[y:y+h, x:x+w]
        
        # Resize face to standard size
        face_resized = cv2.resize(face_roi, (100, 100))
        
        # Convert to grayscale
        face_gray = cv2.cvtColor(face_resized, cv2.COLOR_RGB2GRAY)
        
        # Apply histogram equalization
        face_equalized = cv2.equalizeHist(face_gray)
        
        # Extract LBP features (simplified)
        # For a more robust solution, we'll use the face region itself as features
        return face_equalized.flatten()
    except Exception as e:
        print(f"Error extracting face features: {e}")
        return None

def compare_face_features(features1, features2, threshold=0.75):
    """Compare two face feature vectors using correlation"""
    try:
        if features1 is None or features2 is None:
            return False, 0.0
        
        # Normalize the features
        features1_norm = features1 / np.linalg.norm(features1)
        features2_norm = features2 / np.linalg.norm(features2)
        
        # Calculate correlation coefficient
        correlation = np.corrcoef(features1_norm, features2_norm)[0, 1]
        
        # Handle NaN case
        if np.isnan(correlation):
            return False, 0.0
        
        # Convert correlation to similarity (0-1 scale)
        similarity = (correlation + 1) / 2
        
        # Ensure we return proper Python types
        is_match = bool(similarity > threshold)
        similarity_float = float(similarity)
        
        return is_match, similarity_float
    except Exception as e:
        print(f"Error comparing faces: {e}")
        return False, 0.0

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/favicon.ico')
def favicon():
    # Serve the guestgo logo as favicon
    # Path is relative to project root: public/guestgo-logo.png
    # Get the project root (go up from src/utils/Python-AI to project root)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(current_dir, '..', '..', '..')
    logo_path = os.path.join(project_root, 'public', 'guestgo-logo.png')
    # Normalize the path
    logo_path = os.path.normpath(logo_path)
    if os.path.exists(logo_path):
        return send_file(logo_path, mimetype='image/png')
    else:
        # Fallback: return 404 or a default response
        return '', 404


@app.route('/status')
def api_status():
    """Get API connectivity status"""
    try:
        # Check if frontend is accessible
        print("🔍 Status endpoint called - checking frontend connectivity...")
        frontend_connected = check_frontend_connectivity()
        print(f"🔍 Frontend connected: {frontend_connected}")
        # Determine environment (local vs deployed)
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173/')
        is_render_env = os.getenv('RENDER', '').lower() == 'true'
        is_local = ('localhost' in frontend_url) or ('127.0.0.1' in frontend_url)
        is_deployed = not is_local or is_render_env
        environment = 'deployed' if is_deployed else 'local'
        
        return jsonify({
            'status': 'running',
            'api_connected': True,
            'main_app_connected': frontend_connected,
            'frontend_connected': frontend_connected,  # Add explicit field for frontend
            'main_app_url': os.getenv('FRONTEND_URL', 'http://localhost:5173/'),
            'api_version': '1.0.0',
            'endpoints': [
                '/status - Get API connectivity status',
                '/ping - Simple connectivity test',
                '/test-connection - Main application connection test',
                '/detect-face-base64 - Detect faces in base64 encoded image',
                '/upload - Upload and process face image for enrollment',
                '/compare - Compare faces for verification',
                '/metrics/analyze-image - Analyze image quality metrics',
                '/metrics/verify-images - Verify image quality for face detection',
                '/reload-model - Manually reload the YOLO model',
                '/list-models - List available YOLO models',
                '/download-model - Download and cache YOLO models'
            ],
            'connectivity': {
                'python_service': True,
                'main_application': frontend_connected,
                'bidirectional': frontend_connected
            },
            # Environment awareness for UI logic
            'environment': environment,          # 'local' | 'deployed'
            'is_local': bool(is_local),
            'is_deployed': bool(is_deployed),
            'visibility': {
                # If local, show local status and hide deployed; if deployed, inverse
                'show_local_status': bool(is_local and not is_deployed),
                'show_deployed_status': bool(is_deployed)
            }
        })
    except Exception as e:
        print(f"❌ Error in status endpoint: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'api_connected': False,
            'main_app_connected': False,
            'main_app_url': os.getenv('FRONTEND_URL', 'http://localhost:5173/'),
            'environment': 'unknown',
            'is_local': None,
            'is_deployed': None,
            'visibility': {
                'show_local_status': False,
                'show_deployed_status': False
            },
            'connectivity': {
                'python_service': True,
                'main_application': False,
                'bidirectional': False
            }
        }), 500

def check_frontend_connectivity():
    """Check if the main application at localhost:5173 is accessible and can connect back"""
    try:
        # Check the specific main application URL (use environment variable if available)
        main_app_url = os.getenv('FRONTEND_URL', 'http://localhost:5173/')
        
        try:
            print(f"🔍 Checking main application at {main_app_url}...")
            response = requests.get(main_app_url, timeout=3)
            if response.status_code == 200:
                # Look for main application indicators (case insensitive)
                content_lower = response.text.lower()
                if any(keyword in content_lower for keyword in [
                    'guestgo', 'guest-go', 'main', 'app', 'dashboard', 
                    'guard', 'face detection', 'entrance', 'exit', 'visit',
                    'vite', 'typescript', 'module'
                ]):
                    print(f"✅ Main application detected at {main_app_url}")
                    print(f"✅ Bidirectional connection assumed (main app is calling our API)")
                    return True
                else:
                    print(f"⚠️  Application found at {main_app_url} but doesn't appear to be GuestGo")
                    print(f"   Content preview: {response.text[:200]}...")
                    # Still return True if we can reach the frontend, even if content check fails
                    print(f"✅ Allowing connection despite content check failure")
                    return True
            else:
                print(f"❌ Main application returned status {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            print(f"⏱️  Main application at {main_app_url} timed out")
            return False
        except requests.exceptions.ConnectionError:
            print(f"❌ Main application at {main_app_url} connection refused")
            return False
        except Exception as e:
            print(f"⚠️  Main application error: {str(e)[:50]}...")
            return False
        
    except ImportError:
        print("⚠️  requests library not available for connectivity check")
        return False
    except Exception as e:
        print(f"⚠️  Error checking main application connectivity: {e}")
        return False

def test_bidirectional_connection(frontend_port):
    """Test if the frontend can reach back to our AI service"""
    try:
        # This simulates what the frontend would do - check our status endpoint
        # In a real scenario, the frontend would make this call
        api_url = os.getenv('API_URL', f'http://localhost:{os.getenv("PORT", 5000)}')
        response = requests.get(f'{api_url}/status', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Frontend can reach AI service: {data.get('status')}")
            return True
        print(f"❌ Frontend got status code: {response.status_code}")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ Frontend cannot reach AI service: Connection timeout")
        return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Frontend cannot reach AI service: Connection refused")
        return False
    except Exception as e:
        print(f"❌ Frontend cannot reach AI service: {e}")
        return False


@app.route('/reload-model', methods=['POST'])
def reload_model():
    """Manually reload the YOLO model, optionally with a specific model name.
    If specific model fails, falls back to priority order: best.pt → best-lite.pt → others"""
    global _YOLO_MODEL, _YOLO_MODEL_NAME, _YOLO_MODEL_EXPLICITLY_LOADED
    try:
        data = request.get_json() or {}
        model_name = data.get('model_name')
        
        # Reset model cache
        _YOLO_MODEL = None
        _YOLO_MODEL_NAME = None
        _YOLO_MODEL_EXPLICITLY_LOADED = False
        
        # Try to load model (with optional specific model name)
        # If specific model fails, _get_yolo_model will fall back to priority order
        model = _get_yolo_model(model_name=model_name)
        if model is not None:
            loaded_model = _YOLO_MODEL_NAME
            # Mark that a model was explicitly loaded via Step 1
            _YOLO_MODEL_EXPLICITLY_LOADED = True
            # Check if the loaded model matches what was requested
            if model_name and loaded_model and model_name not in loaded_model:
                return jsonify({
                    'success': True,
                    'message': f'Requested model "{model_name}" failed to load. Loaded fallback model: {loaded_model}',
                    'model_name': loaded_model,
                    'fallback_used': True,
                    'requested_model': model_name
                })
            else:
                return jsonify({
                    'success': True,
                    'message': f'Model reloaded successfully: {loaded_model}',
                    'model_name': loaded_model,
                    'fallback_used': False
                })
        else:
            # Get more details about why loading failed
            error_details = ""
            if _YOLO_MODEL_NAME is None:
                # Check if models directory exists and has files
                models_dir = 'models'
                if os.path.exists(models_dir):
                    model_files = [f for f in os.listdir(models_dir) if f.endswith('.pt')]
                    if model_files:
                        error_details = f" Found {len(model_files)} model file(s) but failed to load them. Check server logs for details."
                    else:
                        error_details = " No .pt files found in models/ directory."
                else:
                    error_details = " models/ directory does not exist."
            
            return jsonify({
                'success': False,
                'message': f'Failed to load YOLO model, will use MediaPipe fallback.{error_details}',
                'model_name': '',
                'suggestion': 'Check server console logs for detailed error messages. Common issues: PyTorch weights_only error (PyTorch 2.6+), missing model files, or incompatible model format.'
            })
    except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'message': 'Error reloading model'
            }), 500

@app.route('/clear-model', methods=['POST'])
def clear_model():
    """Clear/unload the YOLO model to use MediaPipe instead"""
    global _YOLO_MODEL, _YOLO_MODEL_NAME, _YOLO_MODEL_EXPLICITLY_LOADED
    try:
        previous_model = _YOLO_MODEL_NAME
        _YOLO_MODEL = None
        _YOLO_MODEL_NAME = None
        _YOLO_MODEL_EXPLICITLY_LOADED = False
        
        return jsonify({
            'success': True,
            'message': f'Model cleared successfully. MediaPipe will be used for face detection.',
            'previous_model': previous_model
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error clearing model'
        }), 500

@app.route('/list-models', methods=['GET'])
def list_models():
    """List available models in the models directory and root"""
    try:
        available_models = []
        
        # Check models directory
        models_dir = 'models'
        if os.path.exists(models_dir):
            try:
                for file in os.listdir(models_dir):
                    if file.endswith('.pt'):
                        full_path = os.path.join(models_dir, file)
                        if os.path.isfile(full_path):
                            available_models.append({
                                'name': file,
                                'path': full_path,
                                'location': 'models/'
                            })
            except Exception as e:
                print(f"Error reading models directory: {e}")
        
        # Check root directory
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            for file in os.listdir(current_dir):
                if file.endswith('.pt'):
                    full_path = os.path.join(current_dir, file)
                    if os.path.isfile(full_path):
                        # Avoid duplicates
                        if not any(m['name'] == file for m in available_models):
                            available_models.append({
                                'name': file,
                                'path': file,  # Use relative path for consistency
                                'location': 'root'
                            })
        except Exception as e:
            print(f"Error reading root directory: {e}")
        
        # Get current model
        current_model = _YOLO_MODEL_NAME if _YOLO_MODEL_NAME else None
        
        return jsonify({
            'success': True,
            'models': available_models,
            'current_model': current_model,
            'count': len(available_models)
        })
    except Exception as e:
        print(f"Error in list_models endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e),
            'models': [],
            'current_model': None,
            'count': 0
        }), 500

@app.route('/ping', methods=['GET', 'POST'])
def ping():
    """Simple ping endpoint for connectivity testing"""
    return jsonify({
        'status': 'pong',
        'timestamp': time.time(),
        'service': 'python-ai-face-detection',
        'message': 'Python AI service is responding'
    })

@app.route('/health', methods=['GET'])
def health():
    """Lightweight health check endpoint for load balancers"""
    return jsonify({
        'status': 'healthy',
        'service': 'python-ai-face-detection',
        'timestamp': time.time()
    }), 200

@app.route('/test-connection', methods=['GET', 'POST'])
def test_connection():
    """Test endpoint for guard dashboard to verify API connection"""
    try:
        # Get client IP and port info
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        
        return jsonify({
            'status': 'success',
            'message': 'Guard dashboard API connection successful',
            'timestamp': time.time(),
            'client_ip': client_ip,
            'api_status': 'running',
            'available_endpoints': [
                '/status - Get API connectivity status',
                '/ping - Simple connectivity test',
                '/test-connection - This endpoint for guard dashboard testing',
                '/detect-face-base64 - Detect faces in base64 encoded image',
                '/upload - Upload and process face image for enrollment',
                '/compare - Compare faces for verification',
                '/metrics/analyze-image - Analyze image quality metrics',
                '/metrics/verify-images - Verify image quality for face detection',
                '/reload-model - Manually reload the YOLO model',
                '/list-models - List available YOLO models',
                '/download-model - Download and cache YOLO models'
            ]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'API connection test failed: {str(e)}',
            'timestamp': time.time()
        }), 500

@app.route('/download-model', methods=['POST'])
def download_model():
    """Download and cache a YOLO model for offline use"""
    try:
        data = request.get_json()
        model_name = data.get('model_name', 'yolov8n.pt')
        
        if not model_name:
            return jsonify({'error': 'Model name is required'}), 400
        
        # Ensure models directory exists
        if not os.path.exists('models'):
            os.makedirs('models')
        
        # Try to download the model
        try:
            from ultralytics import YOLO
            print(f"Downloading model: {model_name}")
            model = YOLO(model_name)
            
            # Test the model
            import numpy as np
            test_img = np.zeros((100, 100, 3), dtype=np.uint8)
            _ = model.predict(test_img, verbose=False)
            
            # Save model info
            model_info = {
                'model_name': model_name,
                'downloaded_at': str(np.datetime64('now')),
                'status': 'ready'
            }
            
            return jsonify({
                'success': True,
                'message': f'Model {model_name} downloaded and cached successfully',
                'model_info': model_info
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Failed to download model: {str(e)}',
                'message': 'Model download failed'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Error downloading model'
        }), 500

@app.route('/upload', methods=['POST'])
def upload_image():
    global uploaded_face_features
    
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Process the uploaded image
        image = process_image(image_data)
        
        # Detect faces using YOLO (fallback to MediaPipe if needed)
        faces = detect_faces(image)
        
        if not faces:
            # Check if a partial/incomplete face is present to give clearer guidance
            partial = detect_faces_mediapipe_any(image, min_confidence=0.3) or {}
            partial_faces = []
            if partial:
                for face_id, face_data in partial.items():
                    partial_faces.append({
                        'id': face_id,
                        'confidence': float(face_data.get('score', 0.0)),
                        'bbox': [int(x) for x in face_data.get('facial_area', [])]
                    })
            result = jsonify({
                'success': False,
                'faces_detected': len(partial_faces),
                'faces': partial_faces,
                'message': 'Face not full. Please center your face fully within the frame.'
            }), 200
            
            # Clean up memory before returning
            del image
            gc.collect()
            
            return result
        
        # Extract features from the first (and only) detected face
        first_face = list(faces.values())[0]
        face_rect = first_face['facial_area']
        x, y, x2, y2 = face_rect
        w, h = x2 - x, y2 - y
        
        face_features = extract_face_features(image, (x, y, w, h))
        
        if face_features is None:
            return jsonify({'error': 'Could not extract face features'}), 400
        
        # Store the face features for comparison
        uploaded_face_features = face_features
        
        # Prepare face detection results
        face_results = []
        for i, (face_id, face_data) in enumerate(faces.items()):
            face_results.append({
                'id': face_id,
                'confidence': float(face_data['score']),
                'bbox': [int(x) for x in face_data['facial_area']]  # Convert numpy int32 to Python int
            })
        
        # Get confidence for message
        confidence = face_data['score']
        
        result = jsonify({
            'success': True,
            'faces_detected': len(faces),
            'faces': face_results,
            'message': f'Image uploaded and best face detected successfully (confidence: {confidence:.1%})'
        })
        
        # Clean up memory after processing
        del image
        gc.collect()
        
        return result
        
    except Exception as e:
        # Clean up memory even on error
        gc.collect()
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

@app.route('/compare', methods=['POST'])
def compare_faces():
    global uploaded_face_features
    
    if uploaded_face_features is None:
        return jsonify({'error': 'No uploaded face to compare with'}), 400
    
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Process the camera image
        image = process_image(image_data)
        
        # Detect faces in camera image using MediaPipe (verification uses MediaPipe)
        faces = detect_faces_mediapipe(image)
        
        if not faces:
            # If a partial face exists, inform the user accordingly and provide bbox for guidance
            partial = detect_faces_mediapipe_any(image, min_confidence=0.3) or {}
            if partial:
                first = list(partial.values())[0]
                x1, y1, x2, y2 = first.get('facial_area', [0,0,0,0])
                return jsonify({
                    'match': False,
                    'message': 'Face not full. Please align your face within the guide circle.',
                    'bbox': [int(x1), int(y1), int(x2), int(y2)]
                })
            return jsonify({'match': False, 'message': 'No faces detected in camera'})
        
        # Extract features from the first detected face (aligned by bbox)
        first_face = list(faces.values())[0]
        face_rect = first_face['facial_area']
        x, y, x2, y2 = face_rect
        w, h = x2 - x, y2 - y
        
        camera_face_features = extract_face_features(image, (x, y, w, h))
        
        if camera_face_features is None:
            return jsonify({'match': False, 'message': 'Could not extract face features from camera'})
        
        # Compare faces
        is_match, similarity = compare_face_features(uploaded_face_features, camera_face_features)
        
        result = jsonify({
            'match': bool(is_match),
            'confidence': float(similarity),
            'distance': float(1 - similarity),
            'bbox': [int(x), int(y), int(x2), int(y2)],
            'face_confidence': float(first_face.get('score', 0.0))
        })
        
        # Clean up memory after processing
        del image
        gc.collect()
        
        return result
        
    except Exception as e:
        # Clean up memory even on error
        gc.collect()
        return jsonify({'error': f'Error comparing faces: {str(e)}'}), 500

@app.route('/metrics/analyze-image', methods=['POST'])
def metrics_analyze_image():
    try:
        data = request.get_json()
        image_data = data.get('image') if data else None
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        image = process_image(image_data)
        # Lazy import to avoid circulars
        from metrics import analyze_image_with_both_algorithms
        results = analyze_image_with_both_algorithms(image)
        result = jsonify(results)
        
        # Clean up memory after processing
        del image
        gc.collect()
        
        return result
    except Exception as e:
        # Clean up memory even on error
        gc.collect()
        return jsonify({'error': f'Error analyzing image: {str(e)}'}), 500

@app.route('/metrics/verify-images', methods=['POST'])
def metrics_verify_images():
    """Verification metrics using MediaPipe for both base and probe, then feature comparison."""
    try:
        data = request.get_json()
        base_image_data = (data or {}).get('base_image')
        probe_image_data = (data or {}).get('probe_image')
        if not base_image_data or not probe_image_data:
            return jsonify({'error': 'Both base_image and probe_image are required'}), 400

        base_img = process_image(base_image_data)
        probe_img = process_image(probe_image_data)

        # Detect both base and probe with MediaPipe using a slightly lower confidence for metrics
        base_faces = detect_faces_mediapipe_custom(base_img, min_confidence=0.5) or {}
        probe_faces = detect_faces_mediapipe_custom(probe_img, min_confidence=0.5) or {}

        base_info = {'found': False}
        probe_info = {'found': False}
        is_match = False
        similarity = 0.0
        distance = 1.0

        if base_faces:
            bf = list(base_faces.values())[0]
            x1, y1, x2, y2 = bf['facial_area']
            base_feat = extract_face_features(base_img, (x1, y1, x2 - x1, y2 - y1))
            base_info = {
                'found': True,
                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                'score': float(bf.get('score', 0.0))
            }
        else:
            base_feat = None

        if probe_faces:
            pf = list(probe_faces.values())[0]
            x1, y1, x2, y2 = pf['facial_area']
            probe_feat = extract_face_features(probe_img, (x1, y1, x2 - x1, y2 - y1))
            probe_info = {
                'found': True,
                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                'score': float(pf.get('score', 0.0))
            }
        else:
            probe_feat = None

        if base_feat is not None and probe_feat is not None:
            is_match, similarity = compare_face_features(base_feat, probe_feat)
            distance = float(1.0 - float(similarity))

        result = jsonify({
            'base': base_info,
            'probe': probe_info,
            'match': bool(is_match),
            'similarity': float(similarity),
            'distance': float(distance)
        })
        
        # Clean up memory after processing
        del base_img
        del probe_img
        gc.collect()
        
        return result
    except Exception as e:
        # Clean up memory even on error
        gc.collect()
        return jsonify({'error': f'Error verifying images: {str(e)}'}), 500

@app.route('/detect-face-base64', methods=['POST'])
def detect_face_base64():
    """Detect faces in a base64 encoded image and return face coordinates in BlazeFace format."""
    try:
        data = request.get_json()
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Process the image
        image = process_image(image_data)
        height, width = image.shape[0], image.shape[1]
        
        # Detect faces using YOLO (fallback to MediaPipe if needed)
        faces = detect_faces(image)
        
        if not faces:
            return jsonify({
                'success': True,
                'faces': []
            }), 200
        
        # Convert to BlazeFace format
        blazeface_faces = []
        for face_id, face_data in faces.items():
            score = face_data.get('score', 0.0)
            facial_area = face_data.get('facial_area', [])
            
            if len(facial_area) == 4:
                x1, y1, x2, y2 = facial_area
                
                # Convert to normalized coordinates (0-1) for BlazeFace format
                # BlazeFace uses [x, y] format for topLeft and bottomRight
                topLeft = [x1 / width, y1 / height]
                bottomRight = [x2 / width, y2 / height]
                
                blazeface_face = {
                    'topLeft': topLeft,
                    'bottomRight': bottomRight,
                    'probability': [score],  # BlazeFace uses probability array
                    'landmarks': face_data.get('keypoints', [])
                }
                
                blazeface_faces.append(blazeface_face)
        
        result = jsonify({
            'success': True,
            'faces': blazeface_faces
        }), 200
        
        # Clean up memory after processing
        del image
        gc.collect()
        
        return result
        
    except Exception as e:
        # Clean up memory even on error
        gc.collect()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)