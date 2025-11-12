#!/bin/bash
set -e

echo "🔧 Starting build process..."

# Upgrade pip first
echo "📦 Upgrading pip..."
pip install --upgrade pip --timeout=300 || pip install --upgrade pip --timeout=600

# Install small packages first (faster, less likely to timeout)
echo "📦 Installing small dependencies..."
pip install --timeout=300 --retries=5 \
    flask==3.0.0 \
    flask-cors==4.0.0 \
    requests==2.31.0 \
    gunicorn==21.2.0 \
    "pillow>=10.1.0,<11.0.0" || exit 1

# Install medium packages
echo "📦 Installing medium dependencies..."
pip install --timeout=300 --retries=5 \
    numpy==1.26.2 \
    opencv-python==4.9.0.80 \
    mediapipe==0.10.8 || exit 1

# Install PyTorch CPU-only (much smaller than CUDA version)
echo "📦 Installing PyTorch CPU-only (this may take a while)..."
pip install --timeout=600 --retries=5 \
    --index-url https://download.pytorch.org/whl/cpu \
    torch>=2.0.0 \
    torchvision>=0.15.0 || exit 1

# Install ultralytics last (depends on torch)
echo "📦 Installing ultralytics..."
pip install --timeout=600 --retries=5 ultralytics==8.1.0 || exit 1

# Make start script executable
chmod +x start.sh

echo "✅ Build completed successfully!"

