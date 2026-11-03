
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models.medicamento import Medicamento
from app.routers import medicamento

# Cria as tabelas registradas nos modelos.
Base.metadata.create_all(bind=engine)

# Configuração da API.
app = FastAPI(
    title="FarmaLembra API",
    description="API de gerenciamento de medicamentos",
    version="0.1.0",
)

# Registra as rotas de medicamentos.
app.include_router(medicamento.router)


@app.get("/")
def inicio():
    return {
        "mensagem": "FarmaLembra API funcionando!"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/database")
def verificar_banco(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"database": "connected"}

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Não foi possível conectar ao banco de dados",
        )
