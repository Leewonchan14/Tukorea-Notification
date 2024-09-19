from bs4 import BeautifulSoup
from selenium.webdriver.remote.webelement import WebElement
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func

from src.crawler import Crawler
from src.model.config import Base


class SchoolMealMenu(Base):
    __tablename__ = 'school_meal_menu'

    url = Column(Text, primary_key=True)
    # 장소
    place = Column(String(30))

    created_at = Column(DateTime, server_default=func.now())

    def to_message(self) -> str:
        return (
            f"""{self.place}\n"""
            f"""{self.url}"""
        )


class SchoolMealMenuElement:
    @staticmethod
    def get_school_meal_menu_img_elements(crawler: Crawler) -> list['SchoolMealMenuElement']:
        image_elements: list[WebElement] = crawler.find_elements_by_xpath(
            "https://ibook.kpu.ac.kr/Viewer/menu02",
            "//img[contains(@class, 'pageImage')]"
        )

        return [SchoolMealMenuElement(x) for x in image_elements]

    def __init__(self, img_element: WebElement, **kwargs):
        super().__init__(**kwargs)
        self.soup_element = BeautifulSoup(img_element.get_attribute('outerHTML'), 'html.parser')
        self.web_element = img_element

    def get_place(self) -> str:
        return self.web_element.get_attribute('aria-label').rsplit('\n')[0]

    def get_url(self) -> str:
        return self.web_element.get_attribute('src').rstrip()

    def to_school_meal_menu(self):
        return SchoolMealMenu(
            place=self.get_place(),
            url=self.get_url()
        )
