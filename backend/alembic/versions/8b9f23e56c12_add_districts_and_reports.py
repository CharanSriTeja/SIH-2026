"""add_districts_and_reports

Revision ID: 8b9f23e56c12
Revises: 7a8e12f45b90
Create Date: 2026-09-10 11:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8b9f23e56c12'
down_revision: Union[str, Sequence[str], None] = '7a8e12f45b90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create districts table
    op.create_table(
        'districts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('state_name', sa.String(), nullable=False),
        sa.Column('district_name', sa.String(), nullable=False),
        sa.Column('centroid_lat', sa.Float(), nullable=True),
        sa.Column('centroid_lon', sa.Float(), nullable=True),
        sa.UniqueConstraint('state_name', 'district_name', name='uq_state_district')
    )
    op.create_index('ix_districts_state', 'districts', ['state_name'])

    # 2. Add district_id to users
    op.add_column('users', sa.Column('district_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        'fk_users_district_id_districts',
        'users',
        'districts',
        ['district_id'],
        ['id'],
        ondelete='SET NULL'
    )

    # 3. Create citizen_reports table
    op.create_table(
        'citizen_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('district_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('hazard_type', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('photo_path', sa.String(), nullable=False),
        sa.Column('status', sa.String(), server_default='pending', nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='fk_citizen_reports_user_id', ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['district_id'], ['districts.id'], name='fk_citizen_reports_district_id', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], name='fk_citizen_reports_reviewed_by', ondelete='SET NULL')
    )
    op.create_index('ix_citizen_reports_district_status', 'citizen_reports', ['district_id', 'status'])
    op.create_index('ix_citizen_reports_user', 'citizen_reports', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_citizen_reports_user', table_name='citizen_reports')
    op.drop_index('ix_citizen_reports_district_status', table_name='citizen_reports')
    op.drop_table('citizen_reports')

    op.drop_constraint('fk_users_district_id_districts', 'users', type_='foreignkey')
    op.drop_column('users', 'district_id')

    op.drop_index('ix_districts_state', table_name='districts')
    op.drop_table('districts')
