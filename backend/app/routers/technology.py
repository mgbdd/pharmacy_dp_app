from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import timedelta

from ..models import Technology
from .queries import model_to_dict

router = APIRouter(
    prefix="/technologies",
    tags=["technologies"],
    responses={404: {"description": "Not found"}},
)

TECHNOLOGY_FIELD_TRANSLATIONS = {
    "description": "Описание",
    "preparation_time": "Время приготовления"
}

class TechnologyListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

class TechnologyCreate(BaseModel):
    description: str
    preparation_time: timedelta

class TecnologyUpdate(BaseModel):
    description: Optional[str] = None
    preparation_time: Optional[timedelta] = None

@router.get("/", response_model=TechnologyListResponse)
async def read_technologies():
    """
    Get all technologies of preparation.
    """
    technologies = Technology.get_all()
    technologies_dicts = [model_to_dict(technology) for technology in technologies]
    return {
        "data": technologies_dicts,
        "headers": TECHNOLOGY_FIELD_TRANSLATIONS
    }

@router.get("/{technology_id}", response_model=dict)
async def read_technology(technology_id: int):
    """
    Get a specific technology of preparation by ID.
    """
    technology = Technology.get_by_id(technology_id)
    if technology is None:
        raise HTTPException(status_code=404, detail="Technology of preparation not found")
    return model_to_dict(technology)

@router.post("/", response_model=dict)
async def create_technology(technology: TechnologyCreate):
    """
    Create a new technology of preparation.
    """
    new_technology = Technology(
        description=technology.description,
        preparation_time=technology.preparation_time
    )
    new_technology.save()
    return model_to_dict(new_technology)

@router.put("/{technology_id}", response_model=dict)
async def update_technology(technology_id: int, technology: TecnologyUpdate):
    """
    Update a technology of preparation by ID.
    """
    existing_technology = Technology.get_by_id(technology_id)
    if existing_technology is None:
        raise HTTPException(status_code=404, detail="Technology of preparation not found")
    if technology.description is not None:
        existing_technology.description = technology.description
    if technology.preparation_time is not None:
        existing_technology.preparation_time = technology.preparation_time
    existing_technology.save()
    return model_to_dict(existing_technology)

@router.delete("/{technology_id}", status_code=204)
async def delete_technology(technology_id: int):
    """
    Delete a technology of preparation by ID.
    """
    # Check if technology exists
    technology = Technology.get_by_id(technology_id)
    if technology is None:
        raise HTTPException(status_code=404, detail="Technology of preparation not found")
    
    # Delete the technology
    from ..database import execute_query
    query = "DELETE FROM technology_of_preparation WHERE id = %s"
    execute_query(query, (technology_id,), fetch=False)
    
    return None