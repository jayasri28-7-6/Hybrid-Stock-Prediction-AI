from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import feedparser

# ==========================
# CONFIG
# ==========================

DATABASE_URL = "postgresql://postgres:post123@localhost/stock_ai_db"

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ==========================
# DATABASE SETUP
# ==========================

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================
# PASSWORD HASHING
# ==========================

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ==========================
# APP INIT
# ==========================

app = FastAPI()

# 🔥 CORS ENABLED (FOR FRONTEND)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ==========================
# DATABASE MODEL
# ==========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

Base.metadata.create_all(bind=engine)

# ==========================
# Pydantic Schemas
# ==========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class PredictionInput(BaseModel):
    text: str

# ==========================
# DB Dependency
# ==========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================
# PASSWORD FUNCTIONS
# ==========================

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# ==========================
# JWT FUNCTIONS
# ==========================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return email
    except JWTError:
        raise credentials_exception

# ==========================
# NEWS FUNCTIONS (FIXED 🔥)
# ==========================

def get_yahoo_finance_news():
    feed = feedparser.parse("https://finance.yahoo.com/rss/")
    news = []
    for entry in feed.entries[:5]:
        news.append({
            "source": "Yahoo Finance",
            "title": entry.title,
            "link": entry.link
        })
    return news


def get_cnbc_news():
    feed = feedparser.parse("https://www.cnbc.com/id/10000664/device/rss/rss.html")
    news = []
    for entry in feed.entries[:5]:
        news.append({
            "source": "CNBC",
            "title": entry.title,
            "link": entry.link
        })
    return news


def get_reuters_news():
    # ✅ Stable working Reuters RSS
    feed = feedparser.parse("https://feeds.reuters.com/reuters/businessNews")
    news = []
    for entry in feed.entries[:5]:
        news.append({
            "source": "Reuters",
            "title": entry.title,
            "link": entry.link
        })
    return news


# ==========================
# ROUTES
# ==========================

@app.get("/")
def root():
    return {"message": "FastAPI Secure Backend Running 🚀"}


# --------------------------
# Register User
# --------------------------

@app.post("/users/")
def create_user(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(user.password)

    new_user = User(email=user.email, password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"id": new_user.id, "email": new_user.email}


# --------------------------
# Login
# --------------------------

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# --------------------------
# Protected Predict Route
# --------------------------

@app.post("/predict")
def predict(data: PredictionInput, current_user: str = Depends(get_current_user)):

    prediction = f"Prediction result for: {data.text}"

    return {
        "user": current_user,
        "prediction": prediction
    }


# --------------------------
# LIVE MULTI-SOURCE NEWS 🔥
# --------------------------

@app.get("/news")
def fetch_news():
    return {
        "yahoo_finance": get_yahoo_finance_news(),
        "cnbc": get_cnbc_news(),
        "reuters": get_reuters_news()
    }