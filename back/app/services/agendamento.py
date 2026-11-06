
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

FUSO_HORARIO = ZoneInfo("America/Sao_Paulo")


def gerar_agendamentos(prescricao, dias: int = 30):
    if dias < 1 or dias > 90:
        raise ValueError("O período deve estar entre 1 e 90 dias.")

    hoje = datetime.now(FUSO_HORARIO).date()

    # A geração começa na data atual ou na data de início,
    # considerando a que for mais recente.
    inicio = max(prescricao.data_inicio, hoje)

    fim = inicio + timedelta(days=dias - 1)

    # Tratamentos temporários respeitam a data de término.
    if prescricao.data_fim:
        fim = min(fim, prescricao.data_fim)

    if fim < inicio:
        return []

    agendamentos = []

    dias_semana = prescricao.dias_semana

    def dia_permitido(data):
        return (
            dias_semana is None
            or data.weekday() in dias_semana
        )

    def adicionar(data_hora):
        agendamentos.append({
            "data_hora": data_hora,
            "quantidade": float(prescricao.quantidade_por_dose),
            "unidade": prescricao.unidade_quantidade,
            "prescricao_id": prescricao.id
        })

    # AGENDAMENTO POR HORÁRIOS FIXOS
    if prescricao.modo_agendamento == "horarios_fixos":

        for dia in range((fim - inicio).days + 1):
            data_atual = inicio + timedelta(days=dia)

            if not dia_permitido(data_atual):
                continue

            for horario in prescricao.horarios or []:
                hora = time.fromisoformat(horario)

                data_hora = datetime.combine(
                    data_atual,
                    hora,
                    tzinfo=FUSO_HORARIO
                )

                adicionar(data_hora)

    # AGENDAMENTO POR INTERVALO
    elif prescricao.modo_agendamento == "intervalo":

        if not prescricao.intervalo_horas or not prescricao.horario_inicial:
            raise ValueError(
                "Prescrição sem intervalo ou horário inicial."
            )

        intervalo = timedelta(hours=prescricao.intervalo_horas)

        data_atual = inicio

        while data_atual <= fim:

            if dia_permitido(data_atual):
                atual = datetime.combine(
                    data_atual,
                    prescricao.horario_inicial,
                    tzinfo=FUSO_HORARIO
                )

                limite = datetime.combine(
                    data_atual,
                    time.max,
                    tzinfo=FUSO_HORARIO
                )

                while atual <= limite:
                    adicionar(atual)
                    atual += intervalo

            data_atual += timedelta(days=1)

    else:
        raise ValueError("Modo de agendamento inválido.")

    return agendamentos
