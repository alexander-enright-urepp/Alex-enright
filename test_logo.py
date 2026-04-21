#!/usr/bin/env python3
import smtplib
import os
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "alexenrightt@gmail.com"
LOGO_PATH = os.path.expanduser("~/.openclaw/workspace/logo-small.png")

config_path = os.path.expanduser("~/.openclaw/workspace/email_config.txt")
with open(config_path, 'r') as f:
    password = f.read().strip().replace(' ', '')

# Create message
outer = MIMEMultipart('mixed')
outer['From'] = SENDER_EMAIL
outer['To'] = SENDER_EMAIL
outer['Subject'] = "Test with logo"

# Create body with logo
body = MIMEMultipart('alternative')

with open(LOGO_PATH, 'rb') as img:
    logo_data = base64.b64encode(img.read()).decode()

html = f'''
<html>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="text-align:center;margin-bottom:20px;">
<img src="data:image/png;base64,{logo_data}" style="max-width:150px;">
</div>
<h1>Test with Logo</h1>
<p>If you see your logo above, embedding works!</p>
</body>
</html>
'''

body.attach(MIMEText(html, 'html', 'utf-8'))
outer.attach(body)

server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
server.starttls()
server.login(SENDER_EMAIL, password)
server.send_message(outer)
server.quit()
print("✅ Logo test sent!")
