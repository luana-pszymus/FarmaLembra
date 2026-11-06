def preparar_dados(client):
    # Cria usuário e realiza login.
    client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": "maria@example.com",
            "senha": "senha1234"
        }
    )

    login = client.post(
        "/auth/login",
        data={
            "username": "maria@example.com",
            "password": "senha1234"
        }
    )

    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Cadastra paciente.
    paciente = client.post(
        "/pacientes/",
        headers=headers,
        json={"nome": "João"}
    )

    # Cadastra medicamento.
    medicamento = client.post(
        "/medicamentos/",
        json={
            "nome": "Paracetamol",
            "dosagem": "500 mg",
            "forma_farmaceutica": "Comprimido"
        }
    )

    return headers, paciente.json()["id"], medicamento.json()["id"]


def dados_prescricao(paciente_id, medicamento_id):
    return {
        "paciente_id": paciente_id,
        "medicamento_id": medicamento_id,
        "origem_informacao": "manual",
        "modo_agendamento": "intervalo",
        "intervalo_horas": 8,
            "horario_inicial": "08:00",
        "quantidade_por_dose": 1,
        "unidade_quantidade": "comprimido",
        "tipo_duracao": "temporario",
        "data_inicio": "2026-11-05",
        "data_fim": "2026-11-10",
        "orientacoes": "Tomar após as refeições"
    }


def test_cadastrar_prescricao(client):
    headers, paciente_id, medicamento_id = preparar_dados(client)

    resposta = client.post(
        "/prescricoes/",
        headers=headers,
        json=dados_prescricao(paciente_id, medicamento_id)
    )

    assert resposta.status_code == 201
    assert resposta.json()["paciente_id"] == paciente_id
    assert resposta.json()["medicamento_id"] == medicamento_id


def test_listar_prescricoes(client):
    headers, paciente_id, medicamento_id = preparar_dados(client)

    client.post(
        "/prescricoes/",
        headers=headers,
        json=dados_prescricao(paciente_id, medicamento_id)
    )

    resposta = client.get("/prescricoes/", headers=headers)

    assert resposta.status_code == 200
    assert len(resposta.json()) == 1


def test_impedir_prescricao_sem_autenticacao(client):
    resposta = client.get("/prescricoes/")

    assert resposta.status_code == 401


def test_impedir_prescricao_com_paciente_inexistente(client):
    headers, _, medicamento_id = preparar_dados(client)

    resposta = client.post(
        "/prescricoes/",
        headers=headers,
        json=dados_prescricao(9999, medicamento_id)
    )

    assert resposta.status_code == 404


def test_validar_intervalo_da_prescricao(client):
    headers, paciente_id, medicamento_id = preparar_dados(client)

    dados = dados_prescricao(paciente_id, medicamento_id)
    dados["intervalo_horas"] = None

    resposta = client.post(
        "/prescricoes/",
        headers=headers,
        json=dados
    )

    assert resposta.status_code == 422
