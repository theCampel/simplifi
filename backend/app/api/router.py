from fastapi import APIRouter
from app.api import podcasts, news

# Create main API router
api_router = APIRouter()

# Include all API routes
api_router.include_router(podcasts.router, prefix="/podcasts", tags=["podcasts"])
api_router.include_router(news.router, prefix="/news", tags=["news"]) 