
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.sql import func

from database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    contact_email = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_code = Column(String(80), unique=True, nullable=False, index=True)
    product_name = Column(String(100), nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    production_date = Column(Date, nullable=True)
    status = Column(String(40), nullable=False, default="created")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class BatchRelationship(Base):
    __tablename__ = "batch_relationships"
    __table_args__ = (
        UniqueConstraint(
            "parent_batch_id",
            "child_batch_id",
            name="uq_batch_relationship",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    parent_batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    child_batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    relationship_type = Column(String(50), nullable=False, default="processed_into")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QualityTest(Base):
    __tablename__ = "quality_tests"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    test_name = Column(String(150), nullable=False)
    test_date = Column(Date, nullable=True)
    testing_organization = Column(String(200), nullable=True)
    result = Column(String(100), nullable=False)
    evidence_status = Column(String(40), nullable=False, default="supplier_entered")
    report_reference = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    destination = Column(String(255), nullable=False)
    shipped_date = Column(Date, nullable=True)
    quantity = Column(String(100), nullable=True)
    status = Column(String(40), nullable=False, default="recorded")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Recall(Base):
    __tablename__ = "recalls"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(40), nullable=False, default="suspected")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
