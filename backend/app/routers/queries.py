from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from datetime import date, timedelta
from enum import Enum
from decimal import Decimal

from ..view_models import (
    ClientsWithUnclaimedOrders, ClientsWaitingForDelivery, MedicineDetailsView,
    TopMedication, IngredientUsage, ClientByMedication, MedicationAtCriticalLevel,
    LowStockMedication, ProducingOrder, IngredientForProducingOrder,
    TechnologyOfPreparation, MedicinePriceAndComponents, MostFrequentClient
)

# Helper function to convert model objects to dictionaries
def model_to_dict(obj):
    if hasattr(obj, '__dict__'):
        result = {key: value for key, value in obj.__dict__.items() 
                 if not key.startswith('_') and not callable(value)}

        # Handle date objects
        for key, value in result.items():
            if isinstance(value, date):
                result[key] = value.isoformat()
            elif isinstance(value, Enum):
                result[key] = value.value
            elif isinstance(value, timedelta):
                result[key] = value.days
            elif isinstance(value, Decimal):
                result[key] = float(value)

        return result
    return obj

router = APIRouter(
    prefix="/queries",
    tags=["queries"],
    responses={404: {"description": "Not found"}},
)

# Clients with unclaimed orders
@router.get("/clients/unclaimed-orders", response_model=List[dict])
async def get_clients_with_unclaimed_orders():
    clients = ClientsWithUnclaimedOrders.get_all()
    return [model_to_dict(client) for client in clients]

@router.get("/clients/unclaimed-orders/count")
async def count_clients_with_unclaimed_orders():
    return {"count": ClientsWithUnclaimedOrders.count()}

# Clients waiting for delivery
@router.get("/clients/waiting-for-delivery", response_model=List[dict])
async def get_clients_waiting_for_delivery():
    clients = ClientsWaitingForDelivery.get_all()
    return [model_to_dict(client) for client in clients]

@router.get("/clients/waiting-for-delivery/count")
async def count_clients_waiting_for_delivery():
    return {"count": ClientsWaitingForDelivery.count()}

@router.get("/clients/waiting-for-delivery/count/{med_type}")
async def count_clients_waiting_for_delivery_by_type(med_type: str):
    return {"count": ClientsWaitingForDelivery.count_by_medication_type(med_type)}

# Medicine details
@router.get("/medicines/details", response_model=List[dict])
async def get_all_medicine_details():
    medicines = MedicineDetailsView.get_all()
    return [model_to_dict(medicine) for medicine in medicines]

@router.get("/medicines/details/{medicine_name}", response_model=List[dict])
async def get_medicine_details_by_name(medicine_name: str):
    medicines = MedicineDetailsView.get_by_medicine_name(medicine_name)
    if not medicines:
        raise HTTPException(status_code=404, detail=f"Medicine with name {medicine_name} not found")
    return [model_to_dict(medicine) for medicine in medicines]

# Top medications
@router.get("/medications/top", response_model=List[dict])
async def get_top_medications():
    medications = TopMedication.get_top_10()
    return [model_to_dict(medication) for medication in medications]

@router.get("/medications/top/{med_type}", response_model=List[dict])
async def get_top_medications_by_type(med_type: str):
    medications = TopMedication.get_top_10_by_type(med_type)
    return [model_to_dict(medication) for medication in medications]

# Ingredient usage
@router.get("/ingredients/usage/{ingredient_name}", response_model=List[dict])
async def get_ingredient_usage(
    ingredient_name: str,
    start_date: date,
    end_date: date
):
    usage = IngredientUsage.get_usage_volume(ingredient_name, start_date, end_date)
    return [model_to_dict(item) for item in usage]

# Clients by medication
@router.get("/clients/by-medication-name", response_model=List[dict])
async def get_clients_by_medication_name(
    med_name: str,
    start_date: date,
    end_date: date
):
    clients = ClientByMedication.get_by_medication_name_and_period(med_name, start_date, end_date)
    return [model_to_dict(client) for client in clients]

@router.get("/clients/by-medication-type", response_model=List[dict])
async def get_clients_by_medication_type(
    med_type: str,
    start_date: date,
    end_date: date
):
    clients = ClientByMedication.get_by_medication_type_and_period(med_type, start_date, end_date)
    return [model_to_dict(client) for client in clients]

@router.get("/clients/by-medication-name/count")
async def count_clients_by_medication_name(
    med_name: str,
    start_date: date,
    end_date: date
):
    return {"count": ClientByMedication.count_by_medication_name_and_period(med_name, start_date, end_date)}

@router.get("/clients/by-medication-type/count")
async def count_clients_by_medication_type(
    med_type: str,
    start_date: date,
    end_date: date
):
    return {"count": ClientByMedication.count_by_medication_type_and_period(med_type, start_date, end_date)}

# Medications at critical level
@router.get("/medications/critical", response_model=List[dict])
async def get_medications_at_critical_level():
    medications = MedicationAtCriticalLevel.get_all()
    return [model_to_dict(medication) for medication in medications]

# Low stock medications
@router.get("/medications/low-stock", response_model=List[dict])
async def get_low_stock_medications():
    medications = LowStockMedication.get_all()
    return [model_to_dict(medication) for medication in medications]

@router.get("/medications/low-stock/{med_type}", response_model=List[dict])
async def get_low_stock_medications_by_type(med_type: str):
    medications = LowStockMedication.get_by_type(med_type)
    return [model_to_dict(medication) for medication in medications]

# Producing orders
@router.get("/orders/producing", response_model=List[dict])
async def get_producing_orders():
    orders = ProducingOrder.get_all()
    return [model_to_dict(order) for order in orders]

@router.get("/orders/producing/count")
async def count_producing_orders():
    return {"count": ProducingOrder.count()}

# Ingredients for producing orders
@router.get("/ingredients/for-producing-orders", response_model=List[dict])
async def get_ingredients_for_producing_orders():
    ingredients = IngredientForProducingOrder.get_all()
    return [model_to_dict(ingredient) for ingredient in ingredients]

@router.get("/ingredients/for-producing-orders/count")
async def count_ingredients_for_producing_orders():
    return {"count": IngredientForProducingOrder.count()}

# Technology of preparation
@router.get("/technologies", response_model=List[dict])
async def get_technologies(
    medicine_type: Optional[str] = None,
    medicine_names: Optional[List[str]] = Query(None),
    from_producing_orders: bool = False
):
    technologies = TechnologyOfPreparation.get_all(medicine_type, medicine_names, from_producing_orders)
    return [model_to_dict(technology) for technology in technologies]

# Medicine price and components
@router.get("/medicines/price-and-components/{medicine_name}", response_model=List[dict])
async def get_medicine_price_and_components(medicine_name: str):
    components = MedicinePriceAndComponents.get_by_medicine_name(medicine_name)
    if not components:
        raise HTTPException(status_code=404, detail=f"Medicine with name {medicine_name} not found")
    return [model_to_dict(component) for component in components]

# Most frequent clients
@router.get("/clients/most-frequent", response_model=List[dict])
async def get_most_frequent_clients(
    medicine_type: Optional[str] = None,
    medicine_names: Optional[List[str]] = Query(None),
    limit: int = 10
):
    clients = MostFrequentClient.get_most_frequent(medicine_type, medicine_names, limit)
    return [model_to_dict(client) for client in clients]