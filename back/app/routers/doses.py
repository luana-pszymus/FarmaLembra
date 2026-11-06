
from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.prescricoes import Prescricao
from app.models.pacientes import Paciente
from app.models.doses_programadas import DoseProgramada
from app.models.registros_tomada import RegistroTomada
from app.models.lembretes import Lembrete
from app.models.usuarios import Usuario

from app.schemas.doses import (
    DoseProgramadaResponse,
    RegistroTomadaCreate,
    RegistroTomadaResponse
)

from app.routers.auth import obter_usuario_atual
from app.services.agendamento import gerar_agendamentos


router = APIRouter(
    prefix="/doses",
    tags=["Doses"]
)

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")

TEMPO_TOLERANCIA_MINUTOS = 30


def atualizar_doses_atrasadas(db: Session, paciente_id: int):
    limite = datetime.now(FUSO_HORARIO) - timedelta(
        minutes=TEMPO_TOLERANCIA_MINUTOS
    )

    doses_pendentes = db.scalars(
        select(DoseProgramada)
        .join(
            Prescricao,
            DoseProgramada.prescricao_id == Prescricao.id
        )
        .where(
            Prescricao.paciente_id == paciente_id,
            DoseProgramada.status == "pendente",
            DoseProgramada.agendado_para < limite
        )
    ).all()

    for dose in doses_pendentes:
        dose.status = "atrasada"

    if doses_pendentes:
        db.commit()

    return len(doses_pendentes)

# GERAR DOSES E LEMBRETES DE UMA PRESCRIÇÃO
@router.post(
    "/gerar/{prescricao_id}",
    response_model=list[DoseProgramadaResponse],
    status_code=status.HTTP_201_CREATED
)
def gerar_doses(
    prescricao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    prescricao = db.scalar(
        select(Prescricao)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .where(
            Prescricao.id == prescricao_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not prescricao:
        raise HTTPException(
            status_code=404,
            detail="Prescrição não encontrada."
        )

    if prescricao.status != "ativo":
        raise HTTPException(
            status_code=400,
            detail="Não é possível gerar doses de uma prescrição inativa."
        )

    agora = datetime.now(FUSO_HORARIO)

    # Tratamento temporário: utiliza a data de término.
    # Tratamento contínuo: gera uma agenda inicial de 30 dias.
    if prescricao.data_fim:
        if prescricao.data_fim < prescricao.data_inicio:
            raise HTTPException(
                status_code=400,
                detail="A data final é anterior à data inicial."
            )

        dias = (prescricao.data_fim - max(
            prescricao.data_inicio,
            agora.date()
        )).days + 1

        if dias <= 0:
            return []

        dias = min(dias, 90)

    else:
        dias = 30

    # Calcula os horários usando o serviço de agendamento.
    try:
        agendamentos = gerar_agendamentos(
            prescricao,
            dias=dias
        )

    except (ValueError, TypeError) as erro:
        raise HTTPException(
            status_code=400,
            detail=str(erro)
        )

    doses_criadas = []

    def garantir_lembrete(data_hora):
        if data_hora < agora:
            return

        lembrete_existente = db.scalar(
            select(Lembrete).where(
                Lembrete.prescricao_id == prescricao.id,
                Lembrete.agendado_para == data_hora
            )
        )

        if not lembrete_existente:
            db.add(
                Lembrete(
                    prescricao_id=prescricao.id,
                    agendado_para=data_hora,
                    status="pendente"
                )
            )

    # Salva as doses calculadas e cria os lembretes.
    for agendamento in agendamentos:
        data_hora = agendamento["data_hora"]

        dose_existente = db.scalar(
            select(DoseProgramada).where(
                DoseProgramada.prescricao_id == prescricao.id,
                DoseProgramada.agendado_para == data_hora
            )
        )

        if dose_existente:
            if dose_existente.status == "pendente":
                garantir_lembrete(dose_existente.agendado_para)

            continue

        dose = DoseProgramada(
            prescricao_id=prescricao.id,
            agendado_para=data_hora,
            status="pendente"
        )

        db.add(dose)
        doses_criadas.append(dose)

        garantir_lembrete(data_hora)

    try:
        db.commit()

        for dose in doses_criadas:
            db.refresh(dose)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao gerar doses e lembretes."
        )

    return doses_criadas


# LISTAR DOSES DE UM PACIENTE
@router.get(
    "/paciente/{paciente_id}",
    response_model=list[DoseProgramadaResponse]
)
def listar_doses_paciente(
    paciente_id: int,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    paciente = db.scalar(
        select(Paciente).where(
            Paciente.id == paciente_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente não encontrado."
        )

    atualizar_doses_atrasadas(db, paciente_id)

    consulta = (
        select(DoseProgramada)
        .join(Prescricao, DoseProgramada.prescricao_id == Prescricao.id)
        .where(Prescricao.paciente_id == paciente_id)
    )

    if data_inicio:
        inicio = datetime.combine(
            data_inicio,
            time.min,
            tzinfo=FUSO_HORARIO
        )

        consulta = consulta.where(
            DoseProgramada.agendado_para >= inicio
        )

    if data_fim:
        fim = datetime.combine(
            data_fim + timedelta(days=1),
            time.min,
            tzinfo=FUSO_HORARIO
        )

        consulta = consulta.where(
            DoseProgramada.agendado_para < fim
        )

    return db.scalars(
        consulta.order_by(DoseProgramada.agendado_para)
    ).all()


# CONFIRMAR TOMADA OU NÃO TOMADA
@router.post(
    "/{dose_id}/confirmar",
    response_model=RegistroTomadaResponse,
    status_code=status.HTTP_201_CREATED
)
def confirmar_dose(
    dose_id: int,
    dados: RegistroTomadaCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    dose = db.scalar(
        select(DoseProgramada)
        .join(Prescricao, DoseProgramada.prescricao_id == Prescricao.id)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .where(
            DoseProgramada.id == dose_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not dose:
        raise HTTPException(
            status_code=404,
            detail="Dose não encontrada."
        )

    registro_existente = db.scalar(
        select(RegistroTomada).where(
            RegistroTomada.dose_programada_id == dose.id
        )
    )

    if registro_existente:
        raise HTTPException(
            status_code=409,
            detail="Esta dose já foi confirmada."
        )

    registro = RegistroTomada(
        dose_programada_id=dose.id,
        resultado=dados.resultado,
        observacao=dados.observacao
    )

    dose.status = dados.resultado

    # Atualiza também o lembrete correspondente.
    lembrete = db.scalar(
        select(Lembrete).where(
            Lembrete.prescricao_id == dose.prescricao_id,
            Lembrete.agendado_para == dose.agendado_para
        )
    )

    if lembrete:
        lembrete.status = "respondido"
        lembrete.respondido_em = datetime.now(FUSO_HORARIO)

    try:
        db.add(registro)
        db.commit()
        db.refresh(registro)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao confirmar dose."
        )

    return registro
