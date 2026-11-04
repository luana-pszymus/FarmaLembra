from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class PacienteBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None


class PacienteCreate(PacienteBase):
    pass


class PacienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None


class PacienteResponse(PacienteBase):
    id: int

    model_config = {"from_attributes": True}