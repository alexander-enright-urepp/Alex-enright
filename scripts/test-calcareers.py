from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("https://calcareers.ca.gov/CalHRPublic/Search/Results?locationname=Sacramento", timeout=30000)
    print("Page title:", page.title())
    print("Page URL:", page.url)
    
    # Check if we see job listings
    html = page.content()
    if "No jobs found" in html:
        print("No jobs found message detected")
    elif "job" in html.lower():
        print("Found 'job' in page content ✓")
    else:
        print("No job content found")
    
    # Try to find the table
    rows = page.query_selector_all("table tbody tr")
    print(f"Found {len(rows)} table rows")
    
    browser.close()
