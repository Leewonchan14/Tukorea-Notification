import logging

import uvicorn
from fastapi import FastAPI
from fastapi_utils.tasks import repeat_every
from sqlalchemy.orm import Session

import src.repository as crud
from src.connection import engine, SessionLocal
from src.crawler import Crawler
from src.error import ErrorManager
from src.model import Base, ArticleElement
from src.notification import Notification

logger = logging.getLogger('uvicorn.error')

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.on_event("startup")
@repeat_every(seconds=30, wait_first=False)  # 30분마다 실행
def repeat_task():
    db: Session = SessionLocal()
    crawler: Crawler = Crawler()
    notification: Notification = Notification()
    error_manager: ErrorManager = ErrorManager(notification)

    try:
        # 새로운 공지사항들의 Id를 가져온다.
        article_element_ids = ArticleElement.get_new_article_ids(crawler)

        for article_element_id in article_element_ids:
            # 만약 데이터베이스에 이미 존재하는 공지사항이라면 넘어간다.
            if crud.find_by_id(db, article_element_id):
                logger.debug(f"이미 저장된 공지사항입니다: {article_element_id}")
                continue

            new_article_element = ArticleElement.get_article_by_id(crawler, article_element_id)

            # 새로운 공지사항을 저장한다.
            db_article = crud.save(db, crawler, new_article_element)

            # 새로운 아티클이 저장되었음을 디스코드에 알린다.
            notification.send_new_article_message(db_article.to_message())
            logger.debug(f"새로운 공지사항이 저장되었습니다: {db_article.title}")

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
