import threading
from django.core.mail import EmailMultiAlternatives

class EmailThread(threading.Thread):
    def __init__(self, email_message):
        self.email_message = email_message
        threading.Thread.__init__(self)

    def run(self):
        try:
            self.email_message.send()
        except Exception as e:
            # unique error logging if needed
            print(f"Error sending email in background: {e}")

def send_email_async(email_message):
    """
    Sends an email message in a separate thread to avoid blocking the main thread.
    """
    EmailThread(email_message).start()
