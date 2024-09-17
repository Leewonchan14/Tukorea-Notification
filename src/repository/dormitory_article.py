from sqlalchemy.orm import Session

from src.crawler import Crawler
from src.model.dormitory_article import DormitoryArticle, DormitoryArticleElement


def find_by_id(db: Session, dormitory_article_id: int):
    return db.query(DormitoryArticle).filter(DormitoryArticle.id.is_(dormitory_article_id)).first()


def save(db: Session, crawler: Crawler, dormitory_article_element: DormitoryArticleElement):
    db_dormitory_article = dormitory_article_element.to_dormitory_article(crawler)
    db.add(db_dormitory_article)
    db.commit()

    return db_dormitory_article
