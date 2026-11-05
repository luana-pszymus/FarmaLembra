
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pacientes import Paciente
from app.schemas.pacientes import (
    PacienteCreate,
    PacienteResponse,
    PacienteUpdate,
)
from app.routers.auth import obter_usuario_atual


router = APIRouter(
    prefix="/pacientes",
    tags=["Pacientes"],
)


# CADASTRAR PACIENTE
@router.post(
    "/",
    response_model=PacienteResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_paciente(
    dados: PacienteCreate,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual),
):
    paciente = Paciente(
        **dados.model_dump(),
        usuario_id=usuario.id,
    )

    db.add(paciente)
    db.commit()
    db.refresh(paciente)

    return paciente


# LISTAR PACIENTES DO USUÁRIO
@router.get(
    "/",
    response_model=list[PacienteResponse],
)
def listar_pacientes(
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual),
):
    pacientes = db.scalars(
        select(Paciente)
        .where(Paciente.usuario_id == usuario.id)
        .order_by(Paciente.nome)
    ).all()

    return pacientes


# BUSCAR PACIENTE POR ID
@router.get(
    "/{paciente_id}",
    response_model=PacienteResponse,
)
def buscar_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual),
):
    paciente = db.scalar(
        select(Paciente).where(
            Paciente.id == paciente_id,
            Paciente.usuario_id == usuario.id,
        )
    )

    if paciente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )

    return paciente


# ATUALIZAR PACIENTE
@router.put(
    "/{paciente_id}",
    response_model=PacienteResponse,
)
def atualizar_paciente(
    paciente_id: int,
    dados: PacienteUpdate,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual),
):
    paciente = db.scalar(
        select(Paciente).where(
            Paciente.id == paciente_id,
            Paciente.usuario_id == usuario.id,
        )
    )

    if paciente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )

    dados_atualizados = dados.model_dump(exclude_unset=True)

    for campo, valor in dados_atualizados.items():
        setattr(paciente, campo, valor)

    db.commit()
    db.refresh(paciente)

    return paciente


# EXCLUIR PACIENTE
@router.delete(
    "/{paciente_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def excluir_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(obter_usuario_atual),
):
    paciente = db.scalar(
        select(Paciente).where(
            Paciente.id == paciente_id,
            Paciente.usuario_id == usuario.id,
        )
    )

    if paciente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )

    db.delete(paciente)
    db.commit()
