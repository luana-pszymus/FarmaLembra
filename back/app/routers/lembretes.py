
import os
import secrets
import hashlib
import logging

from datetime import datetime, timedelta
from typing import Literal
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
from app.models.doses_programadas import DoseProgramada
from app.models.registros_tomada import RegistroTomada
from app.models.mensagens_discord import MensagemDiscord

from app.routers.auth import obter_usuario_atual
from app.models.usuarios import Usuario


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/lembretes", tags=["Lembretes"])

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")


# ============================================================
# AUTENTICAÇÃO DO BOT
# ============================================================

def verificar_chave_bot(
    x_bot_api_key: str | None = Header(
        default=None,
        alias="X-BOT-API-KEY"
    )
):
    chave_configurada = os.getenv("DISCORD_API_KEY")

    if not chave_configurada:
        raise HTTPException(
            status_code=503,
            detail="Chave de acesso do bot não configurada."
        )

    if not x_bot_api_key or not secrets.compare_digest(
        x_bot_api_key,
        chave_configurada
    ):
        raise HTTPException(
            status_code=401,
            detail="Chave de acesso inválida."
        )


# ============================================================
# SCHEMAS
# ============================================================

class LembreteEnviado(BaseModel):
    discord_message_id: str
    discord_channel_id: str
    conteudo: str


class VinculoDiscordCreate(BaseModel):
    codigo: str
    discord_user_id: str
    discord_channel_id: str


class RespostaDiscord(BaseModel):
    discord_user_id: str
    discord_channel_id: str
    discord_message_id: str
    discord_interaction_id: str
    resultado: Literal["tomada", "nao_tomada"]
    observacao: str | None = None


# ============================================================
# LISTAR LEMBRETES PENDENTES
# ============================================================

@router.get("/pendentes")
def listar_lembretes_pendentes(
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: None = Depends(verificar_chave_bot)
):
    agora = datetime.now(FUSO_HORARIO)

    resultados = (
        db.query(
            Lembrete,
            Prescricao,
            Paciente,
            Medicamento,
            VinculoDiscord
        )
        .join(
            Prescricao,
            Lembrete.prescricao_id == Prescricao.id
        )
        .join(
            Paciente,
            Prescricao.paciente_id == Paciente.id
        )
        .join(
            Medicamento,
            Prescricao.medicamento_id == Medicamento.id
        )
        .join(
            VinculoDiscord,
            VinculoDiscord.paciente_id == Paciente.id
        )
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
            "quantidade_por_dose": float(
                prescricao.quantidade_por_dose
            ),
            "unidade_quantidade": prescricao.unidade_quantidade,
            "agendado_para": lembrete.agendado_para,
            "orientacoes": prescricao.orientacoes
        })

    return resposta


# ============================================================
# REGISTRAR LEMBRETE ENVIADO
# ============================================================

@router.patch("/{lembrete_id}/enviado")
def marcar_lembrete_enviado(
    lembrete_id: int,
    dados: LembreteEnviado,
    db: Session = Depends(get_db),
    _: None = Depends(verificar_chave_bot)
):
    resultado = (
        db.query(Lembrete, Prescricao, Paciente, VinculoDiscord)
        .join(
            Prescricao,
            Lembrete.prescricao_id == Prescricao.id
        )
        .join(
            Paciente,
            Prescricao.paciente_id == Paciente.id
        )
        .join(
            VinculoDiscord,
            VinculoDiscord.paciente_id == Paciente.id
        )
        .filter(
            Lembrete.id == lembrete_id,
            VinculoDiscord.vinculado_em.isnot(None)
        )
        .first()
    )

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Lembrete ou vínculo Discord não encontrado."
        )

    lembrete, prescricao, paciente, vinculo = resultado

    if lembrete.status != "pendente":
        raise HTTPException(
            status_code=409,
            detail="Este lembrete já foi processado."
        )

    agora = datetime.now(FUSO_HORARIO)

    lembrete.status = "enviado"
    lembrete.discord_message_id = dados.discord_message_id
    lembrete.enviado_em = agora

    mensagem = MensagemDiscord(
        paciente_id=paciente.id,
        discord_user_id=vinculo.discord_user_id,
        discord_channel_id=dados.discord_channel_id,
        discord_message_id=dados.discord_message_id,
        discord_interaction_id=None,
        direcao="enviada",
        conteudo=dados.conteudo
    )

    db.add(mensagem)

    try:
        db.commit()
        db.refresh(lembrete)

    except Exception:
        db.rollback()

        logger.exception(
            "Erro ao registrar mensagem enviada do lembrete %s",
            lembrete_id
        )

        raise HTTPException(
            status_code=500,
            detail="Erro ao registrar envio do lembrete."
        )

    return {
        "mensagem": "Lembrete enviado e registrado com sucesso.",
        "lembrete_id": lembrete.id,
        "status": lembrete.status,
        "discord_message_id": lembrete.discord_message_id,
        "enviado_em": lembrete.enviado_em
    }


# ============================================================
# GERAR CÓDIGO DE VINCULAÇÃO
# ============================================================

@router.post("/vincular/{paciente_id}/codigo")
def gerar_codigo_vinculo(
    paciente_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    paciente = db.query(Paciente).filter(
        Paciente.id == paciente_id,
        Paciente.usuario_id == usuario.id
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente não encontrado."
        )

    vinculo = db.query(VinculoDiscord).filter(
        VinculoDiscord.paciente_id == paciente_id
    ).first()

    if vinculo and vinculo.vinculado_em:
        raise HTTPException(
            status_code=409,
            detail="Paciente já vinculado ao Discord."
        )

    codigo = secrets.token_hex(4).upper()

    if not vinculo:
        vinculo = VinculoDiscord(
            paciente_id=paciente_id,
            discord_user_id=f"pendente-{secrets.token_hex(8)}"
        )

        db.add(vinculo)

    vinculo.codigo_hash = hashlib.sha256(
        codigo.encode()
    ).hexdigest()

    vinculo.codigo_expira_em = (
        datetime.now(FUSO_HORARIO) + timedelta(minutes=10)
    )

    db.commit()

    return {
        "codigo": codigo,
        "expira_em": vinculo.codigo_expira_em
    }


# ============================================================
# CONFIRMAR VÍNCULO COM DISCORD
# ============================================================


@router.post("/vincular")
def confirmar_vinculo_discord(
    dados: VinculoDiscordCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verificar_chave_bot)
):
    codigo_hash = hashlib.sha256(
        dados.codigo.upper().encode()
    ).hexdigest()

    vinculo = db.query(VinculoDiscord).filter(
        VinculoDiscord.codigo_hash == codigo_hash
    ).first()

    if not vinculo:
        raise HTTPException(
            status_code=404,
            detail="Código inválido ou expirado."
        )

    agora = datetime.now(FUSO_HORARIO)
    expiracao = vinculo.codigo_expira_em

    if expiracao and expiracao.tzinfo is None:
        expiracao = expiracao.replace(
            tzinfo=FUSO_HORARIO
        )

    if not expiracao or expiracao < agora:
        vinculo.codigo_hash = None
        vinculo.codigo_expira_em = None
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="Código expirado."
        )

    paciente = db.query(Paciente).filter(
        Paciente.id == vinculo.paciente_id
    ).first()

    if not paciente:
        raise HTTPException(
            status_code=404,
            detail="Paciente não encontrado."
        )

    # Procura outros pacientes vinculados a esta conta Discord.
    outros_vinculos = (
        db.query(VinculoDiscord)
        .join(
            Paciente,
            VinculoDiscord.paciente_id == Paciente.id
        )
        .filter(
            VinculoDiscord.discord_user_id == dados.discord_user_id,
            VinculoDiscord.vinculado_em.isnot(None),
            VinculoDiscord.id != vinculo.id
        )
        .all()
    )

    # Todos os pacientes vinculados precisam pertencer
    # ao mesmo usuário do FarmaLembra.
    for outro_vinculo in outros_vinculos:
        outro_paciente = db.query(Paciente).filter(
            Paciente.id == outro_vinculo.paciente_id
        ).first()

        if (
            not outro_paciente
            or outro_paciente.usuario_id != paciente.usuario_id
        ):
            raise HTTPException(
                status_code=409,
                detail=(
                    "Esta conta Discord já está vinculada "
                    "a pacientes de outro usuário."
                )
            )

    vinculo.discord_user_id = dados.discord_user_id
    vinculo.discord_channel_id = dados.discord_channel_id
    vinculo.vinculado_em = agora
    vinculo.codigo_hash = None
    vinculo.codigo_expira_em = None

    try:
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Erro ao vincular conta Discord.")

        raise HTTPException(
            status_code=500,
            detail="Erro ao vincular conta Discord."
        )

    return {
        "mensagem": "Conta Discord vinculada com sucesso."
    }


# ============================================================
# REGISTRAR RESPOSTA RECEBIDA DO DISCORD
# ============================================================

@router.post("/{lembrete_id}/responder")
def responder_lembrete_discord(
    lembrete_id: int,
    dados: RespostaDiscord,
    db: Session = Depends(get_db),
    _: None = Depends(verificar_chave_bot)
):
    # Verifica se a interação já foi registrada
    interacao_existente = db.query(MensagemDiscord).filter(
        MensagemDiscord.discord_interaction_id
        == dados.discord_interaction_id
    ).first()

    if interacao_existente:
        raise HTTPException(
            status_code=409,
            detail="Esta interação já foi registrada."
        )

    resultado = (
        db.query(Lembrete, Prescricao, Paciente)
        .join(
            Prescricao,
            Lembrete.prescricao_id == Prescricao.id
        )
        .join(
            Paciente,
            Prescricao.paciente_id == Paciente.id
        )
        .filter(Lembrete.id == lembrete_id)
        .first()
    )

    if not resultado:
        raise HTTPException(
            status_code=404,
            detail="Lembrete não encontrado."
        )

    lembrete, prescricao, paciente = resultado

    vinculo = db.query(VinculoDiscord).filter(
        VinculoDiscord.paciente_id == paciente.id,
        VinculoDiscord.discord_user_id == dados.discord_user_id,
        VinculoDiscord.vinculado_em.isnot(None)
    ).first()

    if not vinculo:
        raise HTTPException(
            status_code=403,
            detail="Conta Discord não vinculada a este paciente."
        )

    if lembrete.status != "enviado":
        raise HTTPException(
            status_code=409,
            detail="Este lembrete já foi respondido ou não foi enviado."
        )

    # Confere se a mensagem pertence a este lembrete
    if lembrete.discord_message_id != dados.discord_message_id:
        raise HTTPException(
            status_code=403,
            detail="A mensagem Discord não corresponde a este lembrete."
        )

    dose = db.query(DoseProgramada).filter(
        DoseProgramada.prescricao_id == prescricao.id,
        DoseProgramada.agendado_para == lembrete.agendado_para
    ).first()

    if not dose:
        raise HTTPException(
            status_code=404,
            detail="Dose programada não encontrada."
        )

    registro_existente = db.query(RegistroTomada).filter(
        RegistroTomada.dose_programada_id == dose.id
    ).first()

    if registro_existente:
        raise HTTPException(
            status_code=409,
            detail="Esta dose já foi confirmada."
        )

    agora = datetime.now(FUSO_HORARIO)

    registro = RegistroTomada(
        dose_programada_id=dose.id,
        resultado=dados.resultado,
        observacao=dados.observacao
    )

    mensagem = MensagemDiscord(
        paciente_id=paciente.id,
        discord_user_id=dados.discord_user_id,
        discord_channel_id=dados.discord_channel_id,
        discord_message_id=dados.discord_message_id,
        discord_interaction_id=dados.discord_interaction_id,
        direcao="recebida",
        conteudo=f"Resposta ao lembrete: {dados.resultado}"
    )

    db.add(registro)
    db.add(mensagem)

    dose.status = dados.resultado
    lembrete.status = "respondido"
    lembrete.respondido_em = agora

    try:
        db.commit()

    except Exception:
        db.rollback()

        logger.exception(
            "Erro ao registrar resposta Discord do lembrete %s",
            lembrete_id
        )

        raise HTTPException(
            status_code=500,
            detail="Erro ao registrar resposta do Discord."
        )

    return {
        "mensagem": "Resposta registrada com sucesso.",
        "lembrete_id": lembrete.id,
        "dose_id": dose.id,
        "resultado": dose.status
    }
