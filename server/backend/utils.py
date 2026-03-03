import threading
import resend
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

class EmailThread(threading.Thread):
    def __init__(self, email_message):
        self.email_message = email_message
        threading.Thread.__init__(self)

    def run(self):
        try:
            resend.api_key = getattr(settings, "RESEND_API_KEY", "")
            
            html_content = ""
            if isinstance(self.email_message, EmailMultiAlternatives):
                for alt_content, mimetype in getattr(self.email_message, 'alternatives', []):
                    if mimetype == "text/html":
                        html_content = alt_content
                        break

            # Resend strict requirement: Sender domain MUST be the verified domain
            from_email = self.email_message.from_email
            if "gmail.com" in from_email:
                from_email = "Mekaro Store <noreply@mekaro.in>"

            params = {
                "from": from_email,
                "to": self.email_message.to,
                "subject": self.email_message.subject,
            }
            if html_content:
                params["html"] = html_content
            else:
                params["text"] = self.email_message.body
            
            response = resend.Emails.send(params)
            print(f"Resend email dispatched. ID: {response.get('id') if isinstance(response, dict) else response}")

        except Exception as e:
            # unique error logging if needed
            print(f"Error sending email in background via Resend API: {e}")

def send_email_async(email_message):
    """
    Sends an email message via the Resend API in a separate thread.
    """
    EmailThread(email_message).start()
