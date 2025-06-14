from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from ..models import Medication
from .queries import model_to_dict
from pydantic import BaseModel

router = APIRouter(
    prefix="/medications",
    tags=["medications"],
    responses={404: {"description": "Not found"}},
)

MEDICATION_FIELD_TRANSLATIONS = {
    "id": "ID Ингредиента",
    "name": "Название",
    "manufacturer": "Производитель",
    "critical_norm": "Критическая норма",
    "shelf_life": "Срок годности (дней)",
    "unit_of_measure": "Единица измерения",
    "units_per_package": "Единиц в упаковке",
    "price": "Цена",
    "storage_conditions": "Условия хранения",
    "current_amount": "Текущее количество"
}

class MedicationListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

@router.get("/", response_model=MedicationListResponse)
async def read_medications():
    """
    Get all medications.
    """
    medications = Medication.get_all()
    medications_dicts = [model_to_dict(medication) for medication in medications]
    return {
        "data": medications_dicts,
        "headers": MEDICATION_FIELD_TRANSLATIONS
    }

@router.get("/{medication_id}", response_model=dict)
async def read_medication(medication_id: int):
    """
    Get a specific medication by ID.
    """
    medication = Medication.get_by_id(medication_id)
    if medication is None:
        raise HTTPException(status_code=404, detail="Medication not found")
    return model_to_dict(medication)
