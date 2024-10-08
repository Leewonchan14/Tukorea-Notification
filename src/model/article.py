from bs4 import BeautifulSoup
from selenium.webdriver.remote.webelement import WebElement
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from src.crawler import Crawler
from src.model.config import Base


class Article(Base):
    __tablename__ = 'article'

    id = Column(Integer, primary_key=True)
    url = Column(Text)
    writer = Column(String(100))
    title = Column(String(200))

    # yyyy.mm.dd
    write_at = Column(String(30))

    created_at = Column(DateTime, server_default=func.now())

    def to_message(self) -> str:
        return (
            f"""[({self.write_at}){self.title}]({self.url})\n"""
            f"""작성기관: {self.writer}"""
        )


class ArticleElement:
    @staticmethod
    def get_new_article_ids(crawler: Crawler) -> list[str]:
        new_articles = crawler.find_elements_by_xpath(
            "https://www.tukorea.ac.kr/tukorea/7607/subview.do",
            "//a[.//span[contains(@class, 'new')]]"
        )

        return [ArticleElement(new_article).get_id() for new_article in new_articles]

    @staticmethod
    def get_article_by_id(crawler: Crawler, article_id: int) -> 'ArticleElement':
        article = crawler.find_element_by_xpath(
            "https://www.tukorea.ac.kr/tukorea/7607/subview.do",
            f"//a[.//span[contains(@class, 'new')] and .//dl[contains(@class, 'num')]//dd[text()='{article_id}']]"
        )

        return ArticleElement(article)

    def __init__(self, article: WebElement, **kwargs):
        super().__init__(**kwargs)
        self.soup_element = BeautifulSoup(article.get_attribute('outerHTML'), 'html.parser')
        self.web_element = article

    def get_title(self) -> str:
        return self.soup_element.find('strong').text.strip()

    def get_id(self) -> str:
        return self.soup_element.find('dl', class_='num').find('dd').text.strip()

    def get_writer(self) -> str:
        return self.soup_element.find('dl', class_='writer').find('dd').text.strip()

    def get_write_at(self) -> str:
        return self.soup_element.find('dl', class_='date').find('dd').text.strip()

    def get_url(self, crawler: Crawler) -> str:
        crawler.click_element(self.web_element)
        return crawler.get_current_url()

    def to_article(self, crawler: Crawler):
        return Article(
            id=int(self.get_id()),
            writer=self.get_writer(),
            write_at=self.get_write_at(),
            title=self.get_title(),
            url=self.get_url(crawler)
        )
