FROM python:3.11-slim

WORKDIR /app

# Copy requirements first to leverage Docker caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port the app runs on
EXPOSE ${PORT:-8000}

# Command to run the application - Railway specific format
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} 