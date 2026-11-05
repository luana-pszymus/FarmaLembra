from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base


class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    nome = Column(String(150), nullable=False)
    telefone = Column(String(20), nullable=True)
    data_nascimento = Column(Date, nullable=True)