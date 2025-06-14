from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date, datetime

from .. import Medicine, Technology
from ..models import Order, Prescription, Client
from .queries import model_to_dict

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)

ORDER_FIELD_TRANSLATION =  {
    "prescription_id": "ID рецепта",
    "client_id": "ID клиента",
    "order_number": "Номер заказа",
    "status": "Статус",
    "date_of_issue": "Дата выдачи",
    "expected_date_of_issue": "Ожидаемая дата выдачи",
    "start_data": "Дата начала выполнения",
    "cost": "Цена"
}

class OrderListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

class OrderCreate(BaseModel):
    prescription_id: int
    client_id: int
    order_number: int
    status: str
    date_of_issue: Optional[date] = None
    cost: float

class OrderUpdate(BaseModel):
    prescription_id: Optional[int] = None
    client_id: Optional[int] = None
    order_number: Optional[int] = None
    status: Optional[str] = None
    date_of_issue: Optional[date] = None
    start_data: Optional[datetime] = None
    expected_date_of_issue: Optional[datetime] = None
    cost: Optional[float] = None

@router.get("/", response_model=OrderListResponse)
async def read_orders():
    """
    Get all orders.
    """
    orders = Order.get_all()
    orders_dicts = [model_to_dict(order) for order in orders]
    return {
        "data": orders_dicts,
        "headers": ORDER_FIELD_TRANSLATION,
    }

@router.get("/{order_id}", response_model=dict)
async def read_order(order_id: int):
    """
    Get a specific order by ID.
    """
    order = Order.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return model_to_dict(order)

@router.post("/", response_model=dict)
async def create_order(order: OrderCreate):
    """
    Create a new order.
    """
    # Check if prescription exists
    prescription = Prescription.get_by_id(order.prescription_id)
    if prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Check if client exists
    client = Client.get_by_id(order.client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")

    start_data = datetime.now()

    expected_date_of_issue = start_data + Technology.get_by_id(Medicine.get_by_id(Prescription.get_by_id(order.prescription_id))).preparation_time

    # Create and save the order
    new_order = Order(
        prescription_id=order.prescription_id,
        client_id=order.client_id,
        order_number=order.order_number,
        start_data=start_data,
        expected_date_of_issue=expected_date_of_issue,
        status=order.status,
        date_of_issue=order.date_of_issue,
        cost=order.cost
    )
    new_order.save()
    
    return model_to_dict(new_order)

@router.put("/{order_id}", response_model=dict)
async def update_order(order_id: int, order: OrderUpdate):
    """
    Update an order.
    """
    # Check if order exists
    existing_order = Order.get_by_id(order_id)
    if existing_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order fields if provided
    if order.prescription_id is not None:
        # Check if prescription exists
        prescription = Prescription.get_by_id(order.prescription_id)
        if prescription is None:
            raise HTTPException(status_code=404, detail="Prescription not found")
        existing_order.prescription_id = order.prescription_id
    
    if order.client_id is not None:
        # Check if client exists
        client = Client.get_by_id(order.client_id)
        if client is None:
            raise HTTPException(status_code=404, detail="Client not found")
        existing_order.client_id = order.client_id
    
    if order.order_number is not None:
        existing_order.order_number = order.order_number

    
    if order.status is not None:
        existing_order.status = order.status
    
    if order.date_of_issue is not None:
        existing_order.date_of_issue = order.date_of_issue
    
    if order.start_data is not None:
        existing_order.start_data = order.start_data
    
    if order.cost is not None:
        existing_order.cost = order.cost

    if order.expected_date_of_issue is not None:
        existing_order.expected_date_of_issue = order.expected_date_of_issue
    # Save the updated order
    existing_order.save()
    
    return model_to_dict(existing_order)

@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: int):
    """
    Delete an order.
    """
    # Check if order exists
    order = Order.get_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Delete the order
    from ..database import execute_query
    query = "DELETE FROM medicine_order WHERE id = %s"
    execute_query(query, (order_id,), fetch=False)
    
    return None