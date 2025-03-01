# SimpliFi Backend API

This is the backend service for the SimpliFi crypto dashboard, providing API endpoints for podcast generation and news summaries.

## Features

- **Podcast Generation**: Create audio summaries about selected cryptocurrencies
- **News Summaries**: Get aggregated and summarized news about the crypto market
- **RESTful API**: Clean API design with FastAPI

## Local Development

### Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

### Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

4. The API will be available at http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - ReDoc Documentation: http://localhost:8000/redoc

## API Endpoints

### Podcast API

- `POST /api/podcasts/generate`: Generate a podcast about selected cryptocurrencies
- `GET /api/podcasts/voices`: Get available voice options

### News API

- `GET /api/news/summary`: Get the latest crypto news summary
- `GET /api/news/trending`: Get trending topics in crypto news

## Deployment

This service is designed to be deployed on Railway. The provided Dockerfile handles the containerization process.

### Railway Deployment

1. Push code to a Git repository
2. Connect to Railway
3. Railway will automatically detect the Dockerfile and deploy

## Environment Variables

- `PORT`: The port on which the server runs (default: 8000)
- Add any API keys or other configuration as needed 