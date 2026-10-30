from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.medicamento import Medicamento
from app.schemas.medicamento import (
    MedicamentoCreate,
    MedicamentoResponse,
    MedicamentoUpdate,
)

router = APIRouter(
    prefix="/medicamentos",
    tags=["Medicamentos"],
)


@router.post(
    "/",
    response_model=MedicamentoResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_medicamento(
    dados: MedicamentoCreate,
    db: Session = Depends(get_db),
):
    medicamento = Medicamento(**dados.model_dump())

    db.add(medicamento)
    db.commit()
    db.refresh(medicamento)

    return medicamento


@router.get(
    "/",
    response_model=list[MedicamentoResponse],
)
def listar_medicamentos(
    db: Session = Depends(get_db),
):
    medicamentos = db.scalars(
        select(Medicamento).order_by(Medicamento.nome)
    ).all()

    return medicamentos


@router.get(
    "/{medicamento_id}",
    response_model=MedicamentoResponse,
)
def buscar_medicamento(
    medicamento_id: int,
    db: Session = Depends(get_db),
):
    medicamento = db.get(Medicamento, medicamento_id)

    if medicamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado",
        )

    return medicamento


@router.put(
    "/{medicamento_id}",
    response_model=MedicamentoResponse,
)
def atualizar_medicamento(
    medicamento_id: int,
    dados: MedicamentoUpdate,
    db: Session = Depends(get_db),
):
    medicamento = db.get(Medicamento, medicamento_id)

    if medicamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado",
        )

    dados_atualizados = dados.model_dump(exclude_unset=True)

    for campo, valor in dados_atualizados.items():
        setattr(medicamento, campo, valor)

    db.commit()
    db.refresh(medicamento)

    return medicamento


@router.delete(
    "/{medicamento_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_medicamento(
    medicamento_id: int,
    db: Session = Depends(get_db),
):
    medicamento = db.get(Medicamento, medicamento_id)

    if medicamento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado",
        )

    db.delete(medicamento)
    db.commit()