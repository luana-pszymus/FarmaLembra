def obter_token(client, email="maria@example.com"):
    client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": email,
            "senha": "senha1234"
        }
    )

    resposta = client.post(
        "/auth/login",
        data={
            "username": email,
            "password": "senha1234"
        }
    )

    return resposta.json()["access_token"]


def test_cadastrar_paciente(client):
    token = obter_token(client)

    resposta = client.post(
        "/pacientes/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "nome": "João",
            "telefone": "41999999999"
        }
    )

    assert resposta.status_code == 201
    assert resposta.json()["nome"] == "João"


def test_listar_pacientes(client):
    token = obter_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    client.post(
        "/pacientes/",
        headers=headers,
        json={"nome": "João"}
    )

    resposta = client.get("/pacientes/", headers=headers)

    assert resposta.status_code == 200
    assert len(resposta.json()) == 1
    assert resposta.json()[0]["nome"] == "João"


def test_atualizar_paciente(client):
    token = obter_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    cadastro = client.post(
        "/pacientes/",
        headers=headers,
        json={"nome": "João"}
    )

    paciente_id = cadastro.json()["id"]

    resposta = client.put(
        f"/pacientes/{paciente_id}",
        headers=headers,
        json={"nome": "João Silva"}
    )

    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "João Silva"


def test_impedir_acesso_paciente_de_outro_usuario(client):
    token1 = obter_token(client, "maria@example.com")
    token2 = obter_token(client, "ana@example.com")

    cadastro = client.post(
        "/pacientes/",
        headers={"Authorization": f"Bearer {token1}"},
        json={"nome": "Paciente da Maria"}
    )

    paciente_id = cadastro.json()["id"]

    resposta = client.get(
        f"/pacientes/{paciente_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )

    assert resposta.status_code == 404


def test_excluir_paciente(client):
    token = obter_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    cadastro = client.post(
        "/pacientes/",
        headers=headers,
        json={"nome": "João"}
    )

    paciente_id = cadastro.json()["id"]

    resposta = client.delete(
        f"/pacientes/{paciente_id}",
        headers=headers
    )

    assert resposta.status_code == 204
