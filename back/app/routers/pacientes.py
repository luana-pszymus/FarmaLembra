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
):
    # Verifica se o e-mail já está cadastrado
    paciente_existente = db.scalar(
        select(Paciente).where(Paciente.email == dados.email)
    )

    if paciente_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um paciente cadastrado com este e-mail",
        )

    paciente = Paciente(**dados.model_dump())

    db.add(paciente)
    db.commit()
    db.refresh(paciente)

    return paciente


# LISTAR PACIENTES
@router.get(
    "/",
    response_model=list[PacienteResponse],
)
def listar_pacientes(
    db: Session = Depends(get_db),
):
    pacientes = db.scalars(
        select(Paciente).order_by(Paciente.nome)
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
):
    paciente = db.get(Paciente, paciente_id)

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
):
    paciente = db.get(Paciente, paciente_id)

    if paciente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )

    dados_atualizados = dados.model_dump(exclude_unset=True)

    if "email" in dados_atualizados:
        email_existente = db.scalar(
            select(Paciente).where(
                Paciente.email == dados_atualizados["email"],
                Paciente.id != paciente_id,
            )
        )

        if email_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este e-mail já está sendo utilizado por outro paciente",
            )

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
):
    paciente = db.get(Paciente, paciente_id)

    if paciente is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paciente não encontrado",
        )

    db.delete(paciente)
    db.commit()