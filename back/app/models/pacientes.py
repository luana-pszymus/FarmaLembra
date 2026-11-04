from sqlalchemy import Column, Integer, String, Date
from app.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    telefone = Column(String(20), nullable=True)
    data_nascimento = Column(Date, nullable=True)