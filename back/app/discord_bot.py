import asyncio
import logging
import os

import aiohttp
import discord
from discord import app_commands
from discord.ext import commands, tasks


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("farmalembra.discord")

TOKEN = os.getenv("DISCORD_BOT_TOKEN")
API_URL = os.getenv("DISCORD_API_URL", "http://backend:8000").rstrip("/")
API_KEY = os.getenv("DISCORD_API_KEY")

HEADERS = {"X-BOT-API-KEY": API_KEY or ""}


class BotFarmaLembra(commands.Bot):
    async def setup_hook(self):
        self.session = aiohttp.ClientSession()
        self.add_dynamic_items(RespostaButton)
        await self.tree.sync()
        enviar_lembretes.start()

    async def close(self):
        enviar_lembretes.cancel()
        session = getattr(self, "session", None)
        if session and not session.closed:
            await session.close()
        await super().close()


bot = BotFarmaLembra(
    command_prefix="!",
    intents=discord.Intents.default()
)


class RespostaButton(
    discord.ui.DynamicItem[discord.ui.Button],
    template=r"responder:(?P<lembrete_id>[0-9]+):(?P<resultado>tomada|nao_tomada)"
):
    def __init__(self, lembrete_id: int, resultado: str):
        self.lembrete_id = lembrete_id
        self.resultado = resultado

        label = "Tomei" if resultado == "tomada" else "Não tomei"
        style = (
            discord.ButtonStyle.success
            if resultado == "tomada"
            else discord.ButtonStyle.danger
        )

        super().__init__(
            discord.ui.Button(
                label=label,
                style=style,
                custom_id=f"responder:{lembrete_id}:{resultado}"
            )
        )

    @classmethod
    async def from_custom_id(cls, interaction, item, match):
        return cls(
            int(match["lembrete_id"]),
            match["resultado"]
        )

    async def callback(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        async with bot.session.post(
            f"{API_URL}/lembretes/{self.lembrete_id}/responder",
            headers=HEADERS,
            json={
                "discord_user_id": str(interaction.user.id),
                "resultado": self.resultado
            }
        ) as response:
            if response.status == 200:
                mensagem = (
                    "Resposta registrada com sucesso!"
                    if self.resultado == "tomada"
                    else "Registro de não tomada realizado."
                )
                await interaction.followup.send(mensagem, ephemeral=True)
            else:
                dados = await response.json()
                await interaction.followup.send(
                    dados.get("detail", "Não foi possível registrar a resposta."),
                    ephemeral=True
                )


@bot.tree.command(
    name="vincular",
    description="Vincula seu Discord ao paciente usando o código do FarmaLembra."
)
@app_commands.describe(codigo="Código gerado no FarmaLembra")
async def vincular(interaction: discord.Interaction, codigo: str):
    await interaction.response.defer(ephemeral=True)

    async with bot.session.post(
        f"{API_URL}/lembretes/vincular",
        headers=HEADERS,
        json={
            "codigo": codigo,
            "discord_user_id": str(interaction.user.id),
            "discord_channel_id": str(interaction.channel_id)
        }
    ) as response:
        dados = await response.json()

        await interaction.followup.send(
            dados.get("mensagem", dados.get("detail", "Erro ao vincular conta.")),
            ephemeral=True
        )


@tasks.loop(seconds=60)
async def enviar_lembretes():
    try:
        async with bot.session.get(
            f"{API_URL}/lembretes/pendentes",
            headers=HEADERS
        ) as response:
            if response.status != 200:
                logger.error("Erro ao consultar lembretes: %s", response.status)
                return

            lembretes = await response.json()

        for lembrete in lembretes:
            try:
                usuario = await bot.fetch_user(
                    int(lembrete["discord_user_id"])
                )

                view = discord.ui.View(timeout=None)
                view.add_item(RespostaButton(
                    lembrete["lembrete_id"], "tomada"
                ))
                view.add_item(RespostaButton(
                    lembrete["lembrete_id"], "nao_tomada"
                ))

                quantidade = lembrete["quantidade_por_dose"]
                unidade = lembrete.get("unidade_quantidade") or ""

                mensagem = (
                    f"Olá, {lembrete['paciente_nome']}! Está na hora do seu medicamento.\n\n"
                    f"**Medicamento:** {lembrete['medicamento_nome']}\n"
                    f"**Dosagem:** {lembrete.get('medicamento_dosagem') or 'Não informada'}\n"
                    f"**Quantidade:** {quantidade:g} {unidade}\n"
                )

                if lembrete.get("orientacoes"):
                    mensagem += f"**Orientações:** {lembrete['orientacoes']}\n"

                mensagem += "\nConfirme uma das opções abaixo:"

                mensagem_enviada = await usuario.send(
                    mensagem,
                    view=view
                )

                async with bot.session.patch(
                    f"{API_URL}/lembretes/{lembrete['lembrete_id']}/enviado",
                    headers=HEADERS,
                    json={"discord_message_id": str(mensagem_enviada.id)}
                ) as resposta:
                    if resposta.status != 200:
                        logger.error(
                            "Não foi possível marcar lembrete %s como enviado: %s",
                            lembrete["lembrete_id"],
                            resposta.status
                        )

            except Exception:
                logger.exception(
                    "Erro ao enviar lembrete %s",
                    lembrete.get("lembrete_id")
                )

    except Exception:
        logger.exception("Erro ao consultar lembretes pendentes")


@enviar_lembretes.before_loop
async def antes_de_enviar_lembretes():
    await bot.wait_until_ready()


if __name__ == "__main__":
    if not TOKEN or not API_KEY:
        raise RuntimeError(
            "Configure DISCORD_BOT_TOKEN e DISCORD_API_KEY no .env."
        )

    bot.run(TOKEN)
