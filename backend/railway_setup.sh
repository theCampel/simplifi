#!/bin/bash

# This script can be used to manually set up the environment on Railway
# if the Dockerfile approach doesn't work

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI application
uvicorn app.main:app --host 0.0.0.0 --port $PORT 