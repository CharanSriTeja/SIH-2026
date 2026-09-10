"""init

Revision ID: 6dd9248af749
Revises: 
Create Date: 2026-09-09 17:48:50.482668

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6dd9248af749'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('users',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('phone_number', sa.String(length=13), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=True, server_default='citizen'),
        sa.Column('preferred_language', sa.String(), nullable=True, server_default='en'),
        sa.Column('is_verified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone_number')
    )

    op.create_table('otp_verifications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('phone_number', sa.String(length=13), nullable=False),
        sa.Column('otp_code', sa.String(length=6), nullable=False),
        sa.Column('purpose', sa.String(), nullable=True, server_default='signup'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_index('ix_otp_phone_purpose_used', 'otp_verifications', ['phone_number', 'purpose', 'is_used'], unique=False)

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_otp_phone_purpose_used', table_name='otp_verifications')
    op.drop_table('otp_verifications')
    op.drop_table('users')
