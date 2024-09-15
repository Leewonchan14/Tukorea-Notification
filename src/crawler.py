from selenium import webdriver


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

    def get_driver(self):
        return self.driver

    def quit(self):
        self.driver.quit()
