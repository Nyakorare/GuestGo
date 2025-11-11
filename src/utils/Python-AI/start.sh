#!/bin/bash
# Start script for Render deployment
# Ensure gunicorn is available
pip install -q gunicorn || true

# Start the Flask app with gunicorn
# Using 1 worker with 2 threads to reduce memory usage (YOLO models are memory-intensive)
# Max requests helps prevent memory leaks by recycling workers
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120 --max-requests 1000 --max-requests-jitter 100

