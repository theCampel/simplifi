from fastapi import APIRouter
from app.api import podcasts, news, rugpull

# Create main API router
api_router = APIRouter()

# Include all API routes
api_router.include_router(podcasts.router, prefix="/podcasts", tags=["podcasts"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(rugpull.router, prefix="/rugpull", tags=["rugpull"]) 