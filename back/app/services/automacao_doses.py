
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import logging

from sqlalchemy import select, exists
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.doses_programadas import DoseProgramada
from app.models.registros_tomada import RegistroTomada
from app.models.lembretes import Lembrete


logger = logging.getLogger(__name__)

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")

TEMPO_LIMITE_HORAS = 24


def processar_doses_expiradas() -> int:
    """
    Marca automaticamente como não tomadas as doses
    pendentes ou atrasadas há mais de 24 horas.
    """

    db: Session = SessionLocal()

    try:
        agora = datetime.now(FUSO_HORARIO)

        limite = agora - timedelta(hours=TEMPO_LIMITE_HORAS)

        # Verifica se já existe registro para cada dose.
        registro_existente = exists(
            select(RegistroTomada.id).where(
                RegistroTomada.dose_programada_id == DoseProgramada.id
            )
        )

        # Busca apenas doses vencidas e sem confirmação.
        # FOR UPDATE bloqueia somente a tabela de doses.
        doses = db.scalars(
            select(DoseProgramada)
            .where(
                DoseProgramada.status.in_(["pendente", "atrasada"]),
                DoseProgramada.agendado_para <= limite,
                ~registro_existente
            )
            .with_for_update(
                skip_locked=True,
                of=DoseProgramada
            )
        ).all()

        quantidade_processada = 0

        for dose in doses:

            registro = RegistroTomada(
                dose_programada_id=dose.id,
                resultado="nao_tomada",
                origem="automatica",
                observacao=(
                    "Dose marcada automaticamente após "
                    "24 horas sem confirmação."
                )
            )

            db.add(registro)

            dose.status = "nao_tomada"

            lembrete = db.scalar(
                select(Lembrete).where(
                    Lembrete.prescricao_id == dose.prescricao_id,
                    Lembrete.agendado_para == dose.agendado_para
                )
            )

            if lembrete:
                lembrete.status = "respondido"
                lembrete.respondido_em = agora

            quantidade_processada += 1

        db.commit()

        if quantidade_processada:
            logger.info(
                "%s dose(s) marcada(s) automaticamente como não tomada.",
                quantidade_processada
            )

        return quantidade_processada

    except Exception:
        db.rollback()

        logger.exception(
            "Erro ao processar doses expiradas automaticamente."
        )

        raise

    finally:
        db.close()
