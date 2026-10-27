
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.routers.medicamento import router as medicamento_router
from app.models.medicamento import Medicamento




app = FastAPI(
    title="FarmaLembra API",
    description="API de gerenciamento de medicamentos",
    version="0.1.0",
)


app.include_router(medicamento_router)


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