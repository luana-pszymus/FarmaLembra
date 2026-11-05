def test_fluxo_completo_do_farmalembra(client):
    # 1. Cadastra o usuário.
    cadastro = client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": "maria@example.com",
            "senha": "senha1234"
        }
    )

    assert cadastro.status_code == 201

    # 2. Realiza login.
    login = client.post(
        "/auth/login",
        data={
            "username": "maria@example.com",
            "password": "senha1234"
        }
    )

    assert login.status_code == 200

    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Cadastra um paciente.
    paciente = client.post(
        "/pacientes/",
        headers=headers,
        json={"nome": "João"}
    )

    assert paciente.status_code == 201
    paciente_id = paciente.json()["id"]

    # 4. Cadastra um medicamento.
    medicamento = client.post(
        "/medicamentos/",
        json={
            "nome": "Paracetamol",
            "dosagem": "500 mg",
            "forma_farmaceutica": "Comprimido"
        }
    )

    assert medicamento.status_code == 201
    medicamento_id = medicamento.json()["id"]

    # 5. Cria uma prescrição.
    prescricao = client.post(
        "/prescricoes/",
        headers=headers,
        json={
            "paciente_id": paciente_id,
            "medicamento_id": medicamento_id,
            "origem_informacao": "manual",
            "modo_agendamento": "intervalo",
            "intervalo_horas": 8,
            "quantidade_por_dose": 1,
            "unidade_quantidade": "comprimido",
            "tipo_duracao": "temporario",
            "data_inicio": "2026-11-05",
            "data_fim": "2026-11-10",
            "orientacoes": "Tomar após as refeições"
        }
    )

    assert prescricao.status_code == 201
    prescricao_id = prescricao.json()["id"]

    # 6. Consulta a prescrição criada.
    consulta = client.get(
        f"/prescricoes/{prescricao_id}",
        headers=headers
    )

    assert consulta.status_code == 200
    assert consulta.json()["id"] == prescricao_id
    assert consulta.json()["paciente_id"] == paciente_id
    assert consulta.json()["medicamento_id"] == medicamento_id
