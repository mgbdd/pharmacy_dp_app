from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from ..models import Ingredient
from .queries import model_to_dict

router = APIRouter(
    prefix="/ingredients",
    tags=["ingredients"],
    responses={404: {"description": "Not found"}},
)

INGREDIENT_FIELD_TRANSLATIONS = {
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
    "type": "Тип ингредиента",
    "caution": "Предостережения",
    "incompatibility": "Несовместимость",
}

class IngredientListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

@router.get("/", response_model=IngredientListResponse)
async def read_ingredients():
    """
    Get all ingredients.
    """
    ingredients = Ingredient.get_all()
    ingredient_dicts = [model_to_dict(ingredient) for ingredient in ingredients]
    return {
        "data": ingredient_dicts,
        "headers": INGREDIENT_FIELD_TRANSLATIONS
    }

@router.get("/{ingredient_id}", response_model=dict)
async def read_ingredient(ingredient_id: int):
    """
    Get a specific ingredient by ID.
    """
    ingredient = Ingredient.get_by_id(ingredient_id)
    if ingredient is None:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return model_to_dict(ingredient)