"""fix null

Revision ID: df77b1a540be
Revises: 35b55476fd26
Create Date: 2024-11-09 21:29:05.393151

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'df77b1a540be'
down_revision = '35b55476fd26'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('correctResult', schema=None) as batch_op:
        batch_op.alter_column('predicted_text',
               existing_type=sa.VARCHAR(length=255),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('correctResult', schema=None) as batch_op:
        batch_op.alter_column('predicted_text',
               existing_type=sa.VARCHAR(length=255),
               nullable=False)

    # ### end Alembic commands ###
