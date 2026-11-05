def test_inicio_api(client):
    resposta = client.get("/")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "mensagem": "FarmaLembra API funcionando!"
    }


def test_health_api(client):
    resposta = client.get("/health")

    assert resposta.status_code == 200
    assert resposta.json() == {"status": "ok"}


def test_health_database(client):
    resposta = client.get("/health/database")

    assert resposta.status_code == 200
    assert resposta.json() == {"database": "connected"}
