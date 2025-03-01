from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

# Get port from environment variable for Railway
PORT = int(os.getenv("PORT", 8000))

app = FastAPI(
    title="SimpliFi Backend API",
    description="Backend services for the SimpliFi crypto dashboard",
    version="0.1.0",
)

# Configure CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to your actual frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the SimpliFi API", "status": "operational"}

# Import and include routers
from app.api import podcasts, news
app.include_router(podcasts.router, prefix="/api/podcasts", tags=["podcasts"])
app.include_router(news.router, prefix="/api/news", tags=["news"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=PORT, reload=True) 