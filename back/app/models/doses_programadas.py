from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    String,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.sql import func

from app.database import Base


class DoseProgramada(Base):
    __tablename__ = "doses_programadas"

    id = Column(Integer, primary_key=True, index=True)

    prescricao_id = Column(
        Integer,
        ForeignKey("prescricoes.id"),
        nullable=False
    )

    agendado_para = Column(DateTime(timezone=True), nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="pendente"
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "prescricao_id",
            "agendado_para",
            name="uq_dose_prescricao_horario"
        ),
    )