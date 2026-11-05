
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
from app.models.usuarios import Usuario

from app.schemas.doses import (
    DoseProgramadaResponse,
    RegistroTomadaCreate,
    RegistroTomadaResponse
)

from app.routers.auth import obter_usuario_atual


router = APIRouter(
    prefix="/doses",
    tags=["Doses"]
)

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")


# GERAR DOSES DE UMA PRESCRIÇÃO
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

    data_final = prescricao.data_fim or date.today()

    if data_final < prescricao.data_inicio:
        raise HTTPException(
            status_code=400,
            detail="A data final é anterior à data inicial."
        )

    doses_criadas = []

    def adicionar_dose(data_hora):
        dose_existente = db.scalar(
            select(DoseProgramada).where(
                DoseProgramada.prescricao_id == prescricao.id,
                DoseProgramada.agendado_para == data_hora
            )
        )

        if dose_existente:
            return

        dose = DoseProgramada(
            prescricao_id=prescricao.id,
            agendado_para=data_hora,
            status="pendente"
        )

        db.add(dose)
        doses_criadas.append(dose)

    # AGENDAMENTO POR HORÁRIOS FIXOS
    if prescricao.modo_agendamento == "horarios_fixos":

        data_atual = prescricao.data_inicio

        while data_atual <= data_final:

            if (
                prescricao.dias_semana is None
                or data_atual.weekday() in prescricao.dias_semana
            ):
                for horario in prescricao.horarios or []:
                    hora = time.fromisoformat(horario)

                    data_hora = datetime.combine(
                        data_atual,
                        hora,
                        tzinfo=FUSO_HORARIO
                    )

                    adicionar_dose(data_hora)

            data_atual += timedelta(days=1)

    # AGENDAMENTO POR INTERVALO
    elif prescricao.modo_agendamento == "intervalo":

        if not prescricao.intervalo_horas or not prescricao.horario_inicial:
            raise HTTPException(
                status_code=400,
                detail="Prescrição sem intervalo ou horário inicial."
            )

        inicio = datetime.combine(
            prescricao.data_inicio,
            prescricao.horario_inicial,
            tzinfo=FUSO_HORARIO
        )

        fim = datetime.combine(
            data_final,
            time(23, 59, 59),
            tzinfo=FUSO_HORARIO
        )

        intervalo = timedelta(hours=prescricao.intervalo_horas)

        data_hora = inicio

        while data_hora <= fim:
            adicionar_dose(data_hora)
            data_hora += intervalo

    else:
        raise HTTPException(
            status_code=400,
            detail="Modo de agendamento inválido."
        )

    try:
        db.commit()

        for dose in doses_criadas:
            db.refresh(dose)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao gerar doses."
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
