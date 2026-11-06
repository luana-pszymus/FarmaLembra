from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Literal


class DoseProgramadaResponse(BaseModel):
    id: int
    prescricao_id: int
    agendado_para: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)


class RegistroTomadaCreate(BaseModel):
    resultado: Literal["tomada", "nao_tomada"]
    observacao: str | None = None


class RegistroTomadaResponse(BaseModel):
    id: int
    dose_programada_id: int
    resultado: str
    confirmado_em: datetime
    observacao: str | None = None

    model_config = ConfigDict(from_attributes=True)