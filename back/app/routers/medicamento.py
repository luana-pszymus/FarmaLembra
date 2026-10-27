from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.medicamento import Medicamento
from app.schemas.medicamento import (
    MedicamentoCreate,
    MedicamentoUpdate,
    MedicamentoResponse
)


router = APIRouter(
    prefix="/medicamentos",
    tags=["Medicamentos"]
)


@router.post("/", response_model=MedicamentoResponse, status_code=201)
def criar_medicamento(
    medicamento: MedicamentoCreate,
    db: Session = Depends(get_db)
):
    novo_medicamento = Medicamento(**medicamento.model_dump())

    db.add(novo_medicamento)
    db.commit()
    db.refresh(novo_medicamento)

    return novo_medicamento


@router.get("/", response_model=list[MedicamentoResponse])
def listar_medicamentos(
    db: Session = Depends(get_db)
):
    medicamentos = db.query(Medicamento).all()

    return medicamentos


@router.get("/{medicamento_id}", response_model=MedicamentoResponse)
def buscar_medicamento(
    medicamento_id: int,
    db: Session = Depends(get_db)
):
    medicamento = (
        db.query(Medicamento)
        .filter(Medicamento.id == medicamento_id)
        .first()
    )

    if not medicamento:
        raise HTTPException(
            status_code=404,
            detail="Medicamento não encontrado"
        )

    return medicamento


@router.put("/{medicamento_id}", response_model=MedicamentoResponse)
def atualizar_medicamento(
    medicamento_id: int,
    dados: MedicamentoUpdate,
    db: Session = Depends(get_db)
):
    medicamento = (
        db.query(Medicamento)
        .filter(Medicamento.id == medicamento_id)
        .first()
    )

    if not medicamento:
        raise HTTPException(
            status_code=404,
            detail="Medicamento não encontrado"
        )

    dados_atualizacao = dados.model_dump(exclude_unset=True)

    for campo, valor in dados_atualizacao.items():
        setattr(medicamento, campo, valor)

    db.commit()
    db.refresh(medicamento)

    return medicamento


@router.delete("/{medicamento_id}")
def excluir_medicamento(
    medicamento_id: int,
    db: Session = Depends(get_db)
):
    medicamento = (
        db.query(Medicamento)
        .filter(Medicamento.id == medicamento_id)
        .first()
    )

    if not medicamento:
        raise HTTPException(
            status_code=404,
            detail="Medicamento não encontrado"
        )

    db.delete(medicamento)
    db.commit()

    return {
        "mensagem": "Medicamento excluído com sucesso"
    }