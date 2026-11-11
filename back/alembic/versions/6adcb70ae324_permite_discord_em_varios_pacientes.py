
"""permite discord em varios pacientes

Revision ID: 6adcb70ae324
Revises: 0737c2333f27
Create Date: 2026-11-11 13:38:56.545270

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6adcb70ae324'
down_revision: Union[str, Sequence[str], None] = '0737c2333f27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Permite que uma conta Discord seja vinculada a vários pacientes."""

    op.drop_constraint(
        "vinculos_discord_discord_user_id_key",
        "vinculos_discord",
        type_="unique"
    )


def downgrade() -> None:
    """Restaura a restrição de conta Discord única."""

    op.create_unique_constraint(
        "vinculos_discord_discord_user_id_key",
        "vinculos_discord",
        ["discord_user_id"]
    )
