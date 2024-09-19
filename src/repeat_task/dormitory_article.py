import logging

from sqlalchemy.orm import Session

import src.repository.dormitory_article as crud
from src.crawler import Crawler
from src.model.dormitory_article import DormitoryArticleElement
from src.notification import Notification


def dormitory_article_repeat_task(
        logger: logging.Logger,
        db: Session,
        crawler: Crawler,
        notification: Notification,
):
    # 새로운 공지사항들의 Id를 가져온다.
    dormitory_article_element_ids = DormitoryArticleElement.get_new_dormitory_article_ids(crawler)

    logger.debug(f"크롤링한 생활관 공지사항 id : {str(dormitory_article_element_ids)}")

    # 새로운 공지사항들의 Id를 역순으로 정렬한다. (가장 아래의 공지사항부터 처리하기 위함)
    dormitory_article_element_ids.reverse()

    for dormitory_article_element_id in dormitory_article_element_ids:
        # 만약 데이터베이스에 이미 존재하는 공지사항이라면 넘어간다.
        if crud.find_by_id(db, int(dormitory_article_element_id)):
            continue

        new_dormitory_article_element = (
            DormitoryArticleElement.get_dormitory_article_by_id(
                crawler,
                int(dormitory_article_element_id)
            )
        )

        # 새로운 공지사항을 저장한다.
        db_dormitory_article = crud.save(db, crawler, new_dormitory_article_element)

        # 새로운 아티클이 저장되었음을 디스코드에 알린다.
        notification.send_new_dormitory_article_message(db_dormitory_article.to_message())
        logger.debug(f"새로운 생활관 공지사항이 저장되었습니다: {db_dormitory_article.title}")
