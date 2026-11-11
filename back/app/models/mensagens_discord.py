
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class MensagemDiscord(Base):
    __tablename__ = "mensagens_discord"

    id = Column(Integer, primary_key=True, index=True)

    paciente_id = Column(
        Integer,
        ForeignKey("pacientes.id"),
        nullable=False
    )

    discord_user_id = Column(
        String(30),
        nullable=False
    )

    discord_channel_id = Column(
        String(30),
        nullable=False
    )

    # ID da mensagem original no Discord.
    # Pode aparecer em mais de um registro.
    discord_message_id = Column(
        String(30),
        nullable=False
    )

    # Identifica exclusivamente cada interação recebida.
    # Nas mensagens enviadas, permanece NULL.
    discord_interaction_id = Column(
        String(30),
        nullable=True,
        unique=True
    )

    # Valores esperados: enviada ou recebida.
    direcao = Column(
        String(10),
        nullable=False
    )

    conteudo = Column(
        Text,
        nullable=False
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
