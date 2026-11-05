import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import auth, products, equipment, bookings, orders, payments, admin, rentals, notifications
from backend.scheduler import start_scheduler
from backend.config import settings
from backend.seed import seed

# Create database tables automatically if not already created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Krishisetu API",
    description="Smart Agricultural Marketplace with Equipment Rental & FCFS Queue Management",
    version="1.0.0",
)

# Enable CORS for frontend (Vercel production + local development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(equipment.router)
app.include_router(bookings.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(rentals.router)
app.include_router(notifications.router)

# Start APScheduler background task
scheduler = None

@app.on_event("startup")
def on_startup():
    global scheduler
    try:
        seed()
    except Exception as exc:
        print(f"Seed check warning: {exc}")
    scheduler = start_scheduler()

@app.on_event("shutdown")
def on_shutdown():
    if scheduler:
        scheduler.shutdown()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Krishisetu FastAPI Backend",
        "version": "1.0.0",
    }

