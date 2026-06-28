from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List
from bson import ObjectId
from models import Project, Certificate, Experience, Education, AboutInfo
from auth import get_current_admin
from database import get_db
import shutil
import os
import uuid
import smtplib
from email.message import EmailMessage
from models import Project, Certificate, Experience, Education, AboutInfo, ContactMessage

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# Helper for uploads
UPLOAD_DIR = "uploads"
os.makedirs(f"{UPLOAD_DIR}/images", exist_ok=True)
os.makedirs(f"{UPLOAD_DIR}/certificates", exist_ok=True)

@router.post("/upload/image", dependencies=[Depends(get_current_admin)])
async def upload_image(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_location = f"{UPLOAD_DIR}/images/{filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/static/images/{filename}"}

@router.post("/upload/pdf", dependencies=[Depends(get_current_admin)])
async def upload_pdf(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_location = f"{UPLOAD_DIR}/certificates/{filename}"
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"/static/certificates/{filename}"}

# Projects Endpoints
@router.get("/projects")
async def get_projects():
    db = get_db()
    projects = await db["projects"].find().to_list(100)
    return [serialize_doc(p) for p in projects]

@router.post("/projects", dependencies=[Depends(get_current_admin)])
async def add_project(project: Project):
    db = get_db()
    result = await db["projects"].insert_one(project.dict())
    return {"id": str(result.inserted_id)}

@router.put("/projects/{id}", dependencies=[Depends(get_current_admin)])
async def update_project(id: str, project: Project):
    db = get_db()
    result = await db["projects"].update_one(
        {"_id": ObjectId(id)},
        {"$set": project.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"msg": "Project updated"}

@router.delete("/projects/{id}", dependencies=[Depends(get_current_admin)])
async def delete_project(id: str):
    db = get_db()
    result = await db["projects"].delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"msg": "Deleted"}

# Certificates Endpoints
@router.get("/certificates")
async def get_certificates():
    db = get_db()
    certificates = await db["certificates"].find().to_list(100)
    return [serialize_doc(c) for c in certificates]

@router.post("/certificates", dependencies=[Depends(get_current_admin)])
async def add_certificate(certificate: Certificate):
    db = get_db()
    result = await db["certificates"].insert_one(certificate.dict())
    return {"id": str(result.inserted_id)}

@router.delete("/certificates/{id}", dependencies=[Depends(get_current_admin)])
async def delete_certificate(id: str):
    db = get_db()
    result = await db["certificates"].delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"msg": "Deleted"}

# Experience Endpoints
@router.get("/experience")
async def get_experience():
    db = get_db()
    experience = await db["experience"].find().to_list(100)
    return [serialize_doc(e) for e in experience]

@router.post("/experience", dependencies=[Depends(get_current_admin)])
async def add_experience(exp: Experience):
    db = get_db()
    result = await db["experience"].insert_one(exp.dict())
    return {"id": str(result.inserted_id)}

# Education Endpoints
@router.get("/education")
async def get_education():
    db = get_db()
    education = await db["education"].find().to_list(100)
    return [serialize_doc(e) for e in education]

@router.post("/education", dependencies=[Depends(get_current_admin)])
async def add_education(edu: Education):
    db = get_db()
    result = await db["education"].insert_one(edu.dict())
    return {"id": str(result.inserted_id)}

# About Endpoints
@router.get("/about")
async def get_about():
    db = get_db()
    about = await db["about"].find_one()
    return serialize_doc(about) if about else {}

@router.post("/about", dependencies=[Depends(get_current_admin)])
async def update_about(about: AboutInfo):
    db = get_db()
    await db["about"].replace_one({}, about.dict(), upsert=True)
    return {"msg": "About info updated"}

# Contact Endpoint
@router.post("/contact")
async def send_contact_email(msg: ContactMessage):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_email or not smtp_password:
        print(f"Warning: SMTP credentials not set. Simulated email from {msg.name} ({msg.email}): {msg.message}")
        return {"msg": "Message sent (simulated)"}
        
    try:
        email = EmailMessage()
        email.set_content(f"Name: {msg.name}\nEmail: {msg.email}\n\nMessage:\n{msg.message}")
        email['Subject'] = f"New Portfolio Contact from {msg.name}"
        email['From'] = smtp_email
        email['To'] = "techshivam02@gmail.com"
        
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(smtp_email, smtp_password)
        server.send_message(email)
        server.quit()
        return {"msg": "Message sent successfully"}
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send email. Please try again later.")
