from django.core.mail import send_mail

send_mail(
    "Bakery Attendance Test",
    "This is a test email from the Bakery System.",
    None,
    ["alipraise60@gmail.com"],
    fail_silently=False,
)

print("Email Sent Successfully")