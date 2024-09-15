import uvicorn
from fastapi import FastAPI
from fastapi_utils.tasks import repeat_every
from sqlalchemy.orm import Session

import src.repository as crud
from src.connection import database, engine, SessionLocal
from src.crawler import Crawler
from src.error import ErrorManager
from src.model import Base, ArticleElement
from src.notification import Notification

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.on_event("startup")
@repeat_every(seconds=30 * 60, wait_first=False)  # 30분마다 실행
def startup_event() -> None:
    db: Session = SessionLocal()
    crawler: Crawler = Crawler()
    notification = Notification()
    error_manager = ErrorManager(notification)

    try:
        # 새로운 공지사항들을 가져온다.
        article_elements = ArticleElement.get_article_elements(crawler)

        for article_element in article_elements:
            # 만약 데이터베이스에 이미 존재하는 공지사항이라면 넘어간다.
            if crud.find_by_id(db, article_element.get_id()):
                print(f"이미 저장된 공지사항입니다: {article_element.get_id()}")
                continue

            # 새로운 공지사항을 저장한다.
            db_article = crud.save(db, crawler, article_element)

            # 새로운 아티클이 저장되었음을 디스코드에 알린다.
            notification.send_new_article_message(db_article.to_message())
            print(f"새로운 공지사항이 저장되었습니다: {db_article.title}")

    except Exception as error:
        print("에러 입니다.")
        error_manager.increase_error_count(error)
    finally:
        db.close()
        crawler.quit()


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
