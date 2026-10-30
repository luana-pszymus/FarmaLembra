from pydantic import BaseModel, ConfigDict


class MedicamentoCreate(BaseModel):
    nome: str
    dosagem: str
    forma_farmaceutica: str
    descricao: str | None = None


class MedicamentoUpdate(BaseModel):
    nome: str | None = None
    dosagem: str | None = None
    forma_farmaceutica: str | None = None
    descricao: str | None = None


class MedicamentoResponse(BaseModel):
    id: int
    nome: str
    dosagem: str
    forma_farmaceutica: str
    descricao: str | None = None

    model_config = ConfigDict(from_attributes=True)