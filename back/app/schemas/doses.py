
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Literal

# RESPOSTA DAS DOSES PROGRAMADAS
class DoseProgramadaResponse(BaseModel):
    id: int
    prescricao_id: int
    agendado_para: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

# DADOS PARA CONFIRMAR UMA DOSE
class RegistroTomadaCreate(BaseModel):
    resultado: Literal["tomada", "nao_tomada"]
    observacao: str | None = None

# RESPOSTA DO REGISTRO DE TOMADA
class RegistroTomadaResponse(BaseModel):
    id: int
    dose_programada_id: int
    resultado: str
    origem: Literal["manual", "automatica"]
    confirmado_em: datetime
    observacao: str | None = None

    model_config = ConfigDict(from_attributes=True)

# RESPOSTA DO HISTÓRICO DE DOSES
class HistoricoDoseResponse(BaseModel):
    dose_id: int
    prescricao_id: int
    agendado_para: datetime
    status: str
    resultado: str
    origem: Literal["manual", "automatica"]
    confirmado_em: datetime
    observacao: str | None = None