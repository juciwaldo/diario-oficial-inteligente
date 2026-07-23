"""
main.py — Ponto de entrada da API FastAPI

Inicia o servidor, configura CORS, registra rotas e o agendador.

Para rodar:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from database import create_tables
from routes import router
from scheduler import setup_scheduler, scheduler

# ─────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# LIFESPAN — startup e shutdown
# ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Executado no startup e shutdown da aplicação."""
    # ── STARTUP ──
    logger.info("Iniciando Diário Inteligente API...")

    # Cria tabelas (apenas em desenvolvimento)
    await create_tables()
    logger.info("Banco de dados pronto.")

    # Inicia agendador
    setup_scheduler()
    scheduler.start()
    logger.info("Agendador iniciado. Pesquisa diária às 06:00.")

    yield  # Aplicação rodando

    # ── SHUTDOWN ──
    scheduler.shutdown()
    logger.info("Agendador encerrado.")


# ─────────────────────────────────────────────────────────────
# APP
# ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Diário Inteligente API",
    description="Sistema de monitoramento automático de Diários Oficiais",
    version="1.0.0",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────────────────────
# CORS — permite o frontend (Lovable/Vercel) acessar a API
# ─────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://9540ed17-ccbd-4a63-abc5-6bf36d14ab17.lovableproject.com",
        "https://id-preview--9540ed17-ccbd-4a63-abc5-6bf36d14ab17.lovable.app",
        "https://monitoramentodiariooficial.lovable.app",
    ],
    allow_origin_regex=r"https://.*\.(lovableproject\.com|lovable\.app|trycloudflare\.com|vercel\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# ROTAS
# ─────────────────────────────────────────────────────────────

app.include_router(router)


@app.get("/")
async def root():
    return {
        "system": "Diário Inteligente",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


# ─────────────────────────────────────────────────────────────
# RODAR LOCALMENTE
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
