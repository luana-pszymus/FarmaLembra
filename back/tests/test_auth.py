def test_cadastrar_usuario(client):
    resposta = client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": "maria@example.com",
            "senha": "senha1234"
        }
    )

    assert resposta.status_code == 201
    assert resposta.json()["nome"] == "Maria"
    assert resposta.json()["email"] == "maria@example.com"
    assert "senha_hash" not in resposta.json()


def test_impedir_email_duplicado(client):
    dados = {
        "nome": "Maria",
        "email": "maria@example.com",
        "senha": "senha1234"
    }

    primeira_resposta = client.post("/usuarios/", json=dados)
    segunda_resposta = client.post("/usuarios/", json=dados)

    assert primeira_resposta.status_code == 201
    assert segunda_resposta.status_code == 409


def test_login_com_senha_correta(client):
    client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": "maria@example.com",
            "senha": "senha1234"
        }
    )

    resposta = client.post(
        "/auth/login",
        data={
            "username": "maria@example.com",
            "password": "senha1234"
        }
    )

    assert resposta.status_code == 200
    assert "access_token" in resposta.json()
    assert resposta.json()["token_type"] == "bearer"


def test_login_com_senha_incorreta(client):
    client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": "maria@example.com",
            "senha": "senha1234"
        }
    )

    resposta = client.post(
        "/auth/login",
        data={
            "username": "maria@example.com",
            "password": "senha_errada"
        }
    )

    assert resposta.status_code == 401
