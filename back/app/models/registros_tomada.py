from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    String,
    Text,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database import Base


class RegistroTomada(Base):
    __tablename__ = "registros_tomada"

    id = Column(Integer, primary_key=True, index=True)

    dose_programada_id = Column(
        Integer,
        ForeignKey("doses_programadas.id"),
        nullable=False,
        unique=True
    )

    resultado = Column(
        String(20),
        nullable=False
    )

    confirmado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    observacao = Column(Text, nullable=True)