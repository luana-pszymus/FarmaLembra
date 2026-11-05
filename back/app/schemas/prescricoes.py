from pydantic import BaseModel, ConfigDict, Field, model_validator
from datetime import date
from typing import Literal


class PrescricaoBase(BaseModel):
    paciente_id: int
    medicamento_id: int

    origem_informacao: Literal["manual", "receita_medica"]

    modo_agendamento: Literal["horarios_fixos", "intervalo"]
    intervalo_horas: int | None = Field(default=None, gt=0)

    quantidade_por_dose: float = Field(gt=0)
    unidade_quantidade: str

    tipo_duracao: Literal["temporario", "continuo"]

    data_inicio: date
    data_fim: date | None = None
    data_reavaliacao: date | None = None

    orientacoes: str | None = None

    @model_validator(mode="after")
    def validar_tratamento(self):
        if self.modo_agendamento == "intervalo" and self.intervalo_horas is None:
            raise ValueError(
                "Informe o intervalo em horas para esse tipo de agendamento."
            )

        if self.modo_agendamento == "horarios_fixos" and self.intervalo_horas is not None:
            raise ValueError(
                "Não informe intervalo_horas para horários fixos."
            )

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