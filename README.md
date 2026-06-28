# Shivam Srivastava - Developer Portfolio

A modern, dynamic, and fully responsive personal portfolio website with a custom Admin Panel for seamless content management.

## 🚀 Features

- **Dynamic Content:** All sections (About, Experience, Projects, Certificates) are fetched from the backend and can be updated in real-time.
- **Admin Panel:** A secure, authenticated dashboard to manage your portfolio content (Add/Edit/Delete).
- **GitHub Integration:** Auto-import project details directly from a GitHub repository URL into your portfolio.
- **Dark/Light Mode:** Full system-aware dark mode support using Tailwind CSS v4.
- **Interactive UI:** Smooth scrolling, animations using Framer Motion, and beautiful glassmorphism design.
- **Contact Form:** Working contact form that sends emails directly to your inbox.
- **Resume Download:** Easily upload and serve your resume for visitors to view or download.
- **Responsive Design:** Looks great on mobile, tablet, and desktop devices.

## 🛠️ Technologies Used

### Frontend
- **React.js** (Vite)
- **Tailwind CSS v4** (Utility-first styling)
- **Framer Motion** (Animations)
- **React Router DOM** (Client-side routing)
- **React Icons** (SVG icons)

### Backend
- **FastAPI** (High-performance Python web framework)
- **MongoDB** (NoSQL Database)
- **Pydantic** (Data validation)
- **Uvicorn** (ASGI server)
- **PyJWT & Passlib** (Authentication & security)

## ⚙️ Local Development Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Shivam Srivastava Portfolio"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows):
venv\Scripts\activate
# Activate virtual environment (Mac/Linux):
source venv/bin/activate

pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory (optional for email):
```env
MONGO_URI=mongodb://localhost:27017
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```
Run the backend server:
```bash
python -m uvicorn main:app --reload
```
*The API will be available at http://localhost:8000*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be available at http://localhost:5173*

## 🔑 Default Admin Credentials
When you run the seed script or start fresh, the default admin account is:
- **Email:** `admin@admin.com`
- **Password:** `admin123`

You can access the admin panel at `http://localhost:5173/admin/login`.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
