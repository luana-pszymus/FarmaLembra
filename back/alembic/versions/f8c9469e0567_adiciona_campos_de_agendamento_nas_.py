"""adiciona campos de agendamento nas prescricoes

Revision ID: f8c9469e0567
Revises: 959c9a61fb58
Create Date: 2026-11-05 18:32:01.714784

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8c9469e0567'
down_revision: Union[str, Sequence[str], None] = '959c9a61fb58'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Alterações já aplicadas pela migração do Discord."""
    pass


def downgrade() -> None:
    """Não desfaz alterações compartilhadas com outra migração."""
    pass
