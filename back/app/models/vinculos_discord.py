
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class VinculoDiscord(Base):
    __tablename__ = "vinculos_discord"

    id = Column(Integer, primary_key=True, index=True)

    # Cada paciente poderá ter apenas um vínculo.
    paciente_id = Column(
        Integer,
        ForeignKey("pacientes.id"),
        nullable=False,
        unique=True
    )

    # Uma conta Discord poderá estar vinculada a vários pacientes.
    discord_user_id = Column(
        String(30),
        nullable=False,
        index=True
    )

    discord_channel_id = Column(
        String(30),
        nullable=True
    )

    codigo_hash = Column(
        String(255),
        nullable=True
    )

    codigo_expira_em = Column(
        DateTime(timezone=True),
        nullable=True
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    vinculado_em = Column(
        DateTime(timezone=True),
        nullable=True
    )
