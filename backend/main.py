import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers import auth_router, portfolio_router

app = FastAPI(title="Portfolio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

if os.path.exists("uploads/images"):
    app.mount("/static/images", StaticFiles(directory="uploads/images"), name="images")
if os.path.exists("uploads/certificates"):
    app.mount("/static/certificates", StaticFiles(directory="uploads/certificates"), name="certificates")
if os.path.exists("uploads/resume"):
    app.mount("/static/resume", StaticFiles(directory="uploads/resume"), name="resume")
if os.path.exists("uploads/designs"):
    app.mount("/static/designs", StaticFiles(directory="uploads/designs"), name="designs")

app.include_router(auth_router.router)
app.include_router(portfolio_router.router)

@app.get("/")
def read_root():
    return {"message": "API is running"}
