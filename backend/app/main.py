from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.api.router import api_router

# Create FastAPI instance
app = FastAPI(
    title="SimpliFi Crypto Dashboard API",
    description="API for the SimpliFi Crypto Dashboard",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "*"],  # Add Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for podcast files
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)

# Ensure podcasts directory exists
podcasts_dir = os.path.join(static_dir, "podcasts")
os.makedirs(podcasts_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to SimpliFi Crypto Dashboard API"}

# For debugging
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 