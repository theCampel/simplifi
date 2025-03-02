# Crypto Harmony Dashboard Backend

This is the backend service for the Crypto Harmony Dashboard, providing API endpoints for cryptocurrency data, AI-powered analytics, podcast generation, and news summaries.

## Features

- **RESTful API**: Clean API design with FastAPI
- **Cryptocurrency Data**: Integration with various crypto data sources
- **Podcast Generation**: Create audio summaries about selected cryptocurrencies
- **News Summaries**: Aggregated and summarized news about the crypto market
- **AI Analytics**: Machine learning-based price predictions and trend analysis

## Tech Stack

- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **Data Validation**: Pydantic
- **HTTP Client**: HTTPX
- **News Sources:** NewsAPI
- **Market Data:** 2x CoinGecko 😭
- **ML/AI**: OpenAI, Grok, ElevenLabs. 
- **Deployment / Accessible Endpoints:** Docker/Railway

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

## Environment Variables

Create a `.env` file in the backend directory with the following variables. Example as shown:

```
OPENAI_API_KEY=OPENAI_API_KEY
ELEVENLABS_API_KEY=ELEVENLABS_API_KEY
NEWSAPI_KEY=NEWSAPI_KEY
XAI_API_KEY=XAI_API_KEY
COINGECKO_API_KEY=COINGECKO_API_KEY
COINGECKO_API_KEY_2=COINGECKO_API_KEY_2
```

## Project Structure

```
backend/
├── app/
│   ├── api/         # API endpoint definitions
│   ├── models/      # Pydantic models for request/response
│   ├── services/    # Business logic and external services
│   ├── static/      # Static files (if any)
│   └── main.py      # Application entry point
├── requirements.txt # Python dependencies
├── Dockerfile       # Container definition
└── .env             # Environment variables (add to .gitignore)
```

## API Endpoints

### Cryptocurrency API

- `GET /api/crypto/prices`: Get current prices for specified cryptocurrencies
- `GET /api/crypto/historical/{symbol}`: Get historical price data

### Portfolio API

- `GET /api/portfolio`: Get user portfolio data
- `POST /api/portfolio/transaction`: Add a transaction to the portfolio

### Podcast API

- `POST /api/podcasts/generate`: Generate a podcast about selected cryptocurrencies
- `GET /api/podcasts/voices`: Get available voice options

### News API

- `GET /api/news/summary`: Get the latest crypto news summary
- `GET /api/news/trending`: Get trending topics in crypto news

## Deployment

This service is designed to be deployed as a containerized application. The provided Dockerfile handles the containerization process.

### Railway Deployment

1. Push code to a Git repository
2. Connect to Railway
3. Railway will automatically detect the Dockerfile and deploy 