
import os
import secrets
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.lembretes import Lembrete
from app.models.prescricoes import Prescricao
from app.models.pacientes import Paciente
from app.models.medicamentos import Medicamento
from app.models.vinculos_discord import VinculoDiscord


router = APIRouter(prefix="/lembretes", tags=["Lembretes"])

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")


# Verifica a chave de acesso utilizada pelo bot
def verificar_chave_bot(
    x_bot_api_key: str | None = Header(default=None, alias="X-BOT-API-KEY")
):
    chave_configurada = os.getenv("DISCORD_API_KEY")

    if not chave_configurada:
        raise HTTPException(
            status_code=503,
            detail="Chave de acesso do bot não configurada."
        )

    if not x_bot_api_key or not secrets.compare_digest(
        x_bot_api_key, chave_configurada
    ):
        raise HTTPException(
            status_code=401,
            detail="Chave de acesso inválida."
        )


class LembreteEnviado(BaseModel):
    discord_message_id: str


# Lista lembretes vencidos que possuem vínculo com o Discord
@router.get("/pendentes")
def listar_lembretes_pendentes(
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: None = Depends(verificar_chave_bot)
):
    agora = datetime.now(FUSO_HORARIO)

    resultados = (
        db.query(Lembrete, Prescricao, Paciente, Medicamento, VinculoDiscord)
        .join(Prescricao, Lembrete.prescricao_id == Prescricao.id)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .join(Medicamento, Prescricao.medicamento_id == Medicamento.id)
        .join(VinculoDiscord, VinculoDiscord.paciente_id == Paciente.id)
        .filter(
            Lembrete.status == "pendente",
            Lembrete.agendado_para <= agora,
            VinculoDiscord.vinculado_em.isnot(None)
        )
        .order_by(Lembrete.agendado_para.asc())
        .limit(limit)
        .all()
    )

    resposta = []

    for lembrete, prescricao, paciente, medicamento, vinculo in resultados:
        resposta.append({
            "lembrete_id": lembrete.id,
            "paciente_id": paciente.id,
            "paciente_nome": paciente.nome,
            "discord_user_id": vinculo.discord_user_id,
            "discord_channel_id": vinculo.discord_channel_id,
            "medicamento_nome": medicamento.nome,
            "medicamento_dosagem": medicamento.dosagem,
            "forma_farmaceutica": medicamento.forma_farmaceutica,
            "quantidade_por_dose": float(prescricao.quantidade_por_dose),
            "unidade_quantidade": prescricao.unidade_quantidade,
            "agendado_para": lembrete.agendado_para,
            "orientacoes": prescricao.orientacoes
        })

    return resposta


# Registra que o bot conseguiu enviar a mensagem
@router.patch("/{lembrete_id}/enviado")
def marcar_lembrete_enviado(
    lembrete_id: int,
    dados: LembreteEnviado,
    db: Session = Depends(get_db),
    _: None = Depends(verificar_chave_bot)
):
    lembrete = db.query(Lembrete).filter(
        Lembrete.id == lembrete_id
    ).first()

    if not lembrete:
        raise HTTPException(
            status_code=404,
            detail="Lembrete não encontrado."
        )

    if lembrete.status != "pendente":
        raise HTTPException(
            status_code=409,
            detail="Este lembrete já foi processado."
        )

    lembrete.status = "enviado"
    lembrete.discord_message_id = dados.discord_message_id
    lembrete.enviado_em = datetime.now(FUSO_HORARIO)

    db.commit()
    db.refresh(lembrete)

    return {
        "mensagem": "Lembrete marcado como enviado.",
        "lembrete_id": lembrete.id,
        "status": lembrete.status,
        "discord_message_id": lembrete.discord_message_id,
        "enviado_em": lembrete.enviado_em
    }
