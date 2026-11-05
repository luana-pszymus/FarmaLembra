def cadastrar_medicamento(client):
    return client.post(
        "/medicamentos/",
        json={
            "nome": "Paracetamol",
            "dosagem": "500 mg",
            "forma_farmaceutica": "Comprimido",
            "descricao": "Analgésico"
        }
    )


def test_cadastrar_medicamento(client):
    resposta = cadastrar_medicamento(client)

    assert resposta.status_code == 201
    assert resposta.json()["nome"] == "Paracetamol"


def test_listar_medicamentos(client):
    cadastrar_medicamento(client)

    resposta = client.get("/medicamentos/")

    assert resposta.status_code == 200
    assert len(resposta.json()) == 1


def test_atualizar_medicamento(client):
    cadastro = cadastrar_medicamento(client)
    medicamento_id = cadastro.json()["id"]

    resposta = client.put(
        f"/medicamentos/{medicamento_id}",
        json={"nome": "Paracetamol atualizado"}
    )

    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "Paracetamol atualizado"


def test_excluir_medicamento(client):
    cadastro = cadastrar_medicamento(client)
    medicamento_id = cadastro.json()["id"]

    resposta = client.delete(f"/medicamentos/{medicamento_id}")

    assert resposta.status_code == 204
