
from fastapi import FastAPI

app = FastAPI(
    title="FarmaLembra API",
    description="API para gerenciamento de medicamentos e lembretes.",
    version="0.1.0",
)


@app.get("/")
def inicio():
    return {
        "mensagem": "FarmaLembra API funcionando!"
    }


@app.get("/health")
def verificar_saude():
    return {
        "status": "ok"
    }
