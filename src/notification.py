import os

from discord_webhook import DiscordWebhook

ARTICLE_WEBHOOK_URL = os.getenv("ARTICLE_WEBHOOK_URL")
ERROR_WEBHOOK_URL = os.getenv("ERROR_WEBHOOK_URL")


class Notification:
    def send_new_article_message(self, message: str) -> None:
        webhook = DiscordWebhook(url=ARTICLE_WEBHOOK_URL, content=message)
        response = webhook.execute()

        if not response.ok:
            raise response.raise_for_status()

    def send_error_message(self, message: str) -> None:
        webhook = DiscordWebhook(url=ERROR_WEBHOOK_URL, content=message)
        response = webhook.execute()
        if not response.ok:
            print(response.text)
