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

# Your target job titles
TARGET_JOBS = ["staff service analyst", "office technician", "office assistant"]

def scrape_calcareers():
    """Scrape CalCareers using direct search URLs"""
    print("  🏛️ Searching CalCareers...")
    all_jobs = []
    
    try:
        from playwright.sync_api import sync_playwright
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            )
            
            # Search each target job title
            for job_title in TARGET_JOBS:
                print(f"     Searching: {job_title}...")
                page = context.new_page()
                
                # Direct search URL
                search_url = f"https://calcareers.ca.gov/CalHRPublic/Search/Results?locationname=Sacramento&keywords={job_title.replace(' ', '+')}"
                print(f"     URL: {search_url}")
                
                try:
                    page.goto(search_url, timeout=30000, wait_until="domcontentloaded")
                    page.wait_for_load_state("networkidle")
                    page.wait_for_timeout(2000)
                    
                    # Look for job table
                    try:
                        page.wait_for_selector("table tbody tr", timeout=10000)
                        rows = page.query_selector_all("table tbody tr")
                        print(f"     Found {len(rows)} rows")
                        
                        for row in rows:
                            try:
                                cells = row.query_selector_all("td")
                                if len(cells) >= 3:
                                    # Get title and link
                                    title_cell = cells[0]
                                    title_link = title_cell.query_selector("a")
                                    
                                    if title_link:
                                        title = title_link.inner_text().strip()
                                        link = title_link.get_attribute("href")
                                        
                                        # Skip if not the right job type
                                        if job_title not in title.lower():
                                            continue
                                        
                                        # Get department
                                        dept = cells[1].inner_text().strip() if len(cells) > 1 else "State of California"
                                        
                                        # Get location
                                        loc = cells[2].inner_text().strip() if len(cells) > 2 else "Sacramento"
                                        
                                        # Fix link
                                        if link and not link.startswith("http"):
                                            link = f"https://calcareers.ca.gov{link}"
                                        
                                        all_jobs.append({
                                            "title": title,
                                            "company": dept,
                                            "location": loc,
                                            "link": link,
                                            "source": "CalCareers",
                                            "search_term": job_title
                                        })
                                        print(f"        ✓ {title[:50]}...")
                            except Exception as e:
                                continue
                                
                    except Exception as e:
                        print(f"     No jobs found for {job_title}: {e}")
                
                except Exception as e:
                    print(f"     Error loading {job_title}: {e}")
                
                page.close()
            
            browser.close()
            
    except Exception as e:
        print(f"     Fatal error: {e}")
        import traceback
        traceback.print_exc()
    
    # Remove duplicates
    seen = set()
    unique_jobs = []
    for job in all_jobs:
        key = job['title'] + job['company']
        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)
    
    print(f"     ✓ Total unique: {len(unique_jobs)}")
    return unique_jobs

def score_and_filter(jobs):
    """Score jobs"""
    matches = []
    for job in jobs:
        title_lower = job['title'].lower()
        score = 0
        
        # Exact matches
        for target in TARGET_JOBS:
            if target in title_lower:
                score += 100
        
        # Entry level
        if any(x in title_lower for x in ["entry", "junior", "assistant"]):
            score += 20
        
        # Sacramento
        if "sacramento" in job['location'].lower():
            score += 15
        
        if score >= 50:
            matches.append({"job": job, "score": score})
    
    return sorted(matches, key=lambda x: x['score'], reverse=True)

def save_results(matches, date_str):
    JOBS_DIR.mkdir(parents=True, exist_ok=True)
    filepath = JOBS_DIR / f"{date_str}.md"
    
    # Group by type
    ssa = [m for m in matches if "staff service analyst" in m['job']['title'].lower()]
    ot = [m for m in matches if "office technician" in m['job']['title'].lower()]
    oa = [m for m in matches if "office assistant" in m['job']['title'].lower()]
    
    with open(filepath, "w") as f:
        f.write(f"# 🏛️ CalCareers Matches - {date_str}\n\n")
        
        if ssa:
            f.write(f"## 🔥 Staff Service Analyst ({len(ssa)} jobs)\n\n")
            for m in ssa:
                j = m['job']
                f.write(f"**{j['title']}**  \n{j['company']} | {j['location']}  \n[Apply]({j['link']})\n\n")
        
        if ot:
            f.write(f"## 🔥 Office Technician ({len(ot)} jobs)\n\n")
            for m in ot:
                j = m['job']
                f.write(f"**{j['title']}**  \n{j['company']} | {j['location']}  \n[Apply]({j['link']})\n\n")
        
        if oa:
            f.write(f"## 🔥 Office Assistant ({len(oa)} jobs)\n\n")
            for m in oa:
                j = m['job']
                f.write(f"**{j['title']}**  \n{j['company']} | {j['location']}  \n[Apply]({j['link']})\n\n")
        
        if not matches:
            f.write("*No matching jobs found today*\n")
    
    return filepath

def send_email(matches, date_str):
    if not matches:
        print("  ⚠️ No matches to email")
        return False
    
    ssa = len([m for m in matches if "staff service analyst" in m['job']['title'].lower()])
    ot = len([m for m in matches if "office technician" in m['job']['title'].lower()])
    oa = len([m for m in matches if "office assistant" in m['job']['title'].lower()])
    
    try:
        print("  📧 Sending email...")
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🏛️ CalCareers - SSA:{ssa} OT:{ot} OA:{oa} ({date_str})"
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO
        
        html = f"""
        <html>
        <body style="font-family: -apple-system, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #1565c0; margin-bottom: 5px;">🏛️ CalCareers Daily</h2>
            <p style="color: #666; margin-top: 0;">{datetime.now().strftime('%A, %B %d, %Y')}</p>
        """
        
        # Staff Service Analyst
        ssa_matches = [m for m in matches if "staff service analyst" in m['job']['title'].lower()]
        if ssa_matches:
            html += '<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2e7d32;">'
            html += '<h3 style="margin-top: 0; color: #2e7d32;">🔥 Staff Service Analyst</h3>'
            for m in ssa_matches[:5]:
                j = m['job']
                html += f'<div style="background: white; padding: 12px; margin: 10px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">'
                html += f'<strong>{j["title"]}</strong><br>'
                html += f'<span style="color: #555; font-size: 14px;">{j["company"]} | {j["location"]}</span><br>'
                html += f'<a href="{j["link"]}" style="color: #1565c0; font-size: 14px;">Apply →</a>'
                html += '</div>'
            html += '</div>'
        
        # Office Technician
        ot_matches = [m for m in matches if "office technician" in m['job']['title'].lower()]
        if ot_matches:
            html += '<div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef6c00;">'
            html += '<h3 style="margin-top: 0; color: #ef6c00;">🔥 Office Technician</h3>'
            for m in ot_matches[:5]:
                j = m['job']
                html += f'<div style="background: white; padding: 12px; margin: 10px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">'
                html += f'<strong>{j["title"]}</strong><br>'
                html += f'<span style="color: #555; font-size: 14px;">{j["company"]}</span><br>'
                html += f'<a href="{j["link"]}" style="color: #1565c0; font-size: 14px;">Apply →</a>'
                html += '</div>'
            html += '</div>'
        
        # Office Assistant
        oa_matches = [m for m in matches if "office assistant" in m['job']['title'].lower()]
        if oa_matches:
            html += '<div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #1565c0;">'
            html += '<h3 style="margin-top: 0; color: #1565c0;">🔥 Office Assistant</h3>'
            for m in oa_matches[:5]:
                j = m['job']
                html += f'<div style="background: white; padding: 12px; margin: 10px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">'
                html += f'<strong>{j["title"]}</strong><br>'
                html += f'<span style="color: #555; font-size: 14px;">{j["company"]}</span><br>'
                html += f'<a href="{j["link"]}" style="color: #1565c0; font-size: 14px;">Apply →</a>'
                html += '</div>'
            html += '</div>'
        
        html += """
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
                CalCareers auto-search | Staff Service Analyst, Office Technician, Office Assistant<br>
                Sacramento area
            </p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(html, "html"))
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(msg)
        
        print("  ✅ Email sent!")
        return True
        
    except Exception as e:
        print(f"  ❌ Email failed: {e}")
        return False

def main():
    print(f"\n🔍 CalCareers Job Search")
    print("=" * 50)
    print(f"Target: Staff Service Analyst, Office Technician, Office Assistant")
    print(f"Location: Sacramento")
    print("=" * 50)
    
    jobs = scrape_calcareers()
    matches = score_and_filter(jobs)
    
    date_str = datetime.now().strftime("%Y-%m-%d")
    save_results(matches, date_str)
    send_email(matches, date_str)
    
    print(f"\n✅ Done!")
    print(f"   File: jobs/{date_str}.md")

if __name__ == "__main__":
    main()
