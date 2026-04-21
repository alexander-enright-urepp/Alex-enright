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

# CONFIG
RESUME_PATH = "/Users/alexanderenright/Desktop/Professional Resume Feb 9th.pdf"
EMAIL_TO = "alexenrightt@gmail.com"
EMAIL_FROM = "alexenrightt@gmail.com"
EMAIL_PASSWORD = "xvav dpiv iwwd ugnn"

JOBS_DIR = Path("/Users/alexanderenright/.openclaw/workspace/jobs")

# Target job titles (entry-level desk jobs)
TARGET_TITLES = [
    "staff service analyst",
    "office technician", 
    "office assistant",
    "administrative assistant",
    "data entry clerk",
    "customer service representative",
    "clerical assistant",
    "receptionist",
    "program technician",
    "accounting assistant",
    "hr assistant",
    "front desk"
]

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
    skills = list(set(re.findall(r'\b(?:excel|word|outlook|office|data entry|customer service|administrative|clerical|typing|filing|scheduling|phones|communication|organization|microsoft|computer|detail|multi-task)\b', text, re.IGNORECASE)))
    return {"skills": [s.lower() for s in skills]}

def is_entry_level(title):
    """Check if job is entry level"""
    title_lower = title.lower()
    entry_keywords = ["entry", "junior", "associate", "i ", "1 ", "level i", "assistant", "clerk", "trainee"]
    senior_keywords = ["senior", "manager", "director", "supervisor", "lead", "principal", "iii", "3 ", "specialist ii"]
    
    # Must have entry keyword AND not have senior keyword
    is_entry = any(kw in title_lower for kw in entry_keywords)
    is_senior = any(kw in title_lower for kw in senior_keywords)
    
    return is_entry and not is_senior

def is_full_time(text):
    """Check if full time"""
    text_lower = text.lower()
    return any(x in text_lower for x in ["full-time", "full time", "40 hours", "fte"])

def score_job(job):
    """Score based on target titles"""
    score = 0
    title = job.get('title', '').lower()
    
    # Exact matches for passed exams (highest priority)
    if "staff service analyst" in title: score += 100
    if "office technician" in title: score += 100
    if "office assistant" in title: score += 100
    
    # Other entry-level matches
    for target in TARGET_TITLES:
        if target in title:
            score += 50
            break
    
    # Location bonus
    loc = job.get('location', '').lower()
    if 'sacramento' in loc: score += 20
    if 'remote' in loc: score += 15
    
    # Entry level bonus
    if is_entry_level(title): score += 30
    
    # Full time bonus
    if is_full_time(title + " " + job.get('description', '')): score += 20
    
    return score

def scrape_calcareers():
    """Scrape CalCareers for Sacramento"""
    print("  🏛️ Checking CalCareers...")
    jobs = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Search specific titles
            search_titles = ["staff+service+analyst", "office+technician", "office+assistant"]
            for search in search_titles:
                url = f"https://calcareers.ca.gov/CalHRPublic/Search/Results?locationname=Sacramento&keywords={search}"
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_load_state("networkidle", timeout=10000)
                
                try:
                    page.wait_for_selector("table tbody tr", timeout=10000)
                    rows = page.query_selector_all("table tbody tr")
                    for row in rows[:20]:
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
                                jobs.append({
                                    "title": title,
                                    "company": dept,
                                    "location": loc,
                                    "link": link,
                                    "source": "CalCareers",
                                    "description": ""
                                })
                except: continue
            
            browser.close()
    except Exception as e:
        print(f"     CalCareers error: {e}")
    
    print(f"     ✓ Found {len(jobs)} state jobs")
    return jobs

def scrape_indeed():
    """Scrape Indeed for Sacramento entry-level"""
    print("  💼 Checking Indeed...")
    jobs = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Entry-level office jobs in Sacramento
            queries = ["entry+level+office", "administrative+assistant", "data+entry", "receptionist"]
            for query in queries:
                url = f"https://www.indeed.com/jobs?q={query}&l=Sacramento%2C+CA&fromage=1"
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_load_state("networkidle", timeout=10000)
                
                try:
                    page.wait_for_selector("[data-testid='jobTitle'], .slider_container, [data-jk]", timeout=10000)
                    cards = page.query_selector_all("[data-testid='jobTitle'], .slider_container")
                    for card in cards[:15]:
                        try:
                            title_elem = card.query_selector("h2 a, [data-testid='jobTitle'] a, a.jcs-JobTitle")
                            if title_elem:
                                title = title_elem.inner_text().strip()
                                link = title_elem.get_attribute("href")
                                company_elem = card.query_selector("[data-testid='company-name'], .companyName")
                                company = company_elem.inner_text().strip() if company_elem else "Unknown"
                                loc_elem = card.query_selector("[data-testid='job-location'], .companyLocation")
                                loc = loc_elem.inner_text().strip() if loc_elem else "Sacramento, CA"
                                
                                if link and not link.startswith("http"):
                                    link = f"https://www.indeed.com{link}"
                                
                                if is_entry_level(title):
                                    jobs.append({
                                        "title": title,
                                        "company": company,
                                        "location": loc,
                                        "link": link,
                                        "source": "Indeed",
                                        "description": ""
                                    })
                        except: continue
                except: continue
            
            browser.close()
    except Exception as e:
        print(f"     Indeed error: {e}")
    
    print(f"     ✓ Found {len(jobs)} Indeed jobs")
    return jobs

def scrape_linkedin():
    """Scrape LinkedIn for entry-level"""
    print("  💼 Checking LinkedIn...")
    jobs = []
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # LinkedIn entry-level search (public jobs)
            search_terms = ["entry%20level%20administrative", "office%20assistant", "data%20entry"]
            for term in search_terms:
                url = f"https://www.linkedin.com/jobs/search?keywords={term}&location=Sacramento%20County%2C%20CA&f_WT=2"  # On-site
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_load_state("networkidle", timeout=10000)
                
                try:
                    page.wait_for_selector(".base-card, [data-job-id]", timeout=10000)
                    cards = page.query_selector_all(".base-card")
                    for card in cards[:10]:
                        try:
                            title_elem = card.query_selector(".base-search-card__title")
                            company_elem = card.query_selector(".base-search-card__subtitle")
                            loc_elem = card.query_selector(".base-search-card__metadata")
                            link_elem = card.query_selector("a")
                            
                            if title_elem and link_elem:
                                title = title_elem.inner_text().strip()
                                company = company_elem.inner_text().strip() if company_elem else "Unknown"
                                loc = loc_elem.inner_text().strip() if loc_elem else "Sacramento, CA"
                                link = link_elem.get_attribute("href")
                                
                                if is_entry_level(title):
                                    jobs.append({
                                        "title": title,
                                        "company": company,
                                        "location": loc,
                                        "link": link,
                                        "source": "LinkedIn",
                                        "description": ""
                                    })
                        except: continue
                except: continue
            
            browser.close()
    except Exception as e:
        print(f"     LinkedIn error: {e}")
    
    print(f"     ✓ Found {len(jobs)} LinkedIn jobs")
    return jobs

def deduplicate_jobs(jobs):
    """Remove duplicates by title+company"""
    seen = set()
    unique = []
    for job in jobs:
        key = f"{job['title'].lower()}|{job['company'].lower()}"
        if key not in seen:
            seen.add(key)
            unique.append(job)
    return unique

def save_results(matches, date_str):
    """Save to markdown"""
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = JOBS_DIR / f"{date_str}.md"
    
    # Group by source
    by_source = {}
    for m in matches:
        src = m['job']['source']
        by_source.setdefault(src, []).append(m)
    
    with open(filepath, "w") as f:
        f.write(f"# 🎯 Entry-Level Job Matches - {date_str}\n\n")
        f.write(f"**Total:** {len(matches)} jobs (CalCareers + Indeed + LinkedIn)\n\n")
        f.write("## 🔥 Priority Matches (Your CalCareers Exams)\n\n")
        
        priority = [m for m in matches if m['job']['title'].lower() in ['staff service analyst', 'office technician', 'office assistant']]
        if priority:
            for m in priority[:10]:
                j = m['job']
                f.write(f"### {j['title']}\n- **Company:** {j['company']}\n- **Location:** {j['location']}\n- **Source:** {j['source']}\n- **Score:** {m['score']}\n- **Apply:** {j['link']}\n\n")
        else:
            f.write("*No priority matches today*\n\n")
        
        f.write("## 📋 All Matches\n\n")
        for i, m in enumerate(matches[:20], 1):
            j = m['job']
            f.write(f"{i}. **{j['title']}** at {j['company']}\n   - {j['location']} | {j['source']} | Score: {m['score']}\n   - [Apply]({j['link']})\n\n")
    
    return filepath

def send_email(matches, date_str):
    """Send email with results"""
    if not matches:
        print("  No matches to email")
        return False
    
    # Separate priority matches
    priority = [m for m in matches if m['job']['title'].lower() in ['staff service analyst', 'office technician', 'office assistant']]
    other = [m for m in matches if m['job']['title'].lower() not in ['staff service analyst', 'office technician', 'office assistant']]
    
    try:
        print("  📧 Sending email...")
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🎯 Daily Jobs - {date_str} ({len(priority)} priority, {len(other)} other)"
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #1a5f7a;">🎯 Entry-Level Job Matches</h2>
            <p><strong>{datetime.now().strftime('%A, %B %d')}</strong></p>
        """
        
        if priority:
            html += '<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1565c0;"><h3>🔥 Priority Matches (Your CalCareers Exams)</h3>'
            for m in priority[:5]:
                j = m['job']
                html += f"""
                <div style="background: white; padding: 12px; margin: 10px 0; border-radius: 6px;">
                    <strong>{j['title']}</strong><br>
                    <span style="color: #666;">{j['company']} | {j['location']}</span><br>
                    <a href="{j['link']}" style="color: #1565c0;">Apply on {j['source']} →</a>
                </div>
                """
            html += '</div>'
        
        if other:
            html += '<h3>📋 Other Entry-Level Matches</h3>'
            for m in other[:10]:
                j = m['job']
                html += f"""
                <div style="background: #f5f5f5; padding: 10px; margin: 8px 0; border-radius: 6px;">
                    <strong>{j['title']}</strong> — {j['company']}<br>
                    <span style="font-size: 13px; color: #666;">{j['location']} | via {j['source']}</span><br>
                    <a href="{j['link']}" style="font-size: 13px;">Apply →</a>
                </div>
                """
        
        html += """
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
                Daily job search: CalCareers + Indeed + LinkedIn<br>
                Entry-level desk jobs in Sacramento area
            </p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html, "html"))
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print(f"  ✅ Email sent!")
        return True
        
    except Exception as e:
        print(f"  ❌ Email failed: {e}")
        return False

def main():
    print(f"\n🔍 Job Search - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("="*50)
    
    print("\n📄 Reading resume...")
    resume = extract_resume_text()
    print(f"   ✓ {len(resume)} characters")
    
    print("\n🌐 Searching job boards...")
    all_jobs = []
    
    # Scrape all sources
    all_jobs.extend(scrape_calcareers())
    all_jobs.extend(scrape_indeed())
    all_jobs.extend(scrape_linkedin())
    
    print(f"\n📊 Processing {len(all_jobs)} total jobs...")
    
    # Remove duplicates
    unique_jobs = deduplicate_jobs(all_jobs)
    print(f"   ✓ {len(unique_jobs)} unique after dedupe")
    
    # Score and filter
    matches = []
    for job in unique_jobs:
        score = score_job(job)
        if score >= 30:  # Threshold for entry-level match
            matches.append({"job": job, "score": score})
    
    matches = sorted(matches, key=lambda x: x['score'], reverse=True)
    print(f"   ✓ {len(matches)} matches above threshold")
    
    # Save and email
    date_str = datetime.now().strftime("%Y-%m-%d")
    save_results(matches, date_str)
    send_email(matches, date_str)
    
    print(f"\n✅ Complete! Check your email or: jobs/{date_str}.md")
    print("="*50)

if __name__ == "__main__":
    main()
