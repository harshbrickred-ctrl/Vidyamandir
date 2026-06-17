from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import io
import csv
import logging
import bcrypt
import jwt
import uuid
import requests
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import List, Optional

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

# --- OBJECT STORAGE ---
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "").strip()
APP_NAME = "srt-vidyamandir"
storage_key = None
LOCAL_UPLOADS_DIR = ROOT_DIR / "uploads"

def use_local_storage() -> bool:
    return not EMERGENT_KEY

def _local_file_path(storage_path: str) -> Path:
    return LOCAL_UPLOADS_DIR / storage_path

def save_local_object(storage_path: str, data: bytes) -> dict:
    path = _local_file_path(storage_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    return {"path": storage_path, "size": len(data)}

def init_storage():
    global storage_key
    if use_local_storage():
        LOCAL_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        logger.info("Using local filesystem storage for gallery uploads")
        return None
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    if use_local_storage():
        return save_local_object(path, data)
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    local_path = _local_file_path(path)
    if local_path.is_file():
        return local_path.read_bytes(), "application/octet-stream"
    if use_local_storage():
        raise FileNotFoundError(f"Local file not found: {path}")
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# --- EMAIL SERVICE ---
def get_admin_email() -> str:
    return os.environ.get("ADMIN_EMAIL", "srtvidyamandir2000@gmail.com").lower().strip()

def _send_smtp_sync(to_email: str, subject: str, body: str, reply_to: Optional[str] = None) -> None:
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "").strip()
    from_email = os.environ.get("SMTP_FROM", smtp_user or get_admin_email())

    if not smtp_user or not smtp_password:
        raise RuntimeError("SMTP credentials not configured")

    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    if reply_to:
        msg["Reply-To"] = reply_to
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, [to_email], msg.as_string())

async def send_email(to_email: str, subject: str, body: str, reply_to: Optional[str] = None) -> str:
    """Send email via SMTP when configured; otherwise log to DB (mock). Returns status."""
    status = "mock_sent"
    try:
        if os.environ.get("SMTP_USER") and os.environ.get("SMTP_PASSWORD"):
            loop = asyncio.get_running_loop()
            await loop.run_in_executor(
                None, lambda: _send_smtp_sync(to_email, subject, body, reply_to)
            )
            status = "sent"
            logger.info(f"[EMAIL] Sent to {to_email} | Subject: {subject}")
        else:
            logger.warning(
                f"[EMAIL MOCK] SMTP not configured — logging only. To: {to_email} | Subject: {subject}"
            )
            logger.info(f"[EMAIL MOCK] Body: {body}")
    except Exception as e:
        status = "failed"
        logger.error(f"Email send failed to {to_email}: {e}")

    try:
        await db.email_logs.insert_one({
            "id": str(uuid.uuid4()),
            "to": to_email,
            "subject": subject,
            "body": body,
            "status": status,
            "sent_at": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        logger.error(f"Failed to log email: {e}")

    return status

# --- AUTH HELPERS ---
def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(minutes=60), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- MODELS ---
class LoginRequest(BaseModel):
    email: str
    password: str

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "normal"

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    priority: Optional[str] = None

class EventCreate(BaseModel):
    title: str
    description: str
    date: str
    category: str = "general"
    image_url: Optional[str] = None

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None

class AdmissionCreate(BaseModel):
    student_name: str
    parent_name: str
    email: str
    phone: str
    date_of_birth: str
    gender: str
    address: str
    previous_school: Optional[str] = None
    class_applying: str
    stream: Optional[str] = None
    additional_info: Optional[str] = None

class AdmissionStatusUpdate(BaseModel):
    status: str


def parse_student_birth_date(value: str):
    value = value.strip()
    if not value:
        raise ValueError("Empty date")
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    raise ValueError("Invalid date format")

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str

# --- APP ---
app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- AUTH ENDPOINTS ---
@api_router.post("/auth/login")
async def login(request: LoginRequest, response: Response):
    email = request.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user"), "token": access_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"id": user["_id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "user")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

# --- ANNOUNCEMENTS ---
@api_router.get("/announcements")
async def get_announcements(search: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"content": {"$regex": search, "$options": "i"}}
        ]
    announcements = await db.announcements.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return announcements

@api_router.post("/announcements")
async def create_announcement(data: AnnouncementCreate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    doc = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "content": data.content,
        "priority": data.priority,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user["email"]
    }
    await db.announcements.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/announcements/{announcement_id}")
async def update_announcement(announcement_id: str, data: AnnouncementUpdate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.announcements.update_one({"id": announcement_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Updated"}

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.announcements.delete_one({"id": announcement_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Deleted"}

# --- EVENTS ---
@api_router.get("/events")
async def get_events(search: Optional[str] = None, category: Optional[str] = None):
    query = {}
    conditions = []
    if search:
        conditions.append({"$or": [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]})
    if category and category != "all":
        conditions.append({"category": category})
    if conditions:
        query = {"$and": conditions} if len(conditions) > 1 else conditions[0]
    events = await db.events.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return events

@api_router.post("/events")
async def create_event(data: EventCreate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    doc = {
        "id": str(uuid.uuid4()),
        "title": data.title,
        "description": data.description,
        "date": data.date,
        "category": data.category,
        "image_url": data.image_url or "",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.events.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, data: EventUpdate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.events.update_one({"id": event_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Updated"}

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Deleted"}

# --- ADMISSIONS ---
@api_router.post("/admissions")
async def submit_admission(data: AdmissionCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "student_name": data.student_name,
        "parent_name": data.parent_name,
        "email": data.email,
        "phone": data.phone,
        "date_of_birth": data.date_of_birth,
        "gender": data.gender,
        "address": data.address,
        "previous_school": data.previous_school or "",
        "class_applying": data.class_applying,
        "stream": data.stream or "",
        "additional_info": data.additional_info or "",
        "status": "pending",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admissions.insert_one(doc)
    doc.pop("_id", None)

    # Confirmation to applicant
    await send_email(
        data.email,
        "Application Received - S.R.T. Vidyamandir",
        f"Dear {data.parent_name},\n\nThank you for submitting an admission application for {data.student_name} to S.R.T. Vidyamandir High School & Junior College.\n\nClass Applied: {data.class_applying}\nApplication ID: {doc['id']}\n\nYour application is currently under review. We will contact you soon regarding the next steps.\n\nBest regards,\nS.R.T. Vidyamandir Admissions Team"
    )

    # Notify admin with full application details
    admin_email = get_admin_email()
    admin_body = (
        f"A new admission application has been received:\n\n"
        f"Application ID: {doc['id']}\n"
        f"Student Name: {data.student_name}\n"
        f"Parent/Guardian: {data.parent_name}\n"
        f"Email: {data.email}\n"
        f"Phone: {data.phone}\n"
        f"Date of Birth: {data.date_of_birth}\n"
        f"Gender: {data.gender}\n"
        f"Class Applying: {data.class_applying}\n"
        f"Previous School: {data.previous_school or 'N/A'}\n"
        f"Address: {data.address}\n"
        f"Additional Info: {data.additional_info or 'N/A'}\n\n"
        f"Please review the application in the admin dashboard."
    )
    await send_email(
        admin_email,
        f"New Admission Application - {data.student_name}",
        admin_body,
        reply_to=data.email,
    )

    return doc

@api_router.get("/admissions")
async def get_admissions(
    user: dict = Depends(get_current_user),
    search: Optional[str] = None,
    status: Optional[str] = None,
    class_filter: Optional[str] = None
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    query = {}
    conditions = []
    if search:
        conditions.append({"$or": [
            {"student_name": {"$regex": search, "$options": "i"}},
            {"parent_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]})
    if status and status != "all":
        conditions.append({"status": status})
    if class_filter and class_filter != "all":
        conditions.append({"class_applying": class_filter})
    if conditions:
        query = {"$and": conditions} if len(conditions) > 1 else conditions[0]
    admissions = await db.admissions.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return admissions

@api_router.put("/admissions/{admission_id}/status")
async def update_admission_status(admission_id: str, data: AdmissionStatusUpdate, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    if data.status not in ("pending", "approved", "rejected", "waitlisted"):
        raise HTTPException(status_code=400, detail="Invalid status")
    admission = await db.admissions.find_one({"id": admission_id}, {"_id": 0})
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    result = await db.admissions.update_one(
        {"id": admission_id},
        {"$set": {"status": data.status, "updated_at": datetime.now(timezone.utc).isoformat(), "updated_by": user["email"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Admission not found")

    # Send mock email notification to applicant about status change
    status_messages = {
        "approved": f"We are pleased to inform you that the admission application for {admission['student_name']} has been APPROVED! Please visit the school with the required documents to complete the admission process.",
        "rejected": f"We regret to inform you that the admission application for {admission['student_name']} could not be accepted at this time. Please contact the school office for more information.",
        "waitlisted": f"The admission application for {admission['student_name']} has been placed on the WAITLIST. We will notify you if a seat becomes available.",
        "pending": f"The admission application for {admission['student_name']} has been set back to pending review."
    }
    await send_email(
        admission.get("email", ""),
        f"Application Status Update - S.R.T. Vidyamandir",
        f"Dear {admission.get('parent_name', 'Parent')},\n\n{status_messages.get(data.status, '')}\n\nApplication ID: {admission_id}\nClass Applied: {admission.get('class_applying', '')}\n\nBest regards,\nS.R.T. Vidyamandir Admissions Team"
    )

    return {"message": "Status updated", "status": data.status}

@api_router.get("/admissions/export")
async def export_admissions(
    user: dict = Depends(get_current_user),
    search: Optional[str] = None,
    status: Optional[str] = None,
    class_filter: Optional[str] = None
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    query = {}
    conditions = []
    if search:
        conditions.append({"$or": [
            {"student_name": {"$regex": search, "$options": "i"}},
            {"parent_name": {"$regex": search, "$options": "i"}}
        ]})
    if status and status != "all":
        conditions.append({"status": status})
    if class_filter and class_filter != "all":
        conditions.append({"class_applying": class_filter})
    if conditions:
        query = {"$and": conditions} if len(conditions) > 1 else conditions[0]
    admissions = await db.admissions.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(500)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student Name", "Parent Name", "Email", "Phone", "DOB", "Gender", "Class", "Stream", "Previous School", "Address", "Status", "Submitted At"])
    for a in admissions:
        writer.writerow([
            a.get("student_name", ""), a.get("parent_name", ""), a.get("email", ""),
            a.get("phone", ""), a.get("date_of_birth", ""), a.get("gender", ""),
            a.get("class_applying", ""), a.get("stream", ""), a.get("previous_school", ""),
            a.get("address", ""), a.get("status", ""), a.get("submitted_at", "")
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=admissions_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )


@api_router.post("/students/upload-csv")
async def upload_students_csv(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    allowed_types = ["text/csv", "application/csv", "application/vnd.ms-excel", "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File type not allowed. Please upload a CSV file.")

    raw = await file.read()
    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Unable to decode CSV file. Use UTF-8 encoding.")

    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV file is missing headers.")

    docs = []
    errors = []
    for idx, row in enumerate(reader, start=2):
        name = (row.get("name") or row.get("student_name") or "").strip()
        dob_value = (row.get("date_of_birth") or row.get("dob") or "").strip()
        class_name = (row.get("class") or row.get("class_name") or row.get("class_applying") or "").strip()
        section = (row.get("section") or "").strip()
        gender = (row.get("gender") or "").strip()

        if not name or not dob_value:
            errors.append(f"Row {idx}: missing required name or date_of_birth")
            continue

        try:
            dob = parse_student_birth_date(dob_value)
        except ValueError:
            errors.append(f"Row {idx}: invalid date_of_birth '{dob_value}'")
            continue

        docs.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "date_of_birth": dob.strftime("%Y-%m-%d"),
            "birth_month": dob.month,
            "birth_day": dob.day,
            "class_name": class_name,
            "section": section,
            "gender": gender,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": user["email"]
        })

    if docs:
        await db.students.insert_many(docs)

    return {"inserted_count": len(docs), "errors": errors}


@api_router.get("/students")
async def get_students(search: Optional[str] = None, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"class_name": {"$regex": search, "$options": "i"}},
                {"section": {"$regex": search, "$options": "i"}}
            ]
        }
    students = await db.students.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return students


@api_router.get("/birthdays/today")
async def get_todays_birthdays():
    now = datetime.now(timezone.utc)
    birthdays = await db.students.find(
        {"birth_month": now.month, "birth_day": now.day},
        {"_id": 0}
    ).sort("name", 1).to_list(100)
    return {"birthdays": birthdays}

# --- CONTACT ---
@api_router.post("/contact")
async def submit_contact(data: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": data.name,
        "email": data.email,
        "phone": data.phone or "",
        "subject": data.subject,
        "message": data.message,
        "status": "new",
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(doc)
    doc.pop("_id", None)

    # Confirmation to sender
    await send_email(
        data.email,
        "Message Received - S.R.T. Vidyamandir",
        f"Dear {data.name},\n\nThank you for contacting S.R.T. Vidyamandir. We have received your message regarding \"{data.subject}\" and will respond as soon as possible.\n\nBest regards,\nS.R.T. Vidyamandir"
    )

    # Notify admin at school email
    admin_email = get_admin_email()
    admin_body = (
        f"New contact form submission:\n\n"
        f"Name: {data.name}\n"
        f"Email: {data.email}\n"
        f"Phone: {data.phone or 'N/A'}\n"
        f"Subject: {data.subject}\n\n"
        f"Message:\n{data.message}"
    )
    await send_email(
        admin_email,
        f"New Contact Message - {data.subject}",
        admin_body,
        reply_to=data.email,
    )

    return doc

@api_router.get("/contact")
async def get_contacts(user: dict = Depends(get_current_user), search: Optional[str] = None):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"subject": {"$regex": search, "$options": "i"}}
        ]
    contacts = await db.contact_messages.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return contacts

@api_router.get("/contact/export")
async def export_contacts(user: dict = Depends(get_current_user), search: Optional[str] = None):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    contacts = await db.contact_messages.find(query, {"_id": 0}).sort("submitted_at", -1).to_list(500)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Email", "Phone", "Subject", "Message", "Status", "Submitted At"])
    for c in contacts:
        writer.writerow([c.get("name",""), c.get("email",""), c.get("phone",""), c.get("subject",""), c.get("message",""), c.get("status",""), c.get("submitted_at","")])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=contacts_export_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

# --- GALLERY (with Object Storage) ---
@api_router.get("/gallery")
async def get_gallery(category: Optional[str] = None):
    query = {"is_deleted": {"$ne": True}}
    if category and category != "all":
        query["category"] = category
    gallery = await db.gallery.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return gallery

@api_router.post("/gallery/upload")
async def upload_gallery_image(
    file: UploadFile = File(...),
    title: str = Query(...),
    category: str = Query("general"),
    description: str = Query(""),
    user: dict = Depends(get_current_user)
):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(allowed_types)}")

    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit")

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    storage_path = f"{APP_NAME}/gallery/{uuid.uuid4()}.{ext}"

    try:
        result = put_object(storage_path, data, file.content_type)
    except Exception as e:
        logger.error(f"Storage upload failed: {e}")
        detail = "Failed to upload image"
        if use_local_storage():
            detail = "Failed to save image to local storage"
        elif not EMERGENT_KEY:
            detail = "Gallery storage is not configured. Set EMERGENT_LLM_KEY or use local mode (leave key empty)."
        raise HTTPException(status_code=500, detail=detail)

    doc = {
        "id": str(uuid.uuid4()),
        "title": title,
        "category": category,
        "description": description,
        "storage_path": result["path"],
        "storage_backend": "local" if use_local_storage() else "emergent",
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.gallery.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/gallery/image/{gallery_id}")
async def get_gallery_image(gallery_id: str):
    record = await db.gallery.find_one({"id": gallery_id, "is_deleted": {"$ne": True}}, {"_id": 0})
    if not record or not record.get("storage_path"):
        raise HTTPException(status_code=404, detail="Image not found")
    try:
        data, content_type = get_object(record["storage_path"])
        return Response(content=data, media_type=record.get("content_type", content_type))
    except Exception as e:
        logger.error(f"Storage download failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve image")

@api_router.delete("/gallery/{gallery_id}")
async def delete_gallery_item(gallery_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    result = await db.gallery.update_one({"id": gallery_id}, {"$set": {"is_deleted": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"message": "Deleted"}

# --- EMAIL LOGS ---
@api_router.get("/email-logs")
async def get_email_logs(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    logs = await db.email_logs.find({}, {"_id": 0}).sort("sent_at", -1).to_list(100)
    return logs

# --- STATS ---
@api_router.get("/stats")
async def get_stats():
    students = await db.students.count_documents({})
    admissions = await db.admissions.count_documents({})
    announcements = await db.announcements.count_documents({})
    events = await db.events.count_documents({})
    contacts = await db.contact_messages.count_documents({})
    gallery = await db.gallery.count_documents({"is_deleted": {"$ne": True}})
    pending = await db.admissions.count_documents({"status": "pending"})
    approved = await db.admissions.count_documents({"status": "approved"})
    return {
        "total_students": max(students, 1000),
        "total_staff": 50,
        "result_percentage": 95,
        "total_announcements": announcements,
        "total_events": events,
        "total_contacts": contacts,
        "total_gallery": gallery,
        "total_admissions": admissions,
        "pending_admissions": pending,
        "approved_admissions": approved
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.students.create_index([("birth_month", 1), ("birth_day", 1)])
    await db.students.create_index("id", unique=True)
    # Init storage
    try:
        init_storage()
        if use_local_storage():
            logger.info("Gallery uploads will be stored in backend/uploads/")
        else:
            logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "srtvidyamandir2000@gmail.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email, "password_hash": hashed,
            "name": "Admin", "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    reload_mode = os.environ.get("DEV_RELOAD", "false").lower() in ("1", "true")
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=reload_mode)
