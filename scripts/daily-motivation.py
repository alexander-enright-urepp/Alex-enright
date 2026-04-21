import smtplib, ssl, random
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_TO = "alexenrightt@gmail.com"
EMAIL_FROM = "alexenrightt@gmail.com"
EMAIL_PASSWORD = "xvav dpiv iwwd ugnn"

MESSAGES = [
    ("You are great, you are a winner", "Have an amazingly hard working day."),
    ("You have got this", "Today is your day to shine."),
    ("Believe in yourself", "You are capable of incredible things."),
    ("Rise and grind", "Your potential is limitless."),
    ("You are a force of nature", "Nothing can stop you today.")
]

def send():
    today = datetime.now().strftime('%Y-%m-%d')
    random.seed(hash(today))
    headline, body = random.choice(MESSAGES)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Daily Motivation - {datetime.now().strftime('%A, %B %d')}"
    msg["From"] = EMAIL_FROM
    msg["To"] = EMAIL_TO
    html = f'''<html>
    <body style="font-family:sans-serif;padding:20px;background:linear-gradient(135deg,#667eea,#764ba2);">
    <div style="max-width:500px;margin:auto;background:white;padding:40px;border-radius:20px;text-align:center;">
    <h1 style="color:#667eea;">💪 Good Morning!</h1>
    <p style="font-size:24px;color:#333;font-weight:bold;">{headline}</p>
    <p style="font-size:18px;color:#666;">{body}</p>
    <p style="color:#999;margin-top:30px;">- Agent Alex 🤖 | 8 AM</p>
    </div></body></html>'''
    msg.attach(MIMEText(html, "html"))
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as s:
        s.login(EMAIL_FROM, EMAIL_PASSWORD)
        s.send_message(msg)
    print("Motivation sent")
    # Siri speaks
    import subprocess
    subprocess.run(["say", "-v", "Samantha", "Your daily motivation has been sent! You are great, you are a winner. Have an amazing day!"])

if __name__ == "__main__":
    send()
