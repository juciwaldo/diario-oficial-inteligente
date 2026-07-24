"""
routes.py — Todas as rotas da API REST

Endpoints:
  /api/v1/auth/         → login, registro
  /api/v1/users/        → perfil, variações de nome
  /api/v1/competitions/ → concursos
  /api/v1/keywords/     → palavras-chave
  /api/v1/search/       → pesquisa manual e histórico
  /api/v1/dashboard/    → estatísticas do dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
import json
import time
import asyncio

from database import get_db, User, NameVariation, Competition, Keyword, SearchRecord, SearchMatch
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/v1")


# ─────────────────────────────────────────────────────────────
# SCHEMAS (Pydantic)
# ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    onboarding_done: bool
    telegram_notifications: bool
    has_telegram: bool

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    search_time: Optional[str] = None
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    telegram_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None

class VariationRequest(BaseModel):
    variation: str

class CompetitionRequest(BaseModel):
    organ_name: Optional[str] = None
    position: Optional[str] = None
    year: Optional[int] = None
    status: Optional[str] = "waiting_result"
    registration_number: Optional[str] = None
    organizing_body: Optional[str] = None
    edital_url: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = True

class KeywordRequest(BaseModel):
    word: str
    priority: str = "medium"
    category: str = "positive"

class SearchRequest(BaseModel):
    journals: List[str] = ["DOU", "DOBA"]
    target_date: Optional[str] = None  # "YYYY-MM-DD" para dia único
    start_date: Optional[str] = None   # "YYYY-MM-DD" início do período
    end_date: Optional[str] = None     # "YYYY-MM-DD" fim do período
    custom_term: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────────────────────────

@router.post("/auth/register", status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    clean_email = data.email.strip().lower()
    # Verifica se e-mail já existe
    result = await db.execute(select(User).where(func.lower(User.email) == clean_email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Se já existe (cadastrado em testes anteriores), atualiza a senha com o hash bcrypt novo
        existing_user.hashed_password = hash_password(data.password)
        existing_user.full_name = data.full_name.strip()
        db.add(existing_user)
        user = existing_user
    else:
        # Cria novo usuário
        user = User(
            email=clean_email,
            hashed_password=hash_password(data.password),
            full_name=data.full_name.strip(),
        )
        db.add(user)
        await db.flush()

        # Gera variações automáticas do nome
        variations = _generate_name_variations(data.full_name)
        for var in variations:
            db.add(NameVariation(user_id=user.id, variation=var, is_auto_generated=True))

        # Palavras-chave padrão
        default_keywords = [
            ("Convocação", "high", "positive"),
            ("Convocado", "high", "positive"),
            ("Nomeação", "high", "positive"),
            ("Nomeado", "high", "positive"),
            ("Posse", "high", "positive"),
            ("Homologação", "medium", "positive"),
            ("Resultado Final", "medium", "positive"),
            ("Aprovado", "high", "positive"),
            ("Cadastro Reserva", "medium", "positive"),
            ("Eliminado", "high", "negative"),
            ("Eliminação", "high", "negative"),
            ("Desclassificado", "high", "negative"),
            ("Recursos", "low", "neutral"),
            ("Prazo", "medium", "neutral"),
        ]
        for word, priority, category in default_keywords:
            db.add(Keyword(
                user_id=user.id, word=word,
                priority=priority, category=category,
                is_system_default=True
            ))

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "onboarding_done": user.onboarding_done,
        }
    }


@router.post("/auth/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    clean_email = data.email.strip().lower()
    result = await db.execute(select(User).where(func.lower(User.email) == clean_email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "onboarding_done": user.onboarding_done,
        }
    }


# ─────────────────────────────────────────────────────────────
# USUÁRIO / PERFIL
# ─────────────────────────────────────────────────────────────

@router.get("/users/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "onboarding_done": current_user.onboarding_done,
        "telegram_notifications": current_user.telegram_notifications,
        "has_telegram": bool(current_user.telegram_chat_id),
        "search_time": current_user.search_time,
    }


@router.patch("/users/me")
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    old_name = current_user.full_name
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.add(current_user)

    # Se alterou o nome completo, regenera variações automáticas
    if data.full_name and data.full_name != old_name:
        result = await db.execute(
            select(NameVariation).where(
                NameVariation.user_id == current_user.id,
                NameVariation.is_auto_generated == True,
            )
        )
        for v in result.scalars().all():
            await db.delete(v)

        new_variations = _generate_name_variations(data.full_name)
        for var in new_variations:
            db.add(NameVariation(user_id=current_user.id, variation=var, is_auto_generated=True))

    return {"message": "Perfil atualizado com sucesso"}


@router.post("/users/me/onboarding-complete")
async def complete_onboarding(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    current_user.onboarding_done = True
    db.add(current_user)
    return {"message": "Onboarding concluído"}


# ─────────────────────────────────────────────────────────────
# VARIAÇÕES DE NOME
# ─────────────────────────────────────────────────────────────

@router.get("/users/me/variations")
async def get_variations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NameVariation)
        .where(NameVariation.user_id == current_user.id)
        .order_by(NameVariation.created_at)
    )
    variations = result.scalars().all()
    return [{"id": v.id, "variation": v.variation, "is_active": v.is_active} for v in variations]


@router.post("/users/me/variations", status_code=201)
async def add_variation(
    data: VariationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    variation = NameVariation(
        user_id=current_user.id,
        variation=data.variation,
        is_auto_generated=False,
    )
    db.add(variation)
    return {"message": "Variação adicionada", "variation": data.variation}


@router.delete("/users/me/variations/{variation_id}")
async def delete_variation(
    variation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(NameVariation).where(
            NameVariation.id == variation_id,
            NameVariation.user_id == current_user.id,
        )
    )
    variation = result.scalar_one_or_none()
    if not variation:
        raise HTTPException(status_code=404, detail="Variação não encontrada")
    await db.delete(variation)
    return {"message": "Variação removida"}


@router.post("/users/me/variations/regenerate")
async def regenerate_variations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove variações automáticas e gera novas com base no nome atual."""
    # Remove automáticas existentes
    result = await db.execute(
        select(NameVariation).where(
            NameVariation.user_id == current_user.id,
            NameVariation.is_auto_generated == True,
        )
    )
    for v in result.scalars().all():
        await db.delete(v)

    # Gera novas
    new_variations = _generate_name_variations(current_user.full_name)
    for var in new_variations:
        db.add(NameVariation(user_id=current_user.id, variation=var, is_auto_generated=True))

    return {"message": f"{len(new_variations)} variações geradas", "variations": new_variations}


# ─────────────────────────────────────────────────────────────
# CONCURSOS
# ─────────────────────────────────────────────────────────────

@router.get("/competitions")
async def list_competitions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competition)
        .where(Competition.user_id == current_user.id)
        .order_by(Competition.created_at.desc())
    )
    comps = result.scalars().all()
    return [
        {
            "id": c.id,
            "organ_name": c.organ_name,
            "position": c.position,
            "year": c.year,
            "status": c.status,
            "registration_number": c.registration_number,
            "organizing_body": c.organizing_body,
            "edital_url": c.edital_url,
            "is_active": c.is_active,
        }
        for c in comps
    ]


@router.post("/competitions", status_code=201)
async def create_competition(
    data: CompetitionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    organ = data.organ_name.strip() if data.organ_name else "Novo Concurso"
    pos = data.position.strip() if data.position else "Cargo não especificado"
    yr = data.year if data.year else datetime.now().year

    comp = Competition(
        user_id=current_user.id,
        organ_name=organ,
        position=pos,
        year=yr,
        status=data.status or "waiting_result",
        registration_number=data.registration_number,
        organizing_body=data.organizing_body,
        edital_url=data.edital_url,
        notes=data.notes,
        is_active=data.is_active if data.is_active is not None else True,
    )
    db.add(comp)
    await db.flush()
    return {
        "id": comp.id,
        "organ_name": comp.organ_name,
        "position": comp.position,
        "year": comp.year,
        "status": comp.status,
        "is_active": comp.is_active,
        "message": "Concurso adicionado",
    }


@router.patch("/competitions/{comp_id}")
async def update_competition(
    comp_id: str,
    data: CompetitionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competition).where(
            Competition.id == comp_id,
            Competition.user_id == current_user.id,
        )
    )
    comp = result.scalar_one_or_none()
    if not comp:
        raise HTTPException(status_code=404, detail="Concurso não encontrado")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(comp, field, value)
    db.add(comp)
    return {"message": "Concurso atualizado"}


@router.delete("/competitions/{comp_id}")
async def delete_competition(
    comp_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Competition).where(
            Competition.id == comp_id,
            Competition.user_id == current_user.id,
        )
    )
    comp = result.scalar_one_or_none()
    if not comp:
        raise HTTPException(status_code=404, detail="Concurso não encontrado")
    await db.delete(comp)
    return {"message": "Concurso removido"}


# ─────────────────────────────────────────────────────────────
# PALAVRAS-CHAVE
# ─────────────────────────────────────────────────────────────

@router.get("/keywords")
async def list_keywords(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Keyword)
        .where(Keyword.user_id == current_user.id)
        .order_by(Keyword.priority.desc(), Keyword.word)
    )
    keywords = result.scalars().all()
    return [
        {
            "id": k.id,
            "word": k.word,
            "priority": k.priority,
            "category": k.category,
            "is_active": k.is_active,
            "is_system_default": k.is_system_default,
        }
        for k in keywords
    ]


@router.post("/keywords", status_code=201)
async def create_keyword(
    data: KeywordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    kw = Keyword(user_id=current_user.id, **data.model_dump())
    db.add(kw)
    await db.flush()
    return {"id": kw.id, "message": "Palavra-chave adicionada"}


@router.patch("/keywords/{kw_id}/toggle")
async def toggle_keyword(
    kw_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Keyword).where(
            Keyword.id == kw_id,
            Keyword.user_id == current_user.id,
        )
    )
    kw = result.scalar_one_or_none()
    if not kw:
        raise HTTPException(status_code=404, detail="Palavra não encontrada")
    kw.is_active = not kw.is_active
    db.add(kw)
    return {"is_active": kw.is_active}


@router.delete("/keywords/{kw_id}")
async def delete_keyword(
    kw_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Keyword).where(
            Keyword.id == kw_id,
            Keyword.user_id == current_user.id,
            Keyword.is_system_default == False,  # Não permite excluir padrões
        )
    )
    kw = result.scalar_one_or_none()
    if not kw:
        raise HTTPException(status_code=404, detail="Palavra não encontrada ou protegida")
    await db.delete(kw)
    return {"message": "Palavra-chave removida"}


# ─────────────────────────────────────────────────────────────
# PESQUISA
# ─────────────────────────────────────────────────────────────

@router.post("/search/run")
async def run_search(
    data: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Inicia pesquisa manual por data única ou intervalo de datas (start_date até end_date)."""
    if data.start_date and data.end_date:
        s_date = date.fromisoformat(data.start_date)
        e_date = date.fromisoformat(data.end_date)
        return await _execute_search_range(
            user_id=current_user.id,
            journals=data.journals,
            start_date=s_date,
            end_date=e_date,
            triggered_by="manual",
            custom_term=data.custom_term,
        )

    t_date_str = data.target_date or data.start_date
    target_date = date.fromisoformat(t_date_str) if t_date_str else date.today()

    res = await _execute_search(
        user_id=current_user.id,
        journals=data.journals,
        target_date=target_date,
        triggered_by="manual",
        custom_term=data.custom_term,
    )

    return res or {
        "message": "Pesquisa concluída",
        "journals": data.journals,
        "date": target_date.isoformat(),
        "total_matches": 0,
        "matches": [],
        "duration_seconds": 0,
    }


@router.get("/search/history")
async def get_history(
    page: int = 1,
    limit: int = 20,
    journal: Optional[str] = None,
    only_matches: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna histórico de pesquisas paginado."""
    query = select(SearchRecord).where(SearchRecord.user_id == current_user.id)

    if journal:
        query = query.where(SearchRecord.journal == journal)
    if only_matches:
        query = query.where(SearchRecord.matches_found > 0)

    query = query.order_by(desc(SearchRecord.created_at))
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    records = result.scalars().all()

    return {
        "page": page,
        "limit": limit,
        "records": [
            {
                "id": r.id,
                "journal": r.journal,
                "edition_date": r.edition_date.isoformat() if r.edition_date else None,
                "extraction_method": r.extraction_method,
                "pages_searched": r.pages_searched,
                "matches_found": r.matches_found,
                "duration_seconds": r.duration_seconds,
                "success": r.success,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in records
        ],
    }


@router.get("/search/matches")
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna todos os matches encontrados."""
    result = await db.execute(
        select(SearchMatch, SearchRecord)
        .join(SearchRecord, SearchMatch.search_id == SearchRecord.id)
        .where(SearchMatch.user_id == current_user.id)
        .order_by(desc(SearchMatch.created_at))
        .limit(50)
    )
    rows = result.all()

    return [
        {
            "id": match.id,
            "journal": record.journal,
            "edition_date": record.edition_date.isoformat() if record.edition_date else None,
            "page_number": match.page_number,
            "variation_found": match.variation_found,
            "context_text": match.context_text[:300],
            "keywords_nearby": json.loads(match.keywords_nearby) if match.keywords_nearby else [],
            "relevance_score": match.relevance_score,
            "ai_summary": match.ai_summary,
            "is_reviewed": match.is_reviewed,
            "created_at": match.created_at.isoformat() if match.created_at else None,
        }
        for match, record in rows
    ]


@router.get("/search/matches/{match_id}")
async def get_match_detail(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna detalhes completos de um match."""
    result = await db.execute(
        select(SearchMatch, SearchRecord)
        .join(SearchRecord, SearchMatch.search_id == SearchRecord.id)
        .where(
            SearchMatch.id == match_id,
            SearchMatch.user_id == current_user.id,
        )
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Resultado não encontrado")

    match, record = row
    return {
        "id": match.id,
        "journal": record.journal,
        "edition_date": record.edition_date.isoformat() if record.edition_date else None,
        "source_url": record.source_url,
        "page_number": match.page_number,
        "variation_found": match.variation_found,
        "context_text": match.context_text,
        "keywords_nearby": json.loads(match.keywords_nearby) if match.keywords_nearby else [],
        "relevance_score": match.relevance_score,
        "ai_summary": match.ai_summary,
        "is_reviewed": match.is_reviewed,
    }


@router.patch("/search/matches/{match_id}/reviewed")
async def mark_reviewed(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SearchMatch).where(
            SearchMatch.id == match_id,
            SearchMatch.user_id == current_user.id,
        )
    )
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(status_code=404, detail="Resultado não encontrado")
    match.is_reviewed = True
    db.add(match)
    return {"message": "Marcado como revisado"}


# ─────────────────────────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────────────────────────

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna as estatísticas do dashboard."""

    # Total de pesquisas
    total_searches = await db.scalar(
        select(func.count(SearchRecord.id))
        .where(SearchRecord.user_id == current_user.id)
    ) or 0

    # Total de matches encontrados
    total_matches = await db.scalar(
        select(func.count(SearchMatch.id))
        .where(SearchMatch.user_id == current_user.id)
    ) or 0

    # Último diário analisado
    last_search = await db.scalar(
        select(SearchRecord)
        .where(
            SearchRecord.user_id == current_user.id,
            SearchRecord.success == True,
        )
        .order_by(desc(SearchRecord.created_at))
        .limit(1)
    )

    # Últimos 5 matches
    result = await db.execute(
        select(SearchMatch, SearchRecord)
        .join(SearchRecord, SearchMatch.search_id == SearchRecord.id)
        .where(SearchMatch.user_id == current_user.id)
        .order_by(desc(SearchMatch.created_at))
        .limit(5)
    )
    recent_matches = [
        {
            "id": m.id,
            "journal": r.journal,
            "edition_date": r.edition_date.isoformat() if r.edition_date else None,
            "page_number": m.page_number,
            "variation_found": m.variation_found,
            "context_preview": m.context_text[:150] if m.context_text else "",
            "keywords_nearby": json.loads(m.keywords_nearby) if m.keywords_nearby else [],
        }
        for m, r in result.all()
    ]

    return {
        "total_searches": total_searches,
        "total_matches": total_matches,
        "last_search": {
            "journal": last_search.journal if last_search else None,
            "date": last_search.edition_date.isoformat() if last_search and last_search.edition_date else None,
            "pages": last_search.pages_searched if last_search else 0,
        } if last_search else None,
        "next_search_time": current_user.search_time,
        "recent_matches": recent_matches,
    }


# ─────────────────────────────────────────────────────────────
# TELEGRAM — TESTE DE NOTIFICAÇÃO
# ─────────────────────────────────────────────────────────────

@router.post("/notifications/telegram/test")
async def test_telegram(
    current_user: User = Depends(get_current_user),
):
    """Envia mensagem de teste no Telegram."""
    if not current_user.telegram_bot_token or not current_user.telegram_chat_id:
        raise HTTPException(status_code=400, detail="Telegram não configurado")

    try:
        import httpx
        url = f"https://api.telegram.org/bot{current_user.telegram_bot_token}/sendMessage"
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json={
                "chat_id": current_user.telegram_chat_id,
                "text": "✅ Diário Inteligente conectado com sucesso!\n\nVocê receberá alertas aqui quando seu nome for encontrado.",
                "parse_mode": "HTML",
            })
        if response.status_code == 200:
            return {"success": True, "message": "Mensagem enviada!"}
        else:
            raise HTTPException(status_code=400, detail="Erro ao enviar. Verifique o token e o Chat ID.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ─────────────────────────────────────────────────────────────
# FUNÇÕES AUXILIARES
# ─────────────────────────────────────────────────────────────

def _generate_name_variations(full_name: str) -> list[str]:
    """Gera variações automáticas do nome completo."""
    name = full_name.strip()
    parts = name.split()
    variations = set()

    # Nome completo
    variations.add(name)
    variations.add(name.upper())

    if len(parts) >= 2:
        # Primeiro + último
        variations.add(f"{parts[0]} {parts[-1]}")
        variations.add(f"{parts[0].upper()} {parts[-1].upper()}")

        # Apenas primeiro nome
        variations.add(parts[0])
        variations.add(parts[0].upper())

        # Sem o primeiro nome (sobrenomes)
        sobrenomes = " ".join(parts[1:])
        variations.add(sobrenomes)
        variations.add(sobrenomes.upper())

    # Remove variações muito curtas
    variations = {v for v in variations if len(v) >= 4}

    return list(variations)


async def _execute_search(
    user_id: str,
    journals: list[str],
    target_date: date,
    triggered_by: str = "scheduler",
    custom_term: str | None = None,
):
    """
    Executa a pesquisa em background.
    Salva resultados no banco e envia notificações.
    """
    import time
    from database import AsyncSessionLocal
    from scraper import DiarioOrchestrator

    async with AsyncSessionLocal() as db:
        try:
            # Busca dados do usuário
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                return

            if custom_term and custom_term.strip():
                term = custom_term.strip()
                variations = [term] + _generate_name_variations(term)
            else:
                # Busca variações ativas
                vars_result = await db.execute(
                    select(NameVariation).where(
                        NameVariation.user_id == user_id,
                        NameVariation.is_active == True,
                    )
                )
                variations = [v.variation for v in vars_result.scalars().all()]
                if user.full_name and user.full_name not in variations:
                    variations.insert(0, user.full_name)
                if not variations and user.full_name:
                    variations = _generate_name_variations(user.full_name)

            # Busca palavras-chave ativas
            kw_result = await db.execute(
                select(Keyword).where(
                    Keyword.user_id == user_id,
                    Keyword.is_active == True,
                )
            )
            keywords = [k.word for k in kw_result.scalars().all()]

            if not variations:
                print(f"[SEARCH] Usuário {user_id} sem variações de nome configuradas")
                return

            # Executa scraping
            start = time.time()
            orchestrator = DiarioOrchestrator()
            search_result = await orchestrator.run(
                journals=journals,
                name_variations=variations,
                keywords=keywords,
                target_date=target_date,
            )
            duration = time.time() - start

            # Salva registros no banco
            all_matches = []
            for journal_result in search_result["journals_searched"]:
                record = SearchRecord(
                    user_id=user_id,
                    journal=journal_result["journal"],
                    edition_date=datetime.combine(target_date, datetime.min.time()),
                    source_url=journal_result.get("source_url", ""),
                    extraction_method=journal_result.get("extraction_method", ""),
                    pages_searched=journal_result.get("total_chars", 0) // 2000 or 1,
                    total_chars=journal_result.get("total_chars", 0),
                    matches_found=journal_result["matches_found"],
                    duration_seconds=round(duration, 2),
                    success=True,
                    triggered_by=triggered_by,
                )
                db.add(record)
                await db.flush()

                # Salva cada match
                for match_data in journal_result["matches"]:
                    match = SearchMatch(
                        search_id=record.id,
                        user_id=user_id,
                        variation_found=match_data["variation_found"],
                        page_number=match_data.get("page_number"),
                        context_text=match_data["context"],
                        keywords_nearby=json.dumps(match_data.get("keywords_nearby", [])),
                        relevance_score=match_data.get("score", 1.0),
                    )
                    db.add(match)
                    await db.flush()
                    all_matches.append({
                        "id": match.id,
                        "journal": journal_result["journal"],
                        "page_number": match.page_number,
                        "variation_found": match.variation_found,
                        "context_text": match.context_text[:300],
                        "keywords_nearby": match_data.get("keywords_nearby", []),
                        "relevance_score": match.relevance_score,
                    })

                    # Envia notificação Telegram se configurado
                    if user.telegram_notifications and user.telegram_bot_token and user.telegram_chat_id:
                        await _send_telegram_alert(user, match_data, journal_result["journal"], target_date)

            await db.commit()
            print(f"[SEARCH] Concluído: {search_result['total_matches']} match(es) em {duration:.1f}s")
            return {
                "message": "Pesquisa concluída",
                "journals": journals,
                "date": target_date.isoformat(),
                "total_matches": len(all_matches),
                "matches": all_matches,
                "duration_seconds": round(duration, 2),
            }

        except Exception as e:
            await db.rollback()
            print(f"[SEARCH] Erro: {e}")
            import traceback
            traceback.print_exc()
            return {
                "message": f"Erro na pesquisa: {str(e)}",
                "journals": journals,
                "date": target_date.isoformat(),
                "total_matches": 0,
                "matches": [],
                "errors": [f"{target_date.strftime('%d/%m/%Y')}: {str(e)}"],
                "duration_seconds": 0,
            }


async def _execute_search_range(
    user_id: str,
    journals: list[str],
    start_date: date,
    end_date: date,
    triggered_by: str = "manual",
    custom_term: str | None = None,
):
    """
    Executa a pesquisa em um intervalo de datas [start_date, end_date].
    Itera pelas edições e consolida os resultados.
    """
    from datetime import timedelta

    if start_date > end_date:
        start_date, end_date = end_date, start_date

    # Limita intervalo a 365 dias
    max_days = 365
    total_days = (end_date - start_date).days + 1
    if total_days > max_days:
        start_date = end_date - timedelta(days=max_days - 1)

    cur = start_date
    date_list = []
    while cur <= end_date:
        date_list.append(cur)
        cur += timedelta(days=1)

    all_matches_accumulated = []
    accumulated_errors = []
    start_time = time.time()

    # Processa datas em lotes reduzidos de 2 para estabilidade de concorrência
    batch_size = 2
    for i in range(0, len(date_list), batch_size):
        batch_dates = date_list[i:i+batch_size]
        tasks = [
            _execute_search(
                user_id=user_id,
                journals=journals,
                target_date=d,
                triggered_by=triggered_by,
                custom_term=custom_term,
            )
            for d in batch_dates
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for d, res in zip(batch_dates, results):
            if isinstance(res, Exception):
                accumulated_errors.append(f"{d.strftime('%d/%m/%Y')}: {str(res)}")
            elif isinstance(res, dict):
                if res.get("total_matches", 0) > 0:
                    all_matches_accumulated.extend(res.get("matches", []))
                if res.get("errors"):
                    accumulated_errors.extend(res.get("errors"))
                elif "message" in res and res["message"].startswith("Erro"):
                    accumulated_errors.append(f"{d.strftime('%d/%m/%Y')}: {res['message']}")

    duration = time.time() - start_time
    return {
        "message": f"Pesquisa concluída para o período {start_date.strftime('%d/%m/%Y')} até {end_date.strftime('%d/%m/%Y')}",
        "journals": journals,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "total_matches": len(all_matches_accumulated),
        "matches": all_matches_accumulated,
        "errors": accumulated_errors if accumulated_errors else None,
        "duration_seconds": round(duration, 2),
    }


async def _send_telegram_alert(user: User, match: dict, journal: str, target_date: date):
    """Envia alerta de match pelo Telegram."""
    import httpx

    date_str = target_date.strftime("%d/%m/%Y")
    keywords = ", ".join(match.get("keywords_nearby", []))
    context_preview = match["context"][:300]

    message = (
        f"🚨 <b>RESULTADO ENCONTRADO!</b>\n\n"
        f"📰 <b>Diário:</b> {journal}\n"
        f"📅 <b>Data:</b> {date_str}\n"
        f"📄 <b>Página:</b> {match.get('page_number', '?')}\n"
        f"🔍 <b>Variação:</b> {match['variation_found']}\n"
    )

    if keywords:
        message += f"🏷 <b>Palavras-chave:</b> {keywords}\n"

    message += f"\n<i>{context_preview}...</i>"

    try:
        url = f"https://api.telegram.org/bot{user.telegram_bot_token}/sendMessage"
        async with httpx.AsyncClient(timeout=10) as client:
            await client.post(url, json={
                "chat_id": user.telegram_chat_id,
                "text": message,
                "parse_mode": "HTML",
            })
    except Exception as e:
        print(f"[TELEGRAM] Falha ao enviar: {e}")
