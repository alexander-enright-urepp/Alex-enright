#!/usr/bin/env python3
import smtplib
import sys
import os
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.audio import MIMEAudio
from email import encoders
from email.header import Header
import re

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "alexenrightt@gmail.com"
LOGO_PATH = os.path.expanduser("~/.openclaw/workspace/logo-small.png")

def send_briefing(recipient, subject, text_file, audio_file, html_file=None):
    config_path = os.path.expanduser("~/.openclaw/workspace/email_config.txt")
    with open(config_path, 'r') as f:
        password = f.read().strip().replace(' ', '')
    
    outer = MIMEMultipart('mixed')
    outer['From'] = SENDER_EMAIL
    outer['To'] = recipient
    outer['Subject'] = Header(subject, 'utf-8')
    
    body = MIMEMultipart('alternative')
    
    with open(text_file, 'r') as f:
        body.attach(MIMEText(f.read(), 'plain', 'utf-8'))
    
    if html_file and os.path.exists(html_file):
        with open(html_file, 'r') as f:
            html_content = f.read()
        
        # Embed logo after <body> tag (handles <body> or <body style="...">)
        if os.path.exists(LOGO_PATH):
            with open(LOGO_PATH, 'rb') as img:
                logo_data = base64.b64encode(img.read()).decode()
            
            logo_html = f'<div style="text-align:center;margin-bottom:20px;"><img src="data:image/png;base64,{logo_data}" alt="Logo" style="max-width:150px;height:auto;"></div>'
            
            # Use regex to find <body> tag with or without attributes
            html_content = re.sub(r'(<body[^>]*>)', r'\1\n' + logo_html, html_content, count=1)
        
        body.attach(MIMEText(html_content, 'html', 'utf-8'))
    
    outer.attach(body)
    
    with open(audio_file, 'rb') as f:
        audio = MIMEAudio(f.read(), 'aiff')
        audio.add_header('Content-Disposition', 'attachment', filename='briefing.aiff')
        encoders.encode_base64(audio)
        outer.attach(audio)
    
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SENDER_EMAIL, password)
    server.send_message(outer)
    server.quit()
    print("✅ Email sent!")

if __name__ == "__main__":
    html_file = sys.argv[5] if len(sys.argv) > 5 else None
    send_briefing(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], html_file)
