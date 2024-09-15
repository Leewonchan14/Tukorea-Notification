from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

from src.crawler import Crawler

Base = declarative_base()


class Article(Base):
    __tablename__ = 'article'

    id = Column(Integer, primary_key=True)
    url = Column(Text)
    writer = Column(String(100))
    title = Column(String(200))

    created_at = Column(DateTime, server_default=func.now())

    def to_message(self):
        return f"[{self.title}]({self.url}) \n 작성기관: {self.writer}"


class ArticleElement:
    @staticmethod
    def get_article_elements(crawler: Crawler):
        driver = crawler.get_driver()

        driver.get("https://www.tukorea.ac.kr/tukorea/7607/subview.do")

        new_articles = driver.find_elements(By.XPATH, "//a[.//span[contains(@class, 'new')]]")

        return [ArticleElement(new_article) for new_article in new_articles]

    def __init__(self, article: WebElement, **kwargs):
        super().__init__(**kwargs)
        self.soup_element = BeautifulSoup(article.get_attribute('outerHTML'), 'html.parser')
        self.web_element = article

    def get_title(self):
        return self.soup_element.find('strong').text.strip()

    def get_id(self):
        return self.soup_element.find('dl', class_='num').find('dd').text.strip()

    def get_writer(self):
        return self.soup_element.find('dl', class_='writer').find('dd').text.strip()

    def get_url(self, crawler: Crawler):
        driver = crawler.get_driver()

        driver.execute_script("arguments[0].scrollIntoView();", self.web_element)
        driver.execute_script("arguments[0].click();", self.web_element)

        current_url = driver.current_url.strip()

        # 뒤로가기
        driver.back()

        return current_url
