from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import date

from ..models import Prescription, Medicine, Client
from .queries import model_to_dict

router = APIRouter(
    prefix="/prescriptions",
    tags=["prescriptions"],
    responses={404: {"description": "Not found"}},
)

PRESCRIPTION_FIELD_TRANSLATIONS = {
    "id" : "ID рецепта",
    "client_id" : "ID клиента",
    "medicine_id": "ID лекарства",
    "prescription_number": "Номер рецепта",
    "doctor_surname": "Фамилия врача",
    "doctor_name": "Имя врача",
    "doctor_patronymic": "Отчество врача",
    "signature": "Подпись",
    "stamp": "Печать",
    "age": "Возраст",
    "diagnosis": "Диагноз",
    "amount": "Количество",
    "application": "Способ применения"
}

class PrescriptionListResponse(BaseModel):
    data: List[Dict[str, Any]]
    headers: Dict[str, str]

class PrescriptionCreate(BaseModel):
    name: str
    surname: str
    patronymic: Optional[str]
    phone_number: str
    medicine_id: int
    prescription_number: int
    doctor_surname: str
    doctor_name: str
    doctor_patronymic: Optional[str] = None
    signature: bool = True  # По умолчанию подпись есть
    stamp: bool = True      # По умолчанию печать есть
    age: int
    diagnosis: str
    amount: float
    application: str

class PrescriptionUpdate(BaseModel):
    client_id: Optional[int] = None
    medicine_id: Optional[int] = None
    prescription_number: Optional[int] = None
    doctor_surname: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_patronymic: Optional[str] = None
    signature: Optional[bool] = None
    stamp: Optional[bool] = None
    age: Optional[int] = None
    diagnosis: Optional[str] = None
    amount: Optional[float] = None
    application: Optional[str] = None

@router.get("/", response_model=PrescriptionListResponse)
async def read_prescriptions():
    """
    Get all prescriptions.
    """
    prescriptions = Prescription.get_all()
    prescriptions_dicts = [model_to_dict(prescription) for prescription in prescriptions]
    return {
        "data": prescriptions_dicts,
        "headers": PRESCRIPTION_FIELD_TRANSLATIONS
    }

@router.get("/{prescription_id}", response_model=dict)
async def read_prescription(prescription_id: int):
    """
    Get a specific prescription by ID.
    """
    prescription = Prescription.get_by_id(prescription_id)
    if prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return model_to_dict(prescription)

@router.post("/", response_model=dict)
async def create_prescription(prescription: PrescriptionCreate):
    """
    Create a new prescription.
    """
    # Check if medicine exists
    medicine = Medicine.get_by_id(prescription.medicine_id)
    if medicine is None:
        raise HTTPException(status_code=404, detail="Medicine not found")

    client_id = Client.search(prescription.surname, prescription.name, prescription.patronymic, prescription.phone_number)
    if client_id is None:
        new_client = Client(
            surname=prescription.surname,
            name=prescription.name,
            patronymic=prescription.patronymic,
            phone_number=prescription.phone_number
        )
        new_client.save()
        client_id = new_client.id

    # Create and save the prescription
    new_prescription = Prescription(
        client_id=client_id,
        medicine_id=prescription.medicine_id,
        prescription_number=prescription.prescription_number,
        doctor_surname=prescription.doctor_surname,
        doctor_name=prescription.doctor_name,
        doctor_patronymic=prescription.doctor_patronymic,
        signature=prescription.signature,
        stamp=prescription.stamp,
        age=prescription.age,
        diagnosis=prescription.diagnosis,
        amount=prescription.amount,
        application=prescription.application
    )
    new_prescription.save()
    
    return model_to_dict(new_prescription)

@router.put("/{prescription_id}", response_model=dict)
async def update_prescription(prescription_id: int, prescription: PrescriptionUpdate):
    """
    Update a prescription.
    """
    # Check if prescription exists
    existing_prescription = Prescription.get_by_id(prescription_id)
    if existing_prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Update prescription fields if provided
    if prescription.client_id is not None:
        client = Client.get_by_id(prescription.client_id)
        if client is None:
            raise HTTPException(status_code=404, detail="Client not found")
        existing_prescription.client_id = prescription.client_id

    if prescription.medicine_id is not None:
        # Check if medicine exists
        medicine = Medicine.get_by_id(prescription.medicine_id)
        if medicine is None:
            raise HTTPException(status_code=404, detail="Medicine not found")
        existing_prescription.medicine_id = prescription.medicine_id
    
    if prescription.prescription_number is not None:
        existing_prescription.prescription_number = prescription.prescription_number
    
    if prescription.doctor_surname is not None:
        existing_prescription.doctor_surname = prescription.doctor_surname
    
    if prescription.doctor_name is not None:
        existing_prescription.doctor_name = prescription.doctor_name
    
    if prescription.doctor_patronymic is not None:
        existing_prescription.doctor_patronymic = prescription.doctor_patronymic
    
    if prescription.signature is not None:
        existing_prescription.signature = prescription.signature
    
    if prescription.stamp is not None:
        existing_prescription.stamp = prescription.stamp
    
    if prescription.age is not None:
        existing_prescription.age = prescription.age
    
    if prescription.diagnosis is not None:
        existing_prescription.diagnosis = prescription.diagnosis
    
    if prescription.amount is not None:
        existing_prescription.amount = prescription.amount
    
    if prescription.application is not None:
        existing_prescription.application = prescription.application
    
    # Save the updated prescription
    existing_prescription.save()
    
    return model_to_dict(existing_prescription)

@router.delete("/{prescription_id}", status_code=204)
async def delete_prescription(prescription_id: int):
    """
    Delete a prescription.
    """
    # Check if prescription exists
    prescription = Prescription.get_by_id(prescription_id)
    if prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    # Delete the prescription
    from ..database import execute_query
    query = "DELETE FROM prescription WHERE id = %s"
    execute_query(query, (prescription_id,), fetch=False)
    
    return None