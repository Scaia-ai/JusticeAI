from fastapi import FastAPI
from app.routers import auth

app = FastAPI()

# Include authentication routes
app.include_router(auth.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to JusticeAI"}

