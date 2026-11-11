
"""ajusta mensagens discord interacoes

Revision ID: 0737c2333f27
Revises: 925599719609
Create Date: 2026-11-10 21:55:09.777240
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '0737c2333f27'
down_revision: Union[str, Sequence[str], None] = '925599719609'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'mensagens_discord',
        sa.Column('discord_interaction_id', sa.String(length=30), nullable=True)
    )

    op.drop_constraint(
        'mensagens_discord_discord_message_id_key',
        'mensagens_discord',
        type_='unique'
    )

    op.create_unique_constraint(
        'uq_mensagens_discord_interaction_id',
        'mensagens_discord',
        ['discord_interaction_id']
    )


def downgrade() -> None:
    op.drop_constraint(
        'uq_mensagens_discord_interaction_id',
        'mensagens_discord',
        type_='unique'
    )

    op.create_unique_constraint(
        'mensagens_discord_discord_message_id_key',
        'mensagens_discord',
        ['discord_message_id']
    )

    op.drop_column(
        'mensagens_discord',
        'discord_interaction_id'
    )
