from datetime import date, datetime, time, timedelta


def gerar_agendamentos(prescricao, dias: int = 30):
    if dias < 1 or dias > 90:
        raise ValueError("O período deve estar entre 1 e 90 dias.")

    inicio = prescricao.data_inicio

    # Tratamentos temporários respeitam a data de término.
    # Tratamentos contínuos recebem uma agenda inicial de 30 dias.
    fim = inicio + timedelta(days=dias - 1)

    if prescricao.data_fim:
        fim = min(fim, prescricao.data_fim)

    agendamentos = []

    def dia_permitido(data):
        return (
            not prescricao.dias_semana
            or data.weekday() in prescricao.dias_semana
        )

    if prescricao.modo_agendamento == "horarios_fixos":

        for dia in range((fim - inicio).days + 1):
            data_atual = inicio + timedelta(days=dia)

            if not dia_permitido(data_atual):
                continue

            for horario in prescricao.horarios:
                hora = time.fromisoformat(horario)

                agendamentos.append({
                    "data_hora": datetime.combine(
                        data_atual, hora
                    ).isoformat(),
                    "quantidade": float(
                        prescricao.quantidade_por_dose
                    ),
                    "unidade": prescricao.unidade_quantidade,
                    "prescricao_id": prescricao.id
                })

    elif prescricao.modo_agendamento == "intervalo":

        atual = datetime.combine(
            inicio,
            prescricao.horario_inicial
        )

        limite = datetime.combine(
            fim,
            time.max
        )

        intervalo = timedelta(
            hours=prescricao.intervalo_horas
        )

        while atual <= limite:

            if dia_permitido(atual.date()):
                agendamentos.append({
                    "data_hora": atual.isoformat(),
                    "quantidade": float(
                        prescricao.quantidade_por_dose
                    ),
                    "unidade": prescricao.unidade_quantidade,
                    "prescricao_id": prescricao.id
                })

            atual += intervalo

    return agendamentos