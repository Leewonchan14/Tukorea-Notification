from sqlalchemy.orm import Session

from src.crawler import Crawler
from src.model import Article, ArticleElement


def find_by_id(db: Session, article_id: int):
    return db.query(Article).filter(Article.id == article_id).first()


def save(db: Session, crawler: Crawler, article_element: ArticleElement):
    article_id = article_element.get_id()
    title = article_element.get_title()
    writer = article_element.get_writer()
    url = article_element.get_url(crawler)

    db_article = Article(id=article_id, writer=writer, title=title, url=url)
    db.add(db_article)
    db.commit()

    return db_article
