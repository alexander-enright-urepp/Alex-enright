import smtplib, ssl, random
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_TO = "alexenrightt@gmail.com"
EMAIL_FROM = "alexenrightt@gmail.com"
EMAIL_PASSWORD = "xvav dpiv iwwd ugnn"

PROMPTS = [
    "What went well today? Name one win.",
    "Did you stay under 2,000 calories?",
    "Did you hit 150g protein today?",
    "How did you practice saving money?",
    "What are you grateful for today?",
    "Rate your discipline 1-10. Why?"
]

def send():
    today = datetime.now().strftime('%Y-%m-%d')
    random.seed(hash(today))
    prompt = random.choice(PROMPTS)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Evening Reflection - {datetime.now().strftime('%A, %B %d')}"
    msg["From"] = EMAIL_FROM
    msg["To"] = EMAIL_TO
    html = f'''<html>
    <body style="font-family:sans-serif;padding:20px;background:#1a1a2e;">
    <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:20px;">
    <h1 style="color:#764ba2;text-align:center;">🌙 Evening Reflection</h1>
    <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin:20px 0;">
    <p style="font-size:20px;color:#333;text-align:center;">{prompt}</p>
    </div>
    <h3 style="color:#2E7D32;">Quick Check:</h3>
    <p>✓ Under 2,000 cal?</p>
    <p>✓ 150g protein?</p>
    <p>✓ Saved money?</p>
    <hr>
    <p style="color:#999;text-align:center;">- Agent Alex 🤖 | 9:30 PM</p>
    </div></body></html>'''
    msg.attach(MIMEText(html, "html"))
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as s:
        s.login(EMAIL_FROM, EMAIL_PASSWORD)
        s.send_message(msg)
    print("Evening reflection sent")
    # Siri speaks
    import subprocess
    subprocess.run(["say", "-v", "Samantha", "Good evening. Your reflection prompt has been sent. Take a moment to review your day."])

if __name__ == "__main__":
    send()
