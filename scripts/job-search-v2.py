#!/usr/bin/env python3

import re
import smtplib
import ssl
import sys
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

EMAIL_TO = "alexenrightt@gmail.com"
EMAIL_FROM = "alexenrightt@gmail.com"
EMAIL_PASSWORD = "xvav dpiv iwwd ugnn"
JOBS_DIR = Path("/Users/alexanderenright/.openclaw/workspace/jobs")

# Target jobs
TARGET_JOBS = ["staff service analyst", "office technician", "office assistant"]

def scrape_calcareers():
    """Scrape CalCareers with proper navigation"""
    print("  🏛️ Searching CalCareers...")
    jobs = []
    
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            # Go to main search page
            page.goto("https://calcareers.ca.gov/CalHRPublic/Search/", timeout=30000)
            page.wait_for_load_state("networkidle")
            
            # Find and fill location field
            loc_input = page.wait_for_selector("input[name='locationname'], input[placeholder*='Location'], #location-input", timeout=5000)
            if loc_input:
                loc_input.fill("Sacramento")
                print("     Entered Sacramento...")
            
            # Find and click search button
            search_btn = page.query_selector("button[type='submit'], input[type='submit'], .search-button, button:has-text('Search')")
            if search_btn:
                search_btn.click()
                print("     Clicked search...")
            else:
                # Press Enter instead
                loc_input.press("Enter")
            
            # Wait for results
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(3000)  # Extra wait for JS
            
            # Check if we got results
            print(f"     Current URL: {page.url}")
            
            # Look for job listings
            job_cards = page.query_selector_all(".job-listing, [data-job-id], .search-result, table tbody tr")
            print(f"     Found {len(job_cards)} potential job elements")
            
            # Extract job data
            for card in job_cards[:25]:
                try:
                    # Try different selectors
                    title_elem = card.query_selector("a.job-title, .title a, td:first-child a, h3 a")
                    if not title_elem:
                        continue
                    
                    title = title_elem.inner_text().strip()
                    link = title_elem.get_attribute("href")
                    
                    # Get other details
                    company_elem = card.query_selector(".department, .agency, td:nth-child(2)")
                    company = company_elem.inner_text().strip() if company_elem else "State of California"
                    
                    loc_elem = card.query_selector(".location, td:nth-child(3)")
                    location = loc_elem.inner_text().strip() if loc_elem else "Sacramento"
                    
                    if link and not link.startswith("http"):
                        link = f"https://calcareers.ca.gov{link}"
                    
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "link": link,
                        "source": "CalCareers"
                    })
                except Exception as e:
                    continue
            
            browser.close()
            
    except Exception as e:
        print(f"     Error: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"     ✓ Found {len(jobs)} jobs")
    return jobs

def score_jobs(jobs):
    """Score and filter jobs"""
    matches = []
    for job in jobs:
        title = job['title'].lower()
        score = 0
        
        # Exact matches for your exams
        for target in TARGET_JOBS:
            if target in title:
                score += 100
        
        # Entry-level bonus
        if any(x in title for x in ["entry", "junior", "associate", "assistant"]):
            score += 20
        
        # Sacramento location
        if "sacramento" in job['location'].lower():
            score += 10
        
        if score >= 50:
            matches.append({"job": job, "score": score})
    
    return sorted(matches, key=lambda x: x['score'], reverse=True)

def save_results(matches, date_str):
    """Save to file"""
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = JOBS_DIR / f"{date_str}.md"
    
    with open(filepath, "w") as f:
        f.write(f"# 🎯 CalCareers Job Matches - {date_str}\n\n")
        
        # Priority section
        priority = [m for m in matches if any(t in m['job']['title'].lower() for t in TARGET_JOBS)]
        f.write(f"## 🔥 Priority Matches ({len(priority)})\n\n")
        for m in priority:
            j = m['job']
            f.write(f"### {j['title']}\n")
            f.write(f"- **Department:** {j['company']}\n")
            f.write(f"- **Location:** {j['location']}\n")
            f.write(f"- **Apply:** {j['link']}\n\n")
        
        # All matches
        f.write(f"## 📋 All Matches ({len(matches)})\n\n")
        for i, m in enumerate(matches[:20], 1):
            j = m['job']
            f.write(f"{i}. **{j['title']}** at {j['company']}\n")
            f.write(f"   {j['location']} | [Apply]({j['link']})\n\n")
    
    return filepath

def send_email(matches, date_str):
    """Send email"""
    if not matches:
        print("  No matches to email")
        return False
    
    priority = [m for m in matches if any(t in m['job']['title'].lower() for t in TARGET_JOBS)]
    
    try:
        print("  📧 Sending email...")
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🎯 CalCareers Daily - {date_str} ({len(priority)} priority)"
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO
        
        html = f"""
        <html>
        <body style="font-family: Arial; padding: 20px;">
            <h2 style="color: #1565c0;">🎯 CalCareers Job Matches</h2>
            <p><strong>{datetime.now().strftime('%A, %B %d')}</strong></p>
        """
        
        if priority:
            html += '<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">'
            html += '<h3>🔥 Priority: Your Exam Titles</h3>'
            for m in priority[:10]:
                j = m['job']
                html += f"""
                <div style="background: white; padding: 10px; margin: 8px 0; border-radius: 5px;">
                    <strong>{j['title']}</strong><br>
                    {j['company']} | {j['location']}<br>
                    <a href="{j['link']}" style="color: #1565c0;">Apply Now →</a>
                </div>
                """
            html += '</div>'
        
        html += "</body></html>"
        
        msg.attach(MIMEText(html, "html"))
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print("  ✅ Email sent!")
        return True
        
    except Exception as e:
        print(f"  ❌ Email error: {e}")
        return False

def main():
    print(f"\n🔍 CalCareers Job Search - {datetime.now().strftime('%Y-%m-%d')}")
    print("="*50)
    
    # Scrape
    jobs = scrape_calcareers()
    
    # Score
    print("\n📊 Scoring matches...")
    matches = score_jobs(jobs)
    print(f"   ✓ {len(matches)} priority matches")
    
    # Save and send
    date_str = datetime.now().strftime("%Y-%m-%d")
    save_results(matches, date_str)
    send_email(matches, date_str)
    
    print(f"\n✅ Complete!")
    print("="*50)

if __name__ == "__main__":
    main()
