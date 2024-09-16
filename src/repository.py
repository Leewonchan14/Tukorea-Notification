from sqlalchemy.orm import Session

from src.crawler import Crawler
from src.model import Article, ArticleElement


def find_by_id(db: Session, article_id: int):
    return db.query(Article).filter(Article.id.is_(article_id)).first()


def save(db: Session, crawler: Crawler, article_element: ArticleElement):
    db_article = article_element.to_article(crawler)
    db.add(db_article)
    db.commit()

    return db_article
