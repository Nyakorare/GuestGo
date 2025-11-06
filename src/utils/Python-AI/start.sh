#!/bin/bash
# Start script for Render deployment
# Ensure gunicorn is available
pip install -q gunicorn || true

# Start the Flask app with gunicorn
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120

