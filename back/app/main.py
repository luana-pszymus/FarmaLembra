
from fastapi import FastAPI

app = FastAPI(
    title="FarmaLembra API",
    description="API de gerenciamento de medicamentos",
    version="0.1.0",
)


@app.get("/")
def inicio():
    return {
        "mensagem": "FarmaLembra API funcionando!"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
