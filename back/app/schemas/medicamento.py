from pydantic import BaseModel
from typing import Optional


class MedicamentoBase(BaseModel):
    nome: str
    dosagem: str
    forma_farmaceutica: str
    descricao: Optional[str] = None


class MedicamentoCreate(MedicamentoBase):
    pass


class MedicamentoUpdate(BaseModel):
    nome: Optional[str] = None
    dosagem: Optional[str] = None
    forma_farmaceutica: Optional[str] = None
    descricao: Optional[str] = None


class MedicamentoResponse(MedicamentoBase):
    id: int

    model_config = {
        "from_attributes": True
    }