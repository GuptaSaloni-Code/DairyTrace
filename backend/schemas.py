
from datetime import date
from pydantic import BaseModel, ConfigDict


class BatchCreate(BaseModel):
    batch_code: str
    product_name: str
    supplier_id: int | None = None
    production_date: date | None = None
    status: str = "created"
    notes: str | None = None


class BatchResponse(BatchCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
