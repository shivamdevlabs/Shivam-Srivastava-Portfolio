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
    order: Optional[int] = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Certificate(BaseModel):
    title: str
    pdf_url: str
    issued_by: Optional[str] = None
    order: Optional[int] = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Experience(BaseModel):
    role: str
    company: str
    location: str
    start_date: str
    end_date: str
    description: List[str]
    order: Optional[int] = 0


class Education(BaseModel):
    degree: str
    institution: str
    duration: str
    order: Optional[int] = 0


class AboutInfo(BaseModel):
    name: str
    roles: List[str]
    bio: str
    email: str
    phone: str
    address: str
    social_links: dict
    photo_url: Optional[str] = None
    resume_url: Optional[str] = None


class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str


class GraphicDesign(BaseModel):
    title: str
    description: str
    media_url: str
    media_type: str  # 'image' or 'video'
    order: Optional[int] = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Skill(BaseModel):
    name: str
    category: str = "technical"  # 'technical', 'designing', or 'other'
    order: Optional[int] = 0
