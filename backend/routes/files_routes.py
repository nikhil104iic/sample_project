from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from auth import get_current_user, require_admin
from database import get_db
from models import Document, User
from schemas import DocumentResponse

router = APIRouter(prefix="/api/files", tags=["Files"])
UPLOAD_DIRECTORY = Path(__file__).resolve().parent.parent / "uploads"
MAX_PDF_SIZE = 25 * 1024 * 1024


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Upload a PDF document. Only administrators may upload files."""
    original_name = Path(file.filename or "document.pdf").name
    if file.content_type != "application/pdf" or not original_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed")

    contents = await file.read(MAX_PDF_SIZE + 1)
    if not contents.startswith(b"%PDF"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is not a valid PDF")
    if len(contents) > MAX_PDF_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="PDF files must be 25 MB or smaller")

    stored_name = f"{uuid4().hex}.pdf"
    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    (UPLOAD_DIRECTORY / stored_name).write_bytes(contents)

    document = Document(
        original_name=original_name,
        stored_name=stored_name,
        content_type="application/pdf",
        file_size=len(contents),
        uploaded_by=admin.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("", response_model=list[DocumentResponse])
def list_pdfs(
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """List available PDF documents for authenticated users."""
    return db.query(Document).order_by(Document.created_at.desc(), Document.id.desc()).all()


@router.get("/{document_id}")
def view_pdf(
    document_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Stream a stored PDF to an authenticated user."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF not found")

    file_path = UPLOAD_DIRECTORY / document.stored_name
    if not file_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDF file is missing")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        content_disposition_type="inline",
        filename=document.original_name,
    )
