import logging

import uvicorn
from fastapi import FastAPI
from fastapi_utils.tasks import repeat_every
from sqlalchemy.orm import Session

from src.connection import SessionLocal
from src.connection import engine
from src.crawler import Crawler
from src.error import ErrorManager
from src.model.config import Base
from src.notification import Notification
from src.repeat_task.article import article_repeat_task
from src.repeat_task.dormitory_article import dormitory_article_repeat_task
from src.repeat_task.school_meal_menu import school_meal_menu_repeat_task
from src.repeat_task.shuttle_bus import shuttle_bus_repeat_task

logger = logging.getLogger('uvicorn.error')

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.on_event("startup")
@repeat_every(seconds=60 * 5, wait_first=False)  # 5분마다 실행
def repeat_task():
    db: Session = SessionLocal()
    crawler: Crawler = Crawler(logger)
    notification: Notification = Notification()
    error_manager: ErrorManager = ErrorManager(notification)

    try:
        # 공지사항
        article_repeat_task(
            logger, db, crawler, notification
        )

        # 생활관 공지사항
        dormitory_article_repeat_task(
            logger, db, crawler, notification
        )

        # 학식 메뉴
        school_meal_menu_repeat_task(
            logger, db, crawler, notification
        )

        # 셔틀 시간표
        shuttle_bus_repeat_task(
            logger, db, crawler, notification
        )

    except Exception as error:
        logger.debug("에러 입니다.")
        logger.debug(error)
        error_manager.increase_error_count(error)

    finally:
        db.close()
        crawler.quit()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, log_level="debug")
    # uvicorn.run("main:app", host="127.0.0.1", port=8000, log_level="debug", reload=True)
