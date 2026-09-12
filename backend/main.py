from contextlib import asynccontextmanager
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from sqlalchemy import inspect, text
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from models import UserRole
from routes.files_routes import router as files_router
from routes.auth_routes import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        columns = {column["name"] for column in inspect(connection).get_columns("users")}
        if "role" not in columns:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'viewer'")
            )
        admin_email = os.getenv("ADMIN_EMAIL")
        if admin_email:
            connection.execute(
                text("UPDATE users SET role = :role WHERE email = :email"),
                {"role": UserRole.ADMIN.value, "email": admin_email},
            )
    print("Database tables created successfully")
    yield


app = FastAPI(
    title="Sample Project API",
    description="A simple login/register API with JWT authentication",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_url = os.getenv("FRONTEND_URL")
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5175",
]
if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router)
app.include_router(files_router)

frontend_directory = Path(__file__).resolve().parent.parent / "frontend" / "dist"


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Sample Project API is running"}


@app.get("/{frontend_path:path}", include_in_schema=False)
def serve_frontend(frontend_path: str):
    requested_file = (frontend_directory / frontend_path).resolve()
    if frontend_directory.resolve() in requested_file.parents and requested_file.is_file():
        return FileResponse(requested_file)
    return FileResponse(frontend_directory / "index.html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
