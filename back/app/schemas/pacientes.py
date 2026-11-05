from pydantic import BaseModel
from datetime import date
from typing import Optional


class PacienteBase(BaseModel):
    nome: str
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None


class PacienteCreate(PacienteBase):
    pass


class PacienteUpdate(BaseModel):
    nome: Optional[str] = None
    telefone: Optional[str] = None
    data_nascimento: Optional[date] = None


class PacienteResponse(PacienteBase):
    id: int
    usuario_id: int

    model_config = {"from_attributes": True}