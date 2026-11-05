from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from app.database import Base


class Lembrete(Base):
    __tablename__ = "lembretes"

    id = Column(Integer, primary_key=True, index=True)

    prescricao_id = Column(
        Integer,
        ForeignKey("prescricoes.id"),
        nullable=False
    )

    agendado_para = Column(
        DateTime(timezone=True),
        nullable=False
    )

    # Valores esperados: pendente, enviado, falhou ou cancelado.
    status = Column(
        String(20),
        nullable=False,
        default="pendente"
    )

    discord_message_id = Column(
        String(30),
        nullable=True
    )

    enviado_em = Column(
        DateTime(timezone=True),
        nullable=True
    )

    respondido_em = Column(
        DateTime(timezone=True),
        nullable=True
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Evita cadastrar duas vezes o mesmo lembrete
    # para a mesma prescrição e horário.
    __table_args__ = (
        UniqueConstraint(
            "prescricao_id",
            "agendado_para",
            name="uq_lembrete_prescricao_horario"
        ),
    )