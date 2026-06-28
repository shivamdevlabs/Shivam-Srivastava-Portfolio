from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    email: EmailStr
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Project(BaseModel):
    title: str
    description: str
    technologies: List[str]
    github_link: Optional[str] = None
    live_demo: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Certificate(BaseModel):
    title: str
    pdf_url: str
    issued_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Experience(BaseModel):
    role: str
    company: str
    location: str
    start_date: str
    end_date: str
    description: List[str]

class Education(BaseModel):
    degree: str
    institution: str
    duration: str

class AboutInfo(BaseModel):
    name: str
    roles: List[str]
    bio: str
    email: str
    phone: str
    address: str
    social_links: dict
    photo_url: Optional[str] = None

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str
