from django.core.mail import send_mail

send_mail(
    'Test Email from MEKARO',
    'This is a test email',
    'hhariharan489@gmail.com',
    ['hhariharan489@gmail.com'],
    fail_silently=False,
)
