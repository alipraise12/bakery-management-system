from django.core.management.base import BaseCommand

from api.email_report import (
    send_attendance_report
)


class Command(BaseCommand):

    help = "Send daily bakery report"

    def handle(self, *args, **kwargs):

        send_attendance_report()

        self.stdout.write(
            self.style.SUCCESS(
                "Bakery report sent successfully"
            )
        )