from sqlalchemy import Column, Integer, String
from app.database import Base


class Medicamento(Base):
    __tablename__ = "medicamentos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    dosagem = Column(String(50), nullable=False)
    forma_farmaceutica = Column(String(50), nullable=False)
    descricao = Column(String(255), nullable=True)