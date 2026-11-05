"""adiciona usuarios e vincula pacientes

Revision ID: a2b7b44aa6e6
Revises: 465d03b68139
Create Date: 2026-11-04 20:27:56.657696

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# Identificadores da migration
revision: str = 'a2b7b44aa6e6'
down_revision: Union[str, Sequence[str], None] = '465d03b68139'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Cria usuarios e vincula pacientes."""

    # Cria a tabela de usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nome', sa.String(length=150), nullable=False),
        sa.Column('email', sa.String(length=150), nullable=False),
        sa.Column('senha_hash', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )

    op.create_index(
        op.f('ix_usuarios_id'),
        'usuarios',
        ['id'],
        unique=False
    )

    # Adiciona o relacionamento entre pacientes e usuarios
    op.add_column(
        'pacientes',
        sa.Column('usuario_id', sa.Integer(), nullable=False)
    )

    # Remove a restrição de email dos pacientes
    op.drop_constraint(
        'pacientes_email_key',
        'pacientes',
        type_='unique'
    )

    # Cria a chave estrangeira
    op.create_foreign_key(
        'fk_pacientes_usuario_id_usuarios',
        'pacientes',
        'usuarios',
        ['usuario_id'],
        ['id']
    )

    # Remove o email da tabela pacientes
    op.drop_column('pacientes', 'email')


def downgrade() -> None:
    """Reverte as alterações."""

    # Recria a coluna email como opcional
    op.add_column(
        'pacientes',
        sa.Column('email', sa.String(length=150), nullable=True)
    )

    # Remove a chave estrangeira
    op.drop_constraint(
        'fk_pacientes_usuario_id_usuarios',
        'pacientes',
        type_='foreignkey'
    )

    # Restaura a restrição de email único
    op.create_unique_constraint(
        'pacientes_email_key',
        'pacientes',
        ['email']
    )

    # Remove o relacionamento com usuarios
    op.drop_column('pacientes', 'usuario_id')

    # Remove o índice de usuarios
    op.drop_index(
        op.f('ix_usuarios_id'),
        table_name='usuarios'
    )

    # Remove a tabela usuarios
    op.drop_table('usuarios')