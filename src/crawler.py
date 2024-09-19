from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote import webdriver as remote_webdriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class Crawler:
    def __init__(self):
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')  # 헤드리스 모드
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--window-size=1920,1080')
        self.driver = webdriver.Remote(
            command_executor='http://selenium:4444/wd/hub',
            options=options,
        )

    def find_elements_by_xpath(self, url: str, xpath: str) -> list[remote_webdriver]:
        self.driver.get(url)
        self.wait_driver_until_show(xpath)
        return self.driver.find_elements(By.XPATH, xpath)

    def find_element_by_xpath(self, url: str, xpath: str) -> remote_webdriver:
        self.driver.get(url)
        self.wait_driver_until_show(xpath)

        return self.driver.find_element(By.XPATH, xpath)

    # 웹 요소 클릭
    def click_element(self, element: WebElement):
        self.scroll_into_view(element)
        self.driver.execute_script("arguments[0].click();", element)

    # xpath의 element가 나타날 때까지 기다림 (최대 3초)
    def wait_driver_until_show(self, xpath: str):
        WebDriverWait(self.driver, 3).until(
            EC.visibility_of_element_located((By.XPATH, xpath))
        )

    # 상호작용 가능하게 요소로 스크롤
    def scroll_into_view(self, element: WebElement):
        self.driver.execute_script("arguments[0].scrollIntoView();", element)

    def get_current_url(self) -> str:
        return self.driver.current_url.strip()

    def quit(self):
        self.driver.quit()
