from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from ..models import Client
from .queries import model_to_dict

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)

CLIENT_FIELD_TRANSLATIONS = {
    "id": "ID Клиента",
    "surname": "Фамилия",
    "name": "Имя",
    "patronymic": "Отчество",
    "phone_number": "Номер телефона",
}

class ClientListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

class ClientCreate(BaseModel):
    surname: str
    name: str
    patronymic: Optional[str] = None
    phone_number: str

class ClientUpdate(BaseModel):
    surname: Optional[str] = None
    name: Optional[str] = None
    patronymic: Optional[str] = None
    phone_number: Optional[str] = None

@router.get("/", response_model=ClientListResponse)
async def read_clients():
    """
    Get all clients.
    """
    clients = Client.get_all()
    client_dicts = [model_to_dict(client) for client in clients]
    return {
        "data": client_dicts,
        "headers": CLIENT_FIELD_TRANSLATIONS,
    }

@router.get("/search", response_model=List[dict])
async def search_clients(surname: Optional[str] = None, name: Optional[str] = None, patronymic: Optional[str] = None, phone_number: Optional[str] = None):
    client_id = Client.search(surname, name, patronymic, phone_number)
    if client_id is None:
        new_client = Client(
            surname=surname,
            name=name,
            patronymic=patronymic,
            phone_number=phone_number
        )
        new_client.save()


@router.get("/{client_id}", response_model=dict)
async def read_client(client_id: int):
    """
    Get a specific client by ID.
    """
    client = Client.get_by_id(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return model_to_dict(client)

@router.post("/", response_model=dict)
async def create_client(client: ClientCreate):
    """
    Create a new client.
    """
    new_client = Client(
        surname=client.surname,
        name=client.name,
        patronymic=client.patronymic,
        phone_number=client.phone_number
    )
    new_client.save()
    
    return model_to_dict(new_client)

@router.put("/{client_id}", response_model=dict)
async def update_client(client_id: int, client: ClientUpdate):
    """
    Update a client.
    """
    existing_client = Client.get_by_id(client_id)
    if existing_client is None:
        raise HTTPException(status_code=404, detail="Client not found")

    if client.surname is not None:
        existing_client.surname = client.surname
    
    if client.name is not None:
        existing_client.name = client.name
    
    if client.patronymic is not None:
        existing_client.patronymic = client.patronymic
    
    if client.phone_number is not None:
        existing_client.phone_number = client.phone_number
    
    # Save the updated client
    existing_client.save()
    
    return model_to_dict(existing_client)

@router.delete("/{client_id}", status_code=204)
async def delete_client(client_id: int):
    """
    Delete a client.
    """
    # Check if client exists
    client = Client.get_by_id(client_id)
    if client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Delete the client
    from ..database import execute_query
    query = "DELETE FROM client WHERE id = %s"
    execute_query(query, (client_id,), fetch=False)
    
    return None