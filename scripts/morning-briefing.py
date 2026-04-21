import smtplib
import ssl
import requests
import subprocess
import re
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_TO = "alexenrightt@gmail.com"
EMAIL_FROM = "alexenrightt@gmail.com"
EMAIL_PASSWORD = "xvav dpiv iwwd ugnn"

def get_weather():
    try:
        r = requests.get("https://wttr.in/Sacramento,CA?format=%C|%t|%f", timeout=10)
        c, t, f = r.text.strip().split("|")
        return c, t, f
    except:
        return "Sunny", "+65°F", "+65°F"

def get_news():
    news_items = []
    feeds = [
        ("CNN", "http://rss.cnn.com/rss/cnn_topstories.rss"),
        ("BBC", "http://feeds.bbci.co.uk/news/rss.xml")
    ]
    
    for source, url in feeds:
        try:
            r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            items = re.findall(r'<item>.*?<title>(.*?)</title>.*?<link>(.*?)</link>.*?</item>', r.text, re.DOTALL)[:2]
            for title, link in items:
                title = title.replace('<![CDATA[', '').replace(']]>', '').replace('&amp;', '&')[:100]
                link = link.replace('<![CDATA[', '').replace(']]>', '')
                if title and link:
                    news_items.append((source, title, link))
        except:
            continue
    
    return news_items[:3]

def send():
    condition, temp, feels = get_weather()
    news = get_news()
    today = datetime.now().strftime('%A, %B %d')
    
    news_html = "<h2 style='color:#1565C0;'>📰 Top News</h2>"
    if news:
        for source, title, link in news:
            news_html += "<p style='margin:5px 0;'><strong>%s:</strong> %s</p>" % (source, title)
            news_html += "<p style='margin:0 0 10px;'><a href='%s' style='color:#1976D2;font-size:12px;'>Read →</a></p>" % link
    else:
        news_html += "<p style='color:#666;'>News unavailable</p>"
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Morning Briefing - %s" % today
    msg["From"] = EMAIL_FROM
    msg["To"] = EMAIL_TO
    
    html = """<html>
    <body style="font-family:sans-serif;padding:20px;background:#f0f4f8;">
    <div style="max-width:500px;margin:auto;background:white;border-radius:20px;padding:30px;">
    <h1 style="color:#FF6B6B;">☀️ Good Morning!</h1>
    <p><strong>%s</strong></p>
    
    <h2 style="color:#1565C0;">🌤️ Sacramento: %s</h2>
    <p>🌡️ %s (feels like %s)</p>
    
    <hr style="margin:20px 0;">
    %s
    
    <hr style="margin:20px 0;">
    <h2 style="color:#2E7D32;">💪 Health Goals</h2>
    <p>🎯 185 lbs by summer</p>
    <p>🥗 Under 2,000 calories</p>
    <p>💪 150g protein</p>
    
    <h2 style="color:#E65100;">💰 Financial Discipline</h2>
    <p>💵 $800 paycheck - save first!</p>
    <p><em>"Discipline on saving is WHY you work so hard"</em></p>
    
    <hr style="margin:20px 0;">
    <p style="color:#999;">- Agent Alex 🤖 | 6 AM</p>
    </div></body></html>""" % (today, condition, temp, feels, news_html)
    
    msg.attach(MIMEText(html, "html"))
    
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as s:
        s.login(EMAIL_FROM, EMAIL_PASSWORD)
        s.send_message(msg)
    
    subprocess.run(["say", "-v", "Samantha", "Good morning! Your briefing with today's top news has been sent. Have a great day!"])
    print("Morning briefing with news sent!")

if __name__ == "__main__":
    send()
