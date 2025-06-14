from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date

from ..models import StockDelivery, Medication
from .queries import model_to_dict

router = APIRouter(
    prefix="/deliveries",
    tags=["deliveries"],
    responses={404: {"description": "Not found"}},
)

DELIVERY_FIELD_TRANSLATIONS = {
    "medication_id": "ID медикамента",
    "application_date": "Дата заявки",
    "delivery_date": "Дата доставки",
    "amount": "Количество"
}

class DeliveryListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

class DeliveryCreate(BaseModel):
    medication_id: int
    application_date: date
    delivery_date: Optional[date] = None
    amount: float

class DeliveryUpdate(BaseModel):
    medication_id: Optional[int] = None
    application_date: Optional[date] = None
    delivery_date: Optional[date] = None
    amount: Optional[float] = None

@router.get("/", response_model=DeliveryListResponse)
async def read_deliveries():
    """
    Get all medication deliveries.
    """
    deliveries = StockDelivery.get_all()
    delivery_dicts = [model_to_dict(delivery) for delivery in deliveries]
    return {
        "data": delivery_dicts,
        "headers": DELIVERY_FIELD_TRANSLATIONS,
    }

@router.get("/{delivery_id}", response_model=dict)
async def read_delivery(delivery_id: int):
    """
    Get a specific medication delivery by ID.
    """
    delivery = StockDelivery.get_by_id(delivery_id)
    if delivery is None:
        raise HTTPException(status_code=404, detail="Medication delivery not found")
    return model_to_dict(delivery)

@router.post("/", response_model=dict)
async def create_delivery(delivery: DeliveryCreate):
    """
    Create a new medication delivery.
    """
    # Check if medication exists
    medication = Medication.get_by_id(delivery.medication_id)
    if medication is None:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Create and save the delivery
    new_delivery = StockDelivery(
        medication_id=delivery.medication_id,
        application_date=delivery.application_date,
        delivery_date=delivery.delivery_date,
        amount=delivery.amount
    )
    new_delivery.save()
    
    return model_to_dict(new_delivery)

@router.put("/{delivery_id}", response_model=dict)
async def update_delivery(delivery_id: int, delivery: DeliveryUpdate):
    """
    Update a medication delivery.
    """
    # Check if delivery exists
    existing_delivery = StockDelivery.get_by_id(delivery_id)
    if existing_delivery is None:
        raise HTTPException(status_code=404, detail="Medication delivery not found")
    
    # Update delivery fields if provided
    if delivery.medication_id is not None:
        # Check if medication exists
        medication = Medication.get_by_id(delivery.medication_id)
        if medication is None:
            raise HTTPException(status_code=404, detail="Medication not found")
        existing_delivery.medication_id = delivery.medication_id
    
    if delivery.application_date is not None:
        existing_delivery.application_date = delivery.application_date
    
    if delivery.delivery_date is not None:
        existing_delivery.delivery_date = delivery.delivery_date
    
    if delivery.amount is not None:
        existing_delivery.amount = delivery.amount
    
    # Save the updated delivery
    existing_delivery.save()
    
    return model_to_dict(existing_delivery)

@router.delete("/{delivery_id}", status_code=204)
async def delete_delivery(delivery_id: int):
    """
    Delete a medication delivery.
    """
    # Check if delivery exists
    delivery = StockDelivery.get_by_id(delivery_id)
    if delivery is None:
        raise HTTPException(status_code=404, detail="Medication delivery not found")
    
    # Delete the delivery
    from ..database import execute_query
    query = "DELETE FROM medication_delivery WHERE id = %s"
    execute_query(query, (delivery_id,), fetch=False)
    
    return None