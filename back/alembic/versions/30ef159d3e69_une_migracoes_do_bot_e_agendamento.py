"""une migracoes do bot e agendamento

Revision ID: 30ef159d3e69
Revises: 0eea82bdc60d, e1e069be8730
Create Date: 2026-11-06 20:07:09.677087

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '30ef159d3e69'
down_revision: Union[str, Sequence[str], None] = ('0eea82bdc60d', 'e1e069be8730')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
