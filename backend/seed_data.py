import asyncio
import re
import os
import shutil
from database import get_db, MONGO_URL
from motor.motor_asyncio import AsyncIOMotorClient

async def seed():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.portfolio_db

    print("Dropping existing collections for clean seed...")
    await db.about.drop()
    await db.experience.drop()
    await db.education.drop()
    await db.projects.drop()
    await db.certificates.drop()
    await db.users.drop()

    print("Creating admin user...")
    from auth import get_password_hash
    await db.users.insert_one({
        "email": "admin@admin.com",
        "hashed_password": get_password_hash("admin123")
    })

    # 1. Parse About me.md
    print("Parsing About me.md...")
    about_text = ""
    try:
        with open("../assets/About me.md", "r", encoding="utf-8") as f:
            about_text = f.read()
    except Exception as e:
        print(f"Could not read About me.md: {e}")

    # Extract Contact Details
    email = re.search(r'E-mail:\s*(.+)', about_text)
    phone = re.search(r'Mobile No.:\s*(.+)', about_text)
    address = re.search(r'Address:\s*(.+)', about_text)
    email = email.group(1).strip() if email else "techshivam02@gmail.com"
    phone = phone.group(1).strip() if phone else "+91 9354894461"
    address = address.group(1).strip() if address else "Greater Noida, India"

    # Extract Social Links
    social_links = {}
    social_section = re.search(r'###### \*\*Social Media Links:\*\*(.*?)(?=######|$)', about_text, re.DOTALL)
    if social_section:
        for line in social_section.group(1).strip().split('\n'):
            match = re.match(r'\d+\.\s*(.+?):\s*(.+)', line.strip())
            if match:
                social_links[match.group(1).lower()] = match.group(2).strip()

    about_info = {
        "name": "Shivam Srivastava",
        "roles": [
            "Software Developer", "Python Developer", "Backend Developer", 
            "Full Stack Developer (MERN)", "FastAPI & Django Expert"
        ],
        "bio": "I am a Software Developer specializing in Python, Django, FastAPI, Flask, React.js, JavaScript, Node.js, Express.js, MongoDB, MySQL, HTML, CSS, Tailwind CSS, and REST APIs. Passionate about building modern and premium web applications.",
        "email": email,
        "phone": phone,
        "address": address,
        "social_links": social_links
    }
    await db.about.insert_one(about_info)

    # Experience Data (Hardcoded for accuracy from MD)
    experiences = [
        {
            "role": "Graphic Designer",
            "company": "BizMART Infotech",
            "location": "Noida, India",
            "start_date": "09/2025",
            "end_date": "Present",
            "description": [
                "Developed and maintained scalable backend applications using Python, designing RESTful APIs and implementing business logic for client web applications.",
                "Worked with databases such as MongoDB, optimized queries, managed data processing workflows, and ensured efficient backend performance."
            ]
        },
        {
            "role": "Full Stack Developer (Freelancer)",
            "company": "Freelance",
            "location": "Greater Noida, India",
            "start_date": "02/2025",
            "end_date": "06/2025",
            "description": [
                "Architected and launched a full-stack Construction Management System using the MERN stack.",
                "Developed a dynamic user interface with React.js and Tailwind CSS featuring a real-time dashboard.",
                "Engineered a secure RESTful API with Node.js and Express.js for robust data management."
            ]
        },
        {
            "role": "Associate Consultant - Development",
            "company": "Oodles Technologies",
            "location": "Gurgaon, India",
            "start_date": "12/2023",
            "end_date": "05/2024",
            "description": [
                "Implemented secure JWT-based authentication and protected data using bcrypt hashing.",
                "Developed RESTful APIs for user sessions and learning content for playwithtamil.com.",
                "Created dynamic PDF generation using PDFKit and optimized database queries.",
                "Built responsive UI components for the learning portal using React.js."
            ]
        }
    ]
    await db.experience.insert_many(experiences)

    # Education Data
    educations = [
        {
            "degree": "Master of Computer Applications",
            "institution": "SRM Institute of Science & Technology",
            "duration": "2021 - 2023"
        },
        {
            "degree": "Bachelor of Computer Applications",
            "institution": "Chaudhary Charan Singh University, Meerut",
            "duration": "2018 - 2021"
        }
    ]
    await db.education.insert_many(educations)

    # Projects Data (from project-links.md)
    projects = [
        {
            "title": "CareerCraft - ATS Resume Optimizer",
            "description": "An AI-powered full-stack web application that generates ATS-friendly resumes tailored to any job description.",
            "technologies": ["React.js", "Node.js", "AI", "Tailwind CSS"],
            "github_link": "https://github.com/shivamdevlabs/resume-analyzer",
            "live_demo": "",
            "image_url": ""
        },
        {
            "title": "LearnWithUs",
            "description": "A MERN Stack website for college, school students or working professionals who are learning and growing their skills or knowledge.",
            "technologies": ["MongoDB", "Express.js", "React.js", "Node.js"],
            "github_link": "https://github.com/shivamdevlabs/LearnWithUs",
            "live_demo": "",
            "image_url": ""
        },
        {
            "title": "Alumni Connect",
            "description": "An online social website for build connection with alumni's and find companies career page/LinkedIn page on one website.",
            "technologies": ["HTML", "CSS", "JavaScript", "Bootstrap", "Python", "Flask", "MySQL"],
            "github_link": "https://github.com/shivamdevlabs/AlumniConnect",
            "live_demo": "",
            "image_url": ""
        },
        {
            "title": "SnakeWithShivam",
            "description": "The Snake Game is a classic arcade game where the player controls a snake that grows longer as it eats food.",
            "technologies": ["Python", "Pygame"],
            "github_link": "https://github.com/shivamdevlabs/SnakeWithShivam",
            "live_demo": "",
            "image_url": ""
        },
        {
            "title": "Coding Lovers",
            "description": "A blogging website with writing blogs and add books & affiliate book link.",
            "technologies": ["HTML", "CSS", "JavaScript", "Bootstrap", "Python", "Flask"],
            "github_link": "https://github.com/shivamdevlabs/Coding-Lovers",
            "live_demo": "",
            "image_url": ""
        }
    ]
    await db.projects.insert_many(projects)

    # Copy files
    print("Copying assets to uploads directory...")
    os.makedirs("uploads/images", exist_ok=True)
    os.makedirs("uploads/certificates", exist_ok=True)
    os.makedirs("uploads/resume", exist_ok=True)
    
    # Profile Photo
    try:
        shutil.copy("../assets/my-photo.png", "uploads/images/my-photo.png")
        print("Copied profile photo.")
        await db.about.update_one({}, {"$set": {"photo_url": "/static/images/my-photo.png"}})
    except Exception as e:
        print(f"Error copying profile photo: {e}")

    # Resume
    try:
        shutil.copy("../assets/Shivam Srivastava - Resume_PD.pdf", "uploads/resume/resume.pdf")
        print("Copied resume.")
    except Exception as e:
        print(f"Error copying resume: {e}")
        
    # Certificates
    cert_dir = "../assets/certifications"
    if os.path.exists(cert_dir):
        certs = []
        for file in os.listdir(cert_dir):
            if file.endswith(".pdf"):
                safe_name = file.replace(" ", "_").replace("(", "").replace(")", "")
                shutil.copy(os.path.join(cert_dir, file), os.path.join("uploads/certificates", safe_name))
                title = file.replace(".pdf", "").replace("_", " ")
                certs.append({
                    "title": title,
                    "pdf_url": f"/static/certificates/{safe_name}",
                    "issued_by": "Unknown" # can be updated in admin
                })
        if certs:
            await db.certificates.insert_many(certs)
            print(f"Added {len(certs)} certificates.")

    print("Database seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed())
