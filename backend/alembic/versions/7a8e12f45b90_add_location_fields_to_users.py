"""add_location_fields_to_users

Revision ID: 7a8e12f45b90
Revises: 6dd9248af749
Create Date: 2026-09-09 20:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a8e12f45b90'
down_revision: Union[str, Sequence[str], None] = '6dd9248af749'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('last_latitude', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('last_longitude', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('address_label', sa.String(), nullable=True))
    op.add_column('users', sa.Column('location_updated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'location_updated_at')
    op.drop_column('users', 'address_label')
    op.drop_column('users', 'last_longitude')
    op.drop_column('users', 'last_latitude')
