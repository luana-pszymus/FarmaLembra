from pydantic import BaseModel, EmailStr, Field


class UsuarioCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str = Field(min_length=8)


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr

    model_config = {"from_attributes": True}