from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from datetime import timedelta

from ..models import Medicine, Medication, MedicineType, MedicineKind, MethodOfApplication
from .queries import model_to_dict
from pydantic import BaseModel

router = APIRouter(
    prefix="/medicines",
    tags=["medicines"],
    responses={404: {"description": "Not found"}},
)

MEDICINE_FIELD_TRANSLATIONS = {
"id": "ID Ингредиента",
    "name": "Название",
    "manufacturer": "Производитель",
    "critical_norm": "Критическая норма",
    "shelf_life": "Срок годности (дней)",
    "unit_of_measure": "Единица измерения",
    "units_per_package": "Единиц в упаковке",
    "price": "Цена",
    "storage_conditions": "Условия хранения",
    "current_amount": "Текущее количество",
    "type":"Тип",
    "kind":"Вид",
    "application":"Способ применения",
    "tech_prep_id":"ID технологии приготовления"
}

class MedicineListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

@router.get("/", response_model=MedicineListResponse)
async def read_medicines():
    """
    Get all medicines.
    """
    medicines = Medicine.get_all()
    medicines_dicts = [model_to_dict(medicine) for medicine in medicines]
    return {
        "data": medicines_dicts,
        "headers": MEDICINE_FIELD_TRANSLATIONS
    }

@router.get("/{medicine_id}", response_model=dict)
async def read_medicine(medicine_id: int):
    """
    Get a specific medicine by ID.
    """
    medicine = Medicine.get_by_id(medicine_id)
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return model_to_dict(medicine)

