import os

from discord_webhook import DiscordWebhook

ARTICLE_WEBHOOK_URL = os.getenv("ARTICLE_WEBHOOK_URL")
DORMITORY_ARTICLE_WEBHOOK_URL = os.getenv("DORMITORY_ARTICLE_WEBHOOK_URL")
SCHOOL_MEAL_MENU_WEBHOOK_URL = os.getenv("SCHOOL_MEAL_MENU_WEBHOOK_URL")
ERROR_WEBHOOK_URL = os.getenv("ERROR_WEBHOOK_URL")
SHUTTLE_BUS_WEBHOOK_URL = os.getenv("SHUTTLE_BUS_WEBHOOK_URL")


class Notification:
    @staticmethod
    def send_text_message_by_webhook(web_hook_url: str, message: str) -> None:
        webhook = DiscordWebhook(url=web_hook_url, content=message)
        response = webhook.execute()

        if not response.ok:
            raise response.raise_for_status()

    def send_new_article_message(self, message: str) -> None:
        self.send_text_message_by_webhook(ARTICLE_WEBHOOK_URL, message)

    def send_new_dormitory_article_message(self, message: str) -> None:
        self.send_text_message_by_webhook(DORMITORY_ARTICLE_WEBHOOK_URL, message)

    def send_new_school_meal_menu_message(self, message: str) -> None:
        self.send_text_message_by_webhook(SCHOOL_MEAL_MENU_WEBHOOK_URL, message)

    def send_new_shuttle_bus_message(self, message: str) -> None:
        self.send_text_message_by_webhook(SHUTTLE_BUS_WEBHOOK_URL, message)

    def send_error_message(self, message: str) -> None:
        self.send_text_message_by_webhook(ERROR_WEBHOOK_URL, message)
