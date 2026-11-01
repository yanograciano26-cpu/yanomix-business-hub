from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from .database import Base, SessionLocal, engine
from .models import User, Category, AdListing, Business, Plan, PaymentRecord, SupportTicket
from .schemas import (
    UserCreate,
    UserRead,
    CategoryCreate,
    CategoryRead,
    AdCreate,
    AdRead,
    BusinessCreate,
    BusinessRead,
    PlanRead,
    PaymentCreate,
    SupportCreate,
    AIRequest,
    AIResponse,
)

app = FastAPI(title="YANOMIX BUSINESS HUB API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data(db: Session):
    if db.query(Category).count() == 0:
        categories = [
            ("Imóveis", "imoveis", "Casas, apartamentos e negócios imobiliários"),
            ("Automóveis", "automoveis", "Veículos novos e usados"),
            ("Telemóveis e computadores", "telemoveis-e-computadores", "Eletrónica e dispositivos"),
            ("Empregos", "empregos", "Vagas e oportunidades de trabalho"),
            ("Moda", "moda", "Roupas, acessórios e estilo"),
            ("Agricultura", "agricultura", "Produtos rurais e negócios do campo"),
            ("Serviços", "servicos", "Prestadores de serviços e especialistas"),
            ("Educação", "educacao", "Escolas, cursos e tutoria"),
            ("Tecnologia", "tecnologia", "Soluções digitais e startups"),
            ("Música e entretenimento", "musica-e-entretenimento", "Artistas e produção"),
        ]
        for name, slug, description in categories:
            db.add(Category(name=name, slug=slug, description=description))

    if db.query(Plan).count() == 0:
        plans = [
            ("FREE", "free", 0.0, "Kz", "Acesso básico para iniciar", "1 anúncio, perfil básico, suporte por e-mail"),
            ("STARTER", "starter", 2500.0, "Kz", "Para pequenos vendedores", "5 anúncios, destaque básico, análise inicial"),
            ("BUSINESS", "business", 7500.0, "Kz", "Para empresas em crescimento", "Anúncios ilimitados, dashboard, publicações patrocinadas"),
            ("PREMIUM", "premium", 18000.0, "Kz", "Máxima presença digital", "Tudo do Business + destaque premium e suporte prioritário"),
        ]
        for name, slug, price, currency, description, features in plans:
            db.add(Plan(name=name, slug=slug, price=price, currency=currency, description=description, features=features))

    db.commit()


@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "YANOMIX BUSINESS HUB API"}


@app.get("/api/categories", response_model=list[CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.id).all()


@app.post("/api/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Categoria já existe.")
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@app.get("/api/plans", response_model=list[PlanRead])
def list_plans(db: Session = Depends(get_db)):
    return db.query(Plan).order_by(Plan.id).all()


@app.get("/api/ads", response_model=list[AdRead])
def list_ads(db: Session = Depends(get_db)):
    return db.query(AdListing).order_by(AdListing.id.desc()).all()


@app.post("/api/ads", response_model=AdRead, status_code=status.HTTP_201_CREATED)
def create_ad(payload: AdCreate, db: Session = Depends(get_db)):
    if not db.query(Category).filter(Category.id == payload.category_id).first():
        raise HTTPException(status_code=400, detail="Categoria inválida.")
    if not db.query(User).filter(User.id == payload.user_id).first():
        raise HTTPException(status_code=400, detail="Utilizador inválido.")
    ad = AdListing(**payload.model_dump())
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad


@app.get("/api/businesses", response_model=list[BusinessRead])
def list_businesses(db: Session = Depends(get_db)):
    return db.query(Business).order_by(Business.id.desc()).all()


@app.post("/api/businesses", response_model=BusinessRead, status_code=status.HTTP_201_CREATED)
def create_business(payload: BusinessCreate, db: Session = Depends(get_db)):
    if not db.query(Category).filter(Category.id == payload.category_id).first():
        raise HTTPException(status_code=400, detail="Categoria inválida.")
    business = Business(**payload.model_dump())
    db.add(business)
    db.commit()
    db.refresh(business)
    return business


@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "company_name": user.company_name,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
        for user in db.query(User).order_by(User.id).all()
    ]


@app.post("/api/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Este email já está registado.")
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.get("/api/metrics")
def metrics(db: Session = Depends(get_db)):
    users = db.query(User).count()
    ads = db.query(AdListing).count()
    businesses = db.query(Business).count()
    revenue = db.query(func.coalesce(func.sum(PaymentRecord.amount), 0)).scalar() or 0
    return {
        "users": users,
        "ads": ads,
        "businesses": businesses,
        "revenue": float(revenue),
        "featured_ads": db.query(AdListing).filter(AdListing.is_featured == True).count(),
    }


@app.post("/api/payments", status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.id == payload.user_id).first():
        raise HTTPException(status_code=400, detail="Utilizador inválido.")
    if not db.query(Plan).filter(Plan.id == payload.plan_id).first():
        raise HTTPException(status_code=400, detail="Plano inválido.")
    payment = PaymentRecord(**payload.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return {"id": payment.id, "status": payment.status, "amount": payment.amount, "currency": payment.currency}


@app.get("/api/payments")
def list_payments(db: Session = Depends(get_db)):
    return [
        {
            "id": payment.id,
            "user_id": payment.user_id,
            "plan_id": payment.plan_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "created_at": payment.created_at.isoformat() if payment.created_at else None,
        }
        for payment in db.query(PaymentRecord).order_by(PaymentRecord.id.desc()).all()
    ]


@app.get("/api/support")
def list_support(db: Session = Depends(get_db)):
    return [
        {
            "id": ticket.id,
            "user_email": ticket.user_email,
            "subject": ticket.subject,
            "message": ticket.message,
            "status": ticket.status,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        }
        for ticket in db.query(SupportTicket).order_by(SupportTicket.id.desc()).all()
    ]


@app.post("/api/support", status_code=status.HTTP_201_CREATED)
def create_support(payload: SupportCreate, db: Session = Depends(get_db)):
    ticket = SupportTicket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": ticket.id, "status": ticket.status}


@app.post("/api/ai/business-helper", response_model=AIResponse)
def business_helper(payload: AIRequest):
    prompt = payload.prompt.strip()
    response = (
        f"YANO AI BUSINESS: com base no teu objetivo '{prompt}', recomendo: "
        "1) definir nicho e público-alvo, 2) criar um pacote de serviço para atingir 5 a 10 clientes, "
        "3) usar anúncios premium para crescimento, 4) testar preço inicial em Kz e ajustar conforme volume, "
        "5) reforçar presença digital com portfólio, depoimentos e oferta limitada."
    )
    return AIResponse(response=response)


@app.get("/api/dashboard")
def dashboard_data(db: Session = Depends(get_db)):
    return {
        "revenue_monthly": [52000, 61000, 72000, 83000, 97000, 108500],
        "new_users": [28, 42, 51, 63, 70, 92],
        "ads_published": [10, 18, 22, 30, 35, 42],
        "sponsored_ads": [4, 7, 9, 11, 13, 16],
        "transactions": [6, 8, 11, 15, 20, 24],
        "growth": [12, 18, 27, 36, 43, 57],
    }


@app.get("/")
def root():
    return {"message": "YANOMIX BUSINESS HUB backend is running."}
