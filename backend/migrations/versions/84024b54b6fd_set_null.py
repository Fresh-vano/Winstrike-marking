"""set null

Revision ID: 84024b54b6fd
Revises: 30e5789fa434
Create Date: 2024-11-09 08:29:04.917589

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '84024b54b6fd'
down_revision = '30e5789fa434'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('recognitions', schema=None) as batch_op:
        batch_op.alter_column('detail_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('recognitions', schema=None) as batch_op:
        batch_op.alter_column('detail_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    # ### end Alembic commands ###