"""add undo redo target operation

Revision ID: add_undo_redo_target
Revises: YOUR_PREVIOUS_REVISION
"""

from alembic import op
import sqlalchemy as sa


revision = "add_undo_redo_target"
down_revision = "YOUR_PREVIOUS_REVISION"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "drawing_operations",
        sa.Column(
            "target_operation_id",
            sa.Uuid(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_drawing_operations_target_operation_id",
        "drawing_operations",
        ["target_operation_id"],
    )

    op.create_foreign_key(
        "fk_drawing_operations_target_operation_id",
        "drawing_operations",
        "drawing_operations",
        ["target_operation_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade():
    op.drop_constraint(
        "fk_drawing_operations_target_operation_id",
        "drawing_operations",
        type_="foreignkey",
    )

    op.drop_index(
        "ix_drawing_operations_target_operation_id",
        table_name="drawing_operations",
    )

    op.drop_column(
        "drawing_operations",
        "target_operation_id",
    )