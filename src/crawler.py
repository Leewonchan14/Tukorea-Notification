from selenium import webdriver


class Crawler:
    def __init__(self):
        options = webdriver.ChromeOptions()
        self.driver = webdriver.Remote(
            command_executor='http://selenium:4444/wd/hub',
            options=options
        )

    def get_driver(self):
        return self.driver

    def quit(self):
        self.driver.quit()
