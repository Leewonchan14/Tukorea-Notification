from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
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
        driver = crawler.get_driver()
        driver.get("https://ibook.kpu.ac.kr/Viewer/menu02")

        # 이미지 태그가 나올때 까지 기다린다.
        image_elements: WebElement
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//img[contains(@class, 'pageImage')]"))
        )

        return [
            SchoolMealMenuElement(x) for x in
            driver.find_elements(By.XPATH, "//img[contains(@class, 'pageImage')]")
        ]

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
