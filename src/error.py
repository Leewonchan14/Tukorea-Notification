from src.notification import Notification


class ErrorManager:
    error_count = 0

    def __init__(self, notification: Notification):
        self.notification = notification

    def increase_error_count(self, error: Exception):
        self.error_count += 1
        self.notification.send_error_message(f"에러가 발생했습니다. {error}")

        if self.error_count >= 3:
            self.notification.send_error_message(f"세번이상 발생한 오류입니다. {error}")

        return self.error_count
