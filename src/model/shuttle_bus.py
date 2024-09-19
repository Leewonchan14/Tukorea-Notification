from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.sql import func

from src.crawler import Crawler
from src.model.config import Base


class ShuttleBus(Base):
    __tablename__ = 'shuttle_bus'

    url = Column(Text, primary_key=True)
    # 장소
    place = Column(String(100))

    created_at = Column(DateTime, server_default=func.now())

    def to_message(self) -> str:
        return (
            f"""{self.place}\n"""
            f"""{self.url}"""
        )


class ShuttleBusElement:
    @staticmethod
    def get_shuttle_bus_img_elements(crawler: Crawler) -> list['ShuttleBusElement']:
        image_elements = crawler.find_elements_by_xpath(
            "https://ibook.kpu.ac.kr/Viewer/bus01",
            "//img[contains(@class, 'pageImage')]"
        )

        return [ShuttleBusElement(x) for x in image_elements]

    def __init__(self, img_element: WebElement, **kwargs):
        super().__init__(**kwargs)
        self.soup_element = BeautifulSoup(img_element.get_attribute('outerHTML'), 'html.parser')
        self.web_element = img_element

    def get_place(self) -> str:
        return self.web_element.get_attribute('aria-label').rsplit('\n')[2].strip()

    def get_url(self) -> str:
        return self.web_element.get_attribute('src').rstrip()

    def to_shuttle_bus(self):
        return ShuttleBus(
            place=self.get_place(),
            url=self.get_url()
        )
