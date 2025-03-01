FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY ./app ./app
COPY ./.env ./.env
COPY ./Procfile ./Procfile

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Expose the port the app runs on
EXPOSE ${PORT:-8000}

# Command to run the application
CMD ["bash", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"] 