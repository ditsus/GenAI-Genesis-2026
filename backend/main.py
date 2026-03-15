from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json, os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/trailers", StaticFiles(directory="trailers"), name="trailers")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

@app.get("/api/trailers")
def get_trailers():
    with open("data/timestamps.json") as f:
        return json.load(f)
