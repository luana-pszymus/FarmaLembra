
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.automacao_doses import processar_doses_expiradas

from app.routers import medicamentos
from app.routers import pacientes
from app.routers import usuarios
from app.routers import prescricoes
from app.routers import auth
from app.routers import doses
from app.routers import relatorios
from app.routers import lembretes


logging.basicConfig(level=logging.INFO)

INTERVALO_VERIFICACAO_SEGUNDOS = 300


async def verificar_doses_periodicamente():
    """
    Executa a verificação automática a cada 5 minutos.
    """

    while True:
        try:
            quantidade = await asyncio.to_thread(
                processar_doses_expiradas
            )

            if quantidade:
                logging.info(
                    "Automação: %s dose(s) atualizada(s).",
                    quantidade
                )

        except Exception:
            logging.exception(
                "Falha na rotina automática de doses."
            )

        await asyncio.sleep(INTERVALO_VERIFICACAO_SEGUNDOS)


@asynccontextmanager
async def lifespan(app: FastAPI):
    tarefa = asyncio.create_task(
        verificar_doses_periodicamente()
    )

    logging.info("Automação de doses iniciada.")

    try:
        yield
    finally:
        tarefa.cancel()

        try:
            await tarefa
        except asyncio.CancelledError:
            pass

        logging.info("Automação de doses encerrada.")


app = FastAPI(
    title="FarmaLembra API",
    description="API de gerenciamento de medicamentos",
    version="0.1.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8100",
        "http://127.0.0.1:8100",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(medicamentos.router)
app.include_router(pacientes.router)
app.include_router(usuarios.router)
app.include_router(prescricoes.router)
app.include_router(auth.router)
app.include_router(doses.router)
app.include_router(relatorios.router)
app.include_router(lembretes.router)


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

        return {
            "database": "connected"
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Não foi possível conectar ao banco de dados",
        )
