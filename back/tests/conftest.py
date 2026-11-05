import os

# Configura variáveis exclusivas para o ambiente de testes.
# Elas são definidas antes de importar a aplicação.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET_KEY"] = "chave-exclusiva-para-testes-com-mais-de-32-caracteres"
os.environ["JWT_ALGORITHM"] = "HS256"

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

# Importa todos os modelos para registrar suas tabelas.
from app.models.usuarios import Usuario
from app.models.pacientes import Paciente
from app.models.medicamentos import Medicamento
from app.models.prescricoes import Prescricao
from app.models.vinculos_discord import VinculoDiscord
from app.models.mensagens_discord import MensagemDiscord
from app.models.lembretes import Lembrete


# Banco SQLite em memória, separado do banco da aplicação.
engine_testes = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

SessionTestes = sessionmaker(
    bind=engine_testes,
    autoflush=False,
    expire_on_commit=False,
)


@pytest.fixture
def db():
    # Cria as tabelas antes de cada teste.
    Base.metadata.create_all(bind=engine_testes)

    sessao = SessionTestes()

    yield sessao

    # Fecha a sessão e remove as tabelas depois do teste.
    sessao.close()
    Base.metadata.drop_all(bind=engine_testes)


@pytest.fixture
def client(db):
    # Substitui a conexão real pela sessão do banco de testes.
    def substituir_banco():
        yield db

    app.dependency_overrides[get_db] = substituir_banco

    with TestClient(app) as cliente:
        yield cliente

    # Remove a substituição depois do teste.
    app.dependency_overrides.clear()
