
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Time,
    Numeric,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.sql import func

from app.database import Base


class Prescricao(Base):
    __tablename__ = "prescricoes"

    id = Column(Integer, primary_key=True, index=True)

    # Relacionamentos
    paciente_id = Column(
        Integer,
        ForeignKey("pacientes.id"),
        nullable=False
    )

    medicamento_id = Column(
        Integer,
        ForeignKey("medicamentos.id"),
        nullable=False
    )

    # Origem das informações
    origem_informacao = Column(
        String(30),
        nullable=False
    )

    # Configuração do agendamento
    modo_agendamento = Column(
        String(30),
        nullable=False
    )

    intervalo_horas = Column(
        Integer,
        nullable=True
    )

    # Frequência do tratamento
    frequencia = Column(
        String(30),
        nullable=True
    )

    horario_inicial = Column(
        Time,
        nullable=True
    )


    # Lista de horários, exemplo: ["08:00", "20:00"]
    horarios = Column(
        JSON,
        nullable=True
    )

    # Dias da semana: 0 = segunda-feira até 6 = domingo
    dias_semana = Column(
        JSON,
        nullable=True
    )

    # Quantidade por dose
    quantidade_por_dose = Column(
        Numeric(10, 2),
        nullable=False
    )

    unidade_quantidade = Column(
        String(30),
        nullable=False
    )

    # Duração do tratamento
    tipo_duracao = Column(
        String(20),
        nullable=False
    )

    data_inicio = Column(
        Date,
        nullable=False
    )

    data_fim = Column(
        Date,
        nullable=True
    )

    data_reavaliacao = Column(
        Date,
        nullable=True
    )

    # Informações adicionais
    orientacoes = Column(
        Text,
        nullable=True
    )

    status = Column(
        String(20),
        nullable=False,
        default="ativo"
    )

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
