from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import Query
from app.services.agendamento import gerar_agendamentos
from app.database import get_db
from app.models.prescricoes import Prescricao
from app.models.pacientes import Paciente
from app.models.medicamentos import Medicamento
from app.models.usuarios import Usuario

from app.schemas.prescricoes import (
    PrescricaoCreate,
    PrescricaoUpdate,
    PrescricaoResponse
)

from app.routers.auth import obter_usuario_atual


router = APIRouter(
    prefix="/prescricoes",
    tags=["Prescrições"]
)


# CADASTRAR PRESCRIÇÃO
@router.post("/", response_model=PrescricaoResponse,
             status_code=status.HTTP_201_CREATED)
def criar_prescricao(
    dados: PrescricaoCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    # Verifica se o paciente pertence ao usuário autenticado
    paciente = db.scalar(
        select(Paciente).where(
            Paciente.id == dados.paciente_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado."
        )

    # Verifica se o medicamento existe
    medicamento = db.get(Medicamento, dados.medicamento_id)

    if not medicamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado."
        )

    prescricao = Prescricao(**dados.model_dump())

    db.add(prescricao)
    db.commit()
    db.refresh(prescricao)

    return prescricao


# LISTAR PRESCRIÇÕES
@router.get("/", response_model=list[PrescricaoResponse])
def listar_prescricoes(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    prescricoes = db.scalars(
        select(Prescricao)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .where(Paciente.usuario_id == usuario.id)
    ).all()

    return prescricoes


# BUSCAR PRESCRIÇÃO POR ID
@router.get("/{prescricao_id}", response_model=PrescricaoResponse)
def buscar_prescricao(
    prescricao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    prescricao = db.scalar(
        select(Prescricao)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .where(
            Prescricao.id == prescricao_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not prescricao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada."
        )

    return prescricao


# EDITAR PRESCRIÇÃO
@router.put("/{prescricao_id}", response_model=PrescricaoResponse)
def atualizar_prescricao(
    prescricao_id: int,
    dados: PrescricaoUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    prescricao = db.scalar(
        select(Prescricao)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .where(
            Prescricao.id == prescricao_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not prescricao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada."
        )

    # Verifica se o novo paciente pertence ao usuário
    paciente = db.scalar(
        select(Paciente).where(
            Paciente.id == dados.paciente_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not paciente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado."
        )

    # Verifica se o medicamento existe
    medicamento = db.get(Medicamento, dados.medicamento_id)

    if not medicamento:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicamento não encontrado."
        )

    for campo, valor in dados.model_dump().items():
        setattr(prescricao, campo, valor)

    db.commit()
    db.refresh(prescricao)

    return prescricao


# EXCLUIR PRESCRIÇÃO
@router.delete("/{prescricao_id}",
               status_code=status.HTTP_204_NO_CONTENT)
def excluir_prescricao(
    prescricao_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    prescricao = db.scalar(
        select(Prescricao)
        .join(Paciente, Prescricao.paciente_id == Paciente.id)
        .where(
            Prescricao.id == prescricao_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not prescricao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescrição não encontrada."
        )

    db.delete(prescricao)
    db.commit()

@router.get("/{prescricao_id}/agendamentos")

def listar_agendamentos(
    prescricao_id: int,
    dias: int = Query(default=30, ge=1, le=90),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(obter_usuario_atual)
):
    prescricao = db.scalar(
        select(Prescricao)
        .join(
            Paciente,
            Prescricao.paciente_id == Paciente.id
        )
        .where(
            Prescricao.id == prescricao_id,
            Paciente.usuario_id == usuario.id
        )
    )

    if not prescricao:
        raise HTTPException(
            status_code=404,
            detail="Prescrição não encontrada."
        )

    if prescricao.status != "ativo":
        raise HTTPException(
            status_code=400,
            detail="Esta prescrição não está ativa."
        )

    return gerar_agendamentos(prescricao, dias)