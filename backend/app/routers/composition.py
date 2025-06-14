from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel

from ..models import Composition, Medicine, Ingredient
from .queries import model_to_dict

router = APIRouter(
    prefix="/compositions",
    tags=["compositions"],
    responses={404: {"description": "Not found"}},
)

COMPOSITION_FIELD_TRANSLATIONS = {
    "medicine_id": "ID лекарства",
    "ingredient_id": "ID ингредиента",
    "amount": "Количество"
}

class CompositionListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

class CompositionCreate(BaseModel):
    medicine_id: int
    ingredient_id: int
    amount: float

@router.get("/", response_model=CompositionListResponse)
async def read_compositions():
    """
    Get all compositions.
    """
    # Since Composition doesn't have a get_all method, we need to get all medicines and their compositions
    compositions = []
    medicines = Medicine.get_all()
    for medicine in medicines:
        medicine_compositions = medicine.get_compositions()
        compositions.extend(medicine_compositions)
    composition_dicts = [model_to_dict(composition) for composition in compositions]
    return {
        "data": composition_dicts,
        "headers": COMPOSITION_FIELD_TRANSLATIONS
    }
@router.get("/medicine/{medicine_id}", response_model=List[dict])
async def read_compositions_by_medicine(medicine_id: int):
    """
    Get all compositions for a specific medicine.
    """
    medicine = Medicine.get_by_id(medicine_id)
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    compositions = medicine.get_compositions()
    return [model_to_dict(composition) for composition in compositions]

@router.post("/", response_model=dict)
async def create_composition(composition: CompositionCreate):
    """
    Create a new composition.
    """
    # Check if medicine exists
    medicine = Medicine.get_by_id(composition.medicine_id)
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Check if ingredient exists
    ingredient = Ingredient.get_by_id(composition.ingredient_id)
    if ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    # Create and save the composition
    new_composition = Composition(
        medicine_id=composition.medicine_id,
        ingredient_id=composition.ingredient_id,
        amount=composition.amount
    )
    new_composition.save()
    
    return model_to_dict(new_composition)

@router.delete("/{medicine_id}/{ingredient_id}", status_code=204)
async def delete_composition(medicine_id: int, ingredient_id: int):
    """
    Delete a composition.
    """
    # Check if medicine exists
    medicine = Medicine.get_by_id(medicine_id)
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    # Check if ingredient exists
    ingredient = Ingredient.get_by_id(ingredient_id)
    if ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    
    # Check if composition exists
    compositions = medicine.get_compositions()
    composition_exists = False
    for composition in compositions:
        if composition.ingredient_id == ingredient_id:
            composition_exists = True
            break
    
    if not composition_exists:
        raise HTTPException(status_code=404, detail="Composition not found")
    
    # Delete the composition
    from ..database import execute_query
    query = "DELETE FROM composition WHERE medicine_id = %s AND ingredient_id = %s"
    execute_query(query, (medicine_id, ingredient_id), fetch=False)
    
    return None