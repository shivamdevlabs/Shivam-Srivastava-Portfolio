from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
from bson import ObjectId
import os
import smtplib
from email.message import EmailMessage
import time
import cloudinary
import cloudinary.uploader
import cloudinary.api
import cloudinary.utils

try:
    from auth import get_current_admin
    from database import get_db
    from models import (
        Project,
        Certificate,
        Experience,
        Education,
        AboutInfo,
        ContactMessage,
        GraphicDesign,
        Skill,
    )
except ImportError:
    from backend.auth import get_current_admin
    from backend.database import get_db
    from backend.models import (
        Project,
        Certificate,
        Experience,
        Education,
        AboutInfo,
        ContactMessage,
        GraphicDesign,
        Skill,
    )

from pydantic import BaseModel
from pymongo import UpdateOne

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


class ReorderRequest(BaseModel):
    ids: List[str]


@router.put("/{section}/reorder", dependencies=[Depends(get_current_admin)])
@router.put("/reorder/{section}", dependencies=[Depends(get_current_admin)])
async def reorder_items(section: str, payload: ReorderRequest):
    collection_map = {
        "experience": "experience",
        "projects": "projects",
        "certificates": "certificates",
        "graphic-designs": "graphic_designs",
        "skills": "skills",
        "education": "education",
    }
    col_name = collection_map.get(section)
    if not col_name:
        raise HTTPException(status_code=400, detail=f"Invalid section: {section}")

    db = get_db()
    operations = [
        UpdateOne({"_id": ObjectId(item_id)}, {"$set": {"order": idx}})
        for idx, item_id in enumerate(payload.ids)
        if ObjectId.is_valid(item_id)
    ]
    if operations:
        await db[col_name].bulk_write(operations)
    return {"msg": f"{section.capitalize()} order updated successfully"}


# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


# Helper for uploads
UPLOAD_DIR = "uploads"
try:
    os.makedirs(f"{UPLOAD_DIR}/images", exist_ok=True)
    os.makedirs(f"{UPLOAD_DIR}/certificates", exist_ok=True)
    os.makedirs(f"{UPLOAD_DIR}/designs", exist_ok=True)
    os.makedirs(f"{UPLOAD_DIR}/resume", exist_ok=True)
except OSError:
    pass  # Vercel serverless environment is read-only, uploads should use cloud storage


@router.post("/upload/image", dependencies=[Depends(get_current_admin)])
async def upload_image(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(file.file, folder="portfolio/images")
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/pdf", dependencies=[Depends(get_current_admin)])
async def upload_pdf(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(
            file.file, folder="portfolio/certificates", resource_type="image", format="pdf"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/resume", dependencies=[Depends(get_current_admin)])
async def upload_resume(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(
            file.file, folder="portfolio/resume", resource_type="image", format="pdf"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload/design", dependencies=[Depends(get_current_admin)])
async def upload_design(file: UploadFile = File(...)):
    try:
        content_type = file.content_type or ""
        media_type = "video" if content_type.startswith("video/") else "image"

        resource_type = "video" if media_type == "video" else "image"
        result = cloudinary.uploader.upload(
            file.file, folder="portfolio/designs", resource_type=resource_type
        )
        return {"url": result.get("secure_url"), "media_type": media_type}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/upload/signature", dependencies=[Depends(get_current_admin)])
async def get_upload_signature(folder: str = "portfolio/designs"):
    try:
        timestamp = int(time.time())
        signature = cloudinary.utils.api_sign_request(
            {"folder": folder, "timestamp": timestamp},
            cloudinary.config().api_secret
        )
        return {
            "signature": signature,
            "timestamp": timestamp,
            "api_key": cloudinary.config().api_key,
            "cloud_name": cloudinary.config().cloud_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Projects Endpoints
@router.get("/projects")
async def get_projects():
    db = get_db()
    projects = await db["projects"].find().sort([("order", 1), ("_id", 1)]).to_list(100)
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
        {"_id": ObjectId(id)}, {"$set": project.dict()}
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
    certificates = await db["certificates"].find().sort([("order", 1), ("_id", 1)]).to_list(100)
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


@router.put("/certificates/{id}", dependencies=[Depends(get_current_admin)])
async def update_certificate(id: str, certificate: Certificate):
    db = get_db()
    result = await db["certificates"].update_one(
        {"_id": ObjectId(id)}, {"$set": certificate.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return {"msg": "Updated"}


# Experience Endpoints
@router.get("/experience")
async def get_experience():
    db = get_db()
    experience = await db["experience"].find().sort([("order", 1), ("_id", 1)]).to_list(100)
    return [serialize_doc(e) for e in experience]


@router.post("/experience", dependencies=[Depends(get_current_admin)])
async def add_experience(exp: Experience):
    db = get_db()
    result = await db["experience"].insert_one(exp.dict())
    return {"id": str(result.inserted_id)}


@router.put("/experience/{id}", dependencies=[Depends(get_current_admin)])
async def update_experience(id: str, exp: Experience):
    db = get_db()
    result = await db["experience"].update_one(
        {"_id": ObjectId(id)}, {"$set": exp.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"msg": "Experience updated"}


@router.delete("/experience/{id}", dependencies=[Depends(get_current_admin)])
async def delete_experience(id: str):
    db = get_db()
    result = await db["experience"].delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Experience not found")
    return {"msg": "Experience deleted"}


# Education Endpoints
@router.get("/education")
async def get_education():
    db = get_db()
    education = await db["education"].find().sort([("order", 1), ("_id", 1)]).to_list(100)
    return [serialize_doc(e) for e in education]


@router.post("/education", dependencies=[Depends(get_current_admin)])
async def add_education(edu: Education):
    db = get_db()
    result = await db["education"].insert_one(edu.dict())
    return {"id": str(result.inserted_id)}


@router.put("/education/{id}", dependencies=[Depends(get_current_admin)])
async def update_education(id: str, edu: Education):
    db = get_db()
    result = await db["education"].update_one(
        {"_id": ObjectId(id)}, {"$set": edu.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Education not found")
    return {"msg": "Education updated"}


@router.delete("/education/{id}", dependencies=[Depends(get_current_admin)])
async def delete_education(id: str):
    db = get_db()
    result = await db["education"].delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Education not found")
    return {"msg": "Education deleted"}


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
        print(
            f"Warning: SMTP credentials not set. Simulated email from {msg.name} ({msg.email}): {msg.message}"
        )
        return {"msg": "Message sent (simulated)"}

    try:
        email = EmailMessage()
        email.set_content(
            f"Name: {msg.name}\nEmail: {msg.email}\n\nMessage:\n{msg.message}"
        )
        email["Subject"] = f"New Portfolio Contact from {msg.name}"
        email["From"] = smtp_email
        email["To"] = "techshivam02@gmail.com"

        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(smtp_email, smtp_password)
        server.send_message(email)
        server.quit()
        return {"msg": "Message sent successfully"}
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to send email. Please try again later."
        )


# Graphic Design Endpoints


@router.get("/graphic-designs")
async def get_graphic_designs():
    db = get_db()
    designs = await db["graphic_designs"].find().sort([("order", 1), ("created_at", -1)]).to_list(100)
    return [serialize_doc(d) for d in designs]


@router.post("/graphic-designs", dependencies=[Depends(get_current_admin)])
async def create_graphic_design(design: GraphicDesign):
    db = get_db()
    new_design = await db["graphic_designs"].insert_one(design.dict())
    created_design = await db["graphic_designs"].find_one(
        {"_id": new_design.inserted_id}
    )
    return serialize_doc(created_design)


@router.put("/graphic-designs/{design_id}", dependencies=[Depends(get_current_admin)])
async def update_graphic_design(design_id: str, design: GraphicDesign):
    db = get_db()
    updated_design = await db["graphic_designs"].find_one_and_update(
        {"_id": ObjectId(design_id)}, {"$set": design.dict()}, return_document=True
    )
    if updated_design:
        return serialize_doc(updated_design)
    raise HTTPException(status_code=404, detail="Graphic design not found")


@router.delete(
    "/graphic-designs/{design_id}", dependencies=[Depends(get_current_admin)]
)
async def delete_graphic_design(design_id: str):
    db = get_db()
    delete_result = await db["graphic_designs"].delete_one({"_id": ObjectId(design_id)})
    if delete_result.deleted_count == 1:
        return {"msg": "Graphic design deleted successfully"}
    raise HTTPException(status_code=404, detail="Graphic design not found")


# Skills Endpoints


@router.get("/skills")
async def get_skills():
    db = get_db()
    skills = await db["skills"].find().sort([("order", 1), ("_id", 1)]).to_list(100)
    return [serialize_doc(s) for s in skills]


@router.post("/skills", dependencies=[Depends(get_current_admin)])
async def create_skill(skill: Skill):
    db = get_db()
    new_skill = await db["skills"].insert_one(skill.dict())
    created_skill = await db["skills"].find_one({"_id": new_skill.inserted_id})
    return serialize_doc(created_skill)


@router.put("/skills/{skill_id}", dependencies=[Depends(get_current_admin)])
async def update_skill(skill_id: str, skill: Skill):
    db = get_db()
    updated_skill = await db["skills"].find_one_and_update(
        {"_id": ObjectId(skill_id)}, {"$set": skill.dict()}, return_document=True
    )
    if updated_skill:
        return serialize_doc(updated_skill)
    raise HTTPException(status_code=404, detail="Skill not found")


@router.delete("/skills/{skill_id}", dependencies=[Depends(get_current_admin)])
async def delete_skill(skill_id: str):
    db = get_db()
    delete_result = await db["skills"].delete_one({"_id": ObjectId(skill_id)})
    if delete_result.deleted_count == 1:
        return {"msg": "Skill deleted successfully"}
    raise HTTPException(status_code=404, detail="Skill not found")
