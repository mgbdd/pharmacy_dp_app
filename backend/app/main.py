from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.app.routers.order import OrderUpdate
from .initdb import init_db
from .routers import (
    queries, medication, medicine, technology, ingredient,
    composition, order, client, delivery, inventory, prescription
)

# Initialize the database
init_db()

# Create FastAPI app
app = FastAPI(
    title="Pharmacy API",
    description="API for pharmacy management system",
    version="1.0.0"
)



# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Заменили ["*"] на конкретные origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]     # Добавили для кастомных заголовков
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Pharmacy API"}

app.include_router(queries.router)
app.include_router(medication.router)
app.include_router(medicine.router)
app.include_router(technology.router)
app.include_router(ingredient.router)
app.include_router(composition.router)
app.include_router(order.router)
app.include_router(client.router)
app.include_router(delivery.router)
app.include_router(inventory.router)
app.include_router(prescription.router)

