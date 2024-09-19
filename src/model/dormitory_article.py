from bs4 import BeautifulSoup
from selenium.webdriver.remote.webelement import WebElement
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from src.crawler import Crawler
from src.model.config import Base


class DormitoryArticle(Base):
    __tablename__ = 'dormitory_article'

    id = Column(Integer, primary_key=True)
    url = Column(Text)
    writer = Column(String(100))
    title = Column(String(200))

    # yyyy.mm.dd
    write_at = Column(String(30))

    created_at = Column(DateTime, server_default=func.now())

    def to_message(self):
        return (
            f"""[({self.write_at}){self.title}]({self.url})\n"""
            f"""작성기관: {self.writer}"""
        )


class DormitoryArticleElement:
    @staticmethod
    def get_new_dormitory_article_ids(crawler: Crawler) -> list[str]:
        new_dormitory_articles = crawler.find_elements_by_xpath(
            "https://www.tukorea.ac.kr/dorm/2630/subview.do?"
            "enc=Zm5jdDF8QEB8JTJGYmJzJTJGZG9ybSUyRjU4OSUyRmFydGNsTGlzdC5kbyUzRg%3D%3D",
            "//a[.//span[contains(@class, 'new')]]"
        )

        return [
            DormitoryArticleElement(new_dormitory_article).get_id() for new_dormitory_article in new_dormitory_articles
        ]

    @staticmethod
    def get_dormitory_article_by_id(crawler: Crawler, dormitory_article_id: int) -> 'DormitoryArticleElement':
        dormitory_article = crawler.find_element_by_xpath(
            "https://www.tukorea.ac.kr/dorm/2630/subview.do?"
            "enc=Zm5jdDF8QEB8JTJGYmJzJTJGZG9ybSUyRjU4OSUyRmFydGNsTGlzdC5kbyUzRg%3D%3D",

            "//a[.//span[contains(@class, 'new')] and .//dl[contains(@class, 'num')]"
            f"//dd[text()='{dormitory_article_id}']]"
        )

        return DormitoryArticleElement(dormitory_article)

    def __init__(self, dormitory_article: WebElement, **kwargs):
        super().__init__(**kwargs)
        self.soup_element = BeautifulSoup(dormitory_article.get_attribute('outerHTML'), 'html.parser')
        self.web_element = dormitory_article

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

    def to_dormitory_article(self, crawler: Crawler):
        return DormitoryArticle(
            id=int(self.get_id()),
            writer=self.get_writer(),
            write_at=self.get_write_at(),
            title=self.get_title(),
            url=self.get_url(crawler)
        )
