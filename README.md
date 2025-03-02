# SimpliFi

A comprehensive cryptocurrency dashboard application with portfolio tracking, real-time market data, and AI-generated insights.

## Project Structure

This project is organized with a clear separation between frontend and backend:

- `/frontend`: React application built with Vite, TypeScript, and shadcn/ui components
- `/backend`: FastAPI server providing API endpoints for crypto data and AI features

## Getting Started

### Prerequisites

- Node.js (v18+) and npm for the frontend
- Python 3.11+ for the backend
- Git

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app.main:app --reload
```

The backend API will be available at http://localhost:8000

## Features

- Real-time cryptocurrency price tracking
- Portfolio management and performance tracking
- News aggregation and AI-generated summaries
- Interactive charts and analytics

## Environment Variables

See the respective README files in the `/frontend` and `/backend` directories for details on required environment variables.

## Deployment

This application can be deployed as two separate services:
- Frontend: Can be deployed to Netlify, Vercel, or other static hosting services
- Backend: Designed to be deployed on Railway or any container platform

## License

This project is licensed under the MIT License - see the LICENSE file for details.
