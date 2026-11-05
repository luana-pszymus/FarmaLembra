from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pacientes import Paciente
from app.models.prescricoes import Prescricao
from app.models.medicamentos import Medicamento
from app.models.doses_programadas import DoseProgramada
from app.routers.auth import obter_usuario_atual

router = APIRouter(
    prefix="/relatorios",
    tags=["Relatórios"]
)

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")


@router.get("/adesao/{paciente_id}")
def relatorio_adesao(
    paciente_id: int,
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    # Verifica se o paciente pertence ao usuário autenticado
    paciente = db.query(Paciente).filter(
        Paciente.id == paciente_id,
        Paciente.usuario_id == usuario.id
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente não encontrado."
        )

    # Valida o período informado
    if data_inicio and data_fim and data_inicio > data_fim:
        raise HTTPException(
            status_code=400,
            detail="A data inicial não pode ser maior que a data final."
        )

    # Consulta as doses do paciente
    consulta = (
        db.query(DoseProgramada)
        .join(
            Prescricao,
            DoseProgramada.prescricao_id == Prescricao.id
        )
        .filter(Prescricao.paciente_id == paciente_id)
    )

    # Aplica os filtros de data, se informados
    if data_inicio:
        inicio = datetime.combine(
            data_inicio,
            time.min,
            tzinfo=FUSO_HORARIO
        )
        consulta = consulta.filter(
            DoseProgramada.agendado_para >= inicio
        )

    if data_fim:
        dia_seguinte = data_fim + timedelta(days=1)
        fim = datetime.combine(
            dia_seguinte,
            time.min,
            tzinfo=FUSO_HORARIO
        )
        consulta = consulta.filter(
            DoseProgramada.agendado_para < fim
        )

    # Calcula os totais por status
    resultado = consulta.with_entities(
        func.count(DoseProgramada.id).label("total"),
        func.sum(
            case(
                (DoseProgramada.status == "tomada", 1),
                else_=0
            )
        ).label("tomadas"),
        func.sum(
            case(
                (DoseProgramada.status == "nao_tomada", 1),
                else_=0
            )
        ).label("nao_tomadas"),
        func.sum(
            case(
                (DoseProgramada.status == "pendente", 1),
                else_=0
            )
        ).label("pendentes")
    ).one()

    total = resultado.total or 0
    tomadas = resultado.tomadas or 0
    nao_tomadas = resultado.nao_tomadas or 0
    pendentes = resultado.pendentes or 0

    # Calcula a porcentagem de adesão
    doses_confirmadas = tomadas + nao_tomadas

    if doses_confirmadas > 0:
        percentual_adesao = round(
            (tomadas / doses_confirmadas) * 100,
            2
        )
    else:
        percentual_adesao = 0

    return {
        "paciente_id": paciente.id,
        "paciente": paciente.nome,
        "periodo": {
            "data_inicio": data_inicio,
            "data_fim": data_fim
        },
        "total_doses": total,
        "tomadas": tomadas,
        "nao_tomadas": nao_tomadas,
        "pendentes": pendentes,
        "doses_confirmadas": doses_confirmadas,
        "percentual_adesao": percentual_adesao
    }

@router.get("/adesao/{paciente_id}/medicamentos")
def relatorio_adesao_por_medicamento(
    paciente_id: int,
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual)
):
    # Verifica se o paciente pertence ao usuário
    paciente = db.query(Paciente).filter(
        Paciente.id == paciente_id,
        Paciente.usuario_id == usuario.id
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente não encontrado."
        )

    if data_inicio and data_fim and data_inicio > data_fim:
        raise HTTPException(
            status_code=400,
            detail="A data inicial não pode ser maior que a data final."
        )

    # Consulta as doses agrupadas por medicamento
    consulta = (
        db.query(
            Medicamento.id.label("medicamento_id"),
            Medicamento.nome.label("medicamento"),
            func.count(DoseProgramada.id).label("total"),
            func.sum(
                case(
                    (DoseProgramada.status == "tomada", 1),
                    else_=0
                )
            ).label("tomadas"),
            func.sum(
                case(
                    (DoseProgramada.status == "nao_tomada", 1),
                    else_=0
                )
            ).label("nao_tomadas"),
            func.sum(
                case(
                    (DoseProgramada.status == "pendente", 1),
                    else_=0
                )
            ).label("pendentes")
        )
        .join(
            Prescricao,
            DoseProgramada.prescricao_id == Prescricao.id
        )
        .join(
            Medicamento,
            Prescricao.medicamento_id == Medicamento.id
        )
        .filter(Prescricao.paciente_id == paciente_id)
    )

    if data_inicio:
        inicio = datetime.combine(
            data_inicio,
            time.min,
            tzinfo=FUSO_HORARIO
        )
        consulta = consulta.filter(
            DoseProgramada.agendado_para >= inicio
        )

    if data_fim:
        dia_seguinte = data_fim + timedelta(days=1)
        fim = datetime.combine(
            dia_seguinte,
            time.min,
            tzinfo=FUSO_HORARIO
        )
        consulta = consulta.filter(
            DoseProgramada.agendado_para < fim
        )

    resultados = (
        consulta
        .group_by(Medicamento.id, Medicamento.nome)
        .order_by(Medicamento.nome)
        .all()
    )

    relatorios = []

    for resultado in resultados:
        tomadas = resultado.tomadas or 0
        nao_tomadas = resultado.nao_tomadas or 0
        pendentes = resultado.pendentes or 0

        confirmadas = tomadas + nao_tomadas

        percentual = (
            round((tomadas / confirmadas) * 100, 2)
            if confirmadas > 0
            else 0
        )

        relatorios.append({
            "medicamento_id": resultado.medicamento_id,
            "medicamento": resultado.medicamento,
            "total_doses": resultado.total,
            "tomadas": tomadas,
            "nao_tomadas": nao_tomadas,
            "pendentes": pendentes,
            "doses_confirmadas": confirmadas,
            "percentual_adesao": percentual
        })

    return {
        "paciente_id": paciente.id,
        "paciente": paciente.nome,
        "periodo": {
            "data_inicio": data_inicio,
            "data_fim": data_fim
        },
        "medicamentos": relatorios
    }