#!/usr/bin/env python3
import smtplib
import os
from email.mime.text import MIMEText

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "alexenrightt@gmail.com"

config_path = os.path.expanduser("~/.openclaw/workspace/email_config.txt")
with open(config_path, 'r') as f:
    password = f.read().strip().replace(' ', '')

msg = MIMEText("Test email - if you see this, basic sending works!")
msg['From'] = SENDER_EMAIL
msg['To'] = SENDER_EMAIL
msg['Subject'] = "Test - " + __import__('datetime').datetime.now().strftime("%H:%M:%S")

server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
server.starttls()
server.login(SENDER_EMAIL, password)
server.send_message(msg)
server.quit()
print("✅ Simple test sent!")
