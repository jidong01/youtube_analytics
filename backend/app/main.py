from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import channel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(channel.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "YouTube Analyzer API"} 