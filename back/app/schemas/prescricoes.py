
from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date, time
from typing import Literal


class PrescricaoBase(BaseModel):
    paciente_id: int
    medicamento_id: int

    origem_informacao: Literal["manual", "receita_medica"]

    modo_agendamento: Literal["horarios_fixos", "intervalo"]
    intervalo_horas: int | None = Field(default=None, gt=0)

    frequencia: str | None = None
    horarios: list[str] | None = None
    dias_semana: list[int] | None = None

    # Utilizado somente no agendamento por intervalo
    horario_inicial: time | None = None

    quantidade_por_dose: float = Field(gt=0)
    unidade_quantidade: str

    tipo_duracao: Literal["temporario", "continuo"]

    data_inicio: date
    data_fim: date | None = None
    data_reavaliacao: date | None = None

    orientacoes: str | None = None

    @model_validator(mode="after")
    def validar_tratamento(self):

        # Validação do agendamento por intervalo
        if self.modo_agendamento == "intervalo":
            if self.intervalo_horas is None:
                raise ValueError("Informe o intervalo em horas.")

            if self.horario_inicial is None:
                raise ValueError("Informe o horário da primeira dose.")

            if self.horarios:
                raise ValueError(
                    "Não informe horários fixos para agendamento por intervalo."
                )

        # Validação dos horários fixos
        if self.modo_agendamento == "horarios_fixos":
            if self.intervalo_horas is not None:
                raise ValueError(
                    "Não informe intervalo_horas para horários fixos."
                )

            if self.horario_inicial is not None:
                raise ValueError(
                    "O horário inicial é utilizado apenas para intervalos."
                )

            if not self.horarios:
                raise ValueError("Informe pelo menos um horário.")

        # Validação do formato dos horários fixos
        if self.horarios:
            try:
                horarios_convertidos = [
                    time.fromisoformat(horario)
                    for horario in self.horarios
                ]
            except (ValueError, TypeError):
                raise ValueError(
                    "Informe horários válidos no formato HH:MM."
                )

            if len(horarios_convertidos) != len(set(horarios_convertidos)):
                raise ValueError("Não informe horários repetidos.")

        # Validação dos dias da semana
        if self.dias_semana is not None:
            if any(dia < 0 or dia > 6 for dia in self.dias_semana):
                raise ValueError(
                    "Os dias da semana devem estar entre 0 e 6."
                )

            if len(self.dias_semana) != len(set(self.dias_semana)):
                raise ValueError(
                    "Não informe dias da semana repetidos."
                )

        # Validação da duração do tratamento
        if self.tipo_duracao == "temporario" and self.data_fim is None:
            raise ValueError(
                "Informe a data de término para tratamentos temporários."
            )

        if self.tipo_duracao == "continuo" and self.data_fim is not None:
            raise ValueError(
                "Tratamentos contínuos não devem possuir data de término."
            )

        if self.data_fim and self.data_fim < self.data_inicio:
            raise ValueError(
                "A data de término não pode ser anterior à data de início."
            )

        return self


class PrescricaoCreate(PrescricaoBase):
    pass


class PrescricaoUpdate(PrescricaoBase):
    pass


class PrescricaoResponse(PrescricaoBase):
    id: int
    status: str

    model_config = ConfigDict(from_attributes=True)
