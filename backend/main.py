import os
import json
import math
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

app = FastAPI(title="Face Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(__file__), "users.json")
LOGS_FILE = os.path.join(os.path.dirname(__file__), "logs.json")

class UserRegister(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: Optional[str] = ""
    descriptor: List[float]

class UserLogin(BaseModel):
    descriptor: List[float]

class CredentialLogin(BaseModel):
    email: EmailStr
    password: str


def load_users() -> List[dict]:
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []


def save_users(users: List[dict]):
    with open(DB_FILE, "w") as f:
        json.dump(users, f, indent=4)


def load_logs() -> List[dict]:
    loaded = []
    if os.path.exists(LOGS_FILE):
        try:
            with open(LOGS_FILE, "r") as f:
                loaded = json.load(f)
        except json.JSONDecodeError:
            pass
    
    # Backfill registration logs for existing users in users.json if not present
    users = load_users()
    logged_emails = {l["email"].lower() for l in loaded if "email" in l}
    import datetime
    base_time = datetime.datetime.now() - datetime.timedelta(days=1)
    
    new_logs = []
    for i, u in enumerate(users):
        u_email = u["email"].lower()
        if u_email not in logged_emails:
            # Create a sequential past timestamp for registration log
            time_str = (base_time + datetime.timedelta(minutes=i*10)).strftime("%Y-%m-%d %H:%M:%S")
            new_logs.append({
                "email": u["email"],
                "name": f"{u.get('firstName', '')} {u.get('lastName', '')}",
                "action": "Registration Success (Imported)",
                "timestamp": time_str,
                "status": "success"
            })
            
    if new_logs:
        # Prepend new_logs to show older registered users correctly, keeping new logs at the top
        combined = loaded + new_logs
        # Sort combined logs by timestamp descending so newer events are always first
        try:
            combined.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        except Exception:
            pass
        save_logs(combined)
        return combined
        
    return loaded


def save_logs(logs: List[dict]):
    with open(LOGS_FILE, "w") as f:
        json.dump(logs, f, indent=4)


def log_activity(email: str, name: str, action: str, status: str):
    import datetime
    logs = load_logs()
    new_log = {
        "email": email,
        "name": name,
        "action": action,
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": status
    }
    logs.insert(0, new_log)
    save_logs(logs[:200]) # Keep last 200 logs


def euclidean(d1: List[float], d2: List[float]) -> float:
    if len(d1) != len(d2):
        return float('inf')
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(d1, d2)))


@app.post("/api/register")
async def register(user_data: UserRegister):
    users = load_users()
    for user in users:
        if user["email"].lower() == user_data.email.lower():
            log_activity(user_data.email, f"{user_data.firstName} {user_data.lastName}", "Registration Failed (Email exists)", "failed")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered"
            )
    new_user = {
        "firstName": user_data.firstName,
        "lastName": user_data.lastName,
        "email": user_data.email,
        "password": user_data.password,
        "registeredAt": __import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "descriptor": user_data.descriptor,
    }
    users.append(new_user)
    save_users(users)
    log_activity(user_data.email, f"{user_data.firstName} {user_data.lastName}", "Registration Success", "success")
    return {
        "message": "User registered successfully",
        "user": {"firstName": user_data.firstName, "lastName": user_data.lastName}
    }


@app.post("/api/login")
async def login(login_data: UserLogin):
    users = load_users()
    if not users:
        log_activity("System", "System", "Face Login Failed (No users)", "failed")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users registered yet"
        )

    MATCH_THRESHOLD = 0.55
    best_user = None
    min_dist = float('inf')

    for user in users:
        dist = euclidean(login_data.descriptor, user.get("descriptor", []))
        print(f"  user={user['email']} distance={dist:.4f}")
        if dist < min_dist:
            min_dist = dist
            best_user = user

    print(f"Best distance: {min_dist:.4f}  threshold={MATCH_THRESHOLD}")

    if min_dist <= MATCH_THRESHOLD and best_user:
        log_activity(
            best_user["email"], 
            f"{best_user.get('firstName', '')} {best_user.get('lastName', '')}", 
            "Face Login Success", 
            "success"
        )
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "firstName": best_user["firstName"],
                "lastName": best_user["lastName"],
                "email": best_user["email"],
            }
        }

    log_activity("Unknown Face", "Unknown User", "Face Login Failed (No match)", "failed")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Face doesn't match"
    )


@app.post("/api/login-credentials")
async def login_credentials(login_data: CredentialLogin):
    users = load_users()
    for user in users:
        if user["email"].lower() == login_data.email.lower():
            if user.get("password") == login_data.password:
                log_activity(
                    user["email"], 
                    f"{user.get('firstName', '')} {user.get('lastName', '')}", 
                    "Credentials Login Success", 
                    "success"
                )
                return {
                    "success": True,
                    "message": "Login successful",
                    "user": {
                        "firstName": user["firstName"],
                        "lastName": user["lastName"],
                        "email": user["email"],
                    }
                }
            else:
                log_activity(
                    user["email"], 
                    f"{user.get('firstName', '')} {user.get('lastName', '')}", 
                    "Credentials Login Failed (Wrong Password)", 
                    "failed"
                )
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid password"
                )
    
    log_activity(login_data.email, "Guest", "Credentials Login Failed (User not found)", "failed")
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )


@app.get("/api/users")
async def get_users():
    users = load_users()
    return [
        {
            "sno": i + 1,
            "firstName": u["firstName"],
            "lastName": u["lastName"],
            "fullName": f"{u['firstName']} {u['lastName']}",
            "email": u["email"],
            "password": u.get("password", ""),
            "registeredAt": u.get("registeredAt", "—"),
            "hasBiometric": bool(u.get("descriptor")),
        }
        for i, u in enumerate(users)
    ]


@app.get("/api/logs")
async def get_logs():
    return load_logs()

# Explicit MIME type configuration for Windows registry compatibility
import mimetypes
mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")

# Mount static files to serve the production frontend directly from FastAPI
from fastapi.staticfiles import StaticFiles
DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dist")
if os.path.exists(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")

