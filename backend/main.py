import sys
import os

# Ensure backend package is on the path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import players, stats, teams

app = FastAPI(title="Sports Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(stats.router)
app.include_router(teams.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Sports Analytics API"}
