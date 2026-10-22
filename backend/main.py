
import io

import qrcode
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import Base, engine, SessionLocal
import models
from schemas import BatchCreate, BatchResponse


# Create any missing database tables.
Base.metadata.create_all(bind=engine)


# Initialize the API.
app = FastAPI(
    title="DairyTrace API",
    description="Dairy batch traceability and recall management",
    version="1.0.0",
)


# Allow the local React frontend to access this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.104:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session dependency.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Home endpoint.
@app.get("/")
def home():
    return {
        "message": "Welcome to DairyTrace API",
        "status": "running",
    }


# Health check endpoint.
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Retrieve all batches from PostgreSQL.
@app.get("/api/batches", response_model=list[BatchResponse])
def list_batches(db: Session = Depends(get_db)):
    return (
        db.query(models.Batch)
        .order_by(models.Batch.id.desc())
        .all()
    )


# Create a new batch.
@app.post(
    "/api/batches",
    response_model=BatchResponse,
    status_code=201,
)
def create_batch(
    batch: BatchCreate,
    db: Session = Depends(get_db),
):
    # Validate the supplier if one was provided.
    if batch.supplier_id is not None:
        supplier = db.get(models.Supplier, batch.supplier_id)
        if supplier is None:
            raise HTTPException(
                status_code=400,
                detail="Supplier not found",
            )

    new_batch = models.Batch(**batch.model_dump())
    db.add(new_batch)

    try:
        db.commit()
        db.refresh(new_batch)
        return new_batch
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Batch code already exists or supplied data is invalid",
        )


# Generate a QR code for an existing batch.
@app.get("/api/batches/{batch_id}/qr")
def get_batch_qr(
    batch_id: int,
    db: Session = Depends(get_db),
):
    batch = db.get(models.Batch, batch_id)

    if batch is None:
        raise HTTPException(
            status_code=404,
            detail="Batch not found",
        )

    # The QR currently points to the frontend with the batch code.
    # A dedicated passport page will be implemented separately.
    passport_url = (
        f"http://192.168.1.104:5173/?batch={batch.batch_code}"
    )

    qr_image = qrcode.make(passport_url)
    image_buffer = io.BytesIO()
    qr_image.save(image_buffer, format="PNG")
    image_buffer.seek(0)

    return StreamingResponse(
        image_buffer,
        media_type="image/png",
        headers={
            "Content-Disposition": (
                f'inline; filename="{batch.batch_code}-qr.png"'
            )
        },
    )
