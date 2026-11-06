import os


def test_vincular_paciente_ao_discord(client, monkeypatch):
    monkeypatch.setenv("DISCORD_API_KEY", "chave-teste")

    cadastro = client.post(
        "/usuarios/",
        json={
            "nome": "Maria",
            "email": "maria.discord@example.com",
            "senha": "senha1234"
        }
    )
    assert cadastro.status_code == 201

    login = client.post(
        "/auth/login",
        data={
            "username": "maria.discord@example.com",
            "password": "senha1234"
        }
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    paciente = client.post(
        "/pacientes/",
        json={"nome": "Maria"},
        headers=headers
    )
    assert paciente.status_code == 201
    paciente_id = paciente.json()["id"]

    codigo = client.post(
        f"/lembretes/vincular/{paciente_id}/codigo",
        headers=headers
    )
    assert codigo.status_code == 200

    vinculo = client.post(
        "/lembretes/vincular",
        json={
            "codigo": codigo.json()["codigo"],
            "discord_user_id": "123456789",
            "discord_channel_id": "987654321"
        },
        headers={"X-BOT-API-KEY": "chave-teste"}
    )
    assert vinculo.status_code == 200

    reutilizacao = client.post(
        "/lembretes/vincular",
        json={
            "codigo": codigo.json()["codigo"],
            "discord_user_id": "123456789",
            "discord_channel_id": "987654321"
        },
        headers={"X-BOT-API-KEY": "chave-teste"}
    )
    assert reutilizacao.status_code == 404


def test_responder_lembrete_discord(client, db, monkeypatch):
    from datetime import datetime, date
    from zoneinfo import ZoneInfo

    from app.models.pacientes import Paciente
    from app.models.medicamentos import Medicamento
    from app.models.prescricoes import Prescricao
    from app.models.vinculos_discord import VinculoDiscord
    from app.models.doses_programadas import DoseProgramada
    from app.models.lembretes import Lembrete
    from app.models.registros_tomada import RegistroTomada

    monkeypatch.setenv("DISCORD_API_KEY", "chave-teste")

    client.post("/usuarios/", json={
        "nome": "Maria",
        "email": "maria.resposta@example.com",
        "senha": "senha1234"
    })

    login = client.post("/auth/login", data={
        "username": "maria.resposta@example.com",
        "password": "senha1234"
    })
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    paciente_resposta = client.post(
        "/pacientes/", json={"nome": "Maria"}, headers=headers
    )
    paciente_id = paciente_resposta.json()["id"]
    paciente = db.query(Paciente).filter_by(id=paciente_id).first()

    medicamento = Medicamento(
        nome="Medicamento teste",
        dosagem="500 mg",
        forma_farmaceutica="Comprimido"
    )
    db.add(medicamento)
    db.flush()

    prescricao = Prescricao(
        paciente_id=paciente.id,
        medicamento_id=medicamento.id,
        origem_informacao="manual",
        modo_agendamento="horarios_fixos",
        quantidade_por_dose=1,
        unidade_quantidade="comprimido",
        tipo_duracao="continuo",
        data_inicio=date.today(),
        status="ativo"
    )
    db.add(prescricao)
    db.flush()

    agendado = datetime.now(ZoneInfo("America/Sao_Paulo"))
    dose = DoseProgramada(
        prescricao_id=prescricao.id,
        agendado_para=agendado,
        status="pendente"
    )
    lembrete = Lembrete(
        prescricao_id=prescricao.id,
        agendado_para=agendado,
        status="enviado"
    )
    vinculo = VinculoDiscord(
        paciente_id=paciente.id,
        discord_user_id="123456789",
        discord_channel_id="987654321",
        vinculado_em=agendado
    )
    db.add_all([dose, lembrete, vinculo])
    db.commit()
    lembrete_id = lembrete.id

    bot_headers = {"X-BOT-API-KEY": "chave-teste"}

    indevida = client.post(
        f"/lembretes/{lembrete_id}/responder",
        json={"discord_user_id": "999999999", "resultado": "tomada"},
        headers=bot_headers
    )
    print("RESPOSTA:", indevida.status_code, indevida.text)
    print("PACIENTE:", paciente_id, "LEMBRETE:", lembrete_id)
    assert indevida.status_code == 403

    resposta = client.post(
        f"/lembretes/{lembrete_id}/responder",
        json={"discord_user_id": "123456789", "resultado": "tomada"},
        headers=bot_headers
    )
    assert resposta.status_code == 200
    assert resposta.json()["resultado"] == "tomada"

    duplicada = client.post(
        f"/lembretes/{lembrete_id}/responder",
        json={"discord_user_id": "123456789", "resultado": "tomada"},
        headers=bot_headers
    )
    assert duplicada.status_code == 409

    db.refresh(dose)
    db.refresh(lembrete)
    assert dose.status == "tomada"
    assert lembrete.status == "respondido"
    assert db.query(RegistroTomada).filter_by(
        dose_programada_id=dose.id
    ).count() == 1
