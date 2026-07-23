"""
scheduler.py — Agendador de pesquisas automáticas

Roda a pesquisa diária automaticamente no horário configurado pelo usuário.
Usa APScheduler com AsyncIO.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from datetime import date
import logging

from database import AsyncSessionLocal, User

logger = logging.getLogger(__name__)

# Instância global do scheduler
scheduler = AsyncIOScheduler(timezone="America/Bahia")


async def _run_for_all_users():
    """
    Executado pelo scheduler.
    Roda a pesquisa para cada usuário ativo com base no horário configurado.
    """
    from routes import _execute_search

    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.is_active == True, User.onboarding_done == True)
        )
        users = result.scalars().all()

    logger.info(f"[SCHEDULER] Iniciando pesquisa para {len(users)} usuário(s)")

    for user in users:
        logger.info(f"[SCHEDULER] Pesquisando para: {user.full_name}")
        await _execute_search(
            user_id=user.id,
            journals=["DOU", "DOBA"],
            target_date=date.today(),
            triggered_by="scheduler",
        )


def setup_scheduler():
    """
    Configura o job que roda a pesquisa diária.
    Por padrão: todo dia às 06:00 (horário de Brasília/Bahia).
    
    Nota: Em uma versão futura, o horário seria lido
    do banco para cada usuário individualmente.
    """
    scheduler.add_job(
        _run_for_all_users,
        trigger=CronTrigger(hour=6, minute=0),
        id="daily_search",
        name="Pesquisa Diária dos Diários Oficiais",
        replace_existing=True,
        misfire_grace_time=3600,  # Tolera até 1h de atraso
    )

    logger.info("[SCHEDULER] Job configurado: pesquisa diária às 06:00 (Bahia)")
    return scheduler
