#!/usr/bin/env python3

import os
import re
import smtplib
import ssl
import subprocess
import sys
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

RESUME_PATH = "/Users/alexanderenright/Desktop/Professional Resume Feb 9th.pdf"
EMAIL_TO = "alexenrightt@gmail.com"
EMAIL_FROM = "alexenrightt@gmail.com"
EMAIL_PASSWORD = "xvav dpiv iwwd ugnn"

JOBS_DIR = Path("/Users/alexanderenright/.openclaw/workspace/jobs")

def extract_resume_text():
    try:
        import pdfplumber
        with pdfplumber.open(RESUME_PATH) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except:
        result = subprocess.run(["pdftotext", "-layout", RESUME_PATH, "-"], capture_output=True, text=True)
        return result.stdout

def extract_keywords(text):
    text_lower = text.lower()
    skills = list(set(re.findall(r'\b(?:python|java|sql|excel|management|analysis|project|budget|policy|data|reporting|communication|leadership|strategic|planning|administrative|operations|customer service|research|evaluation|compliance|coordination|supervision|microsoft office|word|powerpoint|outlook|teams|sharepoint|salesforce)\b', text, re.IGNORECASE)))
    titles = list(set(re.findall(r'\b(?:manager|analyst|coordinator|specialist|director|administrator|officer|assistant|associate|supervisor|lead|technician|representative|advisor|consultant)\b', text, re.IGNORECASE)))
    return {"skills": [s.lower() for s in skills], "titles": [t.lower() for t in titles]}

def scrape_calcareers():
    jobs = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://calcareers.ca.gov/CalHRPublic/Search/Results?locationname=Sacramento", wait_until="domcontentloaded", timeout=30000)
            page.wait_for_load_state("networkidle", timeout=10000)
            page.wait_for_selector("table tbody tr", timeout=15000)
            rows = page.query_selector_all("table tbody tr")
            for row in rows[:30]:
                try:
                    cells = row.query_selector_all("td")
                    if len(cells) >= 4:
                        title_link = cells[0].query_selector("a")
                        if title_link:
                            title = title_link.inner_text().strip()
                            link = title_link.get_attribute("href")
                            dept = cells[1].inner_text().strip() if len(cells) > 1 else "State of California"
                            loc = cells[2].inner_text().strip() if len(cells) > 2 else "Sacramento"
                            if link and not link.startswith("http"):
                                link = f"https://calcareers.ca.gov{link}"
                            jobs.append({"title": title, "department": dept, "location": loc, "link": link})
                except: continue
            browser.close()
    except Exception as e:
        print(f"Scraping error: {e}")
    return jobs

def score_job(job, keywords):
    score = 0
    text = f"{job.get('title', '')} {job.get('department', '')}".lower()
    for title in keywords.get("titles", []):
        if title in text: score += 20
    for skill in keywords.get("skills", []):
        if skill in text: score += 10
    if "downtown" in job.get("location", "").lower(): score += 30
    elif "sacramento" in job.get("location", "").lower(): score += 15
    return score

def save_results(matches, date_str):
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    with open(JOBS_DIR / f"{date_str}.md", "w") as f:
        f.write(f"# CalCareers Matches - {date_str}\n\n**Total:** {len(matches)} jobs\n\n")
        for i, m in enumerate(matches[:15], 1):
            j = m['job']
            f.write(f"## {i}. {j['title']}\n- Dept: {j['department']}\n- Location: {j['location']}\n- Score: {m['score']}/100\n- Link: {j['link']}\n\n")

def send_email(matches, date_str):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Daily CalCareers - {date_str} ({len(matches)} jobs)"
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO
        html = f"<html><body style='font-family: Arial; padding: 20px;'><h2>🏛️ Daily CalCareers Matches</h2><p><strong>{len(matches)} jobs found</strong></p>"
        for i, m in enumerate(matches[:10], 1):
            j = m['job']
            html += f"<div style='background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 8px;'><h3>{i}. {j['title']}</h3><p>{j['department']} | {j['location']}</p><p>Score: <strong>{m['score']}/100</strong></p><a href='{j['link']}'>View & Apply →</a></div>"
        html += "</body></html>"
        msg.attach(MIMEText(html, "html"))
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        print(f"✅ Email sent!")
        return True
    except Exception as e:
        print(f"❌ Email failed: {e}")
        return False

def main():
    print(f"🔍 Starting CalCareers Search...")
    resume = extract_resume_text()
    print(f"✓ Read {len(resume)} chars from resume")
    keywords = extract_keywords(resume)
    print(f"✓ Found {len(keywords['skills'])} skills, {len(keywords['titles'])} titles")
    jobs = scrape_calcareers()
    print(f"✓ Scraped {len(jobs)} jobs")
    matches = sorted([{"job": j, "score": score_job(j, keywords)} for j in jobs if score_job(j, keywords) > 0], key=lambda x: x['score'], reverse=True)
    print(f"✓ {len(matches)} matches above threshold")
    date_str = datetime.now().strftime("%Y-%m-%d")
    save_results(matches, date_str)
    send_email(matches, date_str)
    print("✅ Done!")

if __name__ == "__main__":
    main()
