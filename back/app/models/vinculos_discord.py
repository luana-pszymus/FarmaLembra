from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class VinculoDiscord(Base):
    __tablename__ = "vinculos_discord"

    id = Column(Integer, primary_key=True, index=True)

    # Cada paciente poderá ter um vínculo com o Discord.
    paciente_id = Column(
        Integer,
        ForeignKey("pacientes.id"),
        nullable=False,
        unique=True
    )

    # Identificador da conta do Discord.
    discord_user_id = Column(
        String(30),
        nullable=False,
        unique=True
    )

    # Identificador do canal privado com o bot.
    discord_channel_id = Column(
        String(30),
        nullable=True
    )

    # Código temporário utilizado na vinculação.
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